import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public pages
import Home from './pages/Home';
import Services from './pages/Services';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Dashboards
import ClientDashboard from './pages/dashboard/ClientDashboard';
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import Feedback from './pages/Feedback';

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="products" element={<Products />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
      </Route>

      <Route path="/dashboard" element={
        <PrivateRoute><DashboardLayout /></PrivateRoute>
      }>
        <Route path="client/*" element={<PrivateRoute allowedRoles={['client']}><ClientDashboard /></PrivateRoute>} />
        <Route path="employee/*" element={<PrivateRoute allowedRoles={['employee']}><EmployeeDashboard /></PrivateRoute>} />
        <Route path="owner/*" element={<PrivateRoute allowedRoles={['owner']}><OwnerDashboard /></PrivateRoute>} />
        <Route index element={<Navigate to="/dashboard/redirect" replace />} />
      </Route>

      <Route path="/feedback/:appointmentId" element={
        <PrivateRoute allowedRoles={['client']}><Feedback /></PrivateRoute>
      } />

      <Route path="/dashboard/redirect" element={<PrivateRoute><DashboardRedirect /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function DashboardRedirect() {
  const { user } = useAuth();
  const path = user?.role === 'client' ? 'client' : user?.role === 'employee' ? 'employee' : 'owner';
  return <Navigate to={`/dashboard/${path}`} replace />;
}

export default App;
