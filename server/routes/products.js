const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, admin } = require('../middleware/auth');
const { uploadProductImage } = require('../middleware/upload');
const {
  getProducts, getProduct, getRelatedProducts, createProduct,
  updateProduct, deleteProduct, uploadProductImages, getAdminProducts, getProductStats
} = require('../controllers/productController');

// Wraps multer so oversized/invalid files return a clean JSON error
// instead of crashing to an unhandled 500 with a stack trace.
const handleProductImageUpload = (req, res, next) => {
  uploadProductImage.array('images', 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'One of your images is too large. Please upload files under 30MB each.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

router.get('/', getProducts);
router.get('/admin/list', protect, admin, getAdminProducts);
router.get('/admin/stats', protect, admin, getProductStats);
router.post('/', protect, admin, createProduct);
router.get('/:slug', getProduct);
router.get('/:id/related', getRelatedProducts);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/images', protect, admin, handleProductImageUpload, uploadProductImages);

module.exports = router;