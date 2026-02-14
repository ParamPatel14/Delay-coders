import React from 'react';
import { format } from 'date-fns';
import { Trophy } from 'lucide-react';

const RewardsList = ({ rewards }) => {
    if (!rewards || rewards.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-lg shadow">
                <Trophy className="mx-auto h-12 w-12 text-indigo-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No rewards yet</h3>
                <p className="mt-1 text-sm text-gray-500">Earn eco points through sustainable activity.</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-indigo-600" />
                    Eco Rewards
                </h3>
                <span className="text-xs text-gray-500">Recent bonuses</span>
            </div>
            <ul className="divide-y divide-gray-200">
                {rewards.map((reward) => (
                    <li key={reward.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <Trophy className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 capitalize">
                                        {reward.action_type.toLowerCase()}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {reward.description || 'Reward'} • {format(new Date(reward.created_at), 'MMM d, h:mm a')}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-sm font-bold text-indigo-700">
                                    +{reward.points} pts
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RewardsList;
