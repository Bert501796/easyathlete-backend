const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  customUserId: { type: String, unique: true }, // ✅ This stores user_... from onboarding
  stravaId: Number,
  accessToken: String,
  refreshToken: String,
  tokenExpiresAt: Number
});

module.exports = mongoose.model('User', userSchema);
