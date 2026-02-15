import React from 'react';
import { format } from 'date-fns';
import { Trophy } from 'lucide-react';

const RewardsList = ({ rewards }) => {
    if (!rewards || rewards.length === 0) {
        return (
            <div className="relative text-center py-9 rounded-2xl">
                <div className="absolute -inset-px rounded-2xl bg-[radial-gradient(circle_at_0_0,rgba(16,185,129,0.55),transparent_55%),radial-gradient(circle_at_120%_120%,rgba(245,158,11,0.4),transparent_60%)] opacity-80" />
                <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-[0_18px_60px_rgba(16,185,129,0.4)] border border-white/10">
                <Trophy className="mx-auto h-10 w-10 text-emerald-400" />
                <h3 className="mt-3 text-sm font-medium text-slate-100">No rewards yet</h3>
                <p className="mt-2 text-xs text-slate-400">As you offset carbon, your eco bonuses will land here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative sm:rounded-[22px]">
            <div className="absolute -inset-px rounded-[22px] bg-[radial-gradient(circle_at_0_0,rgba(16,185,129,0.55),transparent_55%),radial-gradient(circle_at_120%_0,rgba(245,158,11,0.4),transparent_60%)] opacity-80" />
            <div className="relative bg-slate-950/85 shadow-[0_20px_70px_rgba(16,185,129,0.38)] overflow-hidden sm:rounded-[20px] border border-white/10 backdrop-blur-xl">
            <div className="px-4 py-4 sm:px-6 flex justify-between items-center bg-slate-900/60 border-b border-white/10">
                <h3 className="text-sm sm:text-base leading-6 font-semibold text-slate-50 flex items-center">
                    <Trophy className="h-4.5 w-4.5 mr-2 text-emerald-400" />
                    Eco Rewards
                </h3>
                <span className="text-[11px] text-slate-400">Recent bonuses</span>
            </div>
            <ul className="divide-y divide-slate-800/80">
                {rewards.map((reward) => (
                    <li key={reward.id} className="px-4 py-3.5 sm:px-6 hover:bg-slate-900/80 transition duration-150 ease-in-out">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-emerald-500/15 flex items-center justify-center">
                                    <Trophy className="h-4.5 w-4.5 text-emerald-400" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-slate-50 capitalize">
                                        {reward.action_type.toLowerCase()}
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        {reward.description || 'Reward'} • {format(new Date(reward.created_at), 'MMM d, h:mm a')}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-sm font-bold text-emerald-400 font-mono tracking-tight">
                                    +{reward.points} pts
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            </div>
        </div>
    );
};

export default RewardsList;
