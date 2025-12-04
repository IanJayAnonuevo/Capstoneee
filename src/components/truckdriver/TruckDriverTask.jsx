import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiTruck, FiMap, FiCheckCircle, FiFilter, FiX, FiSearch } from 'react-icons/fi';
import { GiTrashCan } from 'react-icons/gi';
import { buildApiUrl } from '../../config/api';

// Helper to format date like "May 05, 2025" (avoid timezone issues)
function formatPrettyDate(dateStr) {
  try {
    if (!dateStr) return '';
    const str = String(dateStr).trim();
    // If it's already in YYYY-MM-DD format, parse it directly without timezone conversion
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // Month is 0-indexed
      const day = parseInt(match[3], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString(undefined, { month: 'long', day: '2-digit', year: 'numeric' });
    }
    // For other formats, try parsing
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { month: 'long', day: '2-digit', year: 'numeric' });
  } catch (_) {
    return dateStr;
  }
}

const statusMap = {
  pending: { label: 'PENDING', color: 'bg-yellow-100 text-yellow-800' },
  'in-progress': { label: 'IN PROGRESS', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'COMPLETED', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'CANCELLED', color: 'bg-red-100 text-red-800' },
};

export default function TruckDriverTask() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTab, setFilterTab] = useState('today'); // 'today' | 'upcoming' | 'all'
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();
  const [dailyByDate, setDailyByDate] = useState({});
  const [barangayBreakdown, setBarangayBreakdown] = useState({}); // Store per-barangay stop counts // { 'YYYY-MM-DD': { barangayList: [...] } }
  const [scheduleTimeFilter, setScheduleTimeFilter] = useState('am'); // 'am' | 'pm'

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'in-progress' | 'completed' | 'cancelled'
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD format
  const [searchFilter, setSearchFilter] = useState(''); // Search by barangay or truck number

  // Emergency modal state
  const [emergencyModal, setEmergencyModal] = useState({ show: false, type: '', message: '' });

  const userId = useMemo(() => {
    try {
      return localStorage.getItem('user_id') || localStorage.getItem('userId') || '';
    } catch (_) { return ''; }
  }, []);

  const authHeaders = () => {
    try {
      const t = localStorage.getItem('access_token');
      return t ? { Authorization: `Bearer ${t}` } : {};
    } catch { return {}; }
  };

  // Fetch per-barangay breakdown for accurate progress bars
  const fetchBarangayBreakdown = useCallback(async (routeId) => {
    try {
      const res = await fetch(buildApiUrl(`get_route_barangay_breakdown.php?route_id=${routeId}`), {
        headers: { ...authHeaders() }
      });
      const data = await res.json();
      if (data.success) {
        const breakdownMap = {};
        data.breakdown.forEach(item => {
          breakdownMap[item.barangay_id] = {
            total: item.total_stops,
            completed: item.completed_stops
          };
        });
        return breakdownMap;
      }
    } catch (e) {
      console.error('Failed to fetch barangay breakdown:', e);
    }
    return null;
  }, []);

  // Load breakdowns when tasks change
  useEffect(() => {
    const loadBreakdowns = async () => {
      const breakdowns = {};
      for (const task of tasks) {
        const routeId = task.taskRouteId || task.routeId || task.route_id || (task.barangayList && task.barangayList[0] && (task.barangayList[0].route_id || task.barangayList[0].id));
        if (routeId && !barangayBreakdown[routeId]) {
          const breakdown = await fetchBarangayBreakdown(routeId);
          if (breakdown) {
            breakdowns[routeId] = breakdown;
          }
        }
      }
      if (Object.keys(breakdowns).length > 0) {
        setBarangayBreakdown(prev => ({ ...prev, ...breakdowns }));
      }
    };

    if (tasks.length > 0) {
      loadBreakdowns();
    }
  }, [tasks, fetchBarangayBreakdown, barangayBreakdown]);

  const fallbackDriverName = useMemo(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (!storedUser) return '';
      const nameFromFields = [
        storedUser.firstname,
        storedUser.lastname,
        storedUser.first_name,
        storedUser.last_name,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();
      if (nameFromFields) return nameFromFields;
      if (storedUser.full_name) return String(storedUser.full_name).trim();
      if (storedUser.fullname) return String(storedUser.fullname).trim();
      if (storedUser.name) return String(storedUser.name).trim();
      return storedUser.username || '';
    } catch (_) {
      return '';
    }
  }, []);

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(buildApiUrl(`get_personnel_schedule.php?user_id=${userId}&role=driver&_t=${Date.now()}`), { headers: { ...authHeaders() }, cache: 'no-cache' });
        const data = await res.json();
        if (data.success) {
          const mapped = (data.schedules || []).map((s, idx) => {
            const status = (s.status || '').toLowerCase();
            const uiStatus = status === 'scheduled' ? 'in-progress' : status === 'completed' ? 'completed' : 'pending';
            const driverName = [
              s.driver_firstname,
              s.driver_lastname,
              s.driver_first_name,
              s.driver_last_name,
            ]
              .filter(Boolean)
              .join(' ')
              .trim();

            const driverFallbackFromApi =
              s.driver_full_name ||
              s.driver_fullname ||
              s.driver_name ||
              s.driver ||
              '';

            const normalizedDriverName = [driverName, driverFallbackFromApi, fallbackDriverName]
              .map((value) => {
                const trimmed = String(value || '').trim();
                if (!trimmed) return '';
                const upper = trimmed.toUpperCase();
                if (upper === 'N/A' || upper === 'NA' || upper === 'NONE') return '';
                return trimmed;
              })
              .find(Boolean) || '';

            const collectors = Array.isArray(s.collectors) ? s.collectors.map((c) => ({
              ...c,
              displayName:
                [c.firstname, c.lastname].filter(Boolean).join(' ').trim() ||
                [c.first_name, c.last_name].filter(Boolean).join(' ').trim() ||
                c.full_name ||
                c.fullname ||
                c.name ||
                c.username ||
                'Unknown'
            })) : [];
            // Build barangayList - prioritize route_id from schedule, then from barangay_list/routes
            const barangayList = Array.isArray(s.barangay_list)
              ? s.barangay_list.map(b => ({
                ...b,
                route_id: s.route_id ?? b.route_id ?? b.id ?? b.routeId ?? null,
                barangay_name: b.barangay_name ?? b.name ?? s.barangay_name ?? s.barangay,
                barangay_id: b.barangay_id ?? s.barangay_id,
                team_id: b.team_id ?? s.team_id ?? null,
              }))
              : Array.isArray(s.routes)
                ? s.routes.map(r => ({
                  ...r,
                  route_id: s.route_id ?? r.route_id ?? r.id ?? r.routeId ?? null,
                  barangay_name: r.barangay_name ?? r.name ?? s.barangay_name ?? s.barangay,
                  barangay_id: r.barangay_id ?? s.barangay_id,
                  team_id: r.team_id ?? s.team_id ?? null,
                }))
                : [
                  {
                    name: s.barangay || s.barangay_name || 'Route',
                    barangay_name: s.barangay_name ?? s.barangay,
                    barangay_id: s.barangay_id,
                    time: `${(s.time || '').slice(0, 5)} - ${(s.end_time || '').slice(0, 5)}`,
                    totalStops: s.total_stops ?? 0,
                    completedStops: s.completed_stops ?? 0,
                    route_id: s.route_id ?? null,
                    team_id: s.team_id ?? null,
                  }
                ];
            const totalStops = s.total_stops ?? barangayList.reduce((sum, r) => sum + (Number(r.totalStops) || 0), 0);
            const completedStops = s.completed_stops ?? barangayList.reduce((sum, r) => sum + (Number(r.completedStops) || 0), 0);
            const remainingStops = Math.max(0, Number(totalStops) - Number(completedStops));
            return {
              id: s.schedule_id || idx,
              teamId: s.team_id,
              route: `${s.barangay || 'Route'}`,
              date: formatPrettyDate(s.date),
              time: `${(s.time || '').slice(0, 5)} - ${(s.end_time || '').slice(0, 5)}`,
              vehicle: s.truck_number || 'N/A',
              truckType: s.truck_model || 'N/A',
              truckCapacity: s.truck_capacity ?? null,
              wasteType: 'RESIDUAL WASTE',
              status: uiStatus,
              teamStatus: s.team_status || 'pending',
              yourResponseStatus: s.your_response_status || 'pending',
              collectors,
              driverName: normalizedDriverName,
              rawDate: s.date,
              route_id: s.route_id ?? null, // Store route_id at task level as fallback
              barangayList,
              barangayCount: s.barangays_count ?? barangayList.length,
              totalStops,
              completedStops,
              remainingStops,
            };
          });
          setTasks(mapped);
        } else {
          setTasks([]);
          setError(data.message || 'Failed to load tasks');
        }
      } catch (e) {
        setError('Network error while loading tasks');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchTasks();
    else { setLoading(false); setTasks([]); }
  }, [userId, fallbackDriverName]);

  const acceptDecline = async (teamId, response) => {
    try {
      const res = await fetch(buildApiUrl('respond_assignment.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ assignment_id: teamId, user_id: userId, response_status: response, role: 'driver' })
      });
      const data = await res.json();
      if (data.success) {
        // reflect instantly
        setTasks(prev => prev.map(t => t.teamId === teamId ? { ...t, yourResponseStatus: response } : t));
      } else {
        alert(data.message || 'Failed to submit response');
      }
    } catch (_) {
      alert('Network error while submitting response');
    }
  };

  const filteredTasks = useMemo(() => {
    // Helper to normalize date to YYYY-MM-DD format (avoid timezone issues)
    const normalizeDate = (dateStr) => {
      if (!dateStr) return '';
      const str = String(dateStr).trim();
      // If already in YYYY-MM-DD format, return as is (no timezone conversion)
      if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        return str.slice(0, 10);
      }
      // Try to parse - but be careful with timezone
      try {
        // If it's a date string that might have time, parse it carefully
        // For YYYY-MM-DD format, don't use Date constructor as it causes UTC conversion
        const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
          return `${match[1]}-${match[2]}-${match[3]}`;
        }
        // For other formats, try parsing but use local date components
        const d = new Date(str);
        if (isNaN(d.getTime())) return '';
        // Use local date components to avoid timezone issues
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch {
        return '';
      }
    };

    // Get today's date in YYYY-MM-DD format using local timezone
    const todayStr = (() => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (_) {
        return new Date().toISOString().slice(0, 10);
      }
    })();

    const isToday = (d) => {
      const dateStr = normalizeDate(d);
      return dateStr === todayStr;
    };
    const isFuture = (d) => {
      const dateStr = normalizeDate(d);
      return dateStr > todayStr;
    };
    const isPast = (d) => {
      const dateStr = normalizeDate(d);
      return dateStr < todayStr;
    };

    // If date filter is set, it takes priority - filter by exact date match only
    if (dateFilter) {
      // HTML date input returns YYYY-MM-DD format directly - use it as-is
      // Extract just the date part (first 10 characters) to avoid any time/timezone issues
      const filterDateStr = String(dateFilter).trim().slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(filterDateStr)) {
        // Invalid date filter format, return empty
        return [];
      }

      let validTasks = tasks.filter(t => {
        // Normalize task date to YYYY-MM-DD format
        const taskDate = normalizeDate(t.rawDate);
        // Strict string comparison - must match exactly
        return taskDate === filterDateStr;
      });

      // Apply status filter
      if (statusFilter !== 'all') {
        validTasks = validTasks.filter(t => {
          const taskStatus = String(t.status || '').toLowerCase();
          return taskStatus === statusFilter;
        });
      }

      // Apply search filter
      if (searchFilter.trim()) {
        const searchLower = searchFilter.toLowerCase().trim();
        validTasks = validTasks.filter(t => {
          const barangayMatch = (t.barangayList || []).some(b =>
            String(b.name || b.barangay || '').toLowerCase().includes(searchLower)
          );
          const truckMatch = String(t.vehicle || '').toLowerCase().includes(searchLower);
          const routeMatch = String(t.route || '').toLowerCase().includes(searchLower);
          return barangayMatch || truckMatch || routeMatch;
        });
      }

      return validTasks;
    }

    // No date filter - apply tab-based filtering
    let validTasks = tasks.filter(t => !isPast(t.rawDate));

    if (filterTab === 'today') {
      const todayTasks = validTasks.filter(t => isToday(t.rawDate));
      // If no tasks for today, show the earliest future date that has tasks
      if (todayTasks.length === 0 && validTasks.length > 0) {
        const futureTasks = validTasks.filter(t => isFuture(t.rawDate));
        if (futureTasks.length > 0) {
          const sorted = [...futureTasks].sort((a, b) => normalizeDate(a.rawDate).localeCompare(normalizeDate(b.rawDate)));
          const earliestDate = normalizeDate(sorted[0]?.rawDate);
          if (earliestDate) {
            validTasks = validTasks.filter(t => normalizeDate(t.rawDate) === earliestDate);
          }
        } else {
          // If no future tasks, show earliest available (shouldn't happen but fallback)
          const sorted = [...validTasks].sort((a, b) => normalizeDate(a.rawDate).localeCompare(normalizeDate(b.rawDate)));
          const earliestDate = normalizeDate(sorted[0]?.rawDate);
          if (earliestDate) {
            validTasks = validTasks.filter(t => normalizeDate(t.rawDate) === earliestDate);
          }
        }
      } else {
        validTasks = todayTasks;
      }
    } else if (filterTab === 'upcoming') {
      validTasks = validTasks.filter(t => !isToday(t.rawDate));
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      validTasks = validTasks.filter(t => {
        const taskStatus = String(t.status || '').toLowerCase();
        return taskStatus === statusFilter;
      });
    }

    // Apply search filter (barangay or truck number)
    if (searchFilter.trim()) {
      const searchLower = searchFilter.toLowerCase().trim();
      validTasks = validTasks.filter(t => {
        const barangayMatch = (t.barangayList || []).some(b =>
          String(b.name || b.barangay || '').toLowerCase().includes(searchLower)
        );
        const truckMatch = String(t.vehicle || '').toLowerCase().includes(searchLower);
        const routeMatch = String(t.route || '').toLowerCase().includes(searchLower);
        return barangayMatch || truckMatch || routeMatch;
      });
    }

    return validTasks;
  }, [tasks, filterTab, statusFilter, dateFilter, searchFilter]);

  const toggleExpanded = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const responseColor = (r) => {
    const v = String(r || '').toLowerCase();
    if (v === 'accepted') return 'text-green-700';
    if (v === 'declined' || v === 'decline') return 'text-red-600';
    return 'text-yellow-700';
  };

  const statusTextColor = (s) => {
    const v = String(s || '').toLowerCase();
    if (v === 'completed') return 'text-green-700';
    if (v === 'in-progress') return 'text-blue-700';
    if (v === 'pending') return 'text-yellow-700';
    if (v === 'cancelled') return 'text-red-700';
    return 'text-gray-700';
  };

  // Build one card per Date + Truck + Driver (merge schedules for same shift)
  const dailyCards = useMemo(() => {
    const map = {};
    for (const t of filteredTasks) {
      // Normalize the date to ensure consistent format
      const normalizeDate = (dateStr) => {
        if (!dateStr) return '';
        const str = String(dateStr).trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
          return str.slice(0, 10);
        }
        try {
          const d = new Date(str);
          if (isNaN(d.getTime())) return '';
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        } catch {
          return '';
        }
      };

      const dateKey = normalizeDate(t.rawDate);
      if (!dateKey) continue;

      // Group by Date + Truck + Driver to merge schedules for the same shift/team
      // Use a fallback for missing truck/driver to avoid grouping unrelated tasks
      const truckKey = (t.vehicle || 'UnknownTruck').trim().toLowerCase();
      const driverKey = (t.driverName || 'UnknownDriver').trim().toLowerCase();
      const uniqueKey = `${dateKey}_${truckKey}_${driverKey}`;

      if (!map[uniqueKey]) {
        const formattedDate = formatPrettyDate(dateKey);
        map[uniqueKey] = {
          key: uniqueKey,
          dateKey: dateKey, // Keep dateKey for sorting/filtering
          dateLabel: formattedDate,
          startTimes: [],
          endTimes: [],
          vehicle: t.vehicle,
          barangayList: [],
          totalStops: 0,
          completedStops: 0,
          collectors: [],
          driverName: t.driverName,
          yourResponseStatus: t.yourResponseStatus,
          taskRouteId: t.route_id ?? null,
        };
      }
      const bucket = map[uniqueKey];
      const [start, end] = String(t.time || '').split(' - ');
      if (start) bucket.startTimes.push(start);
      if (end) bucket.endTimes.push(end);
      bucket.vehicle = bucket.vehicle || t.vehicle;

      // Add each schedule as a separate barangay entry with its own time
      if (Array.isArray(t.barangayList) && t.barangayList.length > 0) {
        const enrichedBarangayList = t.barangayList.map(b => ({
          ...b,
          route_id: b.route_id ?? t.route_id ?? null,
          team_id: b.team_id ?? t.teamId ?? null,
          time: t.time, // Include time for this specific schedule
          barangay_name: b.barangay_name || b.name || t.route
        }));
        bucket.barangayList.push(...enrichedBarangayList);
      } else {
        // Fallback: create entry from task-level data
        bucket.barangayList.push({
          name: t.route || t.barangay || 'Route',
          barangay_name: t.barangay || t.route,
          route_id: t.route_id,
          team_id: t.teamId,
          time: t.time,
          totalStops: t.totalStops || 0,
          completedStops: t.completedStops || 0
        });
      }

      bucket.totalStops += Number(t.totalStops || 0);
      bucket.completedStops += Number(t.completedStops || 0);
      for (const c of t.collectors || []) {
        const id = c.user_id ?? c.id ?? c.displayName;
        if (!bucket.collectors.find(x => (x.user_id ?? x.id ?? x.displayName) === id)) {
          bucket.collectors.push(c);
        }
      }
      // Prefer accepted status if any
      if (String(t.yourResponseStatus).toLowerCase() === 'accepted') {
        bucket.yourResponseStatus = t.yourResponseStatus;
      }
    }

    let cards = Object.values(map).map((d) => {
      const start = d.startTimes.sort()[0] || '';
      const end = d.endTimes.sort().slice(-1)[0] || '';

      return {
        ...d,
        time: start && end ? `${start} - ${end}` : start || end || '-',
        barangayCount: d.barangayList.length,
        remainingStops: Math.max(0, Number(d.totalStops) - Number(d.completedStops)),
      };
    }).sort((a, b) => {
      // Sort by date first, then by time
      const dateCompare = a.dateKey.localeCompare(b.dateKey);
      if (dateCompare !== 0) return dateCompare;
      return (a.time || '').localeCompare(b.time || '');
    });

    // If dateFilter is set, filter by date
    if (dateFilter) {
      const filterDateStr = String(dateFilter).trim().slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(filterDateStr)) {
        const normalizeDate = (dateStr) => {
          if (!dateStr) return '';
          const str = String(dateStr).trim();
          if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
            return str.slice(0, 10);
          }
          try {
            const d = new Date(str);
            if (isNaN(d.getTime())) return '';
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          } catch {
            return '';
          }
        };

        cards = cards.filter(card => {
          const cardDate = normalizeDate(card.dateKey);
          return cardDate === filterDateStr;
        });

        cards = cards.map(card => ({
          ...card,
          dateLabel: formatPrettyDate(filterDateStr)
        }));
      }
    }

    return cards;
  }, [filteredTasks, dateFilter]);

  // Fetch daily routes (driver-accepted) for each date shown and prefer their route IDs
  useEffect(() => {
    const uniqueDates = Array.from(new Set(filteredTasks.map(t => String(t.rawDate || '').slice(0, 10)).filter(Boolean)));
    if (uniqueDates.length === 0) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(uniqueDates.map(async (dateKey) => {
        try {
          // Prefer daily_route with true route IDs
          const user_id = localStorage.getItem('user_id') || sessionStorage.getItem('user_id') || '';
          const res = await fetch(buildApiUrl(`get_routes.php?date=${dateKey}&role=driver&user_id=${encodeURIComponent(user_id)}`), { headers: { ...authHeaders() } });
          const data = await res.json();
          if (!data?.success) return [dateKey, null];
          const barangayList = (data.routes || []).map((r, idx) => ({
            id: r.id ?? idx,
            route_id: r.id ?? idx,
            name: r.barangay_name || r.name || 'Barangay',
            barangay_name: r.barangay_name || r.name || null,
            barangay_id: r.barangay_id || null, // Include barangay_id for matching
            time: `${String(r.start_time || '').slice(0, 5)} - ${String(r.end_time || '').slice(0, 5)}`,
            totalStops: Number(r.total_stops || 0),
            completedStops: Number(r.completed_stops || 0),
            status: r.status || 'scheduled',
            team_id: r.team_id || null,
          }));
          return [dateKey, { barangayList }];
        } catch (_) {
          return [dateKey, null];
        }
      }));
      if (cancelled) return;
      const next = {};
      for (const [k, v] of entries) { if (k && v) next[k] = v; }
      if (Object.keys(next).length) setDailyByDate(prev => ({ ...prev, ...next }));
    })();
    return () => { cancelled = true; };
  }, [filteredTasks]);

  const clearFilters = () => {
    setStatusFilter('all');
    setDateFilter('');
    setSearchFilter('');
  };

  const hasActiveFilters = statusFilter !== 'all' || dateFilter !== '' || searchFilter.trim() !== '';

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center py-5 px-3">
      <div className="w-full max-w-lg">
        <h1 className="text-[18px] font-semibold text-gray-900 mb-1 pl-1 tracking-tight">ASSIGNED TASK</h1>
        <p className="text-[13px] text-gray-600 mb-4 pl-1">You're all set for today's task</p>

        {/* Search Bar */}
        <div className="mb-3 pl-1">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by barangay or truck number..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        </div>

        {/* AM/PM Toggle and Filter */}
        <div className="flex gap-2 mb-3 pl-1 items-center">
          <div className="flex gap-2 flex-1">
            {['am', 'pm'].map(period => (
              <button
                key={period}
                onClick={() => setScheduleTimeFilter(period)}
                className={`px-3 py-1 rounded text-xs font-semibold border ${scheduleTimeFilter === period
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-green-700 border-green-200'
                  }`}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1 rounded text-xs font-semibold border flex items-center gap-1 ${showFilters || hasActiveFilters
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-green-700 border-green-200'
              }`}
          >
            <FiFilter size={14} />
            Filters
            {hasActiveFilters && <span className="ml-1 bg-white text-green-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">!</span>}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-4 pl-1 pr-1 bg-white border border-green-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-700">Filter Options</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter('')}
                    className="mt-1 text-xs text-green-600 hover:text-green-700"
                  >
                    Clear date filter
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {loading && <div className="text-sm text-gray-600 pl-1">Loading tasks...</div>}
        {error && !loading && <div className="text-sm text-red-600 pl-1">{error}</div>}
        {!loading && !error && tasks.length === 0 && <div className="text-sm text-gray-500 pl-1">No tasks found.</div>}
        {!loading && !error && dateFilter && dailyCards.length === 0 && (
          <div className="text-sm text-gray-500 pl-1 bg-yellow-50 border border-yellow-200 rounded p-2">
            No tasks found for {formatPrettyDate(dateFilter)}. Try selecting a different date.
          </div>
        )}
        {!loading && !error && dateFilter && dailyCards.length > 0 && (
          <div className="text-xs text-green-700 pl-1 mb-2 bg-green-50 border border-green-200 rounded p-2">
            Showing tasks for: <strong>{formatPrettyDate(dateFilter)}</strong>
          </div>
        )}

        <div className="grid gap-4">
          {dailyCards
            .filter((task) => {
              // Filter tasks by AM/PM based on their time range
              const timeStr = task.time || '';
              const [startStr, endStr] = timeStr.split('-').map(s => s.trim());

              const startHour = parseInt(startStr?.split(':')[0] || '0', 10);
              // If end time is missing, assume it's the same as start time for filtering purposes
              const endHour = endStr ? parseInt(endStr.split(':')[0] || '0', 10) : startHour;

              if (scheduleTimeFilter === 'am') {
                // Show in AM if it starts in AM (before 12:00)
                return startHour < 12;
              }
              if (scheduleTimeFilter === 'pm') {
                // Show in PM if it ends in PM (12:00 or later) or starts in PM
                return endHour >= 12 || startHour >= 12;
              }
              return true;
            })
            .map((task) => {
              return (
                <div key={task.key} className="rounded-md border border-green-100 bg-green-50 shadow-sm overflow-hidden">
                  {/* Card header - date and priority */}
                  <div className="px-5 pt-4 pb-2 bg-green-100/70 border-b border-green-200 flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <FiCalendar className="text-green-700" />
                      <span className="uppercase tracking-wide">{task.dateLabel}</span>
                    </div>
                    <div className="text-[11px] text-gray-700">Priority Barangay</div>
                  </div>

                  {/* Summary grid (two-column aligned like mock) */}
                  <div className="px-5 pb-3 pt-3">
                    <div className="grid grid-cols-2 gap-y-2 text-[12px] text-gray-800">
                      {/* Row: Time on right column */}
                      <div className="flex items-center">
                        <span className="text-gray-700">Time:</span>
                      </div>
                      <div className="flex items-center justify-end">
                        <span className="font-medium">{task.time}</span>
                      </div>
                      {/* Row: Truck Number | Barangays */}
                      <div className="flex items-center justify-between pr-3">
                        <span className="text-gray-700">Truck Number:</span>
                        <span className="font-medium ml-2">{task.vehicle}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Barangays:</span>
                        <span className="font-medium ml-2">{task.barangayCount ?? '-'}</span>
                      </div>
                      {/* Row: Total Stops | Completed */}
                      <div className="flex items-center justify-between pr-3">
                        <span className="text-gray-700">Total Stops:</span>
                        <span className="font-medium ml-2">{task.totalStops ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Completed:</span>
                        <span className="font-medium ml-2">{task.completedStops ?? 0}</span>
                      </div>
                      {/* Row: Remaining on left column, value aligned right of left col */}
                      <div className="flex items-center justify-between pr-3">
                        <span className="text-gray-700">Remaining:</span>
                        <span className="font-medium ml-2">{task.remainingStops ?? 0}</span>
                      </div>
                      <div></div>
                    </div>
                  </div>

                  {/* Overall Route Progress */}
                  <div className="px-5 pb-3">
                    <div className="text-[11px] font-semibold text-gray-700 mb-1">OVERALL PROGRESS</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-green-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 rounded-full transition-all duration-300"
                          style={{ width: `${task.totalStops > 0 ? Math.round((task.completedStops / task.totalStops) * 100) : 0}%` }}
                        />
                      </div>
                      <div className="text-[11px] font-semibold text-gray-700 whitespace-nowrap">
                        {task.completedStops || 0}/{task.totalStops || 0}
                      </div>
                    </div>
                  </div>

                  {/* Barangay List */}
                  <div className="px-5 pb-2">
                    <div className="text-[12px] font-semibold text-gray-700 mb-2">SCHEDULE BREAKDOWN</div>
                    <div className="grid gap-3">
                      {(() => {
                        const barangays = (task.barangayList || [])
                          .map((b) => {
                            const routeId = b.route_id ?? b.id ?? b.routeId ?? b.cluster_id ?? task.taskRouteId ?? null;
                            return { raw: b, routeId };
                          });
                        return barangays.map((b2, i) => {
                          const b = b2.raw;
                          const routeId = b2.routeId;
                          return (
                            <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-2.5 shadow-sm">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-[11px] font-semibold text-gray-900 leading-4">{b.name || b.barangay || `Route ${i + 1}`}</div>
                                  <div className="text-[10px] text-gray-600">{b.time || task.time}</div>
                                </div>
                                <div className="text-green-600 text-sm">
                                  <FiMap />
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                  {/* Single Start Route Button */}
                  <div className="px-5 pb-3">
                    {(() => {
                      const isFullyCompleted = (task.totalStops || 0) > 0 && (task.completedStops || 0) >= (task.totalStops || 0);
                      const routeId = task.taskRouteId || task.routeId || task.route_id || (task.barangayList && task.barangayList[0] && (task.barangayList[0].route_id || task.barangayList[0].id));

                      // Check if task is unfinished using same logic as Foreman's TodaysTasks
                      const isTaskUnfinished = () => {
                        const status = (task.status || '').toLowerCase();
                        if (status === 'completed' || status === 'cancelled') return false;

                        const now = new Date();
                        const currentHour = now.getHours();
                        const currentMinute = now.getMinutes();

                        const taskTime = task.time || task.start_time || task.startTime;
                        const isAm = taskTime && parseInt(taskTime.split(':')[0]) < 12;
                        const expectedEndHour = isAm ? 12 : 17;
                        const expectedEndMinute = 0;

                        if (currentHour > expectedEndHour) return true;
                        if (currentHour === expectedEndHour && currentMinute >= expectedEndMinute) return true;

                        return false;
                      };

                      const isUnfinished = isTaskUnfinished();

                      if (isFullyCompleted) {
                        return (
                          <div className="text-center py-2 text-green-700 font-semibold text-sm">
                            <FiCheckCircle className="inline mr-1" />
                            Route Completed
                          </div>
                        );
                      }

                      if (isUnfinished) {
                        return (
                          <div className="text-center py-2 text-orange-700 font-semibold text-sm bg-orange-50 rounded-lg border border-orange-200">
                            Task Unfinished
                          </div>
                        );
                      }

                      return (
                        <button
                          className="w-full px-4 py-2.5 rounded-lg border-2 border-green-600 text-green-700 bg-white font-semibold text-sm hover:bg-green-50 transition-colors"
                          onClick={async () => {
                            if (routeId) {
                              try {
                                // First, check for active emergency
                                const routeDetailsRes = await fetch(buildApiUrl(`get_route_details.php?route_id=${routeId}`), {
                                  headers: { ...authHeaders() }
                                });
                                const routeDetailsData = await routeDetailsRes.json();

                                if (routeDetailsData?.success && routeDetailsData?.route) {
                                  const routeInfo = routeDetailsData.route;

                                  // Check if route is cancelled
                                  if (routeInfo.status === 'cancelled') {
                                    setEmergencyModal({
                                      show: true,
                                      type: 'Route Cancelled',
                                      message: 'This route has been cancelled and cannot be started.'
                                    });
                                    return; // Stop execution - don't navigate
                                  }

                                  // Check for active emergency in route notes
                                  if (routeInfo.notes) {
                                    try {
                                      const notesData = JSON.parse(routeInfo.notes);
                                      if (notesData.emergency && notesData.emergency.active === true) {
                                        // Emergency is active - prevent starting route
                                        const emergencyType = notesData.emergency.type_label || notesData.emergency.type || 'Emergency';
                                        setEmergencyModal({
                                          show: true,
                                          type: emergencyType,
                                          message: 'Route cannot be started. Please wait for resolution.'
                                        });
                                        return; // Stop execution - don't navigate
                                      }
                                    } catch (e) {
                                      // Notes is not JSON or parsing failed, continue normally
                                    }
                                  }
                                }

                                // No active emergency - proceed with starting route
                                const user_id = localStorage.getItem('user_id') || sessionStorage.getItem('user_id') || null;
                                await fetch(buildApiUrl('update_route_status.php'), {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', ...authHeaders() },
                                  body: JSON.stringify({ route_id: Number(routeId), status: 'in_progress', user_id })
                                });
                                // Set active route
                                try {
                                  await fetch(buildApiUrl('set_route_active.php'), {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', ...authHeaders() },
                                    body: JSON.stringify({ route_id: Number(routeId), team_id: task.team_id || null })
                                  });
                                } catch (_) { }
                                // Set in localStorage
                                try {
                                  const activeRouteData = { route_id: Number(routeId), team_id: task.team_id || 1, started_at: new Date().toISOString(), status: 'in_progress' };
                                  localStorage.setItem('active_route', JSON.stringify(activeRouteData));
                                  sessionStorage.setItem('active_route', JSON.stringify(activeRouteData));
                                } catch (_) { }
                                // Navigate WITHOUT barangay_id to show all stops
                                navigate(`/truckdriver/route/${routeId}`);
                              } catch (error) {
                                console.error('Error starting route:', error);
                                alert('Failed to start route. Please try again.');
                              }
                            } else {
                              alert('Missing route id. Please refresh and try again.');
                            }
                          }}
                        >
                          Start Route
                        </button>
                      );
                    })()}
                  </div>

                  {/* Footer: Team Information */}
                  < div className="px-5 pb-4 pt-1" >
                    <div className="text-[12px] font-semibold text-gray-700 mb-2">TEAM INFORMATION</div>
                    <div className="grid gap-2 text-[12px] bg-white/60 border border-green-100 rounded p-3">
                      {task.collectors && task.collectors.length > 0 ? (
                        task.collectors.map((c, i) => {
                          const collectorName = c.displayName ||
                            [c.firstname, c.lastname].filter(Boolean).join(' ').trim() ||
                            [c.first_name, c.last_name].filter(Boolean).join(' ').trim() ||
                            c.full_name ||
                            c.fullname ||
                            c.name ||
                            c.username ||
                            'Collector';
                          return (
                            <div
                              key={c.user_id ?? c.id ?? i}
                              className="flex items-center justify-between border-b border-gray-300 pb-1 last:border-b-0"
                            >
                              <span className="text-gray-900">Collector Name {i + 1}:</span>
                              <span className="font-semibold text-gray-900 truncate">{collectorName}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-gray-500">No collectors listed</div>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-gray-900">Driver Name:</span>
                        <span className="font-semibold text-gray-900 truncate">{task.driverName || fallbackDriverName || 'N/A'}</span>
                      </div>
                    </div>
                  </div >
                </div >
              );
            })}
        </div >
      </div >

      {/* Emergency Modal */}
      {emergencyModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-red-600 px-5 py-4">
              <h3 className="text-white font-semibold text-lg">⚠️ Emergency Active</h3>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">{emergencyModal.type}</p>
              <p className="text-sm text-gray-700">{emergencyModal.message}</p>
            </div>
            <div className="px-5 py-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setEmergencyModal({ show: false, type: '', message: '' })}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}
