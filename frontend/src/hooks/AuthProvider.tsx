import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../lib/api';
import type { User, UserRole } from '../lib/types';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('access_token')));

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return;
    }

    let active = true;

    api.get('/auth/me')
      .then((res) => {
        if (active) {
          setUser(res.data);
        }
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('refresh_token');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
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