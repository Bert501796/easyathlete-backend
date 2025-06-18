const StravaActivity = require('../models/StravaActivity');

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
    cadence: activity.average_cadence || null,
    averageWatts: activity.average_watts || null,
    calories: activity.calories || null,
    zoneDistribution: activity.zoneDistribution || [],
    hrZoneBuckets: activity.hrZoneBuckets || [],
    workoutType: activity.workout_type || null,
    isCommute: activity.commute || false,
    isManual: activity.manual || false,
    visibility: activity.visibility || 'everyone',
    gearId: activity.gear_id || null,

    // ⚠️ Temporarily exclude large stream fields to avoid MongoDB overload
    // heartRateStream: activity.heartRateStream || [],
    // timeStream: activity.timeStream || [],
    // cadenceStream: activity.cadenceStream || [],
    // wattsStream: activity.wattsStream || [],
    // speedStream: activity.speedStream || [],
    // altitudeStream: activity.altitudeStream || [],
    // distanceStream: activity.distanceStream || [],
    // latlngStream: activity.latlngStream || [],
    // streamEnriched: activity.streamEnriched || false,

    raw: activity
  };

  await StravaActivity.findOneAndUpdate(
    { stravaId, userId },
    update,
    { upsert: true, new: true }
  );
};

module.exports = { saveActivity };
