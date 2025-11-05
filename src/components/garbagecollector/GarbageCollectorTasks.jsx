import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiMap, FiCheckCircle } from 'react-icons/fi';
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

function formatPrettyDate(dateStr) {
  try { const d = new Date(dateStr); return d.toLocaleDateString(undefined, { month: 'long', day: '2-digit', year: 'numeric' }); } catch (_) { return dateStr; }
}

export default function GarbageCollectorTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTab, setFilterTab] = useState('today'); // 'today' | 'upcoming' | 'all'
  const [dailyByDate, setDailyByDate] = useState({});
  const [startLoadingKey, setStartLoadingKey] = useState(null);

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
              title: `${s.barangay || 'Route'} Route`,
              description: `Driver: ${s.driver_name || 'N/A'}`,
              priority: 'normal',
              status: uiStatus,
              dueTime: `${(s.time || '').slice(0,5)} - ${(s.end_time || '').slice(0,5)}`,
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
    const todayStr = (() => { try { return new Date().toLocaleDateString('en-CA'); } catch(_) { return new Date().toISOString().slice(0,10); } })();
    const isToday = (d) => (d || '').slice(0,10) === todayStr;
    if (filterTab === 'today') return tasks.filter(t => isToday(t.rawDate));
    return tasks.filter(t => !isToday(t.rawDate));
  }, [tasks, filterTab]);

  // Group and enrich by date similar to TruckDriverTask
  const dailyCards = useMemo(() => {
    const map = {};
    for (const t of filteredTasks) {
      const key = String(t.rawDate || '').slice(0,10);
      if (!key) continue;
      if (!map[key]) {
        map[key] = {
          key,
          dateLabel: t.date,
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
      const bucket = map[key];
      const [start, end] = String(t.dueTime || '').split(' - ');
      if (start) bucket.startTimes.push(start);
      if (end) bucket.endTimes.push(end);
      bucket.vehicle = bucket.vehicle || t.truckPlate;
      bucket.barangayList.push({
        name: t.location,
        time: t.dueTime,
        route_id: t.routeId ?? null,
        schedule_id: t.scheduleId ?? t.id,
        totalStops: 0,
        completedStops: 0,
        status: t.status,
        team_id: t.teamId,
      });
    }
    return Object.values(map).map((d) => ({
      ...d,
      time: (d.startTimes.sort()[0] || '') && (d.endTimes.sort().slice(-1)[0] || '') ? `${d.startTimes.sort()[0]} - ${d.endTimes.sort().slice(-1)[0]}` : (d.startTimes.sort()[0] || d.endTimes.sort().slice(-1)[0] || '-'),
      barangayList: (dailyByDate[d.key]?.barangayList?.length ? dailyByDate[d.key].barangayList : d.barangayList),
      barangayCount: (dailyByDate[d.key]?.barangayList?.length ? dailyByDate[d.key].barangayList.length : d.barangayList.length),
      totalStops: (dailyByDate[d.key]?.barangayList || d.barangayList).reduce((s, b) => s + (Number(b.totalStops) || 0), 0),
      completedStops: (dailyByDate[d.key]?.barangayList || d.barangayList).reduce((s, b) => s + (Number(b.completedStops) || 0), 0),
      remainingStops: 0,
      driverName: d.driverName,
      fallbackCollectorName: d.fallbackCollectorName,
    })).sort((a,b)=>a.key.localeCompare(b.key));
  }, [filteredTasks, dailyByDate]);

  // Fetch daily routes for date cards (collector perspective)
  useEffect(() => {
    const uniqueDates = Array.from(new Set(filteredTasks.map(t => String(t.rawDate||'').slice(0,10)).filter(Boolean)));
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
            time: `${String(r.start_time||'').slice(0,5)} - ${String(r.end_time||'').slice(0,5)}`,
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
          {dailyCards.map((task) => (
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
                  <div className="flex items-center justify-between pr-3"><span className="text-gray-700">Remaining:</span><span className="font-medium ml-2">{(task.totalStops||0)-(task.completedStops||0)}</span></div>
                  <div></div>
                </div>
              </div>
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
                      const routeId = b.route_id || b.id;
                      return { raw: b, pct, isDone, routeId };
                    });
                    return barangays.map((b2, i) => {
                      const canStart = !b2.isDone && (i === 0 || barangays[i-1].isDone);
                      const b = b2.raw;
                      const routeId = normalizeId(b2.routeId);
                      const uniqueKey = `${task.key}-${normalizeId(b.schedule_id ?? routeId ?? i) ?? i}`;
                      return (
                      <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-3 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-[12px] font-semibold text-gray-900 leading-4">{b.name || `Route ${i+1}`}</div>
                            <div className="text-[11px] text-gray-600">{b.time || task.time}</div>
                          </div>
                          <div className="text-green-600">{b2.isDone ? <FiCheckCircle /> : <FiMap />}</div>
                  </div>
                        <div className="mt-2">
                          <div className="h-2.5 w-full bg-green-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-600 rounded-full" style={{ width: `${b2.pct}%` }} />
                  </div>
                </div>
                        <div className="mt-2 flex items-center justify-end">
                          {!b2.isDone ? (
                            <button
                              disabled={!canStart || startLoadingKey === uniqueKey}
                              className={`text-[11px] px-3 py-1 rounded border font-semibold ${canStart && startLoadingKey !== uniqueKey ? 'border-green-300 text-green-700 bg-white' : 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'}`}
                              onClick={async () => {
                                if (!canStart) return;
                                setStartLoadingKey(uniqueKey);
                                const resolved = await resolveRouteId({
                                  existingRouteId: routeId,
                                  dateKey: task.key,
                                  teamId: b.team_id,
                                  barangayName: b.name || task.title,
                                  scheduleId: b.schedule_id,
                                });
                                setStartLoadingKey(null);
                                if (resolved) navigate(`/garbagecollector/route/${resolved}`);
                                else alert('Missing route id for this barangay. Please refresh and try again.');
                              }}
                            >
                              {startLoadingKey === uniqueKey ? 'Loading…' : 'Start'}
                            </button>
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
                        <span className={`uppercase font-semibold text-xs sm:text-[11px] ${String(task.yourResponseStatus||'pending').toLowerCase()==='accepted'?'text-green-700':String(task.yourResponseStatus||'pending').toLowerCase()==='declined'?'text-red-600':'text-yellow-700'}`}>
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
                    <span className={`uppercase font-semibold text-xs sm:text-[11px] ${String(task.yourResponseStatus||'pending').toLowerCase()==='accepted'?'text-green-700':String(task.yourResponseStatus||'pending').toLowerCase()==='declined'?'text-red-600':'text-yellow-700'}`}>
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
