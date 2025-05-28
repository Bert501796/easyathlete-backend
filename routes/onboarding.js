const express = require('express');
const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../utils/cloudinary');

const router = express.Router();

router.post('/upload-onboarding', async (req, res) => {
  try {
    const { userId, onboardingData } = req.body;

    if (!userId || !onboardingData) {
      return res.status(400).json({ error: 'Missing userId or onboardingData' });
    }

    const tempPath = path.join(__dirname, `../tmp/${userId}-onboarding.json`);
    fs.writeFileSync(tempPath, JSON.stringify(onboardingData));

    const result = await cloudinary.uploader.upload(tempPath, {
      folder: `fit-files/${userId}`,
      resource_type: 'raw',
      public_id: 'onboarding',
      overwrite: true,
    });

    fs.unlinkSync(tempPath);

    res.status(200).json({ message: 'Onboarding data uploaded', url: result.secure_url });
  } catch (error) {
    console.error('Onboarding upload error:', error);
    res.status(500).json({ error: 'Failed to upload onboarding data' });
  }
});

module.exports = router;
