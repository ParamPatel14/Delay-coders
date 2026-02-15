import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import api from '../api/axios';
import { Shield, Users, ListChecks, CheckCircle2, XCircle, Power } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const { admin, logoutAdmin } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    const load = async () => {
      try {
        const u = await api.get('/admin/users', { params: { token } });
        const p = await api.get('/admin/listings/pending', { params: { token } });
        setUsers(u.data);
        setPending(p.data);
      } catch (err) {
        setError('Failed to load admin data');
      }
    };
    load();
  }, [navigate]);

  const suspendUser = async (id) => {
    const token = localStorage.getItem('admin_token');
    await api.post(`/admin/users/${id}/suspend`, null, { params: { token } });
    setUsers(users.map(u => u.id === id ? { ...u, is_active: false } : u));
  };

  const approveListing = async (id) => {
    const token = localStorage.getItem('admin_token');
    await api.post(`/admin/listings/${id}/approve`, null, { params: { token } });
    setPending(pending.filter(l => l.id !== id));
  };

  const rejectListing = async (id) => {
    const token = localStorage.getItem('admin_token');
    await api.post(`/admin/listings/${id}/reject`, null, { params: { token } });
    setPending(pending.filter(l => l.id !== id));
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-7 lg:px-9 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-3xl bg-emerald-500/10 p-2 ring-4 ring-emerald-500/20">
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="ml-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Admin Panel</div>
              <div className="text-sm text-slate-50">{admin.email} • {admin.role}</div>
            </div>
          </div>
          <button
            onClick={() => { logoutAdmin(); navigate('/dashboard'); }}
            className="px-3 py-2 rounded-lg bg-amber-400 text-slate-950 flex items-center text-xs sm:text-sm font-semibold shadow-[0_10px_30px_rgba(245,158,11,0.45)] hover:bg-amber-500"
          >
            <Power className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-7 lg:px-9 py-9">
        {error && <div className="text-amber-300 mb-4 text-sm">{error}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.7)] border border-slate-800 px-5 pt-5 pb-6">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-emerald-300 mr-2" />
              <h2 className="text-base sm:text-lg font-semibold text-slate-50">Users</h2>
            </div>
            <div className="divide-y divide-slate-800/80">
              {users.map(u => (
                <div key={u.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-50">{u.email}</div>
                    <div className="text-[11px] text-slate-400">{u.full_name || 'No name'}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[11px] px-2 py-1 rounded-full ${
                      u.is_active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                    {u.is_active && (
                      <button
                        onClick={() => suspendUser(u.id)}
                        className="px-3 py-1 text-xs rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {users.length === 0 && <div className="py-3 text-sm text-slate-400">No users.</div>}
            </div>
          </div>
          <div className="bg-slate-900/80 rounded-[20px] shadow-[0_12px_36px_rgba(15,23,42,0.7)] border border-slate-800 px-5 pt-5 pb-6">
            <div className="flex items-center mb-4">
              <ListChecks className="h-5 w-5 text-emerald-300 mr-2" />
              <h2 className="text-base sm:text-lg font-semibold text-slate-50">Pending Listings</h2>
            </div>
            <div className="space-y-3">
              {pending.map(l => (
                <div key={l.id} className="border border-slate-800 rounded-2xl p-4 bg-slate-950/60">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-50">Listing #{l.id}</div>
                    <span className="text-[11px] px-2 py-1 rounded-full bg-amber-500/15 text-amber-300">Pending</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                    <div className="text-slate-400">Credits</div>
                    <div className="text-slate-50 font-medium">{l.credit_amount}</div>
                    <div className="text-slate-400">Price/Credit</div>
                    <div className="text-slate-50 font-medium">{l.price_per_credit}</div>
                    <div className="text-slate-400">Seller</div>
                    <div className="text-slate-50 font-medium">{l.seller_user_id}</div>
                  </div>
                  <div className="mt-3 flex items-center space-x-2 justify-end">
                    <button
                      onClick={() => approveListing(l.id)}
                      className="px-3 py-2 rounded-[20px] bg-emerald-500 text-slate-950 text-xs sm:text-sm font-semibold flex items-center hover:bg-emerald-400"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectListing(l.id)}
                      className="px-3 py-2 rounded-[20px] bg-amber-400 text-slate-950 text-xs sm:text-sm font-semibold flex items-center hover:bg-amber-500"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {pending.length === 0 && <div className="text-sm text-slate-400">No pending listings.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
