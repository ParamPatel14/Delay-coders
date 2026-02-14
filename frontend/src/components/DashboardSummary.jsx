import React from 'react';
import { Wallet, Cloud, Calendar, Leaf, Trophy, GaugeCircle, Medal, Flame, Coins } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
        <div className="p-6">
            <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-lg p-3 ${color} ring-4 ring-opacity-20 ring-white`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-600 truncate">{title}</dt>
                        <dd>
                            <div className="text-2xl font-semibold text-gray-900 leading-tight">{value}</div>
                            {subtext && <p className="text-sm text-gray-400 mt-1">{subtext}</p>}
                        </dd>
                    </dl>
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {/* Financial Stats */}
            <StatCard 
                title="Total Spent" 
                value={totalSpent} 
                icon={Wallet} 
                color="bg-green-600" 
            />
            
            {/* Carbon Stats */}
            <StatCard 
                title="Carbon Footprint" 
                value={`${carbon.total_carbon} kg CO₂`} 
                icon={Cloud} 
                color="bg-gray-700"
                subtext={`Saved: ${carbonSaved} kg`}
            />

            <StatCard 
                title="Monthly Emission" 
                value={`${carbon.monthly_carbon} kg CO₂`} 
                icon={Calendar} 
                color="bg-orange-500" 
                subtext={`Avg: ${carbon.daily_average} kg/day`}
            />
            <StatCard 
                title="Eco Points" 
                value={`${points.total_points} pts`} 
                icon={Trophy} 
                color="bg-indigo-600" 
                subtext={`Lifetime: ${points.lifetime_points} pts`}
            />
            <StatCard 
                title="Carbon Credits" 
                value={`${carbonCredits} CCT`} 
                icon={Coins} 
                color="bg-green-700" 
                subtext={`On-chain: ${carbonCreditTokens} CCT`}
            />
            <StatCard 
                title="Eco Score" 
                value={`${score.score || 0}/100`} 
                icon={GaugeCircle} 
                color="bg-teal-600" 
                subtext={`Sustainability score`}
            />
            <StatCard 
                title="Level" 
                value={userLevel.level} 
                icon={Medal} 
                color="bg-purple-600" 
                subtext={`Threshold: ${userLevel.points_required} pts`}
            />
            <StatCard 
                title="Streak" 
                value={`${streak.current_streak} days`} 
                icon={Flame} 
                color="bg-red-600" 
                subtext={`Longest: ${streak.longest_streak} days`}
            />
        </div>
    );
};

export default DashboardSummary;
