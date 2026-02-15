import React from 'react';
import { Award } from 'lucide-react';

const BadgesList = ({ badges }) => {
    if (!badges || badges.length === 0) {
        return (
            <div className="relative text-center py-8 rounded-xl">
                <div className="absolute -inset-px rounded-xl bg-[radial-gradient(circle_at_0_0,rgba(148,163,184,0.6),transparent_55%),radial-gradient(circle_at_120%_120%,rgba(16,185,129,0.45),transparent_60%)] opacity-80" />
                <div className="relative bg-slate-900/80 rounded-xl shadow-[0_18px_50px_rgba(16,185,129,0.35)] border border-white/10 backdrop-blur-xl">
                <Award className="mx-auto h-9 w-9 text-emerald-400" />
                <h3 className="mt-3 text-sm font-medium text-slate-100">No badges yet</h3>
                <p className="mt-2 text-xs text-slate-400">Hit streaks and milestones to unlock your first badge.</p>
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
                    <Award className="h-4.5 w-4.5 mr-2 text-emerald-400" />
                    Badges
                </h3>
                <span className="text-[11px] text-slate-400">Achievements</span>
            </div>
            <ul className="divide-y divide-slate-800/80">
                {badges.map((b) => (
                    <li key={b.id} className="px-4 py-3.5 sm:px-6 hover:bg-slate-900/80 transition duration-150 ease-in-out">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-emerald-500/15 flex items-center justify-center">
                                    <Award className="h-4.5 w-4.5 text-emerald-400" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-slate-50">
                                        {b.name}
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        {b.description || b.code}
                                    </div>
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wide rounded px-1.5 py-0.5 border border-slate-600/80 bg-slate-900/60">
                                {b.code}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            </div>
        </div>
    );
};

export default BadgesList;
