import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const imageUrl = product.images?.length > 0 
    ? `http://localhost:5000/uploads/${product.images[0]}`
    : 'https://via.placeholder.com/300x200?text=No+Image';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="product-card">
      <img 
        src={imageUrl} 
        alt={product.title}
        className="product-image"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
        }}
      />
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <div className="product-price">{formatPrice(product.price)}</div>
        <p className="product-description">{product.description}</p>
        <div className="product-meta">
          <span className="product-category">{product.category}</span>
          <span className="product-stock">Stock: {product.stock}</span>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <Link 
            to={`/product/${product._id}`}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;