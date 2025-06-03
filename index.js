const express = require('express');
const cors = require('cors');
require('dotenv').config();

const uploadFitRoute = require('./routes/upload-fit');
const onboardingRoute = require('./routes/onboarding');
const aiPromptRoute = require('./routes/aiPrompt');
const stravaAuthRoute = require('./routes/strava/strava-authentication');
const fetchActivitiesRoute = require('./routes/strava/fetch-activities');
const latestStravaUrl = require('./routes/data/latestStravaUrl'); // adjust path if needed
const onboardingBot = require('./routes/onboardingBot');
const trainingScheduleRoute = require('./routes/trainingSchedule');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');


const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected on Railway'))
.catch(err => console.error('❌ MongoDB connection error:', err));


const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  'http://localhost:5173',
  'https://easyathlete.vercel.app',
  'https://easyathlete-clean.vercel.app'
];

// ✅ 1. CORS setup
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ CORS blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// ✅ 2. Middleware order matters
app.use(express.json());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ This line ensures preflight is handled!
app.use('/auth', authRoutes);


// ✅ 3. Routes
app.use(uploadFitRoute);
app.use(onboardingRoute);
app.use(aiPromptRoute);
app.use('/strava', stravaAuthRoute);
app.use('/strava', fetchActivitiesRoute);
app.use('/', latestStravaUrl);
app.use('/onboarding-bot', onboardingBot);
app.use(trainingScheduleRoute);
app.use('/user', userRoutes);



app.get('/', (req, res) => {
  res.send('EasyAthlete API is running ✅');
});

app.listen(PORT, () => {
  console.log(`✅ EasyAthlete API running on http://localhost:${PORT}`);
});