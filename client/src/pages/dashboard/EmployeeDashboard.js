import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EmployeeSchedule from './employee/EmployeeSchedule';
import EmployeeLeave from './employee/EmployeeLeave';
import EmployeePerformance from './employee/EmployeePerformance';

export default function EmployeeDashboard() {
  return (
    <div style={{ padding: '1.5rem' }}>
      <Routes>
        <Route index element={<EmployeeSchedule />} />
        <Route path="leave" element={<EmployeeLeave />} />
        <Route path="performance" element={<EmployeePerformance />} />
      </Routes>
    </div>
  );
}
