import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { formatDate } from '../../../utils/format';

function downloadCSV(data, filename) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const header = keys.join(',');
  const rows = data.map(row => keys.map(k => (typeof row[k] === 'object' ? JSON.stringify(row[k]) : row[k])).join(','));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OwnerDatabase() {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    api.get('/api/users').then(res => setUsers(res.data));
    api.get('/api/appointments').then(res => setAppointments(res.data));
    api.get('/api/contact').then(res => setContacts(res.data)).catch(() => setContacts([]));
  }, []);

  const exportUsers = () => {
    const flat = users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      employeeId: u.employeeId
    }));
    downloadCSV(flat, 'trimtech-users.csv');
  };

  const exportAppointments = () => {
    const flat = appointments.map(a => ({
      _id: a._id,
      clientId: a.clientId?._id || a.clientId,
      employeeId: a.employeeId?._id || a.employeeId,
      serviceId: a.serviceId?._id || a.serviceId,
      date: a.date,
      startTime: a.startTime,
      endTime: a.endTime,
      status: a.status,
      totalAmount: a.totalAmount,
      invoiceNumber: a.invoiceNumber
    }));
    downloadCSV(flat, 'trimtech-appointments.csv');
  };

  return (
    <>
      <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>Database Tools</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>View users, appointments, contact messages; export CSV</p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={exportUsers}>Export users CSV</button>
        <button className="btn btn-primary" onClick={exportAppointments}>Export appointments CSV</button>
      </div>

      <h3 style={{ marginBottom: '0.75rem' }}>Users</h3>
      <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Employee ID</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.5rem' }}>{u.name}</td>
                <td style={{ padding: '0.5rem' }}>{u.email}</td>
                <td style={{ padding: '0.5rem' }}>{u.role}</td>
                <td style={{ padding: '0.5rem' }}>{u.employeeId || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginBottom: '0.75rem' }}>Appointments (recent)</h3>
      <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Client</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Employee</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {appointments.slice(0, 20).map(a => (
              <tr key={a._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.5rem' }}>{formatDate(a.date)} {a.startTime}</td>
                <td style={{ padding: '0.5rem' }}>{a.clientId?.name}</td>
                <td style={{ padding: '0.5rem' }}>{a.employeeId?.name}</td>
                <td style={{ padding: '0.5rem' }}>{a.status}</td>
                <td style={{ padding: '0.5rem' }}>{a.invoiceNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginBottom: '0.75rem' }}>Contact form messages</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {contacts.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No messages.</p>}
        {contacts.map(c => (
          <div key={c._id} className="card">
            <strong>{c.name}</strong> · {c.email} · {c.subject || 'No subject'}<br />
            <small style={{ color: 'var(--text-secondary)' }}>{c.message}</small>
          </div>
        ))}
      </div>
    </>
  );
}
