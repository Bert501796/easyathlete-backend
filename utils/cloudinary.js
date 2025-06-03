const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const userId = req.query?.userId || 'anon'; // Still okay for fallback
    return {
      folder: `easyathlete/${userId}/fit-files`, // ✅ Updated to match new user-based structure
      resource_type: 'raw',
      format: 'fit'
    };
  }
});

module.exports = { cloudinary, storage };
