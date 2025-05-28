const express = require('express');
const multer = require('multer');
const { storage } = require('../utils/cloudinary'); // Use cloud-based storage

const router = express.Router();

// Multer now stores files directly in Cloudinary
const upload = multer({ storage });

router.post('/upload-fit', upload.single('fitFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log('✅ Uploaded .fit file to Cloudinary:', req.file.path);

  res.status(200).json({
    message: 'File uploaded successfully to Cloudinary',
    fileUrl: req.file.path,
    publicId: req.file.filename,
    raw: req.file
  });
});

module.exports = router;
