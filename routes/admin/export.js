// /routes/admin/export.js
const express = require('express');
const router = express.Router();
const StravaActivity = require('../../models/StravaActivity');
const { Parser } = require('json2csv');

router.get('/strava', async (req, res) => {
  try {
    const activities = await StravaActivity.find().lean();

    const format = req.query.format || 'json'; // default to JSON

    if (format === 'csv') {
      // Flatten raw fields into top level
      const flatActivities = activities.map(activity => ({
        ...activity,
        ...activity.raw,
        raw: undefined // remove nested object
      }));

      const fields = Object.keys(flatActivities[0] || {}); // infer fields from first item
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(flatActivities);

      res.header('Content-Type', 'text/csv');
      res.attachment('strava_activities.csv');
      return res.send(csv);
    }

    // Default: JSON export (with full nested structure)
    res.json(activities);
  } catch (err) {
    console.error('❌ Export error:', err);
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;
