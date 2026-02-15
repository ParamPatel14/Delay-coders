import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { CreditCard, ScanLine, Users, Phone, Tv, Banknote, Home, ShieldCheck, HandCoins, GraduationCap, ShoppingCart, Car, Plane, Package, Flame, Battery } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const tiles = [
  { key: 'upi_qr', label: 'UPI QR', icon: ScanLine, category: 'Others', subcategory: 'UPI' },
  { key: 'merchant_qr', label: 'Merchant QR', icon: ScanLine, category: 'Shopping', subcategory: 'Merchant QR' },
  { key: 'upi_id', label: 'UPI ID', icon: CreditCard, category: 'Others', subcategory: 'UPI' },
  { key: 'contacts', label: 'Contacts', icon: Users, category: 'Others', subcategory: 'Contact Pay' },
  { key: 'mobile_recharge', label: 'Mobile Recharge', icon: Phone, category: 'Others', subcategory: 'Mobile Recharge' },
  { key: 'dth', label: 'DTH', icon: Tv, category: 'Entertainment', subcategory: 'DTH' },
  { key: 'electricity', label: 'Electricity', icon: Battery, category: 'Utilities', subcategory: 'Electricity' },
  { key: 'water', label: 'Water', icon: ShieldCheck, category: 'Utilities', subcategory: 'Water' },
  { key: 'gas', label: 'Gas', icon: Flame, category: 'Gas', subcategory: 'Gas' },
  { key: 'rent', label: 'Rent', icon: Home, category: 'Others', subcategory: 'Rent' },
  { key: 'credit_card_bill', label: 'Credit Card Bill', icon: CreditCard, category: 'Others', subcategory: 'Credit Card Bill' },
  { key: 'loans', label: 'Loans', icon: Banknote, category: 'Others', subcategory: 'Loans' },
  { key: 'insurance', label: 'Insurance', icon: ShieldCheck, category: 'Others', subcategory: 'Insurance' },
  { key: 'shopping', label: 'Shopping', icon: ShoppingCart, category: 'Shopping', subcategory: '' },
  { key: 'travel', label: 'Travel', icon: Plane, category: 'Travel', subcategory: '' },
  { key: 'donations', label: 'Donations', icon: HandCoins, category: 'Others', subcategory: 'Donations' },
  { key: 'education', label: 'Education', icon: GraduationCap, category: 'Education', subcategory: 'Tuition' },
  { key: 'others', label: 'Others', icon: Package, category: 'Others', subcategory: '' },
];

const shoppingSub = ['Groceries', 'Electronics', 'Clothing'];

const providerMap = {
  Gas: ['Indane', 'HP Gas', 'Bharat Gas'],
  Utilities: {
    Electricity: ['Adani Electricity Mumbai', 'BESCOM', 'Tata Power Delhi', 'MSEB'],
    Water: ['Delhi Jal Board', 'BMC Water', 'BWSSB']
  },
  Entertainment: {
    DTH: ['Tata Play', 'Airtel DTH', 'Dish TV']
  },
  'Mobile Recharge': ['Jio', 'Airtel', 'Vi'],
  Shopping: {
    Groceries: ['Dmart', 'Reliance Fresh', 'BigBazaar'],
    Electronics: ['Croma', 'Reliance Digital', 'Amazon'],
    Clothing: ['Myntra', 'H&M', 'Zara']
  },
  Travel: {
    Flights: ['IndiGo', 'Air India', 'Vistara', 'SpiceJet'],
    Train: ['IRCTC'],
    Bus: ['RedBus', 'KSRTC'],
    Hotel: ['OYO', 'MakeMyTrip']
  },
  Education: ['Byju\'s', 'Udemy', 'Coursera'],
  Insurance: ['LIC', 'HDFC Life', 'ICICI Prudential'],
  Loans: ['HDFC', 'ICICI', 'SBI'],
  'Credit Card Bill': ['HDFC Bank', 'ICICI Bank', 'SBI Card'],
  Rent: ['NoBroker', 'Housing.com'],
  Others: ['Generic Merchant']
};

const presetMap = {
  Gas: [500, 1000, 2000],
  Utilities: [500, 1000, 2000],
  Entertainment: [300, 600, 1200],
  Shopping: {
    Groceries: [500, 800, 1200],
    Electronics: [5000, 10000, 20000],
    Clothing: [1000, 2500, 4000]
  },
  Travel: [2000, 5000, 10000],
  Education: [2000, 5000, 10000],
  Others: [300, 700, 1500]
};

const PaymentsHub = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [provider, setProvider] = useState('');
  const [amount, setAmount] = useState(500);
  const [contact, setContact] = useState('9999999999');
  const [loading, setLoading] = useState(false);
  const [sustainable, setSustainable] = useState(false);
  const [step, setStep] = useState('tiles'); // tiles | providers | details
  const [providerSearch, setProviderSearch] = useState('');
  const [upiQrText, setUpiQrText] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiAccount, setUpiAccount] = useState(null);
  const [upiHistory, setUpiHistory] = useState([]);
  const [upiLoading, setUpiLoading] = useState(false);
  const [upiError, setUpiError] = useState('');
  const [copied, setCopied] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);
  const [walletTx, setWalletTx] = useState([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState('');
  const [transferUpi, setTransferUpi] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferMessage, setTransferMessage] = useState('');
  const [insightLoadingId, setInsightLoadingId] = useState(null);
  const [txInsights, setTxInsights] = useState({});
  const [walletSummary, setWalletSummary] = useState(null);
  const [upiSummary, setUpiSummary] = useState(null);
  const [merchantQrData, setMerchantQrData] = useState('');
  const [merchantQrResult, setMerchantQrResult] = useState(null);
  const [merchantQrError, setMerchantQrError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadUpi = async () => {
      setUpiLoading(true);
      setUpiError('');
      try {
        const [accountRes, historyRes] = await Promise.all([
          api.get('/payments/upi/account'),
          api.get('/payments/upi/history')
        ]);
        if (!cancelled) {
          setUpiAccount(accountRes.data);
          setUpiHistory(historyRes.data || []);
        }
      } catch (e) {
        if (!cancelled) {
          setUpiError('Unable to load UPI details right now.');
        }
      } finally {
        if (!cancelled) {
          setUpiLoading(false);
        }
      }
    };
    loadUpi();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCopyVpa = async () => {
    if (!upiAccount || !upiAccount.vpa) return;
    try {
      await navigator.clipboard.writeText(upiAccount.vpa);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
    }
  };

  const refreshWallet = async () => {
    setWalletLoading(true);
    setWalletError('');
    try {
      const [infoRes, txRes, walletDashRes, upiDashRes] = await Promise.all([
        api.get('/wallets/me'),
        api.get('/wallets/transactions'),
        api.get('/dashboard/wallet'),
        api.get('/dashboard/upi-summary'),
      ]);
      setWalletInfo(infoRes.data);
      setWalletTx(txRes.data || []);
      setWalletSummary(walletDashRes.data || null);
      setUpiSummary(upiDashRes.data || null);
    } catch (e) {
      setWalletError('Unable to load wallet right now.');
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    refreshWallet();
  }, []);

  const handleTransfer = async () => {
    if (!transferUpi || !transferAmount) return;
    setTransferLoading(true);
    setTransferMessage('');
    try {
      const amountPaisa = Math.round(Number(transferAmount) * 100);
      await api.post('/wallets/transfer', {
        receiver_upi_id: transferUpi.trim(),
        amount: amountPaisa,
      });
      setTransferMessage('Transfer successful');
      setTransferUpi('');
      setTransferAmount('');
      await refreshWallet();
    } catch (e) {
      setTransferMessage('Transfer failed');
    } finally {
      setTransferLoading(false);
    }
  };

  const fetchInsight = async (txId) => {
    if (!txId) return;
    setInsightLoadingId(txId);
    try {
      const { data } = await api.get(`/upi/insights/${txId}`);
      const insight = data && data.insight ? data.insight : '';
      setTxInsights((prev) => ({
        ...prev,
        [txId]: insight
      }));
    } catch (e) {
      setTxInsights((prev) => ({
        ...prev,
        [txId]: 'Unable to load insight right now.'
      }));
    } finally {
      setInsightLoadingId(null);
    }
  };

  const pickTile = (tile) => {
    setSelected(tile.key);
    setCategory(tile.category);
    setSubcategory(tile.subcategory || '');
    setProvider('');
    const presets = Array.isArray(presetMap[tile.category]) ? presetMap[tile.category] : presetMap[tile.category]?.[tile.subcategory] || [];
    if (presets && presets.length) setAmount(presets[0]);
    // Decide next step
    if (tile.key === 'shopping') {
      setStep('details'); // show shopping sub-types in details card
    } else if (tile.key === 'travel') {
      setStep('details'); // travel details with sustainable toggle and mode picker
    } else if (tile.key === 'upi_qr') {
      setStep('details');
    } else if (tile.key === 'merchant_qr') {
      setStep('details');
      setMerchantQrData('');
      setMerchantQrResult(null);
      setMerchantQrError('');
    } else if (tile.key === 'upi_id') {
      setStep('details');
    } else {
      setStep('providers'); // show providers list first
    }
  };

  const renderPresets = () => {
    let presets = [];
    if (category === 'Shopping' && subcategory && presetMap.Shopping[subcategory]) {
      presets = presetMap.Shopping[subcategory];
    } else {
      presets = Array.isArray(presetMap[category]) ? presetMap[category] : [];
    }
    if (!presets || presets.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            className={`px-3 py-1 rounded-md border text-xs sm:text-sm ${
              amount === p
                ? 'border-emerald-400/80 text-emerald-100 bg-emerald-500/10 shadow-[0_0_18px_rgba(16,185,129,0.5)]'
                : 'border-white/10 text-slate-200 bg-slate-950/70 hover:bg-slate-900/80'
            }`}
            onClick={() => setAmount(p)}
          >
            ₹{p}
          </button>
        ))}
      </div>
    );
  };

  const availableProviders = useMemo(() => {
    if (category === 'Utilities') {
      const list = providerMap.Utilities[subcategory] || [];
      return list.filter((p) => p.toLowerCase().includes(providerSearch.toLowerCase()));
    }
    if (category === 'Entertainment') {
      const list = providerMap.Entertainment[subcategory] || [];
      return list.filter((p) => p.toLowerCase().includes(providerSearch.toLowerCase()));
    }
    if (category === 'Shopping') {
      const list = providerMap.Shopping[subcategory] || [];
      return list.filter((p) => p.toLowerCase().includes(providerSearch.toLowerCase()));
    }
    if (category === 'Travel') {
      const list = providerMap.Travel[subcategory] || [];
      return list.filter((p) => p.toLowerCase().includes(providerSearch.toLowerCase()));
    }
    if (category === 'Others' && subcategory) {
      const list = providerMap[subcategory] || providerMap.Others;
      return list.filter((p) => p.toLowerCase().includes(providerSearch.toLowerCase()));
    }
    const base = providerMap[category] || [];
    return base.filter((p) => p.toLowerCase().includes(providerSearch.toLowerCase()));
  }, [category, subcategory, providerSearch]);

  const parseUpiQr = (text) => {
    try {
      const t = text.trim();
      if (!t) return;
      const q = t.startsWith('upi://') ? t.replace('upi://pay', 'http://x') : `http://x?${t}`;
      const url = new URL(q);
      const params = new URLSearchParams(url.search);
      const am = params.get('am');
      const pn = params.get('pn');
      const pa = params.get('pa');
      if (am) {
        const v = Number(am);
        if (!Number.isNaN(v) && v > 0) setAmount(v);
      }
      if (pn) setProvider(pn);
      else if (pa) setProvider(pa);
    } catch {}
  };

  const payNow = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      if (selected === 'merchant_qr') {
        setMerchantQrError('');
        setMerchantQrResult(null);
        let qrPayload;
        try {
          const raw = (merchantQrData || '').trim();
          if (!raw) {
            throw new Error('Paste QR data from merchant to continue.');
          }
          qrPayload = JSON.parse(raw);
        } catch (e) {
          setMerchantQrError(e.message || 'Invalid QR data JSON.');
          return;
        }
        const { data } = await api.post('/upi/scan-and-pay', {
          qr_data: qrPayload,
        });
        setMerchantQrResult(data);
        await refreshWallet();
        alert('Payment successful');
        return;
      }

      if (!category) return;
      const effectiveCategory = category === 'Travel' && sustainable ? 'Sustainable Travel' : category;
      const computedSubcategory = (() => {
        const base = subcategory || '';
        if (provider) {
          return base ? `${base}:${provider}` : provider;
        }
        if (selected === 'upi_id' && upiId) {
          return `UPI:ID:${upiId.trim()}`;
        }
        if (selected === 'upi_qr') {
          const tag = 'UPI:QR';
          const info = upiQrText ? `:${upiQrText.slice(0, 128)}` : '';
          return `${tag}${info}`;
        }
        return base || null;
      })();

      const { data: orderData } = await api.post('/payments/order-by-category', {
        amount,
        currency: 'INR',
        category: effectiveCategory,
        subcategory: computedSubcategory
      });
      await api.post('/payments/verify', {
        order_id: orderData.order_id,
        upi_vpa: selected === 'upi_id' && upiId ? upiId.trim() : undefined,
        category: effectiveCategory,
        subcategory: computedSubcategory
      });
      alert('Payment successful');
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Something went wrong while processing the payment.');
    } finally {
      setLoading(false);
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
      <header className="relative border-b border-emerald-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-3xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-emerald-500/20 mr-3">
              <CreditCard className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">EcoCent</div>
              <span className="text-lg font-bold tracking-tight text-slate-900">Payments</span>
            </div>
          </div>
        </div>
      </header>
      <main className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-3">Quick Actions</h2>
        <div className="relative mb-8 rounded-[26px] p-[1px] bg-[radial-gradient(circle_at_0_0,rgba(16,185,129,0.18),transparent_58%),radial-gradient(circle_at_120%_-10%,rgba(245,158,11,0.22),transparent_60%)] shadow-sm">
          <div className="bg-white rounded-[24px] border border-emerald-100 backdrop-blur-xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 sm:p-5">
              {tiles.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  className={`group relative flex flex-col items-center justify-center rounded-2xl px-4 py-4 border text-xs sm:text-sm transition ${
                    selected === key
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : 'border-emerald-100 bg-white hover:bg-emerald-50 hover:shadow-sm'
                  }`}
                  onClick={() => pickTile(tiles.find(t => t.key === key))}
                >
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.4),transparent_55%)] mix-blend-screen" />
                  <div className="relative flex flex-col items-center">
                    <Icon className="h-6 w-6 text-emerald-500 mb-2" />
                    <span className="font-medium text-slate-900">{label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 mb-1">Wallet Balance</div>
            <div className="text-2xl font-bold text-slate-900">
              {walletSummary ? `₹${(walletSummary.wallet_balance / 100).toFixed(2)}` : '₹0.00'}
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 mb-1">UPI Spent / Received</div>
            <div className="text-sm text-slate-900">
              {walletSummary && upiSummary ? (
                <>
                  <span className="text-rose-600 mr-3">
                    Spent ₹{(walletSummary.total_spent / 100).toFixed(2)}
                  </span>
                  <span className="text-emerald-600">
                    Received ₹{(walletSummary.total_received / 100).toFixed(2)}
                  </span>
                </>
              ) : (
                '₹0.00 / ₹0.00'
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 mb-1">Impact & Points</div>
            <div className="text-xs text-slate-700">
              {walletSummary ? (
                <>
                  <div>Carbon generated: {walletSummary.carbon_generated.toFixed(2)} kg CO₂</div>
                  <div>Eco points earned: {walletSummary.eco_points_earned}</div>
                </>
              ) : (
                <>
                  <div>Carbon generated: 0.00 kg CO₂</div>
                  <div>Eco points earned: 0</div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="relative rounded-[26px] p-[1px] bg-[radial-gradient(circle_at_0_0,rgba(190,242,100,0.5),transparent_58%),radial-gradient(circle_at_120%_0,rgba(52,211,153,0.45),transparent_60%)] shadow-sm">
          <Card className="bg-white rounded-[24px] border border-emerald-100 backdrop-blur-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 tracking-tight">Details</CardTitle>
            </CardHeader>
            <CardContent>
              {category === 'Shopping' && selected !== 'merchant_qr' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shopping Type</label>
                  <div className="flex gap-2">
                    {shoppingSub.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`px-3 py-2 rounded-xl border text-sm ${subcategory === opt ? 'ring-1 ring-green-500' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-900'}`}
                        onClick={() => {
                          setSubcategory(opt);
                          const presets = presetMap.Shopping[opt];
                          if (presets && presets.length) setAmount(presets[0]);
                          setStep('providers');
                          setProvider('');
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {category === 'Travel' && (
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-slate-200">Sustainable option</span>
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-full border text-xs ${
                      sustainable
                        ? 'ring-1 ring-emerald-500 border-emerald-400/70 text-emerald-100 bg-emerald-500/10'
                        : 'border-white/10 bg-slate-950/70 hover:bg-slate-900/80 text-slate-200'
                    }`}
                    onClick={() => setSustainable(!sustainable)}
                  >
                    {sustainable ? 'Enabled' : 'Enable'}
                  </button>
                </div>
              )}

              {step === 'providers' && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-200">Select Provider</span>
                    <Input
                      type="text"
                      placeholder="Search providers"
                      value={providerSearch}
                      onChange={(e) => setProviderSearch(e.target.value)}
                      className="w-40 sm:w-56 bg-slate-950/80 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableProviders.map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`px-3 py-2 rounded-xl border text-sm text-left ${
                          provider === p
                            ? 'border-emerald-400/80 bg-emerald-500/10 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.55)]'
                            : 'border-white/10 bg-slate-950/70 hover:bg-slate-900/80 text-slate-100'
                        }`}
                        onClick={() => {
                          setProvider(p);
                          setStep('details');
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {provider && (
                <div className="mb-4">
                  <div className="text-sm text-slate-300 mb-1">Provider</div>
                  <div className="flex items-center justify-between bg-slate-950/70 border border-slate-700 rounded-xl px-3 py-2">
                    <span className="text-sm font-medium text-slate-50">{provider}</span>
                    <button
                      type="button"
                      className="text-xs text-emerald-300 hover:text-emerald-200"
                      onClick={() => setStep('providers')}
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              {selected === 'upi_qr' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-200 mb-1">UPI QR Code Text</label>
                  <textarea
                    className="border border-slate-700 rounded-xl w-full px-3 py-2 text-sm h-24 bg-slate-950/80 text-slate-100 placeholder:text-slate-500"
                    placeholder="upi://pay?pa=merchant@upi&pn=Merchant&am=500&cu=INR"
                    value={upiQrText}
                    onChange={(e) => {
                      setUpiQrText(e.target.value);
                      parseUpiQr(e.target.value);
                    }}
                  />
                </div>
              )}

              {selected === 'upi_id' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-200 mb-1">UPI ID</label>
                  <Input
                    type="text"
                    placeholder="example@bank"
                    value={upiId}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setUpiId(val);
                      setProvider(val);
                    }}
                    className="bg-slate-950/80 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">Enter the recipient UPI ID (e.g., merchant@upi). This is simulated and will be recorded with the payment.</p>
                </div>
              )}

              {category && selected !== 'merchant_qr' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {(subcategory === 'Electricity' || category === 'Utilities') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">Consumer Number</label>
                        <Input className="w-full bg-white border-emerald-100 text-slate-900 placeholder:text-slate-400" placeholder="e.g., 1234567890" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">Billing Unit</label>
                        <Input className="w-full bg-white border-emerald-100 text-slate-900 placeholder:text-slate-400" placeholder="e.g., 4402" />
                      </div>
                    </>
                  )}
                  {category === 'Gas' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">Connection ID</label>
                        <Input className="w-full bg-white border-emerald-100 text-slate-900 placeholder:text-slate-400" placeholder="e.g., 9876543210" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">Registered Mobile</label>
                        <Input className="w-full bg-white border-emerald-100 text-slate-900 placeholder:text-slate-400" placeholder="e.g., 9999999999" />
                      </div>
                    </>
                  )}
                  {category === 'Travel' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">Travel Mode</label>
                        <select
                          className="border border-emerald-100 rounded-xl w-full px-3 py-2 text-sm bg-white text-slate-900"
                          value={subcategory}
                          onChange={(e) => setSubcategory(e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="Flights">Flights</option>
                          <option value="Train">Train</option>
                          <option value="Bus">Bus</option>
                          <option value="Hotel">Hotel</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">PNR/Booking ID</label>
                        <Input className="w-full bg-white border-emerald-100 text-slate-900 placeholder:text-slate-400" placeholder="e.g., ABC1234567" />
                      </div>
                    </>
                  )}
                  {category === 'Shopping' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">Order ID</label>
                        <Input className="w-full bg-white border-emerald-100 text-slate-900 placeholder:text-slate-400" placeholder="e.g., ORD-001234" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">Merchant</label>
                        <select
                          className="border border-emerald-100 rounded-xl w-full px-3 py-2 text-sm bg-white text-slate-900"
                          value={provider}
                          onChange={(e) => setProvider(e.target.value)}
                        >
                          <option value="">Select</option>
                          {(providerMap.Shopping[subcategory] || []).map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}

              {selected !== 'merchant_qr' && (
                <>
                  <div className="mb-4">{renderPresets()}</div>

                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-slate-900 mb-1">Amount (INR)</label>
                    <div className="relative rounded-xl">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-emerald-700 sm:text-sm">₹</span>
                      </div>
                      <Input
                        type="number"
                        id="amount"
                        className="block w-full pl-7 pr-12 bg-white border-emerald-100 text-slate-900 placeholder:text-slate-400"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="contact" className="block text-sm font-medium text-slate-900 mb-1">Phone Number</label>
                    <Input
                      type="tel"
                      id="contact"
                      className="bg-white border-emerald-100 text-slate-900 placeholder:text-slate-400"
                      placeholder="9999999999"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                    />
                  </div>
                </>
              )}

              {selected === 'merchant_qr' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-900 mb-1">Merchant QR Data</label>
                  <textarea
                    className="border border-emerald-100 rounded-xl w-full px-3 py-2 text-sm h-24 bg-white text-slate-900 placeholder:text-slate-400"
                    placeholder='Paste QR data JSON shared by merchant'
                    value={merchantQrData}
                    onChange={(e) => setMerchantQrData(e.target.value)}
                  />
                  {merchantQrError && (
                    <p className="text-xs text-rose-600 mt-1">{merchantQrError}</p>
                  )}
                  {merchantQrResult && (
                    <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                      <div className="font-semibold mb-1">Receipt</div>
                      <div className="mb-1">Order: {merchantQrResult.order_id}</div>
                      <div className="mb-1">
                        Items:
                        <ul className="list-disc list-inside">
                          {(merchantQrResult.items || []).map((it, idx) => (
                            <li key={idx}>
                              {it.name} × {it.quantity} @ ₹{it.price}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        Carbon generated:{' '}
                        {merchantQrResult.carbon_kg && merchantQrResult.carbon_kg.toFixed
                          ? merchantQrResult.carbon_kg.toFixed(2)
                          : merchantQrResult.carbon_kg}{' '}
                        kg CO₂
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={payNow}
                disabled={loading || (!category && selected !== 'merchant_qr')}
                className="relative w-full flex justify-center rounded-[9999px] bg-emerald-500/25 text-emerald-100 border border-emerald-400/70 shadow-[0_0_26px_rgba(16,185,129,0.7)] hover:bg-emerald-400/35 disabled:opacity-50"
              >
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.55),transparent_55%)] opacity-60 mix-blend-screen" />
                <span className="relative">
                  {loading ? 'Processing...' : selected === 'merchant_qr' ? 'Pay Merchant' : 'Pay Now'}
                </span>
              </Button>
              <p className="text-xs text-center text-slate-400 mt-2">Processed by GreenZaction Pay</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white rounded-[24px] border border-emerald-100 backdrop-blur-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 tracking-tight">Your EcoPay UPI ID</CardTitle>
            </CardHeader>
            <CardContent>
              {upiAccount ? (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-wide text-slate-400">Linked UPI handle</div>
                    {copied && <span className="text-[11px] text-emerald-600">Copied</span>}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-sm sm:text-base text-slate-900 truncate">{upiAccount.vpa}</div>
                      {upiAccount.display_name && (
                        <div className="text-xs text-slate-500 mt-1 truncate">{upiAccount.display_name}</div>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={handleCopyVpa}
                      className="px-3 h-8 rounded-full border border-emerald-200 text-xs font-medium text-emerald-700 bg-white hover:bg-emerald-50"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  {upiLoading ? 'Loading your UPI ID...' : upiError || 'UPI ID is not available yet.'}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[24px] border border-emerald-100 backdrop-blur-xl shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-slate-900 tracking-tight">UPI Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {upiLoading && !upiHistory.length && (
                <div className="text-sm text-slate-500">Loading your recent UPI activity...</div>
              )}
              {!upiLoading && upiError && (
                <div className="text-sm text-rose-500">{upiError}</div>
              )}
              {!upiLoading && !upiError && upiHistory.length === 0 && (
                <div className="text-sm text-slate-500">No UPI payments yet. Your next payment will appear here.</div>
              )}
              {upiHistory.length > 0 && (
                <div className="space-y-3">
                  {upiHistory.slice(0, 6).map((item) => {
                    const isOutgoing = upiAccount && item.payer_vpa === upiAccount.vpa;
                    const sign = isOutgoing ? '-' : '+';
                    const amountInr = (item.amount / 100).toFixed(2);
                    const peer = isOutgoing ? item.payee_vpa : item.payer_vpa;
                    return (
                      <div
                        key={item.request_id}
                        className="flex items-center justify-between rounded-xl border border-emerald-100 bg-white px-3 py-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                isOutgoing ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                              }`}
                            >
                              {isOutgoing ? 'Paid' : 'Received'}
                            </span>
                            <span className="text-xs text-slate-500 truncate max-w-[160px]">{peer}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm font-semibold ${
                              isOutgoing ? 'text-rose-600' : 'text-emerald-700'
                            }`}
                          >
                            {sign}₹{amountInr}
                          </div>
                          <div
                            className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${
                              item.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {item.status}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white rounded-[24px] border border-emerald-100 backdrop-blur-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 tracking-tight">Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              {walletLoading && !walletInfo && (
                <div className="text-sm text-slate-500">Loading wallet...</div>
              )}
              {!walletLoading && walletError && (
                <div className="text-sm text-rose-500">{walletError}</div>
              )}
              {walletInfo && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Linked UPI</div>
                  <div className="font-mono text-sm text-slate-900 mb-3">{walletInfo.upi_id}</div>
                  <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Balance</div>
                  <div className="text-2xl font-semibold text-emerald-700">
                    ₹{(walletInfo.balance / 100).toFixed(2)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[24px] border border-emerald-100 backdrop-blur-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 tracking-tight">Send via UPI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Recipient UPI ID</label>
                  <Input
                    type="text"
                    value={transferUpi}
                    onChange={(e) => setTransferUpi(e.target.value)}
                    placeholder="friend@ecopay"
                    className="bg-white border-emerald-100 text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Amount (INR)</label>
                  <Input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="100"
                    className="bg-white border-emerald-100 text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleTransfer}
                  disabled={transferLoading || !transferUpi || !transferAmount}
                  className="w-full rounded-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                  {transferLoading ? 'Sending...' : 'Send'}
                </Button>
                {transferMessage && (
                  <div className="text-xs text-center text-slate-500">{transferMessage}</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[24px] border border-emerald-100 backdrop-blur-xl shadow-sm lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-slate-900 tracking-tight">Wallet UPI Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {walletLoading && !walletTx.length && (
                <div className="text-sm text-slate-500">Loading wallet transactions...</div>
              )}
              {!walletLoading && walletTx.length === 0 && !walletError && (
                <div className="text-sm text-slate-500">No wallet transfers yet.</div>
              )}
              {!walletLoading && walletTx.length > 0 && (
                <div className="space-y-3">
                  {walletTx.slice(0, 6).map((t) => {
                    const isOutgoing = walletInfo && t.sender_upi_id === walletInfo.upi_id;
                    const sign = isOutgoing ? '-' : '+';
                    const amountInr = (t.amount / 100).toFixed(2);
                    const peer = isOutgoing ? t.receiver_upi_id : t.sender_upi_id;
                    return (
                      <div
                        key={t.transaction_id}
                        className="flex items-center justify-between rounded-xl border border-emerald-100 bg-white px-3 py-2"
                      >
                        <div className="flex-1 pr-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                isOutgoing ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                              }`}
                            >
                              {isOutgoing ? 'Sent' : 'Received'}
                            </span>
                            <span className="text-xs text-slate-500 truncate max-w-[160px]">{peer}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            {t.created_at ? new Date(t.created_at).toLocaleString() : ''}
                          </div>
                          {txInsights[t.transaction_id] && (
                            <div className="mt-1 text-[11px] text-slate-500 max-w-xs">
                              {txInsights[t.transaction_id]}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm font-semibold ${
                              isOutgoing ? 'text-rose-600' : 'text-emerald-700'
                            }`}
                          >
                            {sign}₹{amountInr}
                          </div>
                          <div
                            className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${
                              t.status === 'SUCCESS'
                                ? 'bg-emerald-50 text-emerald-700'
                                : t.status === 'PENDING'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {t.status}
                          </div>
                          <button
                            type="button"
                            className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                            disabled={insightLoadingId === t.transaction_id}
                            onClick={() => fetchInsight(t.transaction_id)}
                          >
                            {insightLoadingId === t.transaction_id ? 'Analyzing...' : 'AI Insight'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PaymentsHub;
