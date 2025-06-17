const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String },
  customUserId: { type: String, unique: true },
  stravaId: Number,
  accessToken: String,
  refreshToken: String,
  tokenExpiresAt: Number,

  // ➕ Enriched profile fields
  sex: String,
  weight: Number,
  ftp: Number,
  city: String,
  country: String,
  stravaCreatedAt: Date,
  stravaUpdatedAt: Date,
  datePreference: String,
  measurementPreference: String,
  profilePic: String,
  profilePicMedium: String,
  clubs: Array,
  firstName: String,
  lastName: String,
  birthYear: Number,
  age: Number
});

module.exports = mongoose.model('User', userSchema);
