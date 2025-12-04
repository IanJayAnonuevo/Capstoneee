import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api';
import { FiAlertCircle, FiChevronLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [displayDate, setDisplayDate] = useState('');

    useEffect(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        setSelectedDate(dateStr);
        setDisplayDate(today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase());
    }, []);

    useEffect(() => {
        if (selectedDate) {
            fetchSpecialPickupTasks();
        }
    }, [selectedDate]);

    const fetchSpecialPickupTasks = async () => {
        try {
            setLoading(true);
            const res = await fetch(buildApiUrl('get_all_task_assignments.php'), {
                headers: getAuthHeaders(),
            });
            const data = await res.json();

            if (data.success) {
                // Filter for special pickup tasks on selected date
                const specialTasks = data.assignments.filter(task => {
                    const isSpecialPickup = task.schedule_type === 'special_pickup' || task.scheduleType === 'special_pickup';
                    const taskDate = task.date ? task.date.split(' ')[0] : '';
                    return isSpecialPickup && taskDate === selectedDate;
                });
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

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        const dateObj = new Date(newDate + 'T00:00:00');
        setDisplayDate(dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase());
    };

    // Get status color
    const getStatusColor = (status) => {
        if (!status) return 'bg-blue-500';
        const s = status.toLowerCase();
        if (s === 'scheduled') return 'bg-blue-500';
        if (s === 'in_progress' || s === 'in progress') return 'bg-yellow-500';
        if (s === 'completed') return 'bg-green-500';
        if (s === 'emergency') return 'bg-red-600';
        if (s === 'cancelled') return 'bg-gray-400';
        return 'bg-blue-500';
    };

    // Group tasks by barangay
    const groupedTasks = {};
    tasks.forEach(task => {
        const barangay = task.barangay_name || 'Unknown';
        if (!groupedTasks[barangay]) {
            groupedTasks[barangay] = {
                barangay,
                truck: task.truck_plate || task.truck_name || task.truck?.name || 'N/A',
                tasks: []
            };
        }
        groupedTasks[barangay].tasks.push(task);
    });

    const barangayGroups = Object.values(groupedTasks);

    return (
        <div className="p-6 bg-white min-h-screen">
            {/* Back Button and Title */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate('/admin/task-management')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <FiChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Special Pickup Tasks</h1>
            </div>

            {/* Date Picker */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">DATE: {displayDate}</p>
            </div>

            {/* Status Legend */}
            <div className="flex items-center gap-6 mb-6 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-gray-700">Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-xs text-gray-700">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-700">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-600"></div>
                    <span className="text-xs text-gray-700">Emergency</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <span className="text-xs text-gray-700">Cancelled</span>
                </div>
            </div>

            {/* Loading/Error States */}
            {loading && <div className="text-center py-8 text-gray-500">Loading...</div>}
            {error && <div className="text-center py-8 text-red-500">Error: {error}</div>}

            {/* Tasks Table */}
            {!loading && !error && barangayGroups.length === 0 && (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
                    <FiAlertCircle className="w-12 h-12 mb-3 text-gray-300 mx-auto" />
                    <p className="text-lg font-medium text-gray-600">No Special Pickup Tasks</p>
                    <p className="text-sm text-gray-400">No special pickup tasks scheduled for this date</p>
                </div>
            )}

            {!loading && !error && barangayGroups.length > 0 && (
                <div className="space-y-6">
                    {barangayGroups.map((group, groupIdx) => (
                        <div key={groupIdx} className="bg-white rounded-lg overflow-hidden border border-gray-200">
                            {/* Barangay Header */}
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-800">{group.barangay}</h3>
                                <span className="text-xs text-gray-600">Truck: {group.truck}</span>
                            </div>

                            {/* Tasks Table */}
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-emerald-700 text-white">
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Name of Worker</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Designation</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.tasks.map((task, taskIdx) => (
                                        <React.Fragment key={taskIdx}>
                                            {/* Driver Row */}
                                            {task.driver && (
                                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-800">{task.driver.name || 'N/A'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">Driver</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            {/* Collector Rows */}
                                            {task.collectors && task.collectors.map((collector, colIdx) => (
                                                <tr key={`col-${colIdx}`} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-800">{collector.name}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">Collector</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
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
