import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import ProductForm from '../components/ProductForm';
import api from '../utils/api';

const Dashboard = () => {
  const { user, isSeller } = useAuth();
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [sellerStatus, setSellerStatus] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalViews: 0
  });

  useEffect(() => {
    if (isSeller) {
      fetchSellerStatus();
      fetchMyProducts();
    }
    setLoading(false);
  }, [isSeller]);

  const fetchSellerStatus = async () => {
    try {
      const response = await api.get('/users/seller-status');
      setSellerStatus(response.data);
    } catch (error) {
      console.error('Error fetching seller status:', error);
    }
  };

  const fetchMyProducts = async () => {
    try {
      const response = await api.get('/products/seller/my-products');
      setMyProducts(response.data);
      
      // Calculate stats
      const active = response.data.filter(p => p.status === 'active').length;
      setStats({
        totalProducts: response.data.length,
        activeProducts: active,
        totalViews: response.data.reduce((sum, p) => sum + (p.views || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleProductSuccess = (product) => {
    if (editingProduct) {
      setMyProducts(prev => prev.map(p => p._id === product._id ? product : p));
    } else {
      setMyProducts(prev => [product, ...prev]);
    }
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        setMyProducts(prev => prev.filter(p => p._id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>
        Welcome back, {user?.name}!
      </h1>

      {isSeller ? (
        <>
          {/* Seller Status Alert */}
          {sellerStatus && !sellerStatus.hasProfile && (
            <div className="alert alert-warning" style={{ marginBottom: '2rem' }}>
              <h3>Complete Your Seller Profile</h3>
              <p>To start selling, you need to complete your seller profile with business and banking information.</p>
              <Link to="/seller-profile" className="btn btn-primary">
                Complete Profile
              </Link>
            </div>
          )}

          {sellerStatus && sellerStatus.hasProfile && sellerStatus.status === 'incomplete' && (
            <div className="alert alert-warning" style={{ marginBottom: '2rem' }}>
              <h3>Profile Incomplete</h3>
              <p>Your seller profile is {sellerStatus.completionPercentage}% complete. Please finish setting up your profile.</p>
              <Link to="/seller-profile" className="btn btn-primary">
                Complete Profile
              </Link>
            </div>
          )}

          {sellerStatus && sellerStatus.status === 'pending' && (
            <div className="alert alert-info" style={{ marginBottom: '2rem' }}>
              <h3>Profile Under Review</h3>
              <p>Your seller profile is complete and under review. We'll notify you once it's approved.</p>
              <div style={{ marginTop: '1rem' }}>
                <strong>Completion: {sellerStatus.completionPercentage}%</strong>
              </div>
            </div>
          )}

          {sellerStatus && sellerStatus.status === 'rejected' && (
            <div className="alert alert-danger" style={{ marginBottom: '2rem' }}>
              <h3>Profile Rejected</h3>
              <p>Your seller profile has been rejected. Please review and update your information.</p>
              {sellerStatus.rejectionReason && (
                <p><strong>Reason:</strong> {sellerStatus.rejectionReason}</p>
              )}
              <Link to="/seller-profile" className="btn btn-primary">
                Update Profile
              </Link>
            </div>
          )}

          {sellerStatus && sellerStatus.status === 'approved' && (
            <div className="alert alert-success" style={{ marginBottom: '2rem' }}>
              <h3>✅ Seller Account Approved</h3>
              <p>Congratulations! Your seller account is approved. You can now start listing products.</p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'var(--primary)', fontSize: '2rem' }}>
                {stats.totalProducts}
              </h3>
              <p>Total Products</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'var(--success)', fontSize: '2rem' }}>
                {stats.activeProducts}
              </h3>
              <p>Active Products</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'var(--accent)', fontSize: '2rem' }}>
                {stats.totalViews}
              </h3>
              <p>Total Views</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
              disabled={!sellerStatus?.canSell}
            >
              Add New Product
            </button>
            {!sellerStatus?.canSell && (
              <small style={{ color: 'var(--text-light)', alignSelf: 'center' }}>
                Complete and get your seller profile approved to add products
              </small>
            )}
          </div>

          {/* Product Form */}
          {showForm && (
            <div style={{ marginBottom: '2rem' }}>
              <ProductForm
                product={editingProduct}
                onSuccess={handleProductSuccess}
                onCancel={handleCancel}
              />
            </div>
          )}

          {/* My Products */}
          <div>
            <h2 style={{ marginBottom: '1rem' }}>My Products</h2>
            {myProducts.length > 0 ? (
              <div className="grid grid-3">
                {myProducts.map(product => (
                  <div key={product._id} style={{ position: 'relative' }}>
                    <ProductCard product={product} />
                    <div style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      right: '10px',
                      display: 'flex',
                      gap: '0.5rem'
                    }}>
                      <button
                        onClick={() => handleEdit(product)}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="btn btn-danger"
                        style={{ padding: '0.5rem' }}
                      >
                        Delete
                      </button>
                    </div>
                    <div style={{ 
                      marginTop: '0.5rem', 
                      padding: '0.5rem',
                      background: product.status === 'active' ? 'var(--success)' : 'var(--warning)',
                      color: 'white',
                      textAlign: 'center',
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}>
                      {product.status.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <h3>No products yet</h3>
                <p>Start selling by adding your first product!</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn btn-primary"
                >
                  Add Your First Product
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Customer Dashboard */
        <div>
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>Customer Dashboard</h2>
            <p>Welcome to your customer dashboard! Here you can track your orders and manage your account.</p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => window.location.href = '/products'}>
                Browse Products
              </button>
              <button className="btn btn-secondary">
                View Order History
              </button>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3>Account Information</h3>
            <div className="card">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <strong>Name:</strong> {user?.name}
                </div>
                <div>
                  <strong>Email:</strong> {user?.email}
                </div>
                <div>
                  <strong>Account Type:</strong> {user?.role}
                </div>
                <div>
                  <strong>Member Since:</strong> {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;