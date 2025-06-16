const express = require('express');
const router = express.Router();
const { getWeeklyTrainingSummary } = require('../utils/aggregateWeeklyTraining');

router.get('/weekly-summary/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const summary = await getWeeklyTrainingSummary(userId);
    res.json(summary);
  } catch (error) {
    console.error("Error generating weekly summary:", error);
    res.status(500).json({ error: "Failed to fetch weekly training summary" });
  }
});

module.exports = router;
