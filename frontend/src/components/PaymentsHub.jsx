import React, { useMemo, useState } from 'react';
import api from '../api/axios';
import { CreditCard, ScanLine, Users, Phone, Tv, Banknote, Home, ShieldCheck, HandCoins, GraduationCap, ShoppingCart, Car, Plane, Package, Flame, Battery } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const tiles = [
  { key: 'upi_qr', label: 'UPI QR', icon: ScanLine, category: 'Others', subcategory: 'UPI' },
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
            className={`px-3 py-1 rounded-md border text-sm ${amount === p ? 'border-green-600 text-green-700 bg-green-50' : 'border-gray-300 text-gray-700 bg-white'}`}
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
    if (!category) return;
    setLoading(true);
    const ok = await loadRazorpayScript();
    if (!ok) {
      alert('Razorpay SDK failed to load.');
      setLoading(false);
      return;
    }
    try {
      const { data: { key } } = await api.get('/payments/key');
      const { data: orderData } = await api.post('/payments/order-by-category', {
        amount,
        currency: 'INR',
        category: category === 'Travel' && sustainable ? 'Sustainable Travel' : category,
        subcategory: (() => {
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
        })()
      });
      const options = {
        key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'GreenZaction',
        description: `${category}${subcategory ? ` - ${subcategory}` : ''}${provider ? ` (${provider})` : ''}${selected === 'upi_qr' && upiQrText ? ` [QR:${upiQrText.slice(0, 64)}]` : ''}${selected === 'upi_id' && upiId ? ` [UPI:${upiId}]` : ''}`,
        order_id: orderData.order_id,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              category: category === 'Travel' && sustainable ? 'Sustainable Travel' : category,
              subcategory: (() => {
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
              })()
            });
            alert('Payment successful');
          } catch (err) {
            console.error(err);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: user?.full_name || 'GreenZaction User',
          email: user?.email || 'user@example.com',
          contact
        },
        theme: { color: '#10B981' }
      };
      const rp = new window.Razorpay(options);
      rp.open();
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Something went wrong during payment initialization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="h-6 w-6 text-green-600 mr-2" />
            <span className="text-xl font-semibold text-gray-900">Payments</span>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {tiles.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={`flex flex-col items-center justify-center p-4 rounded-lg border shadow-sm hover:shadow transition ${selected === key ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white'}`}
              onClick={() => pickTile(tiles.find(t => t.key === key))}
            >
              <Icon className="h-6 w-6 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">{label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-md font-medium text-gray-900 mb-4">Details</h3>

          {category === 'Shopping' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Shopping Type</label>
              <div className="flex gap-2">
                {shoppingSub.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`px-3 py-2 rounded-md border text-sm ${subcategory === opt ? 'border-green-600 text-green-700 bg-green-50' : 'border-gray-300 text-gray-700 bg-white'}`}
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
              <span className="text-sm text-gray-700">Sustainable option</span>
              <button
                type="button"
                className={`px-3 py-1 rounded-full border text-xs ${sustainable ? 'border-green-600 text-green-700 bg-green-50' : 'border-gray-300 text-gray-700 bg-white'}`}
                onClick={() => setSustainable(!sustainable)}
              >
                {sustainable ? 'Enabled' : 'Enable'}
              </button>
            </div>
          )}

          {step === 'providers' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Select Provider</span>
                <input
                  type="text"
                  placeholder="Search providers"
                  className="border rounded-md px-2 py-1 text-sm"
                  value={providerSearch}
                  onChange={(e) => setProviderSearch(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableProviders.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`px-3 py-2 rounded-md border text-sm text-left ${provider === p ? 'border-green-600 text-green-700 bg-green-50' : 'border-gray-300 text-gray-700 bg-white'}`}
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
              <div className="text-sm text-gray-600 mb-1">Provider</div>
              <div className="flex items-center justify-between bg-gray-50 border rounded-md px-3 py-2">
                <span className="text-sm font-medium text-gray-900">{provider}</span>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:text-blue-800"
                  onClick={() => setStep('providers')}
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {selected === 'upi_qr' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">UPI QR Code Text</label>
              <textarea
                className="border rounded-md w-full px-3 py-2 text-sm h-24"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
              <input
                type="text"
                className="border rounded-md w-full px-3 py-2 text-sm"
                placeholder="example@bank"
                value={upiId}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  setUpiId(val);
                  setProvider(val);
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Enter the recipient UPI ID (e.g., merchant@upi). This is simulated and will be recorded with the payment.</p>
            </div>
          )}

          {/* Simulated account details (mimic typical provider forms) */}
          {category && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {(subcategory === 'Electricity' || category === 'Utilities') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consumer Number</label>
                    <input className="border rounded-md w-full px-3 py-2 text-sm" placeholder="e.g., 1234567890" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Billing Unit</label>
                    <input className="border rounded-md w-full px-3 py-2 text-sm" placeholder="e.g., 4402" />
                  </div>
                </>
              )}
              {category === 'Gas' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Connection ID</label>
                    <input className="border rounded-md w-full px-3 py-2 text-sm" placeholder="e.g., 9876543210" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registered Mobile</label>
                    <input className="border rounded-md w-full px-3 py-2 text-sm" placeholder="e.g., 9999999999" />
                  </div>
                </>
              )}
              {category === 'Travel' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Travel Mode</label>
                    <select
                      className="border rounded-md w-full px-3 py-2 text-sm"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">PNR/Booking ID</label>
                    <input className="border rounded-md w-full px-3 py-2 text-sm" placeholder="e.g., ABC1234567" />
                  </div>
                </>
              )}
              {category === 'Shopping' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                    <input className="border rounded-md w-full px-3 py-2 text-sm" placeholder="e.g., ORD-001234" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Merchant</label>
                    <select
                      className="border rounded-md w-full px-3 py-2 text-sm"
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

          <div className="mb-4">{renderPresets()}</div>

          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (INR)</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                id="amount"
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              id="contact"
              className="focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              placeholder="9999999999"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          <button
            onClick={payNow}
            disabled={loading || !category}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
          <p className="text-xs text-center text-gray-500 mt-2">Secured by Razorpay</p>
        </div>
      </main>
    </div>
  );
};

export default PaymentsHub;
