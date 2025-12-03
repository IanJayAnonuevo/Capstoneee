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
            title: 'Monitor Attendance',
            description: 'Check attendance of truck drivers and collectors',
            icon: MdPeople,
            to: '/foreman/attendance',
        },
        {
            title: 'Manage Schedule',
            description: 'View and update collection schedules',
            icon: MdCalendarToday,
            to: '/foreman/schedule',
        },
        {
            title: 'Task Management',
            description: 'Assign and monitor tasks',
            icon: MdAssignment,
            to: '/foreman/tasks',
        },
        {
            title: 'Truck Status',
            description: 'Check status of garbage trucks',
            icon: MdLocalShipping,
            to: '/foreman/trucks',
        },
        {
            title: 'Special Pickup',
            description: 'Manage special pickup requests',
            icon: MdNotificationImportant,
            to: '/foreman/special-pickup',
        },
        {
            title: 'Emergency Alerts',
            description: 'View and manage route emergencies',
            icon: MdReportProblem,
            to: '/foreman/emergencies',
        },
        {
            title: 'Issues & Reports',
            description: 'View reported issues and concerns',
            icon: MdReportProblem,
            to: '/foreman/issues',
        }
    ];

    return (
        <div className="min-h-full bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 p-6">
            {/* Header Section */}
            <div className="mb-10">
                <h1 className="text-3xl font-light text-gray-800 mb-1">
                    Welcome back, <span className="font-semibold text-emerald-700">{foremanName}</span>
                </h1>
                <p className="text-sm text-gray-500">Here's an overview of your operations today.</p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {quickActions.slice(0, -1).map((action, index) => (
                    <button
                        key={index}
                        onClick={() => navigate(action.to)}
                        className="group bg-white hover:bg-emerald-50 rounded-2xl p-6 cursor-pointer border border-emerald-100 hover:border-emerald-300 transition-all duration-300 flex flex-col items-center text-center hover:shadow-lg hover:shadow-emerald-100/50"
                    >
                        {/* Icon */}
                        <div className="w-14 h-14 rounded-xl bg-emerald-100 group-hover:bg-emerald-600 flex items-center justify-center text-emerald-600 group-hover:text-white mb-4 transition-all duration-300">
                            <action.icon className="w-7 h-7" />
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-semibold text-gray-800 mb-2 leading-tight">
                            {action.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {action.description}
                        </p>
                    </button>
                ))}
            </div>

            {/* Last Item - Full Width Rectangle */}
            <div className="mt-4">
                {(() => {
                    const lastAction = quickActions[quickActions.length - 1];
                    const LastIcon = lastAction.icon;
                    return (
                        <button
                            onClick={() => navigate(lastAction.to)}
                            className="group bg-white hover:bg-emerald-50 rounded-2xl p-6 cursor-pointer border border-emerald-100 hover:border-emerald-300 transition-all duration-300 flex items-center hover:shadow-lg hover:shadow-emerald-100/50 w-full h-[168px]"
                        >
                            {/* Icon */}
                            <div className="w-14 h-14 rounded-xl bg-emerald-100 group-hover:bg-emerald-600 flex items-center justify-center text-emerald-600 group-hover:text-white transition-all duration-300 flex-shrink-0">
                                <LastIcon className="w-7 h-7" />
                            </div>

                            {/* Text Content */}
                            <div className="ml-4 text-left flex-1">
                                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                                    {lastAction.title}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {lastAction.description}
                                </p>
                            </div>
                        </button>
                    );
                })()}
            </div>
        </div>
    );
}
