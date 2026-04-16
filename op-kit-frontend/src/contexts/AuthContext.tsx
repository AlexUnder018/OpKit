import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { AuthResponse } from '@/types';

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const navigate = useNavigate();

  const storeToken = useCallback((t: string) => {
    localStorage.setItem('access_token', t);
    setToken(t);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    storeToken(data.access_token);
  }, [storeToken]);

  const register = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/register', { email, password });
    storeToken(data.access_token);
  }, [storeToken]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setToken(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  // Sync token state if localStorage is cleared externally
  useEffect(() => {
    const stored = localStorage.getItem('access_token');
    if (!stored && token) {
      setToken(null);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
