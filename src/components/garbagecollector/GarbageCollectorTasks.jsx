import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiMap, FiCheckCircle, FiFilter, FiX, FiSearch } from 'react-icons/fi';
import { buildApiUrl } from '../../config/api';

function normalizeId(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 0 ? value : null;
  }
  const str = String(value).trim();
  if (!str || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') return null;
  const numeric = Number(str);
  if (!Number.isNaN(numeric) && Number.isFinite(numeric) && numeric > 0) {
    return numeric;
  }
  return str;
}

function findRouteFromList(list, { teamId, barangayName, scheduleId }) {
  if (!Array.isArray(list)) return null;
  const normalizedTeamId = normalizeId(teamId);
  const normalizedScheduleId = normalizeId(scheduleId);
  const normalizedName = barangayName ? String(barangayName).trim().toLowerCase() : '';

  const matchByTeam = normalizedTeamId
    ? list.find((item) => normalizeId(item.team_id ?? item.teamId) === normalizedTeamId)
    : null;
  if (matchByTeam) {
    const candidate = normalizeId(matchByTeam.route_id ?? matchByTeam.routeId ?? matchByTeam.id);
    if (candidate) return candidate;
  }

  if (normalizedScheduleId) {
    const matchBySchedule = list.find((item) => normalizeId(item.schedule_id ?? item.scheduleId) === normalizedScheduleId);
    if (matchBySchedule) {
      const candidate = normalizeId(matchBySchedule.route_id ?? matchBySchedule.routeId ?? matchBySchedule.id);
      if (candidate) return candidate;
    }
  }

  if (normalizedName) {
    const matchByName = list.find((item) => {
      const candidateName = String(item.name || item.barangay_name || item.barangayName || '').trim().toLowerCase();
      return candidateName === normalizedName;
    });
    if (matchByName) {
      const candidate = normalizeId(matchByName.route_id ?? matchByName.routeId ?? matchByName.id);
      if (candidate) return candidate;
    }
  }

  return null;
}

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

export default function GarbageCollectorTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTab, setFilterTab] = useState('today'); // 'today' | 'upcoming' | 'all'
  const [dailyByDate, setDailyByDate] = useState({});
  const [startLoadingKey, setStartLoadingKey] = useState(null);
  const [barangayBreakdown, setBarangayBreakdown] = useState({}); // Store per-barangay stop counts
  const [scheduleTimeFilter, setScheduleTimeFilter] = useState('am'); // 'am' | 'pm'

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'in-progress' | 'completed' | 'cancelled'
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD format
  const [searchFilter, setSearchFilter] = useState(''); // Search by barangay or truck number

  const userId = useMemo(() => {
    try { return localStorage.getItem('user_id') || localStorage.getItem('userId') || ''; } catch (_) { return ''; }
  }, []);

  const fallbackCollectorName = useMemo(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (!storedUser) return '';
      const fullFromFields = [
        storedUser.firstname,
        storedUser.lastname,
        storedUser.first_name,
        storedUser.last_name,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();
      if (fullFromFields) return fullFromFields;
      if (storedUser.full_name) return String(storedUser.full_name).trim();
      if (storedUser.fullname) return String(storedUser.fullname).trim();
      if (storedUser.name) return String(storedUser.name).trim();
      return storedUser.username || '';
    } catch (_) {
      return '';
    }
  }, []);

  const authHeaders = () => {
    try { const t = localStorage.getItem('access_token'); return t ? { Authorization: `Bearer ${t}` } : {}; } catch { return {}; }
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
        const routeId = task.routeId || task.route_id || (task.barangayList && task.barangayList[0] && (task.barangayList[0].route_id || task.barangayList[0].id));
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

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true); setError(null);
      try {
        const res = await fetch(buildApiUrl(`get_personnel_schedule.php?user_id=${userId}&role=collector`), { headers: { ...authHeaders() } });
        const data = await res.json();
        if (data.success) {
          const mapped = (data.schedules || []).map((s, idx) => {
            const status = (s.status || '').toLowerCase();
            const uiStatus = status === 'scheduled' ? 'in-progress' : status === 'completed' ? 'completed' : 'pending';
            const resolvedRouteId = [
              s.route_id,
              s.routeId,
              s.route_record_id,
              s.routeRecordId,
            ].find((value) => value != null && value !== '' && value !== 'null');
            const collectors = Array.isArray(s.collectors) ? (s.collectors || []).map((c) => ({
              ...c,
              displayName:
                [c.firstname, c.lastname].filter(Boolean).join(' ').trim() ||
                [c.first_name, c.last_name].filter(Boolean).join(' ').trim() ||
                c.full_name ||
                c.fullname ||
                c.name ||
                c.username ||
                'Unknown',
            })) : [];
            const rawDriverName = [
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
            const driverName = [rawDriverName, driverFallbackFromApi]
              .map((value) => {
                const trimmed = String(value || '').trim();
                if (!trimmed) return '';
                const upper = trimmed.toUpperCase();
                if (upper === 'N/A' || upper === 'NA' || upper === 'NONE') return '';
                return trimmed;
              })
              .find(Boolean) || 'N/A';
            const normalizeName = (value) => {
              const trimmed = String(value || '').trim();
              if (!trimmed) return '';
              const upper = trimmed.toUpperCase();
              if (upper === 'N/A' || upper === 'NA' || upper === 'NONE') return '';
              return trimmed;
            };
            const collectorDisplayName = normalizeName(fallbackCollectorName);
            return {
              id: s.schedule_id || idx,
              scheduleId: s.schedule_id || idx,
              routeId: resolvedRouteId != null ? Number(resolvedRouteId) || resolvedRouteId : null,
              teamId: s.team_id,
              barangayId: s.barangay_id,
              title: `${s.barangay || 'Route'} Route`,
              description: `Driver: ${s.driver_name || 'N/A'}`,
              priority: 'normal',
              status: uiStatus,
              dueTime: `${(s.time || '').slice(0, 5)} - ${(s.end_time || '').slice(0, 5)}`,
              location: s.barangay || '—',
              date: formatPrettyDate(s.date),
              truckPlate: s.truck_number || 'N/A',
              truckType: s.truck_model || 'N/A',
              truckCapacity: s.truck_capacity ?? null,
              teamStatus: s.team_status || 'pending',
              yourResponseStatus: s.your_response_status || 'pending',
              collectors,
              driverName,
              rawDate: s.date,
              fallbackCollectorName: collectorDisplayName,
              totalStops: s.total_stops ?? 0,
              completedStops: s.completed_stops ?? 0,
            };
          });
          setTasks(mapped);
        } else { setTasks([]); setError(data.message || 'Failed to load tasks'); }
      } catch (e) { setTasks([]); setError('Network error while loading tasks'); }
      finally { setLoading(false); }
    }
    if (userId) fetchTasks(); else { setLoading(false); setTasks([]); }
  }, [userId]);

  const acceptDecline = async (teamId, response) => {
    try {
      const res = await fetch(buildApiUrl('respond_assignment.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ assignment_id: teamId, user_id: userId, response_status: response, role: 'collector' })
      });
      const data = await res.json();
      if (data.success) {
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
          const barangayMatch = String(t.location || '').toLowerCase().includes(searchLower);
          const truckMatch = String(t.truckPlate || '').toLowerCase().includes(searchLower);
          const titleMatch = String(t.title || '').toLowerCase().includes(searchLower);
          return barangayMatch || truckMatch || titleMatch;
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
        const barangayMatch = String(t.location || '').toLowerCase().includes(searchLower);
        const truckMatch = String(t.truckPlate || '').toLowerCase().includes(searchLower);
        const titleMatch = String(t.title || '').toLowerCase().includes(searchLower);
        return barangayMatch || truckMatch || titleMatch;
      });
    }

    return validTasks;
  }, [tasks, filterTab, statusFilter, dateFilter, searchFilter]);

  // Group and enrich by Date + Truck + Driver
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

      const dateKey = normalizeDate(t.rawDate);
      if (!dateKey) continue;

      // Group by Date + Truck + Driver to merge schedules for the same shift/team
      // Use a fallback for missing truck/driver to avoid grouping unrelated tasks
      const truckKey = (t.truckPlate || 'UnknownTruck').trim().toLowerCase();
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
          vehicle: t.truckPlate,
          barangayList: [],
          collectors: t.collectors || [],
          yourResponseStatus: t.yourResponseStatus || 'pending',
          driverName: t.driverName,
          fallbackCollectorName: t.fallbackCollectorName,
        };
      }
      const bucket = map[uniqueKey];
      const [start, end] = String(t.dueTime || '').split(' - ');
      if (start) bucket.startTimes.push(start);
      if (end) bucket.endTimes.push(end);
      bucket.vehicle = bucket.vehicle || t.truckPlate;
      bucket.barangayList.push({
        name: t.location,
        time: t.dueTime,
        route_id: t.routeId ?? null,
        schedule_id: t.scheduleId ?? t.id,
        barangay_id: t.barangayId,
        totalStops: t.totalStops || 0,
        completedStops: t.completedStops || 0,
        status: t.status,
        team_id: t.teamId,
      });
    }
    let cards = Object.values(map).map((d) => ({
      ...d,
      time: (d.startTimes.sort()[0] || '') && (d.endTimes.sort().slice(-1)[0] || '') ? `${d.startTimes.sort()[0]} - ${d.endTimes.sort().slice(-1)[0]}` : (d.startTimes.sort()[0] || d.endTimes.sort().slice(-1)[0] || '-'),
      barangayList: d.barangayList,
      barangayCount: d.barangayList.length,
      totalStops: d.barangayList.reduce((s, b) => s + (Number(b.totalStops) || 0), 0),
      completedStops: d.barangayList.reduce((s, b) => s + (Number(b.completedStops) || 0), 0),
      remainingStops: 0,
      driverName: d.driverName,
      fallbackCollectorName: d.fallbackCollectorName,
    })).sort((a, b) => {
      // Sort by date first, then by time
      const dateCompare = a.dateKey.localeCompare(b.dateKey);
      if (dateCompare !== 0) return dateCompare;
      return (a.time || '').localeCompare(b.time || '');
    });

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
          const cardDate = normalizeDate(card.dateKey);
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

  // Fetch daily routes for date cards (collector perspective)
  useEffect(() => {
    const uniqueDates = Array.from(new Set(filteredTasks.map(t => String(t.rawDate || '').slice(0, 10)).filter(Boolean)));
    if (uniqueDates.length === 0) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(uniqueDates.map(async (dateKey) => {
        try {
          const res = await fetch(buildApiUrl(`get_routes.php?date=${dateKey}&role=collector&user_id=${userId}`), { headers: { ...authHeaders() } });
          const data = await res.json();
          if (!data?.success) return [dateKey, null];
          const barangayList = (data.routes || []).map((r, idx) => ({
            id: r.id ?? idx,
            route_id: r.id ?? idx,
            name: r.barangay_name || r.name || 'Barangay',
            time: `${String(r.start_time || '').slice(0, 5)} - ${String(r.end_time || '').slice(0, 5)}`,
            totalStops: Number(r.total_stops || 0),
            completedStops: Number(r.completed_stops || 0),
            status: r.status || 'scheduled',
            team_id: r.team_id || null,
          }));
          return [dateKey, { barangayList }];
        } catch (_) { return [dateKey, null]; }
      }));
      if (cancelled) return;
      const next = {};
      for (const [k, v] of entries) if (k && v) next[k] = v;
      if (Object.keys(next).length) setDailyByDate(prev => ({ ...prev, ...next }));
    })();
    return () => { cancelled = true; };
  }, [filteredTasks, userId]);
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border border-red-100';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border border-amber-100';
      case 'normal':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-100';
      default:
        return 'text-gray-700 bg-gray-50 border border-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border border-green-100';
      case 'in-progress':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-100';
      case 'pending':
        return 'text-gray-700 bg-gray-50 border border-gray-100';
      default:
        return 'text-gray-700 bg-gray-50 border border-gray-100';
    }
  };

  const resolveRouteId = useCallback(async ({ existingRouteId, dateKey, teamId, barangayName, scheduleId }) => {
    const direct = normalizeId(existingRouteId);
    if (direct) return direct;

    const cachedList = dailyByDate[dateKey]?.barangayList;
    const fromCache = findRouteFromList(cachedList, { teamId, barangayName, scheduleId });
    if (fromCache) return fromCache;

    const mapRoutes = (routes) => (routes || []).map((r, idx) => ({
      id: r.id ?? idx,
      route_id: r.id ?? idx,
      name: r.barangay_name || r.name || 'Barangay',
      time: `${String(r.start_time || '').slice(0, 5)} - ${String(r.end_time || '').slice(0, 5)}`,
      totalStops: Number(r.total_stops || 0),
      completedStops: Number(r.completed_stops || 0),
      status: r.status || 'scheduled',
      team_id: r.team_id || null,
      schedule_id: r.schedule_id || null,
    }));

    const fetchRoutes = async (includeUserContext) => {
      try {
        const url = new URL(buildApiUrl('get_routes.php'));
        url.searchParams.set('date', dateKey);
        if (includeUserContext && userId) {
          url.searchParams.set('role', 'collector');
          url.searchParams.set('user_id', userId);
        }
        const res = await fetch(url.toString(), { headers: { ...authHeaders() } });
        const data = await res.json();
        if (!data?.success) return null;
        const barangayList = mapRoutes(data.routes);
        if (barangayList.length) {
          setDailyByDate((prev) => ({ ...prev, [dateKey]: { barangayList } }));
        }
        return barangayList;
      } catch (e) {
        console.error('Failed to resolve route id:', e);
        return null;
      }
    };

    const prioritizedList = await fetchRoutes(true);
    const resolvedFromPreferred = findRouteFromList(prioritizedList, { teamId, barangayName, scheduleId });
    if (resolvedFromPreferred) return resolvedFromPreferred;

    const fallbackList = await fetchRoutes(false);
    return findRouteFromList(fallbackList, { teamId, barangayName, scheduleId });
  }, [dailyByDate, userId]);

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
            .map((task) => (
              <div key={task.key} className="rounded-md border border-green-100 bg-green-50 shadow-sm overflow-hidden">
                <div className="px-5 pt-4 pb-2 bg-green-100/70 border-b border-green-200 flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2 font-semibold text-gray-900">
                    <FiCalendar className="text-green-700" />
                    <span className="uppercase tracking-wide">{task.dateLabel}</span>
                  </div>
                  <div className="text-[11px] text-gray-700">Priority Barangay</div>
                </div>
                <div className="px-5 pb-3 pt-3">
                  <div className="grid grid-cols-2 gap-y-2 text-[12px] text-gray-800">
                    <div className="flex items-center"><span className="text-gray-700">Time:</span></div>
                    <div className="flex items-center justify-end"><span className="font-medium">{task.time}</span></div>
                    <div className="flex items-center justify-between pr-3"><span className="text-gray-700">Truck Number:</span><span className="font-medium ml-2">{task.vehicle || 'N/A'}</span></div>
                    <div className="flex items-center justify-between"><span className="text-gray-700">Barangays:</span><span className="font-medium ml-2">{task.barangayCount ?? '-'}</span></div>
                    <div className="flex items-center justify-between pr-3"><span className="text-gray-700">Total Stops:</span><span className="font-medium ml-2">{task.totalStops ?? 0}</span></div>
                    <div className="flex items-center justify-between"><span className="text-gray-700">Completed:</span><span className="font-medium ml-2">{task.completedStops ?? 0}</span></div>
                    <div className="flex items-center justify-between pr-3"><span className="text-gray-700">Remaining:</span><span className="font-medium ml-2">{(task.totalStops || 0) - (task.completedStops || 0)}</span></div>
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
                <div className="px-5 pb-2">
                  <div className="text-[12px] font-semibold text-gray-700 mb-2">SCHEDULE BREAKDOWN</div>
                  <div className="grid gap-2">
                    {(task.barangayList || [])
                      .map((b, i) => {
                        return (
                          <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-2.5 shadow-sm">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="text-[11px] font-semibold text-gray-900 leading-4">{b.name || `Route ${i + 1}`}</div>
                                <div className="text-[10px] text-gray-600">{b.time || task.time}</div>
                              </div>
                              <div className="text-green-600 text-sm">
                                <FiMap />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
                {/* Single Start Route Button */}
                <div className="px-5 pb-3">
                  {(() => {
                    const isFullyCompleted = (task.totalStops || 0) > 0 && (task.completedStops || 0) >= (task.totalStops || 0);
                    const routeId = task.routeId || task.route_id || (task.barangayList && task.barangayList[0] && (task.barangayList[0].route_id || task.barangayList[0].id));
                    const uniqueKey = `${task.key}-start-route`;

                    if (isFullyCompleted) {
                      return (
                        <div className="text-center py-2 text-green-700 font-semibold text-sm">
                          <FiCheckCircle className="inline mr-1" />
                          Route Completed
                        </div>
                      );
                    }

                    return (
                      <button
                        disabled={startLoadingKey === uniqueKey}
                        className="w-full px-4 py-2.5 rounded-lg border-2 border-green-600 text-green-700 bg-white font-semibold text-sm hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={async () => {
                          setStartLoadingKey(uniqueKey);
                          const resolved = await resolveRouteId({
                            existingRouteId: routeId,
                            dateKey: task.key,
                            teamId: task.teamId,
                            barangayName: task.title,
                            scheduleId: task.scheduleId,
                          });
                          setStartLoadingKey(null);
                          if (resolved) {
                            // Navigate WITHOUT barangay_id to show all stops
                            navigate(`/garbagecollector/route/${resolved}`);
                          } else {
                            alert('Missing route id. Please refresh and try again.');
                          }
                        }}
                      >
                        {startLoadingKey === uniqueKey ? 'Loading…' : 'Start Route'}
                      </button>
                    );
                  })()}
                </div>
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
                        const statusValue = String(c.response_status || 'pending').toLowerCase();
                        const statusColor = statusValue === 'accepted'
                          ? 'text-green-700'
                          : statusValue === 'declined'
                            ? 'text-red-600'
                            : 'text-yellow-700';
                        return (
                          <div
                            key={c.user_id ?? c.id ?? i}
                            className="flex items-center justify-between gap-3 border-b border-gray-300 pb-1 last:border-b-0"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-gray-900 shrink-0">Collector Name {i + 1}:</span>
                              <span className="font-semibold text-gray-900 truncate">{collectorName}</span>
                            </div>
                            <span className={`uppercase font-semibold text-xs sm:text-[11px] ${statusColor}`}>
                              {String(c.response_status || 'pending').toUpperCase()}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      fallbackCollectorName ? (
                        <div className="flex items-center justify-between gap-3 border-b border-gray-300 pb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-gray-900 shrink-0">Collector Name:</span>
                            <span className="font-semibold text-gray-900 truncate">{fallbackCollectorName}</span>
                          </div>
                          <span className={`uppercase font-semibold text-xs sm:text-[11px] ${String(task.yourResponseStatus || 'pending').toLowerCase() === 'accepted' ? 'text-green-700' : String(task.yourResponseStatus || 'pending').toLowerCase() === 'declined' ? 'text-red-600' : 'text-yellow-700'}`}>
                            {String(task.yourResponseStatus || 'pending').toUpperCase()}
                          </span>
                        </div>
                      ) : (
                        <div className="text-gray-500">No collectors listed</div>
                      )
                    )}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-gray-900 shrink-0">Driver Name:</span>
                        <span className="font-semibold text-gray-900 truncate">{task.driverName || 'N/A'}</span>
                      </div>
                      <span className={`uppercase font-semibold text-xs sm:text-[11px] ${String(task.yourResponseStatus || 'pending').toLowerCase() === 'accepted' ? 'text-green-700' : String(task.yourResponseStatus || 'pending').toLowerCase() === 'declined' ? 'text-red-600' : 'text-yellow-700'}`}>
                        {String(task.yourResponseStatus || 'pending').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
