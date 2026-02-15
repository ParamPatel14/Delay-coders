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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-900/80 p-6 rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.7)] border border-slate-800">
        <div className="flex items-center mb-4">
          <div className="rounded-3xl bg-emerald-500/10 p-3 ring-4 ring-emerald-500/20">
            <Building2 className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="ml-3">
            <div className="text-lg font-semibold text-slate-50">Register Company</div>
            <div className="text-sm text-slate-400">Create company account</div>
          </div>
        </div>
        {error && <div className="text-amber-300 mb-3 text-sm">{error}</div>}
        {success && <div className="text-emerald-300 mb-3 text-sm">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300">Company Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-slate-700 bg-slate-950/80 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              type="text"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-slate-700 bg-slate-950/80 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              type="email"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-slate-700 bg-slate-950/80 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              type="password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center px-4 py-2 rounded-[20px] bg-emerald-500 text-slate-950 text-sm font-semibold hover:bg-emerald-400"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create & Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanyRegister;
