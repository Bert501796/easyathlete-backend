const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/progress", async (req, res) => {
  const {
    userId,
    activityType,  // e.g. "Run", "Ride", "Swim"
    startDate,     // e.g. "2025-06-01"
    endDate,       // e.g. "2025-06-30"
    metrics        // optional: ["fitness_index", "hr_efficiency_norm"]
  } = req.body;

  console.log("▶️ /ml/progress called with:", {
    userId,
    activityType,
    startDate,
    endDate,
    metrics
  });

  if (!userId) {
    return res.status(400).json({ error: "Missing userId in request body." });
  }

  try {
    const mlApiUrl = process.env.ML_API_URL || "https://easyathlete-ml-production.up.railway.app";

    const response = await axios.post(`${mlApiUrl}/ml/analyze-trends`, {
      user_id: userId,
      activity_type: activityType || null,
      start_date: startDate || null,
      end_date: endDate || null,
      metrics: metrics || null
    });

    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.warn("⚠️ ML response was empty or malformed");
      return res.status(204).send(); // No content
    }

    console.log(`📊 ML returned ${response.data.length} trend items.`);
    res.json({ version: "v1", data: response.data });

  } catch (error) {
    console.error("❌ ML Progress fetch failed:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch progress trends." });
  }
});

module.exports = router;
