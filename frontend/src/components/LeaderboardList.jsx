import React from 'react';
import { Users } from 'lucide-react';

const LeaderboardList = ({ entries }) => {
    if (!entries || entries.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-lg shadow">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No leaderboard data</h3>
                <p className="mt-1 text-sm text-gray-500">Make eco activity to appear here.</p>
            </div>
        );
    }
    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-gray-600" />
                    Leaderboard
                </h3>
                <span className="text-xs text-gray-500">Top eco users</span>
            </div>
            <ul className="divide-y divide-gray-200">
                {entries.map((e, idx) => (
                    <li key={e.user_id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-gray-700">{idx + 1}</span>
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                        {e.full_name || e.email}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {e.level}
                                    </div>
                                </div>
                            </div>
                            <div className="text-sm font-bold text-gray-800">
                                {e.lifetime_points} pts
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LeaderboardList;
