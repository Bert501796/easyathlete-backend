const express = require('express');
const axios = require('axios');
const router = express.Router();
const User = require('../../models/User');
const StravaActivity = require('../../models/StravaActivity');
const { enrichActivity } = require('../../utils/enrichActivity');
const { saveActivity } = require('../../utils/saveActivity');
const { fetchAthleteProfile } = require('../../utils/fetchAthleteProfile');

let currentlyProcessing = false;
const CONCURRENCY_LIMIT = 5;

router.post('/fetch-activities', async (req, res) => {
  if (process.env.DISABLE_FETCH === 'true') {
    return res.status(503).json({ error: '🚫 Fetch endpoint temporarily disabled by server config.' });
  }

  if (currentlyProcessing) {
    return res.status(429).json({ error: 'Another fetch is in progress. Please wait.' });
  }
  currentlyProcessing = true;

  const { accessToken, userId, forceRefetch = true, testActivityId, limit } = req.body;
  const MAX_ACTIVITIES = limit || 300;

  if (!accessToken || !userId) {
    currentlyProcessing = false;
    return res.status(400).json({ error: 'Missing accessToken or userId' });
  }

  try {
    const user = await User.findOne({
      $or: [{ _id: userId }, { customUserId: userId }]
    });

    if (user && (!user.birthYear || forceRefetch)) {
      await fetchAthleteProfile(accessToken, userId);
      console.log(`✅ Strava profile updated for user ${userId}`);
    }

    // 🔥 Handle test activity early
    if (testActivityId) {
      console.log('🔥 testActivityId from body:', testActivityId);
      const { data } = await axios.get(`https://www.strava.com/api/v3/activities/${testActivityId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const enriched = await enrichActivity(data, accessToken);
      await saveActivity(enriched, userId);

      return res.status(200).json({
        message: `✅ Single test activity ${testActivityId} fetched and processed`,
        processedCount: 1,
        skippedCount: 0
      });
    }

    // 🧠 Normal fetch path
    const existing = await StravaActivity.find({ userId }, { stravaId: 1 });
    console.log(`📄 Found ${existing.length} existing activities in DB`);
    const existingIds = new Set(existing.map(doc => doc.stravaId));

    let activities = [];
    let page = 1;
    let keepFetching = true;

    while (keepFetching) {
      const { data } = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { per_page: 100, page }
      });

      if (data.length === 0) break;

      console.log(`🔁 Fetching page ${page} from Strava...`);
      console.log(`📥 Got ${data.length} activities from Strava`);

      const newActivities = data.filter(a => !existingIds.has(a.id));
      console.log(`🆕 Found ${newActivities.length} new activities on this page`);

      activities = activities.concat(newActivities);

      if (newActivities.length === 0) break;
      if (MAX_ACTIVITIES && activities.length >= MAX_ACTIVITIES) {
        activities = activities.slice(0, MAX_ACTIVITIES);
        break;
      }

      page += 1;
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    const filteredActivities = forceRefetch
      ? activities
      : activities.filter(a => !existingIds.has(a.id));

    const skippedCount = activities.length - filteredActivities.length;
    console.log(`✅ Total new activities to process: ${filteredActivities.length}`);

    const limitConcurrency = async (tasks, limit) => {
      const results = [];
      let index = 0;

      const runBatch = async () => {
        while (index < tasks.length) {
          const batch = tasks.slice(index, index + limit).map(fn => fn());
          results.push(...await Promise.allSettled(batch));
          index += limit;
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      };

      await runBatch();
      return results;
    };

    const tasks = filteredActivities.map(activity => async () => {
      try {
        const enriched = await enrichActivity(activity, accessToken);
        await saveActivity(enriched, userId);
        return enriched.id;
      } catch (err) {
        console.warn(`❌ Failed to process activity ${activity.id}: ${err.message}`);
        return null;
      }
    });

    const processed = await limitConcurrency(tasks, CONCURRENCY_LIMIT);

    return res.status(200).json({
      message: `✅ ${processed.length} activities processed (${skippedCount} skipped)`,
      processedCount: processed.filter(r => r.status === 'fulfilled').length,
      skippedCount
    });

  } catch (error) {
    console.error('❌ Fetch error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to fetch and store activities' });
  } finally {
    currentlyProcessing = false;
  }
});

module.exports = router;
