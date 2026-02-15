import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { BarChart3, Coins, Store, Info, Filter, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Stat = ({ title, value, icon: Icon }) => {
  return (
    <div className="relative rounded-[22px]">
      <div className="absolute -inset-px rounded-[22px] bg-[radial-gradient(circle_at_0_0,rgba(16,185,129,0.55),transparent_55%),radial-gradient(circle_at_120%_0,rgba(56,189,248,0.45),transparent_60%)] opacity-80" />
      <div className="relative bg-[#050505]/90 backdrop-blur-xl rounded-[20px] border border-white/10 px-5 py-4 flex items-center shadow-[0_20px_70px_rgba(16,185,129,0.38)]">
        <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-emerald-500/25">
          <Icon className="h-5 w-5 text-emerald-300" />
        </div>
        <div className="ml-4">
          <div className="text-xs text-slate-400">{title}</div>
          <div className="text-xl font-semibold text-slate-50">{value}</div>
        </div>
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
    <div className="min-h-screen bg-emerald-50 text-slate-900 relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-60 mix-blend-soft-light"
        style={{
          backgroundImage:
            'radial-gradient(circle_at 0% 0%, rgba(16,185,129,0.24), transparent 55%), radial-gradient(circle_at 100% 0%, rgba(56,189,248,0.24), transparent 55%), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\' viewBox=\'0 0 160 160\'%3E%3Cfilter id=\'n\' x=\'0\' y=\'0\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'noStitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.25\'/%3E%3C/svg%3E")',
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-7 lg:px-9 py-9">
        <div className="relative rounded-[28px] p-[1px] bg-[radial-gradient(circle_at_0_0,rgba(190,242,100,0.45),transparent_60%),radial-gradient(circle_at_120%_-10%,rgba(52,211,153,0.42),transparent_60%)] shadow-sm mb-8">
          <div className="bg-white rounded-[26px] border border-emerald-100 px-6 sm:px-8 py-6 sm:py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 backdrop-blur-xl">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">Discover</div>
              <div className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Carbon Credit Marketplace
              </div>
              <div className="mt-2 text-xs sm:text-sm text-emerald-800">
                Browse live carbon credit projects and indicative market pricing.
              </div>
            </div>
            <button
              onClick={() => navigate('/company/login')}
              className="relative px-4 py-2.5 rounded-[9999px] bg-emerald-500 text-white text-sm font-semibold shadow-sm border border-emerald-500 overflow-hidden hover:bg-emerald-600"
            >
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.6),transparent_55%)] opacity-60 mix-blend-screen" />
              <span className="relative text-slate-950">Company Login</span>
            </button>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="h-24 rounded-2xl bg-white border border-emerald-100" />
            <div className="h-24 rounded-2xl bg-white border border-emerald-100" />
            <div className="h-24 rounded-2xl bg-white border border-emerald-100" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Stat title="Available Listings" value={stats?.available_count ?? 0} icon={Store} />
              <Stat title="Credits Available" value={stats?.total_available_credits ?? 0} icon={Coins} />
              <Stat title="Avg Price/Credit (₹)" value={stats?.avg_price_per_credit?.toFixed ? stats.avg_price_per_credit.toFixed(0) : stats?.avg_price_per_credit ?? 0} icon={BarChart3} />
            </div>
            <div className="mt-8 relative rounded-[26px] p-[1px] bg-[radial-gradient(circle_at_0_0,rgba(190,242,100,0.55),transparent_58%),radial-gradient(circle_at_120%_0,rgba(52,211,153,0.45),transparent_60%)] shadow-sm">
              <div className="bg-white rounded-[24px] border border-emerald-100 px-5 pt-5 pb-6 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">Marketplace Listings</h2>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="hidden md:flex items-center text-xs text-emerald-800">
                      <Info className="h-4 w-4 mr-1 text-emerald-300/80" />
                      Login to Company Portal to purchase
                    </div>
                    <div className="flex items-center rounded-[9999px] border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-900">
                      <Filter className="h-4 w-4 mr-2 text-emerald-500" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent outline-none text-xs text-emerald-900"
                      >
                        <option value="recent">Recent</option>
                        <option value="price_asc">Price Low → High</option>
                        <option value="price_desc">Price High → Low</option>
                        <option value="credits_desc">Credits High → Low</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {[...listings]
                    .sort((a, b) => {
                      if (sortBy === 'price_asc') return a.price_per_credit - b.price_per_credit;
                      if (sortBy === 'price_desc') return b.price_per_credit - a.price_per_credit;
                      if (sortBy === 'credits_desc') return b.credit_amount - a.credit_amount;
                      return b.id - a.id;
                    })
                    .map((l) => (
                      <div
                        key={l.id}
                        className="border border-emerald-100 rounded-[20px] p-4 bg-white hover:bg-emerald-50 hover:shadow-sm transition-all backdrop-blur-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-slate-900">Listing #{l.id}</div>
                          <div className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Available
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                          <div className="text-slate-500">Credits</div>
                          <div className="text-slate-900 font-medium">{l.credit_amount}</div>
                          <div className="text-slate-500">Price/Credit</div>
                          <div className="text-slate-900 font-medium">{nfINR.format(l.price_per_credit)}</div>
                          <div className="text-slate-500">Seller</div>
                          <div className="text-slate-900 font-medium">User #{l.seller_user_id}</div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => navigate('/company/login')}
                            className="relative px-3.5 py-2 text-xs sm:text-sm rounded-[9999px] bg-emerald-500 text-white font-semibold flex items-center border border-emerald-500 shadow-sm hover:bg-emerald-600"
                          >
                            <span className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.55),transparent_55%)] opacity-60 mix-blend-screen" />
                            <span className="relative flex items-center">
                              <ArrowUpDown className="h-4 w-4 mr-2" />
                              Purchase via Company
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  {listings.length === 0 && (
                    <div className="text-sm text-emerald-800 col-span-full py-6">No listings available yet.</div>
                  )}
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
