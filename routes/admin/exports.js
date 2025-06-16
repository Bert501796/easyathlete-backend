// /routes/admin/export.js
const express = require('express');
const router = express.Router();
const StravaActivity = require('../../models/StravaActivity');

router.get('/strava', async (req, res) => {
  try {
    const activities = await StravaActivity.find().lean();
    res.json(activities);
  } catch (err) {
    console.error('❌ Export error:', err);
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;
