import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../lib/api';
import type { User, UserRole } from '../lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  devLogin: (role: UserRole) => Promise<void>;
  register: (email: string, password: string, role: UserRole) => Promise<string>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('id_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, id_token, refresh_token } = res.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('id_token', id_token);
    localStorage.setItem('refresh_token', refresh_token);
    const me = await api.get('/auth/me');
    setUser(me.data);
  };

  const devLogin = async (role: UserRole) => {
    const demoEmail = role === 'business'
      ? 'business.demo@example.com'
      : 'influencer.demo@example.com';

    const res = await api.post('/auth/dev-login', {
      email: demoEmail,
      role,
    });

    const { access_token, id_token, refresh_token } = res.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('id_token', id_token);
    localStorage.setItem('refresh_token', refresh_token);

    const me = await api.get('/auth/me');
    setUser(me.data);
  };

  const register = async (email: string, password: string, role: UserRole) => {
    const res = await api.post('/auth/register', { email, password, role });
    return res.data.message;
  };

  const verifyEmail = async (email: string, code: string) => {
    await api.post('/auth/verify-email', { email, code });
  };

  const resendCode = async (email: string) => {
    await api.post('/auth/resend-code', { email });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, devLogin, register, verifyEmail, resendCode, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
