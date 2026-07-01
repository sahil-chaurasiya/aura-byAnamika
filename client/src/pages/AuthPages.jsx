// LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { loginUser, clearError, registerUser } from '../store/slices/authSlice';
import { selectWishlistItems } from '../store/slices/wishlistSlice';
import { selectSettings } from '../store/slices/settingsSlice';
import Breadcrumb from '../components/common/Breadcrumb';
import ProductCard from '../components/product/ProductCard';
import api from '../services/api';
import toast from 'react-hot-toast';

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);

  const from = location.state?.from?.pathname || '/account';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
    return () => dispatch(clearError());
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  const inputStyle = { width: '100%', border: '1px solid rgba(0,0,0,0.2)', borderRadius: 10, padding: '14px 18px', fontSize: 15, outline: 'none' };

  return (
    <>
      <Helmet><title>Login - Aura by Anamika</title></Helmet>
      <div className="ul-container"><Breadcrumb title="Login" links={[{ label: 'Login' }]} /></div>
      <div className="ul-inner-page-container">
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: 'clamp(30px,3.15vw,60px)', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
            <h1 style={{ fontWeight: 700, fontSize: 'clamp(24px,1.58vw,30px)', marginBottom: 8 }}>Welcome Back</h1>
            <p style={{ color: '#666', marginBottom: 30, fontSize: 15 }}>Sign in to your account to continue</p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Email Address</label>
                <input style={inputStyle} type="email" placeholder="your@email.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 24, position: 'relative' }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Password</label>
                <input style={inputStyle} type={showPwd ? 'text' : 'password'} placeholder="Enter password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 16, top: 42, color: '#999', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, fontSize: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: '#EF2853' }} /> Remember me
                </label>
                <a href="#" style={{ color: '#EF2853' }}>Forgot password?</a>
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', background: 'linear-gradient(90deg,#EF2853,#FFA31A)', color: '#fff', border: 'none', borderRadius: 999, height: 54, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1 }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#666' }}>
              Don't have an account? <Link to="/signup" style={{ color: '#EF2853', fontWeight: 600 }}>Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// SignupPage.jsx
export function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useSelector(s => s.auth);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => { if (isAuthenticated) navigate('/account'); }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    const regResult = await dispatch(registerUser({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password }));
    if (registerUser.fulfilled.match(regResult)) {
      toast.success('Account created successfully!');
      navigate('/account');
    } else {
      toast.error(regResult.payload || 'Registration failed');
    }
  };

  const inputStyle = { width: '100%', border: '1px solid rgba(0,0,0,0.2)', borderRadius: 10, padding: '14px 18px', fontSize: 15, outline: 'none' };

  return (
    <>
      <Helmet><title>Sign Up - Aura by Anamika</title></Helmet>
      <div className="ul-container"><Breadcrumb title="Sign Up" links={[{ label: 'Sign Up' }]} /></div>
      <div className="ul-inner-page-container">
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: 'clamp(30px,3.15vw,60px)', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
            <h1 style={{ fontWeight: 700, fontSize: 'clamp(24px,1.58vw,30px)', marginBottom: 8 }}>Create Account</h1>
            <p style={{ color: '#666', marginBottom: 30, fontSize: 15 }}>Join thousands of fashion enthusiasts</p>

            <form onSubmit={handleSubmit}>
              <div className="row ul-bs-row">
                {[['First Name', 'firstName', 'col-6'], ['Last Name', 'lastName', 'col-6']].map(([label, key, col]) => (
                  <div key={key} className={col} style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>{label}</label>
                    <input style={inputStyle} type="text" placeholder={label} required value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Email Address</label>
                <input style={inputStyle} type="email" placeholder="your@email.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 20, position: 'relative' }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Password</label>
                <input style={inputStyle} type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 16, top: 42, color: '#999', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Confirm Password</label>
                <input style={inputStyle} type="password" placeholder="Repeat password" required value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', background: 'linear-gradient(90deg,#EF2853,#FFA31A)', color: '#fff', border: 'none', borderRadius: 999, height: 54, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1 }}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              <p style={{ fontSize: 12, color: '#999', marginTop: 12, textAlign: 'center' }}>
                By signing up, you agree to our <a href="#" style={{ color: '#EF2853' }}>Terms</a> and <a href="#" style={{ color: '#EF2853' }}>Privacy Policy</a>
              </p>
            </form>
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#666' }}>
              Already have an account? <Link to="/login" style={{ color: '#EF2853', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// OrderSuccessPage.jsx
export function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const { currency_symbol = '$' } = useSelector(selectSettings);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data.data)).catch(() => {});
  }, [id]);

  return (
    <>
      <Helmet><title>Order Confirmed - Aura by Anamika</title></Helmet>
      <div className="ul-inner-page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg,#EF2853,#FFA31A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <i className="bi bi-bag-check-fill" style={{ fontSize: 44, color: '#fff' }}></i>
        </div>
        <h1 style={{ fontWeight: 700, fontSize: 'clamp(24px,2.1vw,40px)', marginBottom: 12 }}>Order Confirmed!</h1>
        {order && <p style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>Order #{order.orderNumber}</p>}
        <p style={{ color: '#666', fontSize: 15, maxWidth: 500, margin: '0 auto 32px' }}>
          Thank you for your purchase! You'll receive a confirmation email shortly. Track your order in your account.
        </p>
        {order && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 30, maxWidth: 500, margin: '0 auto 32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#666', fontSize: 14 }}>Order Total</span>
              <span style={{ fontWeight: 700, color: '#EF2853', fontSize: 18 }}>{currency_symbol}{order.total?.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666', fontSize: 14 }}>Status</span>
              <span style={{ background: '#FFF3F5', color: '#EF2853', padding: '4px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{order.status}</span>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/account/orders" className="ul-btn">View Order</Link>
          <Link to="/shop" style={{ background: 'linear-gradient(90deg,#EF2853,#FFA31A)', color: '#fff', borderRadius: 999, padding: '0 30px', height: 52, display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600, textDecoration: 'none' }}>
            Continue Shopping <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    </>
  );
}

// WishlistPage.jsx
export function WishlistPage() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);
  const wishlistIds = useSelector(selectWishlistItems);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      api.get('/wishlist').then(r => setProducts(r.data.data)).catch(() => {}).finally(() => setLoading(false));
    }
  }, [isAuthenticated, wishlistIds.length]);

  return (
    <>
      <Helmet><title>Wishlist - Aura by Anamika</title></Helmet>
      <div className="ul-container"><Breadcrumb title="Wishlist" links={[{ label: 'Wishlist' }]} /></div>
      <div className="ul-inner-page-container">
        {!isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="bi bi-heart" style={{ fontSize: 64, color: '#EF2853', display: 'block', marginBottom: 16 }}></i>
            <h2>Save Your Favourites</h2>
            <p style={{ color: '#666', marginBottom: 24 }}>Sign in to save and view your wishlist across devices.</p>
            <Link to="/login" className="ul-btn">Sign In</Link>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="loader" style={{ margin: '0 auto' }}></div></div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="bi bi-heart" style={{ fontSize: 64, color: '#EF2853', display: 'block', marginBottom: 16 }}></i>
            <h2>Your Wishlist is Empty</h2>
            <p style={{ color: '#666', marginBottom: 24 }}>Start adding products you love!</p>
            <Link to="/shop" className="ul-btn">Shop Now</Link>
          </div>
        ) : (
          <>
            <div className="ul-section-heading">
              <h2 className="ul-section-title">My Wishlist ({products.length})</h2>
              <Link to="/shop" className="ul-btn">Continue Shopping</Link>
            </div>
            <div className="row row-cols-xl-4 row-cols-md-3 row-cols-2 row-cols-xxs-1 ul-bs-row">
              {products.map(product => (
                <div key={product._id} className="col">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// NotFoundPage.jsx
export function NotFoundPage() {
  return (
    <>
      <Helmet><title>404 - Page Not Found - Aura by Anamika</title></Helmet>
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h1 style={{ fontSize: 'clamp(80px,10vw,160px)', fontWeight: 800, color: '#EF2853', lineHeight: 1, marginBottom: 0 }}>404</h1>
        <h2 style={{ fontWeight: 600, fontSize: 'clamp(22px,2vw,36px)', marginBottom: 16 }}>Page Not Found</h2>
        <p style={{ color: '#666', fontSize: 16, maxWidth: 400, margin: '0 auto 32px' }}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" style={{ background: 'linear-gradient(90deg,#EF2853,#FFA31A)', color: '#fff', borderRadius: 999, padding: '14px 36px', textDecoration: 'none', fontWeight: 700, fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <i className="bi bi-house"></i> Go Home
        </Link>
      </div>
    </>
  );
}