const express = require('express');
const cors = require('cors');
require('dotenv').config();

const uploadFitRoute = require('./routes/upload-fit');
const onboardingRoute = require('./routes/onboarding');
const aiPromptRoute = require('./routes/aiPrompt');
const stravaRoute = require('./routes/strava');

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Updated CORS to support both local and production
const allowedOrigins = [
  'http://localhost:5173',
  'https://easyathlete.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// ✅ API Routes
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
