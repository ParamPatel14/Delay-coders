import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LogOut, User, Leaf, Building2, Shield, Coins, Sparkles } from 'lucide-react';
import { useCompanyAuth } from '../context/CompanyAuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { GlowRing } from '../ui/ring';
import { HoloBadge } from '../ui/badge';
import { Sparkline } from '../ui/sparkline';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const { company } = useCompanyAuth();
    const { admin } = useAdminAuth();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const fetchSummary = async () => {
        try {
            const response = await api.get('/dashboard/summary');
            setSummary(response.data);
        } catch (error) {
            console.error("Failed to fetch dashboard summary:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    // Removed inline Payment card; payments moved to dedicated /pay page

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Leaf className="h-8 w-8 text-green-600 mr-2" />
                            <span className="text-2xl font-semibold text-gray-900 tracking-tight">Eco<span className="text-green-600">Cent</span></span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-xl border border-gray-200">
                                <User className="h-4 w-4 mr-2 text-gray-500" />
                                {user?.full_name || user?.email}
                            </div>
                            <button
                                onClick={() => navigate(company ? '/company/panel' : '/company/login')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <Building2 className="h-4 w-4 mr-2" />
                                Company Portal
                            </button>
                            <button
                                onClick={() => navigate('/pay')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Payments
                            </button>
                            <button
                                onClick={() => navigate(admin ? '/admin/panel' : '/admin/login')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <Shield className="h-4 w-4 mr-2" />
                                Admin Portal
                            </button>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-colors"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
                    {!summary ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="h-40 rounded-xl border border-gray-200 bg-white animate-pulse" />
                            <div className="h-40 rounded-xl border border-gray-200 bg-white animate-pulse" />
                            <div className="h-40 rounded-xl border border-gray-200 bg-white animate-pulse" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <GlowRing
                                    value={Math.min(100, Math.round((summary.carbon_summary.total_carbon || 0) * 10))}
                                    label="Total Carbon Offset"
                                />
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Token Balance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Coins className="h-5 w-5 text-blue-600" />
                                            <div className="text-sm text-gray-600">Eco Points</div>
                                        </div>
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {summary.eco_points_balance?.total_points ?? 0}
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <Sparkles className="h-4 w-4 text-green-600" />
                                        <div className="mt-2">
                                            <Sparkline data={(summary.recent_rewards || []).map(r => r.points)} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="h-64 rounded-xl border border-gray-200 bg-white animate-pulse" />
                                ) : (
                                    <div className="space-y-3">
                                        {(summary?.recent_transactions || []).map(tx => (
                                            <div key={tx.id} className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2 bg-white">
                                                <div className="text-sm text-gray-600">{tx.description || 'Transaction'}</div>
                                                <div className="text-sm text-gray-900">
                                                    {(tx.amount/100).toLocaleString('en-IN', { style: 'currency', currency: tx.currency })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Carbon Records</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="h-64 rounded-xl border border-gray-200 bg-white animate-pulse" />
                                ) : (
                                    <div className="space-y-3">
                                        {(summary?.recent_carbon_records || []).map(cr => (
                                            <div key={cr.id} className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2 bg-white">
                                                <div className="text-sm text-gray-600">{cr.category}</div>
                                                <div className="text-sm text-gray-900">{cr.carbon_emission.toFixed(2)} kg CO₂</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <HoloBadge level={5} title="Earth Guardian" />
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Membership</span>
                                    <span className="font-semibold text-green-600">Active</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
