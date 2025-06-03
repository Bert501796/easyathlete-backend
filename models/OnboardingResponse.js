//used to store the onboarding answers separately in MongoDB

const mongoose = require('mongoose');

const onboardingResponseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OnboardingResponse', onboardingResponseSchema);
