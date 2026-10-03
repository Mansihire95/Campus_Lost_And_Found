import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, claimsRes] = await Promise.all([
          api.get('/items/my'),
          api.get('/claims/my'),
        ]);
        setMyItems(itemsRes.data);
        setMyClaims(claimsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const lostItems = myItems.filter((i) => i.type === 'LOST');
  const foundItems = myItems.filter((i) => i.type === 'FOUND');
  const activeClaims = myClaims.filter((c) => c.status === 'PENDING');
  const resolvedItems = myItems.filter((i) => i.status === 'RESOLVED');

  const recentItems = [...myItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const recentClaims = [...myClaims].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

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
        {/* Welcome */}
        <div className="dashboard-welcome">
          <div>
            <h1>Welcome back, {user.name.split(' ')[0]}! 👋</h1>
            <p className="text-muted">{user.email} · <span className={`badge badge-${user.role.toLowerCase()}`}>{user.role}</span></p>
          </div>
          <div className="dashboard-quick-actions">
            <Link to="/report-lost" className="btn btn-danger btn-sm">+ Report Lost</Link>
            <Link to="/report-found" className="btn btn-success btn-sm">+ Report Found</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{lostItems.length}</div>
            <div className="stat-label">Lost Reports</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{foundItems.length}</div>
            <div className="stat-label">Found Reports</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{activeClaims.length}</div>
            <div className="stat-label">Active Claims</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{resolvedItems.length}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Recent Reports */}
          <div className="card card-body">
            <div className="section-title">
              <h2>Recent Reports</h2>
              <Link to="/my-reports" className="view-all-link">View all →</Link>
            </div>
            {recentItems.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 0' }}>
                <div className="empty-icon">📋</div>
                <p>No reports yet. <Link to="/report-lost">Report a lost item</Link></p>
              </div>
            ) : (
              <div className="activity-list">
                {recentItems.map((item) => (
                  <Link to={`/items/${item._id}`} key={item._id} className="activity-item">
                    <div className="activity-info">
                      <strong>{item.title}</strong>
                      <span className="text-muted">{item.location} · {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="activity-badges">
                      <span className={`badge badge-${item.type.toLowerCase()}`}>{item.type}</span>
                      <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Claims */}
          <div className="card card-body">
            <div className="section-title">
              <h2>Recent Claims</h2>
              <Link to="/my-claims" className="view-all-link">View all →</Link>
            </div>
            {recentClaims.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 0' }}>
                <div className="empty-icon">🤝</div>
                <p>No claims submitted yet.</p>
              </div>
            ) : (
              <div className="activity-list">
                {recentClaims.map((claim) => (
                  <div key={claim._id} className="activity-item">
                    <div className="activity-info">
                      <strong>{claim.item?.title || 'Item'}</strong>
                      <span className="text-muted">{new Date(claim.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <span className={`badge badge-${claim.status.toLowerCase()}`}>{claim.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
