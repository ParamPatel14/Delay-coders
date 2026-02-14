import React from 'react';
import { format } from 'date-fns';
import { Cloud, Leaf } from 'lucide-react';

const CarbonList = ({ records }) => {
    if (!records || records.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-lg shadow">
                <Leaf className="mx-auto h-12 w-12 text-green-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No carbon records</h3>
                <p className="mt-1 text-sm text-gray-500">Make a transaction to see your footprint.</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <Cloud className="h-5 w-5 mr-2 text-gray-500" />
                    Carbon Impact
                </h3>
                <span className="text-xs text-gray-500">Recent Activity</span>
            </div>
            <ul className="divide-y divide-gray-200">
                {records.map((record) => (
                    <li key={record.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Leaf className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 capitalize">
                                        {record.category}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {format(new Date(record.created_at), 'MMM d, h:mm a')}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-sm font-bold text-gray-800">
                                    {record.carbon_emission.toFixed(3)} kg CO₂
                                </div>
                                <div className="text-xs text-gray-500">
                                    Factor: {record.emission_factor}
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CarbonList;
