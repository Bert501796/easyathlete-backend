const express = require('express');
const router = express.Router();
const { cloudinary } = require('../../utils/cloudinary');

router.get('/latest-strava-url/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const folder = `easyathlete/${userId}/strava`;

    // Search for raw files in that folder with name containing "strava_insights"
    const searchResult = await cloudinary.search
      .expression(`resource_type:raw AND folder:${folder} AND filename:strava_insights`)
      .sort_by('created_at', 'desc')
      .max_results(1)
      .execute();

    const file = searchResult.resources[0];

    if (!file) {
      return res.status(404).json({ error: 'No strava_insights file found for user' });
    }

    return res.json({ url: file.secure_url });
  } catch (error) {
    console.error('❌ Cloudinary search failed:', error);
    return res.status(500).json({ error: 'Failed to retrieve latest insights file' });
  }
});

module.exports = router;
