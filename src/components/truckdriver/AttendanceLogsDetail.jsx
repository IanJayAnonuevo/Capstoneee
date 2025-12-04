import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { FiArrowLeft, FiDownload, FiPrinter } from 'react-icons/fi';

export default function AttendanceLogsDetail() {
    const navigate = useNavigate();
    const { year, month } = useParams();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        fetchAttendance();
    }, [year, month]);

    const fetchAttendance = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('access_token');

            if (!userData?.user_id || !token) {
                setLoading(false);
                return;
            }

            const lastDay = new Date(year, month, 0);
            const dateFrom = `${year}-${String(month).padStart(2, '0')}-01`;
            const dateTo = `${year}-${String(month).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

            const apiUrl = `${API_BASE_URL}/get_attendance_logs.php?user_id=${userData.user_id}&date_from=${dateFrom}&date_to=${dateTo}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status === 'success' && Array.isArray(data.data)) {
                setAttendance(data.data);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <div className="px-4 py-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/truckdriver/attendance-logs')}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <FiArrowLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-800">
                                {monthNames[month - 1]} {year}
                            </h1>
                            <p className="text-gray-500 text-sm">View attendance records</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium"
                        >
                            <FiPrinter className="w-4 h-4" />
                            Print
                        </button>
                    </div>
                </div>

                {/* Legend */}
                <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Status:</p>
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-emerald-600 text-xl">●</span>
                            <span className="text-gray-600">Present</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-red-600 text-xl">●</span>
                            <span className="text-gray-600">Absent</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-amber-600 text-xl">●</span>
                            <span className="text-gray-600">On Leave</span>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600"></div>
                        <p className="text-gray-500 mt-3">Loading attendance...</p>
                    </div>
                )}

                {/* Attendance Table */}
                {!loading && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-emerald-600 text-white">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold" colSpan="2">Morning</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold" colSpan="2">Afternoon</th>
                                    </tr>
                                    <tr className="bg-emerald-500">
                                        <th className="px-4 py-2 text-left text-xs font-medium"></th>
                                        <th className="px-4 py-2 text-center text-xs font-medium">IN</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium">OUT</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium">IN</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium">OUT</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {attendance.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                                No attendance records for this month
                                            </td>
                                        </tr>
                                    ) : (
                                        attendance.map((record, index) => {
                                            const isAbsent = record.status === 'absent';
                                            const isOnLeave = record.status === 'on_leave' || record.status === 'on-leave';

                                            const hasMorningIn = record.am_time_in && record.am_time_in !== 'null';
                                            const hasMorningOut = record.am_time_out && record.am_time_out !== 'null';
                                            const hasAfternoonIn = record.pm_time_in && record.pm_time_in !== 'null';
                                            const hasAfternoonOut = record.pm_time_out && record.pm_time_out !== 'null';

                                            const cellBgClass = isAbsent
                                                ? 'bg-red-50'
                                                : isOnLeave
                                                    ? 'bg-amber-50'
                                                    : 'bg-emerald-50';

                                            const circleColor = isAbsent
                                                ? 'text-red-600'
                                                : isOnLeave
                                                    ? 'text-amber-600'
                                                    : 'text-emerald-600';

                                            return (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                        {new Date(record.attendance_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className={`px-4 py-3 text-center ${hasMorningIn ? cellBgClass : ''}`}>
                                                        {hasMorningIn ? (
                                                            <span className={`text-2xl ${circleColor}`}>●</span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className={`px-4 py-3 text-center ${hasMorningOut ? cellBgClass : ''}`}>
                                                        {hasMorningOut ? (
                                                            <span className={`text-2xl ${circleColor}`}>●</span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className={`px-4 py-3 text-center ${hasAfternoonIn ? cellBgClass : ''}`}>
                                                        {hasAfternoonIn ? (
                                                            <span className={`text-2xl ${circleColor}`}>●</span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className={`px-4 py-3 text-center ${hasAfternoonOut ? cellBgClass : ''}`}>
                                                        {hasAfternoonOut ? (
                                                            <span className={`text-2xl ${circleColor}`}>●</span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    /* Hide all buttons and navigation */
                    button,
                    .print\\:hidden {
                        display: none !important;
                    }
                    
                    /* Remove background colors and shadows */
                    body {
                        background: white !important;
                    }
                    
                    .bg-gray-50,
                    .bg-emerald-50 {
                        background: white !important;
                    }
                    
                    /* Ensure table colors print */
                    .bg-emerald-600 {
                        background-color: #059669 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    /* Remove shadows and borders */
                    .shadow-sm,
                    .shadow-lg {
                        box-shadow: none !important;
                    }
                    
                    /* Minimal padding */
                    .p-6 {
                        padding: 1rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
