import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Source real shop categories straight from the storefront Navigation
    // Menu (the same data the admin Menu Builder edits) instead of the old
    // flat Categories list, so this grid always matches the live nav.
    // Plain links with no children -- Home, About Us, Contact -- are not
    // shop categories and are filtered out automatically.
    api.get('/menus/header').then(r => {
      const items = (r.data.data?.items || [])
        .filter(item => item.layout !== 'link' && (item.children?.length > 0) && item.isActive !== false)
        .sort((a, b) => a.order - b.order);
      setCategories(items);
    }).catch(() => {});
  }, []);

  return (
    <div className="ul-container">
      <section className="ul-categories">
        <div className="ul-inner-container">
          <div className="row row-cols-lg-4 row-cols-md-3 row-cols-2 row-cols-xxs-1 ul-bs-row">
            {categories.map(cat => (
              <div className="col" key={cat.label}>
                <Link className="ul-category" to={`/shop?category=${encodeURIComponent(cat.label)}`}>
                  <div className="ul-category-img">
                    <img
                      src={cat.promo?.image || 'https://via.placeholder.com/59x59'}
                      alt={cat.label}
                    />
                  </div>
                  <div className="ul-category-txt">
                    <span>{cat.label}</span>
                  </div>
                  <div className="ul-category-btn">
                    <span><i className="bi bi-chevron-right"></i></span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}