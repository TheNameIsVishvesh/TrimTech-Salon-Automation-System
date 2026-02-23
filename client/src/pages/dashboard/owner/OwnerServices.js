import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { formatCurrency } from '../../../utils/format';

const CATEGORIES = ['Hair', 'Beard', 'Facial', 'Spa', 'Bridal', 'Skin Care'];

export default function OwnerServices() {
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Hair', duration: 30, price: 0, description: '', isActive: true });

  useEffect(() => {
    api.get('/api/services').then(res => setServices(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.patch(`/api/services/${editing._id}`, form);
      } else {
        await api.post('/api/services', form);
      }
      setEditing(null);
      setForm({ name: '', category: 'Hair', duration: 30, price: 0, description: '', isActive: true });
      api.get('/api/services').then(res => setServices(res.data));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await api.delete(`/api/services/${id}`);
      api.get('/api/services').then(res => setServices(res.data));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <>
      <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>Manage Services</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Add, edit pricing (₹) and categories</p>

      <div className="card" style={{ marginBottom: '1.5rem', maxWidth: '480px' }}>
        <h3 style={{ marginBottom: '1rem' }}>{editing ? 'Edit service' : 'Add service'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Duration (min)</label>
              <input type="number" min={5} value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Price (₹)</label>
              <input type="number" min={0} value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          {editing && (
            <div className="form-group">
              <label><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
            </div>
          )}
          <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'}</button>
          {editing && <button type="button" className="btn btn-outline" style={{ marginLeft: '0.5rem' }} onClick={() => { setEditing(null); setForm({ name: '', category: 'Hair', duration: 30, price: 0, description: '', isActive: true }); }}>Cancel</button>}
        </form>
      </div>

      <h3 style={{ marginBottom: '0.75rem' }}>All services</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {services.map(s => (
          <div key={s._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <strong>{s.name}</strong> · {s.category} · {s.duration} min · {formatCurrency(s.price)}
            </div>
            <div>
              <button className="btn btn-outline" style={{ fontSize: '0.85rem', marginRight: '0.5rem' }} onClick={() => { setEditing(s); setForm({ name: s.name, category: s.category, duration: s.duration, price: s.price, description: s.description || '', isActive: s.isActive !== false }); }}>Edit</button>
              <button className="btn btn-outline" style={{ fontSize: '0.85rem', color: 'var(--error)' }} onClick={() => handleDelete(s._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
