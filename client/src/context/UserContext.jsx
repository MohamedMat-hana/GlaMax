import { createContext, useContext, useState, useCallback } from 'react';
import { saveUser } from '../api/client';

const UserContext = createContext(null);

const USER_KEY  = 'glamax_user';
const TOKEN_KEY = 'glamax_admin_token';

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem(USER_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const [adminToken, setAdminTokenState] = useState(
    () => localStorage.getItem(TOKEN_KEY) || null
  );

  const login = useCallback(async ({ name, email }) => {
    await saveUser({ name, email }).catch(() => {});
    const u = { name, email: email || '' };
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  const setAdminToken = useCallback((token) => {
    setAdminTokenState(token);
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else        localStorage.removeItem(TOKEN_KEY);
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout, adminToken, setAdminToken, isAdmin: Boolean(adminToken) }}>
      {children}
    </UserContext.Provider>
  );
}
