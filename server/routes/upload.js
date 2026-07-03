const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { upload, uploadVideo, uploadToCloudinary, uploadVideoToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

// Single image upload
router.post('/image', protect, admin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const folder = req.body.folder || 'general';
  const result = await uploadToCloudinary(req.file.buffer, folder, { quality: 'auto', fetch_format: 'auto' });
  res.json({ success: true, data: { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height } });
});

// Single video upload (e.g. homepage "Our Videos" reel marquee)
router.post('/video', protect, admin, uploadVideo.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const folder = req.body.folder || 'general';
  try {
    const result = await uploadVideoToCloudinary(req.file.buffer, folder, { quality: 'auto' });
    res.json({ success: true, data: { url: result.secure_url, publicId: result.public_id, duration: result.duration } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Video upload failed' });
  }
});

// Multiple images upload
router.post('/images', protect, admin, upload.array('images', 20), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: 'No files uploaded' });
  const folder = req.body.folder || 'general';
  const results = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer, folder, { quality: 'auto', fetch_format: 'auto' })));
  res.json({ success: true, data: results.map(r => ({ url: r.secure_url, publicId: r.public_id })) });
});

// Delete image or video (pass resourceType: 'video' for videos)
router.delete('/image', protect, admin, async (req, res) => {
  const { publicId, resourceType } = req.body;
  if (!publicId) return res.status(400).json({ success: false, message: 'publicId required' });
  await deleteFromCloudinary(publicId, resourceType || 'image');
  res.json({ success: true, message: 'File deleted' });
});

module.exports = router;