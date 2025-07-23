import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const categories = [
    'all', 'electronics', 'clothing', 'books', 'home', 'sports', 'toys', 'beauty', 'automotive'
  ];

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 12
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }

      const response = await api.get(`/products?${params}`);
      setProducts(response.data.products);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages,
        total: response.data.total
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>All Products</h1>
      
      {/* Filters */}
      <div className="filters">
        <form onSubmit={handleSearch} className="filters-row">
          <div className="search-box">
            <label className="form-label">Search Products</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="form-control"
              placeholder="Search by title, description, or tags..."
            />
          </div>
          
          <div className="category-select">
            <label className="form-label">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="form-control"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {/* Results Info */}
      {!loading && (
        <div style={{ marginBottom: '1rem', color: '#6c757d' }}>
          Showing {products.length} of {pagination.total} products
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading products...
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-3">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              marginTop: '2rem' 
            }}>
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              
              {[...Array(pagination.totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`btn ${
                    pagination.currentPage === index + 1 ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No products found</h3>
          <p>Try adjusting your search criteria or browse all categories.</p>
        </div>
      )}
    </div>
  );
};

export default Products;