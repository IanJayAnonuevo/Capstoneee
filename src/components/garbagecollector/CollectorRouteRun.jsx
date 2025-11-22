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

import { buildApiUrl, API_BASE_URL } from '../../config/api';

export default function CollectorRouteRun(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [stops, setStops] = React.useState([])
  const [routeName, setRouteName] = React.useState('')
  const [currentPos, setCurrentPos] = React.useState(null)
  const [targetStop, setTargetStop] = React.useState(null)
  const [truckRotation, setTruckRotation] = React.useState(0)
  const [showUndo, setShowUndo] = React.useState(false)
  const [reportingFull, setReportingFull] = React.useState(false)
  const [lastVisited, setLastVisited] = React.useState(null)
  const [markingStopId, setMarkingStopId] = React.useState(null)
  const [undoingStopId, setUndoingStopId] = React.useState(null)
  const watchIdRef = React.useRef(null)
  const undoTimeoutRef = React.useRef(null)

  const authHeaders = () => {
    try {
      const t = localStorage.getItem('access_token');
      return t ? { Authorization: `Bearer ${t}` } : {};
    } catch { return {}; }
  };

  const fetchRouteDetails = React.useCallback(async () => {
    try {
  const res = await fetch(buildApiUrl(`get_route_details.php?id=${id}`), { headers: { ...authHeaders() } })
      const data = await res.json()
      if (data?.success && data.route?.stops) {
        const normalizedStops = (data.route.stops || []).map((stop) => ({
          ...stop,
          status: typeof stop.status === 'string' ? stop.status.toLowerCase() : stop.status,
        }))
        setStops(normalizedStops)
        setRouteName(data.route.cluster_id || data.route.barangay_name || 'Route')
      }
    } catch (e) {
      console.error('Failed to load route:', e)
    }
  }, [id])

  // Calculate bearing for truck rotation
  const calculateBearing = (from, to) => {
    if (!from || !to) return 0
    const lat1 = from.lat * Math.PI / 180
    const lat2 = to.lat * Math.PI / 180
    const deltaLon = (to.lng - from.lng) * Math.PI / 180
    const y = Math.sin(deltaLon) * Math.cos(lat2)
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon)
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
  }

  // Update truck rotation when position or target changes
  React.useEffect(() => {
    if (currentPos && targetStop) {
      const bearing = calculateBearing(currentPos, targetStop)
      setTruckRotation(bearing)
    }
  }, [currentPos, targetStop])

  React.useEffect(() => {
    fetchRouteDetails()
  }, [fetchRouteDetails])

  React.useEffect(() => {
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setCurrentPos(newPos)
          
          // Find nearest unvisited stop
          const unvisited = stops.filter(s => (s.status || 'pending') !== 'visited')
          if (unvisited.length > 0) {
            const nearest = unvisited.reduce((closest, stop) => {
              const dist1 = Math.sqrt(Math.pow(stop.lat - newPos.lat, 2) + Math.pow(stop.lng - newPos.lng, 2))
              const dist2 = Math.sqrt(Math.pow(closest.lat - newPos.lat, 2) + Math.pow(closest.lng - newPos.lng, 2))
              return dist1 < dist2 ? stop : closest
            })
            setTargetStop(nearest)
          }
        },
        (err) => console.error('GPS error:', err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      )
    }
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [stops])

  React.useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current)
      }
    }
  }, [])

  const persistStopStatus = React.useCallback(async (stopId, status) => {
    const payload = { stop_id: Number(stopId), status }
    try {
      const storedId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id')
      if (storedId) payload.user_id = Number(storedId)
    } catch (_) {}

    const res = await fetch(`${API_BASE_URL}/update_stop_status.php`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok || !data?.success) {
      throw new Error(data?.message || 'Failed to update stop status')
    }
  }, [])

  const markVisited = async (stopId) => {
    if (markingStopId != null) return
    const previousStops = stops.map((s) => ({ ...s }))
    try {
      setMarkingStopId(stopId)
      const updatedStops = stops.map(s => 
        s.id === stopId ? { ...s, status: 'visited' } : s
      )
      setStops(updatedStops)
      await persistStopStatus(stopId, 'visited')
      await fetchRouteDetails()
      setLastVisited(stopId)
      setShowUndo(true)
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current)
      }
      undoTimeoutRef.current = setTimeout(() => setShowUndo(false), 3000)
    } catch (e) {
      console.error('Failed to mark visited:', e)
      setStops(previousStops)
      alert('Failed to update stop status. Please try again.')
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current)
        undoTimeoutRef.current = null
      }
    }
    setMarkingStopId(null)
  }

  const undoLast = async () => {
    if (!lastVisited || undoingStopId != null) return
    const stopId = lastVisited
    const previousStops = stops.map((s) => ({ ...s }))
    try {
      setUndoingStopId(stopId)
      const updatedStops = stops.map(s => 
        s.id === stopId ? { ...s, status: 'pending' } : s
      )
      setStops(updatedStops)
      await persistStopStatus(stopId, 'pending')
      await fetchRouteDetails()
      setLastVisited(null)
      setShowUndo(false)
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current)
        undoTimeoutRef.current = null
      }
    } catch (e) {
      console.error('Failed to undo stop status:', e)
      setStops(previousStops)
      alert('Failed to undo. Please try again.')
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current)
        undoTimeoutRef.current = null
      }
    }
    setUndoingStopId(null)
  }

  const notifyTruckFull = async () => {
    if (reportingFull) return
    setReportingFull(true)
    try {
      const collectorId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id') || null
      await fetch(`${API_BASE_URL}/report_truck_full.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify({
          route_id: Number(id),
          collector_id: collectorId ? Number(collectorId) : null,
          note: 'Collector reported truck capacity reached'
        })
      })
      alert('The truck driver has been notified that the truck is full.')
    } catch (e) {
      console.error('Failed to notify truck driver:', e)
      alert('Failed to notify the truck driver. Please try again.')
    } finally {
      setReportingFull(false)
    }
  }

  const total = stops.length
  const visitedCount = stops.filter(s => (s.status || 'pending') === 'visited').length
  const progress = total > 0 ? (visitedCount / total) * 100 : 0

  return (
    <div className="h-screen relative">
      {/* Full screen map */}
      <MapContainer
        center={currentPos || [13.758627, 122.966234]}
        zoom={15}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Collection points */}
        {stops.map((stop, idx) => (
          <Marker key={stop.id} position={[parseFloat(stop.lat), parseFloat(stop.lng)]}>
            <Popup>
              <div className="text-sm">
                <div className="font-medium">{stop.name || `Stop ${stop.seq || idx + 1}`}</div>
                <div className="text-gray-600">Seq: {stop.seq || idx + 1}</div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Current position with collector icon */}
        {currentPos && (
          <Marker 
            position={[currentPos.lat, currentPos.lng]}
            icon={L.divIcon({
              className: 'custom-collector-icon',
              html: `
                <div style="
                  width: 32px;
                  height: 32px;
                  background: #059669;
                  border-radius: 50%;
                  border: 3px solid white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 14px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                ">
                  C
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            })}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-medium">📍 Collector Location</div>
                <div className="text-gray-600">{currentPos.lat.toFixed(6)}, {currentPos.lng.toFixed(6)}</div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Overlay panel for stops + controls - Same as truck driver */}
      <div className="fixed left-1/2 -translate-x-1/2 bottom-4 z-[9999] w-[min(680px,92vw)] bg-white/95 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-base truncate flex items-center gap-2">
            <span>{routeName || 'Route'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 text-xs bg-gray-200 rounded" onClick={()=>navigate('/garbagecollector')}>Back</button>
          </div>
        </div>
        <div className="text-[11px] text-gray-700 mb-2">
          {currentPos && `You: ${currentPos.lat.toFixed(6)}, ${currentPos.lng.toFixed(6)}`}
        </div>
        <div className="text-xs text-gray-800 mb-2">6.9 km • 8 min</div>
        
        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-700 mb-1">
            <span>Progress</span>
            <span>{visitedCount}/{total} stops</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <ol className="space-y-2 text-sm max-h-[40vh] overflow-auto pr-1">
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 mt-2 rounded-full bg-green-500 inline-block"></span>
            <div>
              <div className="font-medium">Current Location</div>
              {currentPos && <div className="text-gray-600 text-xs">{currentPos.lat.toFixed(6)}, {currentPos.lng.toFixed(6)}</div>}
            </div>
          </li>
          {stops.map((s,i)=> {
            const visited = (s.status||'pending')==='visited'
            const isUpdating = markingStopId === s.id || undoingStopId === s.id
            return (
              <li key={i} className="flex items-start gap-2">
                <span className={`w-2 h-2 mt-2 rounded-full inline-block ${visited ? 'bg-emerald-600' : 'bg-gray-400'}`}></span>
                <div className="flex-1">
                  <div className="font-medium">{s.name || `Stop ${s.seq || i + 1}`}</div>
                  <div className="text-gray-600 text-xs">Seq {s.seq || i + 1} • {visited ? 'Visited' : 'Pending'}</div>
                </div>
                <button
                  className={`ml-2 px-2 py-1 text-xs rounded ${visited ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-emerald-600 text-white'} ${isUpdating ? 'opacity-60 cursor-wait' : ''}`}
                  onClick={() => !visited && !isUpdating && markVisited(s.id)}
                  disabled={visited || isUpdating}
                >
                  {visited ? 'Done' : isUpdating ? 'Saving…' : 'Mark visited'}
                </button>
              </li>
            )
          })}
        </ol>
        <div className="mt-3">
          <button
            className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={notifyTruckFull}
            disabled={reportingFull}
          >
            {reportingFull ? 'Notifying truck driver…' : 'Report truck is full'}
          </button>
        </div>
      </div>

      {/* Undo Notification */}
      {showUndo && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-24 z-50 bg-black/70 text-white text-sm px-3 py-2 rounded shadow">
          <span>Marked visited.</span>
          <button className="ml-3 underline disabled:opacity-60" onClick={undoLast} disabled={undoingStopId != null}>
            {undoingStopId != null ? 'Reverting…' : 'Undo'}
          </button>
        </div>
      )}

      {/* Status Modal removed per request */}

    </div>
  )
}
