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
  raw: Object,
}, { timestamps: true });

// 🔑 Compound index for upserts
stravaActivitySchema.index({ userId: 1, stravaId: 1 }, { unique: true });

// 📅 Index for sorting/filtering by date
stravaActivitySchema.index({ userId: 1, startDate: -1 });

module.exports = mongoose.model('StravaActivity', stravaActivitySchema);
