// routes/strava/strava-authentication.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const User = require('../../models/User');

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

router.post('/exchange', async (req, res) => {
  const { code, userId } = req.body;

  if (!code || !userId) {
    return res.status(400).json({ error: 'Missing code or userId' });
  }

  try {
    console.log(`🔁 Exchanging Strava code for user: ${userId}`);

    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    });

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: tokenExpiresAt,
      athlete
    } = response.data;

    const stravaId = athlete?.id;
    if (!stravaId) {
      console.error('❌ Strava athlete ID not found in response');
      return res.status(500).json({ error: 'Invalid athlete response from Strava' });
    }

    // Try to update existing user
    let updatedUser = await User.findOneAndUpdate(
      { customUserId: userId },
      {
        stravaId,
        accessToken,
        refreshToken,
        tokenExpiresAt
      },
      { new: true }
    );

    if (!updatedUser) {
      // Create temporary user if not found
      updatedUser = await User.create({
        customUserId: userId,
        stravaId,
        accessToken,
        refreshToken,
        tokenExpiresAt
      });
      console.warn(`⚠️ Created temporary user with customUserId: ${userId}`);
    }

    console.log(`✅ Linked Strava athlete ${stravaId} to user ${updatedUser._id}`);

    return res.status(200).json({
      message: '✅ Strava account linked',
      access_token: accessToken
    });
  } catch (error) {
    console.error('❌ Full error:', error.toJSON?.() || error.message);
    console.error('❌ Error details:', {
      code,
      userId,
      STRAVA_CLIENT_ID,
      STRAVA_CLIENT_SECRET
    });

    if (error.response) {
      console.error('❌ Strava response data:', error.response.data);
      console.error('❌ Strava status:', error.response.status);
    }

    return res.status(500).json({ error: 'Failed to exchange token with Strava' });
  }
});

router.post('/refresh-token', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const user = await User.findById(userId);

    if (!user || !user.refreshToken || !user.tokenExpiresAt) {
      return res.status(404).json({ error: 'Refresh token or expiry not found for user' });
    }

    const now = Math.floor(Date.now() / 1000); // current time in seconds

    if (user.tokenExpiresAt > now) {
      return res.status(200).json({
        message: 'Access token still valid',
        accessToken: user.accessToken,
        refreshed: false
      });
    }

    // 🔁 Exchange refresh token for new access token
    const response = await axios.post('https://www.strava.com/api/v3/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: user.refreshToken
    });

    const {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_at: newExpiresAt
    } = response.data;

    // ⏫ Update user tokens
    await User.updateOne(
      { _id: userId },
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenExpiresAt: newExpiresAt
      }
    );

    return res.status(200).json({
      message: 'Access token refreshed',
      accessToken: newAccessToken,
      refreshed: true
    });
  } catch (error) {
    console.error('❌ Error refreshing token:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
});

module.exports = router;
