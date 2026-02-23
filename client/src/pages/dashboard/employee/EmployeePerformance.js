import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { formatCurrency } from '../../../utils/format';

export default function EmployeePerformance() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.get('/api/appointments').then(res => {
      const completed = res.data.filter(a => a.status === 'completed');
      setAppointments(completed);
    });
  }, []);

  const totalRevenue = appointments.reduce((s, a) => s + (a.totalAmount || 0), 0);

  return (
    <>
      <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>Performance</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Your completed appointments and earnings</p>

      <div className="card" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Completed appointments</p>
        <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{appointments.length}</p>
        <p style={{ color: 'var(--text-secondary)' }}>Total revenue (your services)</p>
        <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatCurrency(totalRevenue)}</p>
      </div>

      <h3 style={{ marginBottom: '0.75rem' }}>Recent completed</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {appointments.slice(0, 10).map(apt => (
          <div key={apt._id} className="card">
            {apt.serviceId?.name} · {new Date(apt.date).toLocaleDateString('en-IN')} · {formatCurrency(apt.totalAmount)}
          </div>
        ))}
      </div>
    </>
  );
}
