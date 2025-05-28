const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'fit-files', // 👈 your Cloudinary folder name
    resource_type: 'raw', // important for .fit files
    format: 'fit', // optional: preserve extension
  }
});

module.exports = { cloudinary, storage };
