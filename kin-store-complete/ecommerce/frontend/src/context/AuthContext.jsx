// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminView, setAdminView] = useState(false); // Toggle between customer/admin view

  // Fetch current user on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('kin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/auth/me')
      .then(res => {
        setUser(res.data.data.user);
        // Auto-open admin view for admins
        if (['inventory_manager', 'super_admin'].includes(res.data.data.user.role)) {
          setAdminView(localStorage.getItem('kin_admin_view') === 'true');
        }
      })
      .catch(() => {
        localStorage.removeItem('kin_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, data } = res.data;
    localStorage.setItem('kin_token', token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password, phone) => {
    const res = await api.post('/auth/register', { name, email, password, phone });
    const { token, data } = res.data;
    localStorage.setItem('kin_token', token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('kin_token');
    localStorage.removeItem('kin_admin_view');
    setUser(null);
    setAdminView(false);
  }, []);

  const toggleAdminView = useCallback(() => {
    const next = !adminView;
    setAdminView(next);
    localStorage.setItem('kin_admin_view', String(next));
  }, [adminView]);

  const isAdmin = user && ['inventory_manager', 'super_admin'].includes(user.role);
  const isSuperAdmin = user?.role === 'super_admin';
  const canManageProducts = user && ['inventory_manager', 'super_admin'].includes(user.role);

  return (
    <AuthContext.Provider value={{
      user, loading, adminView, isAdmin, isSuperAdmin, canManageProducts,
      login, register, logout, toggleAdminView, setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
