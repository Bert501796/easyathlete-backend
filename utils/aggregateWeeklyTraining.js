const StravaActivity = require('../models/StravaActivity');

const getWeeklyTrainingSummary = async (userId, type = null) => {
  const matchStage = { userId };
  if (type) {
    matchStage.type = type; // "Run", "Ride", etc.
  }

  const pipeline = [
    { $match: matchStage },
    {
      $addFields: {
        week: { $isoWeek: "$startDate" },
        year: { $isoWeekYear: "$startDate" },
        zone2Minutes: { $arrayElemAt: ["$hrZoneBuckets", 2] }
      }
    },
    {
      $group: {
        _id: {
          userId: "$userId",
          year: "$year",
          week: "$week"
        },
        totalDistanceKm: { $sum: "$distanceKm" },
        avgHrEff: { $avg: "$hrEfficiency" },
        maxLoad: { $max: "$estimatedLoad" },
        avgPaceMinPerKm: { $avg: "$paceMinPerKm" },
        longestRunKm: { $max: "$distanceKm" },
        totalZ2Minutes: { $sum: "$zone2Minutes" },
        activityCount: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        userId: "$_id.userId",
        year: "$_id.year",
        week: "$_id.week",
        totalDistanceKm: 1,
        avgHrEff: 1,
        maxLoad: 1,
        avgPaceMinPerKm: 1,
        longestRunKm: 1,
        totalZ2Minutes: 1,
        activityCount: 1
      }
    },
    { $sort: { year: 1, week: 1 } }
  ];

  return await StravaActivity.aggregate(pipeline);
};

module.exports = { getWeeklyTrainingSummary };
