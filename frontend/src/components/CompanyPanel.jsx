import React, { useEffect, useState } from 'react';
import { useCompanyAuth } from '../context/CompanyAuthContext';
import api from '../api/axios';
import { Building2, Wallet, ShoppingCart, PlugZap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompanyPanel = () => {
  const { company, logoutCompany, connectWallet } = useCompanyAuth();
  const [wallet, setWallet] = useState('');
  const [connectError, setConnectError] = useState('');
  const [connectSuccess, setConnectSuccess] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('company_token');
    if (!token) {
      navigate('/company/login');
      return;
    }
    api.get('/marketplace/listings')
      .then(res => setListings(res.data))
      .finally(() => setLoading(false));
  }, [navigate]);

  const isValidAddress = (addr) => {
    if (!addr || typeof addr !== 'string') return false;
    if (!addr.startsWith('0x') || addr.length !== 42) return false;
    try { BigInt(addr); return true; } catch { return false; }
  };

  const handleConnect = async () => {
    setConnectError('');
    setConnectSuccess('');
    if (!isValidAddress(wallet)) {
      setConnectError('Enter a valid EVM address (0x + 40 hex chars).');
      return;
    }
    try {
      await connectWallet(wallet);
      setConnectSuccess('Wallet connected successfully.');
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to connect wallet.';
      setConnectError(msg);
    }
  };

  const connectWithMetaMask = async () => {
    setConnectError('');
    setConnectSuccess('');
    try {
      if (!window.ethereum) {
        setConnectError('MetaMask not detected. Install or use manual address.');
        return;
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts[0]) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x13882' }] // Polygon Amoy
          });
        } catch (switchError) {
          if (switchError && switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x13882',
                  chainName: 'Polygon Amoy',
                  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                  rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                  blockExplorerUrls: ['https://www.okx.com/web3/explorer/polygon']
                }]
              });
            } catch (addErr) {
              // ignore add chain error
            }
          }
        }
        setWallet(accounts[0]);
        try {
          await connectWallet(accounts[0]);
          setConnectSuccess('Wallet connected via MetaMask.');
        } catch (err) {
          const msg = err?.response?.data?.detail || 'Failed to connect wallet.';
          setConnectError(msg);
        }
      }
    } catch (e) {
      setConnectError('MetaMask connection was cancelled or failed.');
    }
  };

  const purchase = async (listing) => {
    const token = localStorage.getItem('company_token');
    const keyRes = await api.get('/payments/key');
    const orderRes = await api.post('/marketplace/company-order', { listing_id: listing.id, credit_amount: listing.credit_amount }, { params: { token } });
    const ok = await loadRazorpayScript();
    if (!ok) return;
    const options = {
      key: keyRes.data.key,
      amount: orderRes.data.amount,
      currency: orderRes.data.currency,
      name: 'Carbon Credit Purchase',
      description: `Order #${orderRes.data.marketplace_order_id}`,
      order_id: orderRes.data.razorpay_order_id,
      handler: async function (response) {
        const verify = await api.post('/marketplace/company-verify', {
          marketplace_order_id: orderRes.data.marketplace_order_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        }, { params: { token } });
        const res = await api.get('/marketplace/listings');
        setListings(res.data);
      }
    };
    const rz = new window.Razorpay(options);
    rz.open();
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  if (!company) return null;

  return (
    <div className="min-h-screen bg-[#030303] text-slate-50 selection:bg-emerald-500/30 relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-60 mix-blend-soft-light"
        style={{
          backgroundImage:
            'radial-gradient(circle_at 18% 0, rgba(16,185,129,0.26), transparent 60%), radial-gradient(circle_at 82% 8%, rgba(245,158,11,0.18), transparent 55%), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\' viewBox=\'0 0 160 160\'%3E%3Cfilter id=\'n\' x=\'0\' y=\'0\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'noStitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.3\'/%3E%3C/svg%3E")'
        }}
      />
      <nav className="relative border-b border-slate-800/80 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-7 lg:px-9 py-4 flex justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-3xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-emerald-500/20">
              <Building2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Company Portal</div>
              <div className="text-sm font-semibold text-slate-50">{company.email}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-xs sm:text-sm">
            <button
              className="text-slate-300 hover:text-emerald-300"
              onClick={() => navigate('/company/dashboard')}
            >
              Dashboard
            </button>
            <button
              className="text-slate-300 hover:text-emerald-300"
              onClick={() => navigate('/marketplace')}
            >
              Marketplace
            </button>
            <button
              className="text-slate-300 hover:text-amber-300"
              onClick={logoutCompany}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="relative max-w-7xl mx-auto py-9 px-4 sm:px-7 lg:px-9 space-y-7">
        <div className="relative rounded-[26px] p-[1px] bg-[radial-gradient(circle_at_0_0,rgba(16,185,129,0.45),transparent_58%),radial-gradient(circle_at_120%_-10%,rgba(245,158,11,0.34),transparent_60%)] shadow-[0_32px_100px_rgba(16,185,129,0.38)]">
          <div className="bg-[#050505]/85 px-5 pt-5 pb-6 rounded-[24px] shadow-[0_24px_80px_rgba(15,118,110,0.65)] border border-white/10 backdrop-blur-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-50">Company Wallet</h2>
              <div className="mt-1 text-xs text-slate-400">
                Manage the wallet used for purchasing carbon credits.
              </div>
            </div>
            <span
              className={`text-[11px] px-3 py-1 rounded-full border ${
                company.wallet_address
                  ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-700 bg-slate-900 text-slate-400'
              }`}
            >
              {company.wallet_address ? 'Wallet Connected' : 'Wallet Not Connected'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="text-xs sm:text-sm text-slate-300">Email: {company.email}</div>
              <div className="mt-1 text-xs sm:text-sm text-slate-300">
                Wallet: {company.wallet_address || 'Not connected'}
              </div>
              {connectError && <div className="mt-3 text-xs sm:text-sm text-amber-300">{connectError}</div>}
              {connectSuccess && <div className="mt-3 text-xs sm:text-sm text-emerald-300">{connectSuccess}</div>}
              <div className="mt-4 flex">
                <input
                  type="text"
                  placeholder="0x..."
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  className="flex-1 border border-slate-700 bg-slate-950/80 rounded-l-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleConnect}
                  className="bg-emerald-500 text-slate-950 px-4 py-2 text-sm font-semibold rounded-r-lg flex items-center disabled:opacity-50 hover:bg-emerald-400"
                  disabled={!isValidAddress(wallet)}
                >
                  <Wallet className="h-4 w-4 mr-2" /> Connect Wallet
                </button>
              </div>
              <button
                onClick={connectWithMetaMask}
                className="mt-3 px-3.5 py-2 rounded-[20px] border border-slate-700 bg-slate-900 flex items-center text-xs sm:text-sm text-slate-200 hover:bg-slate-800"
              >
                <PlugZap className="h-4 w-4 mr-2 text-amber-400" /> Use MetaMask
              </button>
            </div>
            <div className="bg-slate-900/90 rounded-xl border border-white/10 px-4 pt-4 pb-5 shadow-[0_18px_60px_rgba(16,185,129,0.4)]">
              <div className="text-xs text-slate-400">Status</div>
              <div className="mt-2 text-sm sm:text-base font-semibold text-slate-50">
                {company.wallet_address ? 'Ready to purchase credits' : 'Connect wallet to purchase'}
              </div>
            </div>
          </div>
          </div>
        </div>
        <div className="relative rounded-[26px] p-[1px] bg-[radial-gradient(circle_at_0_0,rgba(148,163,184,0.52),transparent_58%),radial-gradient(circle_at_120%_0,rgba(16,185,129,0.45),transparent_60%)] shadow-[0_32px_100px_rgba(16,185,129,0.36)]">
          <div className="bg-[#050505]/88 px-5 pt-5 pb-6 rounded-[24px] shadow-[0_24px_80px_rgba(15,118,110,0.6)] border border-white/10 backdrop-blur-xl">
          <h2 className="text-base sm:text-lg font-semibold text-slate-50 mb-3">Marketplace Listings</h2>
          {loading ? (
            <div className="text-xs sm:text-sm text-slate-400">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.map(l => (
                <div
                  key={l.id}
                  className="border border-white/10 rounded-[20px] p-4 bg-slate-950/70 hover:bg-slate-900/90 hover:shadow-[0_0_26px_rgba(16,185,129,0.7)] transition-all backdrop-blur-lg"
                >
                  <div className="text-sm font-medium text-slate-50">Listing #{l.id}</div>
                  <div className="mt-1 text-xs sm:text-sm text-slate-300">Credits: {l.credit_amount}</div>
                  <div className="text-xs sm:text-sm text-slate-300">Price/Credit: {l.price_per_credit}</div>
                  <div className="text-xs sm:text-sm text-slate-400">Seller: {l.seller_user_id}</div>
                  <button
                    onClick={() => purchase(l)}
                    className="relative mt-3 bg-emerald-500/20 text-emerald-100 px-3.5 py-2 text-sm rounded-[9999px] flex items-center font-semibold border border-emerald-400/70 shadow-[0_0_24px_rgba(16,185,129,0.65)] hover:bg-emerald-400/30"
                  >
                    <span className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.55),transparent_55%)] opacity-60 mix-blend-screen" />
                    <span className="relative flex items-center">
                      <ShoppingCart className="h-4 w-4 mr-2" /> Purchase
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyPanel;
