import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Wallet } from 'lucide-react';

const WalletConnect = () => {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const a = await api.get('/wallet/address');
      setAddress(a.data.address);
      if (a.data.address) {
        const b = await api.get('/wallet/eco-balance');
        setBalance(b.data);
      }
    } catch (e) {
      setError('Failed to load wallet info');
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const requestSwitchToAmoy = async () => {
    const amoyChainId = '0x13882';
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: amoyChainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: amoyChainId,
            chainName: 'Polygon Amoy',
            nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
            rpcUrls: ['https://rpc-amoy.polygon.technology'],
            blockExplorerUrls: ['https://amoy.polygonscan.com']
          }]
        });
      }
    }
  };

  const connect = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!window.ethereum) {
        setError('MetaMask not found');
        setLoading(false);
        return;
      }
      await requestSwitchToAmoy();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const addr = accounts[0];
      await api.put('/wallet/connect', { address: addr, provider: 'MetaMask', network: 'polygon-amoy' });
      setAddress(addr);
      const b = await api.get('/wallet/eco-balance');
      setBalance(b.data);
    } catch (e) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center mb-4">
        <Wallet className="h-5 w-5 text-gray-700 mr-2" />
        <h3 className="font-medium text-gray-900">Wallet</h3>
      </div>
      {address ? (
        <div className="space-y-2">
          <div className="text-sm text-gray-700">
            Connected: <span className="font-mono">{address}</span>
          </div>
          <div className="text-sm text-gray-700">
            ECO Balance: {balance ? `${balance.balance} ECO` : 'Loading...'}
          </div>
        </div>
      ) : (
        <button
          onClick={connect}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {loading ? 'Connecting...' : 'Connect MetaMask'}
        </button>
      )}
      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
    </div>
  );
};

export default WalletConnect;
