import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

// ──── SHARED HOOKS ────────────────────────────────────────────────
function useCrud(endpoint) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (search) params.set('search', search);
      const { data } = await api.get(`${endpoint}?${params}`);
      setItems(data.data);
      if (data.pagination) setPagination(data.pagination);
    } catch { }
    finally { setLoading(false); }
  }, [endpoint, page, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const remove = async (id) => {
    try {
      await api.delete(`${endpoint}/${id}`);
      toast.success('Deleted successfully');
      fetch();
    } catch { toast.error('Delete failed'); }
  };

  return { items, loading, pagination, page, setPage, search, setSearch, fetch, remove };
}

// ──── STATUS BADGE ────────────────────────────────────────────────
const STATUS_MAP = {
  pending: 'badge-warning', processing: 'badge-info', shipped: 'badge-purple',
  delivered: 'badge-success', cancelled: 'badge-danger', refunded: 'badge-gray',
  active: 'badge-success', inactive: 'badge-gray',
};

// ──── ORDERS PAGE ─────────────────────────────────────────────────
export function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const { data } = await api.get(`/orders/admin/all?${params}`);
      setOrders(data.data);
      setPagination(data.pagination);
    } catch { } finally { setLoading(false); }
  }, [page, status, search]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Orders</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>{pagination.total} total orders</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ padding: '14px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar">
            <i className="bi bi-search"></i>
            <input placeholder="Search by order # or customer..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="form-control" style={{ width: 150 }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            {['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Status</th><th>Payment</th><th>Total</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                Array(6).fill(0).map((_, i) => <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14, width: j === 0 ? 100 : 80 }}></div></td>)}</tr>)
              ) : orders.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><i className="bi bi-bag-x"></i><h3>No orders found</h3></div></td></tr>
              ) : orders.map(order => (
                <tr key={order._id}>
                  <td><Link to={`/orders/${order._id}`} style={{ color: 'var(--primary)', fontWeight: 700 }}>#{order.orderNumber}</Link></td>
                  <td>
                    <div style={{ fontSize: 13 }}>{order.user?.firstName || 'Guest'} {order.user?.lastName || ''}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{order.user?.email || order.guestEmail || ''}</div>
                  </td>
                  <td><span style={{ fontSize: 13 }}>{order.items?.length} items</span></td>
                  <td><span className={`badge ${STATUS_MAP[order.status] || 'badge-gray'}`}>{order.status}</span></td>
                  <td><span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>{order.paymentStatus}</span></td>
                  <td><span style={{ fontWeight: 700, fontSize: 14 }}>${order.total?.toFixed(2)}</span></td>
                  <td><span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</span></td>
                  <td>
                    <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm btn-icon" title="View"><i className="bi bi-eye"></i></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="admin-pagination">
            <span>Page {page} of {pagination.pages}</span>
            <div className="admin-pagination-btns">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><i className="bi bi-chevron-left"></i></button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}><i className="bi bi-chevron-right"></i></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ──── ORDER DETAIL ────────────────────────────────────────────────
export function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusForm, setStatusForm] = useState({ status: '', note: '', trackingNumber: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => { setOrder(r.data.data); setStatusForm(f => ({ ...f, status: r.data.data.status })); }).catch(() => toast.error('Order not found')).finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { data } = await api.put(`/orders/${id}/status`, statusForm);
      setOrder(data.data);
      toast.success('Order status updated!');
    } catch { toast.error('Update failed'); }
    finally { setUpdating(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><div style={{ width: 40, height: 40, border: '3px solid #EF2853', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}></div></div>;
  if (!order) return <div className="empty-state"><h3>Order not found</h3></div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Link to="/orders" className="btn btn-outline btn-sm"><i className="bi bi-arrow-left"></i></Link>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>Order #{order.orderNumber}</h1>
          <span className={`badge ${STATUS_MAP[order.status] || 'badge-gray'}`}>{order.status}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Items */}
          <div className="card">
            <div className="card-header"><span className="card-title">Order Items</span></div>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead>
                <tbody>
                  {order.items?.map((item, i) => (
                    <tr key={i}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {item.image && <img src={item.image} alt={item.name} style={{ width: 44, height: 50, objectFit: 'cover', borderRadius: 8 }} />}
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.size && `Size: ${item.size}`} {item.color && `· Color: ${item.color}`}</div>
                        </div>
                      </div></td>
                      <td>${item.price?.toFixed(2)}</td>
                      <td>×{item.quantity}</td>
                      <td style={{ fontWeight: 600 }}>${(item.price * item.quantity)?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              {[['Subtotal', order.subtotal], ['Shipping', order.shippingCost], ['Tax', order.tax], ['Discount', order.discount ? -order.discount : null]].map(([label, val]) => val != null && val !== 0 && (
                <div key={label} style={{ display: 'flex', gap: 40, fontSize: 14 }}>
                  <span style={{ color: 'var(--muted)' }}>{label}</span>
                  <span style={{ color: label === 'Discount' ? '#22c55e' : undefined }}>{label === 'Discount' ? '-' : ''}${Math.abs(val)?.toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 40, fontWeight: 700, fontSize: 16, borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                <span>Total</span><span style={{ color: 'var(--primary)' }}>${order.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="card">
            <div className="card-header"><span className="card-title">Shipping Address</span></div>
            <div className="card-body" style={{ fontSize: 14, lineHeight: 1.8 }}>
              {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}<br />
              {order.shippingAddress?.address1}{order.shippingAddress?.address2 ? `, ${order.shippingAddress.address2}` : ''}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
              {order.shippingAddress?.country}<br />
              {order.shippingAddress?.phone && <><i className="bi bi-telephone"></i> {order.shippingAddress.phone}</>}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Update Status */}
          <div className="card">
            <div className="card-header"><span className="card-title">Update Status</span></div>
            <div className="card-body">
              <form onSubmit={handleStatusUpdate}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={statusForm.status} onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}>
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tracking Number</label>
                  <input className="form-control" placeholder="e.g. 1Z999AA10123456784" value={statusForm.trackingNumber} onChange={e => setStatusForm(f => ({ ...f, trackingNumber: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Note (optional)</label>
                  <textarea className="form-control" style={{ minHeight: 60 }} placeholder="Add a note..." value={statusForm.note} onChange={e => setStatusForm(f => ({ ...f, note: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={updating}>
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card">
            <div className="card-header"><span className="card-title">Order Info</span></div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                {[
                  ['Placed', new Date(order.createdAt).toLocaleString()],
                  ['Payment', order.paymentMethod?.toUpperCase()],
                  ['Payment Status', order.paymentStatus],
                  ['Customer', order.user?.email || order.guestEmail || 'Guest'],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ color: 'var(--muted)' }}>{label}</span>
                    <span style={{ fontWeight: 500, textAlign: 'right' }}>{val || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory?.length > 0 && (
            <div className="card">
              <div className="card-header"><span className="card-title">History</span></div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {order.statusHistory.map((h, i) => (
                    <div key={i} style={{ fontSize: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className={`badge ${STATUS_MAP[h.status] || 'badge-gray'}`}>{h.status}</span>
                        <span style={{ color: 'var(--muted)' }}>{new Date(h.updatedAt).toLocaleDateString()}</span>
                      </div>
                      {h.note && <div style={{ color: 'var(--muted)', marginTop: 4 }}>{h.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──── CATEGORIES PAGE ─────────────────────────────────────────────
export function CategoriesPage() {
  const { items: categories, loading, fetch, remove } = useCrud('/categories');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', isFeatured: false, isActive: true, order: 0 });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const openEdit = (cat) => { setEditItem(cat); setForm({ name: cat.name, description: cat.description || '', isFeatured: cat.isFeatured, isActive: cat.isActive, order: cat.order || 0 }); setShowForm(true); };
  const openNew = () => { setEditItem(null); setForm({ name: '', description: '', isFeatured: false, isActive: true, order: 0 }); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      if (editItem) {
        await api.put(`/categories/${editItem._id}`, fd);
        toast.success('Category updated!');
      } else {
        await api.post('/categories', fd);
        toast.success('Category created!');
      }
      setShowForm(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Categories</h1>
        <button className="btn btn-primary" onClick={openNew}><i className="bi bi-plus-lg"></i> Add Category</button>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Category</th><th>Products</th><th>Featured</th><th>Status</th><th>Order</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(6).fill(0).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }}></div></td>)}</tr>)
                : categories.map(cat => (
                  <tr key={cat._id}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {cat.image && <img src={cat.image} alt={cat.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />}
                      <span style={{ fontWeight: 500 }}>{cat.name}</span>
                    </div></td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>—</td>
                    <td>{cat.isFeatured ? <span className="badge badge-info">Featured</span> : '—'}</td>
                    <td><span className={`badge ${cat.isActive ? 'badge-success' : 'badge-gray'}`}>{cat.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ fontSize: 13 }}>{cat.order}</td>
                    <td><div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(cat)}><i className="bi bi-pencil"></i></button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => remove(cat._id)}><i className="bi bi-trash"></i></button>
                    </div></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700, margin: 0 }}>{editItem ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}><i className="bi bi-x"></i></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: 24 }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-control" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Category Image</label>
                <input type="file" accept="image/*" className="form-control" onChange={e => setImageFile(e.target.files[0])} />
                {editItem?.image && !imageFile && <img src={editItem.image} alt="Current" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input type="number" className="form-control" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label className="form-label">Options</label>
                  <label className="toggle"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} /><span className="toggle-slider"></span><span style={{ fontSize: 13 }}>Featured</span></label>
                  <label className="toggle"><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /><span className="toggle-slider"></span><span style={{ fontSize: 13 }}>Active</span></label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ──── USERS PAGE ──────────────────────────────────────────────────
export function UsersPage() {
  const { items, loading, pagination, page, setPage, search, setSearch } = useCrud('/users');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Customers ({pagination.total})</h1>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ padding: '14px 20px' }}>
          <div className="search-bar"><i className="bi bi-search"></i>
            <input placeholder="Search customers..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Customer</th><th>Role</th><th>Status</th><th>Joined</th><th>Last Login</th></tr></thead>
            <tbody>
              {loading ? Array(8).fill(0).map((_, i) => <tr key={i}>{Array(5).fill(0).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }}></div></td>)}</tr>)
                : items.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#EF2853,#FFA31A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{user.firstName} {user.lastName}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge ${user.role === 'super_admin' ? 'badge-danger' : user.role === 'admin' ? 'badge-purple' : 'badge-gray'}`}>{user.role}</span></td>
                    <td><span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="admin-pagination">
            <span>Page {page} of {pagination.pages}</span>
            <div className="admin-pagination-btns">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><i className="bi bi-chevron-left"></i></button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}><i className="bi bi-chevron-right"></i></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ──── SETTINGS PAGE ───────────────────────────────────────────────
export function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState('general');

  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data.data)).catch(() => toast.error('Failed to load settings')).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Settings saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const GROUPS = [
    { id: 'general', label: 'General', icon: 'bi-gear' },
    { id: 'branding', label: 'Branding', icon: 'bi-palette' },
    { id: 'contact', label: 'Contact', icon: 'bi-telephone' },
    { id: 'social', label: 'Social Media', icon: 'bi-share' },
    { id: 'commerce', label: 'Commerce', icon: 'bi-cart' },
    { id: 'marketing', label: 'Marketing', icon: 'bi-megaphone' },
    { id: 'seo', label: 'SEO', icon: 'bi-search' },
  ];

  const FIELDS = {
    general: [{ key: 'store_name', label: 'Store Name', type: 'text' }, { key: 'sidebar_about_text', label: 'About Text (Sidebar)', type: 'textarea' }],
    branding: [{ key: 'logo', label: 'Logo URL', type: 'text' }, { key: 'logo_white', label: 'Logo (White) URL', type: 'text' }, { key: 'favicon', label: 'Favicon URL', type: 'text' }, { key: 'primary_color', label: 'Primary Color', type: 'color' }, { key: 'secondary_color', label: 'Secondary Color', type: 'color' }],
    contact: [{ key: 'store_email', label: 'Email', type: 'text' }, { key: 'phone_1', label: 'Phone 1', type: 'text' }, { key: 'phone_2', label: 'Phone 2', type: 'text' }, { key: 'store_address', label: 'Address', type: 'text' }],
    social: [{ key: 'facebook_url', label: 'Facebook URL', type: 'text' }, { key: 'twitter_url', label: 'Twitter/X URL', type: 'text' }, { key: 'instagram_url', label: 'Instagram URL', type: 'text' }, { key: 'youtube_url', label: 'YouTube URL', type: 'text' }, { key: 'linkedin_url', label: 'LinkedIn URL', type: 'text' }, { key: 'gmb_url', label: 'Google My Business URL', type: 'text' }],
    commerce: [{ key: 'currency', label: 'Currency Code (e.g. USD)', type: 'text' }, { key: 'currency_symbol', label: 'Currency Symbol', type: 'text' }, { key: 'tax_rate', label: 'Tax Rate (%)', type: 'number' }, { key: 'free_shipping_threshold', label: 'Free Shipping Above ($)', type: 'number' }, { key: 'shipping_cost', label: 'Shipping Cost ($)', type: 'number' }],
    marketing: [{ key: 'announcement_text', label: 'Announcement Bar Text', type: 'text' }, { key: 'newsletter_title', label: 'Newsletter Title', type: 'text' }, { key: 'newsletter_subtitle', label: 'Newsletter Subtitle', type: 'text' }, { key: 'footer_copyright', label: 'Footer Copyright', type: 'text' }],
    seo: [{ key: 'meta_title', label: 'Default Meta Title', type: 'text' }, { key: 'meta_description', label: 'Default Meta Description', type: 'textarea' }],
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Settings</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <i className={`bi ${saving ? 'bi-hourglass' : 'bi-check-lg'}`}></i> {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div style={{ width: 40, height: 40, border: '3px solid #EF2853', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}></div></div>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>
            <div className="card">
              <div style={{ padding: 12 }}>
                {GROUPS.map(g => (
                  <button key={g.id} onClick={() => setActiveGroup(g.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: activeGroup === g.id ? 'rgba(239,40,83,0.08)' : 'transparent', color: activeGroup === g.id ? 'var(--primary)' : 'var(--text)', fontWeight: activeGroup === g.id ? 600 : 400, fontSize: 14, textAlign: 'left' }}>
                    <i className={`bi ${g.icon}`}></i> {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h3 style={{ fontWeight: 700, marginBottom: 24 }}>{GROUPS.find(g => g.id === activeGroup)?.label} Settings</h3>
                {(FIELDS[activeGroup] || []).map(field => (
                  <div key={field.key} className="form-group">
                    <label className="form-label">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea className="form-control" value={settings[field.key] || ''} onChange={e => set(field.key, e.target.value)} />
                    ) : field.type === 'color' ? (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input type="color" value={settings[field.key] || '#000000'} onChange={e => set(field.key, e.target.value)} style={{ height: 40, width: 60, borderRadius: 8, border: '1.5px solid var(--border)', cursor: 'pointer' }} />
                        <input className="form-control" value={settings[field.key] || ''} onChange={e => set(field.key, e.target.value)} style={{ maxWidth: 160 }} />
                      </div>
                    ) : (
                      <input className="form-control" type={field.type} value={settings[field.key] || ''} onChange={e => set(field.key, e.target.value)} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}