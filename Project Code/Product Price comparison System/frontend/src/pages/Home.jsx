import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ShoppingBag, Smartphone, Shirt, Sparkles, UtensilsCrossed, BookOpen, Baby, Dumbbell, Home as HomeIcon } from 'lucide-react';

const POPULAR_SEARCHES = [
  'iPhone 15', 'Samsung Galaxy', 'Nike Shoes', 'Shampoo',
  'Tata Tea', 'Lakme Foundation', 'Protein Powder', 'Jeans',
  'Pressure Cooker', 'Books', 'Baby Diapers', 'Headphones',
];

const CATEGORIES = [
  { name: 'Electronics', icon: Smartphone, color: '#2563eb' },
  { name: 'Groceries', icon: UtensilsCrossed, color: '#16a34a' },
  { name: 'Beauty', icon: Sparkles, color: '#ec4899' },
  { name: 'Fashion', icon: Shirt, color: '#8b5cf6' },
  { name: 'Home & Kitchen', icon: HomeIcon, color: '#f59e0b' },
  { name: 'Health & Sports', icon: Dumbbell, color: '#ef4444' },
  { name: 'Books', icon: BookOpen, color: '#0891b2' },
  { name: 'Baby & Kids', icon: Baby, color: '#f97316' },
];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleTagClick = (tag) => {
    navigate(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div id="home-page">
      {/* Hero — Search First */}
      <section className="hero">
        <h1>Compare Prices. Save Money.</h1>
        <p>Search any product — we'll find the best prices across Amazon, Flipkart, Walmart, Blinkit & more</p>

        <div className="search-container" style={{ maxWidth: 600, margin: '0 auto' }}>
          <form className="search-bar" onSubmit={handleSearch}>
            <Search size={20} style={{ color: '#9ca3af', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search any product... (e.g., shampoo, laptop, tea)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              id="hero-search"
              autoFocus
            />
            <button type="submit" className="btn btn-primary">
              <Search size={16} /> Search
            </button>
          </form>
        </div>

        {/* Popular Searches */}
        <div className="popular-tags">
          {POPULAR_SEARCHES.map((tag) => (
            <span key={tag} className="popular-tag" onClick={() => handleTagClick(tag)}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container" style={{ paddingTop: 32 }}>
        <div className="section-header">
          <h2>Browse by Category</h2>
        </div>
        <div className="categories-grid">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/search?q=${encodeURIComponent(cat.name)}`}
                className="category-card"
              >
                <Icon size={28} style={{ color: cat.color }} />
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="container" style={{ paddingBottom: 48 }}>
        <div className="section-header" style={{ marginTop: 32 }}>
          <h2>How It Works</h2>
        </div>
        <div className="stats-grid">
          {[
            { step: '1', title: 'Search Any Product', desc: 'Type any product name — electronics, groceries, beauty, clothes, anything!' },
            { step: '2', title: 'Compare Prices', desc: 'See real-time prices from Amazon, Flipkart, Walmart, Blinkit & Purplle' },
            { step: '3', title: 'Buy at Best Price', desc: 'Click "Buy Now" to go directly to the store with the lowest price' },
          ].map((item) => (
            <div key={item.step} className="stat-card">
              <div className="stat-icon blue" style={{ fontSize: 20, fontWeight: 800 }}>
                {item.step}
              </div>
              <div className="stat-info">
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
