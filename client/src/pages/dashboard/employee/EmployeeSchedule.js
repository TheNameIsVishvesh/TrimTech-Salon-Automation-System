import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { formatDate, formatTime12h } from '../../../utils/format';
import { useSocket } from '../../../hooks/useSocket';

export default function EmployeeSchedule() {
  const [appointments, setAppointments] = useState([]);
  const [view, setView] = useState('day'); // day | week
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [employeeStatus, setEmployeeStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

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
    api.get('/api/auth/me').then(res => setEmployeeStatus(res.data.status || 'available'));
  }, []);

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await api.patch('/api/auth/me', { status: newStatus });
      setEmployeeStatus(newStatus);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const updateAppointmentStatus = async (id, newStatus) => {
    try {
      await api.patch(`/api/appointments/${id}`, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const statusColors = {
    scheduled: '#f39c12',
    confirmed: '#3498db',
    in_progress: '#9b59b6',
    completed: '#2ecc71',
    cancelled: '#e74c3c',
    no_show: '#95a5a6'
  };

  const formatStatus = (s) => s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()).replace('Scheduled', 'Pending');

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
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-group" style={{ width: 'auto', padding: '0.5rem' }}>
          <option value="all">All Statuses</option>
          <option value="scheduled">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          My Status:
          {['available', 'busy', 'on_leave'].map(s => (
            <button key={s} className={`btn ${employeeStatus === s ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '0.85rem' }} disabled={updating} onClick={() => updateStatus(s)}>{s}</button>
          ))}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {appointments.filter(a => filterStatus === 'all' || a.status === filterStatus).length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No appointments in this period.</p>}
        {appointments
          .filter(a => filterStatus === 'all' || a.status === filterStatus)
          .map(apt => (
            <div key={apt._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <strong>{apt.serviceId?.name}</strong> · {formatDate(apt.date)} {formatTime12h(apt.startTime)}
                  <br />
                  <small style={{ color: 'var(--text-secondary)' }}>{apt.clientId?.name} · {apt.clientId?.phone}</small>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{
                    backgroundColor: statusColors[apt.status] || '#ccc',
                    color: '#fff',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}>
                    {formatStatus(apt.status)}
                  </span>
                  <select
                    value={apt.status}
                    onChange={(e) => updateAppointmentStatus(apt._id, e.target.value)}
                    style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  >
                    <option value="scheduled">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
