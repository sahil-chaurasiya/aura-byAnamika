import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const NAV = [
  { group: 'Main', items: [
    { to: '/', label: 'Dashboard', icon: 'bi-grid-1x2', exact: true },
  ]},
  { group: 'Store', items: [
    { to: '/products', label: 'Products', icon: 'bi-box-seam' },
    { to: '/categories', label: 'Categories', icon: 'bi-tags' },
    { to: '/menus', label: 'Navigation Menu', icon: 'bi-list-ul' },
    { to: '/orders', label: 'Orders', icon: 'bi-bag-check' },
    { to: '/coupons', label: 'Coupons', icon: 'bi-ticket-perforated' },
  ]},
  { group: 'Content', items: [
    { to: '/hero', label: 'Hero Slides', icon: 'bi-images' },
    { to: '/banners', label: 'Banners', icon: 'bi-image' },
    { to: '/homepage', label: 'Homepage Builder', icon: 'bi-layout-wtf' },
    { to: '/blog', label: 'Blog', icon: 'bi-journal-text' },
    { to: '/faqs', label: 'FAQs', icon: 'bi-question-circle' },
    { to: '/testimonials', label: 'Testimonials', icon: 'bi-chat-quote' },
    { to: '/reviews', label: 'Reviews', icon: 'bi-star' },
    { to: '/media', label: 'Media Library', icon: 'bi-folder2-open' },
  ]},
  { group: 'Users', items: [
    { to: '/users', label: 'Customers', icon: 'bi-people' },
  ]},
  { group: 'System', items: [
    { to: '/settings', label: 'Settings', icon: 'bi-gear' },
  ]},
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin } = useSelector(s => s.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/assets/img/logo.png" alt="Aura by Anamika" style={{ height: 48, objectFit: "contain", mixBlendMode: "screen" }} />
        </div>

        <nav className="sidebar-nav">
          {NAV.map(group => (
            <div key={group.group}>
              <div className="sidebar-section">{group.group}</div>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <i className={`bi ${item.icon}`}></i>
                  {item.label}
                  {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Admin profile at bottom */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EF2853', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
            {admin?.firstName?.[0]}{admin?.lastName?.[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, truncate: true }}>{admin?.firstName} {admin?.lastName}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{admin?.role}</div>
          </div>
          <button onClick={handleLogout} title="Logout" style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', fontSize: 18 }}>
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="d-lg-none"
              style={{ background: 'none', border: 'none', fontSize: 22, color: '#333' }}
            >
              <i className="bi bi-list"></i>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="http://localhost:5173" target="_blank" rel="noreferrer"
              style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="bi bi-box-arrow-up-right"></i> View Store
            </a>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#EF2853,#FFA31A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
              {admin?.firstName?.[0]}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 992px) { .d-lg-none { display: none !important; } }
      `}</style>
    </div>
  );
}