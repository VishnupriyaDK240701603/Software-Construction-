import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bell, RefreshCw, Star, ArrowLeft, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PriceHistoryChart from '../components/PriceHistoryChart';
import api from '../services/api';

export default function ProductDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [prices, setPrices] = useState([]);
  const [historyData, setHistoryData] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [toast, setToast] = useState(null);
  const [alertPrice, setAlertPrice] = useState('');
  const [showAlertForm, setShowAlertForm] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchPrices();
    fetchHistory();
    if (isAuthenticated) checkWishlist();
  }, [id]);

  async function fetchProduct() {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.data);
    } catch { } finally { setLoading(false); }
  }

  async function fetchPrices() {
    setPricesLoading(true);
    try {
      const res = await api.get(`/prices/${id}`);
      setPrices(res.data.data.prices);
    } catch { } finally { setPricesLoading(false); }
  }

  async function fetchHistory() {
    try {
      const res = await api.get(`/prices/${id}/history`);
      setHistoryData(res.data.data.history);
      setPlatforms(res.data.data.platforms);
    } catch { }
  }

  async function checkWishlist() {
    try {
      const res = await api.get(`/wishlist/check/${id}`);
      setInWishlist(res.data.data.inWishlist);
    } catch { }
  }

  async function toggleWishlist() {
    if (!isAuthenticated) { showToast('Login to use wishlist', 'error'); return; }
    try {
      if (inWishlist) {
        await api.delete(`/wishlist/${id}`);
        setInWishlist(false);
        showToast('Removed from wishlist');
      } else {
        await api.post('/wishlist', { productId: id });
        setInWishlist(true);
        showToast('Added to wishlist!');
      }
    } catch (err) { showToast(err.response?.data?.message || 'Failed', 'error'); }
  }

  async function createAlert() {
    if (!alertPrice || parseFloat(alertPrice) <= 0) { showToast('Enter a valid price', 'error'); return; }
    try {
      await api.post('/alerts', { productId: id, targetPrice: parseFloat(alertPrice) });
      showToast('Alert created!');
      setShowAlertForm(false);
      setAlertPrice('');
    } catch (err) { showToast(err.response?.data?.message || 'Failed', 'error'); }
  }

  async function refreshPrices() {
    setPricesLoading(true);
    try {
      const res = await api.post(`/prices/${id}/refresh`);
      setPrices(res.data.data.prices);
      showToast('Prices refreshed!');
    } catch { showToast('Refresh failed', 'error'); }
    finally { setPricesLoading(false); }
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  if (loading) return <div className="loading-container" style={{ minHeight: '60vh' }}><div className="spinner"></div></div>;
  if (!product) return <div className="empty-state" style={{ minHeight: '60vh' }}><h3>Product not found</h3><Link to="/search" className="btn btn-primary">Search Products</Link></div>;

  const cheapest = prices.length > 0 ? prices[0] : null;

  return (
    <div className="container product-detail" id="product-detail-page">
      <button className="btn btn-ghost btn-sm" onClick={() => window.history.back()} style={{ marginBottom: 12 }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Product Info */}
      <div className="product-detail-grid">
        <div className="product-detail-image">
          <img src={product.image || 'https://via.placeholder.com/400'} alt={product.name} onError={(e) => { e.target.src = 'https://via.placeholder.com/400'; }} />
        </div>

        <div className="product-detail-info">
          <span className="badge badge-primary" style={{ marginBottom: 8 }}>{product.category}</span>
          <h1>{product.name}</h1>
          <p className="brand">{product.brand}</p>
          <p className="description">{product.description}</p>

          {cheapest && (
            <div className="best-price">
              <div className="price">₹{cheapest.price?.toLocaleString('en-IN')}</div>
              <div className="platform">Best price on {cheapest.platform}</div>
            </div>
          )}

          <div className="product-detail-actions">
            <button className={`btn ${inWishlist ? 'btn-danger' : 'btn-ghost'}`} onClick={toggleWishlist}>
              {inWishlist ? 'Saved' : 'Add to wishlist'}
            </button>
            {isAuthenticated && (
              <button className="btn btn-ghost" onClick={() => setShowAlertForm(!showAlertForm)}>
                <Bell size={16} /> Price Alert
              </button>
            )}
            <button className="btn btn-ghost" onClick={refreshPrices} title="Refresh prices">
              <RefreshCw size={16} />
            </button>
          </div>

          {showAlertForm && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input className="input" type="number" placeholder="Target price (₹)" value={alertPrice} onChange={e => setAlertPrice(e.target.value)} style={{ width: 180 }} />
              <button className="btn btn-primary btn-sm" onClick={createAlert}>Create</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAlertForm(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>

      {/* Store-by-store Price Comparison */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Price Comparison</h2>
      {pricesLoading ? (
        <div className="loading-container"><div className="spinner"></div></div>
      ) : prices.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 32 }}>No prices available. Click refresh to fetch live prices.</p>
      ) : (
        prices.map((p, idx) => (
          <div key={`${p.platform}-${idx}`} className={`price-store-row ${idx === 0 ? 'best' : ''}`}>
            <div className="store-name">
              {p.platform}
              {idx === 0 && <span className="badge badge-success" style={{ marginLeft: 8, fontSize: 10 }}>Best</span>}
            </div>
            <div className="store-price">₹{p.price?.toLocaleString('en-IN')}</div>
            <div className="store-rating">
              {p.rating ? <><Star size={12} fill="currentColor" /> {parseFloat(p.rating).toFixed(1)}</> : '—'}
            </div>
            <div className="store-availability">
              <span className={`badge ${p.availability === 'In Stock' ? 'badge-success' : 'badge-warning'}`}>
                {p.availability || 'Unknown'}
              </span>
            </div>
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-sm">
              Buy Now <ExternalLink size={12} />
            </a>
          </div>
        ))
      )}

      {/* Price History */}
      <PriceHistoryChart historyData={historyData} platforms={platforms} />

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
