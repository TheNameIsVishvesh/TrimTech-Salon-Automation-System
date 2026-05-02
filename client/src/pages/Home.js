import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [offers] = useState([
    { title: '20% off on first visit', code: 'WELCOME20' },
    { title: 'Hair + Beard combo ₹499', code: 'COMBO499' }
  ]);

  useEffect(() => {
    api.get('/api/services?active=true').then(res => setServices(res.data.slice(0, 6)));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section style={heroStyle}>
        <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '0.5rem' }}>
            Welcome to <span style={{ color: 'var(--accent)' }}>African Hair Saloon</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '560px', margin: '0 auto 2rem' }}>
            Your smart salon experience. Book appointments, explore services, and look your best.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/services" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              Book Appointment
            </Link>
            {user ? (
              <Link to="/dashboard" className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Offers */}
      <section className="container" style={{ padding: '2rem 1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', fontFamily: 'Playfair Display' }}>Offers & Discounts</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {offers.map((o, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <strong>{o.title}</strong>
              <p style={{ marginTop: '0.5rem', color: 'var(--accent)', fontWeight: 600 }}>Code: {o.code}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured services */}
      <section className="container" style={{ padding: '2rem 1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', fontFamily: 'Playfair Display' }}>Featured Services</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {services.map(s => (
            <div key={s._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>{s.category}</span>
                <span className="currency" style={{ fontWeight: 700 }}>{s.price}</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{s.name}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{s.duration} min</p>
              <Link to="/services" className="btn btn-primary" style={{ marginTop: '0.75rem', width: '100%' }}>
                Book
              </Link>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/services" className="btn btn-outline">View all services</Link>
        </div>
      </section>
    </div>
  );
}

const heroStyle = {
  background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
  borderBottom: '1px solid var(--border)'
};
