import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMe()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (email, password, name) => {
    const data = await api.register(email, password, name);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const registerTeacher = async (email, password, name) => {
    const data = await api.registerTeacher(email, password, name);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, registerTeacher, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth used outside AuthProvider');
  return ctx;
}
