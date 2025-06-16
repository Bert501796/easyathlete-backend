// /routes/analysis.js
const express = require('express');
const router = express.Router();
const StravaActivity = require('../models/StravaActivity');

router.get('/weekly-summary/:userId', async (req, res) => {
  try {
    const userId = req.params.userId.trim();
    const pipeline = [
      { $match: { userId } },
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

    const result = await StravaActivity.aggregate(pipeline);
    res.json(result);
  } catch (error) {
    console.error("Error in weekly summary:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
