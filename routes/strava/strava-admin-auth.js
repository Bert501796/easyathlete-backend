// routes/strava/strava-admin-auth.js (continued)

const express = require('express');
const axios = require('axios');
const router = express.Router(); // ✅ This line was missing
const User = require('../../models/User');

router.post('/auth/admin-initiate', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const redirectUri = process.env.STRAVA_REDIRECT_URI; // e.g., https://yourdomain.com/strava/admin-redirect
  const clientId = process.env.STRAVA_CLIENT_ID;

  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=auto&scope=read,activity:read_all&state=${userId}`;

  return res.status(200).json({ authUrl });
});


router.get('/admin-redirect', async (req, res) => {
  const { code, state: userId } = req.query;

  if (!code || !userId) {
    return res.status(400).send('Missing code or userId');
  }

  try {
    const tokenRes = await axios.post('https://www.strava.com/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code'
    });

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: tokenExpiresAt,
      athlete
    } = tokenRes.data;

    const stravaId = athlete?.id;
    if (!stravaId) return res.status(400).send('No athlete ID');

    await User.findByIdAndUpdate(
      userId,      {
      accessToken,
      refreshToken,
      tokenExpiresAt,
      stravaId
    });

    console.log(`✅ Admin-linked Strava athlete ${stravaId} to user ${userId}`);

    // Optional: Redirect to frontend admin page
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?stravaLinked=1`);
  } catch (err) {
    console.error('❌ Admin redirect error:', err.response?.data || err.message);
    return res.status(500).send('Failed to complete Strava auth');
  }
});

module.exports = router;

