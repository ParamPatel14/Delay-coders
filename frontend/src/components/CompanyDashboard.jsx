import React, { useEffect, useState } from 'react';
import { useCompanyAuth } from '../context/CompanyAuthContext';
import api from '../api/axios';
import { Leaf, Coins, Clock, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, accent, sub }) => {
  const accentClass = accent || "bg-indigo-600 ring-indigo-100";
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <div className="flex items-center">
        <div className={`rounded-xl p-3 ring-4 ${accentClass}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-2xl font-semibold text-gray-900">{value}</div>
          {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-indigo-600 to-green-600 rounded-2xl p-6 text-white flex items-center justify-between mb-8">
          <div>
            <div className="text-sm opacity-80">Welcome</div>
            <div className="text-2xl font-bold">{company?.email}</div>
            <div className="mt-2 inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm">
              <Wallet className="h-4 w-4 mr-2" />
              {company?.wallet_address ? "Wallet Connected" : "Wallet Not Connected"}
            </div>
          </div>
          <button onClick={() => navigate('/marketplace')} className="px-4 py-2 rounded-md bg-white text-indigo-700 font-semibold shadow-sm">
            View Marketplace
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="h-28 bg-gray-200 rounded-xl"></div>
            <div className="h-28 bg-gray-200 rounded-xl"></div>
            <div className="h-28 bg-gray-200 rounded-xl"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Credits Owned" value={`${data?.credits_owned ?? 0}`} icon={Coins} accent="bg-indigo-600 ring-indigo-100" sub="tCO2e credits" />
              <StatCard title="Total Carbon Offset" value={`${data?.total_carbon_offset ?? 0} kg`} icon={Leaf} accent="bg-green-600 ring-green-100" sub="offset based on credits" />
              <StatCard title="Recent Purchases" value={`${(data?.recent_purchases || []).length}`} icon={Clock} accent="bg-amber-600 ring-amber-100" sub="last 5 purchases" />
            </div>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Purchases</h2>
                  <div className="text-sm text-gray-500">Showing latest purchases</div>
                </div>
                <div className="divide-y">
                  {(data?.recent_purchases || []).map((p) => (
                    <div key={p.id} className="py-4 flex items-center justify-between">
                      <div>
                        <div className="text-gray-900 font-semibold">Credits: {p.credit_amount}</div>
                        <div className="text-gray-500 text-sm">Seller: {p.seller_user_id} • Tx: {p.blockchain_tx_hash?.slice(0, 10)}...</div>
                      </div>
                      <div className="text-gray-900 font-semibold">{nfINR.format(p.total_price)}</div>
                    </div>
                  ))}
                  {(data?.recent_purchases || []).length === 0 && (
                    <div className="text-gray-500">No purchases yet.</div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Offset Details</h2>
                <div className="text-sm text-gray-600">Based on standard conversion, credits directly offset carbon footprint.</div>
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-green-600 rounded-full" style={{ width: `${Math.min(100, (data?.credits_owned || 0) * 4)}%` }} />
                  </div>
                  <div className="mt-2 text-sm text-gray-600">Progress towards next milestone</div>
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
