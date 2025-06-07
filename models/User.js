const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String }, // Optional — filled in at signup
  email: { type: String, unique: true, sparse: true }, // Optional — provided at signup
  passwordHash: { type: String }, // Optional — only stored after signup
  customUserId: { type: String, unique: true }, // Used during onboarding
  stravaId: Number,
  accessToken: String,
  refreshToken: String,
  tokenExpiresAt: Number
});

module.exports = mongoose.model('User', userSchema);
