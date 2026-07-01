/**
 * Standalone seed script that renames the existing category display
 * names so they match the storefront navbar labels (see utils/seedMenu.js).
 *
 * This ONLY updates the `name` field on each category, matched by its
 * existing `slug`. It deliberately does NOT touch:
 *   - image / imagePublicId  (keeps the current pictures)
 *   - slug                   (keeps existing /shop?category=... links,
 *                             including the hardcoded ones in Footer.jsx,
 *                             working exactly as before)
 *   - order / isFeatured / isActive
 *   - any product <-> category references (those are by _id, unaffected)
 *
 * Run with:   npm run seed:category-names   (from /server, if you add
 *             the script to package.json)
 * or:         node utils/seedCategoryNames.js
 */
const path = require('path');
// Resolve .env relative to THIS file's location (server/.env), not the
// current working directory -- avoids silently connecting to the wrong
// database when the script is run from a different folder.
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/glamics';

// slug -> new display name (mapped to the navbar's top-level labels)
const renames = [
  { slug: 'womens-fashion', name: 'Women' },
  { slug: 'mens-fashion', name: 'New Arrivals' },
  { slug: 'accessories', name: 'Accessories' },
  { slug: 'bags', name: 'Collections' },
  { slug: 'footwear', name: 'Ready to Ship' },
  { slug: 'jewelry', name: 'Sale' },
  { slug: 'sportswear', name: 'Custom Services' },
];

const run = async () => {
  console.log('🔌 Connecting using MONGO_URI:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  for (const { slug, name } of renames) {
    // findOneAndUpdate (not .save()) intentionally skips the
    // pre('save') slugify hook, so the slug is left untouched.
    const result = await Category.findOneAndUpdate(
      { slug },
      { $set: { name } },
      { new: true }
    );
    if (result) {
      console.log(`✏️  [${slug}] name → "${name}"`);
    } else {
      console.warn(`⚠️  No category found with slug "${slug}" — skipped`);
    }
  }

  console.log('\n✅ Category names updated to match the navbar labels (images, slugs & order untouched).');
  process.exit(0);
};

run().catch(err => {
  console.error('❌ Category rename failed:', err);
  process.exit(1);
});