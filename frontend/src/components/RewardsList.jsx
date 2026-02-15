import React from 'react';
import { format } from 'date-fns';
import { Trophy } from 'lucide-react';

const RewardsList = ({ rewards }) => {
    if (!rewards || rewards.length === 0) {
        return (
            <div className="text-center py-9 bg-slate-900/80 rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.65)] border border-slate-800">
                <Trophy className="mx-auto h-10 w-10 text-emerald-400" />
                <h3 className="mt-3 text-sm font-medium text-slate-100">No rewards yet</h3>
                <p className="mt-2 text-xs text-slate-400">As you offset carbon, your eco bonuses will land here.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/80 shadow-[0_14px_40px_rgba(15,23,42,0.7)] overflow-hidden sm:rounded-[20px] border border-slate-800">
            <div className="px-4 py-4 sm:px-6 flex justify-between items-center bg-slate-900/60 border-b border-slate-800">
                <h3 className="text-sm sm:text-base leading-6 font-semibold text-slate-50 flex items-center">
                    <Trophy className="h-4.5 w-4.5 mr-2 text-emerald-400" />
                    Eco Rewards
                </h3>
                <span className="text-[11px] text-slate-400">Recent bonuses</span>
            </div>
            <ul className="divide-y divide-slate-800/80">
                {rewards.map((reward) => (
                    <li key={reward.id} className="px-4 py-3.5 sm:px-6 hover:bg-slate-900 transition duration-150 ease-in-out">
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
                                <div className="text-sm font-bold text-emerald-400">
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
