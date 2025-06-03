const express = require('express');
const router = express.Router();
const openai = require('../utils/openaiClient');
const fs = require('fs');
const path = require('path');
const { defaultZones } = require('../training_templates/utils/heartRateZones');
const { getUserOnboardingData } = require('../utils/userDataLoader');
const TrainingSchedule = require('../models/TrainingSchedule');
const aiPrompt = require('../models/aiPrompt');

router.post('/generate-training-schedule', async (req, res) => {
  const { userId } = req.body;

  console.log('📥 Received userId:', userId);

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const athleteData = await getUserOnboardingData(userId);
    if (!athleteData) {
      return res.status(404).json({ error: 'Athlete data not found' });
    }

    const schedule = [];
    const prompts = [];

    const plan = [
      { day: 'Monday', type: 'running/endurance', duration: 45 },
      { day: 'Tuesday', type: 'strength/core', duration: 30 },
      { day: 'Wednesday', type: 'cycling_indoor/sweetspot', duration: 60 },
      { day: 'Thursday', type: 'swimming/technique', duration: 45 },
      { day: 'Friday', type: 'strength/upper_body', duration: 40 },
      { day: 'Saturday', type: 'cycling_outdoor/treshold', duration: 90 },
      { day: 'Sunday', type: 'running/recovery', duration: 25 }
    ];

    console.log('🧠 Athlete data used in builder:', athleteData);

    for (const workout of plan) {
      const [category, format] = workout.type.split('/');
      const templatePath = path.join(__dirname, `../training_templates/${category}/${format}.js`);

      if (!fs.existsSync(templatePath)) {
        console.warn('❌ Missing builder for', workout.type);
        continue;
      }

      const builderModule = require(templatePath);
      const builder = builderModule.default || builderModule;

      if (typeof builder !== 'function') {
        console.error(`❌ Builder loaded from ${templatePath} is not a function.`);
        continue;
      }

      const messages = builder({ ...athleteData, heartRateZones: defaultZones }, { duration: workout.duration });
      prompts.push({ day: workout.day, type: workout.type, messages });

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.6
      });

      const aiOutput = response.choices?.[0]?.message?.content;
      schedule.push({ day: workout.day, type: workout.type, aiOutput });
    }

    // Store AI prompts
    await AiPrompt.create({
      userId,
      prompts,
      source: 'initial'
    });

    // Store training schedule
    await TrainingSchedule.create({
      userId,
      prompt: prompts,
      response: schedule,
      source: 'initial'
    });

    console.log('✅ Stored training schedule and AI prompts in MongoDB');

    res.status(201).json({ message: '✅ Training schedule and prompts saved', schedule });
  } catch (error) {
    console.error('❌ Error generating schedule:', error.stack || error.message || error);
    res.status(500).json({ error: 'Failed to generate training schedule' });
  }
});

// ✅ New route: fetch latest training schedule for user
router.get('/schedule/latest/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const schedule = await TrainingSchedule.findOne({ userId })
      .sort({ createdAt: -1 });

    if (!schedule) {
      return res.status(404).json({ error: 'No schedule found for this user' });
    }

    res.status(200).json({ schedule: schedule.response });
  } catch (error) {
    console.error('❌ Error fetching latest schedule:', error);
    res.status(500).json({ error: 'Failed to retrieve schedule' });
  }
});

module.exports = router;
