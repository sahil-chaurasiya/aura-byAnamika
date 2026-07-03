import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import Breadcrumb from '../components/common/Breadcrumb';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter state
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Same source as the homepage "Shop by Category" grid and the admin
    // product category picker: the real storefront Navigation Menu, not
    // the old flat Categories list. Plain links with no children (Home,
    // About Us, Contact) are filtered out automatically.
    api.get('/menus/header').then(r => {
      const items = (r.data.data?.items || [])
        .filter(item => item.layout !== 'link' && (item.children?.length > 0) && item.isActive !== false)
        .sort((a, b) => a.order - b.order);
      setCategories(items);
    }).catch(() => {});
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sort) params.set('sort', sort);
    if (category) params.set('category', category);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (selectedSizes.length) params.set('sizes', selectedSizes.join(','));
    if (searchParams.get('search')) params.set('search', searchParams.get('search'));
    if (searchParams.get('newArrival')) params.set('newArrival', 'true');
    if (searchParams.get('bestSeller')) params.set('bestSeller', 'true');
    if (searchParams.get('onSale')) params.set('onSale', 'true');
    if (searchParams.get('featured')) params.set('featured', 'true');
    params.set('page', page);
    params.set('limit', 12);

    api.get(`/products?${params.toString()}`)
      .then(r => {
        setProducts(r.data.data);
        setPagination(r.data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sort, category, minPrice, maxPrice, selectedSizes, page, searchParams.toString()]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    setCategory(searchParams.get('category') || '');
    setPage(1);
  }, [searchParams.toString()]);

  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSort('newest');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedSizes([]);
    setPage(1);
    setSearchParams({});
  };

  const FilterPanel = () => (
    <div>
      {/* Categories */}
      <div style={{ marginBottom: 30 }}>
        <h5 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Categories</h5>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <button
              onClick={() => { setCategory(''); setPage(1); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                color: !category ? '#EF2853' : '#333', fontWeight: !category ? 600 : 400, fontSize: 14
              }}
            >
              All Products
            </button>
          </li>
          {categories.map(cat => (
            <li key={cat.label} style={{ marginBottom: 8 }}>
              <button
                onClick={() => { setCategory(cat.label); setPage(1); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  color: category === cat.label ? '#EF2853' : '#333',
                  fontWeight: category === cat.label ? 600 : 400, fontSize: 14
                }}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div style={{ marginBottom: 30 }}>
        <h5 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Price Range</h5>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={e => { setMinPrice(e.target.value); setPage(1); }}
            style={{ width: '50%', border: '1px solid rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 14 }}
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={e => { setMaxPrice(e.target.value); setPage(1); }}
            style={{ width: '50%', border: '1px solid rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 14 }}
          />
        </div>
      </div>

      {/* Sizes */}
      <div style={{ marginBottom: 30 }}>
        <h5 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Sizes</h5>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SIZES.map(size => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              style={{
                border: `1px solid ${selectedSizes.includes(size) ? '#EF2853' : 'rgba(0,0,0,0.2)'}`,
                background: selectedSizes.includes(size) ? '#EF2853' : 'transparent',
                color: selectedSizes.includes(size) ? '#fff' : '#333',
                borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', transition: '0.2s',
              }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div style={{ marginBottom: 30 }}>
        <h5 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Filter By</h5>
        {[
          { label: 'New Arrivals', param: 'newArrival' },
          { label: 'Best Sellers', param: 'bestSeller' },
          { label: 'On Sale', param: 'onSale' },
        ].map(({ label, param }) => (
          <div key={param} style={{ marginBottom: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
              <input
                type="checkbox"
                checked={!!searchParams.get(param)}
                onChange={e => {
                  const p = new URLSearchParams(searchParams);
                  if (e.target.checked) p.set(param, 'true');
                  else p.delete(param);
                  setSearchParams(p);
                  setPage(1);
                }}
                style={{ accentColor: '#EF2853' }}
              />
              {label}
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={clearFilters}
        style={{
          width: '100%', padding: '10px', border: '1px solid rgba(0,0,0,0.2)',
          borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500,
          transition: '0.2s',
        }}
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Shop - Aura by Anamika</title>
        <meta name="description" content="Browse our complete collection of premium fashion." />
      </Helmet>

      <div className="ul-inner-page-container">
        {/* Breadcrumb */}
        <Breadcrumb title="Shop" links={[{ label: 'Shop' }]} />

        <div style={{ marginTop: 40 }}>
          <div className="row ul-bs-row">
            {/* Mobile filter toggle */}
            <div className="col-12 d-lg-none" style={{ marginBottom: 15 }}>
              <button
                onClick={() => setFilterOpen(true)}
                style={{
                  border: '1px solid rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 20px',
                  display: 'flex', alignItems: 'center', gap: 8, fontSize: 14,
                }}
              >
                <i className="bi bi-funnel"></i> Filters
              </button>
            </div>

            {/* Mobile filter overlay */}
            {filterOpen && (
              <div
                style={{
                  position: 'fixed', inset: 0, zIndex: 1000,
                  display: 'flex',
                }}
              >
                <div style={{ background: 'rgba(0,0,0,0.5)', flex: 1 }} onClick={() => setFilterOpen(false)} />
                <div style={{ background: '#fff', width: 300, padding: 24, overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h4 style={{ margin: 0, fontWeight: 600 }}>Filters</h4>
                    <button onClick={() => setFilterOpen(false)} style={{ fontSize: 20 }}>
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                  <FilterPanel />
                </div>
              </div>
            )}

            {/* Desktop Sidebar Filter */}
            <div className="col-lg-3 d-none d-lg-block">
              <div style={{
                background: '#fff', borderRadius: 20, padding: 30,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'sticky', top: 20,
              }}>
                <FilterPanel />
              </div>
            </div>

            {/* Products */}
            <div className="col-lg-9">
              {/* Toolbar */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 20, flexWrap: 'wrap', gap: 10,
              }}>
                <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
                  Showing {products.length} of {pagination.total} products
                  {searchParams.get('search') && ` for "${searchParams.get('search')}"`}
                </p>
                <select
                  value={sort}
                  onChange={e => { setSort(e.target.value); setPage(1); }}
                  style={{
                    border: '1px solid rgba(0,0,0,0.2)', borderRadius: 8,
                    padding: '8px 16px', fontSize: 14, cursor: 'pointer',
                  }}
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Grid */}
              {loading ? (
                <div className="row row-cols-xl-3 row-cols-md-2 row-cols-1 ul-bs-row">
                  {Array(12).fill(0).map((_, i) => (
                    <div key={i} className="col">
                      <div className="ul-product" style={{ minHeight: 340 }}>
                        <div style={{ background: '#f5f5f5', borderRadius: 12, height: 260 }}></div>
                        <div style={{ background: '#f5f5f5', borderRadius: 6, height: 20, marginTop: 12 }}></div>
                        <div style={{ background: '#f5f5f5', borderRadius: 6, height: 16, marginTop: 8, width: '60%' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
                  <i className="bi bi-search" style={{ fontSize: 48, display: 'block', marginBottom: 16 }}></i>
                  <h3>No products found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                  <button onClick={clearFilters} className="ul-btn" style={{ marginTop: 16 }}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="row row-cols-xl-3 row-cols-md-2 row-cols-1 ul-bs-row">
                  {products.map(product => (
                    <div key={product._id} className="col">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="ul-pagination" style={{ marginTop: 40 }}>
                  <ul>
                    <li>
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: page === 1 ? '#ccc' : '#333' }}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    <li className="pages">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === pagination.pages || Math.abs(p - page) <= 2)
                        .map((p, idx, arr) => (
                          <React.Fragment key={p}>
                            {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px' }}>…</span>}
                            <a
                              href="#"
                              className={page === p ? 'active' : ''}
                              onClick={e => { e.preventDefault(); setPage(p); }}
                            >
                              {p}
                            </a>
                          </React.Fragment>
                        ))
                      }
                    </li>
                    <li>
                      <button
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        disabled={page === pagination.pages}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: page === pagination.pages ? '#ccc' : '#333' }}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}