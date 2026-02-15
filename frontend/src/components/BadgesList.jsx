import React from 'react';
import { Award } from 'lucide-react';

const BadgesList = ({ badges }) => {
    if (!badges || badges.length === 0) {
        return (
            <div className="text-center py-8 bg-slate-900/80 rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.6)] border border-slate-800">
                <Award className="mx-auto h-9 w-9 text-emerald-400" />
                <h3 className="mt-3 text-sm font-medium text-slate-100">No badges yet</h3>
                <p className="mt-2 text-xs text-slate-400">Hit streaks and milestones to unlock your first badge.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/80 shadow-[0_12px_36px_rgba(15,23,42,0.7)] overflow-hidden sm:rounded-[20px] border border-slate-800">
            <div className="px-4 py-4 sm:px-6 flex justify-between items-center bg-slate-900/60 border-b border-slate-800">
                <h3 className="text-sm leading-6 font-semibold text-slate-50 flex items-center">
                    <Award className="h-4.5 w-4.5 mr-2 text-emerald-400" />
                    Badges
                </h3>
                <span className="text-[11px] text-slate-400">Achievements</span>
            </div>
            <ul className="divide-y divide-slate-800/80">
                {badges.map((b) => (
                    <li key={b.id} className="px-4 py-3.5 sm:px-6 hover:bg-slate-900 transition duration-150 ease-in-out">
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
                            <div className="text-[10px] text-slate-500 uppercase tracking-wide rounded px-1.5 py-0.5 border border-slate-700">
                                {b.code}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BadgesList;
