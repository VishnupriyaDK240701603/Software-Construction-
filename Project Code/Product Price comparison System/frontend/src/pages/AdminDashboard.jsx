import { useState, useEffect } from 'react';
import { Users, Package, Bell, Heart, TrendingUp, Trash2, Shield, Search } from 'lucide-react';
import api from '../services/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users'),
      ]);
      setAnalytics(analyticsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(userId, role) {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      showToast('User role updated');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  }

  async function deleteUser(userId) {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast('User deleted');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  if (loading) {
    return <div className="loading-container" style={{ minHeight: '60vh' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }} id="admin-dashboard">
      <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: '2rem' }}>
        🧑‍💼 Admin Dashboard
      </h1>

      {/* Stats Cards */}
      {analytics && (
        <div className="stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-icon purple"><Users size={24} /></div>
            <div className="stat-info">
              <h3>{analytics.stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon green"><Package size={24} /></div>
            <div className="stat-info">
              <h3>{analytics.stats.totalProducts}</h3>
              <p>Products</p>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon orange"><Bell size={24} /></div>
            <div className="stat-info">
              <h3>{analytics.stats.totalAlerts}</h3>
              <p>Active Alerts</p>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon blue"><Heart size={24} /></div>
            <div className="stat-info">
              <h3>{analytics.stats.totalWishlist}</h3>
              <p>Wishlist Items</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {['overview', 'users'].map(tab => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'overview' ? 'Overview' : 'Users'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Popular Searches */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Search size={20} /> Popular Searches
            </h3>
            {analytics.popularSearches.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analytics.popularSearches.map((s, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontWeight: 500 }}>{s.query}</span>
                    <span className="badge badge-primary">{s.count} searches</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No search data yet</p>
            )}
          </div>

          {/* Category Distribution */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <TrendingUp size={20} /> Category Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(analytics.categoryDistribution).map(([cat, count]) => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontWeight: 500 }}>{cat}</span>
                  <span className="badge badge-primary">{count} products</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="glass-card" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Users size={20} /> Recent Users
            </h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentUsers.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-primary'}`}>{u.role}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="input"
                      value={u.role}
                      onChange={e => updateRole(u.id, e.target.value)}
                      style={{ padding: '4px 8px', width: 'auto' }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => deleteUser(u.id)} title="Delete user">
                      <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
