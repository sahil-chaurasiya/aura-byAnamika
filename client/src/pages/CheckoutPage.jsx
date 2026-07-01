import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { selectCartItems, selectCartTotal, selectCoupon, clearCart } from '../store/slices/cartSlice';
import { selectSettings } from '../store/slices/settingsSlice';
import Breadcrumb from '../components/common/Breadcrumb';
import api from '../services/api';
import toast from 'react-hot-toast';

const STEPS = ['Shipping', 'Payment', 'Review'];

const inputStyle = {
  width: '100%', border: '1px solid rgba(0,0,0,0.2)', borderRadius: 10,
  padding: '12px 16px', fontSize: 15, outline: 'none', transition: '0.2s',
};

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const { subtotal, discount, shipping, tax, total } = useSelector(selectCartTotal);
  const coupon = useSelector(selectCoupon);
  const { currency_symbol = '$' } = useSelector(selectSettings);
  const { user, isAuthenticated } = useSelector(s => s.auth);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [shipping_, setShipping] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    company: '', address1: '', address2: '',
    city: '', state: '', postalCode: '', country: 'US',
    phone: user?.phone || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [guestEmail, setGuestEmail] = useState('');
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [customerNote, setCustomerNote] = useState('');

  const fmt = n => `${currency_symbol}${Number(n).toFixed(2)}`;

  if (items.length === 0) {
    return (
      <div className="ul-inner-page-container" style={{ textAlign: 'center', padding: 80 }}>
        <h2>Your cart is empty</h2>
        <Link to="/shop" className="ul-btn" style={{ marginTop: 20, display: 'inline-flex' }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  const validateShipping = () => {
    const required = ['firstName', 'lastName', 'address1', 'city', 'postalCode', 'country'];
    for (const field of required) {
      if (!shipping_[field]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    if (!isAuthenticated && !guestEmail) {
      toast.error('Please enter your email address');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        shippingAddress: shipping_,
        paymentMethod,
        couponCode: coupon?.code,
        customerNote,
        guestEmail: !isAuthenticated ? guestEmail : undefined,
      };

      const { data } = await api.post('/orders', orderData);
      dispatch(clearCart());
      navigate(`/order-success/${data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ShippingStep = () => (
    <div>
      <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 24 }}>Shipping Information</h3>

      {!isAuthenticated && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Email Address *</label>
          <input style={inputStyle} type="email" placeholder="your@email.com" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} />
          <p style={{ fontSize: 13, color: '#666', marginTop: 6 }}>
            Have an account? <Link to="/login" style={{ color: '#EF2853' }}>Login</Link> for faster checkout.
          </p>
        </div>
      )}

      <div className="row ul-bs-row">
        {[
          { label: 'First Name *', key: 'firstName', col: 'col-6' },
          { label: 'Last Name *', key: 'lastName', col: 'col-6' },
          { label: 'Company (Optional)', key: 'company', col: 'col-12' },
          { label: 'Address Line 1 *', key: 'address1', col: 'col-12' },
          { label: 'Address Line 2', key: 'address2', col: 'col-12' },
          { label: 'City *', key: 'city', col: 'col-6' },
          { label: 'State/Province', key: 'state', col: 'col-6' },
          { label: 'ZIP/Postal Code *', key: 'postalCode', col: 'col-6' },
          { label: 'Phone Number', key: 'phone', col: 'col-6' },
        ].map(({ label, key, col }) => (
          <div key={key} className={col} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>{label}</label>
            <input
              style={inputStyle}
              type={key === 'phone' ? 'tel' : 'text'}
              placeholder={label.replace(' *', '')}
              value={shipping_[key]}
              onChange={e => setShipping(s => ({ ...s, [key]: e.target.value }))}
            />
          </div>
        ))}
        <div className="col-6" style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Country *</label>
          <select
            style={{ ...inputStyle, cursor: 'pointer' }}
            value={shipping_.country}
            onChange={e => setShipping(s => ({ ...s, country: e.target.value }))}
          >
            {['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'IN', 'BR', 'MX'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Order Notes (Optional)</label>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
          placeholder="Special instructions for your order..."
          value={customerNote}
          onChange={e => setCustomerNote(e.target.value)}
        />
      </div>
    </div>
  );

  const PaymentStep = () => (
    <div>
      <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 24 }}>Payment Method</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { id: 'cod', label: 'Cash on Delivery', icon: 'bi-cash-coin', desc: 'Pay when your order arrives' },
          { id: 'card', label: 'Credit / Debit Card', icon: 'bi-credit-card', desc: 'Visa, Mastercard, American Express' },
          { id: 'paypal', label: 'PayPal', icon: 'bi-paypal', desc: 'Pay securely with your PayPal account' },
        ].map(method => (
          <label
            key={method.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: 20,
              border: `2px solid ${paymentMethod === method.id ? '#EF2853' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 14, cursor: 'pointer', transition: '0.2s',
              background: paymentMethod === method.id ? 'rgba(239,40,83,0.03)' : '#fff',
            }}
          >
            <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id}
              onChange={() => setPaymentMethod(method.id)} hidden />
            <div style={{
              width: 20, height: 20, borderRadius: '50%', border: `2px solid ${paymentMethod === method.id ? '#EF2853' : '#ccc'}`,
              background: paymentMethod === method.id ? '#EF2853' : 'transparent', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {paymentMethod === method.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
            </div>
            <i className={`bi ${method.icon}`} style={{ fontSize: 24, color: paymentMethod === method.id ? '#EF2853' : '#666' }}></i>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{method.label}</div>
              <div style={{ fontSize: 13, color: '#666' }}>{method.desc}</div>
            </div>
          </label>
        ))}
      </div>

      {paymentMethod === 'card' && (
        <div style={{ marginTop: 24, padding: 20, background: '#f9f9f9', borderRadius: 14 }}>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
            <i className="bi bi-shield-lock-fill me-2" style={{ color: '#22c55e' }}></i>
            Your payment is encrypted and secure
          </p>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Card Number</label>
            <input style={inputStyle} placeholder="1234 5678 9012 3456" maxLength={19} />
          </div>
          <div className="row ul-bs-row">
            <div className="col-6">
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Expiry Date</label>
              <input style={inputStyle} placeholder="MM/YY" maxLength={5} />
            </div>
            <div className="col-6">
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>CVV</label>
              <input style={inputStyle} placeholder="123" maxLength={4} type="password" />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const ReviewStep = () => (
    <div>
      <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 24 }}>Review Your Order</h3>

      {/* Shipping Summary */}
      <div style={{ background: '#f9f9f9', borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h4 style={{ fontWeight: 600, margin: 0 }}>Shipping To</h4>
          <button onClick={() => setStep(0)} style={{ color: '#EF2853', fontSize: 13, fontWeight: 500 }}>Edit</button>
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: '#444' }}>
          {shipping_.firstName} {shipping_.lastName}<br />
          {shipping_.address1}{shipping_.address2 ? `, ${shipping_.address2}` : ''}<br />
          {shipping_.city}, {shipping_.state} {shipping_.postalCode}<br />
          {shipping_.country}
        </p>
      </div>

      {/* Payment Summary */}
      <div style={{ background: '#f9f9f9', borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontWeight: 600, margin: 0 }}>Payment Method</h4>
          <button onClick={() => setStep(1)} style={{ color: '#EF2853', fontSize: 13, fontWeight: 500 }}>Edit</button>
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: '#444', textTransform: 'capitalize' }}>
          {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'card' ? 'Credit/Debit Card' : 'PayPal'}
        </p>
      </div>

      {/* Items */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ fontWeight: 600, marginBottom: 16 }}>Items ({items.length})</h4>
        {items.map(item => (
          <div key={`${item.product}-${item.size}`}
            style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <img src={item.thumbnail} alt={item.name} style={{ width: 60, height: 70, objectFit: 'cover', borderRadius: 8 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
              <div style={{ fontSize: 13, color: '#666' }}>
                {item.size && `Size: ${item.size}`}{item.size && item.color && ' · '}{item.color && `Color: ${item.color}`}
              </div>
              <div style={{ fontSize: 13, color: '#666' }}>Qty: {item.quantity}</div>
            </div>
            <div style={{ fontWeight: 600, color: '#EF2853' }}>
              {fmt(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Helmet><title>Checkout - Aura by Anamika</title></Helmet>

      <div className="ul-container">
        <Breadcrumb title="Checkout" links={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
      </div>

      <div className="ul-inner-page-container">
        <div className="ul-checkout">
          {/* Steps */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40, gap: 0 }}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i <= step ? '#EF2853' : '#f0f0f0', color: i <= step ? '#fff' : '#999',
                    fontWeight: 700, fontSize: 14, transition: '0.3s',
                  }}>
                    {i < step ? <i className="bi bi-check"></i> : i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: i === step ? 600 : 400, color: i === step ? '#EF2853' : '#666' }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < step ? '#EF2853' : '#f0f0f0', alignSelf: 'flex-start', marginTop: 17, transition: '0.3s' }} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="row ul-bs-row">
            {/* Form */}
            <div className="col-lg-7">
              <div style={{ background: '#fff', borderRadius: 20, padding: 30, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: 24 }}>
                {step === 0 && <ShippingStep />}
                {step === 1 && <PaymentStep />}
                {step === 2 && <ReviewStep />}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {step > 0 ? (
                  <button onClick={() => setStep(s => s - 1)} className="ul-btn">
                    <i className="bi bi-arrow-left"></i> Back
                  </button>
                ) : (
                  <Link to="/cart" className="ul-btn">
                    <i className="bi bi-arrow-left"></i> Back to Cart
                  </Link>
                )}

                {step < 2 ? (
                  <button
                    onClick={() => {
                      if (step === 0 && !validateShipping()) return;
                      setStep(s => s + 1);
                    }}
                    style={{
                      background: '#000', color: '#fff', borderRadius: 999, padding: '0 30px',
                      height: 50, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}
                  >
                    Continue <i className="bi bi-arrow-right"></i>
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(90deg, #EF2853, #FFA31A)', color: '#fff',
                      borderRadius: 999, padding: '0 36px', height: 54, border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 16,
                      opacity: loading ? 0.8 : 1, display: 'flex', alignItems: 'center', gap: 10,
                    }}
                  >
                    {loading ? 'Placing Order...' : 'Place Order'} <i className="bi bi-bag-check"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="col-lg-5">
              <div style={{ background: '#fff', borderRadius: 20, padding: 30, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'sticky', top: 20 }}>
                <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 20 }}>Order Summary</h3>

                <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 20 }}>
                  {items.map(item => (
                    <div key={`${item.product}-${item.size}`}
                      style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img src={item.thumbnail} alt={item.name} style={{ width: 56, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                        <span style={{ position: 'absolute', top: -8, right: -8, background: '#EF2853', color: '#fff', borderRadius: '50%', width: 20, height: 20, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {item.quantity}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{item.name}</div>
                        {item.size && <div style={{ fontSize: 11, color: '#999' }}>{item.size}{item.color ? ` · ${item.color}` : ''}</div>}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{fmt(item.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: '#666' }}>Subtotal</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#22c55e' }}>
                      <span>Discount ({coupon?.code})</span>
                      <span>-{fmt(discount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: '#666' }}>Shipping</span>
                    <span style={{ color: shipping === 0 ? '#22c55e' : undefined }}>{shipping === 0 ? 'FREE' : fmt(shipping)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: '#666' }}>Tax</span>
                    <span>{fmt(tax)}</span>
                  </div>
                  <div style={{ borderTop: '2px solid rgba(0,0,0,0.1)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}>
                    <span>Total</span>
                    <span style={{ color: '#EF2853' }}>{fmt(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}