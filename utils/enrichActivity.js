// utils/enrichActivity.js
//This handles heart rate zone processing and metric calculation for a single activity:


const axios = require('axios');

const getHRZone = (hr, maxHr = 190) => {
  const percent = hr / maxHr;
  if (percent < 0.6) return 1;
  if (percent < 0.7) return 2;
  if (percent < 0.8) return 3;
  if (percent < 0.9) return 4;
  return 5;
};

const enrichActivity = async (activity, accessToken) => {
  let zoneDistribution = [];
  let hrZoneBuckets = [];

  try {
    const streamRes = await axios.get(
      `https://www.strava.com/api/v3/activities/${activity.id}/streams`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { keys: 'heartrate,time' }
      }
    );

    const hrStream = streamRes.data.find(s => s.type === 'heartrate')?.data || [];
    hrZoneBuckets = [0, 0, 0, 0, 0];

    for (const hr of hrStream) {
      const zone = getHRZone(hr);
      if (zone >= 1 && zone <= 5) hrZoneBuckets[zone - 1] += 1;
    }

    const total = hrZoneBuckets.reduce((a, b) => a + b, 0);
    zoneDistribution = hrZoneBuckets.map(z => total ? +(z / total * 100).toFixed(1) : 0);
  } catch (err) {
    console.warn(`⚠️ Failed to fetch streams for activity ${activity.id}`);
  }

  const distanceKm = activity.distance ? activity.distance / 1000 : 0;
  const movingTimeMin = activity.moving_time ? activity.moving_time / 60 : 0;
  const avgHR = activity.average_heartrate || 0;

  const paceMinPerKm = distanceKm ? +(movingTimeMin / distanceKm).toFixed(2) : null;
  const hrEfficiency = avgHR ? +(paceMinPerKm / avgHR).toFixed(4) : null;
  const elevationPerKm = distanceKm ? +(activity.total_elevation_gain / distanceKm).toFixed(2) : null;
  const estimatedLoad = avgHR && movingTimeMin ? +(avgHR * movingTimeMin / 100).toFixed(2) : null;

  return {
    ...activity,
    zoneDistribution,
    hrZoneBuckets,
    distanceKm,
    movingTimeMin,
    paceMinPerKm,
    hrEfficiency,
    elevationPerKm,
    estimatedLoad
  };
};

module.exports = { enrichActivity };
