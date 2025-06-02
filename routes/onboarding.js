const express = require('express');
const { cloudinary } = require('../utils/cloudinary');
const streamifier = require('streamifier');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.post('/upload-onboarding', async (req, res) => {
  try {
    const { userId, onboardingData } = req.body;

    if (!userId || !onboardingData) {
      return res.status(400).json({ error: 'Missing userId or onboardingData' });
    }

    // Create a readable buffer from the JSON
    const jsonBuffer = Buffer.from(JSON.stringify(onboardingData, null, 2));

    // Set folder and filename (public_id)
    const folder = `easyathlete/${userId}/onboarding`;
    const publicId = `onboarding_${uuidv4()}`;

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder,          // ✅ Proper folder structure
          public_id,       // ✅ Unique file name
          format: 'json',
          overwrite: false
        },
        (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        }
      );

      streamifier.createReadStream(jsonBuffer).pipe(uploadStream);
    });

    res.status(200).json({
      message: '✅ Onboarding data uploaded successfully',
      url: result.secure_url
    });
  } catch (error) {
    console.error('❌ Onboarding upload error:', error);
    res.status(500).json({ error: 'Failed to upload onboarding data' });
  }
});

module.exports = router;
