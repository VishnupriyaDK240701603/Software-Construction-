import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Trash2, BellOff, BellRing } from 'lucide-react';
import api from '../services/api';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchAlerts(); }, []);

  async function fetchAlerts() {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data.data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleAlert(id, isActive) {
    try {
      await api.put(`/alerts/${id}`, { isActive: !isActive });
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, isActive: !isActive } : a));
      showToast(isActive ? 'Alert paused' : 'Alert activated');
    } catch {
      showToast('Failed to update', 'error');
    }
  }

  async function deleteAlert(id) {
    try {
      await api.delete(`/alerts/${id}`);
      setAlerts(prev => prev.filter(a => a._id !== id));
      showToast('Alert deleted');
    } catch {
      showToast('Failed to delete', 'error');
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
    <div className="container list-page" id="alerts-page">
      <h1>🔔 Price Alerts</h1>

      {alerts.length === 0 ? (
        <div className="empty-state">
          <Bell size={64} />
          <h3>No price alerts set</h3>
          <p>Set alerts on products to get notified when prices drop to your target.</p>
          <Link to="/search" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        alerts.map(alert => (
          <div key={alert._id} className={`list-item ${alert.isTriggered ? 'alert-triggered' : ''}`}>
            <Link to={`/product/${alert.product?._id}`} className="list-item-image">
              <img
                src={alert.product?.image || 'https://via.placeholder.com/80'}
                alt={alert.product?.name}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }}
              />
            </Link>
            <div className="list-item-info">
              <h3>
                <Link to={`/product/${alert.product?._id}`} style={{ color: 'var(--text-primary)' }}>
                  {alert.product?.name || 'Unknown Product'}
                </Link>
              </h3>
              <p>
                Target: <strong style={{ color: 'var(--primary)' }}>${alert.targetPrice?.toFixed(2)}</strong>
                {alert.currentCheapest && (
                  <> • Current: <strong style={{ color: alert.isTriggered ? 'var(--success)' : 'var(--text-secondary)' }}>${alert.currentCheapest?.toFixed(2)}</strong></>
                )}
              </p>
              <p style={{ fontSize: 'var(--font-size-xs)' }}>
                Created {new Date(alert.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="list-item-actions">
              {alert.isTriggered && (
                <span className="badge badge-success" style={{ padding: '6px 12px' }}>
                  <BellRing size={14} /> Price Dropped!
                </span>
              )}
              <span className={`badge ${alert.isActive ? 'badge-primary' : 'badge-warning'}`}>
                {alert.isActive ? 'Active' : 'Paused'}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => toggleAlert(alert._id, alert.isActive)} title={alert.isActive ? 'Pause' : 'Activate'}>
                {alert.isActive ? <BellOff size={16} /> : <Bell size={16} />}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => deleteAlert(alert._id)} title="Delete">
                <Trash2 size={16} style={{ color: 'var(--danger)' }} />
              </button>
            </div>
          </div>
        ))
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
