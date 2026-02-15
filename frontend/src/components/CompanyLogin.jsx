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
    <div className="min-h-screen bg-emerald-50 text-slate-900 selection:bg-emerald-200 relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-60 mix-blend-soft-light"
        style={{
          backgroundImage:
            'radial-gradient(circle_at 16% 0, rgba(16,185,129,0.28), transparent 60%), radial-gradient(circle_at 84% 8%, rgba(245,158,11,0.2), transparent 55%), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\' viewBox=\'0 0 160 160\'%3E%3Cfilter id=\'n\' x=\'0\' y=\'0\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'noStitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.3\'/%3E%3C/svg%3E")'
        }}
      />
      <div className="relative flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-7">
          <div className="text-center">
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Merchant Login
            </h2>
            <p className="mt-1 text-xs text-emerald-800">
              Access your merchant carbon credit wallet and marketplace.
            </p>
          </div>
          <form
            className="mt-4 space-y-5 bg-white rounded-2xl border border-emerald-100 px-5 pt-5 pb-6 shadow-sm"
            onSubmit={handleSubmit}
          >
            {error && <div className="text-amber-600 text-center text-sm mb-1">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-700">Merchant Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-emerald-100 bg-white text-slate-900 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="you@merchant.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-emerald-100 bg-white text-slate-900 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-[20px] text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm"
              >
                Sign in
              </button>
            </div>
          </form>
          <div className="text-center space-x-4 text-xs sm:text-sm">
            <Link to="/login" className="text-emerald-700 hover:text-emerald-600">
              Sign in as User
            </Link>
            <Link to="/company/register" className="text-emerald-700 hover:text-emerald-600">
              Register Merchant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyLogin;
