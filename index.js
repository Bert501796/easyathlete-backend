const express = require('express');
const cors = require('cors');
require('dotenv').config();

const uploadFitRoute = require('./routes/upload-fit');
const onboardingRoute = require('./routes/onboarding');
const aiPromptRoute = require('./routes/aiPrompt');
const stravaAuthRoute = require('./routes/strava/strava-authentication');
const fetchActivitiesRoute = require('./routes/strava/fetch-activities');
const insightsRoute = require('./routes/strava/insights');
const onboardingBot = require('./routes/onboardingBot');
const trainingScheduleRoute = require('./routes/trainingSchedule');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth/auth');
const fitnessRoutes = require('./routes/fitness');
const stravaWebhook = require('./routes/strava/strava-webhook');
const syncActivities = require('./routes/strava/sync-activities');
const kpisRoute = require('./routes/strava/kpis');
const analysisRoutes = require('./routes/strava/analysis');
const exportRoute = require('./routes/admin/export');
const refetch = require('./routes/admin/refetch-strava-data');
const fetchSingleActivityRoute = require('./routes/strava/fetch-single-activity');

const mongoose = require('mongoose');

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected on Railway');

    const app = express();
    const PORT = process.env.PORT || 4000;

    const allowedOrigins = [
      'http://localhost:5173',
      'https://easyathlete.vercel.app',
      'https://easyathlete-clean.vercel.app'
    ];

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

    app.use(express.json());
    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));

    // Routes
    app.use('/auth', authRoutes);
    app.use(uploadFitRoute);
    app.use(onboardingRoute);
    app.use(aiPromptRoute);
    app.use('/strava', stravaAuthRoute);
    app.use('/strava', fetchActivitiesRoute);
    app.use('/strava', insightsRoute);
    app.use('/onboarding-bot', onboardingBot);
    app.use(trainingScheduleRoute);
    app.use('/user', userRoutes);
    app.use('/api/fitness', fitnessRoutes);
    app.use('/strava', stravaWebhook);
    app.use('/strava', syncActivities);
    app.use('/strava', kpisRoute);
    app.use('/strava', stravaAuthRoute);
    app.use('/api/analysis', analysisRoutes);
    app.use('/api/export', exportRoute);
    app.use('/api/admin', refetch);
    app.use('/strava', fetchSingleActivityRoute);

    // Health check route
    app.get('/health', (req, res) => {
      const isConnected = mongoose.connection.readyState === 1;
      res.status(isConnected ? 200 : 500).json({ dbConnected: isConnected });
    });

    app.get('/', (req, res) => {
      res.send('EasyAthlete API is running ✅');
    });

    app.listen(PORT, () => {
      console.log(`✅ EasyAthlete API running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

startServer();
