import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import { MdToday, MdHistory } from 'react-icons/md';

export default function ForemanTasks() {
    const navigate = useNavigate();

    const menuItems = [
        {
            label: "Today's Tasks",
            description: "View and manage tasks for today",
            to: '/foreman/tasks/today',
            icon: MdToday
        },
        {
            label: "Past Tasks",
            description: "Review history of completed tasks",
            to: '/foreman/tasks/past',
            icon: MdHistory
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
                <button
                    onClick={() => navigate('/foreman')}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <IoChevronBack className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Task Management</h1>
            </div>

            {/* Menu Grid */}
            <div className="p-6 grid gap-4">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => navigate(item.to)}
                        className="group bg-white hover:bg-emerald-50 rounded-xl p-6 cursor-pointer border border-gray-200 hover:border-emerald-200 transition-all duration-300 flex items-center text-left shadow-sm hover:shadow-md"
                    >
                        <div className="w-12 h-12 rounded-lg bg-emerald-100 group-hover:bg-emerald-600 flex items-center justify-center text-emerald-600 group-hover:text-white mr-4 transition-colors duration-300">
                            <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-emerald-800 transition-colors">
                                {item.label}
                            </h3>
                            <p className="text-sm text-gray-500 group-hover:text-emerald-600/80 transition-colors">
                                {item.description}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
