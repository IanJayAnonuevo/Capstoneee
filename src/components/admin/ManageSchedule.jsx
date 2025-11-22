import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api.js';
import { IoNotificationsOutline, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { MdAccessTime } from 'react-icons/md';

// Barangay groups with color coding
const barangayGroups = [
  { 
    name: 'Priority Barangay', 
    color: 'bg-blue-500', 
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-900',
    borderColor: 'border-blue-200',
    cluster: '1C-PB'
  },
  { 
    name: 'Eastern Barangay', 
    color: 'bg-pink-500', 
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-900',
    borderColor: 'border-pink-200',
    cluster: '2C-CA'
  },
  { 
    name: 'Northern Barangay', 
    color: 'bg-orange-500', 
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-900',
    borderColor: 'border-orange-200',
    cluster: '3C-CB'
  },
  { 
    name: 'WEstern Barangay', 
    color: 'bg-yellow-500', 
    bgLight: 'bg-yellow-50',
    textColor: 'text-yellow-900',
    borderColor: 'border-yellow-200',
    cluster: '4C-CC'
  }
];

export default function ManageSchedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedBarangay, setSelectedBarangay] = useState('Priority Barangay');
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Get start of the current week (Monday)
  const getWeekStart = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const day = firstDay.getDay();
    const diff = firstDay.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(year, month, diff);
  };

  // Generate days for the week
  const generateDays = (startDate) => {
    const days = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push({
        day: dayNames[i],
        date: date.getDate(),
        fullDate: date
      });
    }
    return days;
  };

  const weekStart = getWeekStart(currentMonth, currentYear);
  const days = generateDays(weekStart);

  // Navigation functions
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  // Format month and year for display
  const formatMonthYear = () => {
    const months = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    return `${months[currentMonth]}, ${currentYear}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-white text-xl font-bold">KolekTrash</h1>
        </div>
        <button className="text-white p-2 relative">
          <IoNotificationsOutline className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Title Section */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            Manage Schedule both for foreman and Admin
          </h2>
        </div>

        {/* Schedule Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-4 border-green-600">
          {/* Card Header */}
          <div className="bg-green-600 p-4 flex items-center justify-between">
            <button className="text-white p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-white text-lg font-bold">Schedule Management</h2>
            <button className="text-white p-2 relative">
              <IoNotificationsOutline className="w-6 h-6" />
            </button>
          </div>

          {/* Barangay Group Selector and Controls */}
          <div className="bg-white p-4 border-b-2 border-gray-200">
            <div className="text-sm text-gray-600 mb-3">Manage Collection Schedules</div>
            
            {/* Barangay Color Legend */}
            <div className="flex flex-wrap gap-4 mb-4">
              {barangayGroups.map((group) => (
                <button
                  key={group.name}
                  onClick={() => setSelectedBarangay(group.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedBarangay === group.name
                      ? `${group.color} text-white border-transparent`
                      : `${group.bgLight} ${group.textColor} ${group.borderColor}`
                  }`}
                >
                  <div className={`w-4 h-4 rounded ${group.color}`}></div>
                  <span className="font-medium">{group.name}</span>
                </button>
              ))}
            </div>

            {/* Month Navigation and Add Schedule */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
                >
                  <IoChevronBack className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-semibold text-sm">{formatMonthYear()}</span>
                  <button
                    onClick={goToToday}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                  >
                    TODAY
                  </button>
                </div>
                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
                >
                  <IoChevronForward className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                + Add Schedule
              </button>
            </div>
          </div>

          {/* Schedule Grid */}
          <div className="p-6">
            <div className="border-4 border-green-600 rounded-lg overflow-hidden">
              {/* Time and Days Header */}
              <div className="grid grid-cols-8 bg-white">
                <div className="bg-gray-50 border-r-2 border-b-2 border-green-600 p-3 flex items-center justify-center font-bold text-gray-700">
                  TIME
                </div>
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={`bg-gray-50 p-3 text-center font-bold text-gray-700 ${
                      index < 6 ? 'border-r-2' : ''
                    } border-b-2 border-green-600`}
                  >
                    <div>{day.day} {day.date}</div>
                  </div>
                ))}
              </div>

              {/* Schedule Rows - Empty for now, will be populated with data */}
              <div className="grid grid-cols-8 min-h-[400px] bg-white">
                <div className="border-r-2 border-green-600"></div>
                {[...Array(7)].map((_, index) => (
                  <div
                    key={index}
                    className={`${index < 6 ? 'border-r-2 border-green-600' : ''} p-3`}
                  >
                    {/* Schedule items will be populated here */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <div className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <MdAccessTime className="w-5 h-5 text-green-600" />
            HISTORY
          </div>
          <div className="text-xs text-red-600 bg-red-50 p-3 rounded">
            dapat makikita kung sino nagbago ng schedule, forems or admin and kung anong binago niya
          </div>
        </div>
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-green-700 mb-4">Add Schedule</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Day
                </label>
                <select className="w-full border border-gray-300 rounded px-3 py-2">
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                  <option>Saturday</option>
                  <option>Sunday</option>
                </select>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
