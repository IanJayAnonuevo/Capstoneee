import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiCalendar, FiClock, FiTruck, FiUser } from 'react-icons/fi';
import { authService } from '../../services/authService';

export default function ScheduleAssignmentModal({ request, onClose, onSuccess }) {
    const navigate = useNavigate();
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('08:00');
    const [selectedTruck, setSelectedTruck] = useState('');
    const [selectedDriver, setSelectedDriver] = useState('');
    const [selectedCollectors, setSelectedCollectors] = useState([]);

    const [availableTrucks, setAvailableTrucks] = useState([]);
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [availableCollectors, setAvailableCollectors] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (request) {
            // Set default date to preferred date
            setScheduleDate(request.pickup_date || '');
            fetchPersonnelAndTrucks();
        }
    }, [request]);

    const fetchPersonnelAndTrucks = async () => {
        try {
            // Fetch personnel
            const personnelResponse = await authService.getPersonnel();
            console.log('Personnel API Response:', personnelResponse);

            if (personnelResponse && personnelResponse.status === 'success') {
                console.log('Personnel data:', personnelResponse.data);
                const drivers = personnelResponse.data.filter(p => p.user_type === 'truck_driver');
                const collectors = personnelResponse.data.filter(p => p.user_type === 'garbage_collector');
                console.log('Drivers:', drivers);
                console.log('Collectors:', collectors);
                setAvailableDrivers(drivers);
                setAvailableCollectors(collectors);
            } else {
                console.error('Personnel API failed or returned error:', personnelResponse);
            }

            // Fetch trucks
            try {
                const trucksResponse = await authService.getTrucks();
                console.log('Trucks API Response:', trucksResponse);
                if (trucksResponse && trucksResponse.status === 'success') {
                    setAvailableTrucks(trucksResponse.data || []);
                }
            } catch (error) {
                console.error('Error fetching trucks:', error);
                // Use placeholder if API fails
                setAvailableTrucks([
                    { id: 1, truck_number: 'TRUCK-001', plate_number: 'ABC 123' },
                    { id: 2, truck_number: 'TRUCK-002', plate_number: 'DEF 456' },
                    { id: 3, truck_number: 'TRUCK-003', plate_number: 'GHI 789' },
                ]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const toggleCollector = (collectorId) => {
        setSelectedCollectors(prev => {
            if (prev.includes(collectorId)) {
                return prev.filter(id => id !== collectorId);
            } else {
                return [...prev, collectorId];
            }
        });
    };

    const handleSubmit = async () => {
        // Validation
        if (!scheduleDate) {
            alert('Please select a schedule date');
            return;
        }
        if (!scheduleTime) {
            alert('Please select a schedule time');
            return;
        }
        if (!selectedTruck) {
            alert('Please select a truck');
            return;
        }
        if (!selectedDriver) {
            alert('Please select a truck driver');
            return;
        }
        if (selectedCollectors.length === 0) {
            alert('Please select at least one garbage collector');
            return;
        }

        try {
            setLoading(true);

            // Check for conflicting predefined schedules
            const selectedDate = new Date(scheduleDate);
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayOfWeek = dayNames[selectedDate.getDay()];

            // Fetch predefined schedules for the selected day and time
            const checkResponse = await fetch(
                `${window.location.origin}/kolektrash/backend/api/get_predefined_schedules.php?day_of_week=${dayOfWeek}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const checkData = await checkResponse.json();

            if (checkData.success && checkData.schedules) {
                // Check if any predefined schedule conflicts with the selected time
                const conflictingSchedule = checkData.schedules.find(schedule => {
                    const scheduleStart = schedule.start_time.substring(0, 5);
                    const scheduleEnd = schedule.end_time ? schedule.end_time.substring(0, 5) : null;
                    const selectedTime = scheduleTime.substring(0, 5);

                    // Check if selected time falls within any predefined schedule
                    if (scheduleEnd) {
                        return selectedTime >= scheduleStart && selectedTime < scheduleEnd;
                    } else {
                        return selectedTime === scheduleStart;
                    }
                });

                if (conflictingSchedule) {
                    alert(`Cannot schedule at this time. There is already a predefined ${conflictingSchedule.schedule_type} schedule for ${conflictingSchedule.barangay_name} at ${conflictingSchedule.start_time.substring(0, 5)}.`);
                    setLoading(false);
                    return;
                }
            }

            const assignmentData = {
                request_id: request.id || request.request_id,
                schedule_date: scheduleDate,
                schedule_time: scheduleTime,
                truck_id: selectedTruck,
                driver_id: selectedDriver,
                collector_ids: selectedCollectors,
            };

            console.log('Sending assignment data:', assignmentData);

            const response = await authService.updatePickupRequestStatus(
                request.id || request.request_id,
                'scheduled',
                {
                    admin_remarks: 'Request scheduled by foreman',
                    assignment: assignmentData
                }
            );

            console.log('API Response:', response);

            if (response.status === 'success') {
                console.log('Success! Showing alert...');
                alert('Pickup request scheduled successfully!');
                onSuccess();
                onClose();
                // Navigate to schedule page
                navigate('/foreman/schedule');
            } else {
                console.error('API returned error:', response);
                alert('Failed to schedule: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error scheduling:', error);
            alert('Failed to schedule request: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!request) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Schedule Pickup</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Assign personnel and set schedule for {request.barangay}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FiX className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    {/* Request Summary */}
                    <div className="bg-green-50 p-4 rounded-xl mb-6 border border-green-200">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600 uppercase text-xs mb-1">Barangay</p>
                                <p className="font-semibold text-gray-900">{request.barangay}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 uppercase text-xs mb-1">Requester</p>
                                <p className="font-semibold text-gray-900">{request.requester_name}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 uppercase text-xs mb-1">Preferred Date</p>
                                <p className="font-semibold text-gray-900">
                                    {request.pickup_date ? new Date(request.pickup_date).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Section */}
                    <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <FiCalendar className="text-green-600" />
                                    Schedule Date
                                </label>
                                <input
                                    type="date"
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <FiClock className="text-green-600" />
                                    Schedule Time
                                </label>
                                <input
                                    type="time"
                                    value={scheduleTime}
                                    onChange={(e) => setScheduleTime(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                        </div>

                        {/* Truck Selection */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FiTruck className="text-green-600" />
                                Assign Truck
                            </label>
                            <select
                                value={selectedTruck}
                                onChange={(e) => setSelectedTruck(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="">Select a truck...</option>
                                {availableTrucks.map(truck => (
                                    <option key={truck.id} value={truck.id}>
                                        {truck.truck_number} - {truck.plate_number}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Driver Selection */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FiUser className="text-green-600" />
                                Assign Truck Driver
                            </label>
                            <select
                                value={selectedDriver}
                                onChange={(e) => setSelectedDriver(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="">Select a truck driver...</option>
                                {availableDrivers.map(driver => (
                                    <option key={driver.id || driver.user_id} value={driver.id || driver.user_id}>
                                        {driver.full_name || `${driver.firstname} ${driver.lastname}`}
                                        {driver.employee_id && ` (ID: ${driver.employee_id})`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Collectors Selection */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FiUser className="text-green-600" />
                                Assign Garbage Collectors ({selectedCollectors.length} selected)
                            </label>
                            <div className="border border-gray-300 rounded-xl p-4 max-h-48 overflow-y-auto bg-gray-50">
                                {availableCollectors.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">No collectors available</p>
                                ) : (
                                    <div className="space-y-2">
                                        {availableCollectors.map(collector => (
                                            <label
                                                key={collector.id || collector.user_id}
                                                className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCollectors.includes(collector.id || collector.user_id)}
                                                    onChange={() => toggleCollector(collector.id || collector.user_id)}
                                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                />
                                                <span className="text-sm text-gray-900">
                                                    {collector.full_name || `${collector.firstname} ${collector.lastname}`}
                                                    {collector.employee_id && (
                                                        <span className="text-gray-500 text-xs ml-2">ID: {collector.employee_id}</span>
                                                    )}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 py-3 px-4 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200 disabled:opacity-50"
                        >
                            {loading ? 'Scheduling...' : 'Schedule & Assign'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
