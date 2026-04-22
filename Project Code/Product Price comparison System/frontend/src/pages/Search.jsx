import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ExternalLink, Star, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import api from '../services/api';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [cheapest, setCheapest] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState('price_asc');
  const [filterPlatform, setFilterPlatform] = useState('');
  const inputRef = useRef(null);

  // Search on initial load if query param exists
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, [searchParams.get('q')]);

  async function doSearch(searchQuery) {
    if (!searchQuery || searchQuery.trim().length < 2) return;

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const res = await api.get(`/search/live?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = res.data.data;
      setResults(data.results || []);
      setCheapest(data.cheapest);
      setPlatforms(data.platforms || []);
      setTotalResults(data.totalResults || 0);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to fetch prices. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e?.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  }

  // Sort & filter results
  let displayResults = [...results];

  if (filterPlatform) {
    displayResults = displayResults.filter(r => r.platform === filterPlatform);
  }

  if (sortBy === 'price_asc') {
    displayResults.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    displayResults.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    displayResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  return (
    <div className="container" id="search-page">
      {/* Search Bar */}
      <form className="search-bar" onSubmit={handleSearch} style={{ marginBottom: 24 }}>
        <Search size={20} style={{ color: '#9ca3af', flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search any product... (e.g., shampoo, laptop, tea)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          id="search-input"
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="searching-state">
          <div className="spinner" style={{ marginBottom: 16 }}></div>
          <h2>
            Searching across stores
            <span className="searching-dots"><span>.</span><span>.</span><span>.</span></span>
          </h2>
          <p>Fetching live prices from Amazon, Flipkart, Walmart, Blinkit & Purplle</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="empty-state">
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => doSearch(query)}>Try Again</button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && hasSearched && (
        <>
          {/* Results Header */}
          <div className="results-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
              <div>
                <h2>Results for "{searchParams.get('q')}"</h2>
                <span className="result-count">{totalResults} prices found across {platforms.length} stores</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {/* Sort */}
                <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 160 }}>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                {/* Platform filter */}
                <select className="input" value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} style={{ width: 140 }}>
                  <option value="">All Stores</option>
                  {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Best Price Banner */}
            {cheapest && (
              <div className="cheapest-highlight">
                <span>🏆 Best Price:</span>
                <span className="price">{cheapest.currency || '$'}{cheapest.price?.toLocaleString('en-IN')}</span>
                <span>on <strong>{cheapest.platform}</strong></span>
              </div>
            )}
          </div>

          {/* Store Results */}
          {displayResults.length === 0 ? (
            <div className="empty-state">
              <Search size={48} />
              <h3>No results found</h3>
              <p>Try a different search term or check spelling</p>
            </div>
          ) : (
            displayResults.map((result, idx) => (
              <div key={`${result.platform}-${idx}`} className={`store-result ${result.isCheapest ? 'cheapest' : ''}`}>
                {/* Product Image */}
                {result.image && (
                  <img
                    src={result.image}
                    alt={result.title}
                    className="store-result-image"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}

                {/* Product Info */}
                <div className="store-result-info">
                  <div className="platform">
                    {result.platform}
                    {result.isCheapest && <span className="badge badge-success" style={{ marginLeft: 8 }}>Best Price</span>}
                  </div>
                  <div className="title">{result.title}</div>
                  <div className="seller">{result.seller}</div>
                </div>

                {/* Price */}
                <div className="store-result-price">
                  <div className="price">
                    {result.currency || '₹'}{result.price?.toLocaleString('en-IN')}
                  </div>
                  {result.rating && (
                    <div className="rating">
                      <Star size={12} fill="currentColor" /> {parseFloat(result.rating).toFixed(1)}
                    </div>
                  )}
                </div>

                {/* Buy Now */}
                <div className="store-result-actions">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success btn-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Buy Now <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* Initial State — no search yet */}
      {!loading && !error && !hasSearched && (
        <div className="empty-state">
          <Search size={48} />
          <h3>Search for any product</h3>
          <p>Type a product name above — we'll find live prices from Amazon, Flipkart, Walmart, Blinkit & Purplle</p>
        </div>
      )}
    </div>
  );
}
