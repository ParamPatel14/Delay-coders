import React, { useEffect, useState } from 'react';
import { useCompanyAuth } from '../context/CompanyAuthContext';
import api from '../api/axios';
import { Leaf, Coins, Clock, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, accent, sub, offset }) => {
  const accentClass = accent || "bg-emerald-400 ring-emerald-500/20";
  return (
    <div className={`bg-slate-900/80 rounded-2xl border border-slate-800 shadow-[0_14px_40px_rgba(15,23,42,0.7)] ${offset || ''}`}>
      <div className="px-5 pt-4 pb-5">
        <div className="flex items-center">
          <div className={`rounded-lg p-3 ring-4 ${accentClass}`}>
            <Icon className="h-5 w-5 text-slate-950" />
          </div>
          <div className="ml-4">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{title}</div>
            <div className="mt-1 text-xl font-semibold text-slate-50">{value}</div>
            {sub && <div className="mt-1.5 text-[11px] text-slate-400">{sub}</div>}
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
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-7 lg:px-9 py-9">
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 px-6 pt-5 pb-6 flex items-center justify-between shadow-[0_18px_45px_rgba(15,23,42,0.7)] mb-7">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Company Dashboard</div>
            <div className="text-2xl font-bold text-slate-50">{company?.email}</div>
            <div className="mt-1 inline-flex items-center px-3 py-1 bg-slate-900/80 rounded-full border border-slate-700 text-[11px] text-emerald-300">
              <Wallet className="h-3.5 w-3.5 mr-2" />
              {company?.wallet_address ? "Wallet Connected" : "Wallet Not Connected"}
            </div>
          </div>
          <button
            onClick={() => navigate('/marketplace')}
            className="px-4 py-2.5 rounded-[20px] bg-emerald-500 text-slate-950 text-sm font-semibold shadow-[0_14px_40px_rgba(16,185,129,0.45)] hover:bg-emerald-400"
          >
            View Marketplace
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="h-28 bg-slate-900 rounded-2xl border border-slate-800"></div>
            <div className="h-28 bg-slate-900 rounded-[20px] border border-slate-800"></div>
            <div className="h-28 bg-slate-900 rounded-2xl border border-slate-800"></div>
          </div>
        ) : (
          <>
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
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900/80 rounded-[20px] shadow-[0_12px_36px_rgba(15,23,42,0.7)] border border-slate-800 px-5 pt-5 pb-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-50">Recent Purchases</h2>
                  <div className="text-[11px] text-slate-400">Showing latest purchases</div>
                </div>
                <div className="divide-y divide-slate-800/80">
                  {(data?.recent_purchases || []).map((p) => (
                    <div key={p.id} className="py-3.5 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-50">Credits: {p.credit_amount}</div>
                        <div className="text-[11px] text-slate-400">
                          Seller: {p.seller_user_id} • Tx: {p.blockchain_tx_hash?.slice(0, 10)}...
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-emerald-300">{nfINR.format(p.total_price)}</div>
                    </div>
                  ))}
                  {(data?.recent_purchases || []).length === 0 && (
                    <div className="py-3 text-sm text-slate-400">No purchases yet.</div>
                  )}
                </div>
              </div>
              <div className="bg-slate-900/80 rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.7)] border border-slate-800 px-5 pt-5 pb-6">
                <h2 className="text-base sm:text-lg font-semibold text-slate-50 mb-3">Offset Details</h2>
                <div className="text-xs sm:text-sm text-slate-400">
                  Based on standard conversion, credits directly offset your organisation&apos;s carbon footprint.
                </div>
                <div className="mt-4">
                  <div className="h-2 bg-slate-800 rounded-full">
                    <div
                      className="h-2 bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, (data?.credits_owned || 0) * 4)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-slate-400">Progress towards next milestone</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
