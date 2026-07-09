const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Memory storage for Cloudinary upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Product images only: capped at 30MB on the way in. Real compression
// happens after upload via sharp, so this limit just guards against
// truly oversized files (e.g. someone uploading a RAW photo by mistake).
const uploadProductImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
});

// Video uploads (e.g. the homepage "Our Videos" reel marquee) need their
// own filter + a much higher size ceiling than photos.
const videoFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed'), false);
  }
};

const uploadVideo = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
});

const uploadToCloudinary = async (buffer, folder = 'glamics', options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: `glamics/${folder}`, ...options },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

const uploadVideoToCloudinary = async (buffer, folder = 'glamics', options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: `glamics/${folder}`, resource_type: 'video', ...options },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

module.exports = { upload, uploadProductImage, uploadVideo, uploadToCloudinary, uploadVideoToCloudinary, deleteFromCloudinary };