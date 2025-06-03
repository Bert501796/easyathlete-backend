// backend/src/utils/userDataLoader.js
const { cloudinary } = require('./cloudinary');

const fetchCloudinaryRawFile = async (path) => {
  const resources = await cloudinary.search
    .expression(`folder="${path}" AND resource_type="raw"`)
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
  const folderPath = `fit-files/${userId}`;
  const files = await fetchCloudinaryRawFile(folderPath);

  const onboardingFile = files.find(f => f.public_id.includes('/onboarding'));
  if (!onboardingFile) {
    console.warn(`⚠️ No onboarding.json found for user ${userId}`);
    return null;
  }

  return await downloadJson(onboardingFile.secure_url);
};

module.exports = {
  getUserOnboardingData
};
