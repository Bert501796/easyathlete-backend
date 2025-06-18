const express = require('express');
const axios = require('axios');
const router = express.Router();
const User = require('../../models/User');
const { enrichActivity } = require('../../utils/enrichActivity');
const { saveActivity } = require('../../utils/saveActivity');
const { getStravaMetrics } = require('../../utils/dataFetchers');
const { classifyFitnessLevel } = require('../../utils/fitnessClassifier');
const { fetchAthleteProfile } = require('../../utils/fetchAthleteProfile');

let currentlyProcessing = false;
const MAX_ACTIVITIES = 50;
const CONCURRENCY_LIMIT = 5;

router.post('/fetch-activities', async (req, res) => {
  if (process.env.DISABLE_FETCH === 'true') {
    return res.status(503).json({ error: '🚫 Fetch endpoint temporarily disabled by server config.' });
  }

  if (currentlyProcessing) {
    return res.status(429).json({ error: 'Another fetch is in progress. Please wait.' });
  }
  currentlyProcessing = true;

  const { accessToken, userId, forceRefetch, testActivityId } = req.body;

  if (!accessToken || !userId) {
    currentlyProcessing = false;
    return res.status(400).json({ error: 'Missing accessToken or userId' });
  }

  try {
    const user = await User.findById(userId);
    if (user && (!user.birthYear || forceRefetch)) {
      await fetchAthleteProfile(accessToken, userId);
    }

    let activities = [];

    if (testActivityId) {
      const { data } = await axios.get(`https://www.strava.com/api/v3/activities/${testActivityId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      activities = [data];
    } else {
      let page = 1;
      while (activities.length < MAX_ACTIVITIES) {
        const { data } = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { per_page: 100, page }
        });

        if (data.length === 0) break;
        activities = activities.concat(data);

        if (activities.length >= MAX_ACTIVITIES) {
          activities = activities.slice(0, MAX_ACTIVITIES);
          break;
        }

        page += 1;
        await new Promise(resolve => setTimeout(resolve, 300)); // throttle API rate
      }
    }

    // ✅ Enrich & Save in limited concurrency batches
    const limitConcurrency = async (tasks, limit) => {
      const results = [];
      let index = 0;

      const runBatch = async () => {
        while (index < tasks.length) {
          const batch = tasks.slice(index, index + limit).map(fn => fn());
          results.push(...await Promise.allSettled(batch));
          index += limit;
          await new Promise(resolve => setTimeout(resolve, 200)); // brief pause between batches
        }
      };

      await runBatch();
      return results;
    };

    const tasks = activities.map(activity => async () => {
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
      message: testActivityId
        ? `✅ Single test activity ${testActivityId} fetched and processed`
        : `✅ ${processed.length} activities fetched and saved`,
      count: processed.filter(r => r.status === 'fulfilled').length
    });

  } catch (error) {
    console.error('❌ Fetch error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to fetch and store activities' });
  } finally {
    currentlyProcessing = false;
  }
});

module.exports = router;
