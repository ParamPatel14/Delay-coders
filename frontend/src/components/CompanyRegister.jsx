import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyAuth } from '../context/CompanyAuthContext';
import { Building2, UserPlus } from 'lucide-react';

const CompanyRegister = () => {
  const { registerCompany, loginCompany } = useCompanyAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await registerCompany(email, password, name);
      await loginCompany(email, password);
      navigate('/company/panel');
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Company registration failed.';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex items-center mb-4">
          <div className="rounded-xl bg-indigo-600 p-3 ring-4 ring-indigo-100">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <div className="text-lg font-semibold text-gray-900">Register Company</div>
            <div className="text-sm text-gray-500">Create company account</div>
          </div>
        </div>
        {error && <div className="text-red-600 mb-3 text-sm">{error}</div>}
        {success && <div className="text-green-600 mb-3 text-sm">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700">Company Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" type="text" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" type="email" required />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" type="password" required />
          </div>
          <button type="submit" className="w-full flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Create & Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanyRegister;
