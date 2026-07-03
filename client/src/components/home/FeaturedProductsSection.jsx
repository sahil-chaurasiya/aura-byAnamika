import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import api from '../../services/api';
import ProductCard from '../product/ProductCard';

const DEFAULT_ROW_BANNER_IMAGES = [
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop',
];

export default function FeaturedProductsSection({ config = {} }) {
  const [rowProducts, setRowProducts] = useState([[], []]);
  const [legacyBanners, setLegacyBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rows come from the admin's Homepage Builder config. If a site hasn't
  // been re-saved since this became configurable yet, fall back to the
  // original two-empty-row shape so nothing breaks.
  const rows = config.rows?.length ? config.rows : [{ category: '', limit: 6, banner: {} }, { category: '', limit: 6, banner: {} }];

  useEffect(() => {
    const requests = rows.map(row => {
      const limit = row.limit || 6;
      return row.category
        ? api.get(`/products?category=${encodeURIComponent(row.category)}&limit=${limit}`)
        : api.get(`/products?featured=true&limit=${limit}`);
    });

    Promise.allSettled([
      ...requests,
      // Legacy fallback only used when a row has no banner image configured yet.
      // Fetched separately from products so an ad-blocker killing this call
      // (URLs containing "banner" commonly get blocked) can't wipe out the
      // product rows below.
      api.get('/banners?type=collection'),
    ]).then((results) => {
      const bannerRes = results[results.length - 1];
      const productResults = results.slice(0, rows.length);
      setRowProducts(productResults.map(r => (r.status === 'fulfilled' ? r.value.data.data || [] : [])));
      setLegacyBanners(bannerRes.status === 'fulfilled' ? bannerRes.value.data.data || [] : []);
    }).finally(() => setLoading(false));
  }, [JSON.stringify(rows)]);

  const SWIPER_OPTS = {
    modules: [Navigation, Autoplay],
    slidesPerView: 3,
    loop: true,
    autoplay: { delay: 3500, disableOnInteraction: false },
    spaceBetween: 15,
    breakpoints: {
      0:    { slidesPerView: 1 },
      480:  { slidesPerView: 2 },
      992:  { slidesPerView: 3, spaceBetween: 15 },
      1200: { slidesPerView: 3, spaceBetween: 20 },
      1400: { slidesPerView: 3, spaceBetween: 22 },
      1600: { slidesPerView: 3, spaceBetween: 26 },
    },
  };

  const renderRow = (row, i) => {
    const products = rowProducts[i] || [];
    const banner = row.banner || {};
    // Fall back to a legacy Banner doc (old data model) then a stock photo,
    // so the section never looks empty while an admin sets things up.
    const legacyBanner = legacyBanners[i];
    const bannerImage = banner.image || legacyBanner?.image || DEFAULT_ROW_BANNER_IMAGES[i % DEFAULT_ROW_BANNER_IMAGES.length];
    const bannerTitle = banner.title || legacyBanner?.title || 'Trending Now Only This Weekend!';
    const bannerBtnText = banner.buttonText || legacyBanner?.buttonText || 'Shop Now';
    const bannerBtnLink = banner.buttonLink || legacyBanner?.buttonLink || '/shop';

    return (
      <React.Fragment key={i}>
        {/* Banner col */}
        <div className="col-lg-3 col-md-4 col-12">
          <div className="ul-products-sub-banner">
            <div className="ul-products-sub-banner-img">
              <img src={bannerImage} alt={bannerTitle} />
            </div>
            <div className="ul-products-sub-banner-txt">
              <h3 className="ul-products-sub-banner-title">{bannerTitle}</h3>
              <Link to={bannerBtnLink} className="ul-btn">
                {bannerBtnText} <i className="bi bi-arrow-up-right"></i>
              </Link>
            </div>
          </div>
        </div>

        {/* Products Swiper */}
        <div className="col-lg-9 col-md-8 col-12">
          <Swiper
            {...SWIPER_OPTS}
            navigation={{
              nextEl: `.ul-products-slider-${i + 1}-nav .next`,
              prevEl: `.ul-products-slider-${i + 1}-nav .prev`,
            }}
            className={`ul-products-slider-${i + 1}`}
          >
            {(products.length ? products : Array(3).fill(null)).map((product, j) => (
              <SwiperSlide key={product?._id || j}>
                {product ? (
                  <ProductCard product={product} />
                ) : (
                  <div style={{ background: '#f5f5f5', borderRadius: 12, height: 300 }} />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
          <div className={`ul-products-slider-nav ul-products-slider-${i + 1}-nav`}>
            <button className="prev"><i className="bi bi-arrow-left"></i></button>
            <button className="next"><i className="bi bi-arrow-right"></i></button>
          </div>
        </div>
      </React.Fragment>
    );
  };

  return (
    <div className="ul-container">
      <section className="ul-products">
        <div className="ul-inner-container">

          {/* Section heading — "More Collection" button on right */}
          <div className="ul-section-heading">
            <div className="left">
              <span className="ul-section-sub-title">
                {config.subtitle || 'Summer collection'}
              </span>
              <h2 className="ul-section-title">
                {config.title || 'Shopping Every Day'}
              </h2>
            </div>
            <div className="right">
              <Link to={config.buttonLink || '/shop'} className="ul-btn">
                {config.buttonText || 'More Collection'} <i className="bi bi-arrow-up-right"></i>
              </Link>
            </div>
          </div>

          {/* One "banner + products" pair per configured row */}
          <div className="row ul-bs-row">
            {rows.map((row, i) => renderRow(row, i))}
          </div>

        </div>
      </section>
    </div>
  );
}