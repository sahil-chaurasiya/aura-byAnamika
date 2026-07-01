import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { selectSettings } from '../../store/slices/settingsSlice';
import api from '../../services/api';
import ProductCard from '../product/ProductCard';

const Sidebar = forwardRef(function Sidebar({ onClose }, ref) {
  const settings = useSelector(selectSettings);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    api.get('/products?featured=true&limit=6')
      .then(r => setFeaturedProducts(r.data.data))
      .catch(() => {});
  }, []);

  const socialLinks = [
    { icon: 'bi-facebook', url: settings.facebook_url || '#' },
    { icon: 'bi-twitter-x', url: settings.twitter_url || '#' },
    { icon: 'bi-instagram', url: settings.instagram_url || '#' },
    { icon: 'bi-youtube', url: settings.youtube_url || '#' },
  ];

  return (
    <div className="ul-sidebar" ref={ref}>
      {/* Header */}
      <div className="ul-sidebar-header">
        <div className="ul-sidebar-header-logo">
          <Link to="/" onClick={onClose}>
            <span style={{ fontWeight: 800, fontSize: '22px', color: '#EF2853', letterSpacing: '-1px' }}>
              <img src="/assets/img/logo.png" alt="Aura by Anamika" style={{ height: 40, objectFit: 'contain' }} />
            </span>
          </Link>
        </div>
        <button className="ul-sidebar-closer" onClick={onClose}>
          <i className="bi bi-x"></i>
        </button>
      </div>

      {/* Mobile nav */}
      <div className="d-block d-lg-none" style={{ padding: '0 24px' }}>
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { label: 'Home', to: '/' },
            { label: 'Shop', to: '/shop' },
            { label: 'New Arrivals', to: '/shop?newArrival=true' },
            { label: 'Sale', to: '/shop?onSale=true' },
            { label: 'Blog', to: '/blog' },
            { label: 'About', to: '/about' },
            { label: 'Contact', to: '/contact' },
            { label: 'FAQ', to: '/faq' },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              style={{
                padding: '12px 0',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                color: '#000',
                fontSize: '15px',
                fontWeight: 500,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* About — desktop only */}
      <div className="ul-sidebar-about d-none d-lg-block">
        <span className="title">About Aura by Anamika</span>
        <p className="mb-0">
          {settings.sidebar_about_text ||
            'We are a premium fashion destination offering curated collections for modern style enthusiasts.'}
        </p>
      </div>

      {/* Featured Products Slider — desktop only */}
      {featuredProducts.length > 0 && (
        <div className="ul-sidebar-products-wrapper d-none d-lg-flex">
          <div className="ul-sidebar-products-slider" style={{ flex: 1, overflow: 'hidden' }}>
            <Swiper
              modules={[Navigation]}
              slidesPerView={1}
              direction="vertical"
              navigation={{ prevEl: '.sidebar-prev', nextEl: '.sidebar-next' }}
              loop
              style={{ height: 320 }}
            >
              {featuredProducts.map(product => (
                <SwiperSlide key={product._id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className="ul-sidebar-products-slider-nav" style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
            <button className="sidebar-prev" style={{ background: 'rgba(0,0,0,0.08)', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>
              <i className="bi bi-chevron-up"></i>
            </button>
            <button className="sidebar-next" style={{ background: 'rgba(0,0,0,0.08)', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>
              <i className="bi bi-chevron-down"></i>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="ul-sidebar-footer" style={{ marginTop: 'auto', padding: '20px 24px' }}>
        <span style={{ fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: 12 }}>
          Follow us
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          {socialLinks.map(({ icon, url }) => (
            <a
              key={icon}
              href={url}
              target="_blank"
              rel="noreferrer"
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#333', fontSize: 16, transition: '0.2s',
              }}
            >
              <i className={`bi ${icon}`}></i>
            </a>
          ))}
        </div>
        <div style={{ marginTop: 16, fontSize: '13px', color: '#666', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {settings.phone_1 && (
            <div><i className="bi bi-telephone me-2"></i>{settings.phone_1}</div>
          )}
          {settings.store_email && (
            <div><i className="bi bi-envelope me-2"></i>{settings.store_email}</div>
          )}
        </div>
      </div>
    </div>
  );
});

export default Sidebar;