const StravaActivity = require('../models/StravaActivity');
const axios = require('axios');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const saveActivity = async (activity, userId) => {
  const stravaId = activity.id;
  console.log('🧠 Saving activity with stravaId:', stravaId, 'for user:', userId);

  const update = {
    name: activity.name,
    type: activity.sport_type,
    startDate: activity.start_date,
    distanceKm: activity.distanceKm,
    movingTimeMin: activity.movingTimeMin,
    paceMinPerKm: activity.paceMinPerKm,
    hrEfficiency: activity.hrEfficiency,
    elevationPerKm: activity.elevationPerKm,
    estimatedLoad: activity.estimatedLoad,
    averageHeartrate: activity.average_heartrate || 0,
    maxHeartrate: activity.max_heartrate || 0,
    averageCadence: activity.average_cadence || null,
    averageWatts: activity.average_watts || null,
    calories: activity.calories || null,
    zoneDistribution: activity.zoneDistribution || [],
    hrZoneBuckets: activity.hrZoneBuckets || [],
    workoutType: activity.workout_type || null,
    isCommute: activity.commute || false,
    isManual: activity.manual || false,
    visibility: activity.visibility || 'everyone',
    gearId: activity.gear_id || null,

    // ✅ Basic stream fields
    heartRateStream: activity.heartRateStream || [],
    timeStream: activity.timeStream || [],
    cadenceStream: activity.cadenceStream || [],
    wattsStream: activity.wattsStream || [],
    speedStream: activity.speedStream || [],
    altitudeStream: activity.altitudeStream || [],
    distanceStream: activity.distanceStream || [],
    latlngStream: activity.latlngStream || [],
    streamEnriched: activity.streamEnriched || false,

    // ✅ Extended ML-relevant data
    aggregatedFeatures: activity.aggregatedFeatures || {},
    segments: activity.segments || [],
    segmentSummary: activity.segmentSummary || {},
    mlWindows: activity.mlWindows || [],
    stream_data_full: activity.stream_data_full || {},

    // 🔁 Preserve full raw payload
    raw: activity
  };

  console.log('📦 Writing to MongoDB...');
  const savedActivity = await StravaActivity.findOneAndUpdate(
    { stravaId, userId },
    { $set: update },
    { upsert: true, new: true }
  );

  // 🧘 Add delay after MongoDB write
  await delay(200);

  // 🔁 Trigger ML enrichment via FastAPI
  try {
    const ML_API_BASE = process.env.ML_API_URL || 'http://localhost:8000';
    console.log('🔗 ML API URL:', ML_API_BASE);

    const enrichmentRes = await axios.post(`${ML_API_BASE}/ml/enrich-activity`, {
      activity_id: savedActivity._id,
      user_id: userId
    });

    console.log('🧠 Enrichment triggered:', enrichmentRes.data);

  } catch (err) {
    console.warn('⚠️ Enrichment call failed (1st attempt):', err.message);

    // 🔁 Optional: Retry after short delay
    try {
      await delay(500);
      const ML_API_BASE = process.env.ML_API_URL || 'http://localhost:8000';
      const retryRes = await axios.post(`${ML_API_BASE}/ml/enrich-activity`, {
        activity_id: savedActivity._id,
        user_id: userId
      });
      console.log('🔁 Retry successful:', retryRes.data);
    } catch (retryErr) {
      console.warn('❌ Retry failed:', retryErr.message);
    }
  }
};

module.exports = { saveActivity };
