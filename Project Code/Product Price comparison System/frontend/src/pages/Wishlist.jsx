import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trash2, ExternalLink } from 'lucide-react';
import api from '../services/api';

export default function Wishlist() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchWishlist(); }, []);

  if (authLoading) {
    return <div className="loading-container" style={{ minHeight: '60vh' }}><div className="spinner"></div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  async function fetchWishlist() {
    try {
      const res = await api.get('/wishlist');
      setItems(res.data.data);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(productId) {
    try {
      await api.delete(`/wishlist/${productId}`);
      setItems(prev => prev.filter(i => i.product._id !== productId));
      showToast('Removed from wishlist');
    } catch {
      showToast('Failed to remove', 'error');
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
    <div className="container list-page" id="wishlist-page">
      <h1>My Wishlist</h1>

      {items.length === 0 ? (
        <div className="empty-state">
          <Heart size={64} />
          <h3>Your wishlist is empty</h3>
          <p>Save products you're interested in and track their prices over time.</p>
          <Link to="/search" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        items.map(item => (
          <div key={item._id} className="list-item">
            <Link to={`/product/${item.product._id}`} className="list-item-image">
              <img
                src={item.product.image || 'https://via.placeholder.com/80'}
                alt={item.product.name}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }}
              />
            </Link>
            <div className="list-item-info">
              <h3><Link to={`/product/${item.product._id}`} style={{ color: 'var(--text-primary)' }}>{item.product.name}</Link></h3>
              <p>{item.product.brand} • {item.product.category}</p>
              <p style={{ fontSize: 'var(--font-size-xs)' }}>Added {new Date(item.addedAt).toLocaleDateString()}</p>
            </div>
            <div className="list-item-actions">
              {item.cheapestPrice && (
                <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: 'var(--font-size-lg)' }}>
                  ${item.cheapestPrice.price?.toFixed(2)}
                </span>
              )}
              <Link to={`/product/${item.product._id}`} className="btn btn-primary btn-sm">
                <ExternalLink size={14} /> Compare
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={() => removeItem(item.product._id)} title="Remove">
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
