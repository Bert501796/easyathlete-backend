// routes/strava/insights.js
const express = require('express');
const router = express.Router();
const StravaActivity = require('../../models/StravaActivity');

// GET /strava/insights/:userId
router.get('/insights/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const activities = await StravaActivity.find({ userId });

    const normalized = activities.map((a) => {
  const zoneSeconds = a.hrZoneBuckets || [];
  const totalZoneTime = zoneSeconds.reduce((sum, val) => sum + val, 0) || 1;

  return {
    ...a._doc,
//    type: a.type === 'VirtualRide' ? 'Ride' : a.type,

  };
});

    res.status(200).json(normalized);
  } catch (error) {
    console.error('❌ Failed to fetch insights:', error);
    res.status(500).json({ message: '❌ Failed to retrieve insights data' });
  }
});

module.exports = router;
