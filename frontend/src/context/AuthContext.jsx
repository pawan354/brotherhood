import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('bh_token');
    const savedUser = localStorage.getItem('bh_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('bh_token', data.token);
    localStorage.setItem('bh_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.message;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    localStorage.setItem('bh_token', data.token);
    localStorage.setItem('bh_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.message;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bh_token');
    localStorage.removeItem('bh_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
