/**
 * admin-main.jsx — Entry point for the admin panel (port 5174).
 * Runs completely separate from the client storefront.
 */

import { StrictMode }    from 'react';
import { createRoot }    from 'react-dom/client';
import { LangProvider }  from './context/LangContext';
import { UserProvider }  from './context/UserContext';
import AdminApp          from './AdminApp';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LangProvider>
      <UserProvider>
        <AdminApp />
      </UserProvider>
    </LangProvider>
  </StrictMode>
);
