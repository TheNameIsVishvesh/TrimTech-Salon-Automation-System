import React from 'react';
import { Routes, Route } from 'react-router-dom';
import OwnerOverview from './owner/OwnerOverview';
import OwnerServices from './owner/OwnerServices';
import OwnerSlots from './owner/OwnerSlots';
import OwnerStaff from './owner/OwnerStaff';
import OwnerInventory from './owner/OwnerInventory';
import OwnerReports from './owner/OwnerReports';
import OwnerDatabase from './owner/OwnerDatabase';
import OwnerLeaves from './owner/OwnerLeaves';

export default function OwnerDashboard() {
  return (
    <div style={{ padding: '1.5rem' }}>
      <Routes>
        <Route index element={<OwnerOverview />} />
        <Route path="services" element={<OwnerServices />} />
        <Route path="slots" element={<OwnerSlots />} />
        <Route path="staff" element={<OwnerStaff />} />
        <Route path="inventory" element={<OwnerInventory />} />
        <Route path="reports" element={<OwnerReports />} />
        <Route path="database" element={<OwnerDatabase />} />
        <Route path="leaves" element={<OwnerLeaves />} />
      </Routes>
    </div>
  );
}
