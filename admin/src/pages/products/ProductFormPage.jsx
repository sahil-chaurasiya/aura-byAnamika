import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menuGroups, setMenuGroups] = useState([]); // header nav, filtered to real category groups
  const [expandedGroups, setExpandedGroups] = useState({});
  const [categorySearch, setCategorySearch] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '', categories: [],
    price: '', salePrice: '', stock: 0, sku: '',
    isFeatured: false, isNewArrival: false, isBestSeller: false, isActive: true,
    sizes: [], colors: [], tags: '',
    images: [], thumbnail: '',
    seo: { metaTitle: '', metaDescription: '' },
    weight: '', trackInventory: true,
  });

  const [newColor, setNewColor] = useState({ name: '', hex: '#000000' });

  useEffect(() => {
    // Pull real categories/sub-categories straight from the storefront
    // Navigation Menu (same data the Menu Builder edits) instead of the
    // old flat Categories list, so products can only ever be tagged with
    // categories that actually exist in the live nav. "Home", "About Us",
    // "Contact" etc. are plain links with no children -- not categories --
    // so they're filtered out automatically.
    api.get('/menus/header').then(r => {
      const items = (r.data.data?.items || [])
        .filter(item => item.layout !== 'link' && (item.children?.length > 0) && item.isActive !== false)
        .sort((a, b) => a.order - b.order);
      setMenuGroups(items);
      setExpandedGroups(Object.fromEntries(items.map(g => [g.label, true])));
    }).catch(() => {});

    if (isEdit) {
      setLoading(true);
      api.get(`/products/${id}`)
        .then(r => {
          const p = r.data.data;
          setForm({
            ...p,
            price: p.price || '',
            salePrice: p.salePrice || '',
            tags: p.tags?.join(', ') || '',
            colors: p.colors || [],
            sizes: p.sizes || [],
            categories: p.categories || [],
          });
        })
        .catch(() => toast.error('Failed to load product'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setSeo = (key, val) => setForm(f => ({ ...f, seo: { ...f.seo, [key]: val } }));

  const isCategorySelected = (label) => form.categories.some(c => c.label === label);
  const toggleCategory = (label, group) => {
    set('categories', isCategorySelected(label)
      ? form.categories.filter(c => c.label !== label)
      : [...form.categories, { label, group }]);
  };
  const toggleGroupExpanded = (label) => setExpandedGroups(g => ({ ...g, [label]: !g[label] }));

  // Simple search filter across every category + sub-category label,
  // keeping a group visible if any of its children match.
  const filteredMenuGroups = categorySearch.trim()
    ? menuGroups
        .map(group => ({
          ...group,
          children: (group.children || []).filter(child =>
            child.label.toLowerCase().includes(categorySearch.toLowerCase()) ||
            (child.children || []).some(sub => sub.label.toLowerCase().includes(categorySearch.toLowerCase()))
          ),
        }))
        .filter(group => group.label.toLowerCase().includes(categorySearch.toLowerCase()) || group.children.length > 0)
    : menuGroups;

  const handleImageUpload = async (files) => {
    if (!files.length) return;
    if (!id) {
      toast.error('Save the product first before uploading images');
      return;
    }
    setUploadingImages(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append('images', f));
      // Render's free tier has very little CPU, and processing several full
      // images (resize + re-encode + Cloudinary round trip) takes far longer
      // there than locally. Give this call the same kind of long ceiling the
      // video upload already has, instead of the 60s FormData default.
      const { data } = await api.post(`/products/${id}/images`, fd, { timeout: 180000 });
      set('images', data.data);
      toast.success(`${files.length} image(s) uploaded`);
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        // The request timed out client-side, but the server may well have
        // finished the job after we stopped waiting — re-fetch the product
        // so a genuinely completed upload shows up without a manual refresh.
        toast.error('Upload is taking longer than expected — checking if it finished...');
        try {
          const { data } = await api.get(`/products/${id}`);
          if (data.data?.images) set('images', data.data.images);
        } catch { /* ignore — leave existing state as-is */ }
      } else {
        toast.error(err.response?.data?.message || 'Image upload failed');
      }
    }
    finally { setUploadingImages(false); }
  };

  const removeImage = (idx) => {
    const imgs = form.images.filter((_, i) => i !== idx);
    set('images', imgs);
    if (form.thumbnail === form.images[idx]?.url) {
      set('thumbnail', imgs[0]?.url || '');
    }
  };

  const setThumbnail = (url) => set('thumbnail', url);

  const toggleSize = (size) => {
    set('sizes', form.sizes.includes(size) ? form.sizes.filter(s => s !== size) : [...form.sizes, size]);
  };

  const addColor = () => {
    if (!newColor.name) return;
    set('colors', [...(form.colors || []), { ...newColor }]);
    setNewColor({ name: '', hex: '#000000' });
  };

  const removeColor = (idx) => set('colors', form.colors.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.categories?.length || !form.description) {
      toast.error('Please fill required fields: Name, Price, at least one Category, Description');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags,
        price: parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        stock: parseInt(form.stock) || 0,
      };
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success('Product updated!');
      } else {
        const { data } = await api.post('/products', payload);
        toast.success('Product created!');
        navigate(`/products/${data.data._id}/edit`);
        return;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ width: 40, height: 40, border: '3px solid #EF2853', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}></div>
    </div>
  );

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'pricing', label: 'Pricing & Stock' },
    { id: 'variants', label: 'Variants' },
    { id: 'images', label: 'Images' },
    { id: 'seo', label: 'SEO' },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          {isEdit && form.name && <p style={{ color: 'var(--muted)', fontSize: 13 }}>{form.name}</p>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/products')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <i className={`bi ${saving ? 'bi-hourglass' : 'bi-check-lg'}`}></i>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* Left Column */}
        <div>
          {/* Tabs */}
          <div className="admin-tabs">
            {tabs.map(tab => (
              <button key={tab.id} type="button" className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="card">
            <div className="card-body">
              {/* Basic Info */}
              {activeTab === 'basic' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input className="form-control" placeholder="e.g. Premium Cotton T-Shirt" required value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Short Description</label>
                    <input className="form-control" placeholder="Brief product summary (shown in cards)" value={form.shortDescription || ''} onChange={e => set('shortDescription', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Description *</label>
                    <textarea className="form-control" style={{ minHeight: 200 }} required placeholder="Detailed product description (supports HTML)" value={form.description} onChange={e => set('description', e.target.value)} />
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Supports HTML tags for formatting</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Categories *</label>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: -4, marginBottom: 10 }}>
                      Pulled straight from Navigation Menu — pick any number of categories and sub-categories. Manage the list itself under Navigation Menu.
                    </p>

                    {form.categories?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                        {form.categories.map(c => (
                          <span key={c.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fdeef1', color: '#EF2853', borderRadius: 999, padding: '4px 6px 4px 12px', fontSize: 12.5, fontWeight: 500 }}>
                            {c.label}
                            <button type="button" onClick={() => toggleCategory(c.label, c.group)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF2853', fontSize: 15, lineHeight: 1, padding: '0 4px' }}>×</button>
                          </span>
                        ))}
                      </div>
                    )}

                    <input className="form-control" placeholder="Search categories & sub-categories..."
                      value={categorySearch} onChange={e => setCategorySearch(e.target.value)}
                      style={{ marginBottom: 10 }} />

                    <div style={{ border: '1.5px solid var(--border)', borderRadius: 10, maxHeight: 340, overflowY: 'auto', padding: 8 }}>
                      {menuGroups.length === 0 && (
                        <p style={{ fontSize: 13, color: 'var(--muted)', padding: 8 }}>Loading categories from Navigation Menu...</p>
                      )}
                      {filteredMenuGroups.map(group => (
                        <div key={group.label} style={{ marginBottom: 4 }}>
                          <button type="button" onClick={() => toggleGroupExpanded(group.label)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', background: '#fafafa', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', fontWeight: 700, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '.03em', color: '#555' }}>
                            <i className={`bi bi-chevron-${expandedGroups[group.label] ? 'down' : 'right'}`} style={{ fontSize: 11 }}></i>
                            {group.label}
                          </button>
                          {expandedGroups[group.label] && (
                            <div style={{ padding: '6px 4px 4px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {(group.children || []).map(child => (
                                <div key={child.label}>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 6px', borderRadius: 6, cursor: 'pointer', fontSize: 13.5 }}>
                                    <input type="checkbox" checked={isCategorySelected(child.label)}
                                      onChange={() => toggleCategory(child.label, group.label)} />
                                    {child.label}
                                  </label>
                                  {(child.children || []).length > 0 && (
                                    <div style={{ paddingLeft: 26, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                      {child.children.map(sub => (
                                        <label key={sub.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#555' }}>
                                          <input type="checkbox" checked={isCategorySelected(sub.label)}
                                            onChange={() => toggleCategory(sub.label, group.label)} />
                                          {sub.label}
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (comma-separated)</label>
                    <input className="form-control" placeholder="e.g. summer, casual, cotton" value={form.tags} onChange={e => set('tags', e.target.value)} />
                  </div>
                </div>
              )}

              {/* Pricing & Stock */}
              {activeTab === 'pricing' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Regular Price ($) *</label>
                      <input className="form-control" type="number" step="0.01" min="0" required placeholder="0.00" value={form.price} onChange={e => set('price', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sale Price ($)</label>
                      <input className="form-control" type="number" step="0.01" min="0" placeholder="Leave empty for no sale" value={form.salePrice || ''} onChange={e => set('salePrice', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">SKU</label>
                      <input className="form-control" placeholder="e.g. SKU-00001" value={form.sku || ''} onChange={e => set('sku', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Stock Quantity</label>
                      <input className="form-control" type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Weight (kg)</label>
                      <input className="form-control" type="number" step="0.1" min="0" placeholder="0.0" value={form.weight || ''} onChange={e => set('weight', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="toggle">
                      <input type="checkbox" checked={form.trackInventory} onChange={e => set('trackInventory', e.target.checked)} />
                      <span className="toggle-slider"></span>
                      <span style={{ fontSize: 14 }}>Track inventory</span>
                    </label>
                  </div>

                  {form.price && form.salePrice && (
                    <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 16, marginTop: 16 }}>
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>
                        Discount: {Math.round(((form.price - form.salePrice) / form.price) * 100)}% off
                      </span>
                      <span style={{ color: '#666', marginLeft: 12, fontSize: 13 }}>Customer saves ₹{(form.price - form.salePrice).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Variants */}
              {activeTab === 'variants' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Available Sizes</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {SIZES.map(size => (
                        <button key={size} type="button"
                          onClick={() => toggleSize(size)}
                          style={{
                            padding: '7px 16px', borderRadius: 8, border: '1.5px solid',
                            borderColor: form.sizes?.includes(size) ? '#EF2853' : 'var(--border)',
                            background: form.sizes?.includes(size) ? '#EF2853' : 'transparent',
                            color: form.sizes?.includes(size) ? '#fff' : 'var(--text)',
                            fontWeight: 500, fontSize: 13, cursor: 'pointer', transition: '0.2s',
                          }}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Colors</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      {(form.colors || []).map((color, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f5f5f5', borderRadius: 999, padding: '5px 12px 5px 6px' }}>
                          <span className="color-dot" style={{ background: color.hex }}></span>
                          <span style={{ fontSize: 13 }}>{color.name}</span>
                          <button type="button" onClick={() => removeColor(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontSize: 12 }}>Color Name</label>
                        <input className="form-control" placeholder="e.g. Black" value={newColor.name} onChange={e => setNewColor(n => ({ ...n, name: e.target.value }))} />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: 12 }}>Hex Color</label>
                        <input type="color" value={newColor.hex} onChange={e => setNewColor(n => ({ ...n, hex: e.target.value }))} style={{ height: 38, width: 60, borderRadius: 8, border: '1.5px solid var(--border)', cursor: 'pointer' }} />
                      </div>
                      <button type="button" className="btn btn-secondary" onClick={addColor}>
                        <i className="bi bi-plus-lg"></i> Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Images */}
              {activeTab === 'images' && (
                <div>
                  {!isEdit && (
                    <div style={{ background: '#fef9c3', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 13, color: '#854d0e' }}>
                      <i className="bi bi-info-circle me-2"></i>
                      Save the product first, then come back to upload images.
                    </div>
                  )}
                  <div
                    className="upload-area"
                    onClick={() => document.getElementById('img-upload').click()}
                    style={{ opacity: !isEdit ? 0.5 : 1, pointerEvents: !isEdit ? 'none' : 'all' }}
                  >
                    <i className={`bi ${uploadingImages ? 'bi-hourglass-split' : 'bi-cloud-arrow-up'}`}></i>
                    <p style={{ fontWeight: 500, marginBottom: 4 }}>{uploadingImages ? 'Uploading...' : 'Click to upload images'}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>PNG, JPG, WEBP. Any size. Multiple allowed.</p>
                  </div>
                  <input id="img-upload" type="file" multiple accept="image/*" style={{ display: 'none' }}
                    onChange={e => handleImageUpload(e.target.files)} />

                  {form.images?.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <label className="form-label">Uploaded Images ({form.images.length})</label>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Click an image to set as thumbnail</p>
                      <div className="image-grid">
                        {form.images.map((img, i) => (
                          <div key={i} className="image-grid-item" style={{ outline: form.thumbnail === img.url ? '3px solid #EF2853' : 'none', outlineOffset: 2 }}>
                            <img src={img.url} alt={`Product ${i + 1}`} onClick={() => setThumbnail(img.url)} style={{ cursor: 'pointer' }} />
                            {form.thumbnail === img.url && (
                              <div style={{ position: 'absolute', bottom: 4, left: 4, background: '#EF2853', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                                THUMB
                              </div>
                            )}
                            <button className="remove-btn" onClick={() => removeImage(i)}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SEO */}
              {activeTab === 'seo' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Meta Title</label>
                    <input className="form-control" placeholder={form.name || 'Product name'} value={form.seo?.metaTitle || ''} onChange={e => setSeo('metaTitle', e.target.value)} />
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{(form.seo?.metaTitle || form.name || '').length}/60 characters</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Meta Description</label>
                    <textarea className="form-control" style={{ minHeight: 80 }} placeholder={form.shortDescription || 'Product description for search engines'} value={form.seo?.metaDescription || ''} onChange={e => setSeo('metaDescription', e.target.value)} />
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{(form.seo?.metaDescription || '').length}/160 characters</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status */}
          <div className="card">
            <div className="card-header"><span className="card-title">Status</span></div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'isActive', label: 'Active (visible in store)' },
                  { key: 'isFeatured', label: 'Featured on homepage' },
                  { key: 'isNewArrival', label: 'New Arrival badge' },
                  { key: 'isBestSeller', label: 'Best Seller badge' },
                ].map(({ key, label }) => (
                  <label key={key} className="toggle">
                    <input type="checkbox" checked={!!form[key]} onChange={e => set(key, e.target.checked)} />
                    <span className="toggle-slider"></span>
                    <span style={{ fontSize: 13 }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Thumbnail Preview */}
          {form.thumbnail && (
            <div className="card">
              <div className="card-header"><span className="card-title">Thumbnail Preview</span></div>
              <div style={{ padding: 16 }}>
                <img src={form.thumbnail} alt="Thumbnail" style={{ width: '100%', borderRadius: 10, aspectRatio: '3/4', objectFit: 'cover' }} />
              </div>
            </div>
          )}

          {/* Quick stats */}
          {isEdit && (
            <div className="card">
              <div className="card-header"><span className="card-title">Product Info</span></div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Sold</span>
                    <span style={{ fontWeight: 600 }}>{form.soldCount || 0} units</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Rating</span>
                    <span style={{ fontWeight: 600 }}>⭐ {form.ratings || 0} ({form.numReviews || 0})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Created</span>
                    <span style={{ fontWeight: 500 }}>{form.createdAt ? new Date(form.createdAt).toLocaleDateString() : '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}