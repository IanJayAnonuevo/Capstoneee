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

const PROXIMITY_THRESHOLD_METERS = 75; // must be near stop before allowing completion

const readStoredUserId = () => {
  try {
    const stored = localStorage.getItem('user_id') || sessionStorage.getItem('user_id')
    return stored ? Number(stored) : null
  } catch {
    return null
  }
}

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
  const [proofModalStop, setProofModalStop] = React.useState(null)
  const [proofPhotoFile, setProofPhotoFile] = React.useState(null)
  const [proofPreviewUrl, setProofPreviewUrl] = React.useState(null)
  const [proofError, setProofError] = React.useState('')
  const [uploadingProof, setUploadingProof] = React.useState(false)
  const [unlockedStopIds, setUnlockedStopIds] = React.useState([])
  const watchIdRef = React.useRef(null)
  const undoTimeoutRef = React.useRef(null)

  const authHeaders = React.useCallback(() => {
    try {
      const t = localStorage.getItem('access_token');
      return t ? { Authorization: `Bearer ${t}` } : {};
    } catch { return {}; }
  }, []);

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
  }, [id, authHeaders])

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

  // Haversine distance (meters)
  const calculateDistanceMeters = React.useCallback((from, to) => {
    if (!from || !to) return null
    const R = 6371000 // meters
    const lat1 = from.lat * Math.PI / 180
    const lat2 = to.lat * Math.PI / 180
    const deltaLat = (to.lat - from.lat) * Math.PI / 180
    const deltaLon = (to.lng - from.lng) * Math.PI / 180
    const a = Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }, [])

  // Update truck rotation when position or target changes
  React.useEffect(() => {
    if (currentPos && targetStop) {
      const bearing = calculateBearing(currentPos, targetStop)
      setTruckRotation(bearing)
    }
  }, [currentPos, targetStop])

  const stopDistances = React.useMemo(() => {
    if (!currentPos) return {}
    return stops.reduce((acc, stop) => {
      acc[stop.id] = calculateDistanceMeters(currentPos, {
        lat: parseFloat(stop.lat),
        lng: parseFloat(stop.lng)
      })
      return acc
    }, {})
  }, [currentPos, stops, calculateDistanceMeters])

  const unlockStop = React.useCallback((stopId) => {
    setUnlockedStopIds((prev) => (prev.includes(stopId) ? prev : [...prev, stopId]))
  }, [])

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
            const distanceToNearest = calculateDistanceMeters(newPos, {
              lat: parseFloat(nearest.lat),
              lng: parseFloat(nearest.lng)
            })
            if (distanceToNearest != null && distanceToNearest <= PROXIMITY_THRESHOLD_METERS) {
              unlockStop(nearest.id)
            }
          }
          // Unlock any stop currently within range
          stops.forEach((stop) => {
            if ((stop.status || 'pending') !== 'visited') {
              const dist = calculateDistanceMeters(newPos, {
                lat: parseFloat(stop.lat),
                lng: parseFloat(stop.lng)
              })
              if (dist != null && dist <= PROXIMITY_THRESHOLD_METERS) {
                unlockStop(stop.id)
              }
            }
          })
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
  }, [stops, calculateDistanceMeters, unlockStop])

  React.useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    if (!proofPhotoFile) {
      setProofPreviewUrl(prev => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      return
    }
    const nextUrl = URL.createObjectURL(proofPhotoFile)
    setProofPreviewUrl(nextUrl)
    return () => {
      URL.revokeObjectURL(nextUrl)
    }
  }, [proofPhotoFile])

  const persistStopStatus = React.useCallback(async (stopId, status, options = {}) => {
    const { proofPhotoUrl = null, clearProof = false } = options
    const payload = { stop_id: Number(stopId), status }
    try {
      const storedId = readStoredUserId()
      if (storedId) payload.user_id = storedId
    } catch (_) {}
    if (proofPhotoUrl) {
      payload.proof_photo_url = proofPhotoUrl
    } else if (clearProof) {
      payload.clear_proof = true
    }

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
  }, [authHeaders])

  const markVisited = async (stopId, proofPhotoUrl = null) => {
    if (markingStopId != null) return
    if (!proofPhotoUrl) {
      console.warn('Proof photo is required before marking a stop as visited.')
      alert('Mag-upload muna ng proof photo bago i-mark ang stop.')
      return
    }
    const previousStops = stops.map((s) => ({ ...s }))
    try {
      setMarkingStopId(stopId)
      const updatedStops = stops.map(s => 
        s.id === stopId ? { ...s, status: 'visited' } : s
      )
      setStops(updatedStops)
      await persistStopStatus(stopId, 'visited', { proofPhotoUrl })
      await fetchRouteDetails()
      setLastVisited(stopId)
      setShowUndo(true)
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current)
      }
      undoTimeoutRef.current = setTimeout(() => setShowUndo(false), 3000)
      setUnlockedStopIds((prev) => prev.filter((id) => id !== stopId))
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

  const uploadStopProof = React.useCallback(async (stopId, file) => {
    const formData = new FormData()
    formData.append('stop_id', Number(stopId))
    const storedId = readStoredUserId()
    if (storedId) {
      formData.append('user_id', storedId)
    }
    formData.append('proof_photo', file)
    const res = await fetch(`${API_BASE_URL}/upload_stop_proof.php`, {
      method: 'POST',
      headers: { 
        ...authHeaders()
      },
      body: formData
    })
    const data = await res.json()
    if (!res.ok || !data?.success || !data?.proof_photo_url) {
      throw new Error(data?.message || 'Failed to upload proof photo')
    }
    return data.proof_photo_url
  }, [authHeaders])

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
      await persistStopStatus(stopId, 'pending', { clearProof: true })
      await fetchRouteDetails()
      setLastVisited(null)
      setShowUndo(false)
      unlockStop(stopId)
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

  const openProofModal = (stop) => {
    setProofModalStop(stop)
    setProofPhotoFile(null)
    setProofError('')
  }

  const closeProofModal = () => {
    setProofModalStop(null)
    setProofPhotoFile(null)
    setProofError('')
  }

  const submitProofAndVisit = async () => {
    if (!proofModalStop) return
    if (!proofPhotoFile) {
      setProofError('Kailangan ng litrato bago i-mark bilang done.')
      return
    }
    setUploadingProof(true)
    try {
      const proofUrl = await uploadStopProof(proofModalStop.id, proofPhotoFile)
      await markVisited(proofModalStop.id, proofUrl)
      closeProofModal()
    } catch (e) {
      console.error('Failed to upload proof:', e)
      setProofError(e.message || 'Hindi ma-upload ang larawan. Subukan ulit.')
    } finally {
      setUploadingProof(false)
    }
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
    <>
    <div className="fixed inset-0">
      {/* Full screen map */}
      <MapContainer
        center={currentPos || [13.758627, 122.966234]}
        zoom={15}
        className="h-full w-full"
        style={{ zIndex: 0 }}
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
      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-50 w-[min(720px,92vw)] bg-white/10 backdrop-blur-[30px] border border-white/30 rounded-[26px] px-5 py-4 shadow-[0_18px_35px_rgba(15,23,42,0.2)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-emerald-700/70 font-semibold">Route status</p>
            <p className="text-lg font-semibold text-slate-900 truncate max-w-[280px]">{routeName || 'Route'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="w-10 h-10 rounded-full border flex items-center justify-center text-xs bg-white/20 text-gray-600 border-white/50 hover:bg-white/40 transition"
              aria-label="Go back"
              title="Go back"
              onClick={() => navigate('/garbagecollector')}
            >
              ↩
            </button>
          </div>
        </div>
        <div className="text-[11px] text-gray-700 mb-3 flex flex-wrap gap-2">
          {currentPos && `You: ${currentPos.lat.toFixed(6)}, ${currentPos.lng.toFixed(6)}`}
        </div>
        
        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] text-gray-700 mb-2 uppercase tracking-wide">
            <span>Progress</span>
            <span>{visitedCount}/{total} stops</span>
          </div>
          <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-white/30">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="space-y-3 text-sm max-h-[40vh] overflow-y-auto pr-1">
          {stops.map((s,i)=> {
            const visited = (s.status||'pending')==='visited'
            const isUpdating = markingStopId === s.id || undoingStopId === s.id
            const distanceToStop = stopDistances[s.id]
            const isWithinRange = !!currentPos && !visited && distanceToStop != null && distanceToStop <= PROXIMITY_THRESHOLD_METERS
            const unlocked = unlockedStopIds.includes(s.id)
            return (
              <div key={i} className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-inner">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1">
                    <span className={`w-2.5 h-2.5 mt-1.5 rounded-full inline-block flex-shrink-0 ${visited ? 'bg-emerald-600' : unlocked ? 'bg-emerald-400' : 'bg-gray-400'}`}></span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 text-sm">{s.name || `Stop ${s.seq || i + 1}`}</div>
                      <div className="text-gray-700 text-xs mt-0.5 flex flex-col gap-0.5">
                        <span>Seq {s.seq || i + 1} • {visited ? 'Visited' : unlocked ? 'Ready' : 'Pending'}</span>
                        {!visited && (
                          <span className={`text-[11px] font-medium ${isWithinRange ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {distanceToStop != null
                              ? `${distanceToStop < 1000 ? distanceToStop.toFixed(0) + ' m' : (distanceToStop / 1000).toFixed(2) + ' km'} away`
                              : 'Waiting for GPS...'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                      visited
                        ? 'bg-emerald-50/60 backdrop-blur-sm text-emerald-700 border border-emerald-200/50 cursor-not-allowed'
                        : unlocked
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                          : 'bg-gray-200/40 backdrop-blur-sm text-gray-500 cursor-not-allowed'
                    } ${isUpdating ? 'opacity-60 cursor-wait' : ''}`}
                    onClick={() => !visited && unlocked && !isUpdating && openProofModal(s)}
                    disabled={visited || !unlocked || isUpdating}
                  >
                    {visited ? 'Done' : isUpdating ? 'Saving…' : unlocked ? 'Mark done' : 'Move closer'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4">
          <button
            className="w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-sm font-semibold tracking-wide disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-amber-200/50 transition"
            onClick={notifyTruckFull}
            disabled={reportingFull}
          >
            {reportingFull ? 'Notifying truck driver…' : 'Report truck is full'}
          </button>
        </div>
      </div>

      {proofModalStop && (
        <div className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold">Proof of collection</h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  {proofModalStop.name || `Stop ${proofModalStop.seq}`}
                </p>
              </div>
              <button className="text-sm text-gray-500 hover:text-gray-800" onClick={closeProofModal} disabled={uploadingProof}>
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-700">
                Kunan o i-upload ang larawan ng aktwal na koleksyon
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  setProofError('')
                  setProofPhotoFile(e.target.files?.[0] || null)
                }}
                className="w-full text-xs"
                disabled={uploadingProof}
              />
              {proofPreviewUrl && (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <img src={proofPreviewUrl} alt="Collection proof preview" className="w-full h-48 object-cover" />
                </div>
              )}
              {proofError && <p className="text-xs text-red-600">{proofError}</p>}
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 px-4 py-2 text-sm rounded border border-gray-300 text-gray-700"
                onClick={closeProofModal}
                disabled={uploadingProof}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 text-sm rounded bg-emerald-600 text-white disabled:opacity-60"
                onClick={submitProofAndVisit}
                disabled={uploadingProof}
              >
                {uploadingProof ? 'Uploading…' : 'Upload & mark done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Notification */}
      {showUndo && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-24 z-[60] bg-black/80 backdrop-blur-md text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">
          <span>Marked visited.</span>
          <button className="ml-3 underline font-medium disabled:opacity-60" onClick={undoLast} disabled={undoingStopId != null}>
            {undoingStopId != null ? 'Reverting…' : 'Undo'}
          </button>
        </div>
      )}

      {/* Status Modal removed per request */}

    </div>
    </>
  )
}
