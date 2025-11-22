import React, { useEffect, useMemo, useState } from 'react';
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
  const [dailyByDate, setDailyByDate] = useState({}); // { 'YYYY-MM-DD': { barangayList: [...] } }
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'in-progress' | 'completed' | 'cancelled'
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD format
  const [searchFilter, setSearchFilter] = useState(''); // Search by barangay or truck number

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
                  team_id: b.team_id ?? s.team_id ?? null,
                }))
              : Array.isArray(s.routes)
                ? s.routes.map(r => ({
                    ...r,
                    route_id: s.route_id ?? r.route_id ?? r.id ?? r.routeId ?? null,
                    barangay_name: r.barangay_name ?? r.name ?? s.barangay_name ?? s.barangay,
                    team_id: r.team_id ?? s.team_id ?? null,
                  }))
                : [
                    {
                      name: s.barangay || s.barangay_name || 'Route',
                      barangay_name: s.barangay_name ?? s.barangay,
                      time: `${(s.time || '').slice(0,5)} - ${(s.end_time || '').slice(0,5)}`,
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
              time: `${(s.time || '').slice(0,5)} - ${(s.end_time || '').slice(0,5)}`,
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
      } catch(_) { 
        return new Date().toISOString().slice(0,10); 
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

  // Build one card per date with aggregated barangays and team info
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
      if (!map[dateKey]) {
        // Format the dateKey properly for display
        const formattedDate = formatPrettyDate(dateKey);
        map[dateKey] = {
          key: dateKey,
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
          taskRouteId: t.route_id ?? null, // Store route_id from task as fallback
        };
      }
      const bucket = map[dateKey];
      const [start, end] = String(t.time || '').split(' - ');
      if (start) bucket.startTimes.push(start);
      if (end) bucket.endTimes.push(end);
      bucket.vehicle = bucket.vehicle || t.vehicle;
      // When adding barangayList, ensure each barangay has route_id (use task route_id as fallback)
      if (Array.isArray(t.barangayList)) {
        const enrichedBarangayList = t.barangayList.map(b => ({
          ...b,
          route_id: b.route_id ?? t.route_id ?? null,
          team_id: b.team_id ?? t.teamId ?? null,
        }));
        bucket.barangayList.push(...enrichedBarangayList);
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
      // Prefer dailyByDate barangayList (has route_ids from API), but merge with task-level data
      const dailyRoutes = dailyByDate[d.key]?.barangayList || [];
      const baseBarangayList = d.barangayList || [];
      
      // If we have daily routes, prefer them (they have route_ids from API)
      // Otherwise use base list and enrich with route_id
      let finalBarangayList;
      if (dailyRoutes.length > 0) {
        // Use daily routes - they already have route_ids from get_routes.php
        finalBarangayList = dailyRoutes.map(r => ({
          ...r,
          route_id: r.id ?? r.route_id ?? null, // get_routes.php returns 'id' as route_id
          name: r.barangay_name ?? r.name ?? 'Barangay',
          barangay_name: r.barangay_name ?? r.name ?? null,
        }));
      } else {
        // Use base list and ensure route_id is set
        finalBarangayList = baseBarangayList.map(b => ({
          ...b,
          route_id: b.route_id ?? b.id ?? b.routeId ?? d.taskRouteId ?? null,
          team_id: b.team_id ?? d.teamId ?? null,
        }));
      }
      
      return {
        ...d,
        time: start && end ? `${start} - ${end}` : start || end || '-',
        barangayList: finalBarangayList,
        barangayCount: finalBarangayList.length,
        remainingStops: Math.max(0, Number(d.totalStops) - Number(d.completedStops)),
        taskRouteId: d.taskRouteId, // Keep for fallback
      };
    }).sort((a,b) => a.key.localeCompare(b.key));
    
    // If dateFilter is set, ensure we only show cards matching that exact date
    // AND use the dateFilter value for the label (not the task's date)
    if (dateFilter) {
      // Use the dateFilter value directly (HTML date input format: YYYY-MM-DD)
      const filterDateStr = String(dateFilter).trim().slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(filterDateStr)) {
        const normalizeDate = (dateStr) => {
          if (!dateStr) return '';
          const str = String(dateStr).trim();
          if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
            return str.slice(0, 10);
          }
          try {
            const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (match) {
              return `${match[1]}-${match[2]}-${match[3]}`;
            }
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
        
        // Filter cards to only show the selected date
        cards = cards.filter(card => {
          const cardDate = normalizeDate(card.key);
          return cardDate === filterDateStr;
        });
        
        // Update ALL cards to use the filter date for the label
        // This ensures the label ALWAYS matches what the user selected in the filter
        cards = cards.map(card => ({
          ...card,
          dateLabel: formatPrettyDate(filterDateStr)
        }));
      }
    }
    
    return cards;
  }, [filteredTasks, dailyByDate, dateFilter]);

  // Fetch daily routes (driver-accepted) for each date shown and prefer their route IDs
  useEffect(() => {
    const uniqueDates = Array.from(new Set(filteredTasks.map(t => String(t.rawDate||'').slice(0,10)).filter(Boolean)));
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
            time: `${String(r.start_time||'').slice(0,5)} - ${String(r.end_time||'').slice(0,5)}`,
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

        {/* Tabs and Filter Toggle */}
        <div className="flex gap-2 mb-3 pl-1 items-center">
          <div className="flex gap-2 flex-1">
          {['today','upcoming'].map(tab => (
            <button key={tab} onClick={() => setFilterTab(tab)} className={`px-3 py-1 rounded text-xs font-semibold border ${filterTab===tab?'bg-green-600 text-white border-green-600':'bg-white text-green-700 border-green-200'}`}>
              {tab === 'today' ? 'Today' : tab === 'upcoming' ? 'Upcoming' : 'All'}
            </button>
          ))}
        </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1 rounded text-xs font-semibold border flex items-center gap-1 ${
              showFilters || hasActiveFilters
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
          {dailyCards.map((task) => {
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

                {/* Barangay List */}
                <div className="px-5 pb-2">
                  <div className="text-[12px] font-semibold text-gray-700 mb-2">BARANGAY LIST</div>
                  <div className="grid gap-3">
                    {(() => {
                      const barangays = (task.barangayList || []).map((b) => {
                        const total = Number(b.totalStops ?? b.total ?? 0);
                        const done = Number(b.completedStops ?? b.completed ?? 0);
                        const computedPct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
                        const statusVal = String(b.status || '').toLowerCase();
                        const isDone = computedPct >= 100 || ['completed','done','visited','finished'].includes(statusVal) || (total === 0 && statusVal === 'completed');
                        const pct = isDone ? 100 : computedPct;
                        // Try multiple sources for route_id - prioritize route_id, then id, then task-level route_id
                        const routeId = b.route_id ?? b.id ?? b.routeId ?? b.cluster_id ?? task.taskRouteId ?? null;
                        return { raw: b, total, done, pct, isDone, routeId };
                      });
                      return barangays.map((b2, i) => {
                        const canStart = !b2.isDone && (i === 0 || barangays[i-1].isDone);
                        const b = b2.raw;
                        const routeId = b2.routeId;
                        return (
                        <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-3 shadow-sm">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-[12px] font-semibold text-gray-900 leading-4">{b.name || b.barangay || `Route ${i+1}`}</div>
                              <div className="text-[11px] text-gray-600">{b.time || task.time}</div>
                            </div>
                            <div className="text-green-600">
                              {b2.isDone ? <FiCheckCircle /> : <FiMap />}
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="h-2.5 w-full bg-green-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full bg-green-600`} style={{ width: `${b2.pct}%` }} />
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-end">
                            {!b2.isDone ? (
                              <button 
                                disabled={!canStart} 
                                className={`text-[11px] px-3 py-1 rounded border font-semibold ${canStart ? 'border-green-300 text-green-700 bg-white' : 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'}`} 
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('=== START BUTTON CLICKED ===');
                                  console.log('canStart:', canStart);
                                  console.log('routeId from barangay:', routeId);
                                  console.log('barangay object (b):', b);
                                  console.log('barangay object keys:', Object.keys(b));
                                  console.log('task object:', task);
                                  console.log('task.taskRouteId:', task.taskRouteId);
                                  console.log('dailyByDate for this date:', dailyByDate[task.key]);
                                  console.log('task.key:', task.key);
                                  
                                  if (!canStart) {
                                    console.log('Cannot start - previous barangay not completed');
                                    return;
                                  }
                                
                                // If routeId is missing, try multiple sources to resolve it
                                let resolvedRouteId = routeId;
                                console.log('Initial resolvedRouteId:', resolvedRouteId);
                                if (resolvedRouteId == null) {
                                  console.log('routeId is null, trying to resolve...');
                                  // First, check if we have it in dailyByDate (already fetched)
                                  const dateKey = task.key;
                                  console.log('Looking for routes in dailyByDate for date:', dateKey);
                                  const dailyRoutes = dailyByDate[dateKey]?.barangayList || [];
                                  console.log('dailyRoutes found:', dailyRoutes);
                                  
                                  if (dailyRoutes.length > 0) {
                                    console.log('Searching in dailyRoutes. Looking for barangay:', b.name || b.barangay_name || b.barangay);
                                    // Try to find matching route by barangay name, barangay_name, or team_id
                                    const matchingRoute = dailyRoutes.find(r => {
                                      const routeName = (r.barangay_name || r.name || '').toLowerCase().trim();
                                      const barangayName = (b.barangay_name || b.name || b.barangay || '').toLowerCase().trim();
                                      const nameMatch = routeName && barangayName && routeName === barangayName;
                                      const teamMatch = r.team_id && b.team_id && Number(r.team_id) === Number(b.team_id);
                                      const barangayIdMatch = r.barangay_id && b.barangay_id && String(r.barangay_id) === String(b.barangay_id);
                                      const routeIdMatch = (r.route_id || r.id) && (b.route_id || b.id) && Number(r.route_id || r.id) === Number(b.route_id || b.id);
                                      const matches = nameMatch || teamMatch || barangayIdMatch || routeIdMatch;
                                      console.log('Checking route match:', { 
                                        routeName, 
                                        barangayName, 
                                        nameMatch, 
                                        teamMatch,
                                        barangayIdMatch,
                                        routeIdMatch,
                                        matches, 
                                        route: r,
                                        barangay: b
                                      });
                                      return matches;
                                    });
                                    console.log('matchingRoute from dailyByDate:', matchingRoute);
                                    if (matchingRoute) {
                                      // get_routes.php returns 'id' as the route_id
                                      resolvedRouteId = matchingRoute.id || matchingRoute.route_id;
                                      console.log('Found route_id from dailyByDate:', resolvedRouteId);
                                    } else {
                                      console.log('No matching route found in dailyRoutes. Available routes:', dailyRoutes.map(r => ({ 
                                        id: r.id, 
                                        route_id: r.route_id, 
                                        name: r.barangay_name || r.name,
                                        team_id: r.team_id 
                                      })));
                                    }
                                  }
                                  
                                  // If still not found, fetch from API
                                  if (resolvedRouteId == null) {
                                    console.log('Still null, fetching from API...');
                                    try {
                                      const user_id = localStorage.getItem('user_id') || sessionStorage.getItem('user_id') || '';
                                      const apiUrl = buildApiUrl(`get_routes.php?date=${dateKey}&role=driver&user_id=${encodeURIComponent(user_id)}`);
                                      console.log('Fetching from:', apiUrl);
                                      const res = await fetch(apiUrl, { headers: { ...authHeaders() } });
                                      const data = await res.json();
                                      console.log('API response:', data);
                                      if (data?.success && Array.isArray(data.routes)) {
                                        console.log('Routes from API:', data.routes);
                                        console.log('Searching for barangay:', b.name || b.barangay_name || b.barangay, 'team_id:', b.team_id);
                                        // Try to find matching route by barangay name or team_id
                                        const matchingRoute = data.routes.find(r => {
                                          const routeName = (r.barangay_name || r.name || '').toLowerCase().trim();
                                          const barangayName = (b.barangay_name || b.name || b.barangay || '').toLowerCase().trim();
                                          const nameMatch = routeName && barangayName && routeName === barangayName;
                                          const teamMatch = r.team_id && b.team_id && Number(r.team_id) === Number(b.team_id);
                                          const barangayIdMatch = r.barangay_id && b.barangay_id && String(r.barangay_id) === String(b.barangay_id);
                                          const matches = nameMatch || teamMatch || barangayIdMatch;
                                          console.log('Checking API route match:', { 
                                            routeName, 
                                            barangayName, 
                                            nameMatch, 
                                            teamMatch,
                                            barangayIdMatch,
                                            matches, 
                                            route: r,
                                            barangay: b
                                          });
                                          return matches;
                                        });
                                        console.log('matchingRoute from API:', matchingRoute);
                                        if (matchingRoute) {
                                          // get_routes.php returns 'id' as the route_id
                                          resolvedRouteId = matchingRoute.id;
                                          console.log('Found route_id from API:', resolvedRouteId);
                                        } else {
                                          console.log('No matching route found in API. Available routes:', data.routes.map(r => ({ 
                                            id: r.id, 
                                            name: r.barangay_name || r.name,
                                            team_id: r.team_id 
                                          })));
                                          
                                          // Last resort: if we have team_id, try to find ANY route with that team_id for this date
                                          if (b.team_id && data.routes.length > 0) {
                                            const teamRoute = data.routes.find(r => r.team_id && Number(r.team_id) === Number(b.team_id));
                                            if (teamRoute && teamRoute.id) {
                                              resolvedRouteId = teamRoute.id;
                                              console.log('Found route_id by team_id fallback:', resolvedRouteId);
                                            }
                                          }
                                        }
                                      } else {
                                        console.error('API did not return success or routes array:', data);
                                      }
                                    } catch (err) {
                                      console.error('Failed to fetch route_id:', err);
                                    }
                                  }
                                  
                                  // Final fallback: if we have team_id but no route_id, try to fetch directly from a route lookup API
                                  if (resolvedRouteId == null && b.team_id) {
                                    console.log('Trying final fallback with team_id:', b.team_id);
                                    // We could create a new API endpoint, but for now, let's try to use the first route from get_routes if available
                                    // This is a temporary workaround
                                  }
                                }
                                
                                // Last resort: if we still don't have route_id but have team_id, 
                                // try to fetch routes again without role filter to get all routes for this date
                                if (resolvedRouteId == null && b.team_id) {
                                  console.log('Trying to fetch all routes for date without role filter...');
                                  try {
                                    const apiUrl = buildApiUrl(`get_routes.php?date=${task.key}`);
                                    console.log('Fetching all routes from:', apiUrl);
                                    const res = await fetch(apiUrl, { headers: { ...authHeaders() } });
                                    const data = await res.json();
                                    console.log('All routes response:', data);
                                    if (data?.success && Array.isArray(data.routes)) {
                                      console.log('Available routes:', data.routes.map(r => ({ id: r.id, team_id: r.team_id, name: r.barangay_name || r.name })));
                                      // Find by team_id
                                      const teamRoute = data.routes.find(r => r.team_id && Number(r.team_id) === Number(b.team_id));
                                      if (teamRoute && teamRoute.id) {
                                        resolvedRouteId = teamRoute.id;
                                        console.log('Found route_id by team_id from all routes:', resolvedRouteId);
                                      } else {
                                        // Find by barangay name
                                        const nameRoute = data.routes.find(r => {
                                          const routeName = (r.barangay_name || r.name || '').toLowerCase().trim();
                                          const barangayName = (b.barangay_name || b.name || b.barangay || '').toLowerCase().trim();
                                          return routeName && barangayName && routeName === barangayName;
                                        });
                                        if (nameRoute && nameRoute.id) {
                                          resolvedRouteId = nameRoute.id;
                                          console.log('Found route_id by name from all routes:', resolvedRouteId);
                                        }
                                      }
                                    }
                                  } catch (err) {
                                    console.error('Failed in final fallback:', err);
                                  }
                                }
                                
                                console.log('Final resolvedRouteId:', resolvedRouteId);
                                if (resolvedRouteId == null) { 
                                  console.error('ERROR: Could not resolve route_id after all attempts!');
                                  console.error('Barangay object (b):', JSON.stringify(b, null, 2));
                                  console.error('Task object:', JSON.stringify(task, null, 2));
                                  console.error('dailyByDate for this date:', JSON.stringify(dailyByDate[task.key], null, 2));
                                  alert(`Missing route id for ${b.name || b.barangay_name || 'this barangay'}. Team ID: ${b.team_id || 'N/A'}. Please contact support.`); 
                                  return; 
                                }
                                
                                try {
                                  const user_id = localStorage.getItem('user_id') || sessionStorage.getItem('user_id') || null;
                                  await fetch(buildApiUrl('update_route_status.php'), {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', ...authHeaders() },
                                    body: JSON.stringify({ route_id: Number(resolvedRouteId), status: 'in_progress', user_id })
                                  });
                                  // Set active route for collectors to auto-redirect
                                  try {
                                    await fetch(buildApiUrl('set_route_active.php'), {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', ...authHeaders() },
                                      body: JSON.stringify({ route_id: Number(resolvedRouteId), barangay: b.barangay_name || b.name || '', team_id: b.team_id || task.team_id || null })
                                    });
                                  } catch(_) {}
                                  // Also set in localStorage for same-device collectors
                                  try {
                                    const activeRouteData = { route_id: Number(resolvedRouteId), barangay: b.barangay_name || b.name || '', team_id: b.team_id || task.team_id || 1, started_at: new Date().toISOString(), status: 'in_progress' };
                                    localStorage.setItem('active_route', JSON.stringify(activeRouteData));
                                    sessionStorage.setItem('active_route', JSON.stringify(activeRouteData));
                                  } catch(_) {}
                                } catch(_) { /* ignore, still navigate */ }
                                try {
                                  // Optional: user feedback
                                  // alert(`✅ Route started for ${b.barangay_name || b.name || 'Route'}!`);
                                  const res = await fetch(buildApiUrl(`get_route_details.php?id=${Number(resolvedRouteId)}`), { headers: { ...authHeaders() } });
                                  const data = await res.json();
                                  if (data?.success && data.route?.stops) {
                                    navigate(`/truckdriver/route/${resolvedRouteId}`, {
                                      state: {
                                        barangay: b.barangay_name || b.name || 'Route',
                                        collectionPoints: data.route.stops,
                                        routeName: data.route.cluster_id || (b.barangay_name || b.name || 'Route')
                                      }
                                    });
                                    return;
                                  }
                                } catch(_) {}
                                navigate(`/truckdriver/route/${resolvedRouteId}`);
                              }}>Start</button>
                            ) : (
                              <span className="text-[11px] text-green-700 font-semibold">Completed</span>
                            )}
                          </div>
                        </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Footer: Team Information */
                }
                <div className="px-5 pb-4 pt-1">
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
                            className="flex items-center justify-between gap-3 border-b border-gray-300 pb-1 last:border-b-0"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-gray-900 shrink-0">Collector Name {i + 1}:</span>
                              <span className="font-semibold text-gray-900 truncate">{collectorName}</span>
                            </div>
                            <span
                              className={`uppercase font-semibold text-xs sm:text-[11px] ${responseColor(c.response_status)}`}
                            >
                              {String(c.response_status || 'pending').toUpperCase()}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-500">No collectors listed</div>
                    )}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-gray-900 shrink-0">Driver Name:</span>
                        <span className="font-semibold text-gray-900 truncate">{task.driverName || fallbackDriverName || 'N/A'}</span>
                      </div>
                      <span className={`uppercase font-semibold text-xs sm:text-[11px] ${responseColor(task.yourResponseStatus)}`}>
                        {String(task.yourResponseStatus || 'pending').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
