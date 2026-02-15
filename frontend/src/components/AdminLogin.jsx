import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Shield, LogIn } from 'lucide-react';

const AdminLogin = () => {
  const { loginAdmin } = useAdminAuth();
  const [email, setEmail] = useState('parampraman59@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await loginAdmin(email, password);
      navigate('/admin/panel');
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex items-center mb-4">
          <div className="rounded-xl bg-indigo-600 p-3 ring-4 ring-indigo-100">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <div className="text-lg font-semibold text-gray-900">Admin Portal</div>
            <div className="text-sm text-gray-500">Sign in to manage system</div>
          </div>
        </div>
        {error && <div className="text-red-600 mb-3 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" type="email" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" type="password" />
          </div>
          <button type="submit" className="w-full flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
