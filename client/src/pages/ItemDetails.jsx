import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ItemDetails.css';

const PLACEHOLDER = 'https://placehold.co/800x450/e8edf2/aab4be?text=No+Image';

const ClaimModal = ({ itemId, onClose, onSuccess }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please describe why this item belongs to you.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/claims', { itemId, message });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit claim.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>🤝 Claim This Item</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Why do you believe this item belongs to you? <span className="required">*</span></label>
            <textarea
              className="form-control"
              placeholder='e.g. "The wallet contains my college ID and has a small scratch on the back."'
              value={message}
              onChange={(e) => { setMessage(e.target.value); setError(''); }}
              rows={5}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ItemDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [possibleMatches, setPossibleMatches] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const isOwner = user && item && item.reportedBy?._id?.toString() === user._id?.toString();
  const isAdmin = user?.role === 'ADMIN';

  const fetchItem = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/items/${id}`);
      setItem(res.data.item);
      setPossibleMatches(res.data.possibleMatches || []);
    } catch {
      setError('Item not found or has been removed.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClaims = async () => {
    if (!user || (!isOwner && !isAdmin)) return;
    try {
      const res = await api.get(`/claims/item/${id}`);
      setClaims(res.data);
    } catch {
      // Not owner, can't view claims
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  useEffect(() => {
    if (item) fetchClaims();
  }, [item, user]);

  const handleResolve = async () => {
    if (!window.confirm('Mark this item as resolved/recovered?')) return;
    setActionLoading('resolve');
    try {
      await api.patch(`/items/${id}/resolve`);
      await fetchItem();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve item.');
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report? This cannot be undone.')) return;
    setActionLoading('delete');
    try {
      await api.delete(`/items/${id}`);
      navigate('/my-reports');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item.');
    } finally {
      setActionLoading('');
    }
  };

  const handleApproveClaim = async (claimId) => {
    if (!window.confirm('Approve this claim? This will mark the item as resolved.')) return;
    try {
      await api.patch(`/claims/${claimId}/approve`);
      await fetchItem();
      await fetchClaims();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve claim.');
    }
  };

  const handleRejectClaim = async (claimId) => {
    if (!window.confirm('Reject this claim?')) return;
    try {
      await api.patch(`/claims/${claimId}/reject`);
      await fetchClaims();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject claim.');
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

  if (error || !item) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
          <div className="empty-state">
            <div className="empty-icon">❌</div>
            <h3>{error || 'Item not found'}</h3>
            <Link to="/" className="btn btn-primary mt-2">Go Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(item.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <Link to={item.type === 'LOST' ? '/lost-items' : '/found-items'} className="back-link">
          ← Back to {item.type === 'LOST' ? 'Lost' : 'Found'} Items
        </Link>

        <div className="item-detail-grid">
          {/* Left: Image */}
          <div className="item-detail-image-wrap">
            <img
              src={item.image || PLACEHOLDER}
              alt={item.title}
              className="item-detail-image"
              onError={(e) => { e.target.src = PLACEHOLDER; }}
            />
          </div>

          {/* Right: Info */}
          <div className="item-detail-info">
            <div className="item-detail-badges">
              <span className={`badge badge-${item.type.toLowerCase()}`}>{item.type}</span>
              <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span>
              <span className="badge" style={{ background: '#f0f0f0', color: '#555' }}>{item.category}</span>
            </div>

            <h1>{item.title}</h1>

            {item.color && <p className="item-color">🎨 {item.color}</p>}

            <div className="item-detail-section">
              <h3>Description</h3>
              <p>{item.description}</p>
            </div>

            {item.additionalDetails && (
              <div className="item-detail-section">
                <h3>Additional Details</h3>
                <p>{item.additionalDetails}</p>
              </div>
            )}

            <div className="item-detail-meta">
              <div className="meta-item">
                <span className="meta-label">📍 Location</span>
                <span>{item.location}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">📅 Date</span>
                <span>{formattedDate}{item.time ? ` at ${item.time}` : ''}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">👤 Reported by</span>
                <span>
                  {item.reportedBy?.name?.split(' ')[0]}{item.reportedBy?.name?.split(' ')[1] ? ` ${item.reportedBy.name.split(' ')[1][0]}.` : ''}{' '}
                  <span className={`badge badge-${item.reportedBy?.role?.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                    {item.reportedBy?.role}
                  </span>
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">🆔 University ID</span>
                <span>{item.reportedBy?.universityId}</span>
              </div>
            </div>

            {/* Actions */}
            {item.status === 'RESOLVED' ? (
              <div className="resolved-banner">✅ Item Recovered — This item has been resolved</div>
            ) : (
              <div className="item-actions">
                {/* Claim — only logged in, not owner */}
                {user && !isOwner && !claimSuccess && (
                  <button className="btn btn-primary" onClick={() => setShowClaimModal(true)}>
                    🤝 Claim This Item
                  </button>
                )}
                {claimSuccess && (
                  <div className="alert alert-success">✅ Claim submitted! The reporter will review it.</div>
                )}
                {/* Owner actions */}
                {(isOwner || isAdmin) && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={handleResolve}
                      disabled={actionLoading === 'resolve'}
                    >
                      {actionLoading === 'resolve' ? 'Resolving...' : '✅ Mark as Resolved'}
                    </button>
                    <Link to={`/report-${item.type.toLowerCase()}`} state={{ edit: item }} className="btn btn-outline">
                      ✏️ Edit
                    </Link>
                    <button
                      className="btn btn-danger"
                      onClick={handleDelete}
                      disabled={actionLoading === 'delete'}
                    >
                      {actionLoading === 'delete' ? 'Deleting...' : '🗑️ Delete'}
                    </button>
                  </>
                )}
                {!user && (
                  <Link to="/login" className="btn btn-primary">Login to Claim This Item</Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Claims section — for owner/admin */}
        {(isOwner || isAdmin) && claims.length > 0 && (
          <div className="card card-body" style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.1rem' }}>
              📬 Claims for this item ({claims.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {claims.map((claim) => (
                <div key={claim._id} className="claim-card">
                  <div className="claim-info">
                    <strong>{claim.claimedBy?.name}</strong>
                    <span className="text-muted">{claim.claimedBy?.universityId} · {claim.claimedBy?.role}</span>
                    <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>{claim.message}</p>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                      Submitted: {new Date(claim.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="claim-actions">
                    <span className={`badge badge-${claim.status.toLowerCase()}`}>{claim.status}</span>
                    {claim.status === 'PENDING' && item.status === 'ACTIVE' && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => handleApproveClaim(claim._id)}>Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleRejectClaim(claim._id)}>Reject</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Possible Matches */}
        {possibleMatches.length > 0 && (
          <div className="possible-matches">
            <h2>🔁 Possible Matches</h2>
            <p className="text-muted">These {item.type === 'LOST' ? 'found' : 'lost'} items might be related:</p>
            <div className="matches-grid">
              {possibleMatches.map((match) => (
                <Link to={`/items/${match._id}`} key={match._id} className="match-card card card-body">
                  <span className={`badge badge-${match.type.toLowerCase()}`}>{match.type}</span>
                  <strong>{match.title}</strong>
                  <span className="text-muted">📂 {match.category} · 📍 {match.location}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {showClaimModal && (
        <ClaimModal
          itemId={item._id}
          onClose={() => setShowClaimModal(false)}
          onSuccess={() => {
            setShowClaimModal(false);
            setClaimSuccess(true);
          }}
        />
      )}
    </div>
  );
};

export default ItemDetails;
