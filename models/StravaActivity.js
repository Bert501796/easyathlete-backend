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
  calories: Number,
  streamEnriched: { type: Boolean, default: false },
  zoneDistribution: [Number],
  hrZoneBuckets: [Number],
  workoutType: String,
  isCommute: Boolean,
  isManual: Boolean,
  visibility: String,
  gearId: String,

  // ✅ Stream data
  heartRateStream: [Number],
  timeStream: [Number],
  cadenceStream: [Number],
  wattsStream: [Number],
  speedStream: [Number],
  altitudeStream: [Number],
  distanceStream: [Number],
  latlngStream: [[Number]],

  // ✅ New ML + enrichment fields
  aggregatedFeatures: Object,
  segments: [Object],
  segmentSummary: Object,
  mlWindows: [Object],
  stream_data_full: Object,

  // 🧠 Optional: Raw full activity (can be large)
  raw: Object
}, { timestamps: true });

// 🔐 Prevent duplicate stravaId per user
stravaActivitySchema.index({ userId: 1, stravaId: 1 }, { unique: true });

// 📅 Index for time-based queries
stravaActivitySchema.index({ userId: 1, startDate: -1 });

module.exports = mongoose.model('StravaActivity', stravaActivitySchema);
