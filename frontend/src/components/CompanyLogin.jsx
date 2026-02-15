import React, { useState } from 'react';
import { useCompanyAuth } from '../context/CompanyAuthContext';
import { useNavigate, Link } from 'react-router-dom';

const CompanyLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginCompany } = useCompanyAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await loginCompany(email, password);
      navigate('/company/panel');
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Company login failed.';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-7">
        <div className="text-center">
          <h2 className="mt-2 text-2xl font-semibold text-slate-50">
            Merchant Login
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Access your merchant carbon credit wallet and marketplace.
          </p>
        </div>
        <form className="mt-4 space-y-5 bg-slate-900/80 rounded-2xl border border-slate-800 px-5 pt-5 pb-6 shadow-[0_12px_36px_rgba(15,23,42,0.7)]" onSubmit={handleSubmit}>
          {error && <div className="text-amber-300 text-center text-sm mb-1">{error}</div>}
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-slate-300">Merchant Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-700 bg-slate-950/80 text-slate-100 rounded-lg text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-700 bg-slate-950/80 text-slate-100 rounded-lg text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-[20px] text-sm font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center space-x-4 text-xs sm:text-sm">
          <Link to="/login" className="text-emerald-300 hover:text-emerald-200">
            Sign in as User
          </Link>
          <Link to="/company/register" className="text-emerald-300 hover:text-emerald-200">
            Register Merchant
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompanyLogin;
