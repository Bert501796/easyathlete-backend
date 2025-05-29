const express = require('express');
const { cloudinary } = require('../utils/cloudinary');
const { OpenAI } = require('openai');
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const fetchCloudinaryRawFile = async (path) => {
  const resources = await cloudinary.search
    .expression(`prefix="${path}/" AND resource_type="raw"`)
    .sort_by('public_id', 'desc')
    .max_results(10)
    .execute();

  return resources.resources;
};

const downloadJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} - Status: ${response.status}`);
  }
  return await response.json();
};

router.get('/ai-prompt/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const folderPath = `fit-files/${userId}/fit-files`;

    console.log(`📂 Searching Cloudinary folder: ${folderPath}`);
    const files = await fetchCloudinaryRawFile(folderPath);
    console.log('📄 Files found:', files.map(f => f.public_id));

    const onboardingFile = files.find(f => f.public_id.includes('/onboarding'));
    const summaryFile = files.find(f => f.public_id.includes('/activity-summary'));

    if (!onboardingFile || !summaryFile) {
      console.warn('⚠️ Missing files: ', {
        hasOnboarding: !!onboardingFile,
        hasSummary: !!summaryFile
      });
      return res.status(400).json({ error: 'Missing onboarding or activity summary' });
    }

    console.log('📥 Downloading onboarding and summary JSON...');
    const onboardingData = await downloadJson(onboardingFile.secure_url);
    const activitySummary = await downloadJson(summaryFile.secure_url);
    console.log('✅ Onboarding:', onboardingData);
    console.log('✅ Activity Summary:', activitySummary);

    const sportsList = Array.isArray(onboardingData.sports)
      ? onboardingData.sports.join(', ')
      : onboardingData.sports;

    const prompt = `
You are an expert endurance coach.

Here is the user's onboarding profile:
- Goal: ${onboardingData.goal}
- Deadline: ${onboardingData.deadline}
- Fitness Level: ${onboardingData.level}
- Days per Week: ${onboardingData.daysPerWeek}
- Sports: ${sportsList}
- Restrictions: ${onboardingData.restrictions}

Here are their recent activities:
${activitySummary.map((s, i) => {
  return `${i + 1}. ${s.sport} - ${s.distanceKm?.toFixed(1) || 'n/a'}km - ${s.totalTimeMinutes?.toFixed(0)}min - HR avg: ${s.avgHeartRate || 'n/a'}`;
}).join('\n')}

Please generate a personalized 7-day training schedule, with activity types, intensity zones, durations, and clear rest days.
    `.trim();

    console.log('📤 Prompt sent to OpenAI:\n', prompt);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const output = completion.choices?.[0]?.message?.content;

    if (!output) {
      console.warn('⚠️ OpenAI returned no output');
      return res.status(500).json({ error: 'AI response was empty' });
    }

    console.log('✅ OpenAI schedule generated');
    res.status(200).json({ schedule: output });

  } catch (error) {
console.error('❌ AI prompt FULL error:', error);
    console.error(error.stack);
    res.status(500).json({ error: 'Failed to generate training plan' });
  }
});

module.exports = router;
