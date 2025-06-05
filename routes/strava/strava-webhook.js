const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const { syncSingleActivity } = require('../../utils/syncSingleActivity');

// Handle webhook verification (Strava GET request)
router.get('/webhook', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === process.env.STRAVA_VERIFY_TOKEN) {
    return res.status(200).json({ 'hub.challenge': challenge });
  }

  res.sendStatus(403);
});

// Handle webhook event (Strava POST request)
router.post('/webhook', async (req, res) => {
  const event = req.body;

  if (event.object_type === 'activity' && event.aspect_type === 'create') {
    try {
      const user = await User.findOne({ stravaAthleteId: event.owner_id });
      if (!user) {
        console.warn(`⚠️ No user found for Strava athlete ID ${event.owner_id}`);
        return res.sendStatus(200);
      }

      await syncSingleActivity({
        stravaActivityId: event.object_id,
        user
      });

      console.log(`✅ Synced activity ${event.object_id} via webhook`);
    } catch (err) {
      console.error(`❌ Webhook error for activity ${event.object_id}:`, err.message);
    }
  }

  // Strava expects a quick 200 OK
  res.sendStatus(200);
});

module.exports = router;
