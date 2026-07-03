import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import mixitup from 'mixitup';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import api from '../../services/api';
import ProductCard from '../product/ProductCard';
import toast from 'react-hot-toast';

// ─── AD BANNER ───────────────────────────────────────────────────
export function AdSection({ config = {} }) {
  // This section is fully driven by Admin > Homepage Builder > Advertisement
  // Banner > Configure. (It used to also check a legacy `/banners?type=ad`
  // document and let that silently win over the config below, which is why
  // edits made in the Homepage Builder appeared to do nothing — removed.)
  const title = config.title || 'Get 30% Discount On All Hudis!';
  const subtitle = config.subtitle || 'Trending Products';
  const btnText = config.buttonText || 'Check Discount';
  const btnLink = config.buttonLink || '/shop';
  const image = config.image || 'https://images.unsplash.com/photo-1772570824145-e996a55204fb?w=1600&q=70&auto=format&fit=crop';
  const categories = config.categories?.length ? config.categories : ['Sarees', 'Lehengas', 'Kurtis', 'Anarkali', 'Suits'];

  return (
    <div className="ul-container">
      <section className="ul-ad">
        {/* background texture layer — the reference's .ul-ad::before rule points
            at a local asset (../img/ad-banner-bg.jpg) that was never bundled
            into this project, so it silently failed to render. Rendered here
            instead with a real image (admin-editable) so the multiply-blend
            texture shows up. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: 'multiply',
            opacity: 0.35,
            pointerEvents: 'none',
          }}
        />
        <div className="ul-inner-container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="ul-ad-content">
            <div className="ul-ad-txt">
              <span className="ul-ad-sub-title">{subtitle}</span>
              <h2 className="ul-section-title">{title}</h2>
              <div className="ul-ad-categories">
                {categories.map((c, i) => (
                  <span className="category" key={i}>
                    <span><i className="bi bi-check-lg"></i></span>{c}
                  </span>
                ))}
              </div>
            </div>

            <Link to={btnLink} className="ul-btn">
              {btnText} <i className="bi bi-arrow-up-right"></i>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── MOST SELLING ─────────────────────────────────────────────────
export function MostSellingSection({ config = {} }) {
  const [products, setProducts] = useState([]);
  const { currency_symbol = '$' } = useSelector(s => s.settings.data);
  const gridRef = useRef(null);
  const mixerRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/products?bestSeller=true&limit=6'),
      api.get('/products?onSale=true&limit=6'),
      api.get('/products?sort=rating&limit=6'),
    ]).then(([bestRes, saleRes, ratingRes]) => {
      const map = new Map();
      const add = (list, tag) => {
        (list || []).forEach(p => {
          const existing = map.get(p._id) || { ...p, _tags: [] };
          if (!existing._tags.includes(tag)) existing._tags.push(tag);
          map.set(p._id, existing);
        });
      };
      add(bestRes.data.data, 'best-selling');
      add(saleRes.data.data, 'on-selling');
      add(ratingRes.data.data, 'top-rating');
      setProducts(Array.from(map.values()).slice(0, 12));
    }).catch(() => {});
  }, []);

  // Initialize mixitup filtering once the product grid has rendered,
  // exactly like the reference: mixitup('.ul-filter-products-wrapper')
  useEffect(() => {
    if (!products.length || !gridRef.current) return;

    mixerRef.current = mixitup(gridRef.current);

    return () => {
      if (mixerRef.current) {
        mixerRef.current.destroy();
        mixerRef.current = null;
      }
    };
  }, [products]);

  return (
    <div className="ul-container">
      <section className="ul-products ul-most-selling-products">
        <div className="ul-inner-container">
          <div className="ul-section-heading flex-lg-row flex-column text-md-start text-center">
            <div className="left">
              <span className="ul-section-sub-title">{config.subtitle || 'most selling items'}</span>
              <h2 className="ul-section-title">{config.title || 'Top selling Categories This Week'}</h2>
            </div>

            <div className="right">
              <div className="ul-most-sell-filter-navs">
                <button type="button" data-filter="all">All Products</button>
                <button type="button" data-filter=".best-selling">Best Selling</button>
                <button type="button" data-filter=".on-selling">On Selling</button>
                <button type="button" data-filter=".top-rating">Top Rating</button>
              </div>
            </div>
          </div>

          {/* products grid */}
          <div
            ref={gridRef}
            className="ul-bs-row row row-cols-xl-4 row-cols-lg-3 row-cols-sm-2 row-cols-1 ul-filter-products-wrapper"
          >
            {products.map(product => {
              const displayPrice = product.salePrice || product.price;
              const rating = Math.round(product.ratings || 0);
              return (
                <div key={product._id} className={`mix col ${product._tags.join(' ')}`}>
                  <div className="ul-product-horizontal">
                    <div className="ul-product-horizontal-img">
                      <img
                        src={product.thumbnail || product.images?.[0]?.url || 'https://via.placeholder.com/126x127?text=No+Image'}
                        alt={product.name}
                      />
                    </div>

                    <div className="ul-product-horizontal-txt">
                      <span className="ul-product-price">
                        {currency_symbol}{displayPrice?.toFixed(2)}
                      </span>
                      <h4 className="ul-product-title">
                        <Link to={`/shop/${product.slug}`}>{product.name}</Link>
                      </h4>
                      <h5 className="ul-product-category">
                        <Link to={`/shop?category=${encodeURIComponent(product.categories?.[0]?.label || '')}`}>
                          {product.categories?.[0]?.label || 'Fashion'}
                        </Link>
                      </h5>
                      <div className="ul-product-rating">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className="star">
                            <i className={i < rating ? 'bi bi-star-fill' : 'bi bi-star'}></i>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── FLASH SALE ───────────────────────────────────────────────────
function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, days: 0 });

  useEffect(() => {
    const end = targetDate ? new Date(targetDate) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

export function FlashSaleSection({ config = {} }) {
  const [products, setProducts] = useState([]);
  const timeLeft = useCountdown(config.endDate);

  useEffect(() => {
    api.get('/products?onSale=true&limit=8').then(r => setProducts(r.data.data)).catch(() => {});
  }, []);

  const pad = n => String(n).padStart(2, '0');

  return (
    <div className="overflow-hidden">
      <div className="ul-container">
        <div className="ul-flash-sale">
          <div className="ul-inner-container">

            {/* Heading row */}
            <div className="ul-section-heading ul-flash-sale-heading">
              <div className="left">
                <span className="ul-section-sub-title">{config.subtitle || 'New Collection'}</span>
                <h2 className="ul-section-title">{config.title || 'Trending Flash Sell'}</h2>
              </div>

              <div className="ul-flash-sale-countdown-wrapper">
                <div className="ul-flash-sale-countdown">
                  <div className="days-wrapper">
                    <div className="days number">{pad(timeLeft.days)}</div>
                    <span className="txt">Days</span>
                  </div>
                  <div className="hours-wrapper">
                    <div className="hours number">{pad(timeLeft.hours)}</div>
                    <span className="txt">Hours</span>
                  </div>
                  <div className="minutes-wrapper">
                    <div className="minutes number">{pad(timeLeft.minutes)}</div>
                    <span className="txt">Min</span>
                  </div>
                  <div className="seconds-wrapper">
                    <div className="seconds number">{pad(timeLeft.seconds)}</div>
                    <span className="txt">Sec</span>
                  </div>
                </div>
              </div>

              <Link to="/shop?onSale=true" className="ul-btn">
                View All Collection <i className="bi bi-arrow-up-right"></i>
              </Link>
            </div>

            {/* Products slider */}
            <Swiper
              modules={[Navigation, Autoplay]}
              className="ul-flash-sale-slider"
              slidesPerView={1}
              loop={products.length > 4}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              spaceBetween={15}
              navigation
              breakpoints={{
                480: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                992: { slidesPerView: 4 },
                1200: { spaceBetween: 20, slidesPerView: 4 },
                1680: { spaceBetween: 26, slidesPerView: 4 },
                1700: { spaceBetween: 30, slidesPerView: 4.7 },
              }}
            >
              {products.map(product => (
                <SwiperSlide key={product._id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── REVIEWS ──────────────────────────────────────────────────────
export function ReviewsSection({ config = {} }) {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    api.get('/testimonials').then(r => setTestimonials(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="ul-container">
      <section className="ul-reviews" style={{ padding: 'clamp(40px,4.2vw,80px) 0' }}>
        <div className="ul-inner-container">
          <div className="ul-section-heading" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
            <span className="ul-section-sub-title">{config.subtitle || 'Customer Reviews'}</span>
            <h2 className="ul-section-title">{config.title || 'Product Reviews'}</h2>
          </div>

          <Swiper
            modules={[Navigation, Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={2}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000 }}
            loop={testimonials.length > 2}
            breakpoints={{ 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 } }}
            style={{ paddingBottom: 50 }}
          >
            {testimonials.map(t => (
              <SwiperSlide key={t._id}>
                <div style={{
                  background: '#fff', borderRadius: 20, padding: 'clamp(20px,1.58vw,30px)',
                  boxShadow: '0 4px 30px rgba(0,0,0,0.06)', height: '100%',
                }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <i key={i} className={`bi ${i < t.rating ? 'bi-star-fill' : 'bi-star'}`}
                        style={{ color: i < t.rating ? '#FFA31A' : '#ddd', fontSize: 14 }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 'clamp(14px,0.84vw,16px)', color: '#444', marginBottom: 20, lineHeight: 1.7 }}>
                    "{t.content}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {t.avatar && (
                      <img src={t.avatar} alt={t.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'clamp(15px,0.84vw,16px)' }}>{t.name}</div>
                      {t.role && <div style={{ fontSize: 13, color: '#999' }}>{t.role}</div>}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </div>
  );
}

// ─── NEWSLETTER ───────────────────────────────────────────────────
export function NewsletterSection() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thank you for subscribing!');
    setEmail('');
  };

  return (
    <div className="ul-container">
      <section className="ul-nwsltr-subs" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&h=600&fit=crop')" }}>
        <div className="ul-inner-container">
          <div className="ul-section-heading justify-content-center text-center">
            <div>
              <span className="ul-section-sub-title text-white">GET NEWSLETTER</span>
              <h2 className="ul-section-title text-white">Sign Up to Newsletter</h2>
            </div>
          </div>
          <div className="ul-nwsltr-subs-form-wrapper">
            <div className="icon"><i className="bi bi-send"></i></div>
            <form className="ul-nwsltr-subs-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button type="submit">
                SUBSCRIBE NOW <i className="bi bi-arrow-up-right"></i>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}


// ─── BLOG ─────────────────────────────────────────────────────────
export function BlogSection({ config = {} }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get('/blog?limit=3').then(r => setPosts(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="ul-container">
      <section style={{ margin: 'clamp(40px,4.2vw,80px) 0' }}>
        <div className="ul-inner-container">
          <div className="ul-section-heading">
            <div>
              <span className="ul-section-sub-title">{config.subtitle || 'News & Blog'}</span>
              <h2 className="ul-section-title">{config.title || 'Explore Our Blogs'}</h2>
            </div>
            <Link to="/blog" className="ul-btn">
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div className="row row-cols-md-3 row-cols-sm-2 row-cols-1 ul-bs-row">
            {posts.map(post => (
              <div key={post._id} className="col">
                <article style={{ borderRadius: 20, overflow: 'hidden', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  {post.image && (
                    <Link to={`/blog/${post.slug}`}>
                      <div style={{ overflow: 'hidden', aspectRatio: '4/3' }}>
                        <img
                          src={post.image}
                          alt={post.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.4s ease' }}
                          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        />
                      </div>
                    </Link>
                  )}
                  <div style={{ padding: 'clamp(15px,1.58vw,25px)' }}>
                    {post.category && (
                      <span style={{ color: '#EF2853', fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 500 }}>
                        {post.category}
                      </span>
                    )}
                    <h3 style={{ fontWeight: 600, fontSize: 'clamp(16px,1.05vw,20px)', lineHeight: 1.3, margin: '8px 0 12px' }}>
                      <Link to={`/blog/${post.slug}`} style={{ color: '#000' }}>{post.title}</Link>
                    </h3>
                    {post.excerpt && (
                      <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 16 }}>
                        {post.excerpt.substring(0, 100)}...
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#999' }}>
                      <span>
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </span>
                      <Link to={`/blog/${post.slug}`} style={{ color: '#EF2853', fontWeight: 500 }}>
                        Read More <i className="bi bi-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── OUR VIDEOS — reel-style marquee ───────────────────────────────
export function GallerySection({ config = {} }) {
  const videos = config.videos || [];
  const trackRef = useRef(null);

  // Play a reel when it scrolls into view, pause it when it scrolls out —
  // same approach as the Ritu Ghai reference site, so we're not running
  // a dozen muted videos at once on slower devices.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = track.querySelectorAll('.ul-video-item');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target.querySelector('video');
        if (!video) return;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
    }, { threshold: 0.2 });
    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, [videos.length]);

  if (!videos.length) return null;

  // The CSS marquee loops by sliding the track left by exactly 50% of its
  // own width, then snapping back — that only looks seamless if a single
  // "set" of videos is already wider than the screen. With only a few
  // clips (or just one), a lone set is much narrower than the viewport,
  // so the strip visibly runs out and leaves blank space before it can
  // loop. Fix: repeat the uploaded videos enough times to build one set
  // that's comfortably wider than any real screen (including 4K), THEN
  // duplicate that padded set for the seamless loop. This also means a
  // single video just keeps repeating forever, which is what we want.
  const MIN_SET_ITEMS = 24; // 24 * ~220px desktop card ≈ 5280px, wider than any monitor
  const repeatFactor = Math.max(1, Math.ceil(MIN_SET_ITEMS / videos.length));
  const oneSet = Array.from({ length: repeatFactor }, () => videos).flat();
  const doubled = [...oneSet, ...oneSet];
  // Keep the visual scroll speed consistent no matter how many elements
  // end up in the track (more repeats shouldn't make it fly by faster).
  const durationSec = Math.max(30, doubled.length * 1.8);

  return (
    <div className="ul-container">
      <section className="ul-video-gallery-section" style={{ margin: 'clamp(40px,4.2vw,80px) 0' }}>
        <div className="ul-inner-container">
          <div className="ul-section-heading" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <span className="ul-section-sub-title">{config.subtitle || 'Watch our latest collections'}</span>
              <h2 className="ul-section-title">{config.title || 'Our Videos'}</h2>
            </div>
          </div>
        </div>

        <div className="ul-video-gallery overflow-hidden mx-auto">
          <div className="ul-video-gallery-track" ref={trackRef} style={{ animationDuration: `${durationSec}s` }}>
            {doubled.map((item, i) => {
              const href = item.link || '';
              const isInternal = href.startsWith('/');
              const Wrapper = href ? (isInternal ? Link : 'a') : 'div';
              const wrapperProps = href
                ? (isInternal ? { to: href } : { href, target: '_blank', rel: 'noreferrer' })
                : {};
              return (
                <div className="ul-video-item" key={i}>
                  <Wrapper {...wrapperProps} className="ul-video-item-inner">
                    <video src={item.video} muted playsInline loop preload="metadata" />
                    {item.caption && <div className="ul-video-caption">{item.caption}</div>}
                  </Wrapper>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}