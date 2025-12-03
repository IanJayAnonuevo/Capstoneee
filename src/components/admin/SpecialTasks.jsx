import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api';
import { FiAlertCircle } from 'react-icons/fi';

const getAuthToken = () => {
    try {
        return localStorage.getItem('access_token');
    } catch (err) {
        return null;
    }
};

const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function SpecialTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        setCurrentDate(today.toLocaleDateString('en-US', options).toUpperCase());

        fetchSpecialPickupTasks();
    }, []);

    const fetchSpecialPickupTasks = async () => {
        try {
            setLoading(true);
            const res = await fetch(buildApiUrl('get_all_task_assignments.php'), {
                headers: getAuthHeaders(),
            });
            const data = await res.json();

            if (data.success) {
                // Filter for special pickup tasks only
                const specialTasks = data.assignments.filter(task =>
                    task.schedule_type === 'special_pickup' ||
                    task.scheduleType === 'special_pickup'
                );
                setTasks(specialTasks);
            } else {
                setError(data.message || 'Failed to fetch special pickup tasks');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    // Get status color
    const getStatusColor = (status) => {
        if (!status) return 'bg-gray-400';
        const s = status.toLowerCase();
        if (s === 'scheduled') return 'bg-blue-500';
        if (s === 'in_progress' || s === 'in progress') return 'bg-yellow-500';
        if (s === 'completed') return 'bg-green-500';
        if (s === 'emergency') return 'bg-red-600';
        if (s === 'cancelled') return 'bg-gray-400';
        return 'bg-gray-400';
    };

    // Group tasks by barangay
    const groupedTasks = {};
    tasks.forEach(task => {
        const barangay = task.barangay_name || 'Unknown';
        if (!groupedTasks[barangay]) {
            groupedTasks[barangay] = {
                barangay,
                truck: task.truck_name || task.truck_id || 'N/A',
                tasks: []
            };
        }
        groupedTasks[barangay].tasks.push(task);
    });

    const barangayGroups = Object.values(groupedTasks);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading special pickup tasks...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 bg-emerald-50 min-h-screen font-sans">
            {/* Header */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-md shadow-sm border border-gray-200 w-fit mb-6">
                <span className="font-bold text-gray-700 text-sm tracking-wide">SPECIAL PICKUP TASKS</span>
            </div>

            {/* Status Legend */}
            <div className="bg-white px-4 py-3 rounded-md shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-gray-700">Scheduled</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-xs text-gray-700">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-xs text-gray-700">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600"></div>
                        <span className="text-xs text-gray-700">Emergency</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        <span className="text-xs text-gray-700">Cancelled</span>
                    </div>
                </div>
            </div>

            {/* Tasks Table */}
            {barangayGroups.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <FiAlertCircle className="w-12 h-12 mb-3 text-emerald-200 mx-auto" />
                    <p className="text-lg font-medium text-gray-600">No Special Pickup Tasks</p>
                    <p className="text-sm text-gray-400">No special pickup tasks have been assigned yet</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {barangayGroups.map((group, groupIdx) => (
                        <div key={groupIdx} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                            {/* Barangay Header */}
                            <div className="bg-orange-50 px-4 py-3 border-b border-orange-100">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-orange-900">{group.barangay}</h3>
                                    <span className="text-xs text-orange-700">Truck: {group.truck}</span>
                                </div>
                            </div>

                            {/* Tasks Table */}
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-emerald-800 text-white">
                                        <th className="p-4 text-center font-semibold border-r border-emerald-700/50">Date</th>
                                        <th className="p-4 text-center font-semibold border-r border-emerald-700/50">Time</th>
                                        <th className="p-4 text-center font-semibold border-r border-emerald-700/50">Driver</th>
                                        <th className="p-4 text-center font-semibold border-r border-emerald-700/50">Collectors</th>
                                        <th className="p-4 text-center font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.tasks.map((task, taskIdx) => (
                                        <tr key={taskIdx} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-center text-gray-800 border-r border-gray-100">
                                                {new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="p-4 text-center text-gray-800 border-r border-gray-100">
                                                {task.time || 'N/A'}
                                            </td>
                                            <td className="p-4 text-center border-r border-gray-100">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-gray-800 font-medium">{task.driver?.name || 'N/A'}</span>
                                                    <span className="text-xs text-gray-500">Driver</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center border-r border-gray-100">
                                                <div className="flex flex-col items-center gap-1">
                                                    {task.collectors && task.collectors.length > 0 ? (
                                                        task.collectors.map((collector, idx) => (
                                                            <div key={idx} className="flex flex-col items-center">
                                                                <span className="text-gray-800 font-medium">{collector.name}</span>
                                                                <span className="text-xs text-gray-500">Collector</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400">No collectors</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    <div
                                                        className={`w-4 h-4 rounded-full ${getStatusColor(task.status)}`}
                                                        title={task.status || 'Scheduled'}
                                                    ></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
