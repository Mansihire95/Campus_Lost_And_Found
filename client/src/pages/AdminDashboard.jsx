import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './AdminDashboard.css';

const TABS = ['Stats', 'Users', 'Lost Items', 'Found Items', 'Claims'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [claimFilter, setClaimFilter] = useState('');
  const [itemType, setItemType] = useState('LOST');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch { /* */ }
      setLoading(false);
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'Users') fetchUsers();
    else if (activeTab === 'Lost Items' || activeTab === 'Found Items') fetchItems();
    else if (activeTab === 'Claims') fetchClaims();
  }, [activeTab, claimFilter, itemType]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { search: search || undefined } });
      setUsers(res.data.users);
    } catch { /* */ }
    setLoading(false);
  };

  const fetchItems = async () => {
    setLoading(true);
    const type = activeTab === 'Lost Items' ? 'LOST' : 'FOUND';
    try {
      const res = await api.get('/admin/items', { params: { type } });
      setItems(res.data.items);
    } catch { /* */ }
    setLoading(false);
  };

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/claims', { params: { status: claimFilter || undefined } });
      setClaims(res.data.claims);
    } catch { /* */ }
    setLoading(false);
  };

  const handleDeactivate = async (userId, isActive) => {
    if (!window.confirm(`${isActive ? 'Deactivate' : 'Reactivate'} this user?`)) return;
    setActionLoading(userId);
    try {
      await api.patch(`/admin/users/${userId}/deactivate`);
      setUsers(users.map((u) => u._id === userId ? { ...u, isActive: !u.isActive } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed.');
    }
    setActionLoading('');
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this item and all its claims?')) return;
    setActionLoading(itemId);
    try {
      await api.delete(`/admin/items/${itemId}`);
      setItems(items.filter((i) => i._id !== itemId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed.');
    }
    setActionLoading('');
  };

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div className="page-header">
          <h1>⚙️ Admin Dashboard</h1>
          <p>Manage the COMPASS platform — users, reports, and claims.</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {TABS.map((tab) => (
            <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        {/* ─── Stats ─────────────────────────────────────────────── */}
        {activeTab === 'Stats' && (
          loading ? <div className="spinner-wrap"><div className="spinner" /></div> :
          stats && (
            <>
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                <div className="stat-card">
                  <div className="stat-number">{stats.totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: 'var(--danger)' }}>{stats.totalLost}</div>
                  <div className="stat-label">Lost Reports</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: 'var(--success)' }}>{stats.totalFound}</div>
                  <div className="stat-label">Found Reports</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: 'var(--warning)' }}>{stats.pendingClaims}</div>
                  <div className="stat-label">Pending Claims</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: 'var(--success)' }}>{stats.resolvedItems}</div>
                  <div className="stat-label">Resolved Items</div>
                </div>
              </div>

              <div className="admin-quick-links">
                <div className="card card-body">
                  <h3>Quick Actions</h3>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('Users')}>Manage Users</button>
                    <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('Lost Items')}>Review Lost Items</button>
                    <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('Found Items')}>Review Found Items</button>
                    <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('Claims')}>Review Claims</button>
                  </div>
                </div>
              </div>
            </>
          )
        )}

        {/* ─── Users ─────────────────────────────────────────────── */}
        {activeTab === 'Users' && (
          <>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 320 }}
              />
              <button className="btn btn-primary btn-sm" onClick={fetchUsers}>Search</button>
            </div>
            {loading ? <div className="spinner-wrap"><div className="spinner" /></div> :
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>University ID</th>
                      <th>Joined</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                        <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                        <td>{u.universityId}</td>
                        <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          <span className={`badge ${u.isActive ? 'badge-active' : 'badge-rejected'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => handleDeactivate(u._id, u.isActive)}
                            disabled={actionLoading === u._id}
                          >
                            {u.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            }
          </>
        )}

        {/* ─── Items (Lost / Found) ──────────────────────────────── */}
        {(activeTab === 'Lost Items' || activeTab === 'Found Items') && (
          loading ? <div className="spinner-wrap"><div className="spinner" /></div> :
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Reported By</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <Link to={`/items/${item._id}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>{item.title}</Link>
                    </td>
                    <td>{item.category}</td>
                    <td style={{ fontSize: '0.85rem' }}>{item.location}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {item.reportedBy?.name}<br />
                      <span className="text-muted" style={{ fontSize: '0.78rem' }}>{item.reportedBy?.email}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td><span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span></td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteItem(item._id)}
                        disabled={actionLoading === item._id}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No items found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Claims ────────────────────────────────────────────── */}
        {activeTab === 'Claims' && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <select
                className="filter-select"
                value={claimFilter}
                onChange={(e) => setClaimFilter(e.target.value)}
              >
                <option value="">All Claims</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            {loading ? <div className="spinner-wrap"><div className="spinner" /></div> :
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Claimed By</th>
                      <th>Message</th>
                      <th>Submitted</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((claim) => (
                      <tr key={claim._id}>
                        <td>
                          <Link to={`/items/${claim.item?._id}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>
                            {claim.item?.title}
                          </Link>
                          <br />
                          <span className={`badge badge-${claim.item?.type?.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                            {claim.item?.type}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {claim.claimedBy?.name}<br />
                          <span className="text-muted" style={{ fontSize: '0.78rem' }}>{claim.claimedBy?.universityId}</span>
                        </td>
                        <td style={{ fontSize: '0.85rem', maxWidth: '200px' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {claim.message}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          {new Date(claim.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td><span className={`badge badge-${claim.status.toLowerCase()}`}>{claim.status}</span></td>
                      </tr>
                    ))}
                    {claims.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No claims found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            }
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
