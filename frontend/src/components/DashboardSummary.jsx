import React from 'react';
import { Wallet, Cloud, Calendar, Leaf, Trophy, GaugeCircle, Medal, Flame, Coins } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtext, offset, intense }) => (
    <div className={`relative ${offset || ''}`}>
        {intense && (
            <div className="pointer-events-none absolute -inset-0.5 rounded-[22px] bg-[radial-gradient(circle_at_20%_0,rgba(16,185,129,0.55),transparent_55%),radial-gradient(circle_at_80%_120%,rgba(245,158,11,0.4),transparent_60%)] opacity-80 blur-2xl" />
        )}
        <div className="relative rounded-[22px] p-[1px] bg-[radial-gradient(circle_at_0_0,rgba(148,163,184,0.55),transparent_55%),radial-gradient(circle_at_100%_0,rgba(16,185,129,0.45),transparent_55%)]">
            <div className="bg-[#030712]/90 backdrop-blur-xl overflow-hidden rounded-[20px] border border-white/10 shadow-[0_24px_80px_rgba(15,118,110,0.55)]">
                <div className="px-5 pt-4 pb-5">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center">
                            <div className={`flex-shrink-0 rounded-lg p-3 ${color} ring-4 ring-emerald-500/15`}>
                                <Icon className="h-5 w-5 text-slate-950" />
                            </div>
                            <div className="ml-4">
                                <dl>
                                    <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 truncate">{title}</dt>
                                    <dd>
                                        <div
                                            className="mt-1 text-xl font-semibold text-slate-50 leading-tight font-mono tracking-tight"
                                            style={{
                                                fontFamily:
                                                    '"Space Mono","JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace'
                                            }}
                                        >
                                            {value}
                                        </div>
                                        {subtext && <p className="text-xs text-slate-400 mt-1.5 tracking-wide">{subtext}</p>}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const DashboardSummary = ({ summary }) => {
    if (!summary) return null;

    // Convert paisa to Rupee
    const totalSpent = (summary.total_spent / 100).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
    });

    const carbon = summary.carbon_summary || { total_carbon: 0, monthly_carbon: 0, daily_average: 0 };

    const points = summary.eco_points_balance || { total_points: 0, lifetime_points: 0 };
    const score = summary.eco_score || { score: 0 };
    const userLevel = summary.user_level || { level: 'Beginner', points_required: 0 };
    const streak = summary.streak || { current_streak: 0, longest_streak: 0 };
    const carbonSaved = summary.carbon_saved ?? summary.total_carbon_saved ?? 0;
    const carbonCredits = summary.carbon_credits ?? 0;
    const carbonCreditTokens = summary.carbon_credit_tokens ?? 0;

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            <StatCard 
                title="Total Spent" 
                value={totalSpent} 
                icon={Wallet} 
                color="bg-emerald-400" 
            />

            <StatCard 
                title="Carbon Footprint" 
                value={`${carbon.total_carbon} kg CO₂`} 
                icon={Cloud} 
                color="bg-emerald-500/90"
                subtext={`Saved ${carbonSaved} kg • Net impact`}
            />

            <StatCard 
                title="Monthly Emission" 
                value={`${carbon.monthly_carbon} kg CO₂`} 
                icon={Calendar} 
                color="bg-slate-200" 
                subtext={`Avg ${carbon.daily_average} kg/day`}
            />
            <StatCard 
                title="Eco Points" 
                value={`${points.total_points} pts`} 
                icon={Trophy} 
                color="bg-amber-400" 
                subtext={`Lifetime ${points.lifetime_points} pts`}
                offset="md:-mt-2"
            />
            <StatCard 
                title="Carbon Credits" 
                value={`${carbonCredits} CCT`} 
                icon={Coins} 
                color="bg-emerald-300" 
                subtext={`On-chain ${carbonCreditTokens} CCT`}
            />
            <StatCard 
                title="Eco Score" 
                value={`${score.score || 0}/100`} 
                icon={GaugeCircle} 
                color="bg-slate-300" 
                subtext="Sustainability score"
                offset="md:mt-3"
                intense
            />
            <StatCard 
                title="Level" 
                value={userLevel.level} 
                icon={Medal} 
                color="bg-emerald-200" 
                subtext={`Threshold ${userLevel.points_required} pts`}
            />
            <StatCard 
                title="Streak" 
                value={`${streak.current_streak} days`} 
                icon={Flame} 
                color="bg-amber-300" 
                subtext={`Longest ${streak.longest_streak} days`}
                offset="md:mt-4"
            />
        </div>
    );
};

export default DashboardSummary;
