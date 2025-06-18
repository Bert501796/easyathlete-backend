const axios = require("axios");

async function runMLOnActivity(stravaId) {
  try {
    const response = await axios.get(
      `http://easyathlete-ml.railway.internal/analyze`,
      {
        params: { stravaId },
        timeout: 10000, // optional timeout
      }
    );
    return response.data;
  } catch (err) {
    console.error("❌ ML service call failed:", err.message);
    return { error: "Failed to fetch analysis from ML service" };
  }
}

module.exports = { runMLOnActivity };
