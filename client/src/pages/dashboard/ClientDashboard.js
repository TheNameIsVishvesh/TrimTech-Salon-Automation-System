import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import ClientHome from './client/ClientHome';
import BookAppointment from './client/BookAppointment';
import ClientAppointments from './client/ClientAppointments';

export default function ClientDashboard() {
  return (
    <div style={{ padding: '1.5rem' }}>
      <Routes>
        <Route index element={<ClientHome />} />
        <Route path="book" element={<BookAppointment />} />
        <Route path="appointments" element={<ClientAppointments />} />
      </Routes>
    </div>
  );
}
