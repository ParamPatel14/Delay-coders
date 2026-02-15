import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const CompanyAuthContext = createContext();

export const useCompanyAuth = () => useContext(CompanyAuthContext);

export const CompanyAuthProvider = ({ children }) => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('company_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/companies/me', { params: { token } })
      .then(res => setCompany(res.data))
      .catch(() => {
        localStorage.removeItem('company_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const loginCompany = async (email, password) => {
    const res = await api.post('/companies/login', { email, password });
    const token = res.data.access_token;
    localStorage.setItem('company_token', token);
    const me = await api.get('/companies/me', { params: { token } });
    setCompany(me.data);
    return true;
  };

  const logoutCompany = () => {
    localStorage.removeItem('company_token');
    setCompany(null);
  };

  const registerCompany = async (email, password, name) => {
    const res = await api.post('/companies/register', { email, password, name });
    return res.data;
  };
  const connectWallet = async (wallet_address) => {
    const token = localStorage.getItem('company_token');
    const res = await api.post('/companies/connect-wallet', { wallet_address }, { params: { token } });
    const me = await api.get('/companies/me', { params: { token } });
    setCompany(me.data);
    return res.data;
  };

  const value = { company, loading, loginCompany, logoutCompany, connectWallet, registerCompany };
  return (
    <CompanyAuthContext.Provider value={value}>
      {!loading && children}
    </CompanyAuthContext.Provider>
  );
};
