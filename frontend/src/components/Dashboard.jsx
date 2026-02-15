import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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

    const carbon = summary?.carbon_summary || { total_carbon: 0, monthly_carbon: 0, daily_average: 0 };
    const carbonSaved = summary?.carbon_saved ?? summary?.total_carbon_saved ?? 0;
    const impactTotal = carbon.total_carbon + carbonSaved;
    const savedPercent = impactTotal > 0 ? Math.round((carbonSaved / impactTotal) * 100) : 0;
    const emissionPercent = impactTotal > 0 ? 100 - savedPercent : 0;
    const points = summary?.eco_points_balance || { total_points: 0, lifetime_points: 0 };
    const todaySpend = summary?.recent_transactions?.[0]?.amount
        ? Math.round(summary.recent_transactions[0].amount / 100)
        : 0;
    const totalSpend = summary?.total_spent ? Math.round(summary.total_spent / 100) : 0;
    const challengesPending = summary?.challenges ? summary.challenges.filter(c => !c.completed).length : 0;

    return (
        <div className="min-h-screen bg-emerald-50 text-slate-900 selection:bg-emerald-200 flex">
            <aside className="hidden md:flex w-64 flex-col bg-white/95 border-r border-emerald-100 shadow-sm relative z-10">
                <div className="flex items-center px-6 pt-6 pb-4">
                    <div className="h-10 w-10 rounded-3xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-emerald-500/25">
                        <Leaf className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="ml-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800">EcoCent</div>
                        <div className="text-sm font-semibold text-slate-900">User Dashboard</div>
                    </div>
                </div>
                <div className="px-6 pb-4">
                    <div className="flex items-center">
                        <div className="h-11 w-11 rounded-full bg-emerald-500/10 flex items-center justify-center text-sm font-semibold text-emerald-700">
                            {(user?.full_name || user?.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                            <div className="text-sm font-semibold text-slate-900 truncate max-w-[140px]">
                                {user?.full_name || user?.email}
                            </div>
                            <div className="text-[11px] text-emerald-700">Eco Saver</div>
                        </div>
                    </div>
                </div>
                <nav className="mt-2 px-4 space-y-1 text-sm">
                    <button
                        type="button"
                        className="w-full flex items-center px-3 py-2 rounded-[999px] bg-slate-900 text-slate-50 font-medium shadow-sm"
                    >
                        <span className="h-2 w-2 rounded-full bg-emerald-400 mr-2" />
                        Dashboard
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/pay')}
                        className="w-full flex items-center px-3 py-2 rounded-[999px] text-slate-700 hover:bg-emerald-50"
                    >
                        <Building2 className="h-4 w-4 mr-2 text-emerald-500" />
                        Wallet & UPI
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(company ? '/company/dashboard' : '/company/login')}
                        className="w-full flex items-center px-3 py-2 rounded-[999px] text-slate-700 hover:bg-emerald-50"
                    >
                        <Building2 className="h-4 w-4 mr-2 text-emerald-500" />
                        Merchant Portal
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(admin ? '/admin/panel' : '/admin/login')}
                        className="w-full flex items-center px-3 py-2 rounded-[999px] text-slate-700 hover:bg-emerald-50"
                    >
                        <Shield className="h-4 w-4 mr-2 text-emerald-500" />
                        Admin
                    </button>
                </nav>
                <div className="mt-auto px-4 pb-5">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-3 py-2 rounded-[999px] text-slate-950 bg-amber-400 hover:bg-amber-500 text-xs font-semibold shadow-sm"
                    >
                        <LogOut className="h-3.5 w-3.5 mr-2" />
                        Exit
                    </button>
                </div>
            </aside>
            <div className="flex-1 relative overflow-hidden">
                <div
                    className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle_at 20% 0, rgba(16,185,129,0.24), transparent 60%), radial-gradient(circle_at 80% 10%, rgba(245,158,11,0.18), transparent 55%), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\' viewBox=\'0 0 160 160\'%3E%3Cfilter id=\'n\' x=\'0\' y=\'0\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'noStitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.3\'/%3E%3C/svg%3E")'
                    }}
                />
                <main className="relative max-w-6xl mx-auto py-8 px-4 sm:px-7 lg:px-10 space-y-7">
                    <div className="flex items-baseline justify-between gap-3">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800">
                                Performance
                            </div>
                            <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                                Your Eco Engagement
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                            <User className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                            <span className="truncate max-w-[180px]">{user?.full_name || user?.email}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="relative rounded-[26px] bg-slate-900 text-slate-50 px-6 pt-6 pb-7 shadow-[0_20px_70px_rgba(15,23,42,0.7)] overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(16,185,129,0.35),transparent_60%),radial-gradient(circle_at_120%_-10%,rgba(245,158,11,0.2),transparent_55%)] opacity-80" />
                            <div className="relative flex flex-col h-full">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-xs uppercase tracking-[0.18em] text-emerald-300/90">
                                            Impact Split
                                        </div>
                                        <div className="mt-2 flex items-end space-x-6">
                                            <div>
                                                <div className="text-3xl font-extrabold">{savedPercent}%</div>
                                                <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-300 mt-1">
                                                    Savings
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-semibold">{emissionPercent}%</div>
                                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400 mt-1">
                                                    Emissions
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl bg-slate-900/40 border border-emerald-500/30 px-3 py-2 text-xs">
                                        <div className="text-[10px] text-emerald-200 uppercase tracking-[0.22em]">
                                            Carbon Today
                                        </div>
                                        <div className="mt-1 text-sm font-semibold">
                                            {carbon.daily_average.toFixed ? carbon.daily_average.toFixed(2) : carbon.daily_average}{' '}
                                            kg
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-3 text-[12px]">
                                    <div className="flex items-center">
                                        <div className="h-6 w-6 rounded-full bg-emerald-500/15 flex items-center justify-center mr-3">
                                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Eco spending tracked</div>
                                            <div className="text-xs text-emerald-200/90">
                                                ₹{totalSpend.toLocaleString('en-IN')} across all categories
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="h-6 w-6 rounded-full bg-sky-500/15 flex items-center justify-center mr-3">
                                            <span className="h-2 w-2 rounded-full bg-sky-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Deposit programs</div>
                                            <div className="text-xs text-slate-300">
                                                {points.total_points} eco points available for rewards
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="h-6 w-6 rounded-full bg-amber-500/15 flex items-center justify-center mr-3">
                                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Cashback programs</div>
                                            <div className="text-xs text-slate-300">
                                                {challengesPending} challenges still open this week
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.05 }}
                            className="relative rounded-[26px] bg-gradient-to-br from-sky-100 via-sky-200 to-emerald-100 px-6 pt-6 pb-7 shadow-[0_20px_60px_rgba(56,189,248,0.45)] overflow-hidden"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs uppercase tracking-[0.18em] text-sky-700">Activity</div>
                                    <div className="mt-1 text-sm text-sky-900">
                                        Your data updates every 3 hours
                                    </div>
                                </div>
                                <div className="text-xs bg-white/80 rounded-full px-3 py-1 shadow-sm border border-sky-100">
                                    This Month
                                </div>
                            </div>
                            <div className="mt-6 relative h-40">
                                <div className="absolute inset-x-0 bottom-4 h-28 bg-gradient-to-t from-sky-300/70 via-sky-200/40 to-transparent rounded-[999px]" />
                                <div className="absolute inset-x-6 bottom-5 h-24 flex items-end justify-between text-[10px] text-sky-800">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                        <div key={d} className="flex flex-col items-center flex-1">
                                            <div className="relative w-full flex-1 flex items-end justify-center">
                                                <div className="w-1.5 rounded-full bg-sky-500/60 h-1/2" />
                                            </div>
                                            <span className="mt-2">{d}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute left-1/2 top-6 -translate-x-1/2 flex flex-col items-center">
                                    <div className="h-9 w-9 rounded-full bg-white shadow-lg flex items-center justify-center border border-sky-200">
                                        <span className="text-[11px] font-semibold text-sky-700">
                                            {summary?.transaction_count ?? 0}
                                        </span>
                                    </div>
                                    <div className="mt-1 text-[11px] text-sky-900 font-medium">
                                        tx this month
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.08 }}
                        className="mt-1 rounded-[26px] bg-gradient-to-r from-amber-50 via-emerald-50 to-sky-50 px-6 pt-5 pb-6 border border-emerald-100/60 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-xs uppercase tracking-[0.2em] text-amber-700">
                                    Engagement
                                </div>
                                <div className="mt-1 text-sm text-emerald-900">
                                    General stats of your eco engagement processes
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="rounded-2xl bg-white/90 border border-amber-100 px-4 py-3 shadow-sm">
                                <div className="text-[11px] text-amber-700 font-medium">This Day</div>
                                <div className="mt-2 text-xl font-semibold text-slate-900">
                                    ₹{todaySpend.toLocaleString('en-IN')}
                                </div>
                            </div>
                            <div className="rounded-2xl bg-white/90 border border-emerald-100 px-4 py-3 shadow-sm">
                                <div className="text-[11px] text-emerald-700 font-medium">This Month</div>
                                <div className="mt-2 text-xl font-semibold text-slate-900">
                                    {carbon.monthly_carbon} kg
                                </div>
                            </div>
                            <div className="rounded-2xl bg-white/90 border border-sky-100 px-4 py-3 shadow-sm">
                                <div className="text-[11px] text-sky-700 font-medium">Eco Points</div>
                                <div className="mt-2 text-xl font-semibold text-slate-900">
                                    {points.total_points}
                                </div>
                            </div>
                            <div className="rounded-2xl bg-emerald-500 text-slate-950 px-4 py-3 shadow-sm">
                                <div className="text-[11px] font-medium">New Metrics</div>
                                <div className="mt-2 text-xl font-semibold">
                                    {carbon.total_carbon} kg
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.12 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-7"
                    >
                        <div className="lg:col-span-2 space-y-6">
                            <ErrorBoundary>
                                <TransactionList transactions={summary?.recent_transactions} />
                            </ErrorBoundary>
                            <ErrorBoundary>
                                <RewardsList rewards={summary?.recent_rewards} />
                            </ErrorBoundary>
                        </div>
                        <div className="space-y-5 lg:pt-1">
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
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
