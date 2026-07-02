import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../store/slices/settingsSlice';
import toast from 'react-hot-toast';

export default function Footer() {
  const settings = useSelector(selectSettings);
  const [email, setEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thank you for subscribing!');
    setEmail('');
  };

  const footerColumns = [
    {
      title: 'Shop',
      links: [
        { label: 'New Arrivals', to: '/shop?newArrival=true' },
        { label: 'Best Sellers', to: '/shop?bestSeller=true' },
        { label: 'Sale Items', to: '/shop?onSale=true' },
        { label: "Women's Fashion", to: '/shop?category=womens-fashion' },
        { label: "Men's Fashion", to: '/shop?category=mens-fashion' },
      ],
    },
    {
      title: 'Accessories',
      links: [
        { label: 'Bags', to: '/shop?category=bags' },
        { label: 'Jewelry', to: '/shop?category=jewelry' },
        { label: 'Footwear', to: '/shop?category=footwear' },
        { label: 'Watches', to: '/shop?category=accessories' },
        { label: 'Sportswear', to: '/shop?category=sportswear' },
      ],
    },
    {
      title: 'Services',
      links: [
        { label: 'Sale', to: '/shop?onSale=true' },
        { label: 'Quick Ship', to: '#' },
        { label: 'New Designs', to: '/shop?newArrival=true' },
        { label: 'Protection Plan', to: '#' },
        { label: 'Gift Cards', to: '#' },
      ],
    },
    {
      title: 'Policies',
      links: [
        { label: 'Privacy Policy', to: '#' },
        { label: 'About Us', to: '/about' },
        { label: 'Careers', to: '#' },
        { label: 'Contact Us', to: '/contact' },
        { label: 'Reviews', to: '#' },
      ],
    },
    {
      title: 'Help',
      links: [
        { label: 'Contact Us', to: '/contact' },
        { label: 'About Us', to: '/about' },
        { label: 'FAQ', to: '/faq' },
        { label: 'Terms of Service', to: '#' },
        { label: 'Refund Policy', to: '#' },
      ],
    },
  ];

  const socialLinks = [
    { icon: 'bi-facebook', url: settings.facebook_url || '#' },
    { icon: 'bi-twitter-x', url: settings.twitter_url || '#' },
    { icon: 'bi-instagram', url: settings.instagram_url || '#' },
    { icon: 'bi-youtube', url: settings.youtube_url || '#' },
    { icon: 'bi-google', url: settings.gmb_url || '#' },
  ];

  return (
    <footer className="ul-footer">
      <div className="ul-inner-container">
        {/* Top - Link Columns */}
        <div className="ul-footer-top">
          {footerColumns.map(col => (
            <div key={col.title} className="ul-footer-top-widget">
              <h3 className="ul-footer-top-widget-title">{col.title}</h3>
              <div className="ul-footer-top-widget-links">
                {col.links.map(link => (
                  link.to.startsWith('http') || link.to === '#'
                    ? <a key={link.label} href={link.to}>{link.label}</a>
                    : <Link key={link.label} to={link.to}>{link.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Middle */}
        <div className="ul-footer-middle">
          {/* Social Links */}
          <div className="ul-footer-middle-widget">
            <h3 className="ul-footer-middle-widget-title">Follow us</h3>
            <div className="ul-footer-middle-widget-content">
              <div className="social-links">
                {socialLinks.map(({ icon, url }) => (
                  <a key={icon} href={url} target="_blank" rel="noreferrer">
                    <i className={`bi ${icon}`}></i>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="ul-footer-middle-widget">
            <h3 className="ul-footer-middle-widget-title">Need help? Call now!</h3>
            <div className="ul-footer-middle-widget-content">
              <div className="contact-nums">
                <a href={`tel:${settings.phone_1 || ''}`}>{settings.phone_1 || '(500) 8001 8588'}</a>,{' '}
                <a href={`tel:${settings.phone_2 || ''}`}>{settings.phone_2 || '(500) 544 6550'}</a>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="ul-footer-middle-widget align-self-center">
            <Link to="/">
              <span style={{ fontWeight: 800, fontSize: '28px', color: '#fff', letterSpacing: '-1px' }}>
                <img src="/assets/img/logo.png" alt="Aura by Anamika" style={{ height: 56, objectFit: 'contain' }} />
              </span>
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="ul-footer-bottom">
          <p className="copyright-txt">
            {settings.footer_copyright || 'Copyright 2024 © Aura by Anamika'}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {['VISA', 'MC', 'PAYPAL', 'AMEX', 'APPLE PAY'].map(method => (
              <span key={method} style={{
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4,
                padding: '4px 8px', fontSize: 11, color: 'rgba(255,255,255,0.7)'
              }}>
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}