import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartCount } from '../../store/slices/cartSlice';
import { selectWishlistCount } from '../../store/slices/wishlistSlice';
import { selectSettings } from '../../store/slices/settingsSlice';
import { logoutUser } from '../../store/slices/authSlice';
import api from '../../services/api';

/* ============================================================
   AURA HEADER -- rebuilt navbar, restyled to match the site's own
   brand identity (pink-to-orange gradient, white surfaces, Jost
   font, pill search bar, uppercase nav) instead of the old buggy
   shared stylesheet. All CSS is scoped/inline here so it can never
   collide with template.css again.
   Structure is fully driven by the editable /api/menus/header tree:
   Top Nav Item -> Category -> Sub-Category, managed from the admin
   Menu Builder.
   ============================================================ */

const FALLBACK_ITEMS = [
  { _id: 'home', label: 'Home', url: '/', layout: 'link', isActive: true, children: [] },
  { _id: 'shop', label: 'Shop', url: '/shop', layout: 'link', isActive: true, children: [] },
  { _id: 'about', label: 'About Us', url: '/about', layout: 'link', isActive: true, children: [] },
  { _id: 'contact', label: 'Contact', url: '/contact', layout: 'link', isActive: true, children: [] },
];

function isExternalOrHash(url) {
  return !url || url === '#' || /^https?:\/\//i.test(url);
}

function NavLinkSmart({ to, children, ...rest }) {
  if (isExternalOrHash(to)) {
    return <a href={to && to !== '#' ? to : undefined} onClick={e => (!to || to === '#') && e.preventDefault()} {...rest}>{children}</a>;
  }
  return <Link to={to} {...rest}>{children}</Link>;
}

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(s => s.auth);
  const cartCount = useSelector(selectCartCount);
  const wishCount = useSelector(selectWishlistCount);
  const settings = useSelector(selectSettings);

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navItems, setNavItems] = useState(FALLBACK_ITEMS);
  const [openIdx, setOpenIdx] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState({});
  const closeTimer = useRef(null);

  const primary = settings.primary_color || '#EF2853';
  const secondary = '#FFA31A';

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data)).catch(() => {});
    api.get('/menus/header').then(r => {
      const items = (r.data?.data?.items || []).filter(i => i.isActive !== false);
      if (items.length) setNavItems(items);
    }).catch(() => {});
  }, []);

  const openMenu = useCallback((idx) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenIdx(idx);
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenIdx(null), 150);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCat) params.set('category', selectedCat);
    navigate(`/shop?${params.toString()}`);
    setSearchOpen(false);
    setOpenIdx(null);
    setSearch('');
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const toggleMobileNode = (key) => {
    setMobileExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <header className="amh-root" style={{ '--amh-p': primary, '--amh-s': secondary }}>
      {/* GRADIENT ANNOUNCEMENT STRIP -- matches the site's signature pink-to-orange gradient */}
      <div className="amh-announce">
        <i className="bi bi-stars" aria-hidden="true"></i>
        <div className="amh-marquee">
          <div className="amh-marquee-track">
            <span>New Arrivals | Starting at ₹299 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Celebrate in Style | Up to 50% OFF &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Rakhi Sale is Live! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span aria-hidden="true">New Arrivals | Starting at ₹299 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Celebrate in Style | Up to 50% OFF &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Rakhi Sale is Live! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          </div>
        </div>
      </div>

      {/* MAIN BAR: logo + pill search + icons */}
      <div className="amh-main">
        <div className="amh-main-inner">
          <button className="amh-burger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <i className="bi bi-list"></i>
          </button>

          <Link to="/" className="amh-logo">
            <img src={settings.logo || '/assets/img/logo.png'} alt={settings.store_name || 'Aura by Anamika'} />
          </Link>

          <form className="amh-search" onSubmit={handleSearch}>
            <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} aria-label="Category">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <span className="amh-search-divider" />
            <input
              type="search"
              placeholder="Search for lehengas, sarees, suits..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" aria-label="Search"><i className="bi bi-search"></i></button>
          </form>

          <div className="amh-actions">
            <button className="amh-icon-btn amh-search-toggle" onClick={() => setSearchOpen(true)} title="Search">
              <i className="bi bi-search"></i>
            </button>

            {isAuthenticated ? (
              <div className="amh-account" onMouseEnter={() => openMenu('acct')} onMouseLeave={scheduleClose}>
                <button className="amh-icon-btn" title="My Account"><i className="bi bi-person"></i></button>
                {openIdx === 'acct' && (
                  <div className="amh-account-panel">
                    <Link to="/account" onClick={() => setOpenIdx(null)}>My Account</Link>
                    <Link to="/account/orders" onClick={() => setOpenIdx(null)}>My Orders</Link>
                    <Link to="/wishlist" onClick={() => setOpenIdx(null)}>Wishlist</Link>
                    <button onClick={handleLogout} className="amh-logout">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="amh-icon-btn" title="Login"><i className="bi bi-person"></i></Link>
            )}

            <Link to="/wishlist" className="amh-icon-btn" title="Wishlist">
              <i className="bi bi-heart"></i>
              {wishCount > 0 && <span className="amh-badge">{wishCount}</span>}
            </Link>

            <Link to="/cart" className="amh-icon-btn" title="Cart">
              <i className="bi bi-bag"></i>
              {cartCount > 0 && <span className="amh-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* NAV BAR + MEGA MENUS (desktop) -- white bar, uppercase links, pink hover, matches brand */}
      <nav className="amh-nav" onMouseLeave={scheduleClose}>
        <ul className="amh-nav-list">
          {navItems.filter(i => i.isActive !== false).map((item, idx) => {
            const hasChildren = item.layout !== 'link' && item.children && item.children.length > 0;
            return (
              <li
                key={item._id || idx}
                className={`amh-nav-item ${hasChildren ? 'has-menu' : ''} ${item.layout === 'mega' ? 'is-mega-anchor' : ''}`}
                onMouseEnter={() => hasChildren && openMenu(idx)}
              >
                <NavLinkSmart to={item.url} className="amh-nav-link">
                  {item.label}
                  {item.badge && <span className="amh-chip">{item.badge}</span>}
                  {hasChildren && <i className="bi bi-chevron-down amh-caret"></i>}
                </NavLinkSmart>

                {hasChildren && openIdx === idx && (
                  item.layout === 'mega' ? (
                    <MegaPanel item={item} onNavigate={() => setOpenIdx(null)} />
                  ) : (
                    <SimplePanel item={item} onNavigate={() => setOpenIdx(null)} />
                  )
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* MOBILE SEARCH OVERLAY */}
      {searchOpen && (
        <div className="amh-search-overlay" onClick={e => e.target === e.currentTarget && setSearchOpen(false)}>
          <div className="amh-search-overlay-box">
            <form className="amh-search amh-search-mobile" onSubmit={handleSearch}>
              <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} aria-label="Category">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <input autoFocus type="search" placeholder="Search Here" value={search} onChange={e => setSearch(e.target.value)} />
              <button type="submit"><i className="bi bi-search"></i></button>
            </form>
            <button className="amh-overlay-close" onClick={() => setSearchOpen(false)}>&times;</button>
          </div>
        </div>
      )}

      {/* MOBILE DRAWER -- left accent border in brand pink, like the original sidebar's .ul-sidebar */}
      {mobileOpen && (
        <div className="amh-drawer-backdrop" onClick={e => e.target === e.currentTarget && setMobileOpen(false)}>
          <aside className="amh-drawer">
            <div className="amh-drawer-head">
              <img src={settings.logo || '/assets/img/logo.png'} alt="" />
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu"><i className="bi bi-x-lg"></i></button>
            </div>
            <div className="amh-drawer-body">
              {navItems.filter(i => i.isActive !== false).map((item, idx) => (
                <MobileNode
                  key={item._id || idx}
                  node={item}
                  depth={0}
                  pathKey={`${idx}`}
                  expanded={mobileExpanded}
                  onToggle={toggleMobileNode}
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
              <div className="amh-drawer-footer">
                {isAuthenticated ? (
                  <>
                    <Link to="/account" onClick={() => setMobileOpen(false)}><i className="bi bi-person"></i> My Account</Link>
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }}><i className="bi bi-box-arrow-right"></i> Logout</button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)}><i className="bi bi-person"></i> Login / Sign Up</Link>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      <style>{`
        .amh-root { --amh-ink:#1a1a1a; --amh-paper:#ffffff; --amh-line:rgba(0,0,0,0.12); --amh-muted:#6b6b6b; --amh-grad: linear-gradient(90deg, var(--amh-p) 0%, var(--amh-s) 100%); position: relative; z-index: 500; font-family: "Jost", sans-serif; }
        .amh-root * { box-sizing: border-box; }

        /* gradient announcement strip, matches .ul-header-top */
        .amh-announce { background: var(--amh-grad); color: #fff; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 9px 16px; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: .03em; text-align: center; }
        .amh-announce i { font-size: 12px; flex-shrink: 0; }
        .amh-marquee { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; }
        .amh-marquee-track { display: inline-flex; width: max-content; animation: amh-marquee-scroll 20s linear infinite; }
        .amh-marquee-track span { display: inline-block; white-space: nowrap; }
        @keyframes amh-marquee-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        /* main bar */
        .amh-main { background: var(--amh-paper); border-bottom: 1px solid var(--amh-line); position: sticky; top: 0; z-index: 510; }
        .amh-main-inner { max-width: 1360px; margin: 0 auto; display: flex; align-items: center; gap: 24px; padding: 16px 24px; }
        .amh-burger { display: none; background: none; border: none; font-size: 24px; color: var(--amh-ink); cursor: pointer; padding: 4px; line-height: 0; }
        .amh-logo { flex-shrink: 0; display: inline-flex; align-items: center; }
        .amh-logo img { height: clamp(50px, 5.5vw, 70px); width: auto; display: block; }

        .amh-search { flex: 1 1 auto; display: flex; align-items: center; background: #fff; border: 1px solid var(--amh-line); border-radius: 999px; height: 52px; max-width: 620px; margin: 0 auto; overflow: hidden; }
        .amh-search select { border: none; background: transparent; font-size: 13.5px; color: var(--amh-ink); padding: 0 14px 0 22px; height: 100%; max-width: 150px; cursor: pointer; outline: none; font-family: inherit; }
        .amh-search-divider { width: 1px; height: 22px; background: var(--amh-line); flex-shrink: 0; }
        .amh-search input { flex: 1; border: none; background: transparent; outline: none; font-size: 14px; padding: 0 16px; color: var(--amh-ink); min-width: 0; font-family: inherit; }
        .amh-search input::placeholder { color: var(--amh-muted); }
        .amh-search button { background: var(--amh-grad); border: none; color: #fff; width: 52px; height: 52px; flex-shrink: 0; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }

        .amh-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
        .amh-icon-btn { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 50%; background: transparent; border: 1px solid transparent; color: var(--amh-ink); font-size: 18px; cursor: pointer; text-decoration: none; transition: border-color .2s ease, color .2s ease; }
        .amh-icon-btn:hover { border-color: var(--amh-p); color: var(--amh-p); }
        .amh-search-toggle { display: none; }
        .amh-badge { position: absolute; top: 1px; right: 1px; min-width: 16px; height: 16px; padding: 0 3px; background: var(--amh-grad); color: #fff; font-size: 10px; font-weight: 700; border-radius: 999px; display: flex; align-items: center; justify-content: center; line-height: 1; }

        .amh-account { position: relative; }
        .amh-account-panel { position: absolute; right: 0; top: calc(100% + 10px); background: #fff; border: 1px solid var(--amh-line); border-radius: 12px; min-width: 190px; box-shadow: 0 18px 40px rgba(0,0,0,0.12); padding: 8px; display: flex; flex-direction: column; z-index: 600; }
        .amh-account-panel a, .amh-account-panel button { padding: 9px 14px; border-radius: 8px; font-size: 13.5px; color: var(--amh-ink); text-decoration: none; background: none; border: none; text-align: left; cursor: pointer; font-family: inherit; }
        .amh-account-panel a:hover, .amh-account-panel button:hover { background: #fdf1f4; color: var(--amh-p); }
        .amh-account-panel .amh-logout { color: var(--amh-p); font-weight: 600; }

        /* nav bar -- white, uppercase, brand-pink hover, like .ul-header-nav */
        .amh-nav { background: #fff; border-bottom: 1px solid var(--amh-line); position: relative; z-index: 490; }
        .amh-nav-list { max-width: 1360px; margin: 0 auto; display: flex; align-items: center; justify-content: center; list-style: none; padding: 0 24px; flex-wrap: nowrap; }
        .amh-nav-item { position: relative; flex-shrink: 0; }
        .amh-nav-item.is-mega-anchor { position: static; }
        .amh-nav-link { display: flex; align-items: center; gap: 5px; padding: 15px 13px; color: var(--amh-ink); font-size: 12.5px; font-weight: 500; letter-spacing: .03em; text-transform: uppercase; text-decoration: none; cursor: pointer; white-space: nowrap; transition: color .2s ease; }
        .amh-nav-item.has-menu:hover .amh-nav-link, .amh-nav-link:hover { color: var(--amh-p); }
        .amh-caret { font-size: 9px; opacity: .6; margin-left: -1px; }
        .amh-chip { background: var(--amh-grad); color: #fff; font-size: 9.5px; font-weight: 700; padding: 2px 7px; border-radius: 999px; letter-spacing: .03em; text-transform: uppercase; }

        /* mega panel */
        .amh-mega { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); width: min(1180px, 94vw); max-width: calc(100vw - 32px); max-height: calc(100vh - 140px); overflow-y: auto; background: #fff; border: 1px solid var(--amh-line); border-top: 3px solid var(--amh-p); border-radius: 0 0 14px 14px; box-shadow: 0 30px 60px rgba(0,0,0,0.14); padding: 30px 36px; display: flex; gap: 36px; z-index: 595; animation: amh-fade .16s ease; }
        @keyframes amh-fade { from { opacity: 0; transform: translateX(-50%) translateY(-6px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        .amh-mega-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 26px; flex: 1; }
        .amh-mega-col-title { display: block; font-size: 13px; font-weight: 600; letter-spacing: .03em; text-transform: uppercase; color: var(--amh-ink); text-decoration: none; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid var(--amh-p); }
        .amh-mega-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 9px; }
        .amh-mega-col li a { font-size: 13px; color: var(--amh-muted); text-decoration: none; transition: color .15s ease, padding-left .15s ease; display: inline-flex; align-items: center; gap: 6px; }
        .amh-mega-col li a:hover { color: var(--amh-p); padding-left: 3px; }
        .amh-mega-promo { width: 230px; flex-shrink: 0; border-radius: 12px; overflow: hidden; background: var(--amh-grad); padding: 22px; display: flex; flex-direction: column; justify-content: flex-end; min-height: 220px; text-decoration: none; }
        .amh-mega-promo-title { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 4px; }
        .amh-mega-promo-sub { font-size: 12.5px; color: rgba(255,255,255,0.85); margin: 0 0 10px; }
        .amh-mega-promo-cta { font-size: 12px; font-weight: 700; color: #fff; }

        .amh-flat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px 26px; flex: 1; }
        .amh-flat-grid a { font-size: 13px; text-transform: uppercase; letter-spacing: .02em; color: var(--amh-ink); text-decoration: none; padding: 8px 10px; border-radius: 8px; transition: background .15s ease, color .15s ease; }
        .amh-flat-grid a:hover { background: #fdf1f4; color: var(--amh-p); }

        /* simple dropdown */
        .amh-simple { position: absolute; top: 100%; left: 0; min-width: 220px; background: #fff; border: 1px solid var(--amh-line); border-top: 3px solid var(--amh-p); border-radius: 0 0 12px 12px; box-shadow: 0 24px 48px rgba(0,0,0,0.14); padding: 10px; z-index: 595; animation: amh-fade .16s ease; }
        .amh-simple ul { list-style: none; margin: 0; padding: 0; }
        .amh-simple li a { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: .02em; color: var(--amh-ink); text-decoration: none; border-radius: 8px; }
        .amh-simple li a:hover { background: #fdf1f4; color: var(--amh-p); }
        .amh-simple .amh-mini-chip { background: var(--amh-grad); color: #fff; font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: 999px; }

        /* mobile search overlay */
        .amh-search-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 900; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .amh-search-overlay-box { width: 100%; max-width: 560px; }
        .amh-search-mobile { background: #fff; border-radius: 999px; height: 54px; }
        .amh-overlay-close { display: block; margin: 20px auto 0; background: none; border: 2px solid rgba(255,255,255,0.5); border-radius: 50%; width: 44px; height: 44px; color: #fff; font-size: 22px; cursor: pointer; }

        /* mobile drawer -- left accent border, like the original .ul-sidebar */
        .amh-drawer-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 980; }
        .amh-drawer { position: fixed; top: 0; left: 0; height: 100%; width: min(340px, 86vw); background: #fff; border-left: 3px solid var(--amh-p); z-index: 990; display: flex; flex-direction: column; animation: amh-drawer-in .22s ease; box-shadow: 16px 0 50px rgba(0,0,0,0.18); }
        @keyframes amh-drawer-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .amh-drawer-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-bottom: 1px solid var(--amh-line); }
        .amh-drawer-head img { height: 42px; }
        .amh-drawer-head button { background: none; border: none; font-size: 18px; color: var(--amh-ink); cursor: pointer; }
        .amh-drawer-body { flex: 1; overflow-y: auto; padding: 8px 6px 24px; }
        .amh-drawer-footer { border-top: 1px solid var(--amh-line); margin-top: 10px; padding: 14px 16px 4px; display: flex; flex-direction: column; gap: 4px; }
        .amh-drawer-footer a, .amh-drawer-footer button { display: flex; align-items: center; gap: 10px; padding: 10px 6px; font-size: 14px; color: var(--amh-ink); text-decoration: none; background: none; border: none; text-align: left; cursor: pointer; font-family: inherit; }
        .amh-drawer-footer a:hover, .amh-drawer-footer button:hover { color: var(--amh-p); }

        @media (max-width: 1199px) {
          .amh-search { display: none; }
          .amh-search-toggle { display: inline-flex; }
        }
        @media (max-width: 991px) {
          .amh-burger { display: inline-flex; align-items: center; justify-content: center; }
          .amh-nav { display: none; }
          .amh-main-inner { gap: 14px; }
        }
        @media (max-width: 480px) {
          .amh-logo img { height: 44px; }
          .amh-main-inner { padding: 10px 14px; }
          .amh-announce { font-size: 11px; padding: 7px 12px; }
        }
      `}</style>
    </header>
  );
}

function MegaPanel({ item, onNavigate }) {
  const children = (item.children || []).filter(c => c.isActive !== false);
  const hasSubLevels = children.some(c => c.children && c.children.length > 0);

  if (!hasSubLevels) {
    return (
      <div className="amh-mega">
        <div className="amh-flat-grid">
          {children.map((c, i) => (
            <NavLinkSmart key={c._id || i} to={c.url} onClick={onNavigate}>{c.label}</NavLinkSmart>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="amh-mega">
      <div className="amh-mega-cols">
        {children.map((c, i) => (
          <div className="amh-mega-col" key={c._id || i}>
            <NavLinkSmart to={c.url} className="amh-mega-col-title" onClick={onNavigate}>{c.label}</NavLinkSmart>
            {c.children && c.children.length > 0 && (
              <ul>
                {c.children.filter(s => s.isActive !== false).map((s, j) => (
                  <li key={s._id || j}>
                    <NavLinkSmart to={s.url} onClick={onNavigate}>
                      {s.label}
                      {s.badge && <span className="amh-chip" style={{ fontSize: 8 }}>{s.badge}</span>}
                    </NavLinkSmart>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      {item.promo && item.promo.title && (
        <NavLinkSmart to={item.promo.url || '#'} className="amh-mega-promo" onClick={onNavigate}
          style={item.promo.image ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,.6)), url(${item.promo.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
          <p className="amh-mega-promo-title">{item.promo.title}</p>
          <p className="amh-mega-promo-sub">{item.promo.subtitle}</p>
          <span className="amh-mega-promo-cta">Shop now <i className="bi bi-arrow-right"></i></span>
        </NavLinkSmart>
      )}
    </div>
  );
}

function SimplePanel({ item, onNavigate }) {
  const children = (item.children || []).filter(c => c.isActive !== false);
  return (
    <div className="amh-simple">
      <ul>
        {children.map((c, i) => (
          <li key={c._id || i}>
            <NavLinkSmart to={c.url} onClick={onNavigate}>
              <span>{c.label}</span>
              {c.badge && <span className="amh-mini-chip">{c.badge}</span>}
            </NavLinkSmart>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MobileNode({ node, depth, pathKey, expanded, onToggle, onNavigate }) {
  const children = (node.children || []).filter(c => c.isActive !== false);
  const hasChildren = children.length > 0;
  const isOpen = !!expanded[pathKey];

  return (
    <div style={{ paddingLeft: depth * 14 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <NavLinkSmart
          to={node.url}
          onClick={onNavigate}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 10px',
            fontSize: depth === 0 ? 14.5 : 13, fontWeight: depth === 0 ? 600 : 500,
            textTransform: depth === 0 ? 'uppercase' : 'none', letterSpacing: depth === 0 ? '.03em' : 'normal',
            color: '#1a1a1a', textDecoration: 'none',
          }}
        >
          {node.label}
          {node.badge && (
            <span style={{ background: 'var(--amh-grad)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999 }}>
              {node.badge}
            </span>
          )}
        </NavLinkSmart>
        {hasChildren && (
          <button
            onClick={() => onToggle(pathKey)}
            aria-label="Expand"
            style={{ background: 'none', border: 'none', padding: '12px 14px', color: '#6b6b6b', fontSize: 14, cursor: 'pointer' }}
          >
            <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`}></i>
          </button>
        )}
      </div>
      {hasChildren && isOpen && (
        <div style={{ borderLeft: '2px solid rgba(0,0,0,0.08)', marginLeft: 12 }}>
          {children.map((c, i) => (
            <MobileNode
              key={c._id || i}
              node={c}
              depth={depth + 1}
              pathKey={`${pathKey}-${i}`}
              expanded={expanded}
              onToggle={onToggle}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}