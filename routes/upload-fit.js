const express = require('express');
const multer = require('multer');
const { storage } = require('../utils/cloudinary'); // Use cloud-based storage

const router = express.Router();

// Multer now stores multiple files directly in Cloudinary
const upload = multer({ storage });

router.post('/upload-fit', upload.array('fitFiles', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const uploadedFiles = req.files.map(file => ({
    originalName: file.originalname,
    url: file.path,
    publicId: file.filename,
    size: file.size
  }));

  console.log('✅ Uploaded multiple .fit files to Cloudinary:', uploadedFiles);

  res.status(200).json({
    message: 'Files uploaded successfully to Cloudinary',
    files: uploadedFiles
  });
});

module.exports = router;
