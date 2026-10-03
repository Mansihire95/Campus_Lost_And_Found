import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './MyReports.css';

const MyReports = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('LOST');
  const [actionLoading, setActionLoading] = useState('');

  const fetchItems = async () => {
    try {
      const res = await api.get('/items/my');
      setItems(res.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const filtered = items.filter((i) => i.type === activeTab);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    setActionLoading(id);
    try {
      await api.delete(`/items/${id}`);
      setItems(items.filter((i) => i._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    } finally {
      setActionLoading('');
    }
  };

  const handleResolve = async (id) => {
    if (!window.confirm('Mark this item as resolved?')) return;
    setActionLoading(id);
    try {
      await api.patch(`/items/${id}/resolve`);
      await fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve.');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="spinner-wrap"><div className="spinner" /></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div className="page-header">
          <h1>📋 My Reports</h1>
          <p>Manage all your lost and found item reports.</p>
        </div>

        <div className="my-reports-actions">
          <Link to="/report-lost" className="btn btn-danger btn-sm">+ Report Lost Item</Link>
          <Link to="/report-found" className="btn btn-success btn-sm">+ Report Found Item</Link>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'LOST' ? 'active' : ''}`}
            onClick={() => setActiveTab('LOST')}
          >
            🔴 Lost ({items.filter((i) => i.type === 'LOST').length})
          </button>
          <button
            className={`tab ${activeTab === 'FOUND' ? 'active' : ''}`}
            onClick={() => setActiveTab('FOUND')}
          >
            🟢 Found ({items.filter((i) => i.type === 'FOUND').length})
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{activeTab === 'LOST' ? '🔍' : '📦'}</div>
            <h3>No {activeTab.toLowerCase()} item reports yet</h3>
            <p>
              <Link to={activeTab === 'LOST' ? '/report-lost' : '/report-found'}>
                Report a {activeTab.toLowerCase()} item
              </Link>
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="table-item-name">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="table-thumb"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <span>{item.title}</span>
                      </div>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.location}</td>
                    <td>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td><span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span></td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/items/${item._id}`} className="btn btn-outline btn-sm">View</Link>
                        {item.status === 'ACTIVE' && (
                          <>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => navigate(`/report-${item.type.toLowerCase()}`, { state: { edit: item } })}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleResolve(item._id)}
                              disabled={actionLoading === item._id}
                            >
                              Resolve
                            </button>
                          </>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(item._id)}
                          disabled={actionLoading === item._id}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;
