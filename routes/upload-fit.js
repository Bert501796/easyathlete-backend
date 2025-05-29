const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Use dynamic import to support node-fetch in CommonJS
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const { storage, cloudinary } = require('../utils/cloudinary');
const { parseFitFile } = require('../utils/parseFit');

const router = express.Router();
const upload = multer({ storage });

// Ensures full directory path exists before saving file
const ensureDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const downloadFileToTemp = async (userId, filename, url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download ${url}`);
  const buffer = await response.arrayBuffer();

  const tmpFolder = path.join(__dirname, `../tmp/fit-files/${userId}/fit-files`);
  ensureDirectory(tmpFolder);

  const filePath = path.join(tmpFolder, filename);
  fs.writeFileSync(filePath, Buffer.from(buffer));
  return filePath;
};

router.post('/upload-fit', upload.array('fitFiles', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const userId = req.query.userId || 'anon';
  const parsedSummaries = [];

  for (const file of req.files) {
    try {
      const publicId = file.filename.replace(/\.[^/.]+$/, '');
      const cloudinaryUrl = file.path;

      const localPath = await downloadFileToTemp(userId, `${publicId}.fit`, cloudinaryUrl);
      console.log(`📥 Downloaded to ${localPath}, parsing...`);

      const summary = await parseFitFile(localPath);
      parsedSummaries.push(...summary);

      fs.unlinkSync(localPath);
    } catch (err) {
      console.error(`❌ Error parsing ${file.originalname}:`, err.message);
    }
  }

  const tmpDir = path.join(__dirname, '../tmp');
  ensureDirectory(tmpDir);
  const summaryPath = path.join(tmpDir, `${userId}-activity-summary.json`);
  fs.writeFileSync(summaryPath, JSON.stringify(parsedSummaries, null, 2));

  const result = await cloudinary.uploader.upload(summaryPath, {
    folder: `fit-files/${userId}`,
    resource_type: 'raw',
    public_id: 'activity-summary',
    overwrite: true
  });

  fs.unlinkSync(summaryPath);

  console.log('📦 Uploaded activity summary to Cloudinary:', result.secure_url);

  res.status(200).json({
    message: 'Files uploaded and activity summary created',
    summaryUrl: result.secure_url,
    summary: parsedSummaries
  });
});

module.exports = router;
