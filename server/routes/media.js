const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { Media } = require('../models/index');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

router.get('/', protect, admin, async (req, res) => {
  const folder = req.query.folder || '';
  const filter = folder ? { folder } : {};
  const media = await Media.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: media });
});

router.post('/upload', protect, admin, upload.array('files', 20), async (req, res) => {
  const folder = req.body.folder || 'general';
  // Small concurrent batches rather than all-at-once — safer on low-memory
  // hosting (see productController.js uploadProductImages for details).
  const BATCH_SIZE = 3;
  const uploaded = [];
  for (let i = 0; i < req.files.length; i += BATCH_SIZE) {
    const batch = req.files.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(async (file) => {
      const result = await uploadToCloudinary(file.buffer, folder, {
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
      });
      return Media.create({
        name: file.originalname.replace(/\.[^/.]+$/, ''),
        originalName: file.originalname,
        url: result.secure_url,
        publicId: result.public_id,
        type: 'image',
        mimeType: file.mimetype,
        size: file.size,
        width: result.width,
        height: result.height,
        folder,
        uploadedBy: req.user._id,
      });
    }));
    uploaded.push(...results);
  }
  res.status(201).json({ success: true, data: uploaded });
});

router.put('/:id', protect, admin, async (req, res) => {
  const media = await Media.findByIdAndUpdate(req.params.id, { alt: req.body.alt, name: req.body.name }, { new: true });
  res.json({ success: true, data: media });
});

router.delete('/:id', protect, admin, async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) return res.status(404).json({ success: false, message: 'Media not found' });
  if (media.publicId) await deleteFromCloudinary(media.publicId);
  await media.deleteOne();
  res.json({ success: true, message: 'Media deleted' });
});

module.exports = router;