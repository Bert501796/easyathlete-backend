// routes/strava.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

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

    const { access_token, refresh_token, expires_at } = response.data;

    console.log(`✅ Access token for ${userId}:`, access_token);

    // Optionally store tokens here

    return res.status(200).json({ access_token });
  } catch (error) {
    console.error('❌ Strava token exchange error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to exchange token with Strava' });
  }
});

module.exports = router;
