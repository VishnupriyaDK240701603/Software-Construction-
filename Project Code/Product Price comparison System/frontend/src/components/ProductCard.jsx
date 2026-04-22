import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/product/${product._id}`)}
      id={`product-card-${product._id}`}
    >
      <div className="product-card-image">
        <img
          src={product.image || 'https://via.placeholder.com/400x200?text=Product'}
          alt={product.name}
          loading="lazy"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Product'; }}
        />
        <div className="product-card-badge">
          <span className="badge badge-primary">{product.category}</span>
        </div>
      </div>
      <div className="product-card-body">
        <div className="product-card-category">{product.brand}</div>
        <h3 className="product-card-title">{product.name}</h3>
        <div className="product-card-footer">
          <span className="product-card-price">
            ${product.basePrice?.toLocaleString() || 'N/A'}
          </span>
          <span className="product-card-rating">
            <Star size={14} fill="currentColor" />
            {product.rating?.toFixed(1) || '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
