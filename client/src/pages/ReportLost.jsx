import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './ReportForm.css';

const CATEGORIES = [
  'ID Card', 'Electronics', 'Wallet', 'Bag', 'Books',
  'Keys', 'Documents', 'Clothing', 'Accessories', 'Other',
];

const ReportLost = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editItem = location.state?.edit;

  const [form, setForm] = useState({
    title: editItem?.title || '',
    category: editItem?.category || '',
    description: editItem?.description || '',
    location: editItem?.location || '',
    date: editItem?.date ? editItem.date.split('T')[0] : '',
    time: editItem?.time || '',
    color: editItem?.color || '',
    additionalDetails: editItem?.additionalDetails || '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(editItem?.image || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be smaller than 5 MB.');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.description || !form.location || !form.date) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val) formData.append(key, val);
      });
      if (image) formData.append('image', image);

      if (editItem) {
        await api.put(`/items/${editItem._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/items/lost', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      navigate('/my-reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div className="report-form-wrap">
          <div className="report-form-header lost-header">
            <div className="report-icon">🔴</div>
            <h1>{editItem ? 'Edit Lost Item Report' : 'Report a Lost Item'}</h1>
            <p>Fill in as many details as possible to help others identify your item.</p>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Item Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  placeholder="e.g. Black Leather Wallet"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category <span className="required">*</span></label>
                <select name="category" className="form-control" value={form.category} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description <span className="required">*</span></label>
                <textarea
                  name="description"
                  className="form-control"
                  placeholder="Describe the item — brand, size, markings, what's inside..."
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Location Lost <span className="required">*</span></label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  placeholder="e.g. KJO University Library"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  name="color"
                  className="form-control"
                  placeholder="e.g. Black, Blue, Red"
                  value={form.color}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Date Lost <span className="required">*</span></label>
                <input
                  type="date"
                  name="date"
                  className="form-control"
                  value={form.date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>Time Lost</label>
                <input
                  type="time"
                  name="time"
                  className="form-control"
                  value={form.time}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Additional Details</label>
                <textarea
                  name="additionalDetails"
                  className="form-control"
                  placeholder="Any other identifying information, reward offer, etc."
                  value={form.additionalDetails}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label>Item Photo</label>
              <div className="image-upload-area">
                {imagePreview ? (
                  <div className="image-preview-wrap">
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => { setImage(null); setImagePreview(null); }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="image-upload-label" htmlFor="image-input">
                    <span>📷</span>
                    <span>Click to upload a photo</span>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>JPEG, PNG, WebP — max 5 MB</span>
                  </label>
                )}
                <input
                  id="image-input"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div className="form-submit-row">
              <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-danger btn-lg" disabled={loading}>
                {loading ? 'Submitting...' : editItem ? 'Update Report' : '🔴 Submit Lost Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportLost;
