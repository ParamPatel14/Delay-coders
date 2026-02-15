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
    <div className="min-h-screen bg-emerald-50 text-slate-900 selection:bg-emerald-200 relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-60 mix-blend-soft-light"
        style={{
          backgroundImage:
            'radial-gradient(circle_at 16% 0, rgba(16,185,129,0.28), transparent 60%), radial-gradient(circle_at 84% 8%, rgba(245,158,11,0.2), transparent 55%), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\' viewBox=\'0 0 160 160\'%3E%3Cfilter id=\'n\' x=\'0\' y=\'0\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'noStitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.3\'/%3E%3C/svg%3E")'
        }}
      />
      <div className="relative flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <div className="flex items-center mb-4">
            <div className="rounded-3xl bg-emerald-500/10 p-3 ring-4 ring-emerald-500/20">
              <Building2 className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="ml-3">
              <div className="text-lg font-semibold text-slate-900">Register Merchant</div>
              <div className="text-sm text-emerald-800">Create merchant account</div>
            </div>
          </div>
          {error && <div className="text-amber-600 mb-3 text-sm">{error}</div>}
          {success && <div className="text-emerald-700 mb-3 text-sm">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-700">Merchant Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full border border-emerald-100 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                type="text"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border border-emerald-100 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                type="email"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border border-emerald-100 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                type="password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2 rounded-[20px] bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 shadow-sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create & Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegister;
