import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { adminLogin, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, admin } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (admin) navigate('/', { replace: true });
    return () => dispatch(clearError());
  }, [admin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(adminLogin(form));
    if (adminLogin.fulfilled.match(res)) {
      toast.success('Welcome back, ' + res.payload.data.firstName + '!');
      navigate('/', { replace: true });
    } else {
      toast.error(res.payload || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img src="/assets/img/logo.png" alt="Aura by Anamika" style={{ height: 60, objectFit: "contain" }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8, fontSize: 14 }}>
            Sign in to manage your store
          </p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 40, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-envelope" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#999' }}></i>
                <input
                  className="form-control"
                  style={{ paddingLeft: 40 }}
                  type="email"
                  placeholder="admin@aura.com"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#999' }}></i>
                <input
                  className="form-control"
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter password"
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>
                  <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                <i className="bi bi-exclamation-triangle me-2"></i>{error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', background: 'linear-gradient(90deg,#EF2853,#FFA31A)',
                color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, transition: '0.2s',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 24, padding: 16, background: '#f9f9f9', borderRadius: 10, fontSize: 13, color: '#666', textAlign: 'center' }}>
            <strong>Demo credentials:</strong><br />
            Email: admin@aura.com<br />
            Password: admin123456
          </div>
        </div>
      </div>
    </div>
  );
}