// backend/src/routes/trainingSchedule.js
const express = require('express');
const router = express.Router();
const openai = require('../utils/openaiClient');
const fs = require('fs');
const path = require('path');
const { defaultZones } = require('../training_templates/utils/heartRateZones');
const { getUserOnboardingData } = require('../utils/userDataLoader');

router.post('/generate-training-schedule', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const athleteData = await getUserOnboardingData(userId);

    if (!athleteData) {
      return res.status(404).json({ error: 'Athlete data not found' });
    }

    const schedule = [];

    // Example weekly training plan using full range of categories
    const plan = [
      { day: 'Monday', type: 'running/endurance', duration: 45 },
      { day: 'Tuesday', type: 'strength/core', duration: 30 },
      { day: 'Wednesday', type: 'cycling_indoor/sweetspot', duration: 60 },
      { day: 'Thursday', type: 'swimming/technique', duration: 45 },
      { day: 'Friday', type: 'strength/upper_body', duration: 40 },
      { day: 'Saturday', type: 'cycling_outdoor/treshold', duration: 90 },
      { day: 'Sunday', type: 'running/recovery', duration: 25 }
    ];

    for (const workout of plan) {
      let messages = [];

      const [category, format] = workout.type.split('/');
      const templatePath = path.join(__dirname, `../training_templates/${category}/${format}.js`);

      if (fs.existsSync(templatePath)) {
        console.log(`📂 Loading template: ${templatePath}`);

        const builderModule = require(templatePath);
        const builder = builderModule.default || builderModule;

        if (typeof builder !== 'function') {
          console.error(`❌ Builder loaded from ${templatePath} is not a function.`);
          continue;
        }

        messages = builder({ ...athleteData, heartRateZones: defaultZones }, { duration: workout.duration });
      } else {
        console.warn('❌ Missing builder for', workout.type);
        continue;
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.6
      });

      const aiOutput = response.choices?.[0]?.message?.content;
      schedule.push({ day: workout.day, type: workout.type, aiOutput });
    }

    res.json({ userId, schedule });
  } catch (error) {
    console.error('❌ Error generating schedule:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to generate training schedule' });
  }
});

module.exports = router;
