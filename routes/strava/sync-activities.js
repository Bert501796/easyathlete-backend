// This file is triggered when syncing Strava data manually (e.g., on login or refresh).
// It fetches all new activities after lastSyncDate and uses syncSingleActivity() to enrich + store them.

const express = require('express');
const axios = require('axios');
const User = require('../../models/User');
const { enrichActivity } = require('../../utils/enrichActivity');
const { saveActivity } = require('../../utils/saveActivity');
const { getStravaMetrics } = require('../../utils/dataFetchers');
const { classifyFitnessLevel } = require('../../utils/fitnessClassifier');

const router = express.Router();

router.post('/sync-activities', async (req, res) => {
  const { accessToken, userId, lastSyncDate } = req.body;

  if (!accessToken || !userId) {
    return res.status(400).json({ error: 'Missing accessToken or userId' });
  }

  try {
    const afterTimestamp = lastSyncDate
      ? Math.floor(new Date(lastSyncDate).getTime() / 1000)
      : Math.floor((Date.now() - 3 * 24 * 60 * 60 * 1000) / 1000); // Default: 3 days ago

    // Step 1: Fetch all activities after `lastSyncDate`
    const activityRes = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        per_page: 50,
        page: 1,
        after: afterTimestamp
      }
    });

    const baseActivities = activityRes.data;

    if (!baseActivities.length) {
      return res.status(200).json({ message: '✅ No new activities to sync', count: 0 });
    }

    // Step 2: Sync each activity using enrich/save logic
    const syncedIds = await Promise.all(
      baseActivities.map(async (activity) => {
        try {
          const enriched = await enrichActivity(activity, accessToken);
          await saveActivity(enriched, userId);
          return enriched.id;
        } catch (err) {
          console.warn(`❌ Failed to sync activity ${activity.id}:`, err.message);
          return null;
        }
      })
    );

    // Step 3: Update fitness level
    try {
      const metrics = await getStravaMetrics(userId);
      const fitnessLevel = classifyFitnessLevel(metrics);
      await User.updateOne({ _id: userId }, { fitnessLevel });
      console.log(`✅ Updated fitness level to ${fitnessLevel} for user ${userId}`);
    } catch (fitnessErr) {
      console.error(`❌ Fitness classification failed for ${userId}`, fitnessErr);
    }

    return res.status(200).json({
      message: '✅ Synced and enriched new activities',
      count: syncedIds.filter(Boolean).length,
      activityIds: syncedIds.filter(Boolean)
    });
  } catch (error) {
    console.error('❌ Sync error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to sync activities' });
  }
});

module.exports = router;
