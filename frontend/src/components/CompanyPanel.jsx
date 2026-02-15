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
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <nav className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
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
      <main className="max-w-7xl mx-auto py-9 px-4 sm:px-7 lg:px-9 space-y-7">
        <div className="bg-slate-900/80 px-5 pt-5 pb-6 rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.7)] border border-slate-800">
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
            <div className="bg-slate-900 rounded-xl border border-slate-800 px-4 pt-4 pb-5 shadow-[0_10px_30px_rgba(15,23,42,0.65)]">
              <div className="text-xs text-slate-400">Status</div>
              <div className="mt-2 text-sm sm:text-base font-semibold text-slate-50">
                {company.wallet_address ? 'Ready to purchase credits' : 'Connect wallet to purchase'}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/80 px-5 pt-5 pb-6 rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.7)] border border-slate-800">
          <h2 className="text-base sm:text-lg font-semibold text-slate-50 mb-3">Marketplace Listings</h2>
          {loading ? (
            <div className="text-xs sm:text-sm text-slate-400">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.map(l => (
                <div
                  key={l.id}
                  className="border border-slate-800 rounded-[20px] p-4 bg-slate-950/60 hover:bg-slate-900 hover:shadow-[0_10px_30px_rgba(15,23,42,0.7)] transition-all"
                >
                  <div className="text-sm font-medium text-slate-50">Listing #{l.id}</div>
                  <div className="mt-1 text-xs sm:text-sm text-slate-300">Credits: {l.credit_amount}</div>
                  <div className="text-xs sm:text-sm text-slate-300">Price/Credit: {l.price_per_credit}</div>
                  <div className="text-xs sm:text-sm text-slate-400">Seller: {l.seller_user_id}</div>
                  <button
                    onClick={() => purchase(l)}
                    className="mt-3 bg-emerald-500 text-slate-950 px-3.5 py-2 text-sm rounded-[20px] flex items-center font-semibold hover:bg-emerald-400"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" /> Purchase
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompanyPanel;
