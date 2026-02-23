import React, { useState } from 'react';
import api from '../api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/contact', form);
      setSent(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>Contact</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Get in touch with TrimTech. We’d love to hear from you.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '0.75rem' }}>Address</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            123, MG Road, Bangalore, Karnataka 560001
          </p>
          <h3 style={{ marginTop: '1rem', marginBottom: '0.75rem' }}>Phone</h3>
          <p style={{ color: 'var(--text-secondary)' }}>+91 98765 43210</p>
          <h3 style={{ marginTop: '1rem', marginBottom: '0.75rem' }}>Email</h3>
          <p style={{ color: 'var(--text-secondary)' }}>hello@trimtech.com</p>
          <div style={{ marginTop: '1rem', height: '200px', background: 'var(--bg-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Map placeholder (embed Google Map if needed)
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Contact form</h3>
          {sent && <p style={{ color: 'var(--success)', marginBottom: '1rem' }}>Thank you! We will get back to you soon.</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input name="subject" value={form.subject} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea name="message" rows="4" value={form.message} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
