import React from 'react';
import { Award } from 'lucide-react';

const BadgesList = ({ badges }) => {
    if (!badges || badges.length === 0) {
        return (
            <div className="relative text-center py-8 rounded-xl">
                <div className="absolute -inset-px rounded-xl bg-[radial-gradient(circle_at_0_0,rgba(190,242,100,0.6),transparent_55%),radial-gradient(circle_at_120%_120%,rgba(52,211,153,0.45),transparent_60%)] opacity-80" />
                <div className="relative bg-white rounded-xl shadow-sm border border-emerald-100 backdrop-blur-xl">
                <Award className="mx-auto h-9 w-9 text-emerald-500" />
                <h3 className="mt-3 text-sm font-medium text-slate-900">No badges yet</h3>
                <p className="mt-2 text-xs text-emerald-800">Hit streaks and milestones to unlock your first badge.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative sm:rounded-[22px]">
            <div className="absolute -inset-px rounded-[22px] bg-[radial-gradient(circle_at_0_0,rgba(190,242,100,0.6),transparent_55%),radial-gradient(circle_at_120%_0,rgba(52,211,153,0.45),transparent_60%)] opacity-80" />
            <div className="bg-white shadow-sm overflow-hidden sm:rounded-[20px] border border-emerald-100 backdrop-blur-xl">
            <div className="px-4 py-4 sm:px-6 flex justify-between items-center bg-emerald-50 border-b border-emerald-100">
                <h3 className="text-sm leading-6 font-semibold text-slate-900 flex items-center">
                    <Award className="h-4.5 w-4.5 mr-2 text-emerald-400" />
                    Badges
                </h3>
                <span className="text-[11px] text-emerald-800">Achievements</span>
            </div>
            <ul className="divide-y divide-emerald-50">
                {badges.map((b) => (
                    <li key={b.id} className="px-4 py-3.5 sm:px-6 hover:bg-emerald-50 transition duration-150 ease-in-out">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <Award className="h-4.5 w-4.5 text-emerald-400" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-slate-900">
                                        {b.name}
                                    </div>
                                    <div className="text-[11px] text-emerald-800">
                                        {b.description || b.code}
                                    </div>
                                </div>
                            </div>
                            <div className="text-[10px] text-emerald-800 uppercase tracking-wide rounded px-1.5 py-0.5 border border-emerald-200 bg-emerald-50">
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
