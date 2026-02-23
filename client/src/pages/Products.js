import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/api/products').then(res => setProducts(res.data));
  }, []);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>Products</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Hair care, Skin care & Grooming products available at the salon.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {products.map(p => (
          <div key={p._id} className="card">
            <div style={{ height: '120px', background: 'var(--bg-primary)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              {p.image ? <img src={p.image} alt={p.name} style={{ maxHeight: '100%', objectFit: 'cover' }} /> : '📦'}
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>{p.category}</span>
            <h3 style={{ margin: '0.35rem 0', fontSize: '1.1rem' }}>{p.name}</h3>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="currency" style={{ textDecoration: 'line-through', color: 'var(--text-secondary)' }}>{p.mrp}</span>
              {p.discount > 0 && (
                <span className="currency" style={{ fontWeight: 700, color: 'var(--success)' }}>{p.mrp - p.discount}</span>
              )}
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Stock: {p.stock}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
