import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPeople, MdCalendarToday, MdAssignment, MdLocalShipping, MdReportProblem, MdNotificationImportant } from 'react-icons/md';
import Skeleton from '../shared/Skeleton';

export default function ForemanHome() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const foremanName = user.first_name || 'Foreman';

    const quickActions = [
        {
            title: 'Manage Users',
            description: 'Check attendance of truck drivers and collectors',
            icon: MdPeople,
            to: '/foreman/attendance',
            color: 'bg-blue-500'
        },
        {
            title: 'Manage Schedule',
            description: 'View and update collection schedules',
            icon: MdCalendarToday,
            to: '/foreman/schedule',
            color: 'bg-green-500'
        },
        {
            title: 'Task Management',
            description: 'Assign and monitor tasks',
            icon: MdAssignment,
            to: '/foreman/tasks',
            color: 'bg-purple-500'
        },
        {
            title: 'Special Pickup',
            description: 'Manage special pickup requests',
            icon: MdNotificationImportant,
            to: '/foreman/special-pickup',
            color: 'bg-indigo-500'
        },
        {
            title: 'Truck Status',
            description: 'Check status of garbage trucks',
            icon: MdLocalShipping,
            to: '/foreman/trucks',
            color: 'bg-orange-500'
        },
        {
            title: 'Issues & Reports',
            description: 'View reported issues and concerns',
            icon: MdReportProblem,
            to: '/foreman/issues',
            color: 'bg-red-500'
        }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Welcome back, {foremanName}!</h1>
                <p className="text-gray-600">Here's an overview of your operations today.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(action.to)}
                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-4 cursor-pointer border border-gray-200 flex flex-col items-center text-center h-full justify-center"
                    >
                        <div className={`${action.color} w-10 h-10 rounded-full flex items-center justify-center text-white mb-3 shadow-sm`}>
                            <action.icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-1 leading-tight">{action.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2">{action.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
