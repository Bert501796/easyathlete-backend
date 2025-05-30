const express = require('express');
const { cloudinary } = require('../utils/cloudinary');
const { OpenAI } = require('openai');
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const fetchCloudinaryRawFile = async (path) => {
  const resources = await cloudinary.search
    .expression(`folder="${path}" AND resource_type="raw"`)
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
    const folderPath = `fit-files/${userId}`;

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

Please generate a 4-week personalized training schedule as an array of JSON objects, each including:
- week (1–4)
- day (1–7)
- date (ISO format starting today)
- sport
- durationMinutes
- intensityZone (1–5)
- focus (e.g. Endurance, Threshold, VO2max, Recovery)
- notes (human-readable breakdown of the workout)
- segments: an array of segments with:
  - label (e.g. "Warm-up", "Steady Run", "Interval", "Cool Down")
  - duration (in minutes)
  - zone (1–5)
  - heartRateMin (in bpm, based on the zone below)
  - heartRateMax (in bpm, based on the zone below)

Use the following estimated heart rate zones unless the sport is "Strength Training":
- Zone 1: Recovery (100–120 bpm)
- Zone 2: Endurance (121–140 bpm)
- Zone 3: Tempo (141–155 bpm)
- Zone 4: Threshold (156–170 bpm)
- Zone 5: VO2 Max (171–185 bpm)

For Strength or Strength Training workouts, return null or omit heartRateMin and heartRateMax.
Return ONLY a valid JSON array with no explanation or formatting.

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

    let parsed;
    try {
      parsed = JSON.parse(output);
    } catch (err) {
      console.error('❌ Failed to parse JSON from AI:', err.message);
      return res.status(500).json({ error: 'AI response was not valid JSON.' });
    }

    console.log('✅ OpenAI JSON schedule parsed successfully');
    res.status(200).json({ schedule: parsed });

  } catch (error) {
    console.error('❌ AI prompt FULL error:', error);
    res.status(500).json({ error: 'Failed to generate training plan' });
  }
});

module.exports = router;
