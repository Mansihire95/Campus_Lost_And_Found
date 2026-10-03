import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const STATUS_LABELS = {
  PENDING: { label: 'Pending Review', color: 'badge-pending' },
  APPROVED: { label: 'Approved ✅', color: 'badge-approved' },
  REJECTED: { label: 'Rejected', color: 'badge-rejected' },
};

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await api.get('/claims/my');
        setClaims(res.data);
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  const filtered = activeTab === 'ALL' ? claims : claims.filter((c) => c.status === activeTab);

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
          <h1>🤝 My Claims</h1>
          <p>Track the status of items you've claimed.</p>
        </div>

        <div className="tabs">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} ({tab === 'ALL' ? claims.length : claims.filter((c) => c.status === tab).length})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤝</div>
            <h3>No claims yet</h3>
            <p>Found an item that might be yours? <Link to="/lost-items">Browse found items</Link> and submit a claim.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((claim) => (
              <div key={claim._id} className="card card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span className={`badge badge-${claim.item?.type?.toLowerCase()}`}>{claim.item?.type}</span>
                    <strong style={{ fontSize: '1rem' }}>{claim.item?.title || '—'}</strong>
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    📂 {claim.item?.category} · 📍 {claim.item?.location}
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: '6px', padding: '0.6rem 0.85rem', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                    <strong>Your message:</strong> {claim.message}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    Submitted: {new Date(claim.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <span className={`badge ${STATUS_LABELS[claim.status]?.color}`}>
                    {STATUS_LABELS[claim.status]?.label}
                  </span>
                  {claim.item?._id && (
                    <Link to={`/items/${claim.item._id}`} className="btn btn-outline btn-sm">
                      View Item →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClaims;
