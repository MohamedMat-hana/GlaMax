/**
 * AdminApp.jsx — Standalone router for the admin panel (port 5174).
 * Routes: / → AdminLoginPage, /dashboard → AdminDashboard
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLoginPage  from './pages/AdminLoginPage';
import AdminDashboard  from './pages/AdminDashboard';

export default function AdminApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<AdminLoginPage adminBase />} />
        <Route path="/dashboard"  element={<AdminDashboard />} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
