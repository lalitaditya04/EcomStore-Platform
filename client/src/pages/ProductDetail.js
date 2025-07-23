import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      if (error.response?.status === 404) {
        navigate('/products');
      }
    }
    setLoading(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getImageUrl = (filename) => {
    return filename ? `http://localhost:5000/uploads/${filename}` : 'https://via.placeholder.com/500x400?text=No+Image';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>Product not found</h3>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-wrapper">
      <button 
        onClick={() => navigate('/products')} 
        className="btn btn-secondary"
        style={{ marginBottom: '2rem' }}
      >
        ← Back to Products
      </button>

      <div className="product-detail-grid">
        {/* Product Images */}
        <div className="product-images-container">
          <div style={{ marginBottom: '1rem' }}>
            <img
              src={getImageUrl(product.images[currentImage])}
              alt={product.title}
              className="product-main-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/500x400?text=No+Image';
              }}
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="product-thumbnails">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={getImageUrl(image)}
                  alt={`${product.title} ${index + 1}`}
                  onClick={() => setCurrentImage(index)}
                  className={`product-thumbnail ${currentImage === index ? 'active' : ''}`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <h1 className="product-title-detail">{product.title}</h1>
          <div className="product-price-detail">{formatPrice(product.price)}</div>
          
          <div className="product-meta-detail">
            <div className="meta-item">
              <div className="meta-label">Category</div>
              <div className="meta-value">{product.category}</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">Stock</div>
              <div className="meta-value">{product.stock} available</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">Seller</div>
              <div className="meta-value">{product.seller.name}</div>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Description</h3>
            <div className="product-description-detail">{product.description}</div>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Tags</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      background: 'var(--gradient)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'var(--light-gray)', borderRadius: '12px' }}>
            <h4 style={{ marginBottom: '0.75rem', color: 'var(--text)' }}>Seller Information</h4>
            <p style={{ marginBottom: '0.5rem' }}>Sold by: <strong>{product.seller.name}</strong></p>
            <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
              Contact: {product.seller.email}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {product.stock > 0 ? (
              <button className="btn btn-primary" style={{ flex: 1, minWidth: '200px' }}>
                💬 Contact Seller
              </button>
            ) : (
              <button className="btn btn-secondary" disabled style={{ flex: 1, minWidth: '200px' }}>
                ❌ Out of Stock
              </button>
            )}
            
            {user && user.id === product.seller._id && (
              <button 
                onClick={() => navigate(`/dashboard`)}
                className="btn btn-secondary"
                style={{ minWidth: '150px' }}
              >
                ✏️ Edit Product
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div style={{ marginTop: '3rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Product Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <strong>Category:</strong> {product.category}
            </div>
            <div>
              <strong>Stock:</strong> {product.stock} units
            </div>
            <div>
              <strong>Status:</strong> {product.status}
            </div>
            <div>
              <strong>Listed:</strong> {new Date(product.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;