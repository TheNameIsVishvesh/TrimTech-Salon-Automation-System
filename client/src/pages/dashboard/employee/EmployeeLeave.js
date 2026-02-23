import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { formatDate } from '../../../utils/format';

export default function EmployeeLeave() {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });

  useEffect(() => {
    api.get('/api/leaves').then(res => setLeaves(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/leaves', form);
      setForm({ startDate: '', endDate: '', reason: '' });
      api.get('/api/leaves').then(res => setLeaves(res.data));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <>
      <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>Leave</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Apply and view leave requests</p>

      <div className="card" style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
        <h3 style={{ marginBottom: '1rem' }}>Apply leave</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Start date</label>
            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>End date</label>
            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Reason</label>
            <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={2} />
          </div>
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>
      </div>

      <h3 style={{ marginBottom: '0.75rem' }}>My leave requests</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {leaves.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No leave requests.</p>}
        {leaves.map(l => (
          <div key={l._id} className="card">
            {formatDate(l.startDate)} – {formatDate(l.endDate)} · {l.reason || '-'} · <strong>{l.status}</strong>
          </div>
        ))}
      </div>
    </>
  );
}
