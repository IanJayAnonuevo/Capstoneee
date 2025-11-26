import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api';
import { FiCalendar, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { FaUserTie, FaUserFriends } from 'react-icons/fa';

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

export default function PastTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [displayDate, setDisplayDate] = useState('');

    // Calculate yesterday's date
    const getYesterday = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    };

    // Format date for display
    const formatDisplayDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options).toUpperCase();
    };

    useEffect(() => {
        const yesterday = getYesterday();
        setSelectedDate(yesterday);
        setDisplayDate(formatDisplayDate(yesterday));
    }, []);

    useEffect(() => {
        if (!selectedDate) return;

        const fetchTasks = async () => {
            setLoading(true);
            try {
                const res = await fetch(buildApiUrl('get_all_task_assignments.php'), {
                    headers: getAuthHeaders(),
                });
                const data = await res.json();
                if (data.success) {
                    const filteredTasks = data.assignments.filter(task => task.date === selectedDate);
                    setTasks(filteredTasks);
                } else {
                    setError(data.message || 'Failed to fetch tasks');
                }
            } catch (err) {
                setError('Network error');
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [selectedDate]);

    // Format status for display
    const formatStatus = (status) => {
        if (!status) return 'SCHEDULED';
        const s = status.toLowerCase();
        if (s === 'scheduled') return 'SCHEDULED';
        if (s === 'in_progress' || s === 'in progress') return 'IN PROGRESS';
        if (s === 'completed') return 'COMPLETED';
        if (s === 'emergency') return 'EMERGENCY';
        return status.toUpperCase();
    };

    // Process data for the main table
    const workerTasks = {};

    tasks.forEach(task => {
        const isAm = task.time && parseInt(task.time.split(':')[0]) < 12;
        const timeSlot = isAm ? 'AM' : 'PM';
        const status = formatStatus(task.status);

        // Process Driver
        if (task.driver) {
            const driverId = `driver-${task.driver.id || task.driver.driver_id}`;
            if (!workerTasks[driverId]) {
                workerTasks[driverId] = {
                    name: task.driver.name,
                    designation: 'Driver',
                    amStatus: '',
                    pmStatus: ''
                };
            }
            if (timeSlot === 'AM') workerTasks[driverId].amStatus = status;
            else workerTasks[driverId].pmStatus = status;
        }

        // Process Collectors
        if (task.collectors && Array.isArray(task.collectors)) {
            task.collectors.forEach(collector => {
                const collectorId = `collector-${collector.id || collector.collector_id}`;
                if (!workerTasks[collectorId]) {
                    workerTasks[collectorId] = {
                        name: collector.name,
                        designation: 'Collector',
                        amStatus: '',
                        pmStatus: ''
                    };
                }
                if (timeSlot === 'AM') workerTasks[collectorId].amStatus = status;
                else workerTasks[collectorId].pmStatus = status;
            });
        }
    });

    const workerList = Object.values(workerTasks);

    // Process data for summary cards
    const summary = {
        driver: {
            amPending: 0,
            pmCompleted: 0
        },
        collector: {
            amPending: 0,
            pmCompleted: 0
        }
    };

    tasks.forEach(task => {
        const isAm = task.time && parseInt(task.time.split(':')[0]) < 12;
        const s = (task.status || '').toLowerCase();
        const isPending = s !== 'completed' && s !== 'cancelled';
        const isCompleted = s === 'completed';

        if (task.driver) {
            if (isAm && isPending) summary.driver.amPending++;
            if (!isAm && isCompleted) summary.driver.pmCompleted++;
        }

        if (task.collectors && Array.isArray(task.collectors)) {
            task.collectors.forEach(() => {
                if (isAm && isPending) summary.collector.amPending++;
                if (!isAm && isCompleted) summary.collector.pmCompleted++;
            });
        }
    });

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        setDisplayDate(formatDisplayDate(newDate));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        const headers = ['Name of Worker', 'Designation', 'AM Status', 'PM Status'];
        const rows = workerList.map(worker => [
            worker.name,
            worker.designation,
            worker.amStatus,
            worker.pmStatus
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `past_tasks_${selectedDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Get today's date for max attribute
    const today = new Date().toISOString().split('T')[0];

    if (loading && !selectedDate) return <div className="p-8 text-center text-gray-500">Loading past tasks...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 bg-emerald-50 min-h-screen font-sans print:bg-white print:p-0">

            {/* Date Filter - Hidden in Print */}
            <div className="mb-6 print:hidden">
                <label htmlFor="date-picker" className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Date
                </label>
                <input
                    id="date-picker"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    max={today}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-700"
                />
            </div>

            {/* Printable Area Wrapper */}
            <div id="printable-area">
                {/* Date Header */}
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-md shadow-sm border border-gray-200 w-fit mb-6">
                    <span className="font-bold text-gray-700 text-sm tracking-wide">DATE: {displayDate}</span>
                    <FiCalendar className="text-gray-500 w-4 h-4" />
                </div>

                {/* Main Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-8">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-emerald-800 text-white">
                                <th className="p-4 text-center font-semibold border-r border-emerald-700/50 w-1/3">Name of Worker</th>
                                <th className="p-4 text-center font-semibold border-r border-emerald-700/50 w-1/3">Designation</th>
                                <th className="p-0 text-center font-semibold w-1/3">
                                    <div className="p-2 border-b border-emerald-700/50">TASK STATUS</div>
                                    <div className="flex">
                                        <div className="w-1/2 p-2 border-r border-emerald-700/50 text-sm">AM</div>
                                        <div className="w-1/2 p-2 text-sm">PM</div>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="p-12 text-center text-gray-500">
                                        Loading tasks...
                                    </td>
                                </tr>
                            ) : workerList.length > 0 ? (
                                workerList.map((worker, index) => (
                                    <tr key={index} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-center text-gray-800 border-r border-gray-100">{worker.name}</td>
                                        <td className="p-4 text-center text-gray-600 border-r border-gray-100">{worker.designation}</td>
                                        <td className="p-0">
                                            <div className="flex h-full">
                                                <div className="w-1/2 p-4 text-center flex items-center justify-center border-r border-gray-100 text-gray-800">
                                                    {worker.amStatus}
                                                </div>
                                                <div className="w-1/2 p-4 text-center flex items-center justify-center text-gray-800">
                                                    {worker.pmStatus}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <FiAlertCircle className="w-12 h-12 mb-3 text-emerald-200" />
                                            <p className="text-lg font-medium text-gray-600">No Tasks Found</p>
                                            <p className="text-sm">No tasks were assigned for this date</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {/* Empty rows for layout stability if needed */}
                            {!loading && workerList.length > 0 && workerList.length < 5 && Array.from({ length: 5 - workerList.length }).map((_, i) => (
                                <tr key={`empty-${i}`} className="border-b border-gray-100 last:border-b-0">
                                    <td className="p-4 border-r border-gray-100">&nbsp;</td>
                                    <td className="p-4 border-r border-gray-100">&nbsp;</td>
                                    <td className="p-0">
                                        <div className="flex h-full">
                                            <div className="w-1/2 p-4 border-r border-gray-100">&nbsp;</div>
                                            <div className="w-1/2 p-4">&nbsp;</div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Section - Hidden in Print */}
            <div className="print:hidden">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Driver Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="text-gray-600 font-medium mb-4">Driver</div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border-r border-gray-100 pr-4">
                                <div className="text-xs text-gray-500 mb-2 text-center">AM</div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                                        <FaUserTie className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-gray-800">{summary.driver.amPending}</div>
                                        <div className="text-xs text-gray-500">Pending/Tasks</div>
                                    </div>
                                </div>
                            </div>
                            <div className="pl-4">
                                <div className="text-xs text-gray-500 mb-2 text-center">PM</div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <FiCheckCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-gray-800">{summary.driver.pmCompleted}</div>
                                        <div className="text-xs text-gray-500">Completed Tasks</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Collector Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="text-gray-600 font-medium mb-4">Collector</div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border-r border-gray-100 pr-4">
                                <div className="text-xs text-gray-500 mb-2 text-center">AM</div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                                        <FaUserFriends className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-gray-800">{summary.collector.amPending}</div>
                                        <div className="text-xs text-gray-500">Pending/Tasks</div>
                                    </div>
                                </div>
                            </div>
                            <div className="pl-4">
                                <div className="text-xs text-gray-500 mb-2 text-center">PM</div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <FiCheckCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-gray-800">{summary.collector.pmCompleted}</div>
                                        <div className="text-xs text-gray-500">Completed Tasks</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        onClick={handlePrint}
                        className="bg-emerald-600 text-white font-bold py-2 px-8 rounded-full hover:bg-emerald-700 transition shadow-sm hover:shadow-md"
                    >
                        Print
                    </button>
                    <button
                        onClick={handleExport}
                        className="bg-emerald-600 text-white font-bold py-2 px-8 rounded-full hover:bg-emerald-700 transition shadow-sm hover:shadow-md"
                    >
                        Export
                    </button>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body {
                        visibility: hidden;
                    }
                    #printable-area {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        z-index: 9999;
                        background: white;
                        padding: 20px;
                    }
                    #printable-area * {
                        visibility: visible;
                    }
                    /* Ensure table colors print */
                    tr.bg-emerald-800 {
                        background-color: #065f46 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    th {
                        color: white !important;
                    }
                }
            `}</style>
        </div>
    );
}
