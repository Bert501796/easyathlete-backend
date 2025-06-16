// /routes/analysis.js
const express = require('express');
const router = express.Router();
const { getWeeklyTrainingSummary } = require('../../utils/aggregateWeeklyTraining');

router.get('/weekly-summary/:userId', async (req, res) => {
  try {
    const userId = req.params.userId.trim();
    const type = req.query.type || null; // Optional: ?type=Run, Ride, etc.

    const result = await getWeeklyTrainingSummary(userId, type);
    res.json(result);
  } catch (error) {
    console.error("Error in weekly summary:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
