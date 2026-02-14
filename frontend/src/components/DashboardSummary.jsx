import React from 'react';
import { Wallet, CreditCard, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
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

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard 
                title="Total Spent" 
                value={totalSpent} 
                icon={Wallet} 
                color="bg-green-500" 
            />
            <StatCard 
                title="Total Transactions" 
                value={summary.transaction_count} 
                icon={Activity} 
                color="bg-blue-500" 
            />
            {/* Placeholder for future stat */}
            <StatCard 
                title="Active Cards" 
                value="1" 
                icon={CreditCard} 
                color="bg-purple-500" 
            />
        </div>
    );
};

export default DashboardSummary;
