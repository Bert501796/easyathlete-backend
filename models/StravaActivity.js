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
  maxHeartrate: Number,
  averageCadence: Number,
  averageWatts: Number,
  streamEnriched: { type: Boolean, default: false },
  zoneDistribution: [Number],
  hrZoneBuckets: [Number],
  heartRateStream: [Number],
  timeStream: [Number],
  cadenceStream: [Number],
  wattsStream: [Number],
  speedStream: [Number],
  altitudeStream: [Number],
  distanceStream: [Number],
  latlngStream: [[Number]],

  raw: Object
}, { timestamps: true });

// 🔑 Compound index for upserts
stravaActivitySchema.index({ userId: 1, stravaId: 1 }, { unique: true });

// 📅 Index for sorting/filtering by date
stravaActivitySchema.index({ userId: 1, startDate: -1 });

module.exports = mongoose.model('StravaActivity', stravaActivitySchema);
