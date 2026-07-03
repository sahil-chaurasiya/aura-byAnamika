const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { Menu } = require('../models/index');

// Helper to quickly build a leaf sub-category
const sub = (label, url) => ({ label, url: url || `/shop?search=${encodeURIComponent(label)}` });

// Helper to build a category (level 2) with optional sub-categories (level 3)
const cat = (label, subs = [], extra = {}) => ({
  label,
  url: subs.length ? '#' : `/shop?search=${encodeURIComponent(label)}`,
  children: subs.map(s => (typeof s === 'string' ? sub(s) : sub(s.label, s.url))),
  ...extra,
});

const DEFAULT_MENUS = {
  header: {
    name: 'Header Menu',
    location: 'header',
    items: [
      { label: 'Home', url: '/', order: 0, isActive: true, layout: 'link' },

      {
        label: 'New Arrivals', url: '/shop?newArrival=true', order: 1, isActive: true, layout: 'simple',
        promo: { image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop', title: '', subtitle: '', url: '' },
        children: [
          cat('Just In', [], { url: '/shop?newArrival=true&sort=newest' }),
          cat('Trending Now', [], { url: '/shop?search=trending' }),
          cat('Best Sellers', [], { url: '/shop?bestSeller=true' }),
        ],
      },

      {
        label: 'Women', url: '/shop', order: 2, isActive: true, layout: 'mega',
        promo: { image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=400&fit=crop', title: 'Bridal Edit', subtitle: 'Curated lehengas for your big day', url: '/shop?search=Bridal Lehengas' },
        children: [
          cat('Lehengas', ['Bridal Lehengas', 'Bridesmaid Lehengas', 'Designer Lehengas', 'Festive Lehengas', 'Reception Lehengas']),
          cat('Sarees', ['Banarasi Sarees', 'Chanderi Sarees', 'Silk Sarees', 'Organza Sarees', 'Tissue Sarees', 'Designer Sarees', 'Printed Sarees', 'Everyday Sarees']),
          cat('Suit Sets', ['Kurta Sets', 'Anarkali Sets', 'Sharara Sets', 'Gharara Sets', 'Palazzo Sets', 'Straight Suit Sets']),
          cat('Indo-Western', ['Indo-Western Gowns', 'Draped Dresses', 'Jacket Sets', 'Fusion Wear', 'Salwar Suits']),
          cat('Kurtas & Kurtis', ['Designer Kurtis', 'Short Kurtis', 'Long Kurtis', 'Printed Kurtis', 'Embroidered Kurtis']),
          cat('Dresses & Gowns', ['Evening Gowns', 'Party Dresses', 'Maxi Dresses']),
          cat('Co-ord Sets', []),
          cat('Kaftans', []),
          cat('Tops & Tunics', ['Tops', 'Tunics', 'Shirts']),
          cat('Bottom Wear', ['Pants', 'Palazzo', 'Skirts', 'Sharara', 'Cigarette Pants']),
          cat('Dupattas', ['Wedding Collection', 'Banarasi Dupattas', 'Organza Dupattas', 'Chanderi Dupattas', 'Embroidered Dupattas']),
          cat('Jackets', ['Ethnic Jackets', 'Cape Jackets']),
        ],
      },

      {
        label: 'Shop by Occasion', url: '#', order: 3, isActive: true, layout: 'mega',
        promo: { image: 'https://images.unsplash.com/photo-1519657337289-077653f724ed?w=400&h=400&fit=crop', title: '', subtitle: '', url: '' },
        children: [
          cat('Bridal Collection', []), cat('Wedding Guest', []), cat('Engagement', []),
          cat('Reception', []), cat('Haldi', []), cat('Mehendi', []), cat('Sangeet', []),
          cat('Cocktail Party', []), cat('Festive Wear', []), cat('Pooja Collection', []),
          cat('Summer Brunch', []), cat('Office Wear', []), cat('Vacation Edit', []),
        ],
      },

      {
        label: 'Collections', url: '#', order: 4, isActive: true, layout: 'simple',
        promo: { image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=400&fit=crop', title: '', subtitle: '', url: '' },
        children: [
          cat('Wedding Collection', []), cat('Festive Collection', []), cat('Heritage Collection', []),
          cat('Summer Collection', []), cat('Luxury Collection', []), cat('Designer Edit', []),
        ],
      },

      {
        label: 'Ready to Ship', url: '#', order: 5, isActive: true, layout: 'simple',
        promo: { image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop', title: '', subtitle: '', url: '' },
        children: [cat('48 Hours Dispatch', []), cat('Ready to Wear', [])],
      },

      {
        label: 'Accessories', url: '#', order: 6, isActive: true, layout: 'simple',
        promo: { image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop', title: '', subtitle: '', url: '' },
        children: [cat('Dupattas', []), cat('Potli Bags', []), cat('Belts', []), cat('Jewellery', [])],
      },

      {
        label: 'Sale', url: '/shop?onSale=true', order: 7, isActive: true, layout: 'simple', badge: 'Sale',
        promo: { image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', title: '', subtitle: '', url: '' },
        children: [
          cat('Up to 30% Off', [], { url: '/shop?onSale=true&search=30' }),
          cat('Up to 50% Off', [], { url: '/shop?onSale=true&search=50' }),
          cat('Clearance', [], { url: '/shop?onSale=true&search=clearance' }),
        ],
      },

      {
        label: 'Custom Services', url: '#', order: 8, isActive: true, layout: 'simple',
        promo: { image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400&h=400&fit=crop', title: '', subtitle: '', url: '' },
        children: [cat('Custom Stitching', []), cat('Size Guide', [], { url: '/faq' }), cat('Bridal Consultation', []), cat('Personal Styling', [])],
      },

      { label: 'About Us', url: '/about', order: 9, isActive: true, layout: 'link' },
      { label: 'Contact', url: '/contact', order: 10, isActive: true, layout: 'link' },
    ],
  },
  footer: { name: 'Footer Menu', location: 'footer', items: [
    { label: 'Quick Ship', url: '#', order: 0, isActive: true },
    { label: 'New Designs', url: '#', order: 1, isActive: true },
    { label: 'Protection Plan', url: '#', order: 2, isActive: true },
    { label: 'Gift Cards', url: '#', order: 3, isActive: true },
    { label: 'Privacy Policy', url: '#', order: 4, isActive: true },
    { label: 'About Us', url: '/about', order: 5, isActive: true },
    { label: 'Careers', url: '#', order: 6, isActive: true },
    { label: 'Contact Us', url: '/contact', order: 7, isActive: true },
    { label: 'Reviews', url: '/reviews', order: 8, isActive: true },
    { label: 'Terms of Service', url: '#', order: 9, isActive: true },
    { label: 'Refund Policy', url: '#', order: 10, isActive: true },
  ]},
};

// PUBLIC: get a menu by location (auto-seeds defaults the first time)
router.get('/:location', async (req, res) => {
  let menu = await Menu.findOne({ location: req.params.location }).lean();
  if (!menu && DEFAULT_MENUS[req.params.location]) {
    menu = await Menu.create(DEFAULT_MENUS[req.params.location]);
  }
  res.json({ success: true, data: menu });
});

// ADMIN: list all menus
router.get('/', protect, admin, async (req, res) => {
  const menus = await Menu.find().lean();
  res.json({ success: true, data: menus });
});

// ADMIN: full replace/save of a menu's item tree (used by the Menu Builder)
router.put('/:location', protect, admin, async (req, res) => {
  const menu = await Menu.findOneAndUpdate(
    { location: req.params.location },
    { $set: { items: req.body.items, name: req.body.name } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, data: menu });
});

// ADMIN: reset a menu back to its factory default structure
router.post('/:location/reset', protect, admin, async (req, res) => {
  if (!DEFAULT_MENUS[req.params.location]) {
    return res.status(400).json({ success: false, message: 'No default exists for this menu location' });
  }
  await Menu.deleteOne({ location: req.params.location });
  const menu = await Menu.create(DEFAULT_MENUS[req.params.location]);
  res.json({ success: true, data: menu });
});

module.exports = router;