import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../../config/api';
import { IoChevronBack } from 'react-icons/io5';
import { FaTruckPickup } from 'react-icons/fa';

const getAuthToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        console.error('No authentication token found');
        return null;
    }
    return token;
};

const getAuthHeaders = () => {
    const token = getAuthToken();
    if (!token) {
        return { 'Content-Type': 'application/json' };
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export default function SpecialPickupTasks() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchSpecialPickupTasks();
    }, [selectedDate]);

    const fetchSpecialPickupTasks = async () => {
        try {
            setLoading(true);
            const response = await fetch(buildApiUrl('/get_all_task_assignments.php'), {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const data = await response.json();
            console.log('API Response:', data);

            // Filter for special pickup tasks only
            const allTasks = data.data || data.assignments || [];
            const specialPickups = allTasks.filter(task =>
                task.schedule_type === 'special_pickup' &&
                (!selectedDate || task.date === selectedDate)
            );

            console.log('All tasks:', allTasks.length);
            console.log('Special pickup tasks:', specialPickups.length);

            setTasks(specialPickups);
            setError(null);
        } catch (err) {
            console.error('Error fetching special pickup tasks:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusDot = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return <div className="w-3 h-3 rounded-full bg-green-500 mx-auto"></div>;
            case 'in_progress':
                return <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto"></div>;
            case 'pending':
            case 'scheduled':
                return <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto"></div>;
            case 'cancelled':
                return <div className="w-3 h-3 rounded-full bg-gray-400 mx-auto"></div>;
            case 'emergency':
                return <div className="w-3 h-3 rounded-full bg-red-500 mx-auto"></div>;
            default:
                return <div className="w-3 h-3 rounded-full bg-yellow-500 mx-auto"></div>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading special pickup tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/foreman/tasks')}
                        className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <IoChevronBack className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-gray-800">Special Pickup Tasks</h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Date Filter */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Date
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {selectedDate && (
                        <p className="mt-2 text-sm text-gray-600">
                            DATE: {formatDate(selectedDate).toUpperCase()}
                        </p>
                    )}
                </div>

                {/* Legend */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span>Scheduled</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span>In Progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span>Emergency</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                            <span>Cancelled</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        <p className="font-medium">Error loading tasks</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {tasks.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <FaTruckPickup className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Special Pickup Tasks</h3>
                        <p className="text-gray-500">
                            There are no special pickup requests scheduled for {formatDate(selectedDate)}.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Group tasks by barangay */}
                        {Object.entries(
                            tasks.reduce((groups, task) => {
                                const barangay = task.barangay_name || 'Unknown Location';
                                if (!groups[barangay]) {
                                    groups[barangay] = [];
                                }
                                groups[barangay].push(task);
                                return groups;
                            }, {})
                        ).map(([barangay, barangayTasks]) => (
                            <div key={barangay} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                {/* Barangay Header */}
                                <div className="px-6 py-3 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-gray-900 font-semibold text-base">{barangay}</h3>
                                        <div className="text-gray-600 text-sm">
                                            {barangayTasks[0]?.truck_plate && (
                                                <span>Truck: {barangayTasks[0].truck_plate}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Task Table */}
                                <table className="w-full">
                                    <thead className="bg-emerald-700 text-white">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold">Name of Worker</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold">Designation</th>
                                            <th className="px-6 py-3 text-center text-sm font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {barangayTasks.map((task) => {
                                            const rows = [];

                                            // Driver row
                                            if (task.driver) {
                                                rows.push({
                                                    key: `${task.assignment_id}-driver`,
                                                    name: task.driver.name || 'Unknown',
                                                    designation: 'Driver',
                                                    status: task.status
                                                });
                                            }

                                            // Collector rows
                                            if (task.collectors && task.collectors.length > 0) {
                                                task.collectors.forEach((collector, idx) => {
                                                    rows.push({
                                                        key: `${task.assignment_id}-collector-${idx}`,
                                                        name: collector.name || 'Unknown',
                                                        designation: 'Collector',
                                                        status: task.status
                                                    });
                                                });
                                            }

                                            return rows.map((row) => (
                                                <tr key={row.key} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {row.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {row.designation}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {getStatusDot(row.status)}
                                                    </td>
                                                </tr>
                                            ));
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
