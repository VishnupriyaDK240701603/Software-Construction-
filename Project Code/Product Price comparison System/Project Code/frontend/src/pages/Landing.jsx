import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, LogIn, UserPlus, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const POPULAR_SEARCHES = [
  'iPhone 15', 'Samsung Galaxy', 'Nike Shoes', 'Shampoo',
  'Tata Tea', 'Lakme Foundation', 'Protein Powder', 'Jeans',
];

export default function Landing() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSearch = (e) => {
    e?.preventDefault();
    if (isAuthenticated && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  };

  const handleTagClick = (tag) => {
    if (isAuthenticated) {
      navigate(`/search?q=${encodeURIComponent(tag)}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div id="landing-page">
      <section className="hero">
        <h1>Compare Prices. Save Money.</h1>
        <p>Login first to access full price comparison dashboard and search across stores</p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <Link to="/login" className="btn btn-primary btn-lg">
            <LogIn size={18} /> Login
          </Link>
          <Link to="/register" className="btn btn-outline btn-lg">
            <UserPlus size={18} /> Sign Up
          </Link>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Get personalized dashboard, wishlist, price alerts & real-time comparisons
        </p>

        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
          <form className="search-bar" onSubmit={handleSearch}>
            <Search size={20} style={{ color: '#9ca3af', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search products after login..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={!isAuthenticated}
              style={{ opacity: !isAuthenticated ? 0.6 : 1, cursor: !isAuthenticated ? 'not-allowed' : 'text' }}
            />
            <button 
              type="submit" 
              className={`btn ${!isAuthenticated ? 'btn-disabled' : 'btn-primary'}`}
              disabled={!isAuthenticated}
            >
              {!isAuthenticated ? <Lock size={16} /> : <Search size={16} />}
              {isAuthenticated ? 'Search' : 'Login Required'}
            </button>
          </form>
          {!isAuthenticated && (
            <p style={{ textAlign: 'center', marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Login to search and compare prices
            </p>
          )}
        </div>

        <div className="popular-tags" style={{ opacity: isAuthenticated ? 1 : 0.6, pointerEvents: isAuthenticated ? 'auto' : 'none' }}>
          {POPULAR_SEARCHES.map((tag) => (
            <span 
              key={tag} 
              className="popular-tag" 
              onClick={() => handleTagClick(tag)}
              style={{ cursor: isAuthenticated ? 'pointer' : 'not-allowed' }}
              title={!isAuthenticated ? 'Login to search' : ''}
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

