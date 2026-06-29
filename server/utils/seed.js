require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const HeroSlide = require('../models/HeroSlide');
const Blog = require('../models/Blog');
const { FAQ, Testimonial, Settings, Menu, HomepageSection } = require('../models/index');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/glamics';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({}),
    Banner.deleteMany({}), HeroSlide.deleteMany({}), Blog.deleteMany({}),
    FAQ.deleteMany({}), Testimonial.deleteMany({}), HomepageSection.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Create admin user
  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'Glamics',
    email: 'admin@glamics.com',
    password: 'admin123456',
    role: 'super_admin',
    isActive: true,
  });
  console.log('👤 Admin user created: admin@glamics.com / admin123456');

  // Create categories
  const categories = await Category.create([
    { name: "Women's Fashion", slug: 'womens-fashion', description: 'Latest women fashion trends', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=300&fit=crop', isFeatured: true, order: 0 },
    { name: "Men's Fashion", slug: 'mens-fashion', description: 'Stylish men clothing', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=300&h=300&fit=crop', isFeatured: true, order: 1 },
    { name: 'Accessories', slug: 'accessories', description: 'Fashion accessories', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=300&fit=crop', isFeatured: true, order: 2 },
    { name: 'Bags', slug: 'bags', description: 'Handbags and totes', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop', isFeatured: true, order: 3 },
    { name: 'Footwear', slug: 'footwear', description: 'Shoes and boots', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop', isFeatured: true, order: 4 },
    { name: 'Jewelry', slug: 'jewelry', description: 'Fine jewelry collection', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop', isFeatured: true, order: 5 },
    { name: 'Sportswear', slug: 'sportswear', description: 'Active wear collection', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', isFeatured: false, order: 6 },
  ]);
  console.log(`📂 ${categories.length} categories created`);

  // Product images pool
  const productImages = [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&h=700&fit=crop',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=700&fit=crop',
  ];

  const productData = [
    { name: 'Floral Summer Dress', category: categories[0]._id, price: 129.99, salePrice: 89.99, isFeatured: true, isNewArrival: true, tags: ['dress', 'summer', 'floral'] },
    { name: 'Classic Leather Handbag', category: categories[3]._id, price: 299.99, salePrice: 199.99, isBestSeller: true, isFeatured: true, tags: ['bag', 'leather', 'classic'] },
    { name: 'Men\'s Slim Fit Suit', category: categories[1]._id, price: 549.99, salePrice: null, isFeatured: true, tags: ['suit', 'formal', 'men'] },
    { name: 'Gold Chain Necklace', category: categories[5]._id, price: 89.99, salePrice: 59.99, isFeatured: true, isOnSale: true, tags: ['jewelry', 'gold', 'necklace'] },
    { name: 'Running Sneakers', category: categories[4]._id, price: 159.99, salePrice: 119.99, isBestSeller: true, tags: ['shoes', 'running', 'sport'] },
    { name: 'Silk Blouse', category: categories[0]._id, price: 149.99, salePrice: 99.99, isNewArrival: true, tags: ['blouse', 'silk', 'women'] },
    { name: 'Casual Denim Jacket', category: categories[1]._id, price: 199.99, salePrice: 149.99, isBestSeller: true, tags: ['jacket', 'denim', 'casual'] },
    { name: 'Pearl Drop Earrings', category: categories[5]._id, price: 49.99, salePrice: null, tags: ['earrings', 'pearl', 'jewelry'] },
    { name: 'Yoga Pants', category: categories[6]._id, price: 79.99, salePrice: 59.99, isNewArrival: true, tags: ['yoga', 'activewear', 'pants'] },
    { name: 'Leather Wallet', category: categories[2]._id, price: 69.99, salePrice: null, isBestSeller: true, tags: ['wallet', 'leather', 'accessories'] },
    { name: 'Maxi Evening Gown', category: categories[0]._id, price: 349.99, salePrice: 249.99, isFeatured: true, tags: ['gown', 'evening', 'formal'] },
    { name: 'Canvas Backpack', category: categories[3]._id, price: 119.99, salePrice: 89.99, tags: ['backpack', 'canvas', 'bag'] },
    { name: 'Polo Shirt', category: categories[1]._id, price: 69.99, salePrice: 49.99, isNewArrival: true, isBestSeller: true, tags: ['polo', 'shirt', 'men'] },
    { name: 'Ankle Boots', category: categories[4]._id, price: 189.99, salePrice: 139.99, isFeatured: true, tags: ['boots', 'ankle', 'shoes'] },
    { name: 'Sports Watch', category: categories[2]._id, price: 249.99, salePrice: null, isFeatured: true, tags: ['watch', 'sports', 'accessories'] },
    { name: 'Oversized Hoodie', category: categories[0]._id, price: 89.99, salePrice: 69.99, isNewArrival: true, tags: ['hoodie', 'oversized', 'casual'] },
    { name: 'Diamond Stud Earrings', category: categories[5]._id, price: 399.99, salePrice: 299.99, isFeatured: true, tags: ['earrings', 'diamond', 'luxury'] },
    { name: 'Chino Trousers', category: categories[1]._id, price: 99.99, salePrice: 79.99, tags: ['trousers', 'chino', 'men'] },
    { name: 'Crossbody Bag', category: categories[3]._id, price: 159.99, salePrice: 119.99, isBestSeller: true, tags: ['bag', 'crossbody', 'women'] },
    { name: 'High Heels', category: categories[4]._id, price: 179.99, salePrice: 129.99, isFeatured: true, tags: ['heels', 'shoes', 'women'] },
  ];

  const products = await Product.create(
    productData.map((p, i) => ({
      ...p,
      slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + (i + 1),
      description: `Premium quality ${p.name.toLowerCase()} crafted with the finest materials. Designed for the modern fashion enthusiast who values both style and comfort. Available in multiple sizes and colors.`,
      shortDescription: `Premium ${p.name.toLowerCase()} - perfect for any occasion`,
      stock: Math.floor(Math.random() * 100) + 10,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Navy', hex: '#001F5B' }],
      images: [{ url: productImages[i % productImages.length], alt: p.name }],
      thumbnail: productImages[i % productImages.length],
      ratings: Math.round((Math.random() * 2 + 3) * 10) / 10,
      numReviews: Math.floor(Math.random() * 50) + 5,
      soldCount: Math.floor(Math.random() * 500),
      isOnSale: !!p.salePrice,
      sku: `SKU-${String(i + 1).padStart(5, '0')}`,
    }))
  );
  console.log(`📦 ${products.length} products created`);

  // Hero slides
  await HeroSlide.create([
    { heading: 'New Summer Collection', subHeading: 'DISCOVER THE LATEST', description: 'Explore our curated collection of premium fashion pieces designed for the modern lifestyle.', buttonText: 'Shop Now', buttonLink: '/shop', secondaryButtonText: 'Explore', secondaryButtonLink: '/shop?newArrival=true', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=700&fit=crop', thumbImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=200&h=200&fit=crop', badge: 'NEW', isActive: true, order: 0 },
    { heading: 'Summer Sale Up to 50% Off', subHeading: 'LIMITED TIME OFFER', description: 'Don\'t miss our biggest sale of the season. Shop premium brands at unbeatable prices.', buttonText: 'Shop Sale', buttonLink: '/shop?onSale=true', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&h=700&fit=crop', thumbImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=200&fit=crop', badge: '50% OFF', isActive: true, order: 1 },
    { heading: 'Luxury Accessories', subHeading: 'ELEVATE YOUR STYLE', description: 'Complete your look with our exclusive accessories collection. Handpicked for the discerning fashionista.', buttonText: 'View Collection', buttonLink: '/shop?category=accessories', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1200&h=700&fit=crop', thumbImage: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=200&h=200&fit=crop', badge: 'EXCLUSIVE', isActive: true, order: 2 },
  ]);
  console.log('🎠 Hero slides created');

  // Banners
  await Banner.create([
    { title: 'Summer Collection', subtitle: 'New Arrivals 2024', buttonText: 'Shop Now', buttonLink: '/shop', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&h=500&fit=crop', type: 'promotional', isActive: true, order: 0 },
    { title: 'Men\'s Collection', subtitle: 'Explore the latest', buttonText: 'Explore', buttonLink: '/shop?category=mens-fashion', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&h=500&fit=crop', type: 'collection', isActive: true, order: 1 },
    { title: 'Women\'s Fashion', subtitle: 'New season styles', buttonText: 'Discover', buttonLink: '/shop?category=womens-fashion', image: 'https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=800&h=500&fit=crop', type: 'collection', isActive: true, order: 2 },
    { title: 'Get 30% Discount On All Hudis!', subtitle: 'LIMITED TIME OFFER', buttonText: 'Shop Now', buttonLink: '/shop', image: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=1200&h=400&fit=crop', type: 'ad', isActive: true, order: 0 },
    { title: 'Flash Sale - Up to 70% Off', subtitle: 'Today Only', buttonText: 'Grab Deal', buttonLink: '/shop?onSale=true', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=300&fit=crop', type: 'sale', isActive: true, order: 0 },
    { title: 'Accessories Collection', subtitle: 'Complete Your Look', buttonText: 'Shop', buttonLink: '/shop?category=accessories', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=400&fit=crop', type: 'sub', isActive: true, order: 0 },
    { title: 'New Footwear', subtitle: 'Step In Style', buttonText: 'Shop Shoes', buttonLink: '/shop?category=footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop', type: 'sub', isActive: true, order: 1 },
    { title: 'Jewelry & More', subtitle: 'Shine Bright', buttonText: 'Explore', buttonLink: '/shop?category=jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop', type: 'sub', isActive: true, order: 2 },
  ]);
  console.log('🖼️  Banners created');

  // FAQs
  await FAQ.create([
    { question: 'What is your return policy?', answer: 'We offer a 30-day hassle-free return policy. Items must be in original condition with tags attached. Simply contact our support team to initiate a return.', category: 'Returns', order: 0 },
    { question: 'How long does shipping take?', answer: 'Standard shipping takes 5-7 business days. Express shipping (2-3 business days) is available at checkout. Free shipping on orders over $100.', category: 'Shipping', order: 1 },
    { question: 'Do you ship internationally?', answer: 'Yes! We ship to over 50 countries worldwide. International shipping typically takes 10-14 business days. Additional customs fees may apply.', category: 'Shipping', order: 2 },
    { question: 'How do I track my order?', answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order in your account dashboard under "My Orders".', category: 'Orders', order: 3 },
    { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay. All transactions are secured with SSL encryption.', category: 'Payment', order: 4 },
    { question: 'How do I find my size?', answer: 'We provide detailed size guides for each product. Generally, our sizing follows standard US measurements. When in doubt, we recommend sizing up for a comfortable fit.', category: 'Products', order: 5 },
    { question: 'Can I change or cancel my order?', answer: 'Orders can be modified or cancelled within 2 hours of placement. After that, the order enters processing and cannot be changed. Please contact us immediately if you need to make changes.', category: 'Orders', order: 6 },
    { question: 'Are your products authentic?', answer: 'Absolutely! All products sold on Glamics are 100% authentic and sourced directly from authorized manufacturers and brand partners.', category: 'Products', order: 7 },
  ]);
  console.log('❓ FAQs created');

  // Testimonials
  await Testimonial.create([
    { name: 'Sarah Johnson', role: 'Fashion Blogger', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 5, content: 'Absolutely love shopping at Glamics! The quality is outstanding and the customer service is top-notch. My orders always arrive on time and beautifully packaged.', order: 0 },
    { name: 'Michael Chen', role: 'Business Professional', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', rating: 5, content: 'Found the perfect suit for my business meetings. The fit is impeccable and the price point is very reasonable for the quality you get. Will definitely shop again!', order: 1 },
    { name: 'Emma Williams', role: 'Style Enthusiast', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', rating: 4, content: 'Great selection of trendy pieces. I love how easy it is to find new arrivals. The website is intuitive and checkout is a breeze. Highly recommend to all fashion lovers!', order: 2 },
    { name: 'David Martinez', role: 'Photographer', avatar: 'https://randomuser.me/api/portraits/men/75.jpg', rating: 5, content: 'Been shopping here for 2 years and never been disappointed. The diversity of styles is amazing - you can find everything from casual to formal wear all in one place.', order: 3 },
    { name: 'Olivia Brown', role: 'Interior Designer', avatar: 'https://randomuser.me/api/portraits/women/90.jpg', rating: 5, content: 'The accessories collection is to die for! I bought 3 handbags in the same month because I couldn\'t resist. Free returns made it completely risk-free to try new styles.', order: 4 },
  ]);
  console.log('⭐ Testimonials created');

  // Blog posts
  await Blog.create([
    { title: '10 Must-Have Pieces for Your Summer Wardrobe', slug: '10-must-have-pieces-summer-wardrobe-1', excerpt: 'Summer is here and it\'s time to refresh your wardrobe. Discover the essential pieces every fashion lover needs this season.', content: '<p>Summer is the perfect time to refresh your wardrobe with light, breezy pieces that keep you stylish and comfortable. Here are our top 10 must-have items...</p><h2>1. The Perfect White Dress</h2><p>A classic white dress is the ultimate summer essential. Choose a flowing maxi for beach days or a structured midi for garden parties.</p><h2>2. Linen Trousers</h2><p>Breathable and effortlessly chic, linen trousers are the workwear hero of summer fashion.</p>', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=500&fit=crop', category: 'Fashion Tips', tags: ['summer', 'wardrobe', 'tips'], isPublished: true, publishedAt: new Date(), author: admin._id, authorName: 'Admin Glamics' },
    { title: 'The Complete Guide to Accessorizing', slug: 'complete-guide-accessorizing-2', excerpt: 'Learn how to elevate any outfit with the right accessories. From jewelry to bags, we cover everything you need to know.', content: '<p>Accessories can make or break an outfit. The right piece can transform a simple look into something extraordinary...</p><h2>Jewelry Basics</h2><p>Start with the basics: a quality watch, simple stud earrings, and a delicate necklace. These pieces work with everything.</p>', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=500&fit=crop', category: 'Style Guide', tags: ['accessories', 'styling', 'jewelry'], isPublished: true, publishedAt: new Date(Date.now() - 3*24*60*60*1000), author: admin._id, authorName: 'Admin Glamics' },
    { title: 'Sustainable Fashion: Why It Matters', slug: 'sustainable-fashion-why-it-matters-3', excerpt: 'The fashion industry is evolving. Discover how sustainable practices are reshaping the way we think about clothing.', content: '<p>Sustainable fashion is no longer just a trend—it\'s a movement that\'s reshaping the entire industry...</p><h2>What is Sustainable Fashion?</h2><p>Sustainable fashion encompasses clothing that is produced, distributed, and consumed in a way that is environmentally friendly and socially responsible.</p>', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=500&fit=crop', category: 'Sustainability', tags: ['sustainable', 'eco-friendly', 'fashion'], isPublished: true, publishedAt: new Date(Date.now() - 7*24*60*60*1000), author: admin._id, authorName: 'Admin Glamics' },
  ]);
  console.log('📝 Blog posts created');

  // Homepage sections
  await HomepageSection.create([
    { key: 'hero', label: 'Hero Slider', isEnabled: true, order: 0, config: { title: 'Summer Collection', subtitle: 'New Arrivals' } },
    { key: 'categories', label: 'Featured Categories', isEnabled: true, order: 1, config: { title: 'Shop by Category', subtitle: 'Collections' } },
    { key: 'products', label: 'Featured Products', isEnabled: true, order: 2, config: { title: 'Shopping Every Day', subtitle: 'Summer collection', tabLabels: ['All', 'New', 'Sale', 'Popular'] } },
    { key: 'ad', label: 'Advertisement Banner', isEnabled: true, order: 3, config: { title: 'Get 30% Discount On All Hudis!', subtitle: 'LIMITED TIME OFFER', buttonText: 'Shop Now', buttonLink: '/shop' } },
    { key: 'mostSelling', label: 'Most Selling Products', isEnabled: true, order: 4, config: { title: 'Top selling Categories This Week', subtitle: 'most selling items' } },
    { key: 'video', label: 'Video Section', isEnabled: false, order: 5, config: { videoUrl: '', coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=600&fit=crop' } },
    { key: 'subBanners', label: 'Sub Banners', isEnabled: true, order: 6, config: {} },
    { key: 'flashSale', label: 'Flash Sale', isEnabled: true, order: 7, config: { title: 'Trending Flash Sell', subtitle: 'New Collection', endDate: new Date(Date.now() + 3*24*60*60*1000).toISOString() } },
    { key: 'reviews', label: 'Customer Reviews', isEnabled: true, order: 8, config: { title: 'Product Reviews', subtitle: 'Customer Reviews' } },
    { key: 'newsletter', label: 'Newsletter', isEnabled: true, order: 9, config: {} },
    { key: 'blog', label: 'Blog Section', isEnabled: true, order: 10, config: { title: 'Explore Our Blogs', subtitle: 'News & Blog' } },
    { key: 'gallery', label: 'Instagram Gallery', isEnabled: true, order: 11, config: { title: 'Follow Us @glamics', images: [
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=300&h=300&fit=crop',
    ]}},
  ]);
  console.log('🏠 Homepage sections created');

  console.log('\n✅ Database seeded successfully!');
  console.log('📧 Admin Login: admin@glamics.com');
  console.log('🔑 Admin Password: admin123456');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
