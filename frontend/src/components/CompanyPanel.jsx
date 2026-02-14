import React, { useEffect, useState } from 'react';
import { useCompanyAuth } from '../context/CompanyAuthContext';
import api from '../api/axios';
import { Building2, Wallet, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompanyPanel = () => {
  const { company, logoutCompany, connectWallet } = useCompanyAuth();
  const [wallet, setWallet] = useState('');
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

  const handleConnect = async () => {
    try {
      await connectWallet(wallet);
    } catch {}
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-indigo-600" />
            <span className="font-semibold text-gray-900">Company Portal</span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-gray-700" onClick={() => navigate('/company/dashboard')}>Dashboard</button>
            <button className="text-gray-700" onClick={() => navigate('/marketplace')}>Marketplace</button>
            <button className="text-gray-700" onClick={logoutCompany}>Logout</button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-8 px-4 space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Company</h2>
          <div className="text-gray-700">Email: {company.email}</div>
          <div className="text-gray-700">Wallet: {company.wallet_address || 'Not connected'}</div>
          <div className="mt-4 flex">
            <input
              type="text"
              placeholder="0x..."
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              className="flex-1 border rounded-l px-3 py-2"
            />
            <button onClick={handleConnect} className="bg-indigo-600 text-white px-4 rounded-r flex items-center">
              <Wallet className="h-4 w-4 mr-2" /> Connect Wallet
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Marketplace Listings</h2>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.map(l => (
                <div key={l.id} className="border rounded-lg p-4">
                  <div className="text-gray-800 font-medium">Listing #{l.id}</div>
                  <div className="text-gray-600">Credits: {l.credit_amount}</div>
                  <div className="text-gray-600">Price/Credit: {l.price_per_credit}</div>
                  <div className="text-gray-600">Seller: {l.seller_user_id}</div>
                  <button onClick={() => purchase(l)} className="mt-3 bg-green-600 text-white px-3 py-2 rounded flex items-center">
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
