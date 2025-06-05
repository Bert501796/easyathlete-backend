// utils/dataFetchers.js

const StravaActivity = require('../models/StravaActivity');
const moment = require('moment');

async function getStravaMetrics(userId) {
  const now = new Date();
  const sixWeeksAgo = moment(now).subtract(6, 'weeks').toDate();

  const activities = await StravaActivity.find({
    userId,
    createdAt: { $gte: sixWeeksAgo }
  });

  if (!activities.length) {
    return {
      weeklyVolume: 0,
      sessionsPerWeek: 0,
      longestRun: 0
    };
  }

  const weeklyStats = {};
  let longestRun = 0;

  activities.forEach(activity => {
    const weekKey = moment(activity.createdAt).isoWeek();

    if (!weeklyStats[weekKey]) {
      weeklyStats[weekKey] = { distance: 0, sessions: 0 };
    }

    weeklyStats[weekKey].distance += activity.distanceKm || 0;
    weeklyStats[weekKey].sessions += 1;

    if ((activity.distanceKm || 0) > longestRun) {
      longestRun = activity.distanceKm;
    }
  });

  const numberOfWeeks = Object.keys(weeklyStats).length;
  const totalVolume = Object.values(weeklyStats).reduce((sum, wk) => sum + wk.distance, 0);
  const totalSessions = Object.values(weeklyStats).reduce((sum, wk) => sum + wk.sessions, 0);

  const weeklyVolume = totalVolume / numberOfWeeks;
  const sessionsPerWeek = totalSessions / numberOfWeeks;

  return {
    weeklyVolume: Number(weeklyVolume.toFixed(1)),
    sessionsPerWeek: Number(sessionsPerWeek.toFixed(1)),
    longestRun: Number(longestRun.toFixed(1))
  };
}

module.exports = { getStravaMetrics };
