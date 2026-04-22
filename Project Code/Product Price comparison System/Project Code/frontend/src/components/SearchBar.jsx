import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../services/api';

export default function SearchBar({ large = false }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Close suggestions on click outside
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    // Debounce autocomplete
    clearTimeout(timeoutRef.current);
    if (val.length >= 2) {
      timeoutRef.current = setTimeout(async () => {
        try {
          const res = await api.get(`/products/autocomplete?q=${encodeURIComponent(val)}`);
          setSuggestions(res.data.data);
          setShowSuggestions(true);
        } catch {
          setSuggestions([]);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false);
    navigate(`/product/${suggestion.id}`);
  };

  return (
    <div className="search-container" ref={containerRef}>
      <form className="search-bar" onSubmit={handleSearch}>
        <Search size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search products, brands, categories..."
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          id="search-input"
        />
        <button type="submit" className="btn btn-primary" id="search-button">
          Search
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map(s => (
            <div
              key={s.id}
              className="search-suggestion-item"
              onClick={() => handleSuggestionClick(s)}
            >
              <img
                src={s.image || 'https://via.placeholder.com/40'}
                alt={s.name}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
              />
              <div className="search-suggestion-info">
                <h4>{s.name}</h4>
                <span>{s.brand} • {s.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
