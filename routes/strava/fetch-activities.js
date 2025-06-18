const express = require('express');
const axios = require('axios');
const router = express.Router();
const User = require('../../models/User');
const { enrichActivity } = require('../../utils/enrichActivity');
const { saveActivity } = require('../../utils/saveActivity');
const { getStravaMetrics } = require('../../utils/dataFetchers');
const { classifyFitnessLevel } = require('../../utils/fitnessClassifier');
const { fetchAthleteProfile } = require('../../utils/fetchAthleteProfile');

let currentlyProcessing = false; // 🚦 Prevent concurrent fetch calls

router.post('/fetch-activities', async (req, res) => {
  // 🚧 Disable endpoint completely if DISABLE_FETCH is true
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

  const MAX_ACTIVITIES = 900;

  const user = await User.findById(userId);
  if (user && (!user.birthYear || forceRefetch)) {
    await fetchAthleteProfile(accessToken, userId);
  }

  try {
    let activities = [];

    if (testActivityId) {
      console.log(`🔎 Fetching single test activity: ${testActivityId}`);
      const { data } = await axios.get(`https://www.strava.com/api/v3/activities/${testActivityId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      activities = [data];
    } else {
      // 🔁 Fetch up to MAX_ACTIVITIES
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
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // Processing disabled to avoid MongoDB overload
    // const enrichedAndSaved = await Promise.all(
    //   activities.map(activity => ...)
    // );

    return res.status(200).json({
      message: testActivityId
        ? `✅ Single test activity ${testActivityId} fetched`
        : '✅ Activities fetched (processing disabled)',
      count: activities.length
    });
  } catch (error) {
    console.error('❌ Fetch error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to fetch and store activities' });
  } finally {
    currentlyProcessing = false;
  }
});

module.exports = router;
