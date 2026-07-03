import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminMe } from './store/slices/authSlice';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/products/ProductsPage';
import ProductFormPage from './pages/products/ProductFormPage';
import MenuBuilderPage from './pages/menus/MenuBuilderPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import UsersPage from './pages/users/UsersPage';
import BlogPage from './pages/blog/BlogPage';
import BlogFormPage from './pages/blog/BlogFormPage';
import BannersPage from './pages/banners/BannersPage';
import HeroPage from './pages/hero/HeroPage';
import HomepageBuilderPage from './pages/homepage/HomepageBuilderPage';
import SettingsPage from './pages/settings/SettingsPage';
import MediaPage from './pages/media/MediaPage';
import CouponsPage from './pages/coupons/CouponsPage';
import FaqsPage from './pages/faqs/FaqsPage';
import TestimonialsPage from './pages/testimonials/TestimonialsPage';
import ReviewsPage from './pages/reviews/ReviewsPage';

function RequireAuth({ children }) {
  const { admin, token, initialized } = useSelector(s => s.auth);
  if (!initialized && token) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #EF2853', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }}></div>
        <p style={{ color: '#666' }}>Loading...</p>
      </div>
    </div>
  );
  if (!admin && !token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    if (localStorage.getItem('adminToken')) dispatch(fetchAdminMe());
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id/edit" element={<ProductFormPage />} />
          <Route path="menus" element={<MenuBuilderPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/new" element={<BlogFormPage />} />
          <Route path="blog/:id/edit" element={<BlogFormPage />} />
          <Route path="banners" element={<BannersPage />} />
          <Route path="hero" element={<HeroPage />} />
          <Route path="homepage" element={<HomepageBuilderPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="faqs" element={<FaqsPage />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}