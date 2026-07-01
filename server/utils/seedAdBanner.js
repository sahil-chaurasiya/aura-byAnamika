/**
 * Standalone seed script that updates the existing `ad`-type Banner
 * document in the database.
 *
 * Why this is needed: AdSection.jsx fetches /banners?type=ad and, when a
 * banner exists, uses ITS title/subtitle/buttonText/buttonLink/image
 * instead of the component's hardcoded defaults (that's intentional —
 * it's what makes the banner admin-editable). Your database already has
 * an `ad` banner from the original seed.js ("Limited Time Offer" / "Shop
 * Now" / the leather jacket photo), so that's what keeps showing up no
 * matter what defaults are changed in the component. This script updates
 * that same document in place (matched by type: 'ad') so the storefront
 * shows the new copy + image immediately.
 *
 * Run with:   node utils/seedAdBanner.js   (from /server)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Banner = require('../models/Banner');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/glamics';

const newAdBanner = {
  title: 'Get 30% Discount On All Hudis!',
  subtitle: 'Trending Products',
  buttonText: 'Check Discount',
  buttonLink: '/shop',
  image: 'https://images.unsplash.com/photo-1638456266087-09b1d160748b?w=700&h=900&fit=crop&crop=faces&q=80&auto=format',
  type: 'ad',
  isActive: true,
  order: 0,
};

const run = async () => {
  console.log('🔌 Connecting using MONGO_URI:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Update the first existing ad banner in place, or create one if none exists.
  const result = await Banner.findOneAndUpdate(
    { type: 'ad' },
    { $set: newAdBanner },
    { new: true, upsert: true }
  );

  console.log(`✏️  Ad banner updated: "${result.title}" / "${result.subtitle}" / "${result.buttonText}"`);
  console.log('\n✅ Done. Refresh the homepage — the Ad section will now show the new copy and image.');
  process.exit(0);
};

run().catch(err => {
  console.error('❌ Ad banner update failed:', err);
  process.exit(1);
});