const express = require('express');
const axios = require('axios');
const router = express.Router();
const { enrichActivity } = require('../../utils/enrichActivity');
const { saveActivity } = require('../../utils/saveActivity');
const StravaActivity = require('../../models/StravaActivity');


router.post('/fetch-single-activity', async (req, res) => {
  const { userId, activityId, accessToken } = req.body;

  if (!userId || !activityId || !accessToken) {
    return res.status(400).json({ error: 'Missing userId, activityId or accessToken' });
  }

  try {
    console.log(`📥 Fetching activity ${activityId} for user ${userId}`);

    const { data: rawActivity } = await axios.get(
      `https://www.strava.com/api/v3/activities/${activityId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const enriched = await enrichActivity(rawActivity, accessToken);

    if (!enriched) {
      console.warn(`⚠️ Enrichment returned null for activity ${activityId}`);
      return res.status(500).json({ error: 'Enrichment failed' });
    }

    const saved = await saveActivity(enriched, userId);
    console.log(`✅ Activity ${activityId} saved for user ${userId}`);

    return res.status(200).json({
      message: '✅ Activity fetched, enriched, and saved',
      activityId
    });

  } catch (err) {
    console.error('❌ Error in fetch-single-activity:', err.message);
    if (err.response?.data) {
      console.error('❌ Strava API response:', err.response.data);
    }
    return res.status(500).json({ error: 'Enrichment failed', details: err.message });
  }
});

module.exports = router;
