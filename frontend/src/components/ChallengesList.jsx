import React from 'react';
import { Flag } from 'lucide-react';

const ChallengesList = ({ challenges }) => {
    if (!challenges || challenges.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-lg shadow">
                <Flag className="mx-auto h-12 w-12 text-blue-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No challenges</h3>
                <p className="mt-1 text-sm text-gray-500">Challenges will appear here.</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <Flag className="h-5 w-5 mr-2 text-blue-600" />
                    Challenges
                </h3>
                <span className="text-xs text-gray-500">Progress</span>
            </div>
            <ul className="divide-y divide-gray-200">
                {challenges.map((c) => {
                    const pct = Math.min(100, Math.round((c.progress_value / c.goal_value) * 100));
                    return (
                        <li key={c.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{c.name}</div>
                                    <div className="text-xs text-gray-500">{c.description || c.code}</div>
                                    <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
                                        <div className={`h-2 rounded-full ${c.completed ? 'bg-green-600' : 'bg-blue-600'}`} style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {c.progress_value} / {c.goal_value} • Reward {c.reward_points} pts
                                    </div>
                                </div>
                                <div className={`text-xs px-2 inline-flex leading-5 font-semibold rounded-full ${c.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {c.completed ? 'Completed' : 'In Progress'}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ChallengesList;
