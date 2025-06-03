// backend/src/routes/trainingSchedule.js
const express = require('express');
const router = express.Router();
const openai = require('../utils/openaiClient');
const fs = require('fs');
const path = require('path');
const { defaultZones } = require('../training_templates/utils/heartRateZones');

// Template builders
const buildRunningEndurancePrompt = require('../training_templates/running/endurance');
const buildCyclingEndurancePrompt = require('../training_templates/cycling_indoor/endurance');

router.post('/generate-training-schedule', async (req, res) => {
  const { userId, athleteData } = req.body;

  if (!userId || !athleteData) {
    return res.status(400).json({ error: 'Missing userId or athleteData' });
  }

  try {
    const schedule = [];

    // Dummy example: generate 4 weekly workouts
    const plan = [
      { day: 'Monday', type: 'running/endurance', duration: 45 },
      { day: 'Wednesday', type: 'cycling_indoor/endurance', duration: 60 },
      { day: 'Friday', type: 'running/endurance', duration: 30 },
      { day: 'Sunday', type: 'cycling_indoor/endurance', duration: 75 }
    ];

    for (const workout of plan) {
      let messages = [];

      const [category, format] = workout.type.split('/');
      const templatePath = path.join(__dirname, `../training_templates/${category}/${format}.js`);

      if (fs.existsSync(templatePath)) {
        const builderModule = require(templatePath);
        const builder = builderModule.default || builderModule; // supports both CommonJS & ESModule

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
