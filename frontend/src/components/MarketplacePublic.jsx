import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { BarChart3, Coins, Store, Info, Filter, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Stat = ({ title, value, icon: Icon }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 flex items-center">
      <div className="rounded-xl bg-green-600 p-3 ring-4 ring-green-100">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <div className="text-sm text-gray-600">{title}</div>
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
};

const MarketplacePublic = () => {
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const navigate = useNavigate();
  const nfINR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  useEffect(() => {
    const load = async () => {
      const s = await api.get('/marketplace/stats');
      const l = await api.get('/marketplace/listings');
      setStats(s.data);
      setListings(l.data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-green-600 to-indigo-600 rounded-2xl p-6 text-white flex items-center justify-between mb-8">
          <div>
            <div className="text-sm opacity-80">Discover</div>
            <div className="text-2xl font-bold">Carbon Credit Marketplace</div>
            <div className="mt-1 text-sm opacity-80">Browse available credits and prices</div>
          </div>
          <button onClick={() => navigate('/company/login')} className="px-4 py-2 rounded-md bg-white text-green-700 font-semibold shadow-sm">
            Company Login
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Stat title="Available Listings" value={stats?.available_count ?? 0} icon={Store} />
              <Stat title="Credits Available" value={stats?.total_available_credits ?? 0} icon={Coins} />
              <Stat title="Avg Price/Credit" value={stats?.avg_price_per_credit ?? 0} icon={BarChart3} />
            </div>
            <div className="mt-8 bg-white rounded-2xl shadow-sm border">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Listings</h2>
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-500 text-sm hidden md:flex items-center"><Info className="h-4 w-4 mr-1" /> Login to Company Portal to purchase</div>
                    <div className="flex items-center border rounded-md px-3 py-2">
                      <Filter className="h-4 w-4 mr-2 text-gray-500" />
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm text-gray-700 outline-none bg-transparent">
                        <option value="recent">Recent</option>
                        <option value="price_asc">Price Low → High</option>
                        <option value="price_desc">Price High → Low</option>
                        <option value="credits_desc">Credits High → Low</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {[...listings].sort((a, b) => {
                    if (sortBy === 'price_asc') return a.price_per_credit - b.price_per_credit;
                    if (sortBy === 'price_desc') return b.price_per_credit - a.price_per_credit;
                    if (sortBy === 'credits_desc') return b.credit_amount - a.credit_amount;
                    return b.id - a.id;
                  }).map(l => (
                    <div key={l.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="text-gray-900 font-semibold">Listing #{l.id}</div>
                        <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Available</div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="text-gray-600">Credits</div>
                        <div className="text-gray-900 font-medium">{l.credit_amount}</div>
                        <div className="text-gray-600">Price/Credit</div>
                        <div className="text-gray-900 font-medium">{nfINR.format(l.price_per_credit)}</div>
                        <div className="text-gray-600">Seller</div>
                        <div className="text-gray-900 font-medium">{l.seller_user_id}</div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button onClick={() => navigate('/company/login')} className="px-3 py-2 rounded-md bg-indigo-600 text-white flex items-center">
                          <ArrowUpDown className="h-4 w-4 mr-2" />
                          Purchase
                        </button>
                      </div>
                    </div>
                  ))}
                  {listings.length === 0 && <div className="text-gray-500">No listings available.</div>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MarketplacePublic;
