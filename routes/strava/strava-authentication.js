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

    // 🔐 Store stravaId and tokens in the correct user document
    await User.findOneAndUpdate(
      { $or: [{ _id: userId }, { customUserId: userId }] },
      {
        stravaId,
        accessToken,
        refreshToken,
        tokenExpiresAt
      },
      { new: true }
    );

    console.log(`✅ Linked Strava athlete ${stravaId} to internal user ${userId}`);

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
      console.error('❌ Strava headers:', error.response.headers);
    }
    return res.status(500).json({ error: 'Failed to exchange token with Strava' });
  }
});

module.exports = router;
