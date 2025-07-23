import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products?limit=8');
      setFeaturedProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
    setLoading(false);
  };

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Welcome to EcomStore</h1>
          <p className="hero-subtitle">
            Discover amazing products from talented sellers around the world
          </p>
          <Link to="/products" className="btn btn-secondary" style={{ backgroundColor: 'white', color: 'var(--primary)', fontWeight: '600' }}>
            Browse Products 🛍️
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="page-section">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              Loading products...
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-4 fade-in-up">
              {featuredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No products available yet</h3>
            <p>Be the first seller to add products!</p>
            <Link to="/register" className="btn btn-primary">
              Become a Seller
            </Link>
          </div>
        )}

        {featuredProducts.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/products" className="btn btn-primary">
              View All Products →
            </Link>
          </div>
        )}
        </div>
      </section>

      {/* Features */}
      <section className="page-section" style={{ backgroundColor: 'var(--secondary)' }}>
        <div className="container">
          <h2 className="section-title">Why Choose EcomStore?</h2>
          <div className="grid grid-3 fade-in-up">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
              <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>For Sellers</h3>
              <p>List your products easily and reach customers worldwide. Simple product management and secure transactions.</p>
              <Link to="/register" className="btn btn-primary">Start Selling</Link>
            </div>
            
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
              <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>For Buyers</h3>
              <p>Discover unique products from verified sellers. Safe and secure shopping experience with quality products.</p>
              <Link to="/products" className="btn btn-primary">Shop Now</Link>
            </div>
            
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Secure Platform</h3>
              <p>Built with security in mind. Protected transactions, verified users, and reliable customer support.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;