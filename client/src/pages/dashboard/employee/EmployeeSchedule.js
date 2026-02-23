import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { formatDate, formatTime12h } from '../../../utils/format';
import { useSocket } from '../../../hooks/useSocket';

export default function EmployeeSchedule() {
  const [appointments, setAppointments] = useState([]);
  const [view, setView] = useState('day'); // day | week
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useSocket('appointment-update', () => fetchAppointments());

  function fetchAppointments() {
    const from = date;
    const to = view === 'week' ? new Date(new Date(date).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : date;
    api.get(`/api/appointments?from=${from}&to=${to}`).then(res => setAppointments(res.data));
  }

  useEffect(() => {
    fetchAppointments();
  }, [date, view]);

  useEffect(() => {
    api.get('/api/auth/me').then(res => setStatus(res.data.status || 'available'));
  }, []);

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await api.patch('/api/auth/me', { status: newStatus });
      setStatus(newStatus);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>My Schedule</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>View and update your assigned appointments</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select value={view} onChange={e => setView(e.target.value)} className="form-group" style={{ width: 'auto', padding: '0.5rem' }}>
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '0.5rem' }} />
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Status:
          {['available', 'busy', 'on_leave'].map(s => (
            <button key={s} className={`btn ${status === s ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '0.85rem' }} disabled={updating} onClick={() => updateStatus(s)}>{s}</button>
          ))}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {appointments.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No appointments in this period.</p>}
        {appointments.map(apt => (
          <div key={apt._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div>
                <strong>{apt.serviceId?.name}</strong> · {formatDate(apt.date)} {formatTime12h(apt.slotStart)}
                <br />
                <small style={{ color: 'var(--text-secondary)' }}>{apt.clientId?.name} · {apt.clientId?.phone} · {apt.status}</small>
              </div>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{apt.status}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
