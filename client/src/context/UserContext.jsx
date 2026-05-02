/**
 * UserContext.jsx — Global user session context.
 * Provides the current user (name + email), admin token, and setters
 * to all components without prop drilling.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { saveUser } from '../api/client';

const UserContext = createContext(null);

/** Hook to consume the user context from any component */
export function useUser() {
  return useContext(UserContext);
}

/**
 * Provider component — wrap around the entire app in main.jsx.
 * @param {{ children: React.ReactNode }} props
 */
export function UserProvider({ children }) {
  const [user,       setUser]       = useState(null);   // { name, email }
  const [adminToken, setAdminToken] = useState(null);   // string | null

  /** Persist user profile to server and update local state */
  const login = useCallback(async ({ name, email }) => {
    await saveUser({ name, email }).catch(() => {});
    setUser({ name, email: email || '' });
  }, []);

  /** Clear user session */
  const logout = useCallback(() => setUser(null), []);

  const isAdmin = Boolean(adminToken);

  return (
    <UserContext.Provider value={{ user, login, logout, adminToken, setAdminToken, isAdmin }}>
      {children}
    </UserContext.Provider>
  );
}
