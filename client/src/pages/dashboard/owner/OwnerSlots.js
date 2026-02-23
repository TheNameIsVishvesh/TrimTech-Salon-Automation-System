import React, { useState, useEffect } from 'react';
import api from '../../../api';

export default function OwnerSlots() {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ startTime: '09:00', endTime: '09:30', label: '', isActive: true });

  useEffect(() => {
    api.get('/api/time-slots').then(res => setSlots(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/time-slots', form);
      setForm({ startTime: '09:00', endTime: '09:30', label: '', isActive: true });
      api.get('/api/time-slots').then(res => setSlots(res.data));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await api.delete('/api/time-slots/' + id);
      api.get('/api/time-slots').then(res => setSlots(res.data));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <>
      <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>Time Slots</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Manage bookable time slots</p>

      <div className="card" style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
        <h3 style={{ marginBottom: '1rem' }}>Add slot</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Start (24h)</label>
              <input value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} placeholder="09:00" />
            </div>
            <div className="form-group">
              <label>End (24h)</label>
              <input value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} placeholder="09:30" />
            </div>
          </div>
          <div className="form-group">
            <label>Label</label>
            <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Morning" />
          </div>
          <button type="submit" className="btn btn-primary">Add</button>
        </form>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {slots.map(s => (
          <div key={s._id} className="card" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{s.startTime}-{s.endTime}</span>
            {s.label && <span style={{ color: 'var(--text-secondary)' }}>({s.label})</span>}
            <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(s._id)}>Delete</button>
          </div>
        ))}
      </div>
    </>
  );
}
