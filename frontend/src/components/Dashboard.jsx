import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LogOut, User, Leaf, Building2, Shield } from 'lucide-react';
import { useCompanyAuth } from '../context/CompanyAuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import DashboardSummary from './DashboardSummary';
import TransactionList from './TransactionList';
import RewardsList from './RewardsList';
import BadgesList from './BadgesList';
import ChallengesList from './ChallengesList';
import LeaderboardList from './LeaderboardList';
import ErrorBoundary from './ErrorBoundary';

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
        <div className="min-h-screen bg-[#030303] text-slate-50 selection:bg-emerald-500/30 relative overflow-hidden">
            <div
                className="pointer-events-none fixed inset-0 opacity-60 mix-blend-soft-light"
                style={{
                    backgroundImage:
                        'radial-gradient(circle_at 20% 0, rgba(16,185,129,0.24), transparent 60%), radial-gradient(circle_at 80% 10%, rgba(245,158,11,0.18), transparent 55%), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\' viewBox=\'0 0 160 160\'%3E%3Cfilter id=\'n\' x=\'0\' y=\'0\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'noStitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.3\'/%3E%3C/svg%3E")'
                }}
            />
            <nav className="relative border-b border-slate-800/80 bg-[#050505]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-7 lg:px-9">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-3xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-emerald-500/20">
                                <Leaf className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">EcoCent</div>
                                <div className="text-lg font-semibold text-slate-50">
                                    Personal Impact <span className="text-emerald-400">Dashboard</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center text-xs sm:text-sm font-medium text-slate-200 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700 shadow-[0_8px_22px_rgba(15,23,42,0.45)]">
                                <User className="h-3.5 w-3.5 mr-2 text-emerald-400" />
                                <span className="truncate max-w-[180px]">{user?.full_name || user?.email}</span>
                            </div>
                            <button
                                onClick={() => navigate(company ? '/company/panel' : '/company/login')}
                                className="hidden md:inline-flex items-center px-3 py-2 border border-slate-700 text-xs font-medium rounded-lg text-slate-100 bg-slate-900 hover:bg-slate-800 shadow-sm"
                            >
                                <Building2 className="h-3.5 w-3.5 mr-2 text-emerald-400" />
                                Company
                            </button>
                            <button
                                onClick={() => navigate('/pay')}
                                className="inline-flex items-center px-3.5 py-2 border border-emerald-500/60 text-xs font-semibold rounded-[20px] text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15 shadow-[0_14px_40px_rgba(16,185,129,0.45)]"
                            >
                                Payments
                            </button>
                            <button
                                onClick={() => navigate(admin ? '/admin/panel' : '/admin/login')}
                                className="hidden lg:inline-flex items-center px-3 py-2 border border-slate-700 text-xs font-medium rounded-lg text-slate-100 bg-slate-900 hover:bg-slate-800 shadow-sm"
                            >
                                <Shield className="h-3.5 w-3.5 mr-2 text-emerald-400" />
                                Admin
                            </button>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-lg text-slate-900 bg-amber-400 hover:bg-amber-500 shadow-[0_10px_30px_rgba(245,158,11,0.45)]"
                            >
                                <LogOut className="h-3.5 w-3.5 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative max-w-7xl mx-auto py-9 px-4 sm:px-7 lg:px-9">
                <div className="mb-7">
                    <div className="flex items-baseline justify-between gap-3">
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-50">Portfolio Overview</h2>
                        <p className="text-xs text-slate-400 tracking-wide">Live sync from your eco-payments activity</p>
                    </div>
                    <div className="mt-4">
                        {loading || !summary ? (
                            <div className="relative rounded-[26px] p-[1px] bg-[radial-gradient(circle_at_0_0,rgba(16,185,129,0.35),transparent_55%),radial-gradient(circle_at_100%_0,rgba(56,189,248,0.18),transparent_55%)]">
                                <div className="bg-[#050505]/85 backdrop-blur-xl rounded-[24px] border border-white/10 shadow-[0_24px_80px_rgba(16,185,129,0.45)]">
                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 px-5 pt-5 pb-6">
                                        <div className="h-32 rounded-2xl bg-slate-900/80 border border-slate-800 animate-pulse" />
                                        <div className="h-32 rounded-[20px] bg-slate-900/80 border border-slate-800 animate-pulse" />
                                        <div className="h-32 rounded-2xl bg-slate-900/80 border border-slate-800 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative rounded-[26px] p-[1px] bg-[radial-gradient(circle_at_0_0,rgba(16,185,129,0.38),transparent_58%),radial-gradient(circle_at_120%_-10%,rgba(245,158,11,0.32),transparent_60%)] shadow-[0_40px_120px_rgba(16,185,129,0.35)]">
                                <div className="bg-[#050505]/85 backdrop-blur-xl rounded-[24px] border border-white/10 shadow-[0_24px_80px_rgba(15,118,110,0.65)]">
                                    <ErrorBoundary>
                                        <DashboardSummary summary={summary} />
                                    </ErrorBoundary>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
                    <div className="lg:col-span-2 space-y-6">
                        <ErrorBoundary>
                            <TransactionList transactions={summary?.recent_transactions} />
                        </ErrorBoundary>
                        <ErrorBoundary>
                            <RewardsList rewards={summary?.recent_rewards} />
                        </ErrorBoundary>
                    </div>

                    <div className="space-y-5 lg:pt-3">
                        <ErrorBoundary>
                            <BadgesList badges={summary?.badges} />
                        </ErrorBoundary>
                        <ErrorBoundary>
                            <ChallengesList challenges={summary?.challenges} />
                        </ErrorBoundary>
                        <ErrorBoundary>
                            <LeaderboardList entries={summary?.leaderboard} />
                        </ErrorBoundary>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
