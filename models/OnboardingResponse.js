//used to store the onboarding answers separately in MongoDB

// models/OnboardingData.js
const mongoose = require('mongoose');

const onboardingSchema = new mongoose.Schema({
  userId: { type: String, required: true },  // 🔧 string, not ObjectId
  data: { type: Array, required: true },     // conversation array
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OnboardingData', onboardingSchema);

