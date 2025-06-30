const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/progress", async (req, res) => {
  const { userId, activityType, startDate, endDate } = req.body;
  console.log("▶️ /ml/progress called with:", userId, activityType);

  try {
    const mlApiUrl = process.env.ML_API_URL || "https://easyathlete-ml-production.up.railway.app";
    const response = await axios.post(`${mlApiUrl}/ml/analyze-trends`, {
        user_id: userId,
        activity_type: activityType || null,
        start_date: startDate || null,
        end_date: endDate || null,
        });

    if (!response.data) {
      console.warn("⚠️ ML response was empty");
      return res.status(204).send();  // No content
    }

    res.json(response.data);
  } catch (error) {
    console.error("❌ ML Progress fetch failed:", error);
    res.status(500).json({ error: "Failed to fetch progress trends." });
  }
});

module.exports = router;
