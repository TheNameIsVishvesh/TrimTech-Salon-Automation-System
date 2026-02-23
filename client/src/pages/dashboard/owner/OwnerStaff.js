import React, { useState, useEffect } from 'react';
import api from '../../../api';

export default function OwnerStaff() {
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: 'emp123', phone: '', employeeId: '', assignedServiceIds: [] });

  useEffect(() => {
    api.get('/api/users?role=employee').then(res => setEmployees(res.data));
    api.get('/api/services').then(res => setServices(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/users/employees', {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        employeeId: form.employeeId || undefined,
        assignedServiceIds: form.assignedServiceIds
      });
      setForm({ name: '', email: '', password: 'emp123', phone: '', employeeId: '', assignedServiceIds: [] });
      api.get('/api/users?role=employee').then(res => setEmployees(res.data));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const toggleService = (id) => {
    setForm(f => ({
      ...f,
      assignedServiceIds: f.assignedServiceIds.includes(id)
        ? f.assignedServiceIds.filter(x => x !== id)
        : [...f.assignedServiceIds, id]
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this employee?')) return;
    try {
      await api.delete(`/api/users/${id}`);
      api.get('/api/users?role=employee').then(res => setEmployees(res.data));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <>
      <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>Staff Management</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Add employees, unique IDs & assign services</p>

      <div className="card" style={{ marginBottom: '1.5rem', maxWidth: '480px' }}>
        <h3 style={{ marginBottom: '1rem' }}>Add employee</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Employee ID (optional, auto-generated if empty)</label>
            <input value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} placeholder="EMP001" />
          </div>
          <div className="form-group">
            <label>Assign services</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {services.map(s => (
                <label key={s._id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.assignedServiceIds.includes(s._id)} onChange={() => toggleService(s._id)} />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Add employee</button>
        </form>
      </div>

      <h3 style={{ marginBottom: '0.75rem' }}>Employees</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {employees.map(emp => (
          <div key={emp._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <strong>{emp.name}</strong> · {emp.employeeId} · {emp.email}
              <br />
              <small style={{ color: 'var(--text-secondary)' }}>Services: {emp.assignedServiceIds?.map(s => s.name).join(', ') || 'None'}</small>
            </div>
            <button className="btn btn-outline" style={{ color: 'var(--error)', fontSize: '0.85rem' }} onClick={() => handleDelete(emp._id)}>Remove</button>
          </div>
        ))}
      </div>
    </>
  );
}
