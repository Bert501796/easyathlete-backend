const express = require('express');
const cors = require('cors');
require('dotenv').config();

const uploadFitRoute = require('./routes/upload-fit');
const onboardingRoute = require('./routes/onboarding');
const aiPromptRoute = require('./routes/aiPrompt');
const stravaRoute = require('./routes/strava'); // ✅ Import new strava route

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: 'https://easyathlete.vercel.app', credentials: true }));
app.use(express.json());

app.use(uploadFitRoute);
app.use(onboardingRoute);
app.use(aiPromptRoute);
app.use('/', stravaRoute); // ✅ Mount Strava under /strava

app.get('/', (req, res) => {
  res.send('EasyAthlete API is running ✅');
});

app.listen(PORT, () => {
  console.log(`✅ EasyAthlete API running on http://localhost:${PORT}`);
});
