import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();

  const base = '/dashboard';
  const role = user?.role || 'client';
  const navItems = role === 'client' ? [
    { to: `${base}/client`, end: true, label: 'Home' },
    { to: `${base}/client/book`, label: 'Book' },
    { to: `${base}/client/appointments`, label: 'Appointments' }
  ] : role === 'employee' ? [
    { to: `${base}/employee`, end: true, label: 'Schedule' },
    { to: `${base}/employee/leave`, label: 'Leave' },
    { to: `${base}/employee/performance`, label: 'Performance' }
  ] : [
    { to: `${base}/owner`, end: true, label: 'Overview' },
    { to: `${base}/owner/services`, label: 'Services' },
    { to: `${base}/owner/slots`, label: 'Time Slots' },
    { to: `${base}/owner/staff`, label: 'Staff' },
    { to: `${base}/owner/inventory`, label: 'Inventory' },
    { to: `${base}/owner/reports`, label: 'Reports' },
    { to: `${base}/owner/database`, label: 'Database' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={asideStyle}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}><span style={{ color: 'var(--accent)' }}>Trim</span>Tech</span>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {user?.name} · {user?.role}
          </p>
        </div>
        <nav style={{ padding: '0.75rem' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: 'block',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                marginBottom: '0.25rem',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: '1rem' }}>
          <button onClick={toggleTheme} className="btn btn-outline" style={{ width: '100%', marginBottom: '0.5rem' }}>
            Theme
          </button>
          <button onClick={() => { logout(); navigate('/'); }} className="btn btn-outline" style={{ width: '100%' }}>
            Logout
          </button>
        </div>
      </aside>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
}

const asideStyle = {
  width: '240px',
  minWidth: '240px',
  background: 'var(--bg-card)',
  borderRight: '1px solid var(--border)',
  display: 'flex',
  flexDirection: 'column'
};
