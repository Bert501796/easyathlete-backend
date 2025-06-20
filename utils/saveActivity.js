const StravaActivity = require('../models/StravaActivity');
const axios = require('axios'); // ✅ Required for calling the enrichment API

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

  const savedActivity = await StravaActivity.findOneAndUpdate(
    { stravaId, userId },
    { $set: update },
    { upsert: true, new: true }
  );

  // 🔁 Trigger ML enrichment via FastAPI
  try {
    const enrichmentRes = await axios.post('http://localhost:8000/ml/enrich-activity', {
      activity_id: savedActivity._id,
      user_id: userId
    });
    console.log('🧠 Enrichment triggered:', enrichmentRes.data);
  } catch (err) {
    console.warn('⚠️ Enrichment call failed:', err.message);
  }
};

module.exports = { saveActivity };
