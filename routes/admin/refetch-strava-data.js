// routes/admin/refetch.js
const express = require('express');
const router = express.Router();
const User = require('../../models/User');

router.post('/refetch-strava-data', async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || !user.accessToken) {
      return res.status(404).json({ error: 'User or access token not found' });
    }

    const axios = require('axios');
    await axios.post(`${process.env.BACKEND_URL}/api/strava/fetch-activities`, {
      accessToken: user.accessToken,
      userId: userId
    });

    res.status(200).json({ message: '✅ Refetch triggered successfully' });
  } catch (err) {
    console.error('❌ Refetch failed:', err.message);
    res.status(500).json({ error: 'Refetch failed' });
  }
});

module.exports = router;
