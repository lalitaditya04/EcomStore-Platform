import React, { useState } from 'react';
import api from '../utils/api';

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || '',
    stock: product?.stock || '',
    tags: product?.tags?.join(', ') || ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // Append images
      images.forEach(image => {
        data.append('images', image);
      });

      let response;
      if (product) {
        // Update existing product
        response = await api.put(`/products/${product._id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Create new product
        response = await api.post('/products', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      onSuccess(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save product');
    }
    setLoading(false);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label className="form-label">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="form-control"
          rows="4"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Price ($)</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="form-control"
          step="0.01"
          min="0"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Category</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Stock Quantity</label>
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          className="form-control"
          min="0"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Tags (comma separated)</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="form-control"
          placeholder="electronics, gadgets, smartphone"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Images</label>
        <input
          type="file"
          onChange={handleImageChange}
          className="form-control"
          multiple
          accept="image/*"
        />
        <small style={{ color: '#6c757d' }}>
          You can select up to 5 images. Supported formats: JPG, PNG, GIF
        </small>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
