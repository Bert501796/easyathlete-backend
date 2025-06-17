const express = require('express');
const axios = require('axios');
const router = express.Router();
const { enrichActivity } = require('../../utils/enrichActivity');
const { saveActivity } = require('../../utils/saveActivity');
const User = require('../../models/User');

router.post('/fetch-single-activity', async (req, res) => {
  const { userId, activityId } = req.body;

  if (!userId || !activityId) {
    return res.status(400).json({ error: 'Missing userId or activityId' });
  }

  try {
    const user = await User.findById(userId);
    if (!user || !user.accessToken) {
      return res.status(404).json({ error: 'User not found or missing accessToken' });
    }

    const { data: activity } = await axios.get(
      `https://www.strava.com/api/v3/activities/${activityId}`,
      {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      }
    );

    const enriched = await enrichActivity(activity, user.accessToken);
    const saved = await saveActivity(enriched, userId);

    return res.status(200).json({ message: '✅ Activity enriched and saved', saved });
  } catch (err) {
    console.error('❌ Failed to fetch/enrich/save activity:', err.message);
    return res.status(500).json({ error: 'Enrichment failed' });
  }
});

module.exports = router;
