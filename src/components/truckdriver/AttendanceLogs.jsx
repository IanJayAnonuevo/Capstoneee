import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

export default function AttendanceLogs() {
    const navigate = useNavigate();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Generate months for the selected year
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Available years (current year and past 2 years)
    const years = [currentYear, currentYear - 1, currentYear - 2];

    const handleMonthClick = (monthIndex) => {
        navigate(`/truckdriver/attendance-logs/${selectedYear}/${monthIndex + 1}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <div className="px-4 py-6 max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold text-gray-800">Attendance Logs</h1>
                    <p className="text-gray-500 mt-1">View attendance records</p>
                </div>

                {/* Year Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Year</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                {/* Month List */}
                <div className="space-y-2">
                    {months.map((month, index) => {
                        const isPastMonth = selectedYear < currentYear || (selectedYear === currentYear && index <= currentMonth);
                        const isCurrentMonth = selectedYear === currentYear && index === currentMonth;

                        return (
                            <button
                                key={month}
                                onClick={() => handleMonthClick(index)}
                                disabled={!isPastMonth}
                                className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${isPastMonth
                                        ? isCurrentMonth
                                            ? 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700'
                                            : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <span className="font-medium">{month} {selectedYear}</span>
                                {isPastMonth && <FiChevronRight className="w-5 h-5" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
