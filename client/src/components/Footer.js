import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
      padding: '2rem 0',
      marginTop: '3rem',
      color: 'var(--text-secondary)',
      fontSize: '0.9rem'
    }}>
      <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2rem' }}>
        <div>
          <strong style={{ color: 'var(--text-primary)' }}><span style={{ color: 'var(--accent)' }}>African</span> Hair Saloon</strong>
          <p style={{ marginTop: '0.5rem' }}>Salon Automation & Management System</p>
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <Link to="/services" style={{ color: 'var(--text-secondary)' }}>Services</Link>
          <Link to="/products" style={{ color: 'var(--text-secondary)' }}>Products</Link>
          <Link to="/about" style={{ color: 'var(--text-secondary)' }}>About</Link>
          <Link to="/contact" style={{ color: 'var(--text-secondary)' }}>Contact</Link>
        </div>
      </div>
      <div className="container" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        © {new Date().getFullYear()} African Hair Saloon. All rights reserved.
      </div>
    </footer>
  );
}
