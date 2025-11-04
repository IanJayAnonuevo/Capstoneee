import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiMap } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStatus } from '../../contexts/StatusContext';

const API_BASE_URL = 'https://kolektrash.systemproj.com/backend/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

export default function TruckDriverRoutes() {
  const navigate = useNavigate();
  const { autoUpdateStatus } = useStatus();
  const [routesByDate, setRoutesByDate] = useState({});
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [filterTab, setFilterTab] = useState('today');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stopsByRoute, setStopsByRoute] = useState({});
  const [tracking, setTracking] = useState(false);
  const [permission, setPermission] = useState('idle'); // idle | requesting | granted | denied
  const [lastSentAt, setLastSentAt] = useState(null);
  const [currentPos, setCurrentPos] = useState(null);
  const [activeRouteId, setActiveRouteId] = useState(null);
  const watchIdRef = React.useRef(null);
  const lastSentRef = React.useRef(0);
  const lastCoordsRef = React.useRef(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapRoute, setMapRoute] = useState(null);
  const [mapStops, setMapStops] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);

  const MIN_INTERVAL_MS = 5000; // 5s
  const MIN_DISTANCE_M = 20; // 20 meters

  const computeDateKey = useCallback((offset = 0) => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    base.setDate(base.getDate() + offset);
    const year = base.getFullYear();
    const month = String(base.getMonth() + 1).padStart(2, '0');
    const day = String(base.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const todayKey = computeDateKey(0);
  const yesterdayKey = computeDateKey(-1);
  const selectedDateKey = filterTab === 'yesterday' ? yesterdayKey : todayKey;

  const selectedDateLabel = useMemo(() => {
    try {
      const [year, month, day] = selectedDateKey.split('-').map(Number);
      const dateObj = new Date(year, (month || 1) - 1, day || 1, 0, 0, 0, 0);
      return dateObj.toLocaleDateString(undefined, { month: 'long', day: '2-digit', year: 'numeric' });
    } catch (e) {
      return selectedDateKey;
    }
  }, [selectedDateKey]);

  // Get current user ID
  const getCurrentUserId = useCallback(() => {
    try {
      const direct = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
      if (direct && Number(direct)) return Number(direct);
      const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userJson) {
        const u = JSON.parse(userJson);
        return Number(u?.user_id || u?.id);
      }
    } catch {}
    return null;
  }, []);

  const formatPrettyDate = useCallback((dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, { month: 'long', day: '2-digit', year: 'numeric' });
    } catch (_) {
      return dateStr;
    }
  }, []);

  function haversineMeters(a, b){
    if (!a || !b) return Infinity;
    const R = 6371000; // meters
    const toRad = (d) => d * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const s = Math.sin(dLat/2)**2 + Math.sin(dLon/2)**2 * Math.cos(lat1) * Math.cos(lat2);
    return 2 * R * Math.asin(Math.sqrt(s));
  }

  async function postLocation(coords){
    // Try to resolve driver id from storage as a fallback when session is not available
    const getDriverId = () => {
      try {
        const direct = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
        if (direct && Number(direct)) return Number(direct);
        const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userJson) {
          const u = JSON.parse(userJson);
          return Number(u?.user_id || u?.id);
        }
      } catch {}
      return null;
    };
    const driverId = getDriverId();
    const url = driverId ? `${API_BASE_URL}/post_gps.php?driver_id=${driverId}` : `${API_BASE_URL}/post_gps.php`;
    const payload = {
      lat: coords.latitude,
      lng: coords.longitude,
      speed: Number.isFinite(coords.speed) ? coords.speed : null,
      heading: Number.isFinite(coords.heading) ? coords.heading : null,
      accuracy: Number.isFinite(coords.accuracy) ? coords.accuracy : null,
    };
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      await res.json().catch(()=>({}));
      setLastSentAt(new Date());
    } catch (e) {
      // ignore transient network errors
    }
  }

  function startTracking(routeId){
    if (!('geolocation' in navigator)) { setPermission('denied'); return; }
    setPermission('requesting');
    setActiveRouteId(routeId);
    
    // Auto-update status to "On Duty" when starting a route
    const userId = getCurrentUserId();
    if (userId) {
      autoUpdateStatus('route_start', userId);
    }
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        setPermission('granted');
        const now = Date.now();
        const coords = pos.coords;
        const here = { lat: coords.latitude, lng: coords.longitude };
        setCurrentPos(here);
        const last = lastCoordsRef.current;
        const moved = haversineMeters(last && { lat:last.lat, lng:last.lng }, here);
        const shouldSend = (now - lastSentRef.current) >= MIN_INTERVAL_MS || moved >= MIN_DISTANCE_M;
        if (shouldSend) {
          lastSentRef.current = now;
          lastCoordsRef.current = here;
          await postLocation(coords);
        }
      },
      () => { setPermission('denied'); },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
    setTracking(true);
  }

  function stopTracking(){
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    // Auto-update status to "Off Duty" when stopping a route
    const userId = getCurrentUserId();
    if (userId) {
      autoUpdateStatus('route_complete', userId);
    }
    
    setTracking(false);
    setActiveRouteId(null);
  }

  const fetchRoutesForDate = useCallback(async (dateKey) => {
    const userId = getCurrentUserId();
    const url = new URL(`${API_BASE_URL}/get_routes.php`);
    url.searchParams.set('date', dateKey);
    if (userId) {
      url.searchParams.set('role', 'driver');
      url.searchParams.set('user_id', String(userId));
    }
    const res = await fetch(url.toString());
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to load routes');
    }
    return data.routes || [];
  }, [getCurrentUserId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const dateKeys = [todayKey, yesterdayKey];
    (async () => {
      const results = await Promise.allSettled(dateKeys.map(fetchRoutesForDate));
      if (!active) return;
      const next = {};
      const errors = [];
      results.forEach((result, idx) => {
        const key = dateKeys[idx];
        if (result.status === 'fulfilled') {
          next[key] = result.value;
        } else {
          errors.push(result.reason?.message || `Failed to load routes for ${key}`);
        }
      });
      setRoutesByDate((prev) => ({ ...prev, ...next }));
      setError(errors.length ? errors.join(' | ') : '');
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchRoutesForDate, todayKey, yesterdayKey]);

  useEffect(() => {
    if (routesByDate[selectedDateKey] || loading) return;
    let active = true;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const routes = await fetchRoutesForDate(selectedDateKey);
        if (!active) return;
        setRoutesByDate((prev) => ({ ...prev, [selectedDateKey]: routes }));
        setError('');
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load routes');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [selectedDateKey, routesByDate, loading, fetchRoutesForDate]);

  useEffect(() => {
    setSelectedRoute(null);
  }, [selectedDateKey]);

  const loadStops = useCallback(async (routeId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/get_route_details.php?id=${routeId}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to load details');
      const sorted = (data.route.stops || []).sort((a,b) => (a.seq||0)-(b.seq||0));
      setStopsByRoute((m) => ({ ...m, [routeId]: sorted }));
      return sorted;
    } catch (e) {
      // ignore
      return [];
    }
  }, []);

  const displayRoutes = useMemo(() => {
    const source = routesByDate[selectedDateKey] || [];
    return source
      .map((r) => {
        const start = r.start_time ? String(r.start_time).slice(0, 5) : '';
        const end = r.end_time ? String(r.end_time).slice(0, 5) : '';
        const timeRange = start && end ? `${start}-${end}` : start || end || '';
        const dateLabel = r.date || selectedDateKey;
        return {
          id: r.id,
          name: `${r.cluster_id || ''} ${r.barangay_name || ''}`.trim() || 'Route',
          description: [dateLabel, timeRange].filter(Boolean).join(' '),
          schedule: dateLabel,
          formattedDate: formatPrettyDate(dateLabel),
          displayTime: timeRange || '—',
          startTime: start,
          endTime: end,
          estimatedDuration: '',
          status: r.status,
          type: 'Daily Route',
          coverage: '',
          team_id: r.team_id,
          plate_num: r.plate_num,
          stopsCount: Number(r.total_stops || 0),
          completedStops: Number(r.completed_stops || 0),
        };
      })
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [routesByDate, selectedDateKey, formatPrettyDate]);

  // Get status color
  const getStatusColor = (status) => {
    const value = String(status || '').toLowerCase();
    switch (value) {
      case 'in_progress':
      case 'in-progress':
      case 'active':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'scheduled':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleOpenMap = useCallback(async (route) => {
    if (!route) return;
    setSelectedRoute(route.id);
    setMapOpen(true);
    setMapRoute(route);
    const cached = stopsByRoute[route.id];
    if (cached && cached.length) {
      setMapStops(cached);
      setMapLoading(false);
      return;
    }
    setMapLoading(true);
    const fetched = await loadStops(route.id);
    setMapStops(fetched || []);
    setMapLoading(false);
  }, [stopsByRoute, loadStops]);

  const closeMap = useCallback(() => {
    setMapOpen(false);
    setMapRoute(null);
    setMapStops([]);
    setMapLoading(false);
  }, []);

  const mapPositions = useMemo(() => {
    return (mapStops || [])
      .filter((s) => s.lat != null && s.lng != null)
      .map((s) => [parseFloat(s.lat), parseFloat(s.lng)]);
  }, [mapStops]);

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">My Routes</h1>
        <div className="flex items-center gap-2">
          {['today', 'yesterday'].map((tab) => (
            <button
              key={tab}
              className={`px-3 py-2 text-sm font-semibold rounded border transition-colors ${filterTab === tab ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-700 border-green-200 hover:bg-green-50'}`}
              onClick={() => setFilterTab(tab)}
            >
              {tab === 'today' ? 'Today' : 'Yesterday'}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4 text-sm text-gray-600">
        Showing routes for <span className="font-semibold text-gray-900">{selectedDateLabel}</span>
      </div>
      <div className="space-y-4">
        {loading && (
          <div className="text-gray-500">Loading…</div>
        )}
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        {!loading && !error && displayRoutes.length === 0 && (
          <div className="text-gray-500">No routes scheduled for this day.</div>
        )}
        {displayRoutes.map((route) => (
          <div
            key={route.id}
            className={`bg-green-50 rounded-xl shadow border border-green-100 px-5 py-4 transition-shadow cursor-pointer hover:shadow-lg ${
              selectedRoute === route.id ? 'ring-2 ring-emerald-400' : ''
            }`}
            onClick={() => handleOpenMap(route)}
          >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Barangay</div>
                  <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-emerald-700">
                    <FiMap className="w-4 h-4" />
                    <span>Tap to preview map</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(route.status)}`}>
                  {String(route.status || '').replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">{route.formattedDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Time</span>
                  <span className="font-medium">{route.displayTime}</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">Click anywhere on the card to preview the route map.</div>
          </div>
        ))}
      </div>

      {mapOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 py-8">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 p-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{mapRoute?.name || 'Route Map'}</h2>
                <p className="text-sm text-gray-600">
                  {mapRoute?.formattedDate || mapRoute?.schedule}{mapRoute?.displayTime ? ` • ${mapRoute.displayTime}` : ''}
                </p>
              </div>
              <button
                className="rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-gray-100"
                onClick={closeMap}
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <div className="h-[360px]">
              {mapLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading route map…</div>
              ) : mapPositions.length ? (
                <MapContainer
                  center={mapPositions[0] || [13.7565, 121.0583]}
                  zoom={15}
                  className="h-full w-full"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                  <Polyline positions={mapPositions} color="#059669" weight={6} opacity={0.85} />
                  {mapStops.map((stop) => (
                    stop.lat != null && stop.lng != null ? (
                      <Marker key={stop.id} position={[parseFloat(stop.lat), parseFloat(stop.lng)]}>
                        <Popup>
                          <div className="text-sm">
                            <div className="font-semibold">{stop.name || `Stop ${stop.seq}`}</div>
                            <div className="text-gray-600 text-xs">Seq: {stop.seq || '-'}</div>
                          </div>
                        </Popup>
                      </Marker>
                    ) : null
                  ))}
                </MapContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">No stop data available for this route.</div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex justify-end">
              <button
                className="px-4 py-2 text-sm font-medium text-green-700 hover:text-green-800"
                onClick={closeMap}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
