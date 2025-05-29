const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { storage, cloudinary } = require('../utils/cloudinary');
const { parseFitFile } = require('../utils/parseFit');

const router = express.Router();
const upload = multer({ storage });

router.post('/upload-fit', upload.array('fitFiles', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const userId = req.query.userId || 'anon';

  const parsedSummaries = [];

  for (const file of req.files) {
    try {
      const localTmpPath = file.path; // this is where the file was saved
      const summary = await parseFitFile(localTmpPath);
      parsedSummaries.push(...summary); // flatten all session results
    } catch (err) {
      console.error(`❌ Error parsing ${file.originalname}:`, err.message);
    }
  }

  // Save summary JSON to temp file
  const tmpDir = path.join(__dirname, '../tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  const summaryPath = path.join(tmpDir, `${userId}-activity-summary.json`);
  fs.writeFileSync(summaryPath, JSON.stringify(parsedSummaries, null, 2));

  // Upload JSON to Cloudinary
  const result = await cloudinary.uploader.upload(summaryPath, {
    folder: `fit-files/${userId}`,
    resource_type: 'raw',
    public_id: 'activity-summary',
    overwrite: true
  });

  fs.unlinkSync(summaryPath); // cleanup

  console.log('📦 Uploaded activity summary to Cloudinary:', result.secure_url);

  res.status(200).json({
    message: 'Files uploaded and activity summary created',
    summaryUrl: result.secure_url,
    summary: parsedSummaries
  });
});

module.exports = router;
