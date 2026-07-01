import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  selectCartItems, selectCartTotal, selectCoupon,
  removeFromCart, updateQuantity, applyCoupon, removeCoupon
} from '../store/slices/cartSlice';
import { selectSettings } from '../store/slices/settingsSlice';
import Breadcrumb from '../components/common/Breadcrumb';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const { subtotal, discount, shipping, tax, total } = useSelector(selectCartTotal);
  const coupon = useSelector(selectCoupon);
  const { currency_symbol = '$' } = useSelector(selectSettings);
  const { user } = useSelector(s => s.auth);

  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const fmt = (n) => `${currency_symbol}${Number(n).toFixed(2)}`;

  const handleQty = (item, qty) => {
    dispatch(updateQuantity({ productId: item.product, size: item.size, color: item.color, quantity: qty }));
  };

  const handleRemove = (item) => {
    dispatch(removeFromCart({ productId: item.product, size: item.size, color: item.color }));
    toast.success('Item removed from cart');
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const { data } = await api.post('/cart/apply-coupon', {
        code: couponCode,
        subtotal,
        userId: user?._id,
      });
      dispatch(applyCoupon(data.data));
      toast.success(`Coupon applied! You saved ${fmt(data.data.discount)}`);
      setCouponCode('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Helmet><title>Cart - Aura by Anamika</title></Helmet>
        <div className="ul-inner-page-container" style={{ textAlign: 'center', padding: '80px 0' }}>
          <i className="bi bi-bag-x" style={{ fontSize: 72, color: '#EF2853', display: 'block', marginBottom: 20 }}></i>
          <h2 style={{ fontWeight: 600, marginBottom: 12 }}>Your Cart is Empty</h2>
          <p style={{ color: '#666', marginBottom: 30 }}>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/shop" className="ul-btn">
            Start Shopping <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Cart ({items.length}) - Aura by Anamika</title></Helmet>

      <div className="ul-container">
        <Breadcrumb title="Cart" links={[{ label: 'Cart' }]} />
      </div>

      <div className="ul-inner-page-container">
        <div className="ul-cart">
          <div className="row ul-bs-row">
            {/* Cart Items */}
            <div className="col-lg-8">
              <div className="ul-cart-items-wrapper">
                {/* Table Header */}
                <div className="ul-cart-table-header d-none d-md-grid"
                  style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr auto', gap: 16, padding: '12px 0', borderBottom: '2px solid rgba(0,0,0,0.1)', marginBottom: 16, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                  <span>Product</span>
                  <span style={{ textAlign: 'center' }}>Price</span>
                  <span style={{ textAlign: 'center' }}>Quantity</span>
                  <span style={{ textAlign: 'center' }}>Total</span>
                  <span></span>
                </div>

                {items.map((item, i) => (
                  <div key={`${item.product}-${item.size}-${item.color}`}
                    style={{
                      display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr auto',
                      gap: 16, alignItems: 'center', padding: '20px 0',
                      borderBottom: '1px solid rgba(0,0,0,0.08)',
                    }}
                    className="ul-cart-item"
                  >
                    {/* Product Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <Link to={`/shop/${item.slug}`} style={{ flexShrink: 0 }}>
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          style={{ width: 80, height: 90, objectFit: 'cover', borderRadius: 12 }}
                        />
                      </Link>
                      <div>
                        <Link to={`/shop/${item.slug}`} style={{ color: '#000', fontWeight: 500, fontSize: 15, display: 'block', marginBottom: 4 }}>
                          {item.name}
                        </Link>
                        {item.size && <div style={{ fontSize: 13, color: '#666' }}>Size: {item.size}</div>}
                        {item.color && <div style={{ fontSize: 13, color: '#666' }}>Color: {item.color}</div>}
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: 'center', fontWeight: 500 }}>{fmt(item.price)}</div>

                    {/* Quantity */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(0,0,0,0.2)', borderRadius: 8 }}>
                        <button onClick={() => handleQty(item, item.quantity - 1)} style={{ padding: '6px 10px', fontSize: 16 }}>
                          <i className="bi bi-dash"></i>
                        </button>
                        <span style={{ padding: '0 12px', fontWeight: 500, minWidth: 32, textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => handleQty(item, item.quantity + 1)} style={{ padding: '6px 10px', fontSize: 16 }}>
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div style={{ textAlign: 'center', fontWeight: 600, color: '#EF2853' }}>
                      {fmt(item.price * item.quantity)}
                    </div>

                    {/* Remove */}
                    <button onClick={() => handleRemove(item)} style={{ color: '#999', fontSize: 20, padding: 4 }}
                      title="Remove item">
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                ))}

                {/* Cart Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginTop: 24 }}>
                  <Link to="/shop" className="ul-btn" style={{ fontSize: 14 }}>
                    <i className="bi bi-arrow-left"></i> Continue Shopping
                  </Link>
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="col-lg-4">
              <div style={{ background: '#fff', borderRadius: 20, padding: 30, boxShadow: '0 4px 30px rgba(0,0,0,0.06)', position: 'sticky', top: 20 }}>
                <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 24 }}>Order Summary</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                    <span style={{ color: '#666' }}>Subtotal ({items.length} items)</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: '#22c55e' }}>
                      <span>Coupon Discount {coupon && `(${coupon.code})`}</span>
                      <span>-{fmt(discount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                    <span style={{ color: '#666' }}>Shipping</span>
                    <span style={{ color: shipping === 0 ? '#22c55e' : undefined }}>
                      {shipping === 0 ? 'FREE' : fmt(shipping)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                    <span style={{ color: '#666' }}>Tax (8%)</span>
                    <span>{fmt(tax)}</span>
                  </div>
                  {shipping > 0 && (
                    <div style={{ fontSize: 13, color: '#EF2853', textAlign: 'right' }}>
                      Add {fmt(100 - subtotal)} more for free shipping!
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}>
                    <span>Total</span>
                    <span style={{ color: '#EF2853' }}>{fmt(total)}</span>
                  </div>
                </div>

                {/* Coupon */}
                {!coupon ? (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>Have a coupon code?</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                        style={{ flex: 1, border: '1px solid rgba(0,0,0,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 14 }}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon}
                        style={{
                          background: '#000', color: '#fff', borderRadius: 8,
                          padding: '0 16px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                        }}
                      >
                        {applyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#22c55e', fontSize: 14 }}>
                        <i className="bi bi-tag-fill me-2"></i>{coupon.code}
                      </span>
                      <div style={{ fontSize: 13, color: '#666' }}>You saved {fmt(discount)}</div>
                    </div>
                    <button onClick={() => dispatch(removeCoupon())} style={{ color: '#ef4444', fontSize: 18 }}>
                      <i className="bi bi-x-circle"></i>
                    </button>
                  </div>
                )}

                <button
                  onClick={() => navigate('/checkout')}
                  style={{
                    width: '100%', background: 'linear-gradient(90deg, #EF2853, #FFA31A)',
                    color: '#fff', border: 'none', borderRadius: 999, padding: '16px',
                    fontWeight: 600, fontSize: 16, cursor: 'pointer', transition: '0.3s',
                    letterSpacing: 0.5,
                  }}
                >
                  Proceed to Checkout <i className="bi bi-arrow-right"></i>
                </button>

                {/* Trust badges */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20, color: '#999', fontSize: 12 }}>
                  <span><i className="bi bi-shield-check me-1"></i>Secure</span>
                  <span><i className="bi bi-truck me-1"></i>Fast Shipping</span>
                  <span><i className="bi bi-arrow-return-left me-1"></i>Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}