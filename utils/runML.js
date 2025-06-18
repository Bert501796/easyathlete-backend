const axios = require("axios");

async function runMLOnActivity(stravaId) {
  try {
    const response = await axios.get(
      `https://easyathlete-ml-production.up.railway.app/analyze`,
      {
        params: { stravaId },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (err) {
    console.error("❌ ML service call failed:", err.message);
    return { error: "Failed to fetch analysis from ML service" };
  }
}

module.exports = { runMLOnActivity };
