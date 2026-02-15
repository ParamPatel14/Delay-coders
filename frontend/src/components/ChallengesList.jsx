import React from 'react';
import { Flag } from 'lucide-react';

const ChallengesList = ({ challenges }) => {
    if (!challenges || challenges.length === 0) {
        return (
            <div className="text-center py-8 bg-slate-900/80 rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.6)] border border-slate-800">
                <Flag className="mx-auto h-9 w-9 text-emerald-400" />
                <h3 className="mt-3 text-sm font-medium text-slate-100">No challenges yet</h3>
                <p className="mt-2 text-xs text-slate-400">We will surface personalised impact streaks and goals here.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/80 shadow-[0_12px_36px_rgba(15,23,42,0.7)] overflow-hidden sm:rounded-[20px] border border-slate-800">
            <div className="px-4 py-4 sm:px-6 flex justify-between items-center bg-slate-900/60 border-b border-slate-800">
                <h3 className="text-sm leading-6 font-semibold text-slate-50 flex items-center">
                    <Flag className="h-4.5 w-4.5 mr-2 text-emerald-400" />
                    Challenges
                </h3>
                <span className="text-[11px] text-slate-400">Progress</span>
            </div>
            <ul className="divide-y divide-slate-800/80">
                {challenges.map((c) => {
                    const pct = Math.min(100, Math.round((c.progress_value / c.goal_value) * 100));
                    return (
                        <li key={c.id} className="px-4 py-3.5 sm:px-6 hover:bg-slate-900 transition duration-150 ease-in-out">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-slate-50">{c.name}</div>
                                    <div className="text-[11px] text-slate-400">{c.description || c.code}</div>
                                    <div className="mt-2 w-full bg-slate-800 rounded-full h-2">
                                        <div className={`h-2 rounded-full ${c.completed ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-1">
                                        {c.progress_value} / {c.goal_value} • Reward {c.reward_points} pts
                                    </div>
                                </div>
                                <div className={`text-[11px] px-2 inline-flex leading-5 font-semibold rounded-full ${c.completed ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
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
