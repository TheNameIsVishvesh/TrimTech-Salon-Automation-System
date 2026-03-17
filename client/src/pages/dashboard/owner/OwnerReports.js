import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api';
import { formatCurrency } from '../../../utils/format';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSocket } from '../../../hooks/useSocket';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A3'];

export default function OwnerAnalytics() {
  const [filter, setFilter] = useState('monthly'); // today, weekly, monthly
  const [revenueData, setRevenueData] = useState({ daily: [], monthly: [], serviceWise: [] });
  const [performanceData, setPerformanceData] = useState([]);
  const [noShowData, setNoShowData] = useState({ totalBookings: 0, totalNoShows: 0, noShowRate: 0, frequentNoShows: [] });

  const fetchData = useCallback(async () => {
    try {
      const revRes = await api.get(`/api/analytics/revenue?filter=${filter}`);
      setRevenueData(revRes.data);

      const perfRes = await api.get('/api/analytics/employee-performance');
      setPerformanceData(perfRes.data);

      const nsRes = await api.get('/api/analytics/no-shows');
      setNoShowData(nsRes.data);
    } catch (err) {
      console.error(err);
    }
  }, [filter]);

  useSocket('appointment-update', fetchData);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>Advanced Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Revenue, performance, and client attendance insights</p>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="form-control" style={{ width: 'auto' }}>
          <option value="today">Today</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Revenue Charts */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Revenue Trends ({filter})</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              {filter === 'daily' || filter === 'weekly' ? (
                <LineChart data={revenueData.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} name="Revenue" />
                </LineChart>
              ) : (
                <BarChart data={revenueData.monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Service-Wise Revenue</h3>
          <div style={{ height: 300 }}>
            {revenueData.serviceWise?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueData.serviceWise}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="revenue"
                    nameKey="service"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {revenueData.serviceWise.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                No revenue data for this period
              </div>
            )}
          </div>
        </div>
      </div>

      <h2 style={{ fontFamily: 'Playfair Display', marginBottom: '1rem' }}>Employee Performance</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {performanceData.map((emp, i) => (
          <div key={emp._id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            {i === 0 && <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--primary)', color: '#fff', padding: '0.2rem 0.5rem', fontSize: '0.8rem', borderBottomLeftRadius: '4px' }}>Top Performer</span>}
            <h3 style={{ marginBottom: '1rem' }}>{emp.name}</h3>
            <p><strong>Total Bookings:</strong> {emp.totalBookings}</p>
            <p><strong>Revenue:</strong> {formatCurrency(emp.totalRevenue)}</p>
            <p><strong>Avg Service Time:</strong> {emp.avgServiceTime} mins</p>
            <p><strong>Completion Rate:</strong> {emp.completionRate}%</p>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: 'Playfair Display', marginBottom: '1rem' }}>No-Show Tracking</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ borderColor: 'var(--error)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--error)' }}>No-Show Rate</h3>
          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <span style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--error)' }}>{noShowData.noShowRate}%</span>
            <p style={{ color: 'var(--text-secondary)' }}>({noShowData.totalNoShows} / {noShowData.totalBookings} Bookings)</p>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Frequent No-Shows</h3>
          {noShowData.frequentNoShows.length === 0 ? (
            <p>No clients flagged for frequent no-shows.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>Client Name</th>
                  <th>Phone</th>
                  <th>No-Shows</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {noShowData.frequentNoShows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.5rem' }}>{row.client?.name || 'Unknown'}</td>
                    <td>{row.client?.phone}</td>
                    <td><strong>{row.noShowCount}</strong> times</td>
                    <td>
                      <button className="btn btn-outline" style={{ fontSize: '0.8rem', color: 'var(--error)', borderColor: 'var(--error)' }}>Flag Client</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
