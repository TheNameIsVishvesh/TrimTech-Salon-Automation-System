import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationsDropdown from './NotificationsDropdown';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/products', label: 'Products' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' }
  ];

  return (
    <header className="header" style={headerStyle}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.35rem' }}>
          <span style={{ color: 'var(--accent)' }}>Trim</span>Tech
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} style={linkStyle}>{l.label}</Link>
          ))}

          <button
            onClick={toggleTheme}
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <NotificationsDropdown />
              <Link to="/dashboard" className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" style={linkStyle}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
                Register
              </Link>
            </>
          )}
        </nav>

        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', padding: '0.5rem', background: 'transparent', color: 'var(--text-primary)', fontSize: '1.5rem' }}
          aria-label="Menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-nav" style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} style={linkStyle}>{l.label}</Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="btn btn-primary">Dashboard</Link>
              <button onClick={handleLogout} className="btn btn-outline">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn btn-primary">Register</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          .header nav > a, .header nav > .btn { display: none; }
          .header nav .mobile-nav { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

const headerStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  background: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border)',
  padding: '0.75rem 0'
};

const linkStyle = { color: 'var(--text-secondary)', fontWeight: 500 };
