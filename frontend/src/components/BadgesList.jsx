import React from 'react';
import { Award } from 'lucide-react';

const BadgesList = ({ badges }) => {
    if (!badges || badges.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-lg shadow">
                <Award className="mx-auto h-12 w-12 text-yellow-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No badges yet</h3>
                <p className="mt-1 text-sm text-gray-500">Earn badges by sustainable activity.</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-yellow-600" />
                    Badges
                </h3>
                <span className="text-xs text-gray-500">Achievements</span>
            </div>
            <ul className="divide-y divide-gray-200">
                {badges.map((b) => (
                    <li key={b.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                    <Award className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                        {b.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {b.description || b.code}
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 uppercase tracking-wide">{b.code}</div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BadgesList;
