/**
 * ONE-TIME, NON-DESTRUCTIVE migration for real/live data.
 *
 * This does NOT delete or recreate anything (unlike seed.js). It only
 * ADDS the new `categories` array to products that don't have one yet,
 * by reading their old `category` reference (from before the Product
 * model changed from a single Category ref to a multi-select
 * categories array) and converting it.
 *
 * Safe to run multiple times -- it only touches products where
 * `categories` is missing or empty, and never touches the old
 * `category` field or deletes it.
 *
 * What it does NOT do:
 *   - does not delete any products, categories, or the old `category`
 *     field left over on each document
 *   - does not touch products that already have a `categories` array
 *   - does not touch orders, users, or anything else
 *
 * Run with:   node utils/migrateProductCategories.js
 *
 * After running, go through the migrated products once in the admin
 * panel's new category picker (Products > Edit > Categories) to pick
 * the real, specific categories/sub-categories from your Navigation
 * Menu -- this script only gives each product a starting label based
 * on its old flat category name, since it has no way to know which
 * exact sub-category (e.g. "Silk Sarees" vs "Banarasi Sarees") each
 * product should really belong to.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/glamics';

const run = async () => {
  console.log('🔌 Connecting using MONGO_URI:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Use the raw driver (not the Product model) to read the old `category`
  // field -- it's no longer declared in the Product schema, so the
  // Mongoose model can't reliably read it back on old documents.
  const db = mongoose.connection.db;
  const productsCol = db.collection('products');
  const categoriesCol = db.collection('categories');

  // Build a map of old Category _id -> name
  const categoryDocs = await categoriesCol.find({}).toArray();
  const categoryNameById = {};
  categoryDocs.forEach(c => { categoryNameById[c._id.toString()] = c.name; });
  console.log(`📚 Loaded ${categoryDocs.length} legacy categories for lookup`);

  // Find products that have an old `category` ref but no new
  // `categories` array yet (or an empty one).
  const candidates = await productsCol.find({
    category: { $exists: true, $ne: null },
    $or: [{ categories: { $exists: false } }, { categories: { $size: 0 } }],
  }).toArray();

  console.log(`🔍 Found ${candidates.length} product(s) needing migration`);
  if (candidates.length === 0) {
    console.log('✅ Nothing to migrate. Every product already has a categories array.');
    process.exit(0);
  }

  let migrated = 0;
  let skipped = 0;

  for (const p of candidates) {
    const categoryName = categoryNameById[p.category?.toString()];
    if (!categoryName) {
      console.warn(`⚠️  Skipping "${p.name}" — its old category reference no longer exists`);
      skipped++;
      continue;
    }
    // Best-effort starting point: use the old flat category name as both
    // the label and the group. You'll want to refine this per-product in
    // the admin picker to point at a real sub-category where relevant.
    await productsCol.updateOne(
      { _id: p._id },
      { $set: { categories: [{ label: categoryName, group: categoryName }] } }
    );
    console.log(`✏️  "${p.name}" → categories: [{ label: "${categoryName}", group: "${categoryName}" }]`);
    migrated++;
  }

  console.log(`\n✅ Done. Migrated ${migrated} product(s), skipped ${skipped}.`);
  console.log('   Nothing was deleted. Old `category` field left in place on each document, unused.');
  console.log('   Next: open each migrated product in the admin panel and pick its real category/sub-category from the new picker.');
  process.exit(0);
};

run().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});