import { createContext } from 'react';
import type { User, UserRole } from '../lib/types';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  devLogin: (role: UserRole) => Promise<void>;
  register: (email: string, password: string, role: UserRole) => Promise<string>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);