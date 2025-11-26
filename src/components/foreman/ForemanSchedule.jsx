import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import { FiMoreVertical, FiEdit2, FiTrash2, FiClock, FiRefreshCw } from 'react-icons/fi';
import { buildApiUrl } from '../../config/api.js';

const scheduleViewOptions = [
  { value: 'priority', label: 'Priority Barangays', type: 'priority', clusterId: '1C-PB' },
  { value: 'clusterA', label: 'Eastern Barangays', type: 'cluster', clusterId: '2C-CA' },
  { value: 'clusterB', label: 'Western Barangays', type: 'cluster', clusterId: '3C-CB' },
  { value: 'clusterC', label: 'Northern Barangays', type: 'cluster', clusterId: '4C-CC' },
  { value: 'clusterD', label: 'Southern Barangays', type: 'cluster', clusterId: '5C-CD' }
];

// Define the time slots for the grid (6:00 to 17:00, every 30 minutes)
const timeSlots = [];
for (let hour = 6; hour <= 17; hour++) {
  timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  if (hour !== 17) timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
}

// Build a stable unique id for a schedule record
const computeScheduleId = (s) => {
  const numId = s?.schedule_template_id || s?.id || s?.schedule_id || s?.predefined_id;
  if (numId !== undefined && numId !== null && String(numId).trim() !== '') {
    return String(numId);
  }
  // Fallback to composite natural key
  const parts = [
    s?.barangay_id ?? 'b',
    s?.schedule_type ?? 't',
    s?.cluster_id ?? 'c',
    s?.day_of_week ?? 'd',
    (s?.start_time || '').substring(0, 5)
  ];
  return parts.join('|');
};

export default function ForemanSchedule() {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState('priority');
  const [predefinedSchedules, setPredefinedSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [schedulesError, setSchedulesError] = useState(null);
  const [barangayList, setBarangayList] = useState([]);
  const selectedOption = scheduleViewOptions.find(opt => opt.value === selectedView) || scheduleViewOptions[0];
  const isPriorityView = selectedOption.type === 'priority';
  const selectedClusterId = selectedOption.clusterId;

  // Helper function to get auth token
  const getAuthToken = () => {
    try {
      return localStorage.getItem('access_token');
    } catch {
      return null;
    }
  };
  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };
  // Set initial date to the current date (current month/week)
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Inline edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editForm, setEditForm] = useState({ day_of_week: '', start_time: '', end_time: '', week_of_month: '' });
  const [editError, setEditError] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  // Delete modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteDeleting, setDeleteDeleting] = useState(false);
  // Add schedule modal state
  const [addOpen, setAddOpen] = useState(false);
  const [addError, setAddError] = useState(null);
  const [addSaving, setAddSaving] = useState(false);
  const [addForm, setAddForm] = useState({ date: '', start_time: '', end_time: '', barangay_id: '', week_of_month: '' });

  // Success modal state
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Duplicate warning modal state
  const [duplicateWarningOpen, setDuplicateWarningOpen] = useState(false);
  const [duplicateSchedule, setDuplicateSchedule] = useState(null);

  // History modal state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyTotal, setHistoryTotal] = useState(0);

  // Menu state for three-dot menu
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});

  // Get the start of the current week (Monday)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
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

  // Get week-of-month number (1-5) for a given date
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
    setCurrentWeek(new Date()); // Go to current week
  };

  // Format month and year for display
  const formatMonthYear = (date) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

  // Fetch predefined schedules from backend (filtered)
  const fetchSchedules = async () => {
    try {
      setSchedulesLoading(true);
      const weekNumber = getWeekOfMonth(getWeekStart(currentWeek));
      const currentOption = scheduleViewOptions.find(opt => opt.value === selectedView) || scheduleViewOptions[0];
      const isPriority = currentOption.type === 'priority';
      const params = new URLSearchParams();

      // Fetch all schedule types: daily_priority, fixed_days, and weekly_cluster
      if (isPriority) {
        params.set('schedule_type', 'daily_priority,fixed_days');
      } else {
        params.set('schedule_type', 'weekly_cluster');
        params.set('cluster_id', currentOption.clusterId);
        params.set('week_of_month', String(weekNumber));
      }
      params.set('days', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].join(','));
      const url = `${buildApiUrl('get_predefined_schedules.php')}?${params.toString()}`;
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setPredefinedSchedules(Array.isArray(data.schedules) ? data.schedules : []);
        setSchedulesError(null);
      } else {
        setPredefinedSchedules([]);
        setSchedulesError(data.message || 'Failed to fetch predefined schedules.');
      }
    } catch (err) {
      setPredefinedSchedules([]);
      setSchedulesError('Failed to fetch predefined schedules.');
    } finally {
      setSchedulesLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedView, currentWeek]);

  // Fetch schedule history
  const fetchScheduleHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const url = `${buildApiUrl('get_schedule_history.php')}?limit=100&offset=0`;
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setHistoryData(Array.isArray(data.history) ? data.history : []);
        setHistoryTotal(data.total || 0);
      } else {
        setHistoryError(data.message || 'Failed to fetch schedule history.');
        setHistoryData([]);
      }
    } catch (err) {
      setHistoryError('Failed to fetch schedule history.');
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch barangays for mapping
  useEffect(() => {
    fetch(buildApiUrl('get_barangays.php'), {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBarangayList(Array.isArray(data.barangays) ? data.barangays : []);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch barangays:', err);
      });
  }, []);

  // Filter schedules based on truck selection
  const getFilteredSchedules = () => {
    if (isPriorityView) {
      return predefinedSchedules.filter(schedule =>
        schedule.cluster_id === '1C-PB' &&
        (schedule.schedule_type === 'daily_priority' || schedule.schedule_type === 'fixed_days')
      );
    } else {
      const weekNumber = getWeekOfMonth(getWeekStart(currentWeek));
      const filtered = predefinedSchedules.filter(schedule => (
        schedule.cluster_id === selectedClusterId &&
        schedule.schedule_type === 'weekly_cluster' &&
        Number(schedule.week_of_month) === Number(weekNumber)
      ));
      return filtered;
    }
  };

  const filteredSchedules = getFilteredSchedules();

  // Build a map: { 'Mon-6:00': [event, ...], ... }
  const eventMap = {};

  // Add predefined schedule data
  filteredSchedules.forEach(schedule => {
    const dayName = schedule.day_of_week.substring(0, 3); // Mon, Tue, etc.
    const startTime = schedule.start_time.substring(0, 5); // Get HH:MM part
    const timeKey = `${dayName}-${startTime}`;

    if (!eventMap[timeKey]) eventMap[timeKey] = [];

    // Check if schedule is new (created within last 7 days)
    const isNew = (createdAt) => {
      if (!createdAt) return false;
      const created = new Date(createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    };

    // Create event object for predefined schedule
    const predefinedEvent = {
      label: schedule.barangay_name,
      time: schedule.start_time,
      end: schedule.end_time,
      color: schedule.schedule_type === 'weekly_cluster'
        ? 'bg-gradient-to-br from-blue-100 to-blue-200'
        : 'bg-gradient-to-br from-green-100 to-emerald-100',
      border: schedule.schedule_type === 'weekly_cluster'
        ? 'border-l-4 border-blue-500 shadow-blue-200'
        : 'border-l-4 border-green-500 shadow-green-200',
      text: schedule.schedule_type === 'weekly_cluster' ? 'text-blue-900' : 'text-green-900',
      shadow: schedule.schedule_type === 'weekly_cluster' ? 'shadow-md shadow-blue-200/50' : 'shadow-md shadow-green-200/50',
      isNew: isNew(schedule.created_at),
      badgeColor: schedule.schedule_type === 'weekly_cluster'
        ? 'bg-gradient-to-r from-blue-600 to-blue-700'
        : 'bg-gradient-to-r from-emerald-500 to-green-600',
      isPredefinedSchedule: true,
      scheduleType: schedule.schedule_type,
      weekOfMonth: schedule.week_of_month,
      barangayId: schedule.barangay_id,
      updatedAt: schedule.updated_at,
      createdAt: schedule.created_at,
      id: computeScheduleId(schedule),
      schedule
    };

    eventMap[timeKey].push(predefinedEvent);
  });

  // Improved grid sizing for better readability
  const colWidth = '150px';
  const rowHeight = 80;
  const eventWidth = '140px';
  const eventHeight = 65;
  const eventFontSize = 13;

  // Tooltip formatter
  const formatTooltip = (e) => {
    return `${e.label}\n${e.scheduleType}${e.weekOfMonth ? ` (Week ${e.weekOfMonth})` : ''}\n${e.time} - ${e.end}\nUpdated: ${e.updatedAt || '—'}`;
  };

  // Delete handler function
  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) return;
    setDeleteError(null);
    try {
      setDeleteDeleting(true);
      const idVal = (
        scheduleToDelete?.schedule_template_id ||
        scheduleToDelete?.template_id ||
        scheduleToDelete?.id ||
        scheduleToDelete?.schedule_id ||
        scheduleToDelete?.predefined_id
      );
      let res;
      if (idVal) {
        res = await fetch(buildApiUrl('delete_predefined_schedule.php'), {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ id: idVal })
        });
      } else {
        res = await fetch(buildApiUrl('delete_predefined_schedule.php'), {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            barangay_id: scheduleToDelete.barangay_id,
            cluster_id: scheduleToDelete.cluster_id,
            schedule_type: scheduleToDelete.schedule_type,
            day_of_week: scheduleToDelete.day_of_week,
            start_time: (scheduleToDelete.start_time || '').substring(0, 5),
            week_of_month: scheduleToDelete.week_of_month
          })
        });
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to delete schedule');

      setPredefinedSchedules(prev => prev.filter(s => {
        const sId = s.schedule_template_id || s.id;
        if (idVal) return sId !== idVal;
        const sStart = (s.start_time || '').substring(0, 5);
        return !(
          s.barangay_id === scheduleToDelete.barangay_id &&
          s.cluster_id === scheduleToDelete.cluster_id &&
          s.schedule_type === scheduleToDelete.schedule_type &&
          s.day_of_week === scheduleToDelete.day_of_week &&
          sStart === (scheduleToDelete.start_time || '').substring(0, 5)
        );
      }));

      setDeleteOpen(false);
      setScheduleToDelete(null);
      if (editOpen) {
        setEditOpen(false);
        setEditingSchedule(null);
      }
      setSuccessMessage(`Schedule for ${scheduleToDelete.barangay_name} has been deleted successfully!`);
      setSuccessOpen(true);
      await fetchSchedules();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteDeleting(false);
    }
  };

  // Handle click outside menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId].contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoChevronBack className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Schedule Management</h1>
          <div className="ml-auto flex gap-2">
            <button
              onClick={fetchSchedules}
              className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
            >
              <FiRefreshCw className={`w-5 h-5 ${schedulesLoading ? 'animate-spin' : ''}`} />
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
                aria-label="Previous week"
              >
                <IoChevronBack className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 text-sm font-semibold text-gray-700 min-w-[140px] text-center">
                {formatMonthYear(currentWeek)}
              </div>
              <button
                onClick={goToNextWeek}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label="Next week"
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
              onChange={e => { setSelectedView(e.target.value); }}
            >
              {scheduleViewOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <button
                onClick={async () => {
                  setHistoryOpen(true);
                  setHistoryError(null);
                  setHistoryData([]);
                  await fetchScheduleHistory();
                }}
                className="px-3 py-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2 text-sm font-medium bg-white shadow-sm transition-colors"
              >
                <FiClock className="w-4 h-4" />
                <span>History</span>
              </button>

              <button
                onClick={() => { setAddForm({ date: '', start_time: '', end_time: '', barangay_id: '', week_of_month: '' }); setAddError(null); setAddOpen(true); }}
                className="px-4 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 text-sm font-medium shadow-sm shadow-green-200 transition-all hover:shadow-md whitespace-nowrap"
              >
                <span className="text-lg leading-none">+</span>
                Add Schedule
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading and Error States */}
      {schedulesLoading && (
        <div className="text-center py-2">
          <div className="text-gray-600 flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-1.5"></div>
            Loading predefined schedules...
          </div>
        </div>
      )}

      {schedulesError && (
        <div className="text-center py-2">
          <div className="text-red-600 flex items-center justify-center">
            Error: {schedulesError}
          </div>
        </div>
      )}

      {/* Schedule Grid */}
      <div className="flex-1 overflow-auto p-4" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
        {schedulesLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : filteredSchedules.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-xl font-semibold text-gray-700 mb-2">No predefined schedules found</div>
            <div className="text-gray-500 mb-4">
              No predefined schedules available for the selected criteria
            </div>
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
              <div className="bg-green-100 rounded-tl-lg py-1.5 font-semibold text-[10px] text-center">
                Time
              </div>
              {days.map(col => (
                <div key={col.day} className="bg-green-100 rounded-t-lg text-center text-gray-700 font-semibold text-[10px] py-1.5">
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
                        {events.map((event, idx) => {
                          const eventKey = `${event.id || event.label}-${idx}`;
                          const isMenuOpen = openMenuId === eventKey;

                          return (
                            <div
                              key={eventKey}
                              className={`relative rounded-lg ${event.color} ${event.border} ${event.shadow} flex flex-col items-center justify-center mb-2 p-2.5 hover:scale-105 hover:shadow-lg transition-all duration-200 cursor-pointer`}
                              style={{
                                width: eventWidth,
                                height: eventHeight,
                                fontWeight: 700,
                                fontSize: eventFontSize,
                                minHeight: '55px',
                                overflow: 'visible',
                                position: 'relative'
                              }}
                              title={formatTooltip(event)}
                              onClick={(e) => {
                                if (e.target.closest('.menu-button') || e.target.closest('.menu-dropdown')) {
                                  return;
                                }
                                const s = event.schedule;
                                setEditingSchedule(s);
                                setEditForm({
                                  day_of_week: s.day_of_week,
                                  start_time: s.start_time?.substring(0, 5) || '',
                                  end_time: s.end_time?.substring(0, 5) || '',
                                  week_of_month: s.week_of_month || ''
                                });
                                setEditError(null);
                                setEditOpen(true);
                              }}
                            >
                              {event.isNew && (
                                <div className={`absolute -top-1.5 -right-1.5 z-20 ${event.badgeColor} text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-lg border-2 border-white animate-pulse`}>
                                  NEW
                                </div>
                              )}

                              <div className={`absolute top-0 right-0 w-0 h-0 border-t-[12px] border-r-[12px] border-t-transparent ${event.scheduleType === 'weekly_cluster' ? 'border-r-blue-400' : 'border-r-green-400'} rounded-bl-lg opacity-60`}></div>

                              <div
                                className="absolute top-1 right-1 z-30 menu-button"
                                ref={(el) => { menuRefs.current[eventKey] = el; }}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(isMenuOpen ? null : eventKey);
                                  }}
                                  className={`p-1 rounded-full hover:bg-black/10 transition-colors ${isMenuOpen ? 'bg-black/20' : ''}`}
                                  title="More options"
                                >
                                  <FiMoreVertical className="w-3 h-3 text-gray-700" />
                                </button>

                                {isMenuOpen && (
                                  <div className="absolute right-0 top-6 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px] z-40 menu-dropdown">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(null);
                                        const s = event.schedule;
                                        setEditingSchedule(s);
                                        setEditForm({
                                          day_of_week: s.day_of_week,
                                          start_time: s.start_time?.substring(0, 5) || '',
                                          end_time: s.end_time?.substring(0, 5) || '',
                                          week_of_month: s.week_of_month || ''
                                        });
                                        setEditError(null);
                                        setEditOpen(true);
                                      }}
                                      className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <FiEdit2 className="w-3 h-3" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(null);
                                        setScheduleToDelete(event.schedule);
                                        setDeleteError(null);
                                        setDeleteOpen(true);
                                      }}
                                      className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <FiTrash2 className="w-3 h-3" />
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className={`${event.text} text-center font-bold truncate w-full px-1`}>
                                {event.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Modal - Simplified for foreman */}
      {editOpen && editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <button
                className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:text-red-700 hover:bg-gray-100"
                onClick={() => {
                  setEditOpen(false);
                  setEditingSchedule(null);
                  setEditError(null);
                }}
              >✕</button>
              <h2 className="text-lg font-semibold text-gray-800">Edit Schedule</h2>
            </div>
            <div className="px-4 py-3">
              {editError && (
                <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  {editError}
                </div>
              )}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setEditError(null);
                  try {
                    setEditSaving(true);
                    const idVal = editingSchedule.schedule_template_id || editingSchedule.id;
                    const res = await fetch(buildApiUrl('update_predefined_schedule.php'), {
                      method: 'POST',
                      headers: getAuthHeaders(),
                      body: JSON.stringify({
                        schedule_template_id: idVal,
                        day_of_week: editForm.day_of_week,
                        start_time: editForm.start_time + ':00',
                        end_time: editForm.end_time + ':00',
                        week_of_month: editForm.week_of_month || null
                      })
                    });
                    const data = await res.json();
                    if (!data.success) throw new Error(data.message || 'Failed to update schedule');
                    setEditOpen(false);
                    setEditingSchedule(null);
                    setSuccessMessage(`Schedule for ${editingSchedule.barangay_name} has been updated successfully!`);
                    setSuccessOpen(true);
                    await fetchSchedules();
                  } catch (err) {
                    setEditError(err.message);
                  } finally {
                    setEditSaving(false);
                  }
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Day of Week</label>
                  <select
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    value={editForm.day_of_week}
                    onChange={(e) => setEditForm({ ...editForm, day_of_week: e.target.value })}
                    required
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded px-2 py-1"
                      value={editForm.start_time}
                      onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded px-2 py-1"
                      value={editForm.end_time}
                      onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                {editingSchedule.schedule_type === 'weekly_cluster' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Week of Month</label>
                    <select
                      className="w-full border border-gray-300 rounded px-2 py-1"
                      value={editForm.week_of_month}
                      onChange={(e) => setEditForm({ ...editForm, week_of_month: e.target.value })}
                    >
                      <option value="">Select Week</option>
                      {[1, 2, 3, 4].map(w => (
                        <option key={w} value={w}>Week {w}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      setEditOpen(false);
                      setEditingSchedule(null);
                      setEditError(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    disabled={editSaving}
                  >
                    {editSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteOpen && scheduleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <button
                className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:text-red-700 hover:bg-gray-100"
                onClick={() => {
                  setDeleteOpen(false);
                  setScheduleToDelete(null);
                  setDeleteError(null);
                }}
              >✕</button>
              <h2 className="text-lg font-semibold text-gray-800">Delete Schedule</h2>
            </div>
            <div className="px-4 py-3">
              {deleteError && (
                <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  {deleteError}
                </div>
              )}
              <p className="text-sm text-gray-700 mb-4">
                Are you sure you want to delete this schedule?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-4">
                <p className="text-sm font-semibold text-gray-800">{scheduleToDelete.barangay_name}</p>
                <p className="text-xs text-gray-600">{scheduleToDelete.day_of_week} • {scheduleToDelete.start_time?.substring(0, 5)} - {scheduleToDelete.end_time?.substring(0, 5)}</p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setDeleteOpen(false);
                    setScheduleToDelete(null);
                    setDeleteError(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  onClick={handleDeleteSchedule}
                  disabled={deleteDeleting}
                >
                  {deleteDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <button
                className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:text-red-700 hover:bg-gray-100"
                onClick={() => {
                  setAddOpen(false);
                  setAddError(null);
                }}
                disabled={addSaving}
              >✕</button>
              <h2 className="text-lg font-semibold text-gray-800">Add Schedule</h2>
            </div>
            <div className="px-4 py-3">
              {addError && (
                <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  {addError}
                </div>
              )}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setAddError(null);

                  if (!addForm.barangay_id) {
                    setAddError('Please select a barangay.');
                    return;
                  }

                  if (!addForm.start_time || !addForm.end_time) {
                    setAddError('Please enter start and end times.');
                    return;
                  }

                  if (addForm.start_time >= addForm.end_time) {
                    setAddError('Start time must be earlier than end time.');
                    return;
                  }

                  // Check for duplicate schedule
                  let dayOfWeek = 'Monday';
                  if (addForm.date) {
                    const dayIndex = new Date(addForm.date).getDay();
                    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    dayOfWeek = dayNames[dayIndex];
                  }

                  const weekOfMonth = !isPriorityView ? (addForm.week_of_month ? parseInt(addForm.week_of_month) : getWeekOfMonth(addForm.date ? new Date(addForm.date) : new Date())) : null;

                  // Check if schedule already exists
                  const existingSchedule = filteredSchedules.find(s => {
                    const matchesBarangay = String(s.barangay_id) === String(addForm.barangay_id);
                    const matchesDay = s.day_of_week === dayOfWeek;
                    const matchesTime = s.start_time?.substring(0, 5) === addForm.start_time;
                    const matchesWeek = !isPriorityView ? (s.week_of_month === weekOfMonth || (!s.week_of_month && !weekOfMonth)) : true;

                    return matchesBarangay && matchesDay && matchesTime && matchesWeek;
                  });

                  if (existingSchedule) {
                    setDuplicateSchedule(existingSchedule);
                    setDuplicateWarningOpen(true);
                    return;
                  }

                  try {
                    setAddSaving(true);

                    const schedule_type = isPriorityView ? 'daily_priority' : 'weekly_cluster';
                    const cluster_id = selectedClusterId;

                    const barangay = barangayList.find(b => String(b.barangay_id) === String(addForm.barangay_id));

                    const payload = {
                      barangay_id: addForm.barangay_id,
                      barangay_name: barangay ? barangay.barangay_name : undefined,
                      cluster_id,
                      schedule_type,
                      day_of_week: dayOfWeek,
                      start_time: addForm.start_time + ':00',
                      end_time: addForm.end_time + ':00',
                      frequency_per_day: 1,
                      week_of_month: weekOfMonth,
                      is_active: 1
                    };

                    const res = await fetch(buildApiUrl('create_predefined_schedule.php'), {
                      method: 'POST',
                      headers: getAuthHeaders(),
                      body: JSON.stringify(payload)
                    });

                    const data = await res.json();
                    if (!data.success) {
                      // Check if it's a duplicate error from database
                      if (data.message && data.message.includes('Duplicate') || data.message.includes('duplicate')) {
                        setDuplicateSchedule({
                          barangay_name: barangay?.barangay_name || addForm.barangay_id,
                          day_of_week: dayOfWeek,
                          start_time: addForm.start_time
                        });
                        setDuplicateWarningOpen(true);
                        setAddSaving(false);
                        return;
                      }
                      throw new Error(data.message || 'Failed to create schedule');
                    }

                    setAddOpen(false);
                    setAddForm({ date: '', start_time: '', end_time: '', barangay_id: '', week_of_month: '' });
                    setAddError(null);
                    setSuccessMessage(`Schedule for ${barangay?.barangay_name || 'barangay'} on ${dayOfWeek} at ${addForm.start_time} has been created successfully!`);
                    setSuccessOpen(true);
                    await fetchSchedules();
                  } catch (err) {
                    setAddError(err.message || 'Failed to create schedule');
                  } finally {
                    setAddSaving(false);
                  }
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Barangay</label>
                  <select
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    value={addForm.barangay_id}
                    onChange={(e) => setAddForm({ ...addForm, barangay_id: e.target.value })}
                    required
                  >
                    <option value="">Select barangay</option>
                    {barangayList
                      .filter(b => isPriorityView ? b.cluster_id === '1C-PB' : b.cluster_id === selectedClusterId)
                      .map(b => (
                        <option key={b.barangay_id} value={b.barangay_id}>{b.barangay_name}</option>
                      ))}
                  </select>
                </div>

                {!isPriorityView && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Week of Month</label>
                    <select
                      className="w-full border border-gray-300 rounded px-2 py-1"
                      value={addForm.week_of_month || getWeekOfMonth(addForm.date ? new Date(addForm.date) : new Date()).toString()}
                      onChange={(e) => setAddForm({ ...addForm, week_of_month: e.target.value })}
                      required
                    >
                      <option value="">Select Week</option>
                      {[1, 2, 3, 4].map(w => (
                        <option key={w} value={w}>Week {w}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date (for day of week)</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    value={addForm.date}
                    onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Select a date to determine the day of week</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded px-2 py-1"
                      value={addForm.start_time}
                      onChange={(e) => setAddForm({ ...addForm, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded px-2 py-1"
                      value={addForm.end_time}
                      onChange={(e) => setAddForm({ ...addForm, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      setAddOpen(false);
                      setAddError(null);
                      setAddForm({ date: '', start_time: '', end_time: '', barangay_id: '', week_of_month: '' });
                    }}
                    disabled={addSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    disabled={addSaving}
                  >
                    {addSaving ? 'Creating...' : 'Create Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] relative overflow-hidden flex flex-col">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
              <button
                className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:text-red-700 hover:bg-gray-100"
                onClick={() => {
                  setHistoryOpen(false);
                  setHistoryError(null);
                  setHistoryData([]);
                }}
              >✕</button>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FiClock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Schedule History</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Track all schedule changes by admin and foreman</p>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 flex-1 overflow-y-auto">
              {historyLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading history...</p>
                </div>
              )}

              {historyError && (
                <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  {historyError}
                </div>
              )}

              {!historyLoading && !historyError && historyData.length === 0 && (
                <div className="text-center py-8">
                  <FiClock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No history records found</p>
                </div>
              )}

              {!historyLoading && !historyError && historyData.length > 0 && (
                <div className="space-y-3">
                  {historyData.map((record) => {
                    const actionColors = {
                      create: 'bg-green-100 text-green-800 border-green-200',
                      update: 'bg-blue-100 text-blue-800 border-blue-200',
                      delete: 'bg-red-100 text-red-800 border-red-200',
                      restore: 'bg-purple-100 text-purple-800 border-purple-200'
                    };
                    const actionColor = actionColors[record.action] || 'bg-gray-100 text-gray-800 border-gray-200';

                    return (
                      <div key={record.history_id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold border uppercase ${actionColor}`}>
                              {record.action}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(record.changed_at).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Actor</p>
                            <p className="text-sm text-gray-800 font-semibold">
                              {record.actor.name || record.actor.username}
                            </p>
                            <p className="text-xs text-gray-500">
                              {record.actor.role || 'Unknown Role'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Schedule</p>
                            <p className="text-sm text-gray-800 font-semibold">
                              {record.schedule_info?.barangay_name || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {record.schedule_info?.day_of_week} • {record.schedule_info?.start_time?.substring(0, 5)} - {record.schedule_info?.end_time?.substring(0, 5)}
                            </p>
                          </div>
                        </div>

                        {record.action === 'update' && record.before_payload && record.after_payload && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-600 mb-1">Changes:</p>
                            <div className="text-xs space-y-1">
                              {Object.keys(record.after_payload).map((key) => {
                                if (key === 'updated_at' || key === 'created_at' || key === 'deleted_at' ||
                                  key === 'created_by' || key === 'updated_by' || key === 'deleted_by' ||
                                  key === 'schedule_template_id' || key === 'is_active') return null;

                                const beforeVal = record.before_payload[key];
                                const afterVal = record.after_payload[key];

                                if (beforeVal === afterVal) return null;

                                return (
                                  <div key={key} className="flex items-center gap-2">
                                    <span className="text-gray-600 font-medium">{key}:</span>
                                    <span className="text-red-600 line-through">{String(beforeVal || 'N/A')}</span>
                                    <span className="text-gray-400">→</span>
                                    <span className="text-green-600 font-semibold">{String(afterVal || 'N/A')}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {record.remarks && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-600 italic">{record.remarks}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="text-xs text-gray-600">
                Total: {historyTotal} record{historyTotal !== 1 ? 's' : ''}
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setHistoryOpen(false);
                  setHistoryError(null);
                  setHistoryData([]);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Warning Modal */}
      {duplicateWarningOpen && duplicateSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <button
                className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:text-red-700 hover:bg-gray-100"
                onClick={() => {
                  setDuplicateWarningOpen(false);
                  setDuplicateSchedule(null);
                }}
              >✕</button>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="text-yellow-600 text-xl">⚠</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Schedule Already Exists</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Cannot create duplicate schedule</p>
                </div>
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-gray-700 mb-4">
                A schedule already exists for this barangay, day, and time:
              </p>
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600 w-24">Barangay:</span>
                    <span className="text-sm text-gray-800 font-semibold">{duplicateSchedule.barangay_name || duplicateSchedule.barangay_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600 w-24">Day:</span>
                    <span className="text-sm text-gray-800">{duplicateSchedule.day_of_week}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600 w-24">Time:</span>
                    <span className="text-sm text-gray-800">
                      {duplicateSchedule.start_time?.substring(0, 5) || addForm.start_time} - {duplicateSchedule.end_time?.substring(0, 5) || addForm.end_time}
                    </span>
                  </div>
                  {duplicateSchedule.week_of_month && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600 w-24">Week:</span>
                      <span className="text-sm text-gray-800">Week {duplicateSchedule.week_of_month}</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-4">
                Please choose a different time, day, or barangay to create a new schedule.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setDuplicateWarningOpen(false);
                    setDuplicateSchedule(null);
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <button
                className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:text-red-700 hover:bg-gray-100"
                onClick={() => {
                  setSuccessOpen(false);
                  setSuccessMessage('');
                }}
              >✕</button>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-xl">✓</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Success!</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Operation completed successfully</p>
                </div>
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-gray-700 mb-4">
                {successMessage || 'Operation completed successfully!'}
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  onClick={() => {
                    setSuccessOpen(false);
                    setSuccessMessage('');
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
