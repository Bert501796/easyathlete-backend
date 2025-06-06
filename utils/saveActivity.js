// utils/saveActivity.js
//This performs the upsert into MongoDB
const StravaActivity = require('../models/StravaActivity');

const saveActivity = async (activity, userId) => {
  return await StravaActivity.findOneAndUpdate(
    { stravaId: activity.id, userId },
    {
      userId,
      stravaId: activity.id,
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
      zoneDistribution: activity.zoneDistribution,
      hrZoneBuckets: activity.hrZoneBuckets,
      raw: activity
    },
    { upsert: true, new: true }
  );
};

module.exports = { saveActivity };
