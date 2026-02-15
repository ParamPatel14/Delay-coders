import React, { useEffect, useState } from 'react';
import { useCompanyAuth } from '../context/CompanyAuthContext';
import api from '../api/axios';
import { Leaf, Coins, Clock, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, accent, sub, offset }) => {
  const accentClass = accent || "bg-emerald-400 ring-emerald-500/20";
  return (
    <div className={`relative ${offset || ''}`}>
      <div className="pointer-events-none absolute -inset-0.5 rounded-[22px] bg-[radial-gradient(circle_at_0_0,rgba(190,242,100,0.55),transparent_55%),radial-gradient(circle_at_100%_0,rgba(52,211,153,0.45),transparent_55%)] opacity-60" />
      <div className="relative bg-white/95 rounded-[20px] border border-emerald-100 shadow-sm">
        <div className="px-5 pt-4 pb-5">
          <div className="flex items-center">
            <div className={`rounded-lg p-3 ring-4 ${accentClass}`}>
              <Icon className="h-5 w-5 text-slate-950" />
            </div>
            <div className="ml-4">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-800">{title}</div>
              <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
              {sub && <div className="mt-1.5 text-[11px] text-emerald-800">{sub}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CompanyDashboard = () => {
  const { company } = useCompanyAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const nfINR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  useEffect(() => {
    const token = localStorage.getItem('company_token');
    if (!token) {
      navigate('/company/login');
      return;
    }
    api.get('/companies/dashboard', { params: { token } })
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (!company) return null;

  return (
    <div className="min-h-screen bg-emerald-50 text-slate-900 selection:bg-emerald-200 relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-60 mix-blend-soft-light"
        style={{
          backgroundImage:
            'radial-gradient(circle_at 15% 0, rgba(16,185,129,0.26), transparent 60%), radial-gradient(circle_at 85% 10%, rgba(245,158,11,0.18), transparent 55%), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\' viewBox=\'0 0 160 160\'%3E%3Cfilter id=\'n\' x=\'0\' y=\'0\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'noStitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.3\'/%3E%3C/svg%3E")'
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-7 lg:px-9 py-9 relative">
        <div className="relative rounded-[30px] p-[1px] bg-[radial-gradient(circle_at_0_0,rgba(190,242,100,0.42),transparent_58%),radial-gradient(circle_at_120%_-10%,rgba(52,211,153,0.34),transparent_60%)] shadow-sm mb-7">
          <div className="bg-white rounded-[28px] border border-emerald-100 px-6 pt-5 pb-6 flex items-center justify-between backdrop-blur-xl">
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">Company Dashboard</div>
              <div className="text-2xl font-extrabold tracking-tight text-slate-900">{company?.email}</div>
              <div className="mt-1 inline-flex items-center px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200 text-[11px] text-emerald-800">
                <Wallet className="h-3.5 w-3.5 mr-2" />
                {company?.wallet_address ? 'Wallet Connected' : 'Wallet Not Connected'}
              </div>
            </div>
            <button
              onClick={() => navigate('/marketplace')}
              className="relative px-4 py-2.5 rounded-[9999px] bg-emerald-500 text-white text-sm font-semibold shadow-sm border border-emerald-500 overflow-hidden hover:bg-emerald-600"
            >
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.6),transparent_55%)] opacity-60 mix-blend-screen" />
              <span className="relative text-slate-950">View Marketplace</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="h-28 bg-white rounded-2xl border border-emerald-100" />
            <div className="h-28 bg-white rounded-[20px] border border-emerald-100" />
            <div className="h-28 bg-white rounded-2xl border border-emerald-100" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Credits Owned"
                value={`${data?.credits_owned ?? 0}`}
                icon={Coins}
                accent="bg-emerald-400 ring-emerald-500/20"
                sub="tCO₂e credits"
              />
              <StatCard
                title="Total Carbon Offset"
                value={`${data?.total_carbon_offset ?? 0} kg`}
                icon={Leaf}
                accent="bg-emerald-300 ring-emerald-500/20"
                sub="Offset based on credits"
                offset="md:-mt-2"
              />
              <StatCard
                title="Recent Purchases"
                value={`${(data?.recent_purchases || []).length}`}
                icon={Clock}
                accent="bg-amber-400 ring-amber-400/20"
                sub="Last 5 purchases"
                offset="md:mt-3"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-[20px] shadow-sm border border-emerald-100 px-5 pt-5 pb-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">Recent Purchases</h2>
                  <div className="text-[11px] text-emerald-800">Showing latest purchases</div>
                </div>
                <div className="divide-y divide-emerald-50">
                  {(data?.recent_purchases || []).map((p) => (
                    <div key={p.id} className="py-3.5 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Credits: {p.credit_amount}</div>
                        <div className="text-[11px] text-emerald-800">
                          Seller: {p.seller_user_id} • Tx: {p.blockchain_tx_hash?.slice(0, 10)}...
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-emerald-700">{nfINR.format(p.total_price)}</div>
                    </div>
                  ))}
                  {(data?.recent_purchases || []).length === 0 && (
                    <div className="py-3 text-sm text-emerald-800">No purchases yet.</div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 px-5 pt-5 pb-6">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">Offset Details</h2>
                <div className="text-xs sm:text-sm text-emerald-800">
                  Based on standard conversion, credits directly offset your organisation&apos;s carbon footprint.
                </div>
                <div className="mt-4">
                  <div className="h-2 bg-emerald-50 rounded-full">
                    <div
                      className="h-2 bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, (data?.credits_owned || 0) * 4)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-emerald-800">Progress towards next milestone</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
