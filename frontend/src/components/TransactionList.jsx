import React from 'react';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';

const TransactionList = ({ transactions }) => {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="text-center py-9 bg-slate-900/80 rounded-3xl shadow-[0_10px_30px_rgba(15,23,42,0.65)] border border-slate-800">
                <Clock className="mx-auto h-10 w-10 text-slate-500" />
                <h3 className="mt-3 text-sm font-medium text-slate-100">No transactions yet</h3>
                <p className="mt-2 text-xs text-slate-400">Once you pay with EcoCent, activity appears here.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/80 shadow-[0_14px_40px_rgba(15,23,42,0.7)] overflow-hidden sm:rounded-[20px] border border-slate-800">
            <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                <h3 className="text-sm sm:text-base leading-6 font-semibold text-slate-50">Recent Transactions</h3>
                <span className="text-[11px] text-slate-400">Last 5 activities</span>
            </div>
            <ul className="divide-y divide-slate-800/80">
                {transactions.map((transaction) => (
                    <li key={transaction.id} className="px-4 py-3.5 sm:px-6 hover:bg-slate-900 transition duration-150 ease-in-out">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${
                                    transaction.type === 'debit' ? 'bg-amber-500/15' : 'bg-emerald-500/15'
                                }`}>
                                    {transaction.type === 'debit' ? (
                                        <ArrowUpRight className="h-4.5 w-4.5 text-amber-400" />
                                    ) : (
                                        <ArrowDownLeft className="h-4.5 w-4.5 text-emerald-400" />
                                    )}
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-slate-50">
                                        {transaction.description || "Transaction"}
                                    </div>
                                    <div className="text-[11px] text-slate-400 capitalize">
                                        {transaction.category} • {format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a')}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className={`text-sm font-semibold ${
                                    transaction.type === 'debit' ? 'text-amber-400' : 'text-emerald-400'
                                }`}>
                                    {transaction.type === 'debit' ? '-' : '+'}
                                    {((transaction.amount / 100)).toLocaleString('en-IN', {
                                        style: 'currency',
                                        currency: transaction.currency
                                    })}
                                </div>
                                <div className={`text-[11px] px-2 inline-flex leading-5 font-semibold rounded-full ${
                                    transaction.status === 'completed' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
                                }`}>
                                    {transaction.status}
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TransactionList;
