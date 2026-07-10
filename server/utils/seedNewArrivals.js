// Adds ONLY the 12 new products below. Never deletes or touches existing data.
// Run: node utils/seedNewArrivals.js
// Categories use {label, group} exactly like the admin "Add Product" checkbox
// picker (pulled from Navigation Menu), NOT the old flat Category model.
//
// Images are left empty on purpose — upload them manually in the admin
// product editor after this runs (Images tab).
//
// Names are kept dead simple (just a colour + basic word) on purpose, and
// each product has a comment right above it listing the EXACT photo
// filenames that belong to that product, so you can match photo -> product
// without needing to know any fashion terms.

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/glamics';

const products = [
  // Photo for this product: DSC_0689.JPG
  {
    name: 'Light Green Floral Gown',
    shortDescription: 'Light green gown with gold floral embroidery and an off-shoulder draped neckline.',
    description: 'Soft light green tulle gown covered in gold floral embroidery, with a draped off-shoulder neckline and a full flared skirt.',
    categories: [{ label: 'Evening Gowns', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['light green', 'floral', 'gown', 'off shoulder'],
    price: 3799, sku: 'AURA-GWN-014', stock: 8, weight: 0.6,
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Light Green', hex: '#9BBF6B' }],
    isActive: true, isNewArrival: true, isFeatured: true,
  },

  // Photo for this product: DSC_0760.JPG
  {
    name: 'Mauve Pink Embroidered Set',
    shortDescription: 'Mauve pink flowy set with gold star embroidery and a matching dupatta.',
    description: 'Mauve pink flowy dress with all-over gold star embroidery, puffed long sleeves, and a matching draped dupatta.',
    categories: [{ label: 'Anarkali Sets', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['mauve', 'pink', 'embroidered', 'dupatta'],
    price: 3299, sku: 'AURA-GWN-015', stock: 10, weight: 0.55,
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Mauve Pink', hex: '#9C6B72' }],
    isActive: true, isNewArrival: true,
  },

  // Photo for this product: DSC_0790.JPG
  {
    name: 'Multicolor Patchwork Dress',
    shortDescription: 'Colourful patchwork dress mixing pink, teal, gold, and navy panels with gold prints.',
    description: 'Bold patchwork dress made from mixed colour panels — pink, teal, gold, and navy — each with its own gold paisley/floral print, and full sleeves.',
    categories: [{ label: 'Fusion Wear', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['multicolor', 'patchwork', 'dress'],
    price: 2899, sku: 'AURA-GWN-016', stock: 10, weight: 0.5,
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Multicolor', hex: '#B0468C' }],
    isActive: true, isNewArrival: true,
  },

  // Photo for this product: DSC_0831.JPG
  {
    name: 'Blush Pink Sequin Gown',
    shortDescription: 'Blush pink sleeveless gown covered in shiny sequins with a halter neck.',
    description: 'Blush pink sleeveless gown with a halter neckline, all-over shiny sequin wave pattern, and a flowing floor-length skirt.',
    categories: [{ label: 'Evening Gowns', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['blush pink', 'sequin', 'gown', 'halter neck'],
    price: 3999, sku: 'AURA-GWN-017', stock: 8, weight: 0.6,
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Blush Pink', hex: '#C9A2A0' }],
    isActive: true, isNewArrival: true, isFeatured: true,
  },

  // Photos for this product: DSC_0453.JPG, DSC_0436.JPG
  {
    name: 'Purple Silver Embroidered Dress',
    shortDescription: 'Purple dress with silver floral embroidery all over and a wrap-style neckline.',
    description: 'Rich purple dress with dense silver floral vine embroidery across the skirt, long sleeves with matching floral motifs, and a wrap-style V-neck bodice.',
    categories: [{ label: 'Evening Gowns', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['purple', 'silver embroidery', 'dress'],
    price: 3599, sku: 'AURA-GWN-018', stock: 8, weight: 0.6,
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Purple', hex: '#4A1E4A' }],
    isActive: true, isNewArrival: true,
  },

  // Photo for this product: DSC_0556.JPG
  {
    name: 'Steel Blue Sequin Gown',
    shortDescription: 'Steel blue gown with a golden circular floral sequin pattern all over.',
    description: 'Steel blue gown covered in a golden circular floral sequin pattern, with sheer long sleeves and a full flared skirt.',
    categories: [{ label: 'Evening Gowns', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['steel blue', 'sequin', 'gown'],
    price: 3699, sku: 'AURA-GWN-019', stock: 8, weight: 0.6,
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Steel Blue', hex: '#7C97A0' }],
    isActive: true, isNewArrival: true,
  },

  // Photo for this product: DSC_0616.JPG
  {
    name: 'Maroon Paisley Pleated Dress',
    shortDescription: 'Maroon paisley print dress with a satin pleated panel down one side.',
    description: 'Maroon dress with an all-over teal-gold paisley print, a plain satin bodice panel, and a pleated satin panel flowing down one side of the skirt.',
    categories: [{ label: 'Party Dresses', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['maroon', 'paisley', 'pleated', 'dress'],
    price: 2999, sku: 'AURA-GWN-020', stock: 10, weight: 0.5,
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Maroon', hex: '#6B1E2E' }],
    isActive: true, isNewArrival: true,
  },

  // Photo for this product: DSC_0151.JPG
  {
    name: 'Red Block Print Kurta',
    shortDescription: 'Red kurta with a cream paisley yoke and cream floral block print.',
    description: 'Cotton kurta in red with a cream paisley-print yoke, cream floral block print on the body, and matching cuffs.',
    categories: [{ label: 'Printed Kurtis', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['red', 'block print', 'kurta'],
    price: 1599, sku: 'AURA-GWN-021', stock: 15, weight: 0.3,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: [{ name: 'Red', hex: '#8C2F32' }],
    isActive: true, isNewArrival: true,
  },

  // Photo for this product: DSC_0209.JPG
  {
    name: 'Black Cream Leaf Print Top',
    shortDescription: 'Black leaf-print top with a cream side panel and V neckline.',
    description: 'Short black cotton top with an all-over cream leaf block print, styled with one contrasting cream front panel and a V neckline.',
    categories: [{ label: 'Tops', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['black', 'cream', 'leaf print', 'top'],
    price: 1199, sku: 'AURA-GWN-022', stock: 15, weight: 0.22,
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Black Cream', hex: '#2B2B2B' }],
    isActive: true, isNewArrival: true,
  },

  // Photo for this product: DSC_0285.JPG
  {
    name: 'Cream Leaf Print Kurta',
    shortDescription: 'Cream kurta with a black leaf block print and a square bordered neckline.',
    description: 'Cotton kurta in cream with an all-over black leaf block print and a square neckline finished with a bold black border.',
    categories: [{ label: 'Printed Kurtis', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['cream', 'leaf print', 'kurta'],
    price: 1499, sku: 'AURA-GWN-023', stock: 15, weight: 0.28,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: [{ name: 'Cream', hex: '#EDE6D6' }],
    isActive: true, isNewArrival: true,
  },

  // Photo for this product: DSC_0368.JPG
  {
    name: 'Navy Blue Sequin Gown',
    shortDescription: 'Navy blue sleeveless gown with a golden circular floral sequin pattern and a front slit.',
    description: 'Navy blue sleeveless gown covered in a golden circular floral sequin pattern, with a fitted silhouette and a front slit.',
    categories: [{ label: 'Evening Gowns', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['navy blue', 'sequin', 'gown', 'front slit'],
    price: 3699, sku: 'AURA-GWN-024', stock: 8, weight: 0.55,
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Navy Blue', hex: '#1B2A4A' }],
    isActive: true, isNewArrival: true,
  },

  // Photo for this product: DSC_9902.JPG
  {
    name: 'Navy Block Print Kurta',
    shortDescription: 'Navy kurta with a cream paisley print and a matching draped dupatta.',
    description: 'Straight-fit navy kurta with a cream paisley block print, cream embroidered neckline trim, and a matching cream dupatta.',
    categories: [{ label: 'Printed Kurtis', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['navy', 'block print', 'kurta', 'dupatta'],
    price: 1899, sku: 'AURA-GWN-025', stock: 12, weight: 0.32,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: [{ name: 'Navy', hex: '#232B3E' }],
    isActive: true, isNewArrival: true,
  },
];

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  let created = 0, skipped = 0;
  for (const p of products) {
    const exists = await Product.findOne({ sku: p.sku });
    if (exists) {
      console.log(`⏭️  Skipped (already exists): ${p.name} [${p.sku}]`);
      skipped++;
      continue;
    }
    await Product.create(p);
    console.log(`🆕 Created: ${p.name} [${p.sku}]`);
    created++;
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped. No existing data was touched.`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});