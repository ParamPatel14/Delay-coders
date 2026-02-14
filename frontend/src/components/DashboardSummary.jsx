import React from 'react';
import { Wallet, Cloud, Calendar, Leaf, Trophy, GaugeCircle, Medal, Flame } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
            <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                        <dd>
                            <div className="text-lg font-medium text-gray-900">{value}</div>
                            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
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

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
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
                subtext={`Saved: ${summary.total_carbon_saved || 0} kg`}
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
