const Product = require('../models/Product');
const sharp = require('sharp');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

// Escape a string for safe use inside a RegExp (category labels/groups can
// contain characters like & or ( ) e.g. "Kurtas & Kurtis").
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Helper: apply filters
const buildFilter = (query) => {
  const filter = { isActive: true };
  if (query.category) {
    // A single ?category= value can be either a top-level menu group
    // (e.g. "Women") or a specific category/sub-category label
    // (e.g. "Silk Sarees") -- match either, case-insensitively.
    const re = new RegExp(`^${escapeRegex(query.category)}$`, 'i');
    filter.$or = [{ 'categories.label': re }, { 'categories.group': re }];
  }
  if (query.search) filter.$text = { $search: query.search };
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }
  if (query.rating) filter.ratings = { $gte: Number(query.rating) };
  if (query.featured === 'true') filter.isFeatured = true;
  if (query.newArrival === 'true') filter.isNewArrival = true;
  if (query.bestSeller === 'true') filter.isBestSeller = true;
  if (query.onSale === 'true') filter.isOnSale = true;
  if (query.sizes) filter.sizes = { $in: query.sizes.split(',') };
  if (query.tags) filter.tags = { $in: query.tags.split(',') };
  return filter;
};

// @desc   Get all products
// @route  GET /api/products
const getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    popular: { soldCount: -1 },
    rating: { ratings: -1 },
    name: { name: 1 },
  };
  const sort = sortMap[req.query.sort] || { createdAt: -1 };
  const filter = buildFilter(req.query);

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

// @desc   Get single product by slug or id
// @route  GET /api/products/:slug
const getProduct = async (req, res) => {
  const { slug } = req.params;
  const query = slug.match(/^[0-9a-fA-F]{24}$/) ? { _id: slug } : { slug };
  const product = await Product.findOne(query);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
};

// @desc   Get related products
// @route  GET /api/products/:id/related
const getRelatedProducts = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  const labels = (product.categories || []).map(c => c.label);
  const related = await Product.find({
    'categories.label': { $in: labels },
    _id: { $ne: product._id },
    isActive: true,
  }).limit(8).lean();
  res.json({ success: true, data: related });
};

// @desc   Create product (admin)
// @route  POST /api/products
const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
};

// @desc   Update product (admin)
// @route  PUT /api/products/:id
const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
};

// @desc   Delete product (admin)
// @route  DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  // Delete images from cloudinary
  for (const img of product.images) {
    if (img.publicId) await deleteFromCloudinary(img.publicId);
  }
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
};

// @desc   Upload product images
// @route  POST /api/products/:id/images
const uploadProductImages = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  // Process files in small concurrent batches rather than all at once or
  // fully sequential. Render's free tier has very little CPU and only
  // 512MB RAM — decoding + resizing several full-size images simultaneously
  // can spike memory enough to get the process killed mid-request (which
  // looked like random/partial upload failures), while doing them one at a
  // time was slow enough to blow past the client's timeout. Small batches
  // give a middle ground that's safe on constrained hosting.
  const BATCH_SIZE = 3;
  const uploadedImages = [];
  for (let i = 0; i < req.files.length; i += BATCH_SIZE) {
    const batch = req.files.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(async (file) => {
      // .rotate() with no args reads the EXIF orientation tag (set by phone
      // cameras held sideways/upside down) and bakes it into the actual pixels
      // before we resize/compress — otherwise that tag gets lost and the
      // image displays rotated everywhere except where EXIF is respected.
      const optimizedBuffer = await sharp(file.buffer)
        .rotate()
        .resize({ width: 2000, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      const result = await uploadToCloudinary(optimizedBuffer, 'products');
      return { url: result.secure_url, publicId: result.public_id, alt: product.name };
    }));
    uploadedImages.push(...results);
  }

  product.images.push(...uploadedImages);
  if (!product.thumbnail && uploadedImages.length > 0) {
    product.thumbnail = uploadedImages[0].url;
  }
  await product.save();
  res.json({ success: true, data: product.images });
};

// @desc   Get admin product list
// @route  GET /api/products/admin/list
const getAdminProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.search) filter.$text = { $search: req.query.search };
  if (req.query.category) {
    const re = new RegExp(`^${escapeRegex(req.query.category)}$`, 'i');
    filter.$or = [{ 'categories.label': re }, { 'categories.group': re }];
  }
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'inactive') filter.isActive = false;

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  res.json({ success: true, data: products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

// @desc   Get product stats (admin)
const getProductStats = async (req, res) => {
  const stats = await Product.aggregate([
    { $group: { _id: null, total: { $sum: 1 }, active: { $sum: { $cond: ['$isActive', 1, 0] } }, outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } }, avgPrice: { $avg: '$price' } } },
  ]);
  res.json({ success: true, data: stats[0] || {} });
};

module.exports = { getProducts, getProduct, getRelatedProducts, createProduct, updateProduct, deleteProduct, uploadProductImages, getAdminProducts, getProductStats };