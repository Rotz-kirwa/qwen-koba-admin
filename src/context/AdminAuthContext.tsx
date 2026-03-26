import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '../lib/api';

interface AdminUser {
  _id: string;
  email: string;
  full_name: string;
  role: string;
  permissions: string[];
}

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((token: string, nextUser: AdminUser) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    persistSession(data.token, data.user);
  }, [persistSession]);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const data = await api.loginWithGoogle(credential);
    persistSession(data.token, data.user);
  }, [persistSession]);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.google?.accounts?.id.disableAutoSelect();
    setUser(null);
  }, []);

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return user.permissions.includes(permission);
  }, [user]);

  return (
    <AdminAuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, hasPermission }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};
