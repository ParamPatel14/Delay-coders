import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/admin/me', { params: { token } })
      .then(res => setAdmin(res.data))
      .catch(() => {
        localStorage.removeItem('admin_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const loginAdmin = async (email, password) => {
    const res = await api.post('/admin/login', { email, password });
    const token = res.data.access_token;
    localStorage.setItem('admin_token', token);
    const me = await api.get('/admin/me', { params: { token } });
    setAdmin(me.data);
    return true;
  };

  const logoutAdmin = () => {
    localStorage.removeItem('admin_token');
    setAdmin(null);
  };

  const value = { admin, loading, loginAdmin, logoutAdmin };
  return (
    <AdminAuthContext.Provider value={value}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};
