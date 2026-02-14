import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Coins } from 'lucide-react';

const TokensPanel = () => {
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [awardLoading, setAwardLoading] = useState(false);
  const [convertible, setConvertible] = useState(null);

  const load = async () => {
    setError(null);
    try {
      const b = await api.get('/tokens/balance');
      setBalance(b.data);
      const h = await api.get('/tokens/history');
      setHistory(h.data);
      const c = await api.get('/eco-points/convertible');
      setConvertible(c.data);
    } catch (e) {
      setError('Failed to load token info');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const convert = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/eco-points/convert', {});
      await load();
      alert(`Minted: ${res.data.token_amount} ECO\nTx: ${res.data.tx_hash}`);
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Conversion failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const awardDemo = async () => {
    setAwardLoading(true);
    setError(null);
    try {
      await api.post('/eco-points/award-demo', { points: 50 });
      await load();
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Award failed';
      setError(msg);
    } finally {
      setAwardLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center mb-4">
        <Coins className="h-5 w-5 text-gray-700 mr-2" />
        <h3 className="font-medium text-gray-900">ECO Tokens</h3>
      </div>
      <div className="text-sm text-gray-700 mb-3">
        Balance: {balance ? `${balance.eco_tokens} ECO` : 'Loading...'}
      </div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={convert}
          disabled={loading || (convertible && convertible.points_available === 0)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          {loading ? 'Converting...' : `Convert Available${convertible ? ` (${convertible.points_available})` : ''}`}
        </button>
        <button
          onClick={awardDemo}
          disabled={awardLoading}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          {awardLoading ? 'Awarding...' : 'Earn Demo Points'}
        </button>
      </div>
      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
      {!error && convertible && convertible.points_available === 0 && (
        <div className="text-sm text-gray-600 mb-3">No convertible points (threshold {convertible.threshold})</div>
      )}
      <div>
        <div className="font-medium text-gray-900 mb-2">Mint History</div>
        <div className="space-y-2 max-h-40 overflow-auto">
          {history.length === 0 ? (
            <div className="text-sm text-gray-500">No mints yet</div>
          ) : history.map((item) => (
            <div key={item.tx_hash} className="text-sm text-gray-700 flex justify-between">
              <span>{item.token_amount} ECO</span>
              <a className="text-blue-600 hover:text-blue-800" href={`https://amoy.polygonscan.com/tx/${item.tx_hash}`} target="_blank" rel="noreferrer">
                View
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TokensPanel;
