const express = require('express');
const cors = require('cors');
require('dotenv').config();

const uploadFitRoute = require('./routes/upload-fit');
const onboardingRoute = require('./routes/onboarding');
const aiPromptRoute = require('./routes/aiPrompt');
const stravaRoute = require('./routes/strava');

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ 1. Allow both local dev and production frontend
const allowedOrigins = [
  'http://localhost:5173',
  'https://easyathlete.vercel.app'
];

// ✅ 2. Handle CORS with origin check
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ CORS blocked request from:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ 3. Enable JSON parsing
app.use(express.json());

// ✅ 4. Handle preflight OPTIONS requests globally
app.options('*', cors());

// ✅ 5. Routes
app.use(uploadFitRoute);
app.use(onboardingRoute);
app.use(aiPromptRoute);
app.use('/', stravaRoute);

app.get('/', (req, res) => {
  res.send('EasyAthlete API is running ✅');
});

app.listen(PORT, () => {
  console.log(`✅ EasyAthlete API running on http://localhost:${PORT}`);
});
