import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiTruck, FiMap, FiCheckCircle } from 'react-icons/fi';
import { GiTrashCan } from 'react-icons/gi';
import { buildApiUrl } from '../../config/api';

// Helper to format date like "May 05, 2025"
function formatPrettyDate(dateStr) {
  try {
    const d = new Date(dateStr);
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

  const userId = useMemo(() => {
    try {
      return localStorage.getItem('user_id') || localStorage.getItem('userId') || '';
    } catch (_) { return ''; }
  }, []);

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
  const res = await fetch(buildApiUrl(`get_personnel_schedule.php?user_id=${userId}&role=driver`));
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
            const barangayList = Array.isArray(s.barangay_list)
              ? s.barangay_list
              : Array.isArray(s.routes)
                ? s.routes
                : [
                    {
                      name: s.barangay || 'Route',
                      time: `${(s.time || '').slice(0,5)} - ${(s.end_time || '').slice(0,5)}`,
                      totalStops: s.total_stops ?? 0,
                      completedStops: s.completed_stops ?? 0,
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
        headers: { 'Content-Type': 'application/json' },
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
    // Use local date to avoid UTC off-by-one on mobile
    const todayStr = (() => {
      try { return new Date().toLocaleDateString('en-CA'); } catch(_) { return new Date().toISOString().slice(0,10); }
    })();
    const isToday = (d) => (d || '').slice(0,10) === todayStr;
    if (filterTab === 'today') return tasks.filter(t => isToday(t.rawDate));
    return tasks.filter(t => !isToday(t.rawDate));
  }, [tasks, filterTab]);

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
      const dateKey = String(t.rawDate || '').slice(0,10);
      if (!dateKey) continue;
      if (!map[dateKey]) {
        map[dateKey] = {
          key: dateKey,
          dateLabel: t.date,
          startTimes: [],
          endTimes: [],
          vehicle: t.vehicle,
          barangayList: [],
          totalStops: 0,
          completedStops: 0,
          collectors: [],
          driverName: t.driverName,
          yourResponseStatus: t.yourResponseStatus,
        };
      }
      const bucket = map[dateKey];
      const [start, end] = String(t.time || '').split(' - ');
      if (start) bucket.startTimes.push(start);
      if (end) bucket.endTimes.push(end);
      bucket.vehicle = bucket.vehicle || t.vehicle;
      if (Array.isArray(t.barangayList)) bucket.barangayList.push(...t.barangayList);
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
    return Object.values(map).map((d) => {
      const start = d.startTimes.sort()[0] || '';
      const end = d.endTimes.sort().slice(-1)[0] || '';
      return {
        ...d,
        time: start && end ? `${start} - ${end}` : start || end || '-',
        // If we fetched daily routes for this date, prefer those for the list
        barangayList: (dailyByDate[d.key]?.barangayList?.length ? dailyByDate[d.key].barangayList : d.barangayList),
        barangayCount: (dailyByDate[d.key]?.barangayList?.length ? dailyByDate[d.key].barangayList.length : d.barangayList.length),
        remainingStops: Math.max(0, Number(d.totalStops) - Number(d.completedStops)),
      };
    }).sort((a,b) => a.key.localeCompare(b.key));
  }, [filteredTasks, dailyByDate]);

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
          const res = await fetch(buildApiUrl(`get_routes.php?date=${dateKey}&role=driver&user_id=${encodeURIComponent(user_id)}`));
          const data = await res.json();
          if (!data?.success) return [dateKey, null];
          const barangayList = (data.routes || []).map((r, idx) => ({
            id: r.id ?? idx,
            route_id: r.id ?? idx,
            name: r.barangay_name || r.name || 'Barangay',
            time: `${String(r.start_time||'').slice(0,5)} - ${String(r.end_time||'').slice(0,5)}`,
            totalStops: Number(r.total_stops || 0),
            completedStops: Number(r.completed_stops || 0),
            status: r.status || 'scheduled',
            team_id: r.team_id || null,
            barangay_name: r.barangay_name || null,
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

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center py-5 px-3">
      <div className="w-full max-w-lg">
        <h1 className="text-[18px] font-semibold text-gray-900 mb-1 pl-1 tracking-tight">ASSIGNED TASK</h1>
        <p className="text-[13px] text-gray-600 mb-4 pl-1">You're all set for today's task</p>
        <div className="flex gap-2 mb-4 pl-1">
          {['today','upcoming'].map(tab => (
            <button key={tab} onClick={() => setFilterTab(tab)} className={`px-3 py-1 rounded text-xs font-semibold border ${filterTab===tab?'bg-green-600 text-white border-green-600':'bg-white text-green-700 border-green-200'}`}>
              {tab === 'today' ? 'Today' : tab === 'upcoming' ? 'Upcoming' : 'All'}
            </button>
          ))}
        </div>
        {loading && <div className="text-sm text-gray-600 pl-1">Loading tasks...</div>}
        {error && !loading && <div className="text-sm text-red-600 pl-1">{error}</div>}
        {!loading && !error && tasks.length === 0 && <div className="text-sm text-gray-500 pl-1">No tasks found.</div>}

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
                        const routeId = b.id ?? b.route_id ?? b.routeId ?? b.cluster_id;
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
                              <button disabled={!canStart} className={`text-[11px] px-3 py-1 rounded border font-semibold ${canStart ? 'border-green-300 text-green-700 bg-white' : 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'}`} onClick={async () => {
                                if (!canStart) return;
                                if (routeId == null) { alert('Missing route id for this barangay'); return; }
                                try {
                                  const user_id = localStorage.getItem('user_id') || sessionStorage.getItem('user_id') || null;
                                  await fetch(buildApiUrl('update_route_status.php'), {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ route_id: Number(routeId), status: 'in_progress', user_id })
                                  });
                                  // Set active route for collectors to auto-redirect
                                  try {
                                    await fetch(buildApiUrl('set_route_active.php'), {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ route_id: Number(routeId), barangay: b.barangay_name || b.name || '', team_id: b.team_id || task.team_id || null })
                                    });
                                  } catch(_) {}
                                  // Also set in localStorage for same-device collectors
                                  try {
                                    const activeRouteData = { route_id: Number(routeId), barangay: b.barangay_name || b.name || '', team_id: b.team_id || task.team_id || 1, started_at: new Date().toISOString(), status: 'in_progress' };
                                    localStorage.setItem('active_route', JSON.stringify(activeRouteData));
                                    sessionStorage.setItem('active_route', JSON.stringify(activeRouteData));
                                  } catch(_) {}
                                } catch(_) { /* ignore, still navigate */ }
                                try {
                                  // Optional: user feedback
                                  // alert(`✅ Route started for ${b.barangay_name || b.name || 'Route'}!`);
                                  const res = await fetch(buildApiUrl(`get_route_details.php?id=${Number(routeId)}`));
                                  const data = await res.json();
                                  if (data?.success && data.route?.stops) {
                                    navigate(`/truckdriver/route/${routeId}`, {
                                      state: {
                                        barangay: b.barangay_name || b.name || 'Route',
                                        collectionPoints: data.route.stops,
                                        routeName: data.route.cluster_id || (b.barangay_name || b.name || 'Route')
                                      }
                                    });
                                    return;
                                  }
                                } catch(_) {}
                                navigate(`/truckdriver/route/${routeId}`);
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
