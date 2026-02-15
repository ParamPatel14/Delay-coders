import React from 'react';
import { Users } from 'lucide-react';

const LeaderboardList = ({ entries }) => {
    if (!entries || entries.length === 0) {
        return (
            <div className="relative text-center py-8 rounded-xl">
                <div className="absolute -inset-px rounded-xl bg-[radial-gradient(circle_at_0_0,rgba(148,163,184,0.6),transparent_55%),radial-gradient(circle_at_120%_120%,rgba(16,185,129,0.45),transparent_60%)] opacity-80" />
                <div className="relative bg-slate-900/80 rounded-xl shadow-[0_18px_50px_rgba(16,185,129,0.35)] border border-white/10 backdrop-blur-xl">
                <Users className="mx-auto h-9 w-9 text-slate-500" />
                <h3 className="mt-3 text-sm font-medium text-slate-100">No leaderboard data</h3>
                <p className="mt-2 text-xs text-slate-400">Once the community moves, you will see ranks here.</p>
                </div>
            </div>
        );
    }
    return (
        <div className="relative sm:rounded-[22px]">
            <div className="absolute -inset-px rounded-[22px] bg-[radial-gradient(circle_at_0_0,rgba(148,163,184,0.6),transparent_55%),radial-gradient(circle_at_120%_0,rgba(16,185,129,0.45),transparent_60%)] opacity-80" />
            <div className="bg-slate-950/85 shadow-[0_20px_70px_rgba(16,185,129,0.36)] overflow-hidden sm:rounded-[20px] border border-white/10 backdrop-blur-xl">
            <div className="px-4 py-4 sm:px-6 flex justify-between items-center bg-slate-900/60 border-b border-white/10">
                <h3 className="text-sm leading-6 font-semibold text-slate-50 flex items-center">
                    <Users className="h-4.5 w-4.5 mr-2 text-emerald-400" />
                    Leaderboard
                </h3>
                <span className="text-[11px] text-slate-400">Top eco users</span>
            </div>
            <ul className="divide-y divide-slate-800/80">
                {entries.map((e, idx) => (
                    <li key={e.user_id} className="px-4 py-3.5 sm:px-6 hover:bg-slate-900/80 transition duration-150 ease-in-out">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-[0_0_18px_rgba(16,185,129,0.4)]">
                                    <span className="text-sm font-semibold text-emerald-300 font-mono">{idx + 1}</span>
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
                            <div className="text-sm font-bold text-emerald-300 font-mono tracking-tight">
                                {e.lifetime_points} pts
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            </div>
        </div>
    );
};

export default LeaderboardList;
