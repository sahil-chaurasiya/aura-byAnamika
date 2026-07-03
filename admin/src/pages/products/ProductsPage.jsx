import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { CLIENT_URL } from '../../services/api';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const { data } = await api.get(`/products/admin/list?${params}`);
      setProducts(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetch();
    } catch { toast.error('Failed to delete product'); }
    finally { setDeleting(null); }
  };

  const toggleActive = async (id, current) => {
    try {
      await api.put(`/products/${id}`, { isActive: !current });
      setProducts(ps => ps.map(p => p._id === id ? { ...p, isActive: !current } : p));
      toast.success(`Product ${!current ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Products</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>{pagination.total} products total</p>
        </div>
        <Link to="/products/new" className="btn btn-primary">
          <i className="bi bi-plus-lg"></i> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ padding: '14px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ maxWidth: 320 }}>
            <i className="bi bi-search"></i>
            <input placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="form-control" style={{ width: 140 }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {(search || status) && (
            <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setStatus(''); setPage(1); }}>
              <i className="bi bi-x"></i> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 14, width: j === 0 ? 200 : 80 }}></div></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <i className="bi bi-box-seam"></i>
                    <h3>No Products Found</h3>
                    <p>Try adjusting your search or create a new product.</p>
                    <Link to="/products/new" className="btn btn-primary" style={{ marginTop: 16 }}>
                      <i className="bi bi-plus-lg"></i> Add First Product
                    </Link>
                  </div>
                </td></tr>
              ) : products.map(product => (
                <tr key={product._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={product.thumbnail || 'https://via.placeholder.com/48x54'} alt={product.name} className="product-img" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{product.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>SKU: {product.sku || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ fontSize: 13 }}>{product.categories?.length ? product.categories.map(c => c.label).join(', ') : '—'}</span></td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      ${(product.salePrice || product.price)?.toFixed(2)}
                    </div>
                    {product.salePrice && (
                      <div style={{ fontSize: 11, color: '#999', textDecoration: 'line-through' }}>${product.price?.toFixed(2)}</div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${product.stock === 0 ? 'badge-danger' : product.stock <= 5 ? 'badge-warning' : 'badge-success'}`}>
                      {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
                    </span>
                  </td>
                  <td>
                    <label className="toggle">
                      <input type="checkbox" checked={product.isActive} onChange={() => toggleActive(product._id, product.isActive)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </td>
                  <td>
                    {product.isFeatured && <span className="badge badge-info">Featured</span>}
                    {product.isNewArrival && <span className="badge badge-success" style={{ marginLeft: 4 }}>New</span>}
                    {product.isBestSeller && <span className="badge badge-warning" style={{ marginLeft: 4 }}>Hot</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link to={`/products/${product._id}/edit`} className="btn btn-outline btn-sm btn-icon" title="Edit">
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <a href={`${CLIENT_URL}/shop/${product.slug}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm btn-icon" title="View on store">
                        <i className="bi bi-box-arrow-up-right"></i>
                      </a>
                      <button
                        className="btn btn-danger btn-sm btn-icon"
                        title="Delete"
                        disabled={deleting === product._id}
                        onClick={() => handleDelete(product._id, product.name)}
                      >
                        <i className={`bi ${deleting === product._id ? 'bi-hourglass' : 'bi-trash'}`}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="admin-pagination">
            <span>Showing {products.length} of {pagination.total}</span>
            <div className="admin-pagination-btns">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <i className="bi bi-chevron-left"></i>
              </button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page - 2 + i;
                if (p > pagination.pages) return null;
                return <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>;
              })}
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}