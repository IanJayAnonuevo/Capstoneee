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

const EMERGENCY_TYPES = [
  { value: 'breakdown', label: 'Breakdown' },
  { value: 'flat_tire', label: 'Flat Tire' },
  { value: 'accident', label: 'Accident' },
  { value: 'medical', label: 'Medical' },
  { value: 'weather', label: 'Weather' },
  { value: 'other', label: 'Other' },
]

const EMERGENCY_IMPACTS = [
  { value: 'delay', label: 'Delay', caption: 'Collection resumes after the issue is fixed' },
  { value: 'cancel', label: 'Cancel', caption: 'Collection is cancelled for today' },
]

const createEmergencyFormState = () => ({
  type: 'breakdown',
  impact: 'delay',
  notes: '',
  file: null,
})

export default function RouteRun() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [stops, setStops] = React.useState([])
  const [routeName, setRouteName] = React.useState('')

  const authHeaders = () => {
    try {
      const t = localStorage.getItem('access_token');
      return t ? { Authorization: `Bearer ${t}` } : {};
    } catch { return {}; }
  };
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
  const [truckFull, setTruckFull] = React.useState(false) // Flag for truck full status
  const [isAtMantila, setIsAtMantila] = React.useState(false) // Check if near Mantila
  const [originalTargetStop, setOriginalTargetStop] = React.useState(null) // Store original target before reroute
  const [emergencyState, setEmergencyState] = React.useState(null)
  const [showEmergencyForm, setShowEmergencyForm] = React.useState(false)
  const [emergencyForm, setEmergencyForm] = React.useState(() => createEmergencyFormState())
  const [emergencySubmitting, setEmergencySubmitting] = React.useState(false)
  const [emergencyError, setEmergencyError] = React.useState(null)
  const emergencyFileInputRef = React.useRef(null)

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
    } catch (_) { }
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

  async function postLocation(coords) {
    // Try to include driver_id as fallback
    let driverId = null
    try {
      driverId = Number(localStorage.getItem('user_id') || sessionStorage.getItem('user_id')) || null
      if (!driverId) {
        const u = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null')
        driverId = Number(u?.user_id || u?.id)
      }
    } catch { }
    const url = driverId ? buildApiUrl(`post_gps.php?driver_id=${driverId}`) : buildApiUrl('post_gps.php')
    const payload = {
      lat: coords.latitude,
      lng: coords.longitude,
      speed: Number.isFinite(coords.speed) ? coords.speed : null,
      heading: Number.isFinite(coords.heading) ? coords.heading : null,
      accuracy: Number.isFinite(coords.accuracy) ? coords.accuracy : null,
    }
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(payload)
      })
    } catch { }
  }

  function formatDistance(m) {
    if (!Number.isFinite(m)) return '—'
    if (m >= 1000) return (m / 1000).toFixed(1) + ' km'
    return Math.round(m) + ' m'
  }
  function formatDuration(s) {
    if (!Number.isFinite(s)) return '—'
    const m = Math.round(s / 60)
    if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`
    return `${m} min`
  }

  function formatTimestamp(value) {
    if (!value) return ''
    const ts = new Date(value)
    if (Number.isNaN(ts.getTime())) return value
    return ts.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  async function fetchSuggestedRoute(here, dest) {
    // Validate coordinates
    if (!here || !dest ||
      !Number.isFinite(here.lat) || !Number.isFinite(here.lng) ||
      !Number.isFinite(dest.lat) || !Number.isFinite(dest.lng) ||
      here.lat < -90 || here.lat > 90 || here.lng < -180 || here.lng > 180 ||
      dest.lat < -90 || dest.lat > 90 || dest.lng < -180 || dest.lng > 180) {
      console.warn('Invalid coordinates for routing:', { here, dest })
      throw new Error('Invalid coordinates')
    }

    // Prefer Mapbox if token is set; fallback to OSRM demo
    try {
      if (MAPBOX_TOKEN) {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${here.lng},${here.lat};${dest.lng},${dest.lat}?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`
        const r = await fetch(url)
        if (!r.ok) {
          throw new Error(`Mapbox HTTP ${r.status}`)
        }
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
      console.warn('Mapbox routing failed, trying OSRM:', e)
      // fallthrough to OSRM
    }

    // Try OSRM with better error handling
    try {
      // Use a more reliable OSRM endpoint or fallback
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${here.lng},${here.lat};${dest.lng},${dest.lat}?overview=full&alternatives=false&steps=true&geometries=geojson&continue_straight=false`

      const r = await fetch(osrmUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!r.ok) {
        const errorText = await r.text().catch(() => 'Unknown error')
        console.error('OSRM HTTP error:', r.status, errorText)
        throw new Error(`OSRM routing failed: HTTP ${r.status}`)
      }

      const j = await r.json()

      if (j?.code === 'Ok' && j?.routes?.length) {
        const route = j.routes[0]
        const coordsLine = route.geometry?.coordinates || []
        if (coordsLine.length === 0) {
          throw new Error('OSRM returned empty route')
        }
        const latlngs = coordsLine.map(([lng, lat]) => [lat, lng])
        return { line: latlngs, summary: { distance: route.distance, duration: route.duration } }
      }

      // If OSRM fails, return a straight line as fallback
      console.warn('OSRM routing failed, using straight line fallback:', j?.code || j?.message)
      const fallbackLine = [[here.lat, here.lng], [dest.lat, dest.lng]]
      // Calculate approximate distance (Haversine)
      const R = 6371000 // Earth radius in meters
      const dLat = (dest.lat - here.lat) * Math.PI / 180
      const dLng = (dest.lng - here.lng) * Math.PI / 180
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(here.lat * Math.PI / 180) * Math.cos(dest.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c
      // Estimate duration (assuming 30 km/h average speed)
      const duration = (distance / 8.33) // 8.33 m/s = 30 km/h

      return {
        line: fallbackLine,
        summary: { distance, duration },
        isFallback: true
      }
    } catch (e) {
      console.error('OSRM routing error:', e)
      // Final fallback: straight line
      const fallbackLine = [[here.lat, here.lng], [dest.lat, dest.lng]]
      const R = 6371000
      const dLat = (dest.lat - here.lat) * Math.PI / 180
      const dLng = (dest.lng - here.lng) * Math.PI / 180
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(here.lat * Math.PI / 180) * Math.cos(dest.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c
      const duration = (distance / 8.33)

      return {
        line: fallbackLine,
        summary: { distance, duration },
        isFallback: true
      }
    }
  }

  async function loadStops(routeId) {
    try {
      const res = await fetch(buildApiUrl(`get_route_details.php?route_id=${routeId}`), { headers: { ...authHeaders() } })
      const data = await res.json()
      if (data?.success) {
        const routeInfo = data.route || {}
        const ordered = (routeInfo.stops || []).sort((a, b) => (a.seq || 0) - (b.seq || 0))
        setRouteMeta(routeInfo)
        setStops(ordered)
        setRouteName(`${routeInfo.cluster_id || ''} ${routeInfo.barangay_name || ''}`.trim())

        // Check for truck_full flag & emergency details in notes
        let truckFullFlag = false
        let emergencyDetails = null
        if (routeInfo.notes) {
          try {
            const notesData = JSON.parse(routeInfo.notes)
            truckFullFlag = notesData.truck_full === true
            if (notesData.emergency && notesData.emergency.active) {
              emergencyDetails = notesData.emergency
            }
          } catch (e) {
            // Notes is not JSON, ignore
          }
        }
        setTruckFull(truckFullFlag)
        setEmergencyState(emergencyDetails)

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
      const res = await fetch(url.toString(), { headers: { ...authHeaders() } })
      const data = await res.json()
      if (!data?.success) {
        console.warn('get_routes.php returned unsuccessful:', data)
        return null
      }
      const routes = Array.isArray(data.routes) ? data.routes : []
      if (!routes.length) {
        console.log('No routes found for date:', dateKey, 'userId:', userId)
        return null
      }
      console.log(`[findNextRoute] Found ${routes.length} routes for date ${dateKey}:`, routes.map(r => ({
        id: r.id,
        name: r.barangay_name || r.name,
        status: r.status,
        start_time: r.start_time
      })))

      const sortKey = (route) => {
        const keyDate = normalizeDateKey(route.date || route.scheduled_date || dateKey)
        const time = route.start_time ? String(route.start_time).slice(0, 5) : '99:99'
        return `${keyDate}T${time}`
      }
      const sorted = [...routes].sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
      const normalizedCurrentId = Number(currentRouteId)

      // Explicit status check - we want routes that are available to work on
      const isAvailable = (route) => {
        const status = String(route.status || '').toLowerCase().trim()
        // Accept: scheduled, in_progress, or any status that's not completed/cancelled/missed
        const availableStatuses = ['scheduled', 'in_progress', 'in-progress', 'pending', 'active']
        const unavailableStatuses = ['completed', 'cancelled', 'missed', 'done', 'finished']

        // If status is explicitly in available list, return true
        if (availableStatuses.includes(status)) return true
        // If status is explicitly unavailable, return false
        if (unavailableStatuses.includes(status)) return false
        // If status is empty/null, treat as available (might be scheduled)
        if (!status || status === 'null' || status === 'undefined') return true
        // Default: if we don't recognize it, assume it's available (safer)
        return true
      }

      const availableRoutes = sorted.filter(isAvailable)
      console.log(`[findNextRoute] Available routes (${availableRoutes.length}/${sorted.length}):`, availableRoutes.map(r => ({
        id: r.id,
        name: r.barangay_name || r.name,
        status: r.status || '(null)'
      })))

      let candidate = null
      const currentIndex = sorted.findIndex(r => Number(r.id) === normalizedCurrentId)
      console.log(`[findNextRoute] Current route index: ${currentIndex}, Current ID: ${normalizedCurrentId}`)

      if (currentIndex >= 0) {
        // Look for next available route after current one
        for (let i = currentIndex + 1; i < sorted.length; i++) {
          if (isAvailable(sorted[i])) {
            candidate = sorted[i];
            console.log(`[findNextRoute] Found next route after current (index ${i}):`, candidate.id, candidate.barangay_name || candidate.name, 'status:', candidate.status)
            break
          }
        }
      }
      // If no candidate found after current, look for any available route (including before current)
      if (!candidate) {
        candidate = sorted.find((route) => Number(route.id) !== normalizedCurrentId && isAvailable(route)) || null
        if (candidate) {
          console.log(`[findNextRoute] Found available route (not after current):`, candidate.id, candidate.barangay_name || candidate.name, 'status:', candidate.status)
        }
      }

      if (candidate) {
        console.log('[findNextRoute] ✅ Selected next route:', {
          id: candidate.id,
          name: candidate.barangay_name || candidate.name,
          status: candidate.status,
          start_time: candidate.start_time
        })
      } else {
        console.warn('[findNextRoute] ❌ No next route found.', {
          currentRouteId: normalizedCurrentId,
          totalRoutes: sorted.length,
          availableCount: availableRoutes.length,
          allStatuses: sorted.map(r => ({ id: r.id, name: r.barangay_name || r.name, status: r.status || '(null)' }))
        })
      }
      return candidate || null
    } catch (e) {
      console.error('Failed to determine next route', e)
      return null
    }
  }, [routeMeta, normalizeDateKey, getCurrentUserId, authHeaders])

  const activateNextRoute = React.useCallback(async (route, fallbackMeta = null) => {
    if (!route) return
    const routeIdNum = Number(route.id)
    if (!routeIdNum) return
    const userId = getCurrentUserId()
    try {
      await fetch(buildApiUrl('update_route_status.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify({ route_id: routeIdNum, status: 'in_progress', user_id: userId })
      })
    } catch (e) {
      console.error('Failed to set next route status', e)
    }
    const barangayName = route.barangay_name || route.name || fallbackMeta?.barangay_name || ''
    const teamId = route.team_id || fallbackMeta?.team_id || routeMeta?.team_id || null
    try {
      await fetch(buildApiUrl('set_route_active.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
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
    } catch (_) { }
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
        // Note: This is handled by the separate useEffect that watches targetStop and currentPos
        // So we don't need to fetch here to avoid duplicate requests
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    )
    return () => { if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current) }
  }, [])

  const positions = stops.filter(s => s.lat != null && s.lng != null).map(s => [parseFloat(s.lat), parseFloat(s.lng)])
  const startCenter = positions[0] || [13.7766, 122.9826]

  function FollowController({ position, enabled }) {
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
  // If truck_full is true, temporarily route to Mantila instead
  React.useEffect(() => {
    if (truckFull) {
      // Store original target if not already stored
      if (!originalTargetStop) {
        const next = stops.find(s => (s.status || 'pending') !== 'visited') || stops[0]
        if (next && next.lat != null && next.lng != null) {
          setOriginalTargetStop(next)
        }
      }
      // Set Mantila as temporary destination (not a stop, just coordinates)
      // Using actual Mantila coordinates from database
      const mantilaTarget = {
        lat: 13.7817000,
        lng: 123.0203000,
        name: 'Mantila - Disposal Site',
        isTemporary: true
      }
      setTargetStop(mantilaTarget)
    } else {
      // Normal flow: find next unvisited stop
      if (!stops || stops.length === 0) {
        setTargetStop(null)
        setOriginalTargetStop(null)
        return
      }
      const next = stops.find(s => (s.status || 'pending') !== 'visited') || stops[0]
      if (next && next.lat != null && next.lng != null) {
        setTargetStop(next)
        setOriginalTargetStop(null)
      } else {
        setTargetStop(null)
        setOriginalTargetStop(null)
      }
    }
  }, [stops, truckFull, originalTargetStop])

  // Check if truck is near Mantila (within ~500 meters)
  React.useEffect(() => {
    if (truckFull && currentPos) {
      const mantilaLat = 13.7817000
      const mantilaLng = 123.0203000
      const distance = Math.sqrt(
        Math.pow(currentPos.lat - mantilaLat, 2) +
        Math.pow(currentPos.lng - mantilaLng, 2)
      ) * 111000 // Convert to meters (rough approximation)
      setIsAtMantila(distance < 500) // Within 500 meters
    } else {
      setIsAtMantila(false)
    }
  }, [truckFull, currentPos])

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
  const emergencyActive = Boolean(emergencyState?.active)
  const emergencyImpactLabel = React.useMemo(() => {
    if (!emergencyState?.impact) return null
    return EMERGENCY_IMPACTS.find(opt => opt.value === emergencyState.impact)?.label || emergencyState.impact
  }, [emergencyState])
  const emergencyAttachmentUrl = React.useMemo(() => {
    if (!emergencyState?.attachment) return null
    return buildApiUrl(`../${emergencyState.attachment}`)
  }, [emergencyState])

  // Handler to continue collection after disposal at Mantila
  const handleContinueCollection = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      // Clear truck_full flag in route notes
      const currentNotes = routeMeta?.notes || null
      let notesData = {}
      if (currentNotes) {
        try {
          notesData = JSON.parse(currentNotes)
        } catch (e) {
          // Notes is not JSON, ignore
        }
      }
      notesData.truck_full = false
      notesData.truck_full_cleared_at = new Date().toISOString()

      await fetch(buildApiUrl('update_route_status.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify({
          route_id: Number(id),
          note: JSON.stringify(notesData)
        })
      })

      // Reload route to get updated status
      await loadStops(id)
      setTruckFull(false)
      setIsAtMantila(false)
      alert('Collection resumed. Returning to original route.')
    } catch (e) {
      console.error('Failed to continue collection:', e)
      alert('Failed to continue collection. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const updateEmergencyForm = React.useCallback((field, value) => {
    setEmergencyForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const resetEmergencyForm = React.useCallback(() => {
    setEmergencyForm(createEmergencyFormState())
    setEmergencyError(null)
    if (emergencyFileInputRef.current) {
      emergencyFileInputRef.current.value = ''
    }
  }, [])

  const closeEmergencyForm = React.useCallback(() => {
    setShowEmergencyForm(false)
    resetEmergencyForm()
  }, [resetEmergencyForm])

  const handleEmergencyFileChange = React.useCallback((event) => {
    const file = event?.target?.files && event.target.files[0] ? event.target.files[0] : null
    setEmergencyForm(prev => ({ ...prev, file }))
  }, [])

  const clearEmergencyAttachment = React.useCallback(() => {
    setEmergencyForm(prev => ({ ...prev, file: null }))
    if (emergencyFileInputRef.current) {
      emergencyFileInputRef.current.value = ''
    }
  }, [])

  const submitEmergencyReport = React.useCallback(async () => {
    if (emergencySubmitting) return
    setEmergencyError(null)
    setEmergencySubmitting(true)
    try {
      const formData = new FormData()
      formData.append('route_id', id)
      const userId = getCurrentUserId()
      if (userId) {
        formData.append('reported_by', userId)
      }
      formData.append('type', emergencyForm.type)
      formData.append('impact', emergencyForm.impact)
      if (emergencyForm.notes) {
        formData.append('notes', emergencyForm.notes)
      }
      if (emergencyForm.file) {
        formData.append('evidence', emergencyForm.file)
      }
      const headers = { ...authHeaders() }
      if (headers['Content-Type']) {
        delete headers['Content-Type']
      }
      const res = await fetch(buildApiUrl('report_route_emergency.php'), {
        method: 'POST',
        headers,
        body: formData
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to send emergency alert')
      }
      closeEmergencyForm()
      await loadStops(id)
      if (data?.emergency) {
        setEmergencyState(data.emergency)
      }
      alert('Emergency alert sent. Residents and officials have been notified.')
    } catch (e) {
      setEmergencyError(e?.message || 'Failed to send emergency alert')
    } finally {
      setEmergencySubmitting(false)
    }
  }, [authHeaders, closeEmergencyForm, emergencyForm, emergencySubmitting, getCurrentUserId, id, loadStops])

  async function handleCompleteRoute() {
    if (submitting) return
    if (emergencyActive) {
      alert('Route submission is disabled while an emergency alert is active. Please resolve or coordinate with your foreman before completing the route.')
      return
    }
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
        const teamId = nextMeta?.team_id || routeMeta?.team_id || null
        const assignmentId = teamId ? Number(teamId) : null

        await fetch(buildApiUrl('update_route_status.php'), {
          method: 'POST', headers: {
            'Content-Type': 'application/json',
            ...authHeaders()
          },
          body: JSON.stringify({ route_id: Number(id), status: 'completed', truck_full: false, note: null, user_id: userId })
        })

        // Only log task event if we have a valid assignment_id (team_id)
        if (assignmentId && assignmentId > 0) {
          await fetch(buildApiUrl('log_task_event.php'), {
            method: 'POST', headers: {
              'Content-Type': 'application/json',
              ...authHeaders()
            },
            body: JSON.stringify({
              assignment_id: assignmentId,
              event_type: 'route_submitted',
              user_id: userId,
              after: { route_id: id, total_stops: total, visited }
            })
          }).catch((e) => {
            console.warn('Failed to log task event (non-critical):', e)
          })
        }

        await fetch(buildApiUrl('clear_route_active.php'), {
          method: 'POST', headers: {
            'Content-Type': 'application/json',
            ...authHeaders()
          },
          body: JSON.stringify({ route_id: Number(id) })
        }).catch(() => { })

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
    <>
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
          {positions.length > 0 && (
            <Polyline positions={positions} color="#059669" weight={5} opacity={0.9} />
          )}
          {stops.map((s, i) => (
            <Marker key={i} position={[parseFloat(s.lat), parseFloat(s.lng)]}>
              <Popup>
                <div className="text-sm">
                  <div className="font-medium">{s.name || `Stop ${s.seq}`}</div>
                  <div className="text-gray-600">Seq: {s.seq}</div>
                </div>
              </Popup>
            </Marker>
          ))}
          {truckFull && (
            <Marker position={[13.7817000, 123.0203000]}>
              <Popup>
                <div className="text-sm">
                  <div className="font-medium">🗑️ Mantila - Disposal Site</div>
                  <div className="text-gray-600">Temporary destination for waste disposal</div>
                </div>
              </Popup>
            </Marker>
          )}
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
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-50 w-[min(720px,92vw)] bg-white/10 backdrop-blur-[30px] border border-white/30 rounded-[26px] px-5 py-4 shadow-[0_18px_35px_rgba(15,23,42,0.2)]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-emerald-700/70 font-semibold">Route status</p>
              <p className="text-lg font-semibold text-slate-900 truncate max-w-[280px]">{routeName || 'Route'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs tracking-wide transition ${emergencyActive ? 'bg-red-600 text-white border-red-600 shadow shadow-red-200/70 animate-pulse' : 'bg-white/25 text-red-600 border-white/50 hover:bg-white/40'}`}
                aria-label={emergencyActive ? 'Emergency active' : 'Report emergency'}
                title={emergencyActive ? 'Emergency active' : 'Report emergency'}
                onClick={() => setShowEmergencyForm(true)}
              >
                ▲
              </button>
              <button
                className="w-10 h-10 rounded-full border flex items-center justify-center text-xs bg-white/20 text-blue-600 border-white/50 hover:bg-white/40 transition"
                aria-label="Re-route"
                title="Re-route"
                onClick={() => setTargetStop(stops.find(s => (s.status || 'pending') !== 'visited') || stops[0])}
              >
                ↺
              </button>
              <button
                className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs transition ${follow ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200' : 'bg-white/20 text-gray-600 border-white/50 hover:bg-white/40'}`}
                aria-label={follow ? 'Disable follow' : 'Enable follow'}
                title={follow ? 'Disable follow' : 'Enable follow'}
                onClick={() => setFollow(v => !v)}
              >
                {follow ? '◉' : '◎'}
              </button>
              <button
                className="w-10 h-10 rounded-full border flex items-center justify-center text-xs bg-white/20 text-gray-600 border-white/50 hover:bg-white/40 transition"
                aria-label="Go back"
                title="Go back"
                onClick={() => navigate(-1)}
              >
                ↩
              </button>
            </div>
          </div>
          <div className="text-[11px] text-gray-700 mb-3 flex flex-wrap gap-2">
            {status === 'requesting' && 'Requesting location…'}
            {status === 'tracking' && currentPos && `You: ${currentPos.lat.toFixed(6)}, ${currentPos.lng.toFixed(6)}`}
            {status === 'denied' && 'Location permission denied'}
            {routeLoading && '• Calculating route…'}
            {routeError && routeError !== 'routing failed' && `• ${routeError}`}
            {truckFull && '• Rerouting to Mantila disposal site'}
          </div>
          {routeSummary && (
            <div className="text-xs text-gray-800 mb-4 flex flex-wrap gap-4">
              {formatDistance(routeSummary.distance)} • {formatDuration(routeSummary.duration)}
              {truckFull && ' (to Mantila)'}
            </div>
          )}
          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] text-gray-700 mb-2 uppercase tracking-wide">
              <span>Progress</span>
              <span>{visitedCount}/{totalStops} stops</span>
            </div>
            <div className="w-full bg-emerald-50 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {emergencyActive && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 via-white to-red-50 p-4 text-sm text-red-800 shadow">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-red-900">Emergency • Not operational</div>
                {emergencyImpactLabel && (
                  <span className={`text-[11px] font-semibold px-3 py-1 rounded-full shadow ${emergencyState?.impact === 'cancel' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
                    {emergencyImpactLabel}
                  </span>
                )}
              </div>
              <div className="mt-2 text-lg font-semibold text-red-900">
                {emergencyState?.type_label || emergencyState?.type || 'Emergency reported'}
              </div>
              {emergencyState?.notes && (
                <p className="mt-1 text-xs text-red-800 whitespace-pre-wrap">{emergencyState.notes}</p>
              )}
              <p className="mt-2 text-[11px] text-red-700">
                {formatTimestamp(emergencyState?.reported_at) || 'Just now'}
                {emergencyState?.reported_name ? ` • Reporter: ${emergencyState.reported_name}` : ''}
              </p>
              {emergencyAttachmentUrl && (
                <a
                  className="mt-3 inline-flex text-xs font-semibold text-red-900 underline"
                  href={emergencyAttachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View attachment
                </a>
              )}
            </div>
          )}

          <div className="space-y-3 text-sm">
            {truckFull ? (
              <div className="p-3 bg-amber-100/80 rounded-lg border border-amber-300 shadow-inner">
                <div className="font-medium text-amber-900 mb-2">⚠️ Truck Full - Disposal Required</div>
                <div className="text-xs text-amber-800 mb-3">
                  Route has been rerouted to Mantila disposal site. Please dispose collected waste before continuing.
                  {isAtMantila && <span className="block mt-1 text-emerald-700 font-semibold">✓ You are at Mantila disposal site</span>}
                </div>
                <button
                  onClick={handleContinueCollection}
                  disabled={submitting}
                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                >
                  {submitting ? 'Resuming...' : 'Continue Collection'}
                </button>
                {!isAtMantila && (
                  <div className="text-xs text-amber-700 mt-2 text-center">
                    Proceeding to Mantila disposal site...
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="p-4 bg-white/80 rounded-2xl border border-white/60 shadow-inner">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">Next stop</div>
                  {nextStop ? (
                    <div className="text-sm text-gray-800 font-medium mt-1">
                      Seq {nextStop.seq || '—'} • {nextStop.name || `Stop ${nextStop.seq || ''}`}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 mt-1">No pending stops.</div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="mt-4">
            <button
              className={`w-full px-4 py-3 rounded-2xl text-sm font-semibold tracking-wide transition ${emergencyActive ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : allVisited ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/70' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
              onClick={handleCompleteRoute}
              disabled={submitting || emergencyActive}
            >
              {emergencyActive
                ? 'Emergency active — submission disabled'
                : submitting
                  ? 'Submitting…'
                  : allVisited
                    ? 'Submit & mark route completed'
                    : 'In Progress'}
            </button>
          </div>
        </div>

      </div>

      {showEmergencyForm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Emergency alert</p>
                <p className="text-base font-semibold text-gray-900">Report truck emergency</p>
                <p className="text-xs text-gray-500">Residents, barangay head, and foreman will be notified instantly.</p>
              </div>
              <button
                className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100"
                onClick={closeEmergencyForm}
                aria-label="Close emergency modal"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-5 py-4 space-y-4 text-sm text-gray-700">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 mb-2">Reason</p>
                <div className="grid grid-cols-2 gap-2">
                  {EMERGENCY_TYPES.map((option) => {
                    const isActive = emergencyForm.type === option.value
                    return (
                      <label
                        key={option.value}
                        className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${isActive ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                      >
                        <input
                          type="radio"
                          name="emergency-type"
                          value={option.value}
                          checked={isActive}
                          onChange={() => updateEmergencyForm('type', option.value)}
                          className="sr-only"
                        />
                        {option.label}
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 mb-2">Impact</p>
                <div className="grid grid-cols-2 gap-2">
                  {EMERGENCY_IMPACTS.map((option) => {
                    const isActive = emergencyForm.impact === option.value
                    return (
                      <label
                        key={option.value}
                        className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${isActive ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                      >
                        <input
                          type="radio"
                          name="emergency-impact"
                          value={option.value}
                          checked={isActive}
                          onChange={() => updateEmergencyForm('impact', option.value)}
                          className="sr-only"
                        />
                        <div className="font-semibold">{option.label}</div>
                        <p className="text-[11px] text-gray-500">{option.caption}</p>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Notes</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="Describe what happened and if assistance is needed."
                  rows={3}
                  value={emergencyForm.notes}
                  onChange={(e) => updateEmergencyForm('notes', e.target.value)}
                />
                <p className="mt-1 text-[11px] text-gray-500">Keep it short so barangay head and foreman can react quickly.</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 mb-2">Evidence (optional)</p>
                <input
                  ref={emergencyFileInputRef}
                  id="emergency-evidence-input"
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleEmergencyFileChange}
                />
                <label
                  htmlFor="emergency-evidence-input"
                  className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-3 py-3 text-xs font-semibold text-gray-600 hover:border-emerald-400 hover:text-emerald-600"
                >
                  Upload photo or short video
                </label>
                {emergencyForm.file && (
                  <div className="mt-2 flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                    <span className="truncate pr-2">{emergencyForm.file.name}</span>
                    <button type="button" className="font-semibold text-red-600" onClick={clearEmergencyAttachment}>Remove</button>
                  </div>
                )}
              </div>

              {emergencyError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {emergencyError}
                </div>
              )}

              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                This alert automatically pauses collection for this route and notifies all affected residents and supervisors.
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t px-5 py-4">
              <button
                className="w-1/3 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                onClick={closeEmergencyForm}
                disabled={emergencySubmitting}
              >
                Cancel
              </button>
              <button
                className="w-2/3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 disabled:opacity-60"
                onClick={submitEmergencyReport}
                disabled={emergencySubmitting}
              >
                {emergencySubmitting ? 'Sending…' : 'Send emergency alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

