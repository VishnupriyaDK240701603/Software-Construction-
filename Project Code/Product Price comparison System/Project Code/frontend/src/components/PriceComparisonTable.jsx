import { ExternalLink, Check } from 'lucide-react';

export default function PriceComparisonTable({ prices, loading }) {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!prices || prices.length === 0) {
    return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No price data available yet.</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="comparison-table" id="price-comparison-table">
        <thead>
          <tr>
            <th>Platform</th>
            <th>Price</th>
            <th>Seller</th>
            <th>Rating</th>
            <th>Availability</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((p, idx) => (
            <tr key={`${p.platform}-${idx}`} className={p.isCheapest ? 'cheapest-row' : ''}>
              <td>
                <div className="platform-cell">
                  {p.isCheapest && <Check size={16} style={{ color: 'var(--success)' }} />}
                  <span>{p.platform}</span>
                  {p.isCheapest && <span className="badge badge-success">Best Price</span>}
                </div>
              </td>
              <td className={`price-cell ${p.isCheapest ? 'cheapest-price' : ''}`}>
                ₹{p.price?.toLocaleString('en-IN')}
              </td>
              <td>{p.seller || '—'}</td>
              <td>
                {p.rating ? (
                  <span style={{ color: 'var(--secondary)' }}>⭐ {parseFloat(p.rating).toFixed(1)}</span>
                ) : '—'}
              </td>
              <td>
                <span className={`badge ${p.availability === 'In Stock' ? 'badge-success' : 'badge-warning'}`}>
                  {p.availability || 'Unknown'}
                </span>
              </td>
              <td>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={14} /> Visit
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
