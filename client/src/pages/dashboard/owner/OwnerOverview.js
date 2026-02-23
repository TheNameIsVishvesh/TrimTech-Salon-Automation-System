import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { formatCurrency } from '../../../utils/format';
import { useSocket } from '../../../hooks/useSocket';

export default function OwnerOverview() {
  const [data, setData] = useState(null);

  useSocket('appointment-update', () => fetchReports());

  function fetchReports() {
    api.get('/api/reports/dashboard').then(res => setData(res.data));
  }

  useEffect(() => {
    fetchReports();
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <>
      <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>Owner Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Overview and key metrics</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Today's revenue</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(data.dailyRevenue)}</p>
        </div>
        <div className="card">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Monthly bookings</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.monthlyBookings}</p>
        </div>
      </div>

      <h3 style={{ marginBottom: '0.75rem' }}>Top services</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {data.topServices && data.topServices.slice(0, 5).map((s, i) => (
          <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{s.name} ({s.category})</span>
            <span>{s.count} bookings · {formatCurrency(s.revenue)}</span>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: '0.75rem' }}>Staff performance</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {data.staffPerformance && data.staffPerformance.map((s, i) => (
          <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{s.name} ({s.employeeId})</span>
            <span>{s.count} completed · {formatCurrency(s.revenue)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
