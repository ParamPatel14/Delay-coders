import React from 'react';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';

const TransactionList = ({ transactions }) => {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-lg shadow">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by making a payment.</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Transactions</h3>
                <span className="text-xs text-gray-500">Last 5 activities</span>
            </div>
            <ul className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                    <li key={transaction.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                                    transaction.type === 'debit' ? 'bg-red-100' : 'bg-green-100'
                                }`}>
                                    {transaction.type === 'debit' ? (
                                        <ArrowUpRight className="h-6 w-6 text-red-600" />
                                    ) : (
                                        <ArrowDownLeft className="h-6 w-6 text-green-600" />
                                    )}
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                        {transaction.description || "Transaction"}
                                    </div>
                                    <div className="text-xs text-gray-500 capitalize">
                                        {transaction.category} • {format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a')}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className={`text-sm font-semibold ${
                                    transaction.type === 'debit' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                    {transaction.type === 'debit' ? '-' : '+'}
                                    {((transaction.amount / 100)).toLocaleString('en-IN', {
                                        style: 'currency',
                                        currency: transaction.currency
                                    })}
                                </div>
                                <div className={`text-xs px-2 inline-flex leading-5 font-semibold rounded-full ${
                                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
