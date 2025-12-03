import React, { useState, useEffect, useRef } from 'react';
import { buildApiUrl } from '../../config/api.js';
import { FiMoreVertical, FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';

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

export default function ManageSchedule() {
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
  const [editSuccessOpen, setEditSuccessOpen] = useState(false);
  // Delete modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteDeleting, setDeleteDeleting] = useState(false);
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);
  // Add schedule modal state
  const [addOpen, setAddOpen] = useState(false);
  const [addError, setAddError] = useState(null);
  const [addSaving, setAddSaving] = useState(false);
  const [addForm, setAddForm] = useState({ date: '', start_time: '', end_time: '', barangay_id: '' });
  const [duplicateErrorOpen, setDuplicateErrorOpen] = useState(false);
  const [duplicateErrorMessage, setDuplicateErrorMessage] = useState('');

  // History modal state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyTotal, setHistoryTotal] = useState(0);

  // Ctrl-based multi-select state
  const [ctrlPressed, setCtrlPressed] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const toggleSelected = (id) => {
    if (!id) return; // guard
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const clearSelected = () => setSelectedIds(new Set());
  const selectedCount = selectedIds.size;
  const selectedArray = Array.from(selectedIds);

  // Menu state for three-dot menu
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});

  // Track Ctrl/Meta key
  useEffect(() => {
    const down = (e) => {
      if (e.ctrlKey || e.key === 'Control' || e.metaKey) setCtrlPressed(true);
    };
    const up = (e) => {
      if (!e.ctrlKey && !e.metaKey) setCtrlPressed(false);
      if (e.key === 'Control' && !e.metaKey) setCtrlPressed(false);
    };
    const onBlur = () => setCtrlPressed(false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

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
      // We'll filter them in getFilteredSchedules based on truck selection
      if (isPriority) {
        // Priority barangays use daily_priority and fixed_days schedules
        params.set('schedule_type', 'daily_priority,fixed_days');
      } else {
        // Clustered barangays use weekly_cluster schedules
        params.set('schedule_type', 'weekly_cluster');
        params.set('cluster_id', currentOption.clusterId);
        params.set('week_of_month', String(weekNumber));
      }
      // Limit to visible days (Monday to Sunday)
      params.set('days', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].join(','));

      // Fetch predefined schedules
      const url = `${buildApiUrl('get_predefined_schedules.php')}?${params.toString()}`;
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      const data = await res.json();

      let allSchedules = [];
      if (data.success) {
        allSchedules = Array.isArray(data.schedules) ? data.schedules : [];
      }

      // Also fetch special pickup schedules for the current week
      try {
        const weekStart = getWeekStart(currentWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const calendarParams = new URLSearchParams({
          start_date: weekStart.toISOString().split('T')[0],
          end_date: weekEnd.toISOString().split('T')[0],
          schedule_type: 'special_pickup'
        });

        const specialRes = await fetch(
          `${buildApiUrl('get_calendar_schedules.php')}?${calendarParams}`,
          { headers: getAuthHeaders() }
        );
        const specialData = await specialRes.json();

        if (specialData.success && Array.isArray(specialData.schedules)) {
          // Add special pickups to the schedule list
          allSchedules = [...allSchedules, ...specialData.schedules];
        }
      } catch (err) {
        console.error('Failed to fetch special pickups:', err);
      }

      setPredefinedSchedules(allSchedules);
      setSchedulesError(null);
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

      let allHistory = [];
      if (data.success) {
        allHistory = Array.isArray(data.history) ? data.history : [];
      }

      // Also fetch completed special pickup schedules
      try {
        const specialParams = new URLSearchParams({
          show_completed: 'true',
          schedule_type: 'special_pickup'
        });

        const specialRes = await fetch(
          `${buildApiUrl('get_calendar_schedules.php')}?${specialParams}`,
          { headers: getAuthHeaders() }
        );
        const specialData = await specialRes.json();

        if (specialData.success && Array.isArray(specialData.schedules)) {
          const specialHistory = specialData.schedules.map(s => ({
            ...s,
            action: 'completed',
            changed_at: s.updated_at || s.created_at,
            schedule_type: 'special_pickup'
          }));
          allHistory = [...allHistory, ...specialHistory];
        }
      } catch (err) {
        console.error('Failed to fetch special pickup history:', err);
      }

      allHistory.sort((a, b) => {
        const dateA = new Date(a.changed_at || a.updated_at || a.created_at);
        const dateB = new Date(b.changed_at || b.updated_at || b.created_at);
        return dateB - dateA;
      });

      setHistoryData(allHistory);
      setHistoryTotal(allHistory.length);
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
    // First, separate special pickups from regular schedules
    const specialPickups = predefinedSchedules.filter(s => s.schedule_type === 'special_pickup');
    const regularSchedules = predefinedSchedules.filter(s => s.schedule_type !== 'special_pickup');

    let filtered = [];
    if (isPriorityView) {
      // Priority: Show priority barangays (cluster_id = 1C-PB) with daily_priority or fixed_days schedule types
      filtered = regularSchedules.filter(schedule =>
        schedule.cluster_id === '1C-PB' &&
        (schedule.schedule_type === 'daily_priority' || schedule.schedule_type === 'fixed_days')
      );
    } else {
      // Clustered view: Show barangays for the selected cluster
      const weekNumber = getWeekOfMonth(getWeekStart(currentWeek));
      filtered = regularSchedules.filter(schedule => (
        schedule.cluster_id === selectedClusterId &&
        schedule.schedule_type === 'weekly_cluster' &&
        Number(schedule.week_of_month) === Number(weekNumber)
      ));
    }

    // Always include special pickups regardless of view
    return [...filtered, ...specialPickups];
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
    const isSpecialPickup = schedule.schedule_type === 'special_pickup';
    const predefinedEvent = {
      label: schedule.barangay_name,
      time: schedule.start_time,
      end: schedule.end_time,
      // Orange for special_pickup, Green for daily_priority/fixed_days, blue for weekly_cluster
      color: isSpecialPickup
        ? 'bg-gradient-to-br from-orange-100 to-amber-100'
        : schedule.schedule_type === 'weekly_cluster'
          ? 'bg-gradient-to-br from-blue-100 to-blue-200'
          : 'bg-gradient-to-br from-green-100 to-emerald-100',
      border: isSpecialPickup
        ? 'border-l-4 border-orange-500 shadow-orange-200'
        : schedule.schedule_type === 'weekly_cluster'
          ? 'border-l-4 border-blue-500 shadow-blue-200'
          : 'border-l-4 border-green-500 shadow-green-200',
      text: isSpecialPickup
        ? 'text-orange-900'
        : schedule.schedule_type === 'weekly_cluster' ? 'text-blue-900' : 'text-green-900',
      shadow: isSpecialPickup
        ? 'shadow-md shadow-orange-200/50'
        : schedule.schedule_type === 'weekly_cluster' ? 'shadow-md shadow-blue-200/50' : 'shadow-md shadow-green-200/50',
      isNew: isNew(schedule.created_at),
      badgeColor: isSpecialPickup
        ? 'bg-gradient-to-r from-orange-500 to-amber-600'
        : schedule.schedule_type === 'weekly_cluster'
          ? 'bg-gradient-to-r from-blue-600 to-blue-700'
          : 'bg-gradient-to-r from-emerald-500 to-green-600',
      isPredefinedSchedule: true,
      isSpecialPickup: isSpecialPickup,
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
  const colWidth = '150px'; // Reduced from 200px to fit 7 days better
  const rowHeight = 80;
  const eventWidth = '140px'; // Reduced to match smaller column
  const eventHeight = 65; // Slightly taller for better visual appeal
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

      // Remove locally
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
      }))

      setDeleteOpen(false);
      setScheduleToDelete(null);
      setDeleteSuccessOpen(true);
      // Also close edit modal if it's open
      if (editOpen) {
        setEditOpen(false);
        setEditingSchedule(null);
      }
      await fetchSchedules();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteDeleting(false);
    }
  };

  // Bulk helpers
  const bulkDelete = async () => {
    if (selectedCount === 0) return;
    if (!window.confirm(`Delete ${selectedCount} selected schedule(s)?`)) return;
    setEditSaving(true);
    try {
      for (const id of selectedArray) {
        const isNumeric = /^\d+$/.test(String(id));
        if (isNumeric) {
          await fetch(buildApiUrl('delete_predefined_schedule.php'), {
            method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ id })
          }).then(r => r.json()).then(d => { if (!d.success) throw new Error(d.message || 'Delete failed'); });
        } else {
          // Composite id format: barangay|type|cluster|day|start
          const [barangay_id, schedule_type, cluster_id, day_of_week, start_time] = String(id).split('|');
          await fetch(buildApiUrl('delete_predefined_schedule.php'), {
            method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({
              barangay_id, schedule_type, cluster_id, day_of_week, start_time
            })
          }).then(r => r.json()).then(d => { if (!d.success) throw new Error(d.message || 'Delete failed'); });
        }
      }
      clearSelected();
      await fetchSchedules();
    } catch (err) {
      alert(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkError, setBulkError] = useState(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkForm, setBulkForm] = useState({ day_of_week: '', start_time: '', end_time: '', week_of_month: '' });
  const bulkEditSubmit = async (e) => {
    e.preventDefault();
    setBulkError(null);
    if (!bulkForm.day_of_week || !bulkForm.start_time || !bulkForm.end_time) {
      setBulkError('Please fill out day, start time and end time.');
      return;
    }
    if (bulkForm.start_time >= bulkForm.end_time) {
      setBulkError('Start time must be earlier than end time.');
      return;
    }
    setBulkSaving(true);
    try {
      for (const id of selectedArray) {
        const isNumeric = /^\d+$/.test(String(id));
        if (isNumeric) {
          await fetch(buildApiUrl('update_predefined_schedule.php'), {
            method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({
              schedule_template_id: id,
              day_of_week: bulkForm.day_of_week,
              start_time: bulkForm.start_time,
              end_time: bulkForm.end_time,
              week_of_month: bulkForm.week_of_month ? Number(bulkForm.week_of_month) : undefined
            })
          }).then(r => r.json()).then(d => { if (!d.success) throw new Error(d.message || 'Update failed'); });
        } else {
          const [barangay_id, schedule_type, cluster_id, dayOfWeekOriginal, startOriginal] = String(id).split('|');
          await fetch(buildApiUrl('update_predefined_schedule_by_fields.php'), {
            method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({
              barangay_id, schedule_type, cluster_id,
              match_day_of_week: dayOfWeekOriginal,
              match_start_time: startOriginal,
              day_of_week: bulkForm.day_of_week,
              start_time: bulkForm.start_time,
              end_time: bulkForm.end_time,
              week_of_month: bulkForm.week_of_month ? Number(bulkForm.week_of_month) : undefined
            })
          }).then(r => r.json()).then(d => { if (!d.success) throw new Error(d.message || 'Update failed'); });
        }
      }
      setBulkOpen(false);
      clearSelected();
      await fetchSchedules();
    } catch (err) {
      setBulkError(err.message);
    } finally {
      setBulkSaving(false);
    }
  };

  // Clear selection on context changes
  useEffect(() => {
    clearSelected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedView, currentWeek]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRefs.current[openMenuId]) {
        if (!menuRefs.current[openMenuId].contains(event.target)) {
          setOpenMenuId(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  return (
    <div className="p-2 max-w-full overflow-x-auto bg-emerald-50 min-h-screen font-sans text-xs">
      {/* Bulk action bar (visible when there are selections) */}
      {selectedCount > 0 && (
        <div className="mb-2 flex items-center justify-between rounded border border-emerald-200 bg-emerald-50 px-2 py-1">
          <div className="text-emerald-900 text-[10px] font-medium">{selectedCount} selected</div>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 text-[10px]" onClick={() => setBulkOpen(true)}>Edit</button>
            <button className="px-2 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50 text-[10px]" onClick={bulkDelete}>Delete</button>
            <button className="px-2 py-1 rounded border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-[10px]" onClick={clearSelected}>Clear</button>
          </div>
        </div>
      )}

      {/* Header removed - using global admin header */}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <button
            onClick={goToPreviousWeek}
            className="px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
            aria-label="Previous week"
            title="Previous week"
          >
            ←
          </button>
          <div className="px-2 py-1 rounded text-green-900 font-medium text-[10px]">
            {formatMonthYear(currentWeek)}
          </div>
          <button
            onClick={goToNextWeek}
            className="px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
            aria-label="Next week"
            title="Next week"
          >
            →
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 text-[10px]"
          title="Go to today"
        >
          Today
        </button>

        <div className="flex items-center gap-3">
          <select
            className="border border-gray-300 rounded-md px-2 py-0.5 text-[10px] font-semibold text-green-700 focus:border-green-600 focus:outline-none bg-white"
            value={selectedView}
            onChange={e => { setSelectedView(e.target.value); clearSelected(); }}
            title="Select schedule view"
          >
            {scheduleViewOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={async () => {
              setHistoryOpen(true);
              setHistoryError(null);
              setHistoryData([]);
              await fetchScheduleHistory();
            }}
            className="ml-1 px-2 py-0.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1"
            title="View schedule history"
          >
            <FiClock className="w-3 h-3" />
            History
          </button>
          <button
            onClick={() => { setAddForm({ date: '', start_time: '', end_time: '', barangay_id: '' }); setAddError(null); setAddOpen(true); }}
            className="ml-1 px-2 py-0.5 rounded bg-green-600 text-white hover:bg-green-700"
            title="Add schedule"
          >
            Add Schedule
          </button>
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
      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 180px)', width: '100%' }}>
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
                minWidth: '1150px', // 100px + (7 * 150px) = 1150px minimum
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
                minWidth: '1150px', // 100px + (7 * 150px) = 1150px minimum
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
                    const hasEvents = events.length > 0;
                    const cellMenuKey = `cell-${key}`;
                    const isCellMenuOpen = openMenuId === cellMenuKey;

                    return (
                      <div
                        key={slot}
                        className="w-full flex items-center justify-center border-r border-gray-100 relative"
                        style={{ height: rowHeight }}
                      >
                        {hasEvents ? (
                          // Cell with schedule cards - show cards with their menus
                          <>
                            <div className="flex flex-col items-center w-full">
                              {events.map((event, idx) => {
                                const eventKey = `${event.id || event.label}-${idx}`;

                                return (
                                  <div key={eventKey} className="mb-2">
                                    <div
                                      className={`relative rounded-lg ${event.color} ${event.border} ${event.shadow} flex flex-col items-center justify-center p-2.5 transition-all duration-200 ${event.isSpecialPickup ? 'cursor-not-allowed opacity-80' : 'hover:scale-105 hover:shadow-lg cursor-pointer'} ${selectedIds.has(event.id) ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}`}
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
                                        // Block all interactions with special pickups
                                        if (event.isSpecialPickup || event.scheduleType === 'special_pickup') {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          return;
                                        }

                                        // If Ctrl/Meta is held, toggle selection; otherwise open edit
                                        if (e.ctrlKey || e.metaKey || ctrlPressed) {
                                          toggleSelected(event.id);
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
                                      {/* NEW badge for recently created schedules */}
                                      {event.isNew && (
                                        <div className={`absolute -top-1.5 -right-1.5 z-20 ${event.badgeColor} text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-lg border-2 border-white animate-pulse`}>
                                          NEW
                                        </div>
                                      )}

                                      {/* Decorative corner accent */}
                                      <div className={`absolute top-0 right-0 w-0 h-0 border-t-[12px] border-r-[12px] border-t-transparent ${event.scheduleType === 'special_pickup' ? 'border-r-orange-400' : event.scheduleType === 'weekly_cluster' ? 'border-r-blue-400' : 'border-r-green-400'} rounded-bl-lg opacity-60`}></div>

                                      {/* Main content */}
                                      <div className="flex items-center justify-center w-full gap-2 min-w-0 relative z-10">
                                        {/* Icon indicator */}
                                        <div className={`flex-shrink-0 w-2 h-2 rounded-full ${event.scheduleType === 'special_pickup' ? 'bg-orange-500' : event.scheduleType === 'weekly_cluster' ? 'bg-blue-500' : 'bg-green-500'} shadow-sm`}></div>

                                        <span
                                          className={`text-sm font-bold ${event.text} truncate flex-1 text-center`}
                                          style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            lineHeight: '1.3'
                                          }}
                                        >
                                          {event.label}
                                        </span>

                                        {(ctrlPressed || selectedCount > 0) && (
                                          <input
                                            type="checkbox"
                                            className="h-4 w-4 flex-shrink-0"
                                            checked={selectedIds.has(event.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => toggleSelected(event.id)}
                                          />
                                        )}
                                      </div>

                                      {/* Subtle pattern overlay */}
                                      <div className={`absolute inset-0 opacity-5 ${event.scheduleType === 'weekly_cluster' ? 'bg-blue-600' : 'bg-green-600'}`} style={{
                                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)'
                                      }}></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Three-dot menu for cells with cards - positioned at top-right */}
                            <div
                              className="absolute top-2 right-2 z-30"
                              ref={(el) => { menuRefs.current[cellMenuKey] = el; }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(isCellMenuOpen ? null : cellMenuKey);
                                }}
                                className={`p-1 rounded-full hover:bg-gray-200 transition-colors ${isCellMenuOpen ? 'bg-gray-300' : ''}`}
                                title="More options"
                              >
                                <FiMoreVertical className="w-3.5 h-3.5 text-gray-600" />
                              </button>

                              {/* Dropdown menu */}
                              {isCellMenuOpen && (
                                <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px] z-50">
                                  {events.map((event, idx) => (
                                    <div key={idx}>
                                      <div className="px-3 py-1 text-xs font-semibold text-gray-500 border-b border-gray-100">
                                        {event.label}
                                      </div>
                                      {/* Conditional rendering based on schedule type */}
                                      {event.isSpecialPickup || event.scheduleType === 'special_pickup' ? (
                                        <div className="px-3 py-2 text-xs text-gray-500 italic">
                                          Cannot edit/delete special pickup schedules from calendar
                                        </div>
                                      ) : (
                                        <>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setOpenMenuId(null);
                                              const s = event.schedule;
                                              setEditingSchedule(s);
                                              setEditForm({
                                                barangay_id: s.barangay_id,
                                                barangay_name: s.barangay_name,
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
                                            className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                                          >
                                            <FiTrash2 className="w-3 h-3" />
                                            Delete
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          // Empty cell - show three-dot menu for adding schedule
                          <div
                            className="absolute top-2 right-2"
                            ref={(el) => { menuRefs.current[cellMenuKey] = el; }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(isCellMenuOpen ? null : cellMenuKey);
                              }}
                              className={`p-1 rounded-full hover:bg-gray-200 transition-colors ${isCellMenuOpen ? 'bg-gray-300' : ''}`}
                              title="Add schedule"
                            >
                              <FiMoreVertical className="w-3.5 h-3.5 text-gray-400" />
                            </button>

                            {/* Dropdown menu for empty cell */}
                            {isCellMenuOpen && (
                              <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px] z-50">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    // Pre-fill the add form with this cell's day and time
                                    const fullDate = new Date(day.fullDate);
                                    const dateStr = fullDate.toISOString().split('T')[0];
                                    setAddForm({
                                      date: dateStr,
                                      start_time: slot,
                                      end_time: '',
                                      barangay_id: ''
                                    });
                                    setAddError(null);
                                    setAddOpen(true);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <FiEdit2 className="w-3 h-3" />
                                  Add Schedule
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bulk Edit Modal */}
      {selectedCount > 0 && bulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative p-3">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-green-700" onClick={() => setBulkOpen(false)}>✕</button>
            <h2 className="text-lg font-semibold text-green-800 mb-4">Edit {selectedCount} Selected</h2>
            {bulkError && <div className="text-red-600 text-sm mb-3">{bulkError}</div>}
            <form onSubmit={bulkEditSubmit} className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-green-700 mb-0.5">Day of Week</label>
                  <select className="w-full border border-green-200 rounded px-2 py-1" value={bulkForm.day_of_week} onChange={(e) => setBulkForm({ ...bulkForm, day_of_week: e.target.value })} required>
                    <option value="">Select day</option>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (<option key={d} value={d}>{d}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-green-700 mb-0.5">Week of Month</label>
                  <input type="number" min={1} max={4} className="w-full border border-green-200 rounded px-2 py-1" value={bulkForm.week_of_month || ''} onChange={(e) => setBulkForm({ ...bulkForm, week_of_month: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-green-700 mb-0.5">Start Time</label>
                  <input type="time" className="w-full border border-green-200 rounded px-2 py-1" value={bulkForm.start_time} onChange={(e) => setBulkForm({ ...bulkForm, start_time: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-[10px] text-green-700 mb-0.5">End Time</label>
                  <input type="time" className="w-full border border-green-200 rounded px-2 py-1" value={bulkForm.end_time} onChange={(e) => setBulkForm({ ...bulkForm, end_time: e.target.value })} required />
                </div>
              </div>
              <div className="flex items-center justify-end gap-1 pt-1">
                <button type="button" className="px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => setBulkOpen(false)}>Cancel</button>
                <button type="submit" className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50" disabled={bulkSaving}>{bulkSaving ? 'Saving...' : 'Apply Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline Edit Modal */}
      {editOpen && editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden border-4 border-emerald-500">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 bg-gradient-to-r from-emerald-50 to-green-50">
              <h2 className="text-lg font-bold text-emerald-800">Edit Schedule</h2>
            </div>

            {editError && (
              <div className="mx-4 mt-3 rounded-lg bg-red-50 border-2 border-red-300 px-4 py-3 flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">{editError}</p>
                </div>
              </div>
            )}

            {/* Body */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setEditError(null);

                // Validation
                if (!editForm.barangay_id && !editingSchedule.barangay_id) {
                  setEditError('Please select a barangay.');
                  return;
                }

                if (editingSchedule.schedule_type === 'weekly_cluster') {
                  const w = Number(editForm.week_of_month);
                  if (!w || w < 1 || w > 4) {
                    setEditError('Week of month must be between 1 and 4 for weekly clusters.');
                    return;
                  }
                }

                try {
                  setEditSaving(true);
                  const idVal = (
                    editingSchedule?.schedule_template_id ||
                    editingSchedule?.template_id ||
                    editingSchedule?.id ||
                    editingSchedule?.schedule_id ||
                    editingSchedule?.predefined_id
                  );
                  let res;
                  if (!idVal) {
                    res = await fetch(buildApiUrl('update_predefined_schedule_by_fields.php'), {
                      method: 'POST',
                      headers: getAuthHeaders(),
                      body: JSON.stringify({
                        barangay_id: editingSchedule.barangay_id,
                        cluster_id: editingSchedule.cluster_id,
                        schedule_type: editingSchedule.schedule_type,
                        match_day_of_week: editingSchedule.day_of_week,
                        match_start_time: (editingSchedule.start_time || '').substring(0, 5),
                        day_of_week: editForm.day_of_week,
                        start_time: editForm.start_time,
                        end_time: editForm.end_time,
                        week_of_month: editingSchedule.schedule_type === 'weekly_cluster' ? Number(editForm.week_of_month) : undefined
                      })
                    });
                  } else {
                    res = await fetch(buildApiUrl('update_predefined_schedule.php'), {
                      method: 'POST',
                      headers: getAuthHeaders(),
                      body: JSON.stringify({
                        schedule_template_id: idVal,
                        template_id: idVal,
                        id: idVal,
                        schedule_id: idVal,
                        predefined_id: idVal,
                        barangay_id: editForm.barangay_id || editingSchedule.barangay_id,
                        day_of_week: editForm.day_of_week,
                        start_time: editForm.start_time,
                        end_time: editForm.end_time,
                        week_of_month: editingSchedule.schedule_type === 'weekly_cluster' ? Number(editForm.week_of_month) : undefined
                      })
                    });
                  }
                  const data = await res.json();
                  if (!data.success) throw new Error(data.message || 'Failed to update schedule');

                  // Update local state
                  setPredefinedSchedules((prev) => {
                    const originalDay = editingSchedule.day_of_week;
                    const originalStart = (editingSchedule.start_time || '').substring(0, 5);
                    const idVal = (
                      editingSchedule?.schedule_template_id ||
                      editingSchedule?.template_id ||
                      editingSchedule?.id ||
                      editingSchedule?.schedule_id ||
                      editingSchedule?.predefined_id
                    );
                    return prev.map((s) => {
                      const sStart = (s.start_time || '').substring(0, 5);
                      const idMatch = idVal && (
                        s.schedule_template_id === idVal || s.id === idVal
                      );
                      const fieldMatch = (
                        s.barangay_id === editingSchedule.barangay_id &&
                        s.cluster_id === editingSchedule.cluster_id &&
                        s.schedule_type === editingSchedule.schedule_type &&
                        s.day_of_week === originalDay &&
                        sStart === originalStart
                      );
                      if (idMatch || fieldMatch) {
                        return {
                          ...s,
                          barangay_id: editForm.barangay_id || editingSchedule.barangay_id,
                          barangay_name: editForm.barangay_name || editingSchedule.barangay_name,
                          day_of_week: editForm.day_of_week,
                          start_time: editForm.start_time,
                          end_time: editForm.end_time,
                          week_of_month: editingSchedule.schedule_type === 'weekly_cluster'
                            ? Number(editForm.week_of_month)
                            : s.week_of_month
                        };
                      }
                      return s;
                    });
                  });
                  setEditOpen(false);
                  setEditSuccessOpen(true);
                } catch (err) {
                  // Check if it's a duplicate error
                  if (err.message && (err.message.includes('Duplicate entry') || err.message.includes('1062'))) {
                    setEditOpen(false);
                    setDuplicateErrorMessage('A schedule already exists for this barangay at this time. Please choose a different time or barangay.');
                    setDuplicateErrorOpen(true);
                  } else {
                    setEditError(err.message);
                  }
                } finally {
                  setEditSaving(false);
                }
              }}
              className="px-4 py-4 space-y-4"
            >
              {/* Time Display (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <div className="text-lg font-semibold text-gray-900">
                  {editForm.start_time} - {editForm.end_time}
                </div>
              </div>

              {/* Barangay Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                <select
                  className="w-full border-2 border-emerald-400 rounded-lg px-3 py-2 bg-emerald-50 text-gray-900 font-medium focus:border-emerald-500 focus:ring-0"
                  value={editForm.barangay_id !== undefined ? String(editForm.barangay_id) : String(editingSchedule.barangay_id)}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    const selectedBarangay = barangayList.find(b => String(b.barangay_id) === selectedValue);
                    if (selectedBarangay) {
                      setEditForm({
                        ...editForm,
                        barangay_id: selectedBarangay.barangay_id,
                        barangay_name: selectedBarangay.barangay_name
                      });
                    }
                  }}
                >
                  {barangayList.map(barangay => (
                    <option key={barangay.barangay_id} value={String(barangay.barangay_id)}>
                      {barangay.barangay_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Week of Month Dropdown (only for weekly_cluster) */}
              {editingSchedule.schedule_type === 'weekly_cluster' && (
                <div>
                  <button
                    type="button"
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 bg-white text-left flex items-center justify-between hover:border-emerald-400 transition-colors"
                    onClick={() => {
                      const nextWeek = ((Number(editForm.week_of_month) || 1) % 4) + 1;
                      setEditForm({ ...editForm, week_of_month: nextWeek.toString() });
                    }}
                  >
                    <span className="font-medium text-gray-700">Week {editForm.week_of_month} of Month</span>
                    <span className="text-gray-400">▼</span>
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-6 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  disabled={editSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                  disabled={editSaving}
                >
                  {editSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {editSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm relative overflow-hidden border-4 border-emerald-500 animate-scale-in">
            <div className="px-6 py-8 text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Schedule Updated!</h3>
              <p className="text-gray-600 mb-6">The schedule has been successfully updated.</p>
              <button
                onClick={() => setEditSuccessOpen(false)}
                className="px-8 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {
        addOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-3 w-full max-w-sm relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-green-700"
                onClick={() => setAddOpen(false)}
                aria-label="Close"
              >✕</button>
              <h2 className="text-sm font-semibold text-green-800 mb-2">Add Schedule</h2>
              {addError && (
                <div className="text-red-600 text-[10px] mb-1.5">{addError}</div>
              )}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setAddError(null);
                  if (!addForm.date || !addForm.start_time || !addForm.end_time || !addForm.barangay_id) {
                    setAddError('Please fill out date, time, and barangay.');
                    return;
                  }
                  if (addForm.start_time >= addForm.end_time) {
                    setAddError('Start time must be earlier than end time.');
                    return;
                  }
                  try {
                    setAddSaving(true);
                    const dayIndex = new Date(addForm.date).getDay();
                    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const dayOfWeek = dayNames[dayIndex];
                    const wom = getWeekOfMonth(addForm.date);
                    const schedule_type = isPriorityView ? 'daily_priority' : 'weekly_cluster';
                    const cluster_id = selectedClusterId;
                    const barangay = barangayList.find(b => String(b.barangay_id) === String(addForm.barangay_id));
                    const payload = {
                      barangay_id: addForm.barangay_id,
                      barangay_name: barangay ? barangay.barangay_name : undefined,
                      cluster_id,
                      schedule_type,
                      day_of_week: dayOfWeek,
                      start_time: addForm.start_time,
                      end_time: addForm.end_time,
                      frequency_per_day: 1,
                      week_of_month: schedule_type === 'weekly_cluster' ? wom : undefined,
                      is_active: 1
                    };
                    const res = await fetch(buildApiUrl('create_predefined_schedule.php'), {
                      method: 'POST',
                      headers: getAuthHeaders(),
                      body: JSON.stringify(payload)
                    });
                    const data = await res.json();
                    if (!data.success) throw new Error(data.message || 'Failed to create schedule');
                    await fetchSchedules();
                    setAddOpen(false);
                  } catch (err) {
                    // Check if it's a duplicate error
                    if (err.message && (err.message.includes('Duplicate entry') || err.message.includes('1062'))) {
                      setAddOpen(false);
                      setDuplicateErrorMessage('A schedule already exists for this barangay at this time. Please choose a different time or barangay.');
                      setDuplicateErrorOpen(true);
                    } else {
                      setAddError(err.message);
                    }
                  } finally {
                    setAddSaving(false);
                  }
                }}
                className="space-y-2"
              >
                <div>
                  <label className="block text-[10px] text-green-700 mb-0.5">Barangay</label>
                  <select
                    className="w-full border border-green-200 rounded px-2 py-1"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-green-700 mb-0.5">Date</label>
                    <input
                      type="date"
                      className="w-full border border-green-200 rounded px-2 py-1"
                      value={addForm.date}
                      onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-green-700 mb-0.5">Start Time</label>
                    <input
                      type="time"
                      className="w-full border border-green-200 rounded px-2 py-1"
                      value={addForm.start_time}
                      onChange={(e) => setAddForm({ ...addForm, start_time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-green-700 mb-0.5">End Time</label>
                  <input
                    type="time"
                    className="w-full border border-green-200 rounded px-2 py-1"
                    value={addForm.end_time}
                    onChange={(e) => setAddForm({ ...addForm, end_time: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-1 pt-1">
                  <button type="button" className="px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => setAddOpen(false)}>Cancel</button>
                  <button type="submit" className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50" disabled={addSaving}>
                    {addSaving ? 'Saving...' : 'Create Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Delete Confirmation Modal */}
      {
        deleteOpen && scheduleToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden">
              {/* Header */}
              <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                <button
                  className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:text-red-700 hover:bg-gray-100"
                  onClick={() => {
                    setDeleteOpen(false);
                    setScheduleToDelete(null);
                    setDeleteError(null);
                  }}
                  aria-label="Close"
                  title="Close"
                  disabled={deleteDeleting}
                >✕</button>
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <FiTrash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Delete Schedule</h2>
                    <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-4 py-3">
                {deleteError && (
                  <div className="mb-3 rounded-lg bg-red-50 border-2 border-red-300 px-4 py-3 flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">{deleteError}</p>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-3">
                    Are you sure you want to delete this schedule?
                  </p>

                  {/* Schedule Details */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600 w-24">Barangay:</span>
                        <span className="text-xs text-gray-800 font-semibold">{scheduleToDelete.barangay_name || scheduleToDelete.barangay_id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600 w-24">Day:</span>
                        <span className="text-xs text-gray-800">{scheduleToDelete.day_of_week}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600 w-24">Time:</span>
                        <span className="text-xs text-gray-800">
                          {scheduleToDelete.start_time?.substring(0, 5) || ''} - {scheduleToDelete.end_time?.substring(0, 5) || ''}
                        </span>
                      </div>
                      {scheduleToDelete.schedule_type === 'weekly_cluster' && scheduleToDelete.week_of_month && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-600 w-24">Week:</span>
                          <span className="text-xs text-gray-800">Week {scheduleToDelete.week_of_month}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600 w-24">Type:</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                          {scheduleToDelete.schedule_type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    setDeleteOpen(false);
                    setScheduleToDelete(null);
                    setDeleteError(null);
                  }}
                  disabled={deleteDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  onClick={handleDeleteSchedule}
                  disabled={deleteDeleting}
                >
                  {deleteDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="w-4 h-4" />
                      Delete Schedule
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Delete Success Modal */}
      {deleteSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm relative overflow-hidden border-4 border-emerald-500 animate-scale-in">
            <div className="px-6 py-8 text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Schedule Deleted!</h3>
              <p className="text-gray-600 mb-6">The schedule has been successfully deleted.</p>
              <button
                onClick={() => setDeleteSuccessOpen(false)}
                className="px-8 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Error Modal */}
      {duplicateErrorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden border-4 border-orange-500 animate-scale-in">
            <div className="px-6 py-8 text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Duplicate Schedule</h3>
              <p className="text-gray-600 mb-6">{duplicateErrorMessage}</p>
              <button
                onClick={() => {
                  setDuplicateErrorOpen(false);
                  setDuplicateErrorMessage('');
                }}
                className="px-8 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors shadow-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {
        historyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] relative overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
                <button
                  className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:text-red-700 hover:bg-gray-100"
                  onClick={() => {
                    setHistoryOpen(false);
                    setHistoryError(null);
                    setHistoryData([]);
                  }}
                  aria-label="Close"
                  title="Close"
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

              {/* Body */}
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

              {/* Footer */}
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
        )
      }
    </div >
  );
}
