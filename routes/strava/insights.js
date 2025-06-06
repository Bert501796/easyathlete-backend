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
      const zoneSeconds = a.hrZoneBuckets || [0, 0, 0, 0, 0];
      const totalZoneTime = zoneSeconds.reduce((sum, val) => sum + val, 0) || 1;

      return {
        ...a._doc,
        zone1: +(zoneSeconds[0] / totalZoneTime * 100).toFixed(1),
        zone2: +(zoneSeconds[1] / totalZoneTime * 100).toFixed(1),
        zone3: +(zoneSeconds[2] / totalZoneTime * 100).toFixed(1),
        zone4: +(zoneSeconds[3] / totalZoneTime * 100).toFixed(1),
        zone5: +(zoneSeconds[4] / totalZoneTime * 100).toFixed(1),
        // Optional: Normalize activity type here if needed
        // type: a.type === 'VirtualRide' ? 'Ride' : a.type
      };
    });

    res.status(200).json(normalized);
  } catch (error) {
    console.error('❌ Failed to fetch insights:', error);
    res.status(500).json({ message: '❌ Failed to retrieve insights data' });
  }
});

module.exports = router;
