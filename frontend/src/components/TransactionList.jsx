import React from 'react';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';

const TransactionList = ({ transactions }) => {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="relative text-center py-9 rounded-3xl">
                <div className="absolute -inset-px rounded-3xl bg-[radial-gradient(circle_at_0_0,rgba(190,242,100,0.6),transparent_55%),radial-gradient(circle_at_100%_120%,rgba(52,211,153,0.45),transparent_60%)] opacity-80" />
                <div className="relative bg-white backdrop-blur-xl rounded-3xl shadow-sm border border-emerald-100">
                <Clock className="mx-auto h-10 w-10 text-emerald-500" />
                <h3 className="mt-3 text-sm font-medium text-slate-900">No transactions yet</h3>
                <p className="mt-2 text-xs text-emerald-800">Once you pay with EcoCent, activity appears here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative sm:rounded-[22px]">
            <div className="absolute -inset-px rounded-[22px] bg-[radial-gradient(circle_at_0_0,rgba(190,242,100,0.5),transparent_55%),radial-gradient(circle_at_120%_0,rgba(52,211,153,0.4),transparent_60%)] opacity-80" />
            <div className="relative bg-white backdrop-blur-xl shadow-sm overflow-hidden sm:rounded-[20px] border border-emerald-100">
            <div className="px-4 py-4 sm:px-6 flex justify-between items-center bg-emerald-50 border-b border-emerald-100">
                <h3 className="text-sm sm:text-base leading-6 font-semibold text-slate-900">Recent Transactions</h3>
                <span className="text-[11px] text-emerald-800">Last 5 activities</span>
            </div>
            <ul className="divide-y divide-emerald-50">
                {transactions.map((transaction) => (
                    <li key={transaction.id} className="px-4 py-3.5 sm:px-6 hover:bg-emerald-50 transition duration-150 ease-in-out">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${
                                    transaction.type === 'debit' ? 'bg-amber-100' : 'bg-emerald-100'
                                }`}>
                                    {transaction.type === 'debit' ? (
                                        <ArrowUpRight className="h-4.5 w-4.5 text-amber-400" />
                                    ) : (
                                        <ArrowDownLeft className="h-4.5 w-4.5 text-emerald-400" />
                                    )}
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-slate-900">
                                        {transaction.description || "Transaction"}
                                    </div>
                                    <div className="text-[11px] text-emerald-800 capitalize">
                                        {transaction.category} • {format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a')}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className={`text-sm font-semibold font-mono tracking-tight ${
                                    transaction.type === 'debit' ? 'text-amber-400' : 'text-emerald-400'
                                }`}>
                                    {transaction.type === 'debit' ? '-' : '+'}
                                    {((transaction.amount / 100)).toLocaleString('en-IN', {
                                        style: 'currency',
                                        currency: transaction.currency
                                    })}
                                </div>
                                <div className={`mt-1 text-[11px] px-2 inline-flex leading-5 font-semibold rounded-full ${
                                    transaction.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {transaction.status}
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

export default TransactionList;
