import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" aria-label="Price Hive homepage">
          <span>Price Hive</span>
        </Link>

        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>Dashboard</Link>
          
          {isAuthenticated && (
            <>
              <Link to="/search" className={isActive('/search')} onClick={() => setMenuOpen(false)}>Search</Link>
              <Link to="/wishlist" className={isActive('/wishlist')} onClick={() => setMenuOpen(false)}>Wishlist</Link>
              <Link to="/alerts" className={isActive('/alerts')} onClick={() => setMenuOpen(false)}>Alerts</Link>
            </>
          )}

          {isAdmin && (
            <Link to="/admin" className={isActive('/admin')} onClick={() => setMenuOpen(false)}>Dashboard</Link>
          )}

          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <button onClick={() => { logout(); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" className={`btn btn-ghost btn-sm ${isActive('/login')}`} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
