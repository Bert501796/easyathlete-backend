// routes/strava/kpis.js
const express = require('express');
const router = express.Router();
const StravaActivity = require('../../models/StravaActivity');

// Utility: Moving average
const getRollingAverage = (data, windowSize) => {
  return data.map((_, i, arr) => {
    const slice = arr.slice(Math.max(0, i - windowSize + 1), i + 1);
    const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length;
    return +avg.toFixed(2);
  });
};

router.get('/insights/kpis/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const activities = await StravaActivity.find({ userId }).sort({ startDate: 1 });
    if (!activities.length) return res.status(200).json({ message: 'No activities found', kpis: {} });

    // Prepare time series buckets by week
    const weekBuckets = {};
    for (const act of activities) {
      const weekKey = new Date(act.startDate).toISOString().slice(0, 10);
      if (!weekBuckets[weekKey]) weekBuckets[weekKey] = [];
      weekBuckets[weekKey].push(act);
    }

    const weeklyMetrics = Object.entries(weekBuckets).map(([week, acts]) => {
      const totalDistanceKm = acts.reduce((sum, a) => sum + (a.distanceKm || 0), 0);
      const totalTimeMin = acts.reduce((sum, a) => sum + (a.movingTimeMin || 0), 0);
      const avgPace = acts.filter(a => a.paceMinPerKm).reduce((sum, a, _, arr) => sum + a.paceMinPerKm / arr.length, 0);
      const avgHRE = acts.filter(a => a.hrEfficiency).reduce((sum, a, _, arr) => sum + a.hrEfficiency / arr.length, 0);
      const totalLoad = acts.reduce((sum, a) => sum + (a.estimatedLoad || 0), 0);
      return { week, totalDistanceKm, totalTimeMin, avgPace, avgHRE, totalLoad };
    });

    const ctl = getRollingAverage(weeklyMetrics.map(w => w.totalLoad), 6);
    const atl = getRollingAverage(weeklyMetrics.map(w => w.totalLoad), 1);
    const ftl = ctl.map((c, i) => +(c - atl[i]).toFixed(2));

    const zoneSums = [0, 0, 0, 0, 0];
    let hrCount = 0, hrSum = 0, paceSum = 0, paceCount = 0;
    for (const a of activities) {
      (a.hrZoneBuckets || []).forEach((val, idx) => zoneSums[idx] += val);
      if (a.averageHeartrate) { hrSum += a.averageHeartrate; hrCount++; }
      if (a.paceMinPerKm) { paceSum += a.paceMinPerKm; paceCount++; }
    }

    const totalZoneTime = zoneSums.reduce((sum, v) => sum + v, 0) || 1;
    const zoneDistribution = zoneSums.map(z => +(z / totalZoneTime * 100).toFixed(1));

    return res.status(200).json({
      totalActivities: activities.length,
      totalDistanceKm: +activities.reduce((sum, a) => sum + (a.distanceKm || 0), 0).toFixed(1),
      totalTimeMin: +activities.reduce((sum, a) => sum + (a.movingTimeMin || 0), 0).toFixed(1),
      averagePace: +(paceSum / paceCount || 0).toFixed(2),
      averageHR: Math.round(hrSum / hrCount || 0),
      averageHRE: +(activities.reduce((sum, a) => sum + (a.hrEfficiency || 0), 0) / activities.length).toFixed(4),
      totalLoad: +activities.reduce((sum, a) => sum + (a.estimatedLoad || 0), 0).toFixed(1),
      zoneDistribution,
      ctl,
      atl,
      ftl,
      fitnessTrend: weeklyMetrics.map((w, i) => ({
        week: w.week,
        fitnessScore: +(((5 - w.avgPace || 0) + (w.totalLoad || 0) / 10 + (1 / (w.avgHRE || 1))) || 0).toFixed(2)
      }))
    });

  } catch (err) {
    console.error('❌ KPI calc error:', err);
    res.status(500).json({ error: 'Failed to compute KPIs' });
  }
});

module.exports = router;
