import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Staff from './pages/Staff';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import LabReports from './pages/LabReports';
import BedManagement from './pages/BedManagement';
import Login from './pages/Login';
import AiAssistant from './components/AiAssistant';
import './index.css';

// ─── Coming Soon placeholder ──────────────────────────────────────────────────
const ComingSoon = ({ title }) => (
  <div className="flex-1 ml-64 bg-slate-50 min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="text-6xl mb-4">🚧</div>
      <h2 className="text-2xl font-bold text-slate-700 mb-2">{title}</h2>
      <p className="text-slate-400 text-sm">This page is coming soon.</p>
    </div>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('hms_auth'));

  const handleLogout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_auth');
    setIsAuthenticated(false);
  };

  const authData = JSON.parse(localStorage.getItem('hms_auth') || '{}');
  const role = (authData.role || '').toLowerCase();

  const allowedRoutes = {
    doctor: ['/dashboard', '/patients', '/appointments', '/lab-reports'],
    nurse: ['/dashboard', '/patients', '/inventory', '/lab-reports', '/bed-management'],
    receptionist: ['/dashboard', '/patients', '/appointments', '/bed-management', '/billing'],
    admin: ['/dashboard', '/patients', '/appointments', '/staff', '/billing', '/inventory', '/lab-reports', '/bed-management']
  };

  // Default to admin routes if role is admin or unknown (to prevent complete lockout if role isn't recognized here)
  const userAllowed = allowedRoutes[role] || allowedRoutes.admin;

  const ProtectedRoute = ({ path, element }) => {
    if (userAllowed.includes(path)) {
      return element;
    }
    return <Navigate to="/dashboard" replace />;
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onLogout={handleLogout} />
      <Routes>
        <Route path="/"               element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/patients"       element={<ProtectedRoute path="/patients" element={<Patients />} />} />
        <Route path="/appointments"   element={<ProtectedRoute path="/appointments" element={<Appointments />} />} />
        <Route path="/staff"          element={<ProtectedRoute path="/staff" element={<Staff />} />} />
        <Route path="/billing"        element={<ProtectedRoute path="/billing" element={<Billing />} />} />
        <Route path="/inventory"      element={<ProtectedRoute path="/inventory" element={<Inventory />} />} />
        <Route path="/lab-reports"    element={<ProtectedRoute path="/lab-reports" element={<LabReports />} />} />
        <Route path="/bed-management" element={<ProtectedRoute path="/bed-management" element={<BedManagement />} />} />
        <Route path="*"               element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <AiAssistant />
    </div>
  );
}

export default App;
