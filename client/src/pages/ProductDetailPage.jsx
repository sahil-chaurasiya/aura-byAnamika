import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist, localToggleWishlist, selectWishlistItems } from '../store/slices/wishlistSlice';
import { selectSettings } from '../store/slices/settingsSlice';
import api from '../services/api';
import Breadcrumb from '../components/common/Breadcrumb';
import ProductCard from '../components/product/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const wishlistItems = useSelector(selectWishlistItems);
  const { currency_symbol = '$' } = useSelector(selectSettings);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  // Selection state
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', comment: '', hoverRating: 0 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`)
      .then(r => {
        setProduct(r.data.data);
        // Set defaults
        if (r.data.data.sizes?.length) setSelectedSize(r.data.data.sizes[0]);
        if (r.data.data.colors?.length) setSelectedColor(r.data.data.colors[0].name);
        return api.get(`/products/${r.data.data._id}/related`);
      })
      .then(r => setRelated(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (product?._id) {
      api.get(`/reviews/product/${product._id}`).then(r => setReviews(r.data.data)).catch(() => {});
    }
  }, [product?._id]);

  const isWishlisted = wishlistItems.includes(product?._id);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes?.length && !selectedSize) return toast.error('Please select a size');
    if (product.colors?.length && !selectedColor) return toast.error('Please select a color');
    dispatch(addToCart({ product, quantity, size: selectedSize, color: selectedColor }));
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = () => {
    if (!product) return;
    if (isAuthenticated) {
      dispatch(toggleWishlist(product._id));
    } else {
      dispatch(localToggleWishlist(product._id));
    }
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to submit a review');
    if (!reviewForm.rating) return toast.error('Please select a rating');
    if (!reviewForm.comment) return toast.error('Please write a review');
    setSubmitting(true);
    try {
      await api.post('/reviews', { product: product._id, ...reviewForm });
      toast.success('Review submitted! It will appear after approval.');
      setReviewForm({ rating: 0, title: '', comment: '', hoverRating: 0 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="ul-inner-page-container">
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div className="loader" style={{ margin: '0 auto' }}></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="ul-inner-page-container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2>Product not found</h2>
        <Link to="/shop" className="ul-btn" style={{ marginTop: 20, display: 'inline-flex' }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  const displayPrice = product.salePrice || product.price;
  const discountPercent = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;
  const images = product.images?.length ? product.images : [{ url: product.thumbnail || 'https://via.placeholder.com/600x700' }];

  return (
    <>
      <Helmet>
        <title>{product.name} - Aura by Anamika</title>
        <meta name="description" content={product.shortDescription || product.description?.slice(0, 160)} />
        <meta property="og:title" content={product.name} />
        <meta property="og:image" content={product.thumbnail} />
      </Helmet>

      <div className="ul-container">
        <Breadcrumb
          title="Shop Details"
          links={[{ label: 'Shop', to: '/shop' }, { label: product.name }]}
        />
      </div>

      <div className="ul-inner-page-container">
        <div className="ul-product-details">
          {/* Top - Image + Info */}
          <div className="ul-product-details-top">
            <div className="row ul-bs-row row-cols-lg-2 row-cols-1 align-items-start">
              {/* Images */}
              <div className="col">
                <div className="ul-product-details-img">
                  <Swiper
                    modules={[Navigation, Thumbs, Zoom]}
                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                    navigation={{ prevEl: '.pd-img-prev', nextEl: '.pd-img-next' }}
                    zoom
                    loop={images.length > 1}
                    className="ul-product-details-img-slider"
                    style={{ borderRadius: 20, overflow: 'hidden' }}
                  >
                    {images.map((img, i) => (
                      <SwiperSlide key={i}>
                        <div className="swiper-zoom-container">
                          <img
                            src={img.url}
                            alt={img.alt || product.name}
                            style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 20 }}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                    <div className="ul-product-details-img-slider-nav">
                      <button className="pd-img-prev"><i className="bi bi-chevron-left"></i></button>
                      <button className="pd-img-next"><i className="bi bi-chevron-right"></i></button>
                    </div>
                  </Swiper>

                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <Swiper
                      onSwiper={setThumbsSwiper}
                      spaceBetween={10}
                      slidesPerView={4}
                      freeMode
                      watchSlidesProgress
                      style={{ marginTop: 10 }}
                    >
                      {images.map((img, i) => (
                        <SwiperSlide key={i}>
                          <img
                            src={img.url}
                            alt={`Thumb ${i + 1}`}
                            style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 10, cursor: 'pointer' }}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="col">
                <div className="ul-product-details-txt">
                  {/* Rating */}
                  <div className="ul-product-details-rating">
                    <span className="rating">
                      {Array.from({ length: 5 }, (_, i) => (
                        <i key={i} className={`bi ${i < Math.round(product.ratings) ? 'bi-star-fill' : 'bi-star'}`}
                          style={{ color: i < Math.round(product.ratings) ? '#FFA31A' : '#ddd', fontSize: 14 }} />
                      ))}
                    </span>
                    <span className="review-number">({product.numReviews} Customer Reviews)</span>
                  </div>

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
                    <span className="ul-product-details-price">
                      {currency_symbol}{displayPrice?.toFixed(2)}
                    </span>
                    {product.salePrice && (
                      <span style={{ fontSize: 18, color: '#999', textDecoration: 'line-through' }}>
                        {currency_symbol}{product.price?.toFixed(2)}
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="ul-product-discount-tag">{discountPercent}% Off</span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="ul-product-details-title">{product.name}</h1>

                  {/* Short Description */}
                  {product.shortDescription && (
                    <p className="ul-product-details-descr">{product.shortDescription}</p>
                  )}

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    {product.isNewArrival && <span style={{ background: '#22c55e', color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>New Arrival</span>}
                    {product.isBestSeller && <span style={{ background: '#f97316', color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>Best Seller</span>}
                    {product.stock === 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>Out of Stock</span>}
                    {product.stock > 0 && product.stock <= 5 && <span style={{ background: '#f97316', color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>Only {product.stock} left!</span>}
                  </div>

                  {/* Options */}
                  <div className="ul-product-details-options">
                    {/* Sizes */}
                    {product.sizes?.length > 0 && (
                      <div className="ul-product-details-option ul-product-details-sizes">
                        <span className="title">Size</span>
                        <div className="variants">
                          {product.sizes.map(size => (
                            <label key={size} style={{ cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name="product-size"
                                value={size}
                                checked={selectedSize === size}
                                onChange={() => setSelectedSize(size)}
                                hidden
                              />
                              <span
                                className="size-btn"
                                style={{
                                  border: `2px solid ${selectedSize === size ? '#EF2853' : 'rgba(0,0,0,0.2)'}`,
                                  background: selectedSize === size ? '#EF2853' : 'transparent',
                                  color: selectedSize === size ? '#fff' : '#333',
                                }}
                              >
                                {size}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Colors */}
                    {product.colors?.length > 0 && (
                      <div className="ul-product-details-option ul-product-details-colors">
                        <span className="title">
                          Color: <strong>{selectedColor}</strong>
                        </span>
                        <div className="variants">
                          {product.colors.map(color => (
                            <label key={color.name} style={{ cursor: 'pointer' }} title={color.name}>
                              <input
                                type="radio"
                                name="product-color"
                                value={color.name}
                                checked={selectedColor === color.name}
                                onChange={() => setSelectedColor(color.name)}
                                hidden
                              />
                              <span
                                className="color-btn"
                                style={{
                                  background: color.hex || '#000',
                                  border: `3px solid ${selectedColor === color.name ? '#EF2853' : 'transparent'}`,
                                  outline: selectedColor === color.name ? '2px solid #EF2853' : '2px solid transparent',
                                  outlineOffset: 2,
                                }}
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="ul-product-details-option ul-product-details-quantity">
                    <span className="title">Quantity</span>
                    <div className="ul-product-quantity-wrapper">
                      <input
                        type="number"
                        className="ul-product-quantity qty-input"
                        value={quantity}
                        min={1}
                        max={product.stock || 99}
                        onChange={e => setQuantity(Math.max(1, Math.min(product.stock || 99, parseInt(e.target.value) || 1)))}
                        readOnly
                      />
                      <div className="btns">
                        <button type="button" className="quantityIncreaseButton" onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}>
                          <i className="bi bi-plus"></i>
                        </button>
                        <button type="button" className="quantityDecreaseButton" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                          <i className="bi bi-dash"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ul-product-details-actions">
                    <div className="left">
                      <button
                        className="add-to-cart"
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        style={{ opacity: product.stock === 0 ? 0.5 : 1 }}
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        <span className="icon"><i className="bi bi-bag"></i></span>
                      </button>
                      <button
                        className="add-to-wishlist"
                        onClick={handleWishlist}
                        style={{ color: isWishlisted ? '#EF2853' : undefined }}
                      >
                        <span className="icon">
                          <i className={isWishlisted ? 'bi bi-heart-fill' : 'bi bi-heart'}></i>
                        </span>
                        {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
                      </button>
                    </div>
                    <div className="share-options">
                      <button title="Share on Facebook" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}><i className="bi bi-facebook"></i></button>
                      <button title="Share on Twitter" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${product.name}`, '_blank')}><i className="bi bi-twitter-x"></i></button>
                      <button title="Copy link" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}><i className="bi bi-link-45deg"></i></button>
                    </div>
                  </div>

                  {/* Meta */}
                  <div style={{ marginTop: 24, fontSize: 14, color: '#666', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {product.sku && <div><strong>SKU:</strong> {product.sku}</div>}
                    {product.categories?.length > 0 && (
                      <div>
                        <strong>{product.categories.length > 1 ? 'Categories:' : 'Category:'}</strong>{' '}
                        {product.categories.map((c, i) => (
                          <React.Fragment key={c.label}>
                            {i > 0 && ', '}
                            <Link to={`/shop?category=${encodeURIComponent(c.label)}`} style={{ color: '#EF2853' }}>{c.label}</Link>
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                    {product.tags?.length > 0 && (
                      <div><strong>Tags:</strong> {product.tags.map(tag => (
                        <Link key={tag} to={`/shop?tags=${tag}`} style={{ color: '#EF2853', marginRight: 6 }}>#{tag}</Link>
                      ))}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom - Description + Reviews */}
          <div className="ul-product-details-bottom">
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.1)', marginBottom: 30, gap: 0 }}>
              {['description', 'reviews'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '12px 24px', border: 'none', background: 'none', cursor: 'pointer',
                    fontWeight: 500, fontSize: 15, textTransform: 'capitalize',
                    borderBottom: activeTab === tab ? '2px solid #EF2853' : '2px solid transparent',
                    color: activeTab === tab ? '#EF2853' : '#333',
                    transition: '0.3s',
                  }}
                >
                  {tab} {tab === 'reviews' && `(${reviews.length})`}
                </button>
              ))}
            </div>

            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="ul-product-details-long-descr-wrapper">
                <h3 className="ul-product-details-inner-title">Item Description</h3>
                <div
                  style={{ fontSize: 15, lineHeight: 1.8, color: '#444' }}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="ul-product-details-reviews">
                <h3 className="ul-product-details-inner-title">{reviews.length} Reviews</h3>

                {reviews.length === 0 && (
                  <p style={{ color: '#666', marginBottom: 30 }}>No reviews yet. Be the first to review this product!</p>
                )}

                {reviews.map(review => (
                  <div key={review._id} className="ul-product-details-review">
                    <div className="ul-product-details-review-reviewer-img">
                      {review.avatar
                        ? <img src={review.avatar} alt={review.name} />
                        : <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#EF2853', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 22 }}>{review.name?.[0]}</div>
                      }
                    </div>
                    <div className="ul-product-details-review-txt">
                      <div className="header">
                        <div className="left">
                          <h4 className="reviewer-name">{review.name}</h4>
                          <h5 className="review-date">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</h5>
                        </div>
                        <div className="right">
                          <div className="rating">
                            {Array.from({ length: 5 }, (_, i) => (
                              <i key={i} className={`bi ${i < review.rating ? 'bi-star-fill' : 'bi-star'}`}
                                style={{ color: i < review.rating ? '#FFA31A' : '#ddd' }} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.title && <strong style={{ display: 'block', marginBottom: 4 }}>{review.title}</strong>}
                      <p>{review.comment}</p>
                      {review.isVerifiedPurchase && (
                        <span style={{ fontSize: 12, color: '#22c55e' }}><i className="bi bi-check-circle-fill"></i> Verified Purchase</span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Review Form */}
                <div className="ul-product-details-review-form-wrapper">
                  <h3 className="ul-product-details-inner-title">Write A Review</h3>
                  {!isAuthenticated && (
                    <p style={{ color: '#666', marginBottom: 16 }}>
                      Please <Link to="/login" style={{ color: '#EF2853' }}>login</Link> to submit a review.
                    </p>
                  )}
                  <form className="ul-product-details-review-form" onSubmit={handleReviewSubmit}>
                    {/* Star Rating */}
                    <div className="form-group rating-field-wrapper">
                      <span className="title">Rate this product? *</span>
                      <div className="rating-field">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setReviewForm(f => ({ ...f, hoverRating: star }))}
                            onMouseLeave={() => setReviewForm(f => ({ ...f, hoverRating: 0 }))}
                            onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                          >
                            <i className={`bi ${star <= (reviewForm.hoverRating || reviewForm.rating) ? 'bi-star-fill' : 'bi-star'}`}
                              style={{ color: star <= (reviewForm.hoverRating || reviewForm.rating) ? '#FFA31A' : '#ddd', fontSize: 24 }} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="row row-cols-2 row-cols-xxs-1 ul-bs-row">
                      <div className="form-group">
                        <input
                          type="text"
                          placeholder="Review Title"
                          value={reviewForm.title}
                          onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                        />
                      </div>
                      <div className="form-group col-12">
                        <textarea
                          placeholder="Your Review *"
                          value={reviewForm.comment}
                          onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <button type="submit" disabled={!isAuthenticated || submitting}>
                        {submitting ? 'Submitting...' : 'Post Review'}
                        <span><i className="bi bi-arrow-up-right"></i></span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div style={{ marginTop: 60 }}>
              <div className="ul-section-heading">
                <div>
                  <span className="ul-section-sub-title">You Might Also Like</span>
                  <h2 className="ul-section-title">Related Products</h2>
                </div>
              </div>
              <div className="row row-cols-xl-4 row-cols-md-3 row-cols-2 row-cols-xxs-1 ul-bs-row">
                {related.slice(0, 8).map(p => (
                  <div key={p._id} className="col">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}