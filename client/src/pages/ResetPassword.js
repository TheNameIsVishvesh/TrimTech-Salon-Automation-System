import React, { useState } from 'react';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      await api.post(`/api/auth/reset-password/${token}`, { password });
      alert('Password reset successful. You can now login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Link may be invalid or expired.');
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '400px' }}>
      <div className="card">
        <h2 style={{ fontFamily: 'Playfair Display', marginBottom: '1.5rem', textAlign: 'center' }}>Reset Password</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Reset Password</button>
        </form>
      </div>
    </div>
  );
}
