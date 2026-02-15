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
  const [orderId, setOrderId] = useState('');
  const [posCategory, setPosCategory] = useState('Groceries');
  const [posItems, setPosItems] = useState([{ name: 'Milk (1L)', quantity: 1, price: '60' }]);
  const [posAmount, setPosAmount] = useState('60.00');
  const [qrImage, setQrImage] = useState('');
  const [qrError, setQrError] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [carbonEstimate, setCarbonEstimate] = useState(null);
  const [ecoPointsEstimate, setEcoPointsEstimate] = useState(null);
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
    try {
      const orderRes = await api.post(
        '/marketplace/company-order',
        { listing_id: listing.id, credit_amount: listing.credit_amount },
        { params: { token } }
      );
      await api.post(
        '/marketplace/company-verify',
        { marketplace_order_id: orderRes.data.marketplace_order_id },
        { params: { token } }
      );
      const res = await api.get('/marketplace/listings');
      setListings(res.data);
      alert('Purchase successful');
    } catch (err) {
      console.error(err);
      alert('Purchase failed, please try again.');
    }
  };

  const itemCatalog = {
    Groceries: [
      'Milk (1L)',
      'Bread Loaf',
      'Eggs (12pc)',
      'Rice (1kg)',
      'Vegetable Basket',
    ],
    Electronics: [
      'USB-C Cable',
      'Phone Charger',
      'Bluetooth Earbuds',
      'Power Bank',
    ],
    Clothing: [
      'T-Shirt',
      'Jeans',
      'Hoodie',
      'Sneakers',
    ],
  };

  const recalcPosAmount = (items) => {
    const total = items.reduce((sum, it) => {
      const q = Number(it.quantity) || 0;
      const p = Number(it.price) || 0;
      return sum + q * p;
    }, 0);
    if (total > 0) {
      setPosAmount(total.toFixed(2));
    } else {
      setPosAmount('');
    }
  };

  const updatePosItem = (index, field, value) => {
    const next = posItems.map((it, i) => (i === index ? { ...it, [field]: value } : it));
    setPosItems(next);
    recalcPosAmount(next);
  };

  const addPosItem = () => {
    const next = [...posItems, { name: '', quantity: 1, price: '' }];
    setPosItems(next);
    recalcPosAmount(next);
  };

  const removePosItem = (index) => {
    const next = posItems.filter((_, i) => i !== index);
    const finalList = next.length ? next : [{ name: '', quantity: 1, price: '' }];
    setPosItems(finalList);
    recalcPosAmount(finalList);
  };

  const generateQr = async () => {
    setQrError('');
    setQrImage('');
    setCarbonEstimate(null);
    setEcoPointsEstimate(null);
    const token = localStorage.getItem('company_token');
    if (!token) {
      setQrError('Merchant token missing, please sign in again.');
      return;
    }
    const cleanItems = posItems
      .map((it) => ({
        name: (it.name || '').trim(),
        quantity: Number(it.quantity) || 0,
        price: Number(it.price) || 0,
      }))
      .filter((it) => it.name && it.quantity > 0 && it.price > 0);
    if (!cleanItems.length) {
      setQrError('Add at least one item with name, quantity, and price.');
      return;
    }
    const total = cleanItems.reduce((sum, it) => sum + it.quantity * it.price, 0);
    const finalOrderId = orderId || `ORD-${Date.now()}`;
    setQrLoading(true);
    try {
      const res = await api.post(
        '/merchant/orders/generate-qr',
        {
          order_id: finalOrderId,
          amount: total,
          items: cleanItems,
        },
        { params: { token } }
      );
      setOrderId(finalOrderId);
      setPosAmount(total.toFixed(2));
      setQrImage(res.data.qr_code_url);
      if (typeof res.data.carbon_estimate_kg === 'number') {
        setCarbonEstimate(res.data.carbon_estimate_kg);
      }
      if (typeof res.data.eco_points_estimate === 'number') {
        setEcoPointsEstimate(res.data.eco_points_estimate);
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to generate QR.';
      setQrError(msg);
    } finally {
      setQrLoading(false);
    }
  };

  if (!company) return null;

  return (
    <div className="min-h-screen bg-emerald-50 text-slate-900 selection:bg-emerald-200 relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-60 mix-blend-soft-light"
        style={{
          backgroundImage:
            'radial-gradient(circle_at 18% 0, rgba(16,185,129,0.26), transparent 60%), radial-gradient(circle_at 82% 8%, rgba(245,158,11,0.18), transparent 55%), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\' viewBox=\'0 0 160 160\'%3E%3Cfilter id=\'n\' x=\'0\' y=\'0\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'noStitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.3\'/%3E%3C/svg%3E")'
        }}
      />
      <nav className="relative border-b border-emerald-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-7 lg:px-9 py-4 flex justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-3xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-emerald-500/20">
              <Building2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800">Merchant Portal</div>
              <div className="text-sm font-semibold text-slate-900">
                {company.name || company.email}
              </div>
              <div className="text-[11px] text-slate-500">{company.email}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-xs sm:text-sm">
            <button
              className="text-emerald-800 hover:text-emerald-600"
              onClick={() => navigate('/company/dashboard')}
            >
              Dashboard
            </button>
            <button
              className="text-emerald-800 hover:text-emerald-600"
              onClick={() => navigate('/marketplace')}
            >
              Marketplace
            </button>
            <button
              className="text-emerald-800 hover:text-amber-600"
              onClick={logoutCompany}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="relative max-w-7xl mx-auto py-9 px-4 sm:px-7 lg:px-9 space-y-7">
        <div className="relative rounded-[26px] p-[1px] bg-[radial-gradient(circle_at_0_0,rgba(190,242,100,0.45),transparent_58%),radial-gradient(circle_at_120%_-10%,rgba(52,211,153,0.34),transparent_60%)] shadow-sm">
          <div className="bg-white px-5 pt-5 pb-6 rounded-[24px] shadow-sm border border-emerald-100 backdrop-blur-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Company Wallet</h2>
              <div className="mt-1 text-xs text-emerald-800">
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
                className="mt-3 px-3.5 py-2 rounded-[20px] border border-emerald-200 bg-white flex items-center text-xs sm:text-sm text-emerald-900 hover:bg-emerald-50"
              >
                <PlugZap className="h-4 w-4 mr-2 text-amber-500" /> Use MetaMask
              </button>
            </div>
            <div className="bg-white rounded-xl border border-emerald-100 px-4 pt-4 pb-5 shadow-sm">
              <div className="text-xs text-emerald-800">Status</div>
              <div className="mt-2 text-sm sm:text-base font-semibold text-slate-900">
                {company.wallet_address ? 'Ready to purchase credits' : 'Connect wallet to purchase'}
              </div>
            </div>
          </div>
          </div>
        </div>
        <div className="relative rounded-[26px] p-[1px] bg-[radial-gradient(circle_at_0_0,rgba(190,242,100,0.52),transparent_58%),radial-gradient(circle_at_120%_0,rgba(52,211,153,0.45),transparent_60%)] shadow-sm">
          <div className="bg-white px-5 pt-5 pb-6 rounded-[24px] shadow-sm border border-emerald-100 backdrop-blur-xl">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">Marketplace Listings</h2>
            {loading ? (
              <div className="text-xs sm:text-sm text-emerald-800">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listings.map(l => (
                  <div
                    key={l.id}
                    className="border border-emerald-100 rounded-[20px] p-4 bg-white hover:bg-emerald-50 hover:shadow-sm transition-all"
                  >
                    <div className="text-sm font-medium text-slate-900">Listing #{l.id}</div>
                    <div className="mt-1 text-xs sm:text-sm text-emerald-800">Credits: {l.credit_amount}</div>
                    <div className="text-xs sm:text-sm text-emerald-800">Price/Credit: {l.price_per_credit}</div>
                    <div className="text-xs sm:text-sm text-emerald-700">Seller: {l.seller_user_id}</div>
                    <button
                      onClick={() => purchase(l)}
                      className="relative mt-3 bg-emerald-500 text-slate-950 px-3.5 py-2 text-sm rounded-[9999px] flex items-center font-semibold border border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600 shadow-sm"
                    >
                      <span className="relative flex items-center mx-auto">
                        <ShoppingCart className="h-4 w-4 mr-2" /> Purchase
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="relative rounded-[26px] p-[1px] bg-[radial-gradient(circle_at_0_0,rgba(190,242,100,0.48),transparent_58%),radial-gradient(circle_at_120%_0,rgba(52,211,153,0.45),transparent_60%)] shadow-sm">
          <div className="bg-white px-5 pt-5 pb-6 rounded-[24px] shadow-sm border border-emerald-100 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">In-store Shopping QR</h2>
                <div className="mt-1 text-xs text-emerald-800">
                  Add items and generate a QR for customers to pay.
                </div>
              </div>
              <div className="hidden sm:flex items-center text-xs text-emerald-800">
                <ShoppingCart className="h-4 w-4 mr-1" /> POS
              </div>
            </div>
            {qrError && <div className="mb-3 text-xs sm:text-sm text-amber-600">{qrError}</div>}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Order ID</label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g., ORD-1001 (leave blank to auto-generate)"
                      className="w-full border border-emerald-100 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Item category</label>
                    <select
                      className="w-full border border-emerald-100 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      value={posCategory}
                      onChange={(e) => setPosCategory(e.target.value)}
                    >
                      {Object.keys(itemCatalog).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">Items</span>
                    <button
                      type="button"
                      onClick={addPosItem}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-600"
                    >
                      + Add item
                    </button>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {posItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <select
                          className="col-span-5 border border-emerald-100 bg-white rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          value={item.name}
                          onChange={(e) => updatePosItem(idx, 'name', e.target.value)}
                        >
                          <option value="">Select item</option>
                          {(itemCatalog[posCategory] || []).map((label) => (
                            <option key={label} value={label}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Or type item name"
                          value={item.name}
                          onChange={(e) => updatePosItem(idx, 'name', e.target.value)}
                          className="col-span-4 border border-emerald-100 bg-white rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updatePosItem(idx, 'quantity', e.target.value)}
                          className="col-span-2 border border-emerald-100 bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Price"
                          value={item.price}
                          onChange={(e) => updatePosItem(idx, 'price', e.target.value)}
                          className="col-span-3 border border-emerald-100 bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => removePosItem(idx)}
                          className="col-span-1 text-[10px] text-slate-500 hover:text-amber-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-emerald-50">
                  <div className="text-xs text-slate-500">Total amount</div>
                  <div className="text-sm sm:text-base font-semibold text-slate-900">
                    ₹{posAmount || '0.00'}
                  </div>
                </div>
                {carbonEstimate !== null && ecoPointsEstimate !== null && (
                  <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs text-emerald-900">
                    <div>Estimated carbon: {carbonEstimate.toFixed(2)} kg CO₂</div>
                    <div>Estimated eco points for shopper: {ecoPointsEstimate}</div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={generateQr}
                  disabled={qrLoading}
                  className="mt-2 w-full inline-flex justify-center items-center px-4 py-2 rounded-[9999px] bg-emerald-500 text-white text-sm font-semibold border border-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
                >
                  {qrLoading ? 'Generating QR...' : 'Generate Payment QR'}
                </button>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 pt-4 pb-5 flex flex-col items-center justify-center">
                {qrImage ? (
                  <>
                    <img
                      src={qrImage}
                      alt="Payment QR"
                      className="w-36 h-36 mb-3 bg-white rounded-lg border border-emerald-100"
                    />
                    <div className="text-xs text-center text-emerald-800">
                      Ask the user to scan this QR with the EcoPay app and pay from their wallet.
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-center text-emerald-800">
                    Generate a QR to show the total amount and items to the shopper.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyPanel;
