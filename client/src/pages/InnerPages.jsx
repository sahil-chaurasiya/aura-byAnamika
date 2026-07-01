import React, { useEffect, useState } from 'react';
import { Link, useParams, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import Breadcrumb from '../components/common/Breadcrumb';
import { logoutUser } from '../store/slices/authSlice';
import { selectSettings } from '../store/slices/settingsSlice';
import toast from 'react-hot-toast';

// ──── BLOG PAGE ──────────────────────────────────────────────────
export function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  useEffect(() => {
    setLoading(true);
    api.get(`/blog?page=${page}&limit=9`)
      .then(r => { setPosts(r.data.data); setPagination(r.data.pagination); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <>
      <Helmet><title>Blog - Aura by Anamika</title></Helmet>
      <div className="ul-container"><Breadcrumb title="Blog" links={[{ label: 'Blog' }]} /></div>
      <div className="ul-inner-page-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="loader" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <div className="row row-cols-md-3 row-cols-sm-2 row-cols-1 ul-bs-row">
            {posts.map(post => (
              <div key={post._id} className="col">
                <article style={{ borderRadius: 20, overflow: 'hidden', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
                  {post.image && (
                    <Link to={`/blog/${post.slug}`}>
                      <div style={{ overflow: 'hidden', aspectRatio: '4/3' }}>
                        <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.4s ease' }}
                          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                      </div>
                    </Link>
                  )}
                  <div style={{ padding: 24 }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 13, color: '#999' }}>
                      {post.category && <span style={{ background: '#FEF4F6', color: '#EF2853', padding: '3px 10px', borderRadius: 999, fontWeight: 500 }}>{post.category}</span>}
                      <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                    </div>
                    <h3 style={{ fontWeight: 600, fontSize: 18, lineHeight: 1.3, marginBottom: 10 }}>
                      <Link to={`/blog/${post.slug}`} style={{ color: '#000' }}>{post.title}</Link>
                    </h3>
                    {post.excerpt && <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 16 }}>{post.excerpt}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666' }}>
                        {post.authorName && <><i className="bi bi-person-circle"></i>{post.authorName}</>}
                      </div>
                      <Link to={`/blog/${post.slug}`} style={{ color: '#EF2853', fontWeight: 600, fontSize: 14 }}>
                        Read More <i className="bi bi-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="ul-pagination">
            <ul>
              <li><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><i className="bi bi-chevron-left"></i></button></li>
              <li className="pages">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <a key={p} href="#" className={page === p ? 'active' : ''} onClick={e => { e.preventDefault(); setPage(p); }}>{p}</a>
                ))}
              </li>
              <li><button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><i className="bi bi-chevron-right"></i></button></li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

// ──── BLOG DETAIL PAGE ───────────────────────────────────────────
export function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/blog/${slug}`).then(r => setPost(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><div className="loader" style={{ margin: '0 auto' }}></div></div>;
  if (!post) return <div style={{ textAlign: 'center', padding: 80 }}><h2>Post not found</h2><Link to="/blog" className="ul-btn" style={{ marginTop: 20, display: 'inline-flex' }}>Back to Blog</Link></div>;

  return (
    <>
      <Helmet>
        <title>{post.title} - Aura by Anamika Blog</title>
        <meta name="description" content={post.excerpt || post.title} />
      </Helmet>
      <div className="ul-container"><Breadcrumb title="Blog Details" links={[{ label: 'Blog', to: '/blog' }, { label: post.title }]} /></div>
      <div className="ul-inner-page-container">
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          {post.image && <img src={post.image} alt={post.title} style={{ width: '100%', borderRadius: 20, marginBottom: 32, aspectRatio: '16/7', objectFit: 'cover' }} />}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
            {post.category && <span style={{ background: '#FEF4F6', color: '#EF2853', padding: '4px 14px', borderRadius: 999, fontWeight: 500, fontSize: 14 }}>{post.category}</span>}
            {post.publishedAt && <span style={{ color: '#999', fontSize: 14 }}>{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
            {post.authorName && <span style={{ color: '#666', fontSize: 14 }}><i className="bi bi-person me-1"></i>{post.authorName}</span>}
            <span style={{ color: '#999', fontSize: 14 }}><i className="bi bi-eye me-1"></i>{post.views} views</span>
          </div>
          <h1 style={{ fontWeight: 700, fontSize: 'clamp(24px,2.1vw,40px)', lineHeight: 1.2, marginBottom: 24 }}>{post.title}</h1>
          <div style={{ fontSize: 16, lineHeight: 1.9, color: '#444' }} dangerouslySetInnerHTML={{ __html: post.content }} />
          {post.tags?.length > 0 && (
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Tags:</span>
              {post.tags.map(tag => (
                <Link key={tag} to={`/blog?tag=${tag}`} style={{ background: '#f5f5f5', color: '#666', padding: '4px 12px', borderRadius: 999, fontSize: 13 }}>#{tag}</Link>
              ))}
            </div>
          )}
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
            <Link to="/blog" className="ul-btn"><i className="bi bi-arrow-left"></i> Back to Blog</Link>
          </div>
        </div>
      </div>
    </>
  );
}

// ──── ABOUT PAGE ─────────────────────────────────────────────────
export function AboutPage() {
  const settings = useSelector(selectSettings);
  return (
    <>
      <Helmet><title>About Us - Aura by Anamika</title></Helmet>
      <div className="ul-container"><Breadcrumb title="About Us" links={[{ label: 'About' }]} /></div>
      <div className="ul-inner-page-container">
        <div className="row ul-bs-row align-items-center" style={{ marginBottom: 60 }}>
          <div className="col-lg-6">
            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&h=500&fit=crop" alt="About Aura by Anamika" style={{ borderRadius: 24, width: '100%' }} />
          </div>
          <div className="col-lg-6">
            <span className="ul-section-sub-title">Our Story</span>
            <h2 className="ul-section-title" style={{ marginBottom: 20 }}>Premium Fashion for the Modern World</h2>
            <p style={{ color: '#555', lineHeight: 1.9, fontSize: 15, marginBottom: 16 }}>
              Founded with a passion for style and quality, {settings.store_name || 'Aura by Anamika'} has been bringing premium fashion to discerning customers worldwide. We believe fashion should be accessible, sustainable, and above all — beautiful.
            </p>
            <p style={{ color: '#555', lineHeight: 1.9, fontSize: 15, marginBottom: 24 }}>
              Our curated collections span everything from everyday essentials to statement pieces for special occasions. Every product is carefully selected for quality, style, and value.
            </p>
            <div className="row ul-bs-row" style={{ marginBottom: 24 }}>
              {[{ num: '50K+', label: 'Happy Customers' }, { num: '5K+', label: 'Products' }, { num: '100+', label: 'Brands' }, { num: '50+', label: 'Countries' }].map(stat => (
                <div key={stat.label} className="col-6" style={{ marginBottom: 16 }}>
                  <div style={{ textAlign: 'center', background: '#FEF4F6', borderRadius: 16, padding: 20 }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#EF2853' }}>{stat.num}</div>
                    <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/shop" className="ul-btn">Shop Our Collection <i className="bi bi-arrow-right"></i></Link>
          </div>
        </div>

        {/* Team */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="ul-section-sub-title">Our People</span>
          <h2 className="ul-section-title">Meet the Team</h2>
        </div>
        <div className="row row-cols-md-4 row-cols-2 ul-bs-row">
          {[{ name: 'Sarah Johnson', role: 'CEO & Founder', img: 'https://randomuser.me/api/portraits/women/44.jpg' }, { name: 'Michael Chen', role: 'Creative Director', img: 'https://randomuser.me/api/portraits/men/32.jpg' }, { name: 'Emma Williams', role: 'Head of Design', img: 'https://randomuser.me/api/portraits/women/68.jpg' }, { name: 'David Martinez', role: 'Marketing Lead', img: 'https://randomuser.me/api/portraits/men/75.jpg' }].map(member => (
            <div key={member.name} className="col">
              <div style={{ textAlign: 'center' }}>
                <img src={member.img} alt={member.name} style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '4px solid #FEF4F6', marginBottom: 12 }} />
                <h4 style={{ fontWeight: 600, marginBottom: 4 }}>{member.name}</h4>
                <p style={{ color: '#EF2853', fontSize: 14 }}>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ──── CONTACT PAGE ───────────────────────────────────────────────
export function ContactPage() {
  const settings = useSelector(selectSettings);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

  const inputStyle = { width: '100%', border: '1px solid rgba(0,0,0,0.2)', borderRadius: 10, padding: '14px 18px', fontSize: 15, outline: 'none' };

  return (
    <>
      <Helmet><title>Contact Us - Aura by Anamika</title></Helmet>
      <div className="ul-container"><Breadcrumb title="Contact" links={[{ label: 'Contact' }]} /></div>
      <div className="ul-inner-page-container">
        <div className="row ul-bs-row">
          <div className="col-lg-4">
            <h2 style={{ fontWeight: 700, marginBottom: 24, fontSize: 'clamp(22px,1.58vw,30px)' }}>Get in Touch</h2>
            {[
              { icon: 'bi-geo-alt-fill', title: 'Address', text: settings.store_address || '123 Fashion Street, New York, NY 10001' },
              { icon: 'bi-telephone-fill', title: 'Phone', text: `${settings.phone_1 || '(500) 8001 8588'}, ${settings.phone_2 || '(500) 544 6550'}` },
              { icon: 'bi-envelope-fill', title: 'Email', text: settings.store_email || 'hello@glamics.com' },
              { icon: 'bi-clock-fill', title: 'Business Hours', text: 'Mon – Fri: 9AM – 6PM EST' },
            ].map(item => (
              <div key={item.title} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FEF4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`bi ${item.icon}`} style={{ color: '#EF2853', fontSize: 20 }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ color: '#666', fontSize: 14, lineHeight: 1.6 }}>{item.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="col-lg-8">
            <div style={{ background: '#fff', borderRadius: 24, padding: 'clamp(24px,2.1vw,40px)', boxShadow: '0 4px 30px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontWeight: 600, marginBottom: 24, fontSize: 22 }}>Send us a Message</h3>
              <form onSubmit={handleSubmit}>
                <div className="row ul-bs-row">
                  {[['Full Name', 'name', 'col-6', 'text'], ['Email Address', 'email', 'col-6', 'email']].map(([label, key, col, type]) => (
                    <div key={key} className={col} style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>{label} *</label>
                      <input style={inputStyle} type={type} required value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="col-12" style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Subject *</label>
                    <input style={inputStyle} type="text" required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
                  </div>
                  <div className="col-12" style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Message *</label>
                    <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 140 }} required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                  </div>
                </div>
                <button type="submit" disabled={sending} style={{ background: 'linear-gradient(90deg,#EF2853,#FFA31A)', color: '#fff', border: 'none', borderRadius: 999, padding: '14px 36px', fontSize: 15, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.8 : 1 }}>
                  {sending ? 'Sending...' : 'Send Message'} <i className="bi bi-send"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ──── FAQ PAGE ───────────────────────────────────────────────────
export function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => { api.get('/faq').then(r => setFaqs(r.data.data)).catch(() => {}); }, []);

  return (
    <>
      <Helmet><title>FAQ - Aura by Anamika</title></Helmet>
      <div className="ul-container"><Breadcrumb title="FAQ" links={[{ label: 'FAQ' }]} /></div>
      <div className="ul-inner-page-container">
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="ul-section-sub-title">Got Questions?</span>
            <h2 className="ul-section-title">Frequently Asked Questions</h2>
          </div>
          {faqs.map((faq, i) => (
            <div key={faq._id} className={`ul-single-accordion-item ${open === i ? 'open' : ''}`} onClick={() => setOpen(open === i ? null : i)} style={{ cursor: 'pointer' }}>
              <div className="ul-single-accordion-item__header">
                <h5 className="ul-single-accordion-item__title">{faq.question}</h5>
                <span className="icon"><i className={`bi bi-${open === i ? 'dash' : 'plus'}`}></i></span>
              </div>
              <div className="ul-single-accordion-item__body">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ──── ACCOUNT PAGE ───────────────────────────────────────────────
export function AccountPage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { currency_symbol = '$' } = useSelector(selectSettings);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [profileForm, setProfileForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => { api.get('/orders/my').then(r => setOrders(r.data.data)).catch(() => {}); }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', profileForm);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
  };

  const handleChangePwd = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) return toast.error('Passwords do not match');
    try {
      await api.put('/auth/change-password', pwdForm);
      toast.success('Password changed!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
  };

  const handleLogout = () => { dispatch(logoutUser()); navigate('/'); };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid' },
    { id: 'orders', label: 'My Orders', icon: 'bi-bag' },
    { id: 'wishlist', label: 'Wishlist', icon: 'bi-heart' },
    { id: 'profile', label: 'Edit Profile', icon: 'bi-person' },
    { id: 'password', label: 'Change Password', icon: 'bi-shield-lock' },
    { id: 'addresses', label: 'Addresses', icon: 'bi-geo-alt' },
  ];

  const inputStyle = { width: '100%', border: '1px solid rgba(0,0,0,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none' };

  const statusColor = { pending: '#f97316', processing: '#3b82f6', shipped: '#8b5cf6', delivered: '#22c55e', cancelled: '#ef4444' };

  return (
    <>
      <Helmet><title>My Account - Aura by Anamika</title></Helmet>
      <div className="ul-inner-page-container">
        <div className="row ul-bs-row">
          {/* Sidebar */}
          <div className="col-lg-3">
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'sticky', top: 20 }}>
              <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#EF2853,#FFA31A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#fff', fontSize: 32, fontWeight: 700 }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>{user?.email}</div>
              </div>
              <nav className="account-nav" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {navItems.map(item => (
                  <button key={item.id} onClick={() => setActiveView(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10, cursor: 'pointer', background: activeView === item.id ? 'rgba(239,40,83,0.08)' : 'transparent', color: activeView === item.id ? '#EF2853' : '#333', border: 'none', textAlign: 'left', width: '100%', fontSize: 14, fontWeight: activeView === item.id ? 600 : 400 }}>
                    <i className={`bi ${item.icon}`} style={{ fontSize: 16 }}></i> {item.label}
                  </button>
                ))}
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10, cursor: 'pointer', background: 'transparent', color: '#ef4444', border: 'none', textAlign: 'left', width: '100%', fontSize: 14, marginTop: 8 }}>
                  <i className="bi bi-box-arrow-right" style={{ fontSize: 16 }}></i> Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="col-lg-9">
            <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(20px,2.1vw,40px)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>

              {/* Dashboard */}
              {activeView === 'dashboard' && (
                <div>
                  <h2 style={{ fontWeight: 700, marginBottom: 24 }}>Welcome back, {user?.firstName}!</h2>
                  <div className="row ul-bs-row" style={{ marginBottom: 32 }}>
                    {[{ label: 'Total Orders', value: orders.length, icon: 'bi-bag', color: '#EF2853' }, { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: 'bi-clock', color: '#f97316' }, { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, icon: 'bi-check-circle', color: '#22c55e' }].map(stat => (
                      <div key={stat.label} className="col-4">
                        <div style={{ background: '#f9f9f9', borderRadius: 16, padding: 20, textAlign: 'center' }}>
                          <i className={`bi ${stat.icon}`} style={{ fontSize: 28, color: stat.color, display: 'block', marginBottom: 8 }}></i>
                          <div style={{ fontWeight: 800, fontSize: 28, color: stat.color }}>{stat.value}</div>
                          <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{stat.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Recent Orders</h3>
                  {orders.slice(0, 3).map(order => (
                    <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>#{order.orderNumber}</div>
                        <div style={{ fontSize: 13, color: '#999' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                      <span style={{ background: `${statusColor[order.status] || '#999'}20`, color: statusColor[order.status] || '#999', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{order.status}</span>
                      <div style={{ fontWeight: 700 }}>{currency_symbol}{order.total?.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Orders */}
              {activeView === 'orders' && (
                <div>
                  <h2 style={{ fontWeight: 700, marginBottom: 24 }}>My Orders</h2>
                  {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                      <i className="bi bi-bag-x" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}></i>
                      <p>No orders yet. <Link to="/shop" style={{ color: '#EF2853' }}>Start shopping!</Link></p>
                    </div>
                  ) : orders.map(order => (
                    <div key={order._id} style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>Order #{order.orderNumber}</span>
                          <span style={{ color: '#999', fontSize: 13, marginLeft: 12 }}>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <span style={{ background: `${statusColor[order.status] || '#999'}20`, color: statusColor[order.status] || '#999', padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{order.status}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 14 }}>
                        <span style={{ color: '#666' }}>{order.items?.length} item(s)</span>
                        <span style={{ fontWeight: 700, color: '#EF2853', fontSize: 16 }}>{currency_symbol}{order.total?.toFixed(2)}</span>
                      </div>
                      {order.trackingNumber && (
                        <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
                          <i className="bi bi-truck me-2"></i>Tracking: {order.trackingNumber}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Profile */}
              {activeView === 'profile' && (
                <div>
                  <h2 style={{ fontWeight: 700, marginBottom: 24 }}>Edit Profile</h2>
                  <form onSubmit={handleUpdateProfile}>
                    <div className="row ul-bs-row">
                      {[['First Name', 'firstName', 'col-6'], ['Last Name', 'lastName', 'col-6'], ['Phone', 'phone', 'col-12']].map(([label, key, col]) => (
                        <div key={key} className={col} style={{ marginBottom: 20 }}>
                          <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>{label}</label>
                          <input style={inputStyle} type="text" value={profileForm[key] || ''} onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))} />
                        </div>
                      ))}
                      <div className="col-12" style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Email (cannot change)</label>
                        <input style={{ ...inputStyle, background: '#f9f9f9', color: '#999' }} type="email" value={user?.email || ''} disabled />
                      </div>
                    </div>
                    <button type="submit" style={{ background: '#000', color: '#fff', borderRadius: 999, padding: '12px 32px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      Save Changes
                    </button>
                  </form>
                </div>
              )}

              {/* Change Password */}
              {activeView === 'password' && (
                <div>
                  <h2 style={{ fontWeight: 700, marginBottom: 24 }}>Change Password</h2>
                  <form onSubmit={handleChangePwd} style={{ maxWidth: 480 }}>
                    {[['Current Password', 'currentPassword'], ['New Password', 'newPassword'], ['Confirm New Password', 'confirmPassword']].map(([label, key]) => (
                      <div key={key} style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>{label}</label>
                        <input style={inputStyle} type="password" value={pwdForm[key]} onChange={e => setPwdForm(f => ({ ...f, [key]: e.target.value }))} required />
                      </div>
                    ))}
                    <button type="submit" style={{ background: '#000', color: '#fff', borderRadius: 999, padding: '12px 32px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      Update Password
                    </button>
                  </form>
                </div>
              )}

              {/* Wishlist */}
              {activeView === 'wishlist' && (
                <div>
                  <h2 style={{ fontWeight: 700, marginBottom: 24 }}>My Wishlist</h2>
                  <p style={{ color: '#666' }}>View and manage your saved items. <Link to="/wishlist" style={{ color: '#EF2853' }}>View full wishlist</Link></p>
                </div>
              )}

              {/* Addresses */}
              {activeView === 'addresses' && (
                <div>
                  <h2 style={{ fontWeight: 700, marginBottom: 24 }}>My Addresses</h2>
                  {user?.addresses?.length === 0 ? (
                    <p style={{ color: '#666' }}>No addresses saved yet. Add one during checkout.</p>
                  ) : user?.addresses?.map((addr, i) => (
                    <div key={i} style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                      {addr.isDefault && <span style={{ background: '#FEF4F6', color: '#EF2853', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, marginBottom: 10, display: 'inline-block' }}>Default</span>}
                      <p style={{ margin: 0, lineHeight: 1.8, fontSize: 14, color: '#444' }}>
                        {addr.firstName} {addr.lastName}<br />
                        {addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}<br />
                        {addr.city}, {addr.state} {addr.postalCode}<br />
                        {addr.country}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}