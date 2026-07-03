import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { CLIENT_URL } from '../../services/api';
import toast from 'react-hot-toast';

// ──── BLOG LIST ───────────────────────────────────────────────────
export function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/blog/admin/all');
      setPosts(data.data);
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const remove = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/blog/${id}`);
      toast.success('Post deleted');
      fetch();
    } catch { toast.error('Delete failed'); }
  };

  const togglePublish = async (post) => {
    try {
      await api.put(`/blog/${post._id}`, { isPublished: !post.isPublished });
      setPosts(ps => ps.map(p => p._id === post._id ? { ...p, isPublished: !post.isPublished } : p));
      toast.success(post.isPublished ? 'Post unpublished' : 'Post published');
    } catch { toast.error('Update failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Blog Posts ({posts.length})</h1>
        <Link to="/blog/new" className="btn btn-primary">
          <i className="bi bi-plus-lg"></i> New Post
        </Link>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Post</th><th>Category</th><th>Status</th><th>Views</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}>{Array(6).fill(0).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }}></div></td>)}</tr>
              )) : posts.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state">
                    <i className="bi bi-journal-text"></i>
                    <h3>No Blog Posts</h3>
                    <p>Start writing your first blog post.</p>
                    <Link to="/blog/new" className="btn btn-primary" style={{ marginTop: 12 }}>
                      <i className="bi bi-plus-lg"></i> Create Post
                    </Link>
                  </div>
                </td></tr>
              ) : posts.map(post => (
                <tr key={post._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {post.image && <img src={post.image} alt={post.title} style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 8 }} />}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{post.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>/{post.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ fontSize: 13 }}>{post.category || '—'}</span></td>
                  <td>
                    <label className="toggle">
                      <input type="checkbox" checked={post.isPublished} onChange={() => togglePublish(post)} />
                      <span className="toggle-slider"></span>
                      <span style={{ fontSize: 12 }}>{post.isPublished ? 'Published' : 'Draft'}</span>
                    </label>
                  </td>
                  <td style={{ fontSize: 13 }}>{post.views || 0}</td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link to={`/blog/${post._id}/edit`} className="btn btn-outline btn-sm btn-icon" title="Edit">
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <a href={`${CLIENT_URL}/blog/${post.slug}`} target="_blank" rel="noreferrer"
                        className="btn btn-outline btn-sm btn-icon" title="View">
                        <i className="bi bi-box-arrow-up-right"></i>
                      </a>
                      <button onClick={() => remove(post._id)} className="btn btn-danger btn-sm btn-icon" title="Delete">
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ──── BLOG FORM ───────────────────────────────────────────────────
export function BlogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', category: '',
    tags: '', isPublished: false, image: '',
    seo: { metaTitle: '', metaDescription: '' },
  });

  useEffect(() => {
    if (isEdit) {
      api.get(`/blog/${id}`).then(r => {
        const p = r.data.data;
        setForm({ ...p, tags: p.tags?.join(', ') || '' });
      }).catch(() => {
        toast.error('Post not found — it may have been deleted');
        navigate('/blog');
      });
    }
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      // Only send editable fields. `form` may also contain server-populated
      // or read-only fields (author as a populated object, _id, slug, views,
      // createdAt/updatedAt, imagePublicId, publishedAt) picked up from the
      // GET response — sending those back would stringify objects like
      // `author` into "[object Object]", which Mongoose then fails to cast
      // to an ObjectId and rejects with a 404 "Resource not found".
      const editableFields = ['title', 'excerpt', 'content', 'category', 'isPublished'];
      editableFields.forEach(k => fd.append(k, form[k] ?? ''));
      fd.append('seo', JSON.stringify(form.seo || {}));
      const tags = typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : (form.tags || []);
      tags.forEach(t => fd.append('tags', t));
      if (imageFile) fd.append('image', imageFile);

      if (isEdit) {
        await api.put(`/blog/${id}`, fd);
        toast.success('Post updated!');
      } else {
        await api.post('/blog', fd);
        toast.success('Post created!');
        navigate('/blog');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSave}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{isEdit ? 'Edit Post' : 'New Blog Post'}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/blog')}>Cancel</button>
          <button type="button" className="btn btn-outline"
            onClick={() => { set('isPublished', false); setTimeout(() => document.querySelector('form').requestSubmit(), 0); }}>
            Save as Draft
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}
            onClick={() => set('isPublished', true)}>
            <i className={`bi ${saving ? 'bi-hourglass' : 'bi-check-lg'}`}></i>
            {saving ? 'Saving...' : isEdit ? 'Update & Publish' : 'Publish'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Post Title *</label>
                <input className="form-control" style={{ fontSize: 18, fontWeight: 600 }} required
                  placeholder="Enter post title..."
                  value={form.title} onChange={e => set('title', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Excerpt</label>
                <textarea className="form-control" style={{ minHeight: 80 }}
                  placeholder="Brief summary shown in blog listing..."
                  value={form.excerpt || ''} onChange={e => set('excerpt', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Content * (HTML supported)</label>
                <textarea className="form-control" style={{ minHeight: 400, fontFamily: 'monospace', fontSize: 13 }}
                  required placeholder="<p>Write your blog post content here... HTML is supported.</p>"
                  value={form.content} onChange={e => set('content', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">SEO</span></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Meta Title</label>
                <input className="form-control" placeholder={form.title} value={form.seo?.metaTitle || ''}
                  onChange={e => setForm(f => ({ ...f, seo: { ...f.seo, metaTitle: e.target.value } }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Meta Description</label>
                <textarea className="form-control" style={{ minHeight: 80 }} placeholder={form.excerpt}
                  value={form.seo?.metaDescription || ''}
                  onChange={e => setForm(f => ({ ...f, seo: { ...f.seo, metaDescription: e.target.value } }))} />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Publish</span></div>
            <div className="card-body">
              <label className="toggle" style={{ marginBottom: 16 }}>
                <input type="checkbox" checked={form.isPublished} onChange={e => set('isPublished', e.target.checked)} />
                <span className="toggle-slider"></span>
                <span style={{ fontSize: 13 }}>{form.isPublished ? 'Published' : 'Draft'}</span>
              </label>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Featured Image</span></div>
            <div className="card-body">
              {(form.image && !imageFile) && (
                <img src={form.image} alt="Cover" style={{ width: '100%', borderRadius: 8, marginBottom: 12, aspectRatio: '16/9', objectFit: 'cover' }} />
              )}
              {imageFile && (
                <img src={URL.createObjectURL(imageFile)} alt="Preview" style={{ width: '100%', borderRadius: 8, marginBottom: 12, aspectRatio: '16/9', objectFit: 'cover' }} />
              )}
              <input type="file" accept="image/*" className="form-control"
                onChange={e => setImageFile(e.target.files[0])} />
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Recommended: 1200×630px</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Details</span></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-control" placeholder="e.g. Fashion Tips"
                  value={form.category || ''} onChange={e => set('category', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input className="form-control" placeholder="e.g. summer, fashion, trends"
                  value={form.tags} onChange={e => set('tags', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}