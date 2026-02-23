import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const CATEGORIES = ['Hair', 'Beard', 'Facial', 'Spa', 'Bridal', 'Skin Care'];

export default function Services() {
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const url = filter ? `/api/services?category=${encodeURIComponent(filter)}` : '/api/services?active=true';
    api.get(url).then(res => setServices(res.data));
  }, [filter]);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>Services</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Choose a category and book your appointment. Login required to book.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${!filter ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('')}
        >All</button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`btn ${filter === cat ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(cat)}
          >{cat}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {services.map(s => (
          <div key={s._id} className="card">
            <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>{s.category}</span>
            <h3 style={{ margin: '0.35rem 0', fontSize: '1.2rem' }}>{s.name}</h3>
            {s.description && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{s.description}</p>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
              <span><span className="currency" style={{ fontWeight: 700 }}>{s.price}</span> · {s.duration} min</span>
              <Link to="/login" className="btn btn-primary">Book</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
