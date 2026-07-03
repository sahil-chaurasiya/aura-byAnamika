import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

/* ============================================================
   MENU BUILDER -- admin control center for the storefront navbar.
   Edits the full 3-level tree (Top Nav Item > Category > Sub-Category)
   that powers the public mega menu, including labels, links, badges,
   images, layout style, ordering and active/inactive state at every
   level. Saves the whole tree back to PUT /menus/header.
   ============================================================ */

let uidCounter = 0;
const uid = () => `tmp_${Date.now()}_${uidCounter++}`;

const emptySub = () => ({ _key: uid(), label: 'New Sub-Category', url: '#', badge: '', isActive: true });
const emptyChild = () => ({ _key: uid(), label: 'New Category', url: '#', badge: '', image: '', isActive: true, children: [] });
const emptyTop = () => ({ _key: uid(), label: 'New Menu Item', url: '#', badge: '', layout: 'link', isActive: true, promo: { image: '', title: '', subtitle: '', url: '' }, children: [] });

function keyOf(node, idx) { return node._id || node._key || `idx_${idx}`; }

// Immutable helpers operating on an index-path, e.g. [2] = top item 2, [2,1] = its category 1, [2,1,0] = its sub-category 0
function getAt(items, path) {
  let list = items, node = null;
  for (let i = 0; i < path.length; i++) {
    node = list[path[i]];
    list = node?.children;
  }
  return node;
}
function updateTree(items, path, fn) {
  if (path.length === 0) return fn(items);
  const [head, ...rest] = path;
  return items.map((item, i) => {
    if (i !== head) return item;
    if (rest.length === 0) return fn(item);
    return { ...item, children: updateTree(item.children || [], rest, fn) };
  });
}
function listAt(items, parentPath) {
  if (parentPath.length === 0) return items;
  const node = getAt(items, parentPath);
  return node?.children || [];
}
function setListAt(items, parentPath, newList) {
  if (parentPath.length === 0) return newList;
  return updateTree(items, parentPath, (node) => ({ ...node, children: newList }));
}

function stripTemp(node) {
  const clean = { ...node };
  delete clean._key;
  if (clean.children) clean.children = clean.children.map(stripTemp);
  return clean;
}

export default function MenuBuilderPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    api.get('/menus/header').then(r => setItems(r.data?.data?.items || [])).catch(() => toast.error('Failed to load menu')).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = (path) => {
    const k = path.join('-');
    setExpanded(prev => ({ ...prev, [k]: !prev[k] }));
  };
  const isExpanded = (path) => !!expanded[path.join('-')];

  const patchNode = (path, patch) => {
    setItems(prev => updateTree(prev, path, (node) => ({ ...node, ...patch })));
  };

  const addNode = (parentPath, depth) => {
    const factory = depth === 0 ? emptyTop : depth === 1 ? emptyChild : emptySub;
    setItems(prev => {
      const list = listAt(prev, parentPath);
      return setListAt(prev, parentPath, [...list, factory()]);
    });
    if (parentPath.length) setExpanded(prev => ({ ...prev, [parentPath.join('-')]: true }));
  };

  const removeNode = (path) => {
    if (!window.confirm('Remove this menu item and everything nested under it?')) return;
    const parentPath = path.slice(0, -1);
    const idx = path[path.length - 1];
    setItems(prev => {
      const list = listAt(prev, parentPath);
      const newList = list.filter((_, i) => i !== idx);
      return setListAt(prev, parentPath, newList);
    });
  };

  const moveNode = (path, dir) => {
    const parentPath = path.slice(0, -1);
    const idx = path[path.length - 1];
    const swapWith = idx + dir;
    setItems(prev => {
      const list = [...listAt(prev, parentPath)];
      if (swapWith < 0 || swapWith >= list.length) return prev;
      [list[idx], list[swapWith]] = [list[swapWith], list[idx]];
      return setListAt(prev, parentPath, list);
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const reindex = (list) => list.map((n, i) => ({ ...stripTemp(n), order: i, children: n.children ? reindex(n.children) : undefined }));
      const payload = { name: 'Header Menu', items: reindex(items) };
      const { data } = await api.put('/menus/header', payload);
      setItems(data.data.items || []);
      toast.success('Navigation menu saved! Changes are live on the storefront.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save menu');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset the whole navbar back to the factory-default category structure? This discards all current edits.')) return;
    try {
      const { data } = await api.post('/menus/header/reset');
      setItems(data.data.items || []);
      toast.success('Menu reset to default structure');
    } catch {
      toast.error('Reset failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Navigation Menu Builder</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
            Design the storefront navbar: top-level menu items, their categories and sub-categories. Drag order with the arrows, toggle visibility, and click Save to publish.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button className="btn btn-outline" onClick={handleReset}><i className="bi bi-arrow-counterclockwise"></i> Reset to Default</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <i className="bi bi-check2-circle"></i> {saving ? 'Saving...' : 'Save Menu'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card"><div className="card-body">
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 10 }}></div>)}
        </div></div>
      ) : (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top-Level Menu Items ({items.length})</span>
            <button className="btn btn-primary btn-sm" onClick={() => addNode([], 0)}><i className="bi bi-plus-lg"></i> Add Top-Level Item</button>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.length === 0 && <EmptyHint text="No menu items yet. Click 'Add Top-Level Item' to start building your navbar." />}
            {items.map((item, i) => (
              <MenuNode
                key={keyOf(item, i)}
                node={item}
                depth={0}
                path={[i]}
                siblingCount={items.length}
                isExpanded={isExpanded}
                toggleExpand={toggleExpand}
                patchNode={patchNode}
                addNode={addNode}
                removeNode={removeNode}
                moveNode={moveNode}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyHint({ text }) {
  return <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5, border: '1.5px dashed var(--border)', borderRadius: 10 }}>{text}</div>;
}

const DEPTH_META = {
  0: { label: 'Menu Item', accent: '#EF2853', bg: '#fff', addLabel: 'Add Category' },
  1: { label: 'Category', accent: '#7c3aed', bg: '#fbfaff', addLabel: 'Add Sub-Category' },
  2: { label: 'Sub-Category', accent: '#0ea5e9', bg: '#f5fbff', addLabel: null },
};

function MenuNode({ node, depth, path, siblingCount, isExpanded, toggleExpand, patchNode, addNode, removeNode, moveNode }) {
  const meta = DEPTH_META[depth];
  const children = node.children || [];
  const hasChildren = depth < 2;
  const open = isExpanded(path);
  const idx = path[path.length - 1];
  const [uploadingTop, setUploadingTop] = useState(false);
  const [uploadingChild, setUploadingChild] = useState(false);

  const uploadImage = async (file, onDone) => {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('folder', 'menu');
      const { data } = await api.post('/upload/image', fd);
      onDone(data.data.url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    }
  };

  return (
    <div style={{ border: '1.5px solid var(--border)', borderRadius: 10, background: meta.bg, marginLeft: depth * 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', flexWrap: 'wrap' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.accent, flexShrink: 0 }}></span>
        <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: meta.accent, flexShrink: 0 }}>{meta.label}</span>

        <input
          className="form-control" style={{ maxWidth: 200, padding: '6px 10px', fontSize: 13 }}
          value={node.label} placeholder="Label"
          onChange={e => patchNode(path, { label: e.target.value })}
        />
        <input
          className="form-control" style={{ maxWidth: 230, padding: '6px 10px', fontSize: 13 }}
          value={node.url || ''} placeholder="/shop?search=... or /about"
          onChange={e => patchNode(path, { url: e.target.value })}
        />
        <input
          className="form-control" style={{ maxWidth: 90, padding: '6px 10px', fontSize: 13 }}
          value={node.badge || ''} placeholder="Badge"
          onChange={e => patchNode(path, { badge: e.target.value })}
        />

        {depth === 0 && (
          <select
            className="form-control" style={{ maxWidth: 140, padding: '6px 10px', fontSize: 13 }}
            value={node.layout || 'link'} onChange={e => patchNode(path, { layout: e.target.value })}
          >
            <option value="link">Plain Link</option>
            <option value="simple">Simple Dropdown</option>
            <option value="mega">Mega Menu</option>
          </select>
        )}

        {depth === 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {node.image && <img src={node.image} alt="" style={{ width: 26, height: 26, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />}
            <input
              className="form-control" style={{ maxWidth: 140, padding: '6px 10px', fontSize: 13 }}
              value={node.image || ''} placeholder="Image URL"
              onChange={e => patchNode(path, { image: e.target.value })}
            />
            <label className="btn btn-outline btn-sm btn-icon" title="Upload image" style={{ cursor: uploadingChild ? 'wait' : 'pointer', flexShrink: 0 }}>
              {uploadingChild ? <i className="bi bi-hourglass-split"></i> : <i className="bi bi-upload"></i>}
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={async e => {
                  const file = e.target.files[0];
                  e.target.value = '';
                  setUploadingChild(true);
                  await uploadImage(file, (url) => patchNode(path, { image: url }));
                  setUploadingChild(false);
                }} />
            </label>
          </div>
        )}

        <label className="toggle" title="Visible on storefront">
          <input type="checkbox" checked={node.isActive !== false} onChange={e => patchNode(path, { isActive: e.target.checked })} />
          <span className="toggle-slider"></span>
        </label>

        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          <button className="btn btn-outline btn-sm btn-icon" disabled={idx === 0} onClick={() => moveNode(path, -1)} title="Move up"><i className="bi bi-arrow-up"></i></button>
          <button className="btn btn-outline btn-sm btn-icon" disabled={idx === siblingCount - 1} onClick={() => moveNode(path, 1)} title="Move down"><i className="bi bi-arrow-down"></i></button>
          {hasChildren && (
            <button className="btn btn-outline btn-sm btn-icon" onClick={() => toggleExpand(path)} title={open ? 'Collapse' : 'Expand'}>
              <i className={`bi bi-chevron-${open ? 'up' : 'down'}`}></i>
            </button>
          )}
          <button className="btn btn-danger btn-sm btn-icon" onClick={() => removeNode(path)} title="Delete"><i className="bi bi-trash"></i></button>
        </div>
      </div>

      {depth === 0 && node.layout !== 'link' && open && (
        <div style={{ padding: '0 12px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 11.5, color: '#888', margin: 0 }}>
            This image is used as the card photo for this category on the homepage "Shop by Category" section
            {node.layout === 'mega' ? ', and as the promo tile inside this item\'s mega menu.' : '.'}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {node.promo?.image && (
              <img src={node.promo.image} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }} />
            )}
            <input className="form-control" style={{ maxWidth: 260, padding: '6px 10px', fontSize: 12.5 }} placeholder="Category / promo image URL"
              value={node.promo?.image || ''} onChange={e => patchNode(path, { promo: { ...(node.promo || {}), image: e.target.value } })} />
            <label className="btn btn-outline btn-sm" style={{ cursor: uploadingTop ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {uploadingTop ? <i className="bi bi-hourglass-split"></i> : <i className="bi bi-upload"></i>}
              Upload Image
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={async e => {
                  const file = e.target.files[0];
                  e.target.value = '';
                  setUploadingTop(true);
                  await uploadImage(file, (url) => patchNode(path, { promo: { ...(node.promo || {}), image: url } }));
                  setUploadingTop(false);
                }} />
            </label>
            {node.layout === 'mega' && (
              <>
                <input className="form-control" style={{ maxWidth: 180, padding: '6px 10px', fontSize: 12.5 }} placeholder="Promo title"
                  value={node.promo?.title || ''} onChange={e => patchNode(path, { promo: { ...(node.promo || {}), title: e.target.value } })} />
                <input className="form-control" style={{ maxWidth: 220, padding: '6px 10px', fontSize: 12.5 }} placeholder="Promo subtitle"
                  value={node.promo?.subtitle || ''} onChange={e => patchNode(path, { promo: { ...(node.promo || {}), subtitle: e.target.value } })} />
                <input className="form-control" style={{ maxWidth: 200, padding: '6px 10px', fontSize: 12.5 }} placeholder="Promo link"
                  value={node.promo?.url || ''} onChange={e => patchNode(path, { promo: { ...(node.promo || {}), url: e.target.value } })} />
              </>
            )}
          </div>
        </div>
      )}

      {hasChildren && open && (
        <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {children.length === 0 && <EmptyHint text={`No ${meta.addLabel?.replace('Add ', '').toLowerCase()} yet.`} />}
          {children.map((child, i) => (
            <MenuNode
              key={keyOf(child, i)}
              node={child}
              depth={depth + 1}
              path={[...path, i]}
              siblingCount={children.length}
              isExpanded={isExpanded}
              toggleExpand={toggleExpand}
              patchNode={patchNode}
              addNode={addNode}
              removeNode={removeNode}
              moveNode={moveNode}
            />
          ))}
          <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start', marginLeft: 18 }} onClick={() => addNode(path, depth + 1)}>
            <i className="bi bi-plus-lg"></i> {meta.addLabel}
          </button>
        </div>
      )}
    </div>
  );
}