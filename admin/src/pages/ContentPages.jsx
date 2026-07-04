import React, { useEffect, useState, useCallback } from 'react';
import api, { CLIENT_URL } from '../services/api';
import toast from 'react-hot-toast';

// ──── BANNERS PAGE ────────────────────────────────────────────────
export function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', buttonText: '', buttonLink: '/shop', type: 'promotional', isActive: true, order: 0 });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/banners/admin/all'); setBanners(data.data); }
    catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openForm = (item = null) => {
    setEditItem(item);
    setForm(item ? { ...item } : { title: '', subtitle: '', buttonText: 'Shop Now', buttonLink: '/shop', type: 'promotional', isActive: true, order: 0 });
    setImageFile(null);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      if (editItem) await api.put(`/banners/${editItem._id}`, fd);
      else await api.post('/banners', fd);
      toast.success(editItem ? 'Banner updated!' : 'Banner created!');
      setShowForm(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try { await api.delete(`/banners/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  const TYPES = ['promotional', 'sale', 'collection', 'ad', 'sub', 'hero'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Banners</h1>
        <button className="btn btn-primary" onClick={() => openForm()}><i className="bi bi-plus-lg"></i> Add Banner</button>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Banner</th><th>Type</th><th>Button</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? Array(4).fill(0).map((_, i) => <tr key={i}>{Array(6).fill(0).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }}></div></td>)}</tr>)
                : banners.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><i className="bi bi-image"></i><h3>No Banners</h3></div></td></tr>
                ) : banners.map(b => (
                  <tr key={b._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={b.image} alt={b.title} style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 8 }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{b.title || 'Untitled'}</div>
                          {b.subtitle && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{b.subtitle}</div>}
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{b.type}</span></td>
                    <td style={{ fontSize: 13 }}>{b.buttonText || '—'}</td>
                    <td style={{ fontSize: 13 }}>{b.order}</td>
                    <td><span className={`badge ${b.isActive ? 'badge-success' : 'badge-gray'}`}>{b.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openForm(b)}><i className="bi bi-pencil"></i></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => remove(b._id)}><i className="bi bi-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700, margin: 0 }}>{editItem ? 'Edit Banner' : 'New Banner'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-control" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Subtitle</label>
                  <input className="form-control" value={form.subtitle || ''} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Button Text</label>
                  <input className="form-control" value={form.buttonText || ''} onChange={e => setForm(f => ({ ...f, buttonText: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Button Link</label>
                  <input className="form-control" value={form.buttonLink || ''} onChange={e => setForm(f => ({ ...f, buttonLink: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <select className="form-control" required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input type="number" className="form-control" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Banner Image</label>
                {editItem?.image && !imageFile && <img src={editItem.image} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
                {imageFile && <img src={URL.createObjectURL(imageFile)} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
                <input type="file" accept="image/*" className="form-control" onChange={e => setImageFile(e.target.files[0])} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="toggle">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                  <span className="toggle-slider"></span>
                  <span style={{ fontSize: 13 }}>Active</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
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

// ──── HERO SLIDES ─────────────────────────────────────────────────
export function HeroPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ heading: '', subHeading: '', description: '', buttonText: 'Shop Now', buttonLink: '/shop', isActive: true, order: 0, badge: '' });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/hero/admin/all'); setSlides(data.data); }
    catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openForm = (item = null) => {
    setEditItem(item);
    setForm(item ? { ...item } : { heading: '', subHeading: '', description: '', buttonText: 'Shop Now', buttonLink: '/shop', isActive: true, order: 0, badge: '' });
    setImageFile(null); setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.heading) return toast.error('Heading is required');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      if (editItem) await api.put(`/hero/${editItem._id}`, fd);
      else await api.post('/hero', fd);
      toast.success(editItem ? 'Slide updated!' : 'Slide created!');
      setShowForm(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this slide?')) return;
    try { await api.delete(`/hero/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Hero Slides</h1>
        <button className="btn btn-primary" onClick={() => openForm()}><i className="bi bi-plus-lg"></i> Add Slide</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
        {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="card" style={{ height: 220 }}><div className="skeleton" style={{ height: '100%', borderRadius: 12 }}></div></div>)
          : slides.map((slide, i) => (
            <div key={slide._id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <img src={slide.image} alt={slide.heading} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.7),transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 16 }}>
                  {slide.badge && <span style={{ background: 'var(--primary)', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 4, alignSelf: 'flex-start', marginBottom: 6, fontWeight: 700 }}>{slide.badge}</span>}
                  <div style={{ color: '#fff', fontSize: 12, opacity: 0.8 }}>{slide.subHeading}</div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{slide.heading}</div>
                </div>
                <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                  <span style={{ background: slide.isActive ? '#22c55e' : '#ef4444', color: '#fff', borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                    {slide.isActive ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Order: {slide.order}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-outline btn-sm btn-icon" onClick={() => openForm(slide)}><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => remove(slide._id)}><i className="bi bi-trash"></i></button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {slides.length === 0 && !loading && (
        <div className="empty-state card" style={{ padding: 60 }}>
          <i className="bi bi-images"></i><h3>No Hero Slides</h3>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => openForm()}><i className="bi bi-plus-lg"></i> Add First Slide</button>
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700, margin: 0 }}>{editItem ? 'Edit Slide' : 'New Slide'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ padding: 24 }}>
              <div className="form-group">
                <label className="form-label">Heading *</label>
                <input className="form-control" required value={form.heading} onChange={e => setForm(f => ({ ...f, heading: e.target.value }))} placeholder="e.g. New Summer Collection" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Sub Heading</label>
                  <input className="form-control" value={form.subHeading || ''} onChange={e => setForm(f => ({ ...f, subHeading: e.target.value }))} placeholder="e.g. DISCOVER THE LATEST" />
                </div>
                <div className="form-group">
                  <label className="form-label">Badge Text</label>
                  <input className="form-control" value={form.badge || ''} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="e.g. NEW" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Button Text</label>
                  <input className="form-control" value={form.buttonText || ''} onChange={e => setForm(f => ({ ...f, buttonText: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Button Link</label>
                  <input className="form-control" value={form.buttonLink || ''} onChange={e => setForm(f => ({ ...f, buttonLink: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input type="number" className="form-control" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Slide Image</label>
                {editItem?.image && !imageFile && <img src={editItem.image} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
                {imageFile && <img src={URL.createObjectURL(imageFile)} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
                <input type="file" accept="image/*" className="form-control" onChange={e => setImageFile(e.target.files[0])} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="toggle">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                  <span className="toggle-slider"></span>
                  <span style={{ fontSize: 13 }}>Active</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Slide'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ──── HOMEPAGE BUILDER ────────────────────────────────────────────
export function HomepageBuilderPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [uploadingGallery, setUploadingGallery] = useState(null); // `${sectionKey}-${idx}` while an upload is in flight
  const [uploadingRowBanner, setUploadingRowBanner] = useState(null); // `${sectionKey}-${rowIdx}` while a row banner upload is in flight
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    api.get('/homepage').then(r => {
      const fetched = r.data.data.sort((a, b) => a.order - b.order).map(s => {
        // Older/unmigrated installs may not have `rows` yet on the products
        // section config — backfill a sensible default so the editor works.
        if (s.key === 'products' && !s.config?.rows?.length) {
          return {
            ...s,
            config: {
              ...s.config,
              buttonText: s.config?.buttonText || 'More Collection',
              buttonLink: s.config?.buttonLink || '/shop',
              rows: [
                { category: '', limit: 6, banner: { image: '', title: 'Trending Now Only This Weekend!', buttonText: 'Shop Now', buttonLink: '/shop' } },
                { category: '', limit: 6, banner: { image: '', title: 'Trending Now Only This Weekend!', buttonText: 'Shop Now', buttonLink: '/shop' } },
              ],
            },
          };
        }
        // Older/unmigrated installs may not have `image`/`categories` yet on
        // the ad banner config — backfill so the editor has something to show.
        if (s.key === 'ad' && (!s.config?.image || !s.config?.categories?.length)) {
          return {
            ...s,
            config: {
              ...s.config,
              image: s.config?.image || 'https://images.unsplash.com/photo-1772570824145-e996a55204fb?w=1600&q=70&auto=format&fit=crop',
              categories: s.config?.categories?.length ? s.config.categories : ['Sarees', 'Lehengas', 'Kurtis', 'Anarkali', 'Suits'],
            },
          };
        }
        return s;
      });
      setSections(fetched);
    }).catch(() => {}).finally(() => setLoading(false));
    // Same source of truth as the storefront nav / "Shop by Category" grid,
    // so the category picked here always matches a real, filterable category.
    api.get('/menus/header').then(r => {
      const items = (r.data.data?.items || []).filter(item => item.layout !== 'link' && item.children?.length > 0);
      setCategoryOptions(items.map(item => item.label));
    }).catch(() => {});
  }, []);

  const toggle = (key) => setSections(ss => ss.map(s => s.key === key ? { ...s, isEnabled: !s.isEnabled } : s));
  const moveUp = (i) => { if (i === 0) return; const ss = [...sections]; [ss[i-1], ss[i]] = [ss[i], ss[i-1]]; setSections(ss.map((s, idx) => ({ ...s, order: idx }))); };
  const moveDown = (i) => { if (i === sections.length - 1) return; const ss = [...sections]; [ss[i], ss[i+1]] = [ss[i+1], ss[i]]; setSections(ss.map((s, idx) => ({ ...s, order: idx }))); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/homepage/bulk', { sections });
      toast.success('Homepage layout saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const updateConfig = (key, config) => setSections(ss => ss.map(s => s.key === key ? { ...s, config: { ...s.config, ...config } } : s));

  // Gallery videos are stored as { video, link, caption } objects. Older
  // installs may still have the legacy image-gallery shape ({ image, link })
  // or a bare URL string — normalize everything so the editor never breaks
  // on old data, it just won't have a video yet.
  const normalizeGalleryVideos = (config) =>
    (config?.videos || []).map(item => typeof item === 'string'
      ? { video: item, link: '', caption: '' }
      : { video: item.video || '', link: item.link || '', caption: item.caption || '' });

  const setGalleryVideos = (key, videos) => updateConfig(key, { videos });

  const handleGalleryVideoUpload = async (key, idx, file) => {
    if (!file) return;
    setUploadingGallery(`${key}-${idx}`);
    try {
      const fd = new FormData();
      fd.append('video', file);
      fd.append('folder', 'videos');
      // Video uploads are two hops (browser -> our server -> Cloudinary), so
      // the default 15s API timeout is too short and was causing silent
      // failures on anything more than a couple MB. Give this one call a much
      // longer ceiling (3 min) without touching the global default.
      const { data } = await api.post('/upload/video', fd, { timeout: 180000 });
      const section = sections.find(s => s.key === key);
      const videos = normalizeGalleryVideos(section.config);
      if (idx === videos.length) videos.push({ video: data.data.url, link: '', caption: '' });
      else videos[idx] = { ...videos[idx], video: data.data.url };
      setGalleryVideos(key, videos);
      toast.success('Video uploaded');
    } catch (err) {
      const message = err.code === 'ECONNABORTED'
        ? 'Video upload timed out — try a smaller file or a faster connection'
        : (err.response?.data?.message || 'Video upload failed');
      toast.error(message);
    } finally {
      setUploadingGallery(null);
    }
  };

  const updateGalleryVideoLink = (key, idx, link) => {
    const section = sections.find(s => s.key === key);
    const videos = normalizeGalleryVideos(section.config);
    videos[idx] = { ...videos[idx], link };
    setGalleryVideos(key, videos);
  };

  const updateGalleryVideoCaption = (key, idx, caption) => {
    const section = sections.find(s => s.key === key);
    const videos = normalizeGalleryVideos(section.config);
    videos[idx] = { ...videos[idx], caption };
    setGalleryVideos(key, videos);
  };

  const removeGalleryVideo = (key, idx) => {
    const section = sections.find(s => s.key === key);
    const videos = normalizeGalleryVideos(section.config).filter((_, i) => i !== idx);
    setGalleryVideos(key, videos);
  };

  // ── Featured Products rows (category + banner per row) ──
  const getRows = (key) => sections.find(s => s.key === key)?.config?.rows || [];

  const updateRow = (key, rowIdx, patch) => {
    const rows = getRows(key).map((r, i) => i === rowIdx ? { ...r, ...patch } : r);
    updateConfig(key, { rows });
  };

  const updateRowBanner = (key, rowIdx, patch) => {
    const rows = getRows(key);
    const row = rows[rowIdx] || {};
    updateRow(key, rowIdx, { banner: { ...row.banner, ...patch } });
  };

  const handleRowBannerUpload = async (key, rowIdx, file) => {
    if (!file) return;
    setUploadingRowBanner(`${key}-${rowIdx}`);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('folder', 'homepage-rows');
      const { data } = await api.post('/upload/image', fd);
      updateRowBanner(key, rowIdx, { image: data.data.url, imagePublicId: data.data.publicId });
      toast.success('Banner image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploadingRowBanner(null);
    }
  };

  // ── Ad Banner (image texture + checklist tags) ──
  const [uploadingAdImage, setUploadingAdImage] = useState(false);

  const handleAdImageUpload = async (key, file) => {
    if (!file) return;
    setUploadingAdImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('folder', 'homepage-ad');
      const { data } = await api.post('/upload/image', fd);
      updateConfig(key, { image: data.data.url });
      toast.success('Banner image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploadingAdImage(false);
    }
  };

  const getCategories = (key) => sections.find(s => s.key === key)?.config?.categories || [];
  const updateCategory = (key, idx, value) => {
    const categories = getCategories(key).map((c, i) => i === idx ? value : c);
    updateConfig(key, { categories });
  };
  const addCategory = (key) => updateConfig(key, { categories: [...getCategories(key), 'New Tag'] });
  const removeCategory = (key, idx) => updateConfig(key, { categories: getCategories(key).filter((_, i) => i !== idx) });

  // ── Flash Sale end date (stored as UTC ISO, edited as IST wall-clock) ──
  // Everything in Mongo/JS Date is UTC under the hood; India doesn't have a
  // "raw" timezone offset to worry about (no DST), it's always UTC+5:30.
  const IST_OFFSET_MIN = 5 * 60 + 30;

  const utcIsoToIstLocalInput = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    const ist = new Date(d.getTime() + IST_OFFSET_MIN * 60000);
    const pad = n => String(n).padStart(2, '0');
    // Read back with UTC getters (not local getters) since we already
    // manually shifted the timestamp by the IST offset above.
    return `${ist.getUTCFullYear()}-${pad(ist.getUTCMonth() + 1)}-${pad(ist.getUTCDate())}T${pad(ist.getUTCHours())}:${pad(ist.getUTCMinutes())}`;
  };

  const istLocalInputToUtcIso = (localStr) => {
    if (!localStr) return '';
    const [datePart, timePart] = localStr.split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    const [hh, mm] = (timePart || '00:00').split(':').map(Number);
    const utcMs = Date.UTC(y, m - 1, d, hh, mm) - IST_OFFSET_MIN * 60000;
    return new Date(utcMs).toISOString();
  };

  const SECTION_ICONS = { hero: 'bi-images', categories: 'bi-grid', products: 'bi-bag', ad: 'bi-megaphone', mostSelling: 'bi-fire', video: 'bi-play-circle', subBanners: 'bi-layout-text-window', flashSale: 'bi-lightning', reviews: 'bi-star', newsletter: 'bi-envelope', blog: 'bi-journal-text', gallery: 'bi-camera-video' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Homepage Builder</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Drag to reorder sections and toggle visibility</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href={CLIENT_URL} target="_blank" rel="noreferrer" className="btn btn-outline">
            <i className="bi bi-eye"></i> Preview
          </a>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <i className={`bi ${saving ? 'bi-hourglass' : 'bi-check-lg'}`}></i>
            {saving ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sections.map((section, i) => (
            <div key={section.key} className="card" style={{ opacity: section.isEnabled ? 1 : 0.6, transition: '0.2s' }}>
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Move buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <button onClick={() => moveUp(i)} disabled={i === 0} className="btn btn-outline btn-sm btn-icon" style={{ padding: 4 }}><i className="bi bi-chevron-up"></i></button>
                  <button onClick={() => moveDown(i)} disabled={i === sections.length - 1} className="btn btn-outline btn-sm btn-icon" style={{ padding: 4 }}><i className="bi bi-chevron-down"></i></button>
                </div>

                {/* Section info */}
                <div style={{ width: 40, height: 40, borderRadius: 10, background: section.isEnabled ? 'rgba(239,40,83,0.1)' : '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`bi ${SECTION_ICONS[section.key] || 'bi-layout'}`} style={{ color: section.isEnabled ? 'var(--primary)' : '#999', fontSize: 18 }}></i>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{section.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Section key: {section.key}</div>
                </div>

                {/* Config button */}
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setEditSection(editSection === section.key ? null : section.key)}
                >
                  <i className="bi bi-sliders"></i> Configure
                </button>

                {/* Toggle */}
                <label className="toggle">
                  <input type="checkbox" checked={section.isEnabled} onChange={() => toggle(section.key)} />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {/* Config panel */}
              {editSection === section.key && (
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: '#fafafa' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 16 }}>
                    {Object.entries(section.config || {}).map(([k, v]) => (
                      k === 'images' || k === 'videos' || k === 'endDate' ? null :
                      typeof v === 'string' ? (
                        <div key={k} className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</label>
                          <input className="form-control" value={v} onChange={e => updateConfig(section.key, { [k]: e.target.value })} />
                        </div>
                      ) : typeof v === 'boolean' ? (
                        <div key={k}>
                          <label className="toggle">
                            <input type="checkbox" checked={v} onChange={e => updateConfig(section.key, { [k]: e.target.checked })} />
                            <span className="toggle-slider"></span>
                            <span style={{ fontSize: 13, textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                          </label>
                        </div>
                      ) : null
                    ))}
                  </div>

                  {section.key === 'flashSale' && (
                    <div style={{ marginTop: 20 }}>
                      <div className="form-group" style={{ margin: 0, maxWidth: 280 }}>
                        <label className="form-label">Sale Ends At (IST)</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={utcIsoToIstLocalInput(section.config?.endDate)}
                          onChange={e => updateConfig(section.key, { endDate: istLocalInputToUtcIso(e.target.value) })}
                        />
                      </div>
                    </div>
                  )}

                  {section.key === 'ad' && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Banner Background Image</div>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
                        The tinted photo behind the text.
                      </p>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
                        <div style={{ width: 160, aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', background: '#eee', position: 'relative', flexShrink: 0 }}>
                          {section.config?.image && <img src={section.config.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          {uploadingAdImage && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <i className="bi bi-hourglass-split"></i>
                            </div>
                          )}
                        </div>
                        <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                          <i className="bi bi-upload"></i> {section.config?.image ? 'Replace Image' : 'Upload Image'}
                          <input type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={e => handleAdImageUpload(section.key, e.target.files[0])} />
                        </label>
                      </div>

                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Checklist Tags</div>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
                        The small checkmarked words under the title (e.g. Sarees, Lehengas...).
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
                        {getCategories(section.key).map((c, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: 8 }}>
                            <input className="form-control" value={c} onChange={e => updateCategory(section.key, idx, e.target.value)} />
                            <button type="button" className="btn btn-outline btn-sm btn-icon" style={{ color: '#d33' }} onClick={() => removeCategory(section.key, idx)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        ))}
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => addCategory(section.key)}>
                          <i className="bi bi-plus-lg"></i> Add Tag
                        </button>
                      </div>
                    </div>
                  )}

                  {section.key === 'gallery' && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Videos</div>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
                        Upload short clips (reels work great) for the "Our Videos" marquee on the homepage. Add an optional link to send people somewhere when they tap a clip, and an optional caption.
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px,1fr))', gap: 14 }}>
                        {normalizeGalleryVideos(section.config).map((item, idx) => (
                          <div key={idx} className="card" style={{ padding: 10 }}>
                            <div style={{ position: 'relative', width: '100%', aspectRatio: '9/16', borderRadius: 8, overflow: 'hidden', background: '#111', marginBottom: 8 }}>
                              {item.video && <video src={item.video} muted playsInline loop controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                              {uploadingGallery === `${section.key}-${idx}` && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <i className="bi bi-hourglass-split"></i>
                                </div>
                              )}
                            </div>
                            <label className="btn btn-outline btn-sm" style={{ width: '100%', textAlign: 'center', marginBottom: 8, cursor: 'pointer', display: 'block' }}>
                              <i className="bi bi-upload"></i> {item.video ? 'Replace Video' : 'Upload Video'}
                              <input type="file" accept="video/*" style={{ display: 'none' }}
                                onChange={e => { const f = e.target.files[0]; e.target.value = ''; handleGalleryVideoUpload(section.key, idx, f); }} />
                            </label>
                            <input className="form-control" style={{ fontSize: 12, marginBottom: 8 }}
                              placeholder="Link URL (optional)"
                              value={item.link} onChange={e => updateGalleryVideoLink(section.key, idx, e.target.value)} />
                            <input className="form-control" style={{ fontSize: 12, marginBottom: 8 }}
                              placeholder="Caption (optional)"
                              value={item.caption} onChange={e => updateGalleryVideoCaption(section.key, idx, e.target.value)} />
                            <button type="button" className="btn btn-outline btn-sm" style={{ width: '100%', color: '#d33' }}
                              onClick={() => removeGalleryVideo(section.key, idx)}>
                              <i className="bi bi-trash"></i> Remove
                            </button>
                          </div>
                        ))}

                        <label className="card" style={{ padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 190, cursor: 'pointer', border: '2px dashed var(--border)' }}>
                          {uploadingGallery === `${section.key}-${normalizeGalleryVideos(section.config).length}` ? (
                            <i className="bi bi-hourglass-split" style={{ fontSize: 22 }}></i>
                          ) : (
                            <>
                              <i className="bi bi-plus-circle" style={{ fontSize: 22, color: 'var(--muted)' }}></i>
                              <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Add Video</span>
                            </>
                          )}
                          <input type="file" accept="video/*" style={{ display: 'none' }}
                            onChange={e => { const f = e.target.files[0]; const nextIdx = normalizeGalleryVideos(section.config).length; e.target.value = ''; handleGalleryVideoUpload(section.key, nextIdx, f); }} />
                        </label>
                      </div>
                    </div>
                  )}
                  {section.key === 'products' && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Product Rows</div>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
                        Each row shows a banner next to a row of products. Pick a category to pull that category's products into the row — leave it blank to show featured products instead.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {getRows(section.key).map((row, rowIdx) => (
                          <div key={rowIdx} className="card" style={{ padding: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Row {rowIdx + 1}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16 }}>
                              {/* Banner image */}
                              <div>
                                <div style={{ width: '100%', aspectRatio: '4/5', borderRadius: 8, overflow: 'hidden', background: '#eee', marginBottom: 8, position: 'relative' }}>
                                  {row.banner?.image && <img src={row.banner.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                  {uploadingRowBanner === `${section.key}-${rowIdx}` && (
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <i className="bi bi-hourglass-split"></i>
                                    </div>
                                  )}
                                </div>
                                <label className="btn btn-outline btn-sm" style={{ width: '100%', textAlign: 'center', cursor: 'pointer', display: 'block' }}>
                                  <i className="bi bi-upload"></i> {row.banner?.image ? 'Replace' : 'Upload'}
                                  <input type="file" accept="image/*" style={{ display: 'none' }}
                                    onChange={e => handleRowBannerUpload(section.key, rowIdx, e.target.files[0])} />
                                </label>
                              </div>

                              {/* Row fields */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                                  <label className="form-label">Category (leave blank for Featured Products)</label>
                                  <select className="form-control" value={row.category || ''} onChange={e => updateRow(section.key, rowIdx, { category: e.target.value })}>
                                    <option value="">— Featured Products —</option>
                                    {categoryOptions.map(label => <option key={label} value={label}>{label}</option>)}
                                  </select>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                  <label className="form-label"># of Products</label>
                                  <input type="number" min={1} max={20} className="form-control" value={row.limit || 6} onChange={e => updateRow(section.key, rowIdx, { limit: parseInt(e.target.value) || 6 })} />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                  <label className="form-label">Banner Title</label>
                                  <input className="form-control" value={row.banner?.title || ''} onChange={e => updateRowBanner(section.key, rowIdx, { title: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                  <label className="form-label">Banner Button Text</label>
                                  <input className="form-control" value={row.banner?.buttonText || ''} onChange={e => updateRowBanner(section.key, rowIdx, { buttonText: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                  <label className="form-label">Banner Button Link</label>
                                  <input className="form-control" value={row.banner?.buttonLink || ''} onChange={e => updateRowBanner(section.key, rowIdx, { buttonLink: e.target.value })} placeholder="/shop?category=..." />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ──── MEDIA LIBRARY ───────────────────────────────────────────────
export function MediaPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/media').then(r => setMedia(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleUpload = async (files) => {
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append('files', f));
      fd.append('folder', 'general');
      const { data } = await api.post('/media/upload', fd);
      setMedia(m => [...data.data, ...m]);
      toast.success(`${data.data.length} file(s) uploaded`);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this file?')) return;
    try {
      await api.delete(`/media/${id}`);
      setMedia(m => m.filter(item => item._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied!');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Media Library ({media.length})</h1>
        <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
          <i className={`bi ${uploading ? 'bi-hourglass' : 'bi-upload'}`}></i>
          {uploading ? 'Uploading...' : 'Upload Files'}
          <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e.target.files)} disabled={uploading} />
        </label>
      </div>

      {/* Drop zone */}
      <div
        className="upload-area"
        style={{ marginBottom: 20 }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
        onClick={() => document.getElementById('media-upload').click()}
      >
        <i className={`bi ${uploading ? 'bi-hourglass-split' : 'bi-cloud-arrow-up'}`}></i>
        <p style={{ fontWeight: 500, marginBottom: 4 }}>{uploading ? 'Uploading files...' : 'Drop files here or click to upload'}</p>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>PNG, JPG, WEBP, GIF supported</p>
        <input id="media-upload" type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e.target.files)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 280px' : '1fr', gap: 20 }}>
        {/* Grid */}
        <div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
              {Array(12).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 10 }}></div>)}
            </div>
          ) : media.length === 0 ? (
            <div className="empty-state card" style={{ padding: 60 }}>
              <i className="bi bi-images"></i><h3>No Media Files</h3><p>Upload images to get started</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
              {media.map(item => (
                <div key={item._id}
                  onClick={() => setSelected(item)}
                  style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${selected?._id === item._id ? 'var(--primary)' : 'transparent'}`, transition: '0.2s' }}>
                  <img src={item.url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: '0.2s', display: 'flex', alignItems: 'flex-end', padding: 8 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                    <div style={{ color: '#fff', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  </div>
                  {selected?._id === item._id && (
                    <div style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="bi bi-check" style={{ color: '#fff', fontSize: 12 }}></i>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="card" style={{ position: 'sticky', top: 20, height: 'fit-content' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>File Details</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: 16 }}>
              <img src={selected.url} alt={selected.name} style={{ width: '100%', borderRadius: 8, marginBottom: 16, maxHeight: 200, objectFit: 'contain', background: '#f5f5f5' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, marginBottom: 16 }}>
                <div><span style={{ color: 'var(--muted)' }}>Name:</span> <span style={{ fontWeight: 500 }}>{selected.name}</span></div>
                <div><span style={{ color: 'var(--muted)' }}>Size:</span> <span>{selected.size ? `${(selected.size / 1024).toFixed(1)} KB` : '—'}</span></div>
                {selected.width && <div><span style={{ color: 'var(--muted)' }}>Dimensions:</span> <span>{selected.width}×{selected.height}px</span></div>}
                <div><span style={{ color: 'var(--muted)' }}>Uploaded:</span> <span>{new Date(selected.createdAt).toLocaleDateString()}</span></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => copyUrl(selected.url)} style={{ width: '100%' }}>
                  <i className="bi bi-clipboard"></i> Copy URL
                </button>
                <button className="btn btn-danger" onClick={() => remove(selected._id)} style={{ width: '100%' }}>
                  <i className="bi bi-trash"></i> Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ──── COUPONS PAGE ────────────────────────────────────────────────
export function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minOrderValue: 0, maxDiscount: '', usageLimit: '', description: '', isActive: true, expiryDate: '' });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/coupons'); setCoupons(data.data); }
    catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openForm = (item = null) => {
    setEditItem(item);
    setForm(item ? { ...item, expiryDate: item.expiryDate ? item.expiryDate.slice(0, 10) : '' } : { code: '', type: 'percentage', value: '', minOrderValue: 0, maxDiscount: '', usageLimit: '', description: '', isActive: true, expiryDate: '' });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, value: parseFloat(form.value), minOrderValue: parseFloat(form.minOrderValue) || 0, maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined, usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null };
      if (editItem) await api.put(`/coupons/${editItem._id}`, payload);
      else await api.post('/coupons', payload);
      toast.success(editItem ? 'Coupon updated!' : 'Coupon created!');
      setShowForm(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try { await api.delete(`/coupons/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Coupons ({coupons.length})</h1>
        <button className="btn btn-primary" onClick={() => openForm()}><i className="bi bi-plus-lg"></i> Add Coupon</button>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Used</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? Array(4).fill(0).map((_, i) => <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }}></div></td>)}</tr>)
                : coupons.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty-state"><i className="bi bi-ticket-perforated"></i><h3>No Coupons</h3></div></td></tr>
                ) : coupons.map(c => (
                  <tr key={c._id}>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>{c.code}</span></td>
                    <td><span className={`badge ${c.type === 'percentage' ? 'badge-info' : 'badge-purple'}`}>{c.type}</span></td>
                    <td style={{ fontWeight: 600 }}>{c.type === 'percentage' ? `${c.value}%` : `$${c.value}`}</td>
                    <td style={{ fontSize: 13 }}>${c.minOrderValue || 0}</td>
                    <td style={{ fontSize: 13 }}>{c.usedCount || 0}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'Never'}</td>
                    <td><span className={`badge ${c.isActive ? 'badge-success' : 'badge-gray'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openForm(c)}><i className="bi bi-pencil"></i></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => remove(c._id)}><i className="bi bi-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700, margin: 0 }}>{editItem ? 'Edit Coupon' : 'New Coupon'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Coupon Code *</label>
                  <input className="form-control" required style={{ fontFamily: 'monospace', fontWeight: 700 }} placeholder="SAVE20" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Type *</label>
                  <select className="form-control" required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Value * {form.type === 'percentage' ? '(%)' : '($)'}</label>
                  <input className="form-control" type="number" step="0.01" min="0" required value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Order Value ($)</label>
                  <input className="form-control" type="number" step="0.01" min="0" value={form.minOrderValue} onChange={e => setForm(f => ({ ...f, minOrderValue: e.target.value }))} />
                </div>
                {form.type === 'percentage' && (
                  <div className="form-group">
                    <label className="form-label">Max Discount ($)</label>
                    <input className="form-control" type="number" step="0.01" min="0" placeholder="No limit" value={form.maxDiscount || ''} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Usage Limit</label>
                  <input className="form-control" type="number" min="0" placeholder="Unlimited" value={form.usageLimit || ''} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input className="form-control" type="date" value={form.expiryDate || ''} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-control" placeholder="e.g. 20% off for new customers" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <label className="toggle" style={{ marginBottom: 20 }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                <span className="toggle-slider"></span>
                <span style={{ fontSize: 13 }}>Active</span>
              </label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Coupon'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ──── FAQs, TESTIMONIALS, REVIEWS ─────────────────────────────────
function SimpleListPage({ title, endpoint, fields, icon }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const defaultForm = fields.reduce((acc, f) => ({ ...acc, [f.key]: f.default ?? '' }), {});

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const adminEndpoint = endpoint.includes('/faq') ? `${endpoint}/admin/all` : endpoint;
      const { data } = await api.get(adminEndpoint);
      setItems(data.data);
    } catch { } finally { setLoading(false); }
  }, [endpoint]);

  useEffect(() => { fetch(); }, [fetch]);

  const openForm = (item = null) => {
    setEditItem(item);
    setForm(item ? { ...item } : { ...defaultForm });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) await api.put(`${endpoint}/${editItem._id}`, form);
      else await api.post(endpoint, form);
      toast.success(editItem ? 'Updated!' : 'Created!');
      setShowForm(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this item?')) return;
    try { await api.delete(`${endpoint}/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  const toggle = async (item, key) => {
    try {
      await api.put(`${endpoint}/${item._id}`, { [key]: !item[key] });
      setItems(is => is.map(i => i._id === item._id ? { ...i, [key]: !item[key] } : i));
    } catch { toast.error('Update failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>{title} ({items.length})</h1>
        <button className="btn btn-primary" onClick={() => openForm()}><i className="bi bi-plus-lg"></i> Add New</button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
        ) : items.length === 0 ? (
          <div className="empty-state" style={{ padding: 60 }}>
            <i className={`bi ${icon}`}></i>
            <h3>No {title}</h3>
            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => openForm()}><i className="bi bi-plus-lg"></i> Add First Item</button>
          </div>
        ) : (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map(item => (
              <div key={item._id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  {fields.filter(f => f.primary).map(f => (
                    <div key={f.key} style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item[f.key]}</div>
                  ))}
                  {fields.filter(f => f.secondary).map(f => (
                    <div key={f.key} style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{String(item[f.key] || '').substring(0, 120)}{String(item[f.key] || '').length > 120 ? '...' : ''}</div>
                  ))}
                  {item.rating && (
                    <div style={{ marginTop: 4 }}>
                      {Array.from({ length: 5 }, (_, i) => <i key={i} className={`bi ${i < item.rating ? 'bi-star-fill' : 'bi-star'}`} style={{ color: i < item.rating ? '#FFA31A' : '#ddd', fontSize: 12 }}></i>)}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  {item.isActive !== undefined && (
                    <label className="toggle">
                      <input type="checkbox" checked={item.isActive} onChange={() => toggle(item, 'isActive')} />
                      <span className="toggle-slider"></span>
                    </label>
                  )}
                  {item.isApproved !== undefined && (
                    <label className="toggle">
                      <input type="checkbox" checked={item.isApproved} onChange={() => toggle(item, 'isApproved')} />
                      <span className="toggle-slider"></span>
                    </label>
                  )}
                  <button className="btn btn-outline btn-sm btn-icon" onClick={() => openForm(item)}><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => remove(item._id)}><i className="bi bi-trash"></i></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700, margin: 0 }}>{editItem ? `Edit ${title.slice(0, -1)}` : `New ${title.slice(0, -1)}`}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ padding: 24 }}>
              {fields.map(field => (
                <div key={field.key} className="form-group">
                  <label className="form-label">{field.label}{field.required ? ' *' : ''}</label>
                  {field.type === 'textarea' ? (
                    <textarea className="form-control" required={field.required} value={form[field.key] || ''}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} />
                  ) : field.type === 'number' ? (
                    <input className="form-control" type="number" min={field.min || 0} max={field.max} required={field.required}
                      value={form[field.key] || ''} onChange={e => setForm(f => ({ ...f, [field.key]: parseFloat(e.target.value) || 0 }))} />
                  ) : field.type === 'toggle' ? (
                    <label className="toggle">
                      <input type="checkbox" checked={!!form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.checked }))} />
                      <span className="toggle-slider"></span>
                      <span style={{ fontSize: 13 }}>{field.label}</span>
                    </label>
                  ) : (
                    <input className="form-control" type={field.type || 'text'} required={field.required}
                      placeholder={field.placeholder} value={form[field.key] || ''}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} />
                  )}
                </div>
              ))}
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

export function FaqsPage() {
  return <SimpleListPage title="FAQs" endpoint="/faq" icon="bi-question-circle" fields={[
    { key: 'question', label: 'Question', required: true, primary: true },
    { key: 'answer', label: 'Answer', required: true, type: 'textarea', secondary: true },
    { key: 'category', label: 'Category', placeholder: 'e.g. Shipping' },
    { key: 'order', label: 'Display Order', type: 'number', default: 0 },
    { key: 'isActive', label: 'Active', type: 'toggle', default: true },
  ]} />;
}

export function TestimonialsPage() {
  return <SimpleListPage title="Testimonials" endpoint="/testimonials" icon="bi-chat-quote" fields={[
    { key: 'name', label: 'Customer Name', required: true, primary: true },
    { key: 'role', label: 'Role / Title', placeholder: 'e.g. Fashion Blogger' },
    { key: 'avatar', label: 'Avatar URL', placeholder: 'https://...' },
    { key: 'rating', label: 'Rating (1-5)', type: 'number', min: 1, max: 5, default: 5 },
    { key: 'content', label: 'Testimonial', required: true, type: 'textarea', secondary: true },
    { key: 'order', label: 'Display Order', type: 'number', default: 0 },
    { key: 'isActive', label: 'Active', type: 'toggle', default: true },
  ]} />;
}

// ──── CUSTOMER DIARIES (About page photo marquee) ──────────────────
export function CustomerDiariesPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ caption: '', isActive: true, order: 0 });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/customer-diaries/admin/all'); setPhotos(data.data); }
    catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openForm = (item = null) => {
    setEditItem(item);
    setForm(item ? { caption: item.caption || '', isActive: item.isActive, order: item.order || 0 } : { caption: '', isActive: true, order: photos.length });
    setImageFile(null);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editItem && !imageFile) { toast.error('Please choose a photo to upload'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      if (editItem) await api.put(`/customer-diaries/${editItem._id}`, fd);
      else await api.post('/customer-diaries', fd);
      toast.success(editItem ? 'Photo updated!' : 'Photo added!');
      setShowForm(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this photo?')) return;
    try { await api.delete(`/customer-diaries/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Customer Diaries</h1>
        <button className="btn btn-primary" onClick={() => openForm()}><i className="bi bi-plus-lg"></i> Add Photo</button>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
        These photos power the scrolling "Customer Diaries" marquee on the About Us page.
      </p>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Photo</th><th>Caption</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? Array(4).fill(0).map((_, i) => <tr key={i}>{Array(5).fill(0).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }}></div></td>)}</tr>)
                : photos.length === 0 ? (
                  <tr><td colSpan={5}><div className="empty-state"><i className="bi bi-images"></i><h3>No Photos Yet</h3><p>Add photos to populate the About page marquee.</p></div></td></tr>
                ) : photos.map(p => (
                  <tr key={p._id}>
                    <td><img src={p.image} alt={p.caption || 'Customer'} style={{ width: 60, height: 75, objectFit: 'cover', borderRadius: 8 }} /></td>
                    <td style={{ fontSize: 13 }}>{p.caption || '—'}</td>
                    <td style={{ fontSize: 13 }}>{p.order}</td>
                    <td><span className={`badge ${p.isActive ? 'badge-success' : 'badge-gray'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openForm(p)}><i className="bi bi-pencil"></i></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => remove(p._id)}><i className="bi bi-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700, margin: 0 }}>{editItem ? 'Edit Photo' : 'Add Photo'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ padding: 24 }}>
              <div className="form-group">
                <label className="form-label">Photo {!editItem && '*'}</label>
                {editItem?.image && !imageFile && <img src={editItem.image} alt="" style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
                {imageFile && <img src={URL.createObjectURL(imageFile)} alt="" style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
                <input type="file" accept="image/*" className="form-control" onChange={e => setImageFile(e.target.files[0])} />
              </div>
              <div className="form-group">
                <label className="form-label">Caption (optional)</label>
                <input className="form-control" value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} placeholder="e.g. Priya from Mumbai" />
              </div>
              <div className="form-group">
                <label className="form-label">Display Order</label>
                <input type="number" className="form-control" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="toggle">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                  <span className="toggle-slider"></span>
                  <span style={{ fontSize: 13 }}>Active</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
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

export function ReviewsPage() {
  return <SimpleListPage title="Reviews" endpoint="/reviews/admin/all" icon="bi-star" fields={[
    { key: 'name', label: 'Reviewer Name', required: true, primary: true },
    { key: 'rating', label: 'Rating (1-5)', type: 'number', min: 1, max: 5, default: 5 },
    { key: 'title', label: 'Review Title' },
    { key: 'comment', label: 'Review Content', required: true, type: 'textarea', secondary: true },
    { key: 'isApproved', label: 'Approved', type: 'toggle', default: false },
  ]} />;
}