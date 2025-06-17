const express = require('express');
const axios = require('axios');
const router = express.Router();
const User = require('../../models/User');
// const { enrichActivity } = require('../../utils/enrichActivity');
// const { saveActivity } = require('../../utils/saveActivity');
const { getStravaMetrics } = require('../../utils/dataFetchers');
const { classifyFitnessLevel } = require('../../utils/fitnessClassifier');
const { fetchAthleteProfile } = require('../../utils/fetchAthleteProfile');

// let currentlyProcessing = false; // 🚦 Prevent concurrent fetch calls

router.post('/fetch-activities', async (req, res) => {
  // if (currentlyProcessing) {
  //   return res.status(429).json({ error: 'Another fetch is in progress. Please wait.' });
  // }
  // currentlyProcessing = true;

  // ⚠️ Temporary exit to disable background fetching
  return res.status(200).json({
    message: '⛔ Fetch temporarily disabled to stop runaway tasks',
  });

  // const { accessToken, userId, forceRefetch, testActivityId } = req.body;

  // if (!accessToken || !userId) {
  //   currentlyProcessing = false;
  //   return res.status(400).json({ error: 'Missing accessToken or userId' });
  // }

  // const MAX_ACTIVITIES = 900;
  // const { default: pLimit } = await import('p-limit');
  // const limit = pLimit(5); // Max 5 concurrent enrich+save operations

  // const user = await User.findById(userId);
  // if (user && (!user.birthYear || forceRefetch)) {
  //   await fetchAthleteProfile(accessToken, userId);
  // }

  // try {
  //   let activities = [];

  //   if (testActivityId) {
  //     console.log(`🔎 Fetching single test activity: ${testActivityId}`);
  //     const { data } = await axios.get(`https://www.strava.com/api/v3/activities/${testActivityId}`, {
  //       headers: { Authorization: `Bearer ${accessToken}` }
  //     });
  //     activities = [data];
  //   } else {
  //     let page = 1;
  //     while (activities.length < MAX_ACTIVITIES) {
  //       const { data } = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
  //         headers: { Authorization: `Bearer ${accessToken}` },
  //         params: { per_page: 100, page }
  //       });

  //       if (data.length === 0) break;
  //       activities = activities.concat(data);

  //       if (activities.length >= MAX_ACTIVITIES) {
  //         activities = activities.slice(0, MAX_ACTIVITIES);
  //         break;
  //       }

  //       page += 1;
  //       await new Promise(resolve => setTimeout(resolve, 300));
  //     }
  //   }

  //   const enrichedAndSaved = await Promise.all(
  //     activities.map(activity =>
  //       limit(async () => {
  //         try {
  //           const enriched = await enrichActivity(activity, accessToken);
  //           await saveActivity(enriched, userId);
  //           return enriched.id;
  //         } catch (err) {
  //           console.warn(`❌ Failed to process activity ${activity.id}:`, err.message);
  //           return null;
  //         }
  //       })
  //     )
  //   );

  //   try {
  //     const metrics = await getStravaMetrics(userId);
  //     const fitnessLevel = classifyFitnessLevel(metrics);
  //     await User.updateOne({ _id: userId }, { fitnessLevel });
  //     console.log(`✅ Updated fitness level to ${fitnessLevel} for user ${userId}`);
  //   } catch (fitnessErr) {
  //     console.error(`❌ Fitness classification failed for ${userId}`, fitnessErr);
  //   }

  //   return res.status(200).json({
  //     message: testActivityId
  //       ? `✅ Single test activity ${testActivityId} processed`
  //       : '✅ Activities fetched and stored (or updated)',
  //     count: enrichedAndSaved.filter(Boolean).length
  //   });
  // } catch (error) {
  //   console.error('❌ Fetch error:', error.response?.data || error.message);
  //   return res.status(500).json({ error: 'Failed to fetch and store activities' });
  // } finally {
  //   currentlyProcessing = false;
  // }
});

module.exports = router;
