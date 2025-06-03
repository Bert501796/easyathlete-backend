const express = require('express');
const OnboardingResponse = require('../models/OnboardingResponse');

const router = express.Router();

router.post('/upload-onboarding', async (req, res) => {
  try {
    const { userId, onboardingData } = req.body;

    if (!userId || !onboardingData) {
      return res.status(400).json({ error: 'Missing userId or onboardingData' });
    }

    await OnboardingResponse.create({
      userId,
      data: onboardingData
    });

    res.status(200).json({
      message: '✅ Onboarding data stored in MongoDB'
    });
  } catch (error) {
    console.error('❌ Onboarding DB error:', error);
    res.status(500).json({ error: 'Failed to store onboarding data' });
  }
});

module.exports = router;
