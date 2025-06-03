// backend/src/utils/userDataLoader.js
const { cloudinary } = require('./cloudinary');

// ✅ Now accepts userId as a parameter
const fetchCloudinaryRawFile = async (userId) => {
  const resources = await cloudinary.search
    .expression(`folder="easyathlete/${userId}/onboarding" AND resource_type="raw"`)
    .sort_by('public_id', 'desc')
    .max_results(10)
    .execute();

  return resources.resources;
};

const downloadJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} - Status: ${response.status}`);
  }
  return await response.json();
};

const getUserOnboardingData = async (userId) => {
  const files = await fetchCloudinaryRawFile(userId); // ✅ Pass userId here

  const onboardingFile = files.find(f => f.public_id.includes('/onboarding/onboarding_'));
  if (!onboardingFile) {
    console.warn(`⚠️ No onboarding.json found for user ${userId}`);
    return null;
  }

  return await downloadJson(onboardingFile.secure_url);
};

module.exports = {
  getUserOnboardingData
};
