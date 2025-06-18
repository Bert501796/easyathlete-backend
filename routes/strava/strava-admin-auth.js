// routes/strava/strava-admin-auth.js (continued)

const axios = require('axios');
const User = require('../../models/User');

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

    await User.findByIdAndUpdate(userId, {
      accessToken,
      refreshToken,
      tokenExpiresAt,
      stravaId
    });

    console.log(`✅ Admin-linked Strava athlete ${stravaId} to user ${userId}`);

    // Optional: Redirect to frontend admin page
    return res.redirect(`${process.env.FRONTEND_URL}/admin?stravaLinked=1`);
  } catch (err) {
    console.error('❌ Admin redirect error:', err.response?.data || err.message);
    return res.status(500).send('Failed to complete Strava auth');
  }
});
