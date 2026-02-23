import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { formatCurrency } from '../../../utils/format';

export default function OwnerReports() {
  const [dashboard, setDashboard] = useState(null);
  const [demand, setDemand] = useState([]);
  const [peak, setPeak] = useState([]);

  useEffect(() => {
    api.get('/api/reports/dashboard').then(res => setDashboard(res.data));
    api.get('/api/reports/service-demand').then(res => setDemand(res.data));
    api.get('/api/reports/peak-hours').then(res => setPeak(res.data));
  }, []);

  return (
    <>
      <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>Reports and Analytics</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Daily revenue, monthly bookings, top services, staff performance</p>

      {dashboard && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Daily revenue</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(dashboard.dailyRevenue)}</p>
          </div>
          <div className="card">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Monthly bookings</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{dashboard.monthlyBookings}</p>
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: '0.75rem' }}>Service demand analysis</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {demand.map((d, i) => (
          <div key={i} className="card" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{d._id}</span>
            <strong>{d.count}</strong> bookings
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: '0.75rem' }}>Peak hour detection</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {peak.map((p, i) => (
          <div key={i} className="card" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{p._id}</span>
            <strong>{p.count}</strong>
          </div>
        ))}
      </div>

      {dashboard && dashboard.topServices && (
        <>
          <h3 style={{ marginBottom: '0.75rem' }}>Top services</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {dashboard.topServices.map((s, i) => (
              <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{s.name} ({s.category})</span>
                <span>{s.count} - {formatCurrency(s.revenue)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {dashboard && dashboard.staffPerformance && (
        <>
          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Staff performance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {dashboard.staffPerformance.map((s, i) => (
              <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{s.name} ({s.employeeId})</span>
                <span>{s.count} completed - {formatCurrency(s.revenue)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
