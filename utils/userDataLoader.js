// utils/userDataLoader.js
const OnboardingData = require('../models/OnboardingResponse'); // <-- adjust path if needed

const getUserOnboardingData = async (userId) => {
  try {
    const record = await OnboardingData.findOne({ userId }).sort({ createdAt: -1 });

    if (!record) {
      console.warn(`⚠️ No onboarding data found for user ${userId}`);
      return null;
    }

    return record.data; // 👈 matches your schema
  } catch (error) {
    console.error('❌ Error loading onboarding data from MongoDB:', error);
    return null;
  }
};

module.exports = {
  getUserOnboardingData
};
