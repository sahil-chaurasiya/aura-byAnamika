const mongoose = require('mongoose');
const slugify = require('slugify');

const variantSchema = new mongoose.Schema({
  size: String,
  color: String,
  colorHex: String,
  sku: String,
  price: Number,
  salePrice: Number,
  stock: { type: Number, default: 0 },
  image: String,
});

// A product's categories are picked from the storefront Navigation Menu
// tree (Admin > Navigation Menu), not a separate flat category list --
// so what a shopper sees in the nav and what a product is tagged with are
// always the same real categories/sub-categories. `label` is the exact
// category or sub-category label picked (e.g. "Silk Sarees" or "Sarees"),
// `group` is the top-level menu item it lives under (e.g. "Women") so we
// can also filter/link by the broader group. A product may have several.
const productCategorySchema = new mongoose.Schema({
  label: { type: String, required: true },
  group: { type: String, required: true },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true },
  slug: { type: String, unique: true },
  description: { type: String, required: [true, 'Product description is required'] },
  shortDescription: String,
  categories: {
    type: [productCategorySchema],
    required: true,
    validate: { validator: v => Array.isArray(v) && v.length > 0, message: 'Select at least one category' },
  },
  tags: [String],

  // Pricing
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  salePrice: { type: Number, default: null },
  discountPercent: { type: Number, default: 0 },

  // Images
  images: [{ url: String, publicId: String, alt: String }],
  thumbnail: { type: String, default: '' },

  // Inventory
  sku: { type: String, unique: true, sparse: true },
  stock: { type: Number, default: 0 },
  trackInventory: { type: Boolean, default: true },
  allowBackorder: { type: Boolean, default: false },

  // Variants
  hasVariants: { type: Boolean, default: false },
  variants: [variantSchema],
  sizes: [String],
  colors: [{ name: String, hex: String }],

  // Status
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isOnSale: { type: Boolean, default: false },

  // Ratings
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },

  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
  },

  // Shipping
  weight: Number,
  dimensions: { length: Number, width: Number, height: Number },

  soldCount: { type: Number, default: 0 },
}, { timestamps: true, toJSON: { virtuals: true } });

productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

productSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  if (this.price && this.salePrice) {
    this.discountPercent = Math.round(((this.price - this.salePrice) / this.price) * 100);
    this.isOnSale = this.salePrice < this.price;
  }
  next();
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ 'categories.label': 1, isActive: 1 });
productSchema.index({ 'categories.group': 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });

module.exports = mongoose.model('Product', productSchema);