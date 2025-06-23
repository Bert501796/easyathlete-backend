const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/progress", async (req, res) => {
  const { userId, activityType } = req.body;

  try {
    const mlApiUrl = process.env.ML_API_URL || "https://easyathlete-ml-production.up.railway.app";
    const response = await axios.post(`${mlApiUrl}/ml/analyze-trends`, {
      user_id: userId,
      activity_type: activityType || null,
    });

    res.json(response.data);
  } catch (error) {
    console.error("❌ ML Progress fetch failed:", error.message);
    res.status(500).json({ error: "Failed to fetch progress trends." });
  }
});

module.exports = router;
