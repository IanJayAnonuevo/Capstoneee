import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
})

// Create custom truck icon
function createTruckIcon(rotation = 0) {
  return L.divIcon({
    className: 'custom-truck-icon',
    html: `
      <div style="
        transform: rotate(${rotation}deg);
        transform-origin: center;
        transition: transform 0.3s ease;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #059669;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-1.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zM17 12h-3V9h1.5l1.5 3z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

import { buildApiUrl } from '../../config/api';
const MAPBOX_TOKEN = (import.meta && import.meta.env && import.meta.env.VITE_MAPBOX_TOKEN) || null

export default function RouteRun(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [stops, setStops] = React.useState([])
  const [routeName, setRouteName] = React.useState('')
  const [currentPos, setCurrentPos] = React.useState(null)
  const [status, setStatus] = React.useState('requesting')
  const [follow, setFollow] = React.useState(true)
  const watchIdRef = React.useRef(null)
  const lastSentRef = React.useRef(0)
  const [routeLine, setRouteLine] = React.useState([])
  const [routeLoading, setRouteLoading] = React.useState(false)
  const [routeError, setRouteError] = React.useState(null)
  const [targetStop, setTargetStop] = React.useState(null)
  const [routeSummary, setRouteSummary] = React.useState(null)
  const [truckRotation, setTruckRotation] = React.useState(0) // truck rotation angle
  const [submitting, setSubmitting] = React.useState(false)
  const [routeMeta, setRouteMeta] = React.useState(null)

  const MIN_INTERVAL_MS = 5000

  const getCurrentUserId = React.useCallback(() => {
    try {
      const direct = localStorage.getItem('user_id') || sessionStorage.getItem('user_id')
      if (direct && Number(direct)) return Number(direct)
      const userJson = localStorage.getItem('user') || sessionStorage.getItem('user')
      if (userJson) {
        const parsed = JSON.parse(userJson)
        const value = parsed?.user_id ?? parsed?.id
        if (value && Number(value)) return Number(value)
      }
    } catch (_) {}
    return null
  }, [])

  const normalizeDateKey = React.useCallback((raw) => {
    if (!raw) {
      try {
        return new Date().toISOString().slice(0, 10)
      } catch (_) {
        return ''
      }
    }
    const str = String(raw)
    const match = str.match(/\d{4}-\d{2}-\d{2}/)
    if (match) return match[0]
    const parsed = new Date(str)
    if (!Number.isNaN(parsed.getTime())) {
      const year = parsed.getFullYear()
      const month = String(parsed.getMonth() + 1).padStart(2, '0')
      const day = String(parsed.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    return ''
  }, [])

  // Calculate bearing between two points
  function calculateBearing(from, to) {
    const lat1 = from.lat * Math.PI / 180
    const lat2 = to.lat * Math.PI / 180
    const deltaLng = (to.lng - from.lng) * Math.PI / 180
    
    const y = Math.sin(deltaLng) * Math.cos(lat2)
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng)
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI
    return (bearing + 360) % 360
  }

  // Update truck rotation based on destination
  React.useEffect(() => {
    if (!currentPos || !targetStop) return

    const dest = { lat: parseFloat(targetStop.lat), lng: parseFloat(targetStop.lng) }
    const bearing = calculateBearing(currentPos, dest)
    setTruckRotation(bearing)
  }, [currentPos, targetStop])

  async function postLocation(coords){
    // Try to include driver_id as fallback
    let driverId = null
    try {
      driverId = Number(localStorage.getItem('user_id') || sessionStorage.getItem('user_id')) || null
      if (!driverId) {
        const u = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null')
        driverId = Number(u?.user_id || u?.id)
      }
    } catch {}
  const url = driverId ? buildApiUrl(`post_gps.php?driver_id=${driverId}`) : buildApiUrl('post_gps.php')
    const payload = {
      lat: coords.latitude,
      lng: coords.longitude,
      speed: Number.isFinite(coords.speed) ? coords.speed : null,
      heading: Number.isFinite(coords.heading) ? coords.heading : null,
      accuracy: Number.isFinite(coords.accuracy) ? coords.accuracy : null,
    }
    try {
      await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify(payload) })
    } catch {}
  }

  function formatDistance(m){
    if (!Number.isFinite(m)) return '—'
    if (m >= 1000) return (m/1000).toFixed(1) + ' km'
    return Math.round(m) + ' m'
  }
  function formatDuration(s){
    if (!Number.isFinite(s)) return '—'
    const m = Math.round(s/60)
    if (m >= 60) return `${Math.floor(m/60)}h ${m%60}m`
    return `${m} min`
  }

  async function fetchSuggestedRoute(here, dest){
    // Prefer Mapbox if token is set; fallback to OSRM demo
    try {
      if (MAPBOX_TOKEN) {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${here.lng},${here.lat};${dest.lng},${dest.lat}?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`
        const r = await fetch(url)
        const j = await r.json()
        if (j?.routes?.length) {
          const route = j.routes[0]
          const coords = route.geometry?.coordinates || []
          const latlngs = coords.map(([lng, lat]) => [lat, lng])
          return { line: latlngs, summary: { distance: route.distance, duration: route.duration } }
        }
        throw new Error(j?.message || 'No Mapbox route')
      }
    } catch (e) {
      // fallthrough to OSRM
    }

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${here.lng},${here.lat};${dest.lng},${dest.lat}?overview=full&alternatives=false&steps=true&geometries=geojson&continue_straight=false&radiuses=1000;1000`
    const r = await fetch(osrmUrl)
    const j = await r.json()
    if (j?.code === 'Ok' && j?.routes?.length) {
      const route = j.routes[0]
      const coordsLine = route.geometry.coordinates || []
      const latlngs = coordsLine.map(([lng, lat]) => [lat, lng])
      return { line: latlngs, summary: { distance: route.distance, duration: route.duration } }
    }
    throw new Error(j?.message || j?.code || 'No OSRM route')
  }

  async function loadStops(routeId){
    try {
  const res = await fetch(buildApiUrl(`get_route_details.php?id=${routeId}`))
      const data = await res.json()
      if (data?.success) {
        const routeInfo = data.route || {}
        const ordered = (routeInfo.stops||[]).sort((a,b)=>(a.seq||0)-(b.seq||0))
        setRouteMeta(routeInfo)
        setStops(ordered)
        setRouteName(`${routeInfo.cluster_id || ''} ${routeInfo.barangay_name || ''}`.trim())
        return { stops: ordered, route: routeInfo }
      }
    } catch (e) {
      console.error('Failed to load route details:', e)
    }
    return null
  }

  const findNextRoute = React.useCallback(async (currentRouteId, metaOverride = null) => {
    try {
      const meta = metaOverride || routeMeta || {}
      let dateKey = normalizeDateKey(meta.date || meta.scheduled_date || meta.route_date || meta.created_at)
      if (!dateKey) {
        dateKey = normalizeDateKey(new Date())
      }
      const userId = getCurrentUserId()
  const url = new URL(buildApiUrl('get_routes.php'))
      if (dateKey) url.searchParams.set('date', dateKey)
      if (userId) {
        url.searchParams.set('role', 'driver')
        url.searchParams.set('user_id', String(userId))
      }
      const res = await fetch(url.toString())
      const data = await res.json()
      if (!data?.success) return null
      const routes = Array.isArray(data.routes) ? data.routes : []
      if (!routes.length) return null
      const sortKey = (route) => {
        const keyDate = normalizeDateKey(route.date || route.scheduled_date || dateKey)
        const time = route.start_time ? String(route.start_time).slice(0,5) : '99:99'
        return `${keyDate}T${time}`
      }
      const sorted = [...routes].sort((a,b) => sortKey(a).localeCompare(sortKey(b)))
      const normalizedCurrentId = Number(currentRouteId)
      const isIncomplete = (route) => {
        const status = String(route.status || '').toLowerCase()
        return !['completed','cancelled','done'].includes(status)
      }
      let candidate = null
      const currentIndex = sorted.findIndex(r => Number(r.id) === normalizedCurrentId)
      if (currentIndex >= 0) {
        for (let i = currentIndex + 1; i < sorted.length; i++) {
          if (isIncomplete(sorted[i])) { candidate = sorted[i]; break }
        }
      }
      if (!candidate) {
        candidate = sorted.find((route) => Number(route.id) !== normalizedCurrentId && isIncomplete(route)) || null
      }
      return candidate || null
    } catch (e) {
      console.error('Failed to determine next route', e)
      return null
    }
  }, [routeMeta, normalizeDateKey, getCurrentUserId])

  const activateNextRoute = React.useCallback(async (route, fallbackMeta = null) => {
    if (!route) return
    const routeIdNum = Number(route.id)
    if (!routeIdNum) return
    const userId = getCurrentUserId()
    try {
  await fetch(buildApiUrl('update_route_status.php'), {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ route_id: routeIdNum, status: 'in_progress', user_id: userId })
      })
    } catch (e) {
      console.error('Failed to set next route status', e)
    }
    const barangayName = route.barangay_name || route.name || fallbackMeta?.barangay_name || ''
    const teamId = route.team_id || fallbackMeta?.team_id || routeMeta?.team_id || null
    try {
  await fetch(buildApiUrl('set_route_active.php'), {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ route_id: routeIdNum, barangay: barangayName, team_id: teamId })
      })
    } catch (e) {
      console.error('Failed to set next route active', e)
    }
    try {
      const activeRouteData = {
        route_id: routeIdNum,
        barangay: barangayName,
        team_id: teamId,
        started_at: new Date().toISOString(),
        status: 'in_progress',
      }
      localStorage.setItem('active_route', JSON.stringify(activeRouteData))
      sessionStorage.setItem('active_route', JSON.stringify(activeRouteData))
    } catch (_) {}
  }, [getCurrentUserId, routeMeta])

  React.useEffect(() => {
    // initial load and periodic refresh so driver sees collector updates
    loadStops(id)
    const interval = setInterval(() => { loadStops(id) }, 20000)
    return () => clearInterval(interval)
  }, [id])

  React.useEffect(() => {
    if (!('geolocation' in navigator)) { setStatus('denied'); return }
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        setStatus('tracking')
        const now = Date.now()
        const coords = pos.coords
        const here = { lat: coords.latitude, lng: coords.longitude }
        setCurrentPos(here)
        if (now - lastSentRef.current >= MIN_INTERVAL_MS) {
          lastSentRef.current = now
          await postLocation(coords)
        }
        // Fetch suggested road route polyline + steps to the target stop (OSRM demo server)
        try {
          setRouteError(null)
          const dest = (targetStop && targetStop.lat != null && targetStop.lng != null)
            ? { lat: parseFloat(targetStop.lat), lng: parseFloat(targetStop.lng) }
            : null
          if (dest) {
            setRouteLoading(true)
            const res = await fetchSuggestedRoute(here, dest)
            setRouteLine(res.line)
            setRouteSummary(res.summary)
          }
        } catch (e) {
          setRouteError('routing failed')
          setRouteSummary(null)
        } finally {
          setRouteLoading(false)
        }
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    )
    return () => { if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current) }
  }, [])

  const positions = stops.filter(s => s.lat!=null && s.lng!=null).map(s => [parseFloat(s.lat), parseFloat(s.lng)])
  const startCenter = positions[0] || [13.7766, 122.9826]

  function FollowController({ position, enabled }){
    const map = useMap()
    React.useEffect(() => {
      if (!enabled || !position) return
      map.setView([position.lat, position.lng], Math.max(map.getZoom(), 15), { animate: true })
    }, [enabled, position, map])
    return null
  }

  const stopTracking = React.useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  // Choose target stop: next unvisited (fallback first)
  React.useEffect(() => {
    if (!stops || stops.length === 0) { setTargetStop(null); return }
    const next = stops.find(s => (s.status || 'pending') !== 'visited') || stops[0]
    if (next && next.lat != null && next.lng != null) setTargetStop(next)
    else setTargetStop(null)
  }, [stops])

  // Recompute suggested route whenever target or current position changes
  React.useEffect(() => {
    (async () => {
      if (!currentPos || !targetStop || targetStop.lat == null || targetStop.lng == null) return
      try {
        setRouteLoading(true)
        setRouteError(null)
        const dest = { lat: parseFloat(targetStop.lat), lng: parseFloat(targetStop.lng) }
        const res = await fetchSuggestedRoute(currentPos, dest)
        setRouteLine(res.line)
        setRouteSummary(res.summary)
      } catch (e) {
        setRouteError('routing failed')
        setRouteLine([])
        setRouteSummary(null)
      } finally {
        setRouteLoading(false)
      }
    })()
  }, [targetStop, currentPos])

  const totalStops = stops.length
  const visitedCount = React.useMemo(() => stops.filter(s => (s.status || 'pending') === 'visited').length, [stops])
  const progressPercent = totalStops ? Math.round((visitedCount / totalStops) * 100) : 0
  const allVisited = totalStops > 0 && visitedCount === totalStops
  const nextStop = React.useMemo(() => stops.find(s => (s.status || 'pending') !== 'visited') || null, [stops])

  async function handleCompleteRoute(){
    if (submitting) return
    try {
      const latest = await loadStops(id)
      const snapshot = latest?.stops?.length ? latest.stops : stops
      const nextMeta = latest?.route || routeMeta
      const total = snapshot.length
      const visited = snapshot.filter(s => (s.status || 'pending') === 'visited').length
      if (!total || visited < total) {
        alert('Collectors still have pending stops. Please wait until all stops are visited before submitting.')
        return
      }

      setSubmitting(true)
      try {
        const userId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id') || null
  await fetch(buildApiUrl('update_route_status.php'), {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ route_id: Number(id), status: 'completed', truck_full: false, note: null, user_id: userId })
        })

  await fetch(buildApiUrl('log_task_event.php'), {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignment_id: null, event_type: 'route_submitted', after: { route_id: id, total_stops: total, visited } })
        }).catch(()=>{})

  await fetch(buildApiUrl('clear_route_active.php'), {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ route_id: Number(id) })
        }).catch(()=>{})

        stopTracking()
        const nextRoute = await findNextRoute(Number(id), nextMeta)
        if (nextRoute && Number(nextRoute.id) !== Number(id)) {
          await activateNextRoute(nextRoute, nextMeta)
          const nextName = nextRoute.barangay_name || nextRoute.name || 'Next Route'
          alert(`Route completed. Proceeding to ${nextName}.`)
          navigate(`/truckdriver/route/${nextRoute.id}`, { replace: true })
        } else {
          alert('Route completed. No remaining routes for today.')
          navigate('/truckdriver/routes', { replace: true })
        }
      } finally {
        setSubmitting(false)
      }
    } catch (e) {
      console.error('Failed to complete route', e)
      alert('Failed to complete route. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0">
      <style>{`
        .custom-truck-icon {
          background: transparent !important;
          border: none !important;
        }
        .custom-truck-icon div {
          pointer-events: none;
        }
      `}</style>
      <MapContainer center={startCenter} zoom={15} className="h-full w-full" style={{ zIndex: 0 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
        {positions.length>0 && (
          <Polyline positions={positions} color="#059669" weight={5} opacity={0.9} />
        )}
        {stops.map((s,i)=> (
          <Marker key={i} position={[parseFloat(s.lat), parseFloat(s.lng)]}>
            <Popup>
              <div className="text-sm">
                <div className="font-medium">{s.name || `Stop ${s.seq}`}</div>
                <div className="text-gray-600">Seq: {s.seq}</div>
              </div>
            </Popup>
          </Marker>
        ))}
        {currentPos && (
          <Marker 
            position={[currentPos.lat, currentPos.lng]}
            icon={createTruckIcon(truckRotation)}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-medium">🚛 Truck Location</div>
                <div className="text-gray-600">Heading: {Math.round(truckRotation)}°</div>
                <div className="text-gray-600">{currentPos.lat.toFixed(6)}, {currentPos.lng.toFixed(6)}</div>
              </div>
            </Popup>
          </Marker>
        )}
        {routeLine.length > 1 ? (
          <>
            {/* Emerald green route line */}
            <Polyline positions={routeLine} color="#059669" weight={10} opacity={0.92} />
          </>
        ) : (
          currentPos && stops.length > 0 && stops[0].lat != null && stops[0].lng != null && (
            <Polyline
              positions={[[currentPos.lat, currentPos.lng], [parseFloat(stops[0].lat), parseFloat(stops[0].lng)]]}
              color="#059669"
              weight={6}
              opacity={0.95}
              dashArray="6,8"
            />
          )
        )}
        <FollowController position={currentPos} enabled={follow} />
      </MapContainer>

      {/* Overlay panel for route status */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-50 w-[min(680px,92vw)] bg-white/20 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-base truncate flex items-center gap-2">
            <span>{routeName || 'Route'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
              onClick={() => setTargetStop(stops.find(s => (s.status || 'pending') !== 'visited') || stops[0])}
            >Re-route</button>
            <button
              className={`px-2 py-1 text-xs rounded ${follow ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setFollow(v => !v)}
            >
              {follow ? 'Following' : 'Follow'}
            </button>
            <button className="px-2 py-1 text-xs bg-gray-200 rounded" onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
        <div className="text-[11px] text-gray-700 mb-2">
          {status === 'requesting' && 'Requesting location…'}
          {status === 'tracking' && currentPos && `You: ${currentPos.lat.toFixed(6)}, ${currentPos.lng.toFixed(6)}`}
          {status === 'denied' && 'Location permission denied'}
          {routeLoading && ' • Routing…'}
          {routeError && ` • Route error: ${routeError}`}
        </div>
        {routeSummary && (
          <div className="text-xs text-gray-800 mb-2">{formatDistance(routeSummary.distance)} • {formatDuration(routeSummary.duration)}</div>
        )}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-700 mb-1">
            <span>Progress</span>
            <span>{visitedCount}/{totalStops} stops</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="p-3 bg-white/60 rounded-lg border border-white/30 shadow-inner">
            <div className="font-medium text-gray-800">Next stop</div>
            {nextStop ? (
              <div className="text-xs text-gray-600">
                Seq {nextStop.seq || '—'} • {nextStop.name || `Stop ${nextStop.seq || ''}`}
              </div>
            ) : (
              <div className="text-xs text-gray-600">All stops have been marked as visited by the collectors.</div>
            )}
          </div>
          <div className="p-3 bg-white/50 rounded-lg border border-white/20 text-xs text-gray-600 leading-relaxed">
            Collectors handle stop completion. This screen refreshes automatically as they record each pickup.
          </div>
        </div>

        <div className="mt-4">
          <button
            className={`w-full px-4 py-2 rounded text-sm font-medium transition-colors ${allVisited ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-200'}`}
            onClick={handleCompleteRoute}
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : allVisited ? 'Submit & mark route completed' : 'Waiting for collectors'}
          </button>
        </div>
        <div className="mt-2 text-[11px] text-gray-600 text-center">
          {allVisited ? 'Ready to wrap up the route.' : 'Button becomes green once every stop is visited.'}
        </div>
      </div>

    </div>
  )
}

