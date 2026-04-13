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
            <div style={{ height: '180px', background: 'var(--bg-primary)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img 
                src={p.imageUrl || `/images/products/${encodeURIComponent(p.name + ' Image.jpg')}`} 
                onError={(e) => { 
                  if (!e.target.dataset.fallback) {
                    e.target.dataset.fallback = 'jpg';
                    // If p.imageUrl failed, try the regular .jpg first
                    e.target.src = `/images/products/${encodeURIComponent(p.name + ' Image.jpg')}`;
                  } else if (e.target.dataset.fallback === 'jpg') {
                    e.target.dataset.fallback = 'png';
                    e.target.src = `/images/products/${encodeURIComponent(p.name + ' Image.png')}`;
                  } else if (e.target.dataset.fallback === 'png') {
                    e.target.dataset.fallback = 'category';
                    e.target.src = `/images/products/${encodeURIComponent(p.category.toLowerCase().replace(' ', '-') + '.jpg')}`;
                  } else if (e.target.dataset.fallback === 'category') {
                    e.target.dataset.fallback = 'default';
                    e.target.src = '/images/default-product.png'; 
                  } else {
                    e.target.onError = null;
                  }
                }}
                alt={p.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
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
