const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true }, // Only hashed version stored
  customUserId: { type: String, unique: true },    // For tracking onboarding flow users
  stravaId: Number,
  accessToken: String,
  refreshToken: String,
  tokenExpiresAt: Number
});

module.exports = mongoose.model('User', userSchema);
