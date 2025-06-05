// This file is triggered when syncing Strava data manually (e.g., on login or refresh).
// It fetches all new activities after `lastSyncDate` and uses syncSingleActivity() to enrich + store them.

// routes/strava/sync-activities.js
const express = require('express');
const axios = require('axios');
const User = require('../../models/User');
const { syncSingleActivity } = require('../../utils/syncSingleActivity');

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

    // Fetch all activities after lastSyncDate
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

    // Load user data to pass to syncSingleActivity()
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: `User with ID ${userId} not found` });
    }

    // Sync each activity individually using shared logic
    const syncedIds = await Promise.all(
      baseActivities.map((activity) =>
        syncSingleActivity({ stravaActivityId: activity.id, user })
      )
    );

    return res.status(200).json({
      message: '✅ Synced and enriched new activities',
      count: syncedIds.length,
      activityIds: syncedIds
    });
  } catch (error) {
    console.error('❌ Sync error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to sync activities' });
  }
});

module.exports = router;
