const axios = require('axios');
const StravaActivity = require('../models/StravaActivity');
const { getStravaMetrics } = require('./dataFetchers');
const { classifyFitnessLevel } = require('./fitnessClassifier');
const User = require('../models/User');

const getHRZone = (hr, maxHr = 190) => {
  const percent = hr / maxHr;
  if (percent < 0.6) return 1;
  if (percent < 0.7) return 2;
  if (percent < 0.8) return 3;
  if (percent < 0.9) return 4;
  return 5;
};

const getAccessToken = async (user) => {
  const now = Math.floor(Date.now() / 1000);
  if (user.tokenExpiresAt > now) return user.accessToken;

  console.log(`🔄 Token expired for user ${user._id}. Refreshing...`);

  const res = await axios.post('https://www.strava.com/oauth/token', {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: user.refreshToken
  });

  const { access_token, refresh_token, expires_at } = res.data;

  await User.updateOne({ _id: user._id }, {
    accessToken: access_token,
    refreshToken: refresh_token,
    tokenExpiresAt: expires_at
  });

  return access_token;
};

const enrichActivity = async (activity, accessToken) => {
  let zoneDistribution = [];
  let hrZoneBuckets = [];

  try {
    const streamRes = await axios.get(`https://www.strava.com/api/v3/activities/${activity.id}/streams`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { keys: 'heartrate,time' }
    });

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

const syncSingleActivity = async ({ stravaActivityId, user }) => {
  const accessToken = await getAccessToken(user);

  let activityRes;
  try {
    activityRes = await axios.get(
      `https://www.strava.com/api/v3/activities/${stravaActivityId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
  } catch (err) {
    console.error(`❌ Webhook error for activity ${stravaActivityId}`);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Status Text:', err.response.statusText);
      console.error('Response Data:', err.response.data);
    } else if (err.request) {
      console.error('❌ No response received from Strava:', err.request);
    } else {
      console.error('❌ Error setting up request:', err.message);
    }
    console.error('🔑 Token used (truncated):', accessToken?.slice(0, 8), '...');
    throw err;
  }

  const enriched = await enrichActivity(activityRes.data, accessToken);

  await StravaActivity.findOneAndUpdate(
    { stravaId: enriched.id, userId: user._id },
    {
      userId: user._id,
      stravaId: enriched.id,
      name: enriched.name,
      type: enriched.sport_type,
      startDate: enriched.start_date,
      distanceKm: enriched.distanceKm,
      movingTimeMin: enriched.movingTimeMin,
      paceMinPerKm: enriched.paceMinPerKm,
      hrEfficiency: enriched.hrEfficiency,
      elevationPerKm: enriched.elevationPerKm,
      estimatedLoad: enriched.estimatedLoad,
      averageHeartrate: enriched.average_heartrate || 0,
      zoneDistribution: enriched.zoneDistribution,
      hrZoneBuckets: enriched.hrZoneBuckets,
      raw: enriched
    },
    { upsert: true, new: true }
  );

  // // Optional: Update fitness level
  // const metrics = await getStravaMetrics(user._id);
  // const fitnessLevel = classifyFitnessLevel(metrics);
  // await User.updateOne({ _id: user._id }, { fitnessLevel });

  // return enriched.id;
};

module.exports = { syncSingleActivity };
