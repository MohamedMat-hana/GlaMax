/**
 * App.jsx — Root router setup for Glamax CRS.
 * Routes: / → StorePage, /admin → AdminLoginPage, /admin/dashboard → AdminDashboard
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { LangProvider } from './context/LangContext';
import StorePage        from './pages/StorePage';
import AdminLoginPage   from './pages/AdminLoginPage';
import AdminDashboard   from './pages/AdminDashboard';
import './styles/global.css';

export default function App() {
  return (
    <LangProvider>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                 element={<StorePage />} />
          <Route path="/admin"            element={<AdminLoginPage />} />
          <Route path="/admin/dashboard"  element={<AdminDashboard />} />
          <Route path="*"                 element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
    </LangProvider>
  );
}
