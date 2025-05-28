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
    const userId = req.body?.userId || 'anon';

    // Detect file type or origin based on request path, headers, or filename
    // For now, assume this config is for .fit file uploads only
    return {
      folder: `fit-files/${userId}/fit-files`,
      resource_type: 'raw',
      format: 'fit'
    };
  }
});

module.exports = { cloudinary, storage };
