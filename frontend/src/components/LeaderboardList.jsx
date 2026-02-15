import React from 'react';
import { Users } from 'lucide-react';

const LeaderboardList = ({ entries }) => {
    if (!entries || entries.length === 0) {
        return (
            <div className="text-center py-8 bg-slate-900/80 rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.6)] border border-slate-800">
                <Users className="mx-auto h-9 w-9 text-slate-500" />
                <h3 className="mt-3 text-sm font-medium text-slate-100">No leaderboard data</h3>
                <p className="mt-2 text-xs text-slate-400">Once the community moves, you will see ranks here.</p>
            </div>
        );
    }
    return (
        <div className="bg-slate-900/80 shadow-[0_12px_36px_rgba(15,23,42,0.7)] overflow-hidden sm:rounded-[20px] border border-slate-800">
            <div className="px-4 py-4 sm:px-6 flex justify-between items-center bg-slate-900/60 border-b border-slate-800">
                <h3 className="text-sm leading-6 font-semibold text-slate-50 flex items-center">
                    <Users className="h-4.5 w-4.5 mr-2 text-emerald-400" />
                    Leaderboard
                </h3>
                <span className="text-[11px] text-slate-400">Top eco users</span>
            </div>
            <ul className="divide-y divide-slate-800/80">
                {entries.map((e, idx) => (
                    <li key={e.user_id} className="px-4 py-3.5 sm:px-6 hover:bg-slate-900 transition duration-150 ease-in-out">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-emerald-300">{idx + 1}</span>
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-slate-50">
                                        {e.full_name || e.email}
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        {e.level}
                                    </div>
                                </div>
                            </div>
                            <div className="text-sm font-bold text-emerald-300">
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
