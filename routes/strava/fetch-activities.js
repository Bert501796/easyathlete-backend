const express = require('express');
const axios = require('axios');
const router = express.Router();
const User = require('../../models/User');
const { enrichActivity } = require('../../utils/enrichActivity');
const { saveActivity } = require('../../utils/saveActivity');
const { getStravaMetrics } = require('../../utils/dataFetchers');
const { classifyFitnessLevel } = require('../../utils/fitnessClassifier');
const { fetchAthleteProfile } = require('../../utils/fetchAthleteProfile');

router.post('/fetch-activities', async (req, res) => {
  const { accessToken, userId, forceRefetch } = req.body;

  if (!accessToken || !userId) {
    return res.status(400).json({ error: 'Missing accessToken or userId' });
  }

  // Step 0: Optionally fetch profile info if missing birthYear
  const user = await User.findById(userId);
  if (user && (!user.birthYear || forceRefetch)) {
    await fetchAthleteProfile(accessToken, userId);
  }

  try {
    // Step 1: Fetch ALL activities from Strava
    let page = 1;
    let allActivities = [];

    while (true) {
      const { data } = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { per_page: 100, page }
      });

      if (data.length === 0) break;
      allActivities = allActivities.concat(data);
      page += 1;
    }

    // Step 2: Enrich and store/update each activity
    const enrichedAndSaved = await Promise.all(
      allActivities.map(async (activity) => {
        try {
          const enriched = await enrichActivity(activity, accessToken);
          await saveActivity(enriched, userId); // updates existing or creates new
          return enriched.id;
        } catch (err) {
          console.warn(`❌ Failed to process activity ${activity.id}:`, err.message);
          return null;
        }
      })
    );

    // Step 3: Recalculate fitness classification
    try {
      const metrics = await getStravaMetrics(userId);
      const fitnessLevel = classifyFitnessLevel(metrics);
      await User.updateOne({ _id: userId }, { fitnessLevel });
      console.log(`✅ Updated fitness level to ${fitnessLevel} for user ${userId}`);
    } catch (fitnessErr) {
      console.error(`❌ Fitness classification failed for ${userId}`, fitnessErr);
    }

    return res.status(200).json({
      message: '✅ Activities fetched and stored (or updated)',
      count: enrichedAndSaved.filter(Boolean).length
    });
  } catch (error) {
    console.error('❌ Fetch error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to fetch and store activities' });
  }
});

module.exports = router;
