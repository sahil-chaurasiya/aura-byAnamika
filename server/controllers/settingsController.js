const { Settings } = require('../models/index');

// Default settings
const DEFAULT_SETTINGS = {
  store_name: { value: 'Aura by Anamika', group: 'general', label: 'Store Name', type: 'text' },
  store_email: { value: 'hello@aura.com', group: 'general', label: 'Store Email', type: 'text' },
  store_phone: { value: '(500) 8001 8588', group: 'general', label: 'Store Phone', type: 'text' },
  store_address: { value: '123 Fashion Street, New York, NY 10001', group: 'general', label: 'Store Address', type: 'text' },
  logo: { value: '/assets/img/logo.png', group: 'branding', label: 'Logo', type: 'image' },
  logo_white: { value: '/assets/img/logo-white.svg', group: 'branding', label: 'Logo (White)', type: 'image' },
  favicon: { value: '/assets/img/favicon.svg', group: 'branding', label: 'Favicon', type: 'image' },
  primary_color: { value: '#EF2853', group: 'branding', label: 'Primary Color', type: 'color' },
  secondary_color: { value: '#FFA31A', group: 'branding', label: 'Secondary Color', type: 'color' },
  facebook_url: { value: '#', group: 'social', label: 'Facebook URL', type: 'text' },
  twitter_url: { value: '#', group: 'social', label: 'Twitter URL', type: 'text' },
  instagram_url: { value: '#', group: 'social', label: 'Instagram URL', type: 'text' },
  youtube_url: { value: '#', group: 'social', label: 'YouTube URL', type: 'text' },
  linkedin_url: { value: '#', group: 'social', label: 'LinkedIn URL', type: 'text' },
  gmb_url: { value: '#', group: 'social', label: 'Google My Business URL', type: 'text' },
  currency: { value: 'USD', group: 'commerce', label: 'Currency', type: 'text' },
  currency_symbol: { value: '$', group: 'commerce', label: 'Currency Symbol', type: 'text' },
  tax_rate: { value: 8, group: 'commerce', label: 'Tax Rate (%)', type: 'number' },
  free_shipping_threshold: { value: 100, group: 'commerce', label: 'Free Shipping Above ($)', type: 'number' },
  shipping_cost: { value: 9.99, group: 'commerce', label: 'Standard Shipping Cost ($)', type: 'number' },
  announcement_text: { value: '🌟 Limited time offer - Free shipping on orders over $100!', group: 'marketing', label: 'Announcement Bar Text', type: 'text' },
  app_android_url: { value: '#', group: 'apps', label: 'Android App URL', type: 'text' },
  app_ios_url: { value: '#', group: 'apps', label: 'iOS App URL', type: 'text' },
  phone_1: { value: '(500) 8001 8588', group: 'contact', label: 'Phone 1', type: 'text' },
  phone_2: { value: '(500) 544 6550', group: 'contact', label: 'Phone 2', type: 'text' },
  sidebar_about_text: { value: 'We are a premium fashion destination offering curated collections for modern style enthusiasts. Discover the latest trends with exceptional quality.', group: 'general', label: 'Sidebar About Text', type: 'text' },
  newsletter_title: { value: 'Sign Up to Newsletter', group: 'marketing', label: 'Newsletter Title', type: 'text' },
  newsletter_subtitle: { value: 'GET NEWSLETTER', group: 'marketing', label: 'Newsletter Subtitle', type: 'text' },
  footer_copyright: { value: 'Copyright 2024 © Aura by Anamika', group: 'footer', label: 'Footer Copyright', type: 'text' },
  meta_title: { value: 'Aura by Anamika - Premium Fashion & Apparel', group: 'seo', label: 'Default Meta Title', type: 'text' },
  meta_description: { value: 'Shop the latest fashion trends at Aura by Anamika. Premium quality clothing, accessories and more.', group: 'seo', label: 'Default Meta Description', type: 'text' },
};

// @desc   Get all settings
// @route  GET /api/settings
const getSettings = async (req, res) => {
  let settings = await Settings.find().lean();
  if (settings.length === 0) {
    // Seed defaults
    const toInsert = Object.entries(DEFAULT_SETTINGS).map(([key, val]) => ({ key, ...val }));
    settings = await Settings.insertMany(toInsert);
  }
  // Convert to key-value map
  const map = {};
  settings.forEach(s => (map[s.key] = s.value));
  res.json({ success: true, data: map });
};

// @desc   Get public settings
// @route  GET /api/settings/public
const getPublicSettings = async (req, res) => {
  const publicKeys = ['store_name', 'logo', 'logo_white', 'favicon', 'primary_color', 'secondary_color',
    'store_email', 'store_phone', 'store_address', 'facebook_url', 'twitter_url', 'instagram_url',
    'youtube_url', 'linkedin_url', 'gmb_url', 'currency', 'currency_symbol', 'announcement_text',
    'app_android_url', 'app_ios_url', 'phone_1', 'phone_2', 'sidebar_about_text',
    'newsletter_title', 'newsletter_subtitle', 'footer_copyright', 'meta_title', 'meta_description'];
  let settings = await Settings.find({ key: { $in: publicKeys } }).lean();
  const map = {};
  settings.forEach(s => (map[s.key] = s.value));
  // Fill defaults for missing keys
  publicKeys.forEach(k => { if (!(k in map) && DEFAULT_SETTINGS[k]) map[k] = DEFAULT_SETTINGS[k].value; });
  res.json({ success: true, data: map });
};

// @desc   Update settings (admin)
// @route  PUT /api/settings
const updateSettings = async (req, res) => {
  const updates = req.body; // { key: value, key: value }
  const ops = Object.entries(updates).map(([key, value]) => ({
    updateOne: { filter: { key }, update: { $set: { value } }, upsert: true },
  }));
  await Settings.bulkWrite(ops);
  res.json({ success: true, message: 'Settings updated' });
};

module.exports = { getSettings, getPublicSettings, updateSettings };