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
        type: a.type === 'VirtualRide' ? 'Ride' : a.type,
        paceMinPerKm: a.average_speed ? +(1000 / (a.average_speed * 60)).toFixed(2) : null,
        hrEfficiency:
          a.average_heartrate && a.average_speed
            ? +(a.average_speed / a.average_heartrate).toFixed(3)
            : null,
        elevationPerKm:
          a.total_elevation_gain && a.distance
            ? +(a.total_elevation_gain / (a.distance / 1000)).toFixed(1)
            : null,
        estimatedLoad: a.kilojoules || a.suffer_score || null,
        fitness_score: a.fitness_score || null,
        zone1: zoneSeconds[0] > 0 ? +(zoneSeconds[0] / totalZoneTime * 100).toFixed(1) : undefined,
        zone2: zoneSeconds[1] > 0 ? +(zoneSeconds[1] / totalZoneTime * 100).toFixed(1) : undefined,
        zone3: zoneSeconds[2] > 0 ? +(zoneSeconds[2] / totalZoneTime * 100).toFixed(1) : undefined,
        zone4: zoneSeconds[3] > 0 ? +(zoneSeconds[3] / totalZoneTime * 100).toFixed(1) : undefined,
        zone5: zoneSeconds[4] > 0 ? +(zoneSeconds[4] / totalZoneTime * 100).toFixed(1) : undefined
      };
    });

    res.status(200).json(normalized);
  } catch (error) {
    console.error('❌ Failed to fetch insights:', error);
    res.status(500).json({ message: '❌ Failed to retrieve insights data' });
  }
});

module.exports = router;
