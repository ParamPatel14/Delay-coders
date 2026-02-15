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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-xl bg-indigo-600 p-2 ring-4 ring-indigo-100">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <div className="text-gray-900 font-semibold">Admin Panel</div>
              <div className="text-sm text-gray-500">{admin.email} • {admin.role}</div>
            </div>
          </div>
          <button onClick={() => { logoutAdmin(); navigate('/dashboard'); }} className="px-3 py-2 rounded-md bg-red-600 text-white flex items-center">
            <Power className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-gray-700 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Users</h2>
            </div>
            <div className="divide-y">
              {users.map(u => (
                <div key={u.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-gray-900 font-medium">{u.email}</div>
                    <div className="text-sm text-gray-500">{u.full_name || 'No name'}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                    {u.is_active && (
                      <button onClick={() => suspendUser(u.id)} className="px-3 py-1 text-sm rounded-md border">
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {users.length === 0 && <div className="text-gray-500">No users.</div>}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <ListChecks className="h-5 w-5 text-gray-700 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Pending Listings</h2>
            </div>
            <div className="space-y-3">
              {pending.map(l => (
                <div key={l.id} className="border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-900 font-semibold">Listing #{l.id}</div>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">Pending</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Credits</div>
                    <div className="text-gray-900 font-medium">{l.credit_amount}</div>
                    <div className="text-gray-600">Price/Credit</div>
                    <div className="text-gray-900 font-medium">{l.price_per_credit}</div>
                    <div className="text-gray-600">Seller</div>
                    <div className="text-gray-900 font-medium">{l.seller_user_id}</div>
                  </div>
                  <div className="mt-3 flex items-center space-x-2 justify-end">
                    <button onClick={() => approveListing(l.id)} className="px-3 py-2 rounded-md bg-green-600 text-white flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                    <button onClick={() => rejectListing(l.id)} className="px-3 py-2 rounded-md bg-red-600 text-white flex items-center">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {pending.length === 0 && <div className="text-gray-500">No pending listings.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
