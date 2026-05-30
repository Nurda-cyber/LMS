import { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as api from '../api/client';
import { setToken, onHttpEvent } from '../shared/api/httpClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    api
      .getMe()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const unsubscribe = onHttpEvent((event) => {
      if (event.type === 'unauthorized' && userRef.current) {
        setToken(null);
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (email, password, name) => {
    const data = await api.register(email, password, name);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const registerTeacher = async (email, password, name) => {
    return api.registerTeacher(email, password, name);
  };

  const logout = () => {
    setToken(null);
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
