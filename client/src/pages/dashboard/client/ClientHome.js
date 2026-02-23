import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api';
import { formatCurrency, formatDate } from '../../../utils/format';

export default function ClientHome() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.get('/api/appointments').then(res => setAppointments(res.data.slice(0, 5)));
  }, []);

  return (
    <>
      <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>Client Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Book and manage your appointments</p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link to="/dashboard/client/book" className="btn btn-primary">Book Appointment</Link>
        <Link to="/dashboard/client/appointments" className="btn btn-outline">View all appointments</Link>
      </div>

      <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>Recent appointments</h2>
      {appointments.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No appointments yet. <Link to="/dashboard/client/book">Book one</Link>.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {appointments.map(apt => (
            <div key={apt._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <strong>{apt.serviceId?.name}</strong> · {formatDate(apt.date)} {apt.slotStart}
                <br />
                <small style={{ color: 'var(--text-secondary)' }}>with {apt.employeeId?.name} · {apt.status}</small>
              </div>
              <span>{formatCurrency(apt.totalAmount)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
