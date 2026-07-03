import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist, localToggleWishlist } from '../../store/slices/wishlistSlice';
import { selectWishlistItems } from '../../store/slices/wishlistSlice';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(s => s.auth);
  const wishlistItems = useSelector(selectWishlistItems);
  const isWishlisted = wishlistItems.includes(product._id);
  const { currency_symbol = '$' } = useSelector(s => s.settings.data);

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      dispatch(toggleWishlist(product._id));
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } else {
      dispatch(localToggleWishlist(product._id));
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    navigate(`/shop/${product.slug}`);
  };

  const discountPercent = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : product.discountPercent || 0;

  const displayPrice = product.salePrice || product.price;

  return (
    <div className="ul-product">
      <div className="ul-product-heading">
        <span className="ul-product-price">
          {currency_symbol}{displayPrice?.toFixed(2)}
          {product.salePrice && (
            <span style={{ fontSize: '13px', color: '#999', textDecoration: 'line-through', marginLeft: 8 }}>
              {currency_symbol}{product.price?.toFixed(2)}
            </span>
          )}
        </span>
        {discountPercent > 0 && (
          <span className="ul-product-discount-tag">{discountPercent}% Off</span>
        )}
      </div>

      <Link to={`/shop/${product.slug}`} className="ul-product-img">
        <img
          src={product.thumbnail || product.images?.[0]?.url || 'https://via.placeholder.com/270x262?text=No+Image'}
          alt={product.name}
          style={{ transition: '0.4s ease' }}
        />
        <div className="ul-product-actions">
          <button onClick={handleAddToCart} title="Add to Cart">
            <i className="bi bi-bag"></i>
          </button>
          <button onClick={handleQuickView} title="Quick View">
            <i className="bi bi-eye"></i>
          </button>
          <button
            onClick={handleWishlist}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            style={{ color: isWishlisted ? '#EF2853' : undefined }}
          >
            <i className={isWishlisted ? 'bi bi-heart-fill' : 'bi bi-heart'}></i>
          </button>
        </div>
      </Link>

      <div className="ul-product-txt">
        <h4 className="ul-product-title">
          <Link to={`/shop/${product.slug}`}>{product.name}</Link>
        </h4>
        <h5 className="ul-product-category">
          <Link to={`/shop?category=${encodeURIComponent(product.categories?.[0]?.label || '')}`}>
            {product.categories?.[0]?.label || 'Fashion'}
          </Link>
        </h5>

        {/* Star Ratings */}
        {product.ratings > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <i
                key={i}
                className={i < Math.round(product.ratings) ? 'bi bi-star-fill star-filled' : 'bi bi-star star-empty'}
                style={{ fontSize: 11 }}
              />
            ))}
            <span style={{ fontSize: 12, color: '#666', marginLeft: 4 }}>({product.numReviews})</span>
          </div>
        )}

        {/* Badges */}
        <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
          {product.isNewArrival && (
            <span style={{ background: '#22c55e', color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>NEW</span>
          )}
          {product.isBestSeller && (
            <span style={{ background: '#f97316', color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>HOT</span>
          )}
        </div>
      </div>
    </div>
  );
}