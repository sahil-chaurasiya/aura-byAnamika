const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { HomepageSection } = require('../models/index');

const DEFAULT_SECTIONS = [
  { key: 'hero', label: 'Hero Slider', isEnabled: true, order: 0, config: { title: 'Summer Collection', subtitle: 'New Arrivals' } },
  { key: 'categories', label: 'Featured Categories', isEnabled: true, order: 1, config: { title: 'Shop by Category', subtitle: 'Collections' } },
  { key: 'products', label: 'Featured Products', isEnabled: true, order: 2, config: { title: 'Shopping Every Day', subtitle: 'Summer collection', tabLabels: ['All', 'Men', 'Women', 'Accessories'] } },
  { key: 'ad', label: 'Advertisement Banner', isEnabled: true, order: 3, config: { title: 'Get 30% Discount On All Hudis!', subtitle: 'LIMITED TIME OFFER', buttonText: 'Shop Now', buttonLink: '/shop' } },
  { key: 'mostSelling', label: 'Most Selling Products', isEnabled: true, order: 4, config: { title: 'Top selling Categories This Week', subtitle: 'most selling items' } },
  { key: 'video', label: 'Video Section', isEnabled: true, order: 5, config: { videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Our Story' } },
  { key: 'subBanners', label: 'Sub Banners', isEnabled: true, order: 6, config: {} },
  { key: 'flashSale', label: 'Flash Sale', isEnabled: true, order: 7, config: { title: 'Trending Flash Sell', subtitle: 'New Collection' } },
  { key: 'reviews', label: 'Customer Reviews', isEnabled: true, order: 8, config: { title: 'Product Reviews', subtitle: 'Customer Reviews' } },
  { key: 'newsletter', label: 'Newsletter Subscription', isEnabled: true, order: 9, config: {} },
  { key: 'blog', label: 'Blog Section', isEnabled: true, order: 10, config: { title: 'Explore Our Blogs', subtitle: 'News & Blog' } },
  { key: 'gallery', label: 'Instagram Gallery', isEnabled: true, order: 11, config: { title: 'Follow Us @aura_by_anamika' } },
];

router.get('/', async (req, res) => {
  let sections = await HomepageSection.find().sort({ order: 1 }).lean();
  if (sections.length === 0) {
    sections = await HomepageSection.insertMany(DEFAULT_SECTIONS);
  }
  res.json({ success: true, data: sections });
});

router.put('/bulk', protect, admin, async (req, res) => {
  const { sections } = req.body;
  const ops = sections.map(s => ({
    updateOne: { filter: { key: s.key }, update: { $set: s }, upsert: true },
  }));
  await HomepageSection.bulkWrite(ops);
  const updated = await HomepageSection.find().sort({ order: 1 }).lean();
  res.json({ success: true, data: updated });
});

router.put('/:key', protect, admin, async (req, res) => {
  const section = await HomepageSection.findOneAndUpdate(
    { key: req.params.key },
    req.body,
    { new: true, upsert: true }
  );
  res.json({ success: true, data: section });
});

module.exports = router;