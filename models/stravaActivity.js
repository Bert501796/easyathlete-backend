const mongoose = require('mongoose');

const stravaActivitySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  stravaId: { type: Number, required: true },
  name: String,
  type: String,
  startDate: Date,
  distanceKm: Number,
  movingTimeMin: Number,
  paceMinPerKm: Number,
  hrEfficiency: Number,
  elevationPerKm: Number,
  estimatedLoad: Number,
  averageHeartrate: Number,
  zoneDistribution: [Number],
  hrZoneBuckets: [Number],
  raw: Object, // Optional: full Strava activity object
}, { timestamps: true });

module.exports = mongoose.model('StravaActivity', stravaActivitySchema);
