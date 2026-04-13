import React, { useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatus('');
      setError('');
      await api.post('/api/auth/forgot-password', { email });
      setStatus('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '400px' }}>
      <div className="card">
        <h2 style={{ fontFamily: 'Playfair Display', marginBottom: '1.5rem', textAlign: 'center' }}>Forgot Password</h2>
        {status && <div className="alert alert-success">{status}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Reset Link</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
          <Link to="/login" style={{ color: 'var(--accent)' }}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
