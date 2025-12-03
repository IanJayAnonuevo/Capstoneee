import React, { useState, useEffect } from 'react';
import { IoChevronBack } from 'react-icons/io5';
import { FiRefreshCw } from 'react-icons/fi';
import { buildApiUrl } from '../../config/api.js';

const scheduleViewOptions = [
    { value: 'priority', label: 'Priority Barangays', type: 'priority', clusterId: '1C-PB' },
    { value: 'clusterA', label: 'Eastern Barangays', type: 'cluster', clusterId: '2C-CA' },
    { value: 'clusterB', label: 'Western Barangays', type: 'cluster', clusterId: '3C-CB' },
    { value: 'clusterC', label: 'Northern Barangays', type: 'cluster', clusterId: '4C-CC' },
    { value: 'clusterD', label: 'Southern Barangays', type: 'cluster', clusterId: '5C-CD' }
];

// Define the time slots for the grid (6:00 to 17:00, every hour)
const timeSlots = [];
for (let hour = 6; hour <= 17; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
}

export default function TruckDriverScheduleCalendar() {
    const [selectedView, setSelectedView] = useState('priority');
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentWeek, setCurrentWeek] = useState(new Date());

    const selectedOption = scheduleViewOptions.find(opt => opt.value === selectedView) || scheduleViewOptions[0];
    const isPriorityView = selectedOption.type === 'priority';

    // Get auth token
    const getAuthToken = () => {
        try {
            return localStorage.getItem('access_token');
        } catch {
            return null;
        }
    };

    // Get the start of the current week (Monday)
    const getWeekStart = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    // Generate days for the current week
    const generateDays = (weekStart) => {
        const days = [];
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            days.push({
                day: dayNames[i],
                date: date.getDate(),
                fullDate: date
            });
        }
        return days;
    };

    const days = generateDays(getWeekStart(currentWeek));

    // Get week-of-month number (1-5)
    const getWeekOfMonth = (date) => {
        const d = new Date(date);
        const dayOfMonth = d.getDate();
        return Math.ceil(dayOfMonth / 7);
    };

    // Navigation functions
    const goToPreviousWeek = () => {
        const newWeek = new Date(currentWeek);
        newWeek.setDate(currentWeek.getDate() - 7);
        setCurrentWeek(newWeek);
    };

    const goToNextWeek = () => {
        const newWeek = new Date(currentWeek);
        newWeek.setDate(currentWeek.getDate() + 7);
        setCurrentWeek(newWeek);
    };

    const goToToday = () => {
        setCurrentWeek(new Date());
    };

    // Format month and year for display
    const formatMonthYear = (date) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${months[date.getMonth()]}, ${date.getFullYear()}`;
    };

    // Fetch schedules using same API as foreman
    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const weekNumber = getWeekOfMonth(getWeekStart(currentWeek));
            const params = new URLSearchParams();

            // Fetch based on selected view
            if (isPriorityView) {
                params.set('schedule_type', 'daily_priority,fixed_days');
            } else {
                params.set('schedule_type', 'weekly_cluster');
                params.set('cluster_id', selectedOption.clusterId);
                params.set('week_of_month', String(weekNumber));
            }
            params.set('days', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].join(','));

            const url = `${buildApiUrl('get_predefined_schedules.php')}?${params.toString()}`;
            const response = await fetch(url,
                token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
            );

            const data = await response.json();
            if (data.success) {
                setSchedules(Array.isArray(data.schedules) ? data.schedules : []);
                setError(null);
            } else {
                setSchedules([]);
                setError(data.message || 'Failed to fetch schedules');
            }
        } catch (err) {
            setSchedules([]);
            setError('Failed to fetch schedules');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [selectedView, currentWeek]);

    // Build event map for calendar grid
    const eventMap = {};
    schedules.forEach(schedule => {
        const dayName = schedule.day_of_week?.substring(0, 3); // Mon, Tue, etc.
        const startTime = schedule.start_time?.substring(0, 5); // HH:MM
        if (!dayName || !startTime) return;

        const timeKey = `${dayName}-${startTime}`;

        if (!eventMap[timeKey]) eventMap[timeKey] = [];

        const event = {
            label: schedule.barangay_name,
            time: schedule.start_time,
            color: schedule.schedule_type === 'weekly_cluster'
                ? 'bg-gradient-to-br from-blue-100 to-blue-200'
                : 'bg-gradient-to-br from-green-100 to-emerald-100',
            border: schedule.schedule_type === 'weekly_cluster'
                ? 'border-l-4 border-blue-500'
                : 'border-l-4 border-green-500',
            text: schedule.schedule_type === 'weekly_cluster'
                ? 'text-blue-900'
                : 'text-green-900',
            shadow: schedule.schedule_type === 'weekly_cluster'
                ? 'shadow-md shadow-blue-200/50'
                : 'shadow-md shadow-green-200/50'
        };

        eventMap[timeKey].push(event);
    });

    const colWidth = '150px';
    const rowHeight = 80;
    const eventWidth = '140px';
    const eventHeight = 65;

    return (
        <div className="h-full bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-xl font-bold text-gray-800">Collection Schedule</h1>
                    <div className="ml-auto flex gap-2">
                        <button
                            onClick={fetchSchedules}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        >
                            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md p-1 shadow-sm">
                            <button
                                onClick={goToPreviousWeek}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                            >
                                <IoChevronBack className="w-4 h-4" />
                            </button>
                            <div className="px-3 py-1 text-sm font-semibold text-gray-700 min-w-[140px] text-center">
                                {formatMonthYear(currentWeek)}
                            </div>
                            <button
                                onClick={goToNextWeek}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                            >
                                <IoChevronBack className="w-4 h-4 rotate-180" />
                            </button>

                            <div className="w-px h-5 bg-gray-200 mx-1"></div>

                            <button
                                onClick={goToToday}
                                className="px-3 py-1 rounded text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            >
                                Today
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                        <select
                            className="flex-1 sm:flex-none border border-gray-200 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none bg-white shadow-sm min-w-[160px]"
                            value={selectedView}
                            onChange={e => setSelectedView(e.target.value)}
                        >
                            {scheduleViewOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading and Error States */}
            {loading && (
                <div className="text-center py-4">
                    <div className="text-gray-600 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-1.5"></div>
                        Loading schedules...
                    </div>
                </div>
            )}

            {error && (
                <div className="text-center py-4">
                    <div className="text-red-600">Error: {error}</div>
                </div>
            )}

            {/* Schedule Grid */}
            <div className="flex-1 overflow-auto p-4 pt-0" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                {schedules.length === 0 && !loading ? (
                    <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-xl font-semibold text-gray-700 mb-2">No schedules found</div>
                        <div className="text-gray-500">No schedules available for the selected view</div>
                    </div>
                ) : (
                    <>
                        {/* Time Grid Header */}
                        <div
                            className="grid"
                            style={{
                                gridTemplateColumns: `100px repeat(7, minmax(${colWidth}, 1fr))`,
                                position: 'sticky',
                                top: 0,
                                zIndex: 2,
                                background: '#f0fdf4',
                                minWidth: '1150px',
                            }}
                        >
                            <div className="bg-green-100 rounded-tl-lg py-1.5 font-semibold text-xs text-center">
                                Time
                            </div>
                            {days.map(col => (
                                <div key={col.day} className="bg-green-100 rounded-t-lg text-center text-gray-700 font-semibold text-xs py-1.5">
                                    {col.day} <span className="font-normal">{col.date}</span>
                                </div>
                            ))}
                        </div>

                        {/* Main Time Grid */}
                        <div
                            className="grid bg-white rounded-b-lg border border-t-0 border-gray-200"
                            style={{
                                gridTemplateColumns: `100px repeat(7, minmax(${colWidth}, 1fr))`,
                                minHeight: 500,
                                minWidth: '1150px',
                            }}
                        >
                            {/* Time Column */}
                            <div className="flex flex-col items-center pt-2">
                                {timeSlots.map((slot) => (
                                    <div
                                        key={slot}
                                        className="w-full text-xs text-center text-gray-500 flex items-center justify-center border-r border-gray-100"
                                        style={{ height: rowHeight }}
                                    >
                                        {slot}
                                    </div>
                                ))}
                            </div>

                            {/* Day Columns */}
                            {days.map(day => (
                                <div key={day.day} className="relative flex flex-col pt-2">
                                    {timeSlots.map((slot) => {
                                        const key = `${day.day}-${slot}`;
                                        const events = eventMap[key] || [];
                                        return (
                                            <div
                                                key={slot}
                                                className="w-full flex flex-col items-center justify-center border-r border-gray-100"
                                                style={{ height: rowHeight }}
                                            >
                                                {events.map((event, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`rounded-lg ${event.color} ${event.border} ${event.shadow} flex items-center justify-center mb-2 p-2.5`}
                                                        style={{
                                                            width: eventWidth,
                                                            height: eventHeight,
                                                            fontWeight: 700,
                                                            fontSize: 13,
                                                            minHeight: '55px',
                                                        }}
                                                    >
                                                        <div className={`${event.text} text-center truncate px-1`}>
                                                            {event.label}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
