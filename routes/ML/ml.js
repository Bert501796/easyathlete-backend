const express = require("express");
const router = express.Router();
const { runMLOnActivity } = require("../../utils/runML");

// Endpoint: GET /api/ml/analyze/:stravaId
router.get("/ml/analyze/:stravaId", async (req, res) => {
  const stravaId = parseInt(req.params.stravaId, 10);

  try {
    const result = await runMLOnActivity(stravaId);
    res.json(result);
  } catch (err) {
    console.error("ML error:", err);
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;
