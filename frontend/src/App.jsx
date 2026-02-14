import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import CompanyLogin from './components/CompanyLogin';
import CompanyPanel from './components/CompanyPanel';
import CompanyDashboard from './components/CompanyDashboard';
import MarketplacePublic from './components/MarketplacePublic';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import api from './api/axios';

function App() {
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [backendStatus, setBackendStatus] = useState('Checking...');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await api.get('/health');
        setBackendStatus(res.data.status);
      } catch (err) {
        setBackendStatus('Error connecting to backend');
        console.error(err);
      }
    };

    const checkDb = async () => {
      try {
        const res = await api.get('/db-check');
        setDbStatus(res.data.status);
      } catch (err) {
        setDbStatus('Error connecting to DB');
        console.error(err);
      }
    };

    checkBackend();
    checkDb();
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/company/login" element={<CompanyLogin />} />
      <Route path="/company/panel" element={<CompanyPanel />} />
      <Route path="/company/dashboard" element={<CompanyDashboard />} />
      <Route path="/marketplace" element={<MarketplacePublic />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
