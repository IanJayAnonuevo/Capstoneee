import React from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet'
import { buildApiUrl } from '../../config/api'
import DashboardCard from '../common/DashboardCard'
import ProgressBar from '../common/ProgressBar'

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Sipocot map config
const SIPOCOT_CENTER = [13.7766, 122.9826]
const SIPOCOT_BOUNDS = [
  [13.6000, 122.7000],
  [13.9000, 123.2000],
]

const getAuthToken = () => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('access_token')
  } catch (err) {
    console.warn('Unable to read access token', err)
    return null
  }
}

const getAuthHeaders = (extra = {}) => {
  const token = getAuthToken()
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

const getTruckColor = (status) => {
  switch (status) {
    case 'moving': return '#10b981';
    case 'idle': return '#ef4444';
    case 'full_load': return '#f59e0b';
    default: return '#6b7280';
  }
}

const truckMarkerIcon = (status = 'idle', heading = 0, scale = 1) => {
  const color = getTruckColor(status)
  const size = 36 * scale
  const anchorX = size / 2
  const anchorY = size * 0.85
  const popupY = size * 0.75
  const rotation = heading || 0

  return L.divIcon({
    className: 'truck-marker-icon',
    html: `
      <div style="
        position: relative;
        font-size:${size}px; 
        line-height:1; 
        transform: translate(-50%, -70%) rotate(${rotation}deg);
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">
        <div style="color: ${color};">🚛</div>
        <div style="
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 14px;
          color: ${color};
        ">➤</div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [anchorX, anchorY],
    popupAnchor: [0, -popupY]
  })
}

const binIcon = (status = 'pending') => {
  const bgColor = status === 'completed' ? '#10b981' : '#ef4444'

  return L.divIcon({
    className: 'bin-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background-color: ${bgColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      ">
        <div style="font-size: 10px;">🗑️</div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  })
}

function MapAutoFit({ trucks }) {
  const map = useMap()
  React.useEffect(() => {
    if (!trucks || trucks.length === 0) return
    const points = trucks
      .map(t => [parseFloat(t.lat), parseFloat(t.lng)])
      .filter(arr => Number.isFinite(arr[0]) && Number.isFinite(arr[1]))
    if (points.length === 0) return
    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 })
  }, [trucks, map])
  return null
}

const isStale = (ts, thresholdMs = 60000) => {
  if (!ts) return true
  const t = new Date(ts).getTime()
  if (!Number.isFinite(t)) return true
  return (Date.now() - t) > thresholdMs
}

export default function Dashboard() {
  const [liveTrucks, setLiveTrucks] = React.useState([])
  const [isLiveLoading, setIsLiveLoading] = React.useState(false)
  const [liveError, setLiveError] = React.useState(null)
  const [destinations, setDestinations] = React.useState([])
  const [collectionPoints, setCollectionPoints] = React.useState([])
  const [dailyOps, setDailyOps] = React.useState(null)
  const [attendance, setAttendance] = React.useState(null)
  const [issues, setIssues] = React.useState(null)
  const [equipment, setEquipment] = React.useState(null)

  React.useEffect(() => {
    let timer = null
    const load = async () => {
      try {
        setIsLiveLoading(true)
        setLiveError(null)
        const res = await fetch(`${buildApiUrl('live_trucks.php')}?since=300&limit=2`, {
          headers: getAuthHeaders(),
        })
        const data = await res.json()
        if (data?.success) {
          setLiveTrucks(Array.isArray(data.trucks) ? data.trucks : [])
        } else {
          setLiveError(data?.message || 'Failed to load live trucks')
        }
      } catch (e) {
        setLiveError(e.message || 'Network error')
      } finally {
        setIsLiveLoading(false)
        timer = setTimeout(load, 3000) // Refresh every 3 seconds for smoother tracking
      }
    }
    load()
    return () => { if (timer) clearTimeout(timer) }
  }, [])

  React.useEffect(() => {
    let timer = null
    const load = async () => {
      try {
        const res = await fetch(buildApiUrl('get_daily_operations.php'), {
          headers: getAuthHeaders(),
        })
        const data = await res.json()
        if (data?.success) {
          setDailyOps(data.data)
        }
      } catch (e) {
        console.error('Failed to load daily operations:', e)
      } finally {
        timer = setTimeout(load, 5000)
      }
    }
    load()
    return () => { if (timer) clearTimeout(timer) }
  }, [])

  React.useEffect(() => {
    let timer = null
    const load = async () => {
      try {
        const res = await fetch(buildApiUrl('get_attendance_snapshot.php'), {
          headers: getAuthHeaders(),
        })
        const data = await res.json()
        if (data?.success) {
          setAttendance(data.data)
        }
      } catch (e) {
        console.error('Failed to load attendance:', e)
      } finally {
        timer = setTimeout(load, 5000)
      }
    }
    load()
    return () => { if (timer) clearTimeout(timer) }
  }, [])

  React.useEffect(() => {
    let timer = null
    const load = async () => {
      try {
        const res = await fetch(buildApiUrl('get_issue_summary.php'), {
          headers: getAuthHeaders(),
        })
        const data = await res.json()
        if (data?.success) {
          setIssues(data.data)
        }
      } catch (e) {
        console.error('Failed to load issues:', e)
      } finally {
        timer = setTimeout(load, 5000)
      }
    }
    load()
    return () => { if (timer) clearTimeout(timer) }
  }, [])

  React.useEffect(() => {
    let timer = null
    const load = async () => {
      try {
        const res = await fetch(buildApiUrl('get_equipment_status.php'), {
          headers: getAuthHeaders(),
        })
        const data = await res.json()
        if (data?.success) {
          setEquipment(data.data)
        }
      } catch (e) {
        console.error('Failed to load equipment:', e)
      } finally {
        timer = setTimeout(load, 5000)
      }
    }
    load()
    return () => { if (timer) clearTimeout(timer) }
  }, [])

  React.useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10)
        const res = await fetch(`${buildApiUrl('get_scheduled_routes.php')}?date=${today}`, {
          headers: getAuthHeaders(),
        })
        const data = await res.json()
        if (data?.success && Array.isArray(data.routes)) {
          const pins = data.routes
            .map(r => {
              const coord = Array.isArray(r.coordinates) && r.coordinates.length === 2 ? r.coordinates : null
              const lat = Number(r.latitude ?? (coord ? coord[0] : NaN))
              const lng = Number(r.longitude ?? (coord ? coord[1] : NaN))
              if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
              return {
                lat, lng,
                name: r.barangay || r.barangay_name || 'Destination',
                time: r.time || r.start_time || '',
              }
            })
            .filter(Boolean)
          setDestinations(pins)
        } else {
          setDestinations([])
        }
      } catch (_) {
        setDestinations([])
      }
    }
    fetchDestinations()
    const interval = setInterval(fetchDestinations, 30000)
    return () => clearInterval(interval)
  }, [])

  React.useEffect(() => {
    const fetchCollectionPoints = async () => {
      try {
        const res = await fetch(buildApiUrl('collection_points_status.php'), {
          headers: getAuthHeaders(),
        })
        const data = await res.json()
        if (data?.success && Array.isArray(data.points)) {
          setCollectionPoints(data.points)
        }
      } catch (_) {
        setCollectionPoints([])
      }
    }
    fetchCollectionPoints()
    const interval = setInterval(fetchCollectionPoints, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-full overflow-x-auto bg-gray-50 min-h-screen font-sans">
      <div className="px-6 pb-6 mt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <DashboardCard
            title="Total Routes Scheduled Today"
            value={dailyOps?.total_routes_today ?? '—'}
            subtitle={`Across ${dailyOps?.routes_by_barangay ?? 0} Barangays`}
            color="emerald"
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
          />
          <DashboardCard
            title="Active Collectors & Drivers"
            value={dailyOps?.total_active_staff ?? '—'}
            subtitle={`${dailyOps?.active_collectors ?? 0} collectors, ${dailyOps?.active_drivers ?? 0} drivers`}
            color="blue"
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <DashboardCard
            title="Ongoing Collections"
            value={dailyOps?.ongoing_collections ?? '—'}
            subtitle="Live status"
            color="amber"
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m8.66-15.66l-4.24 4.24M9.17 14.83l-4.24 4.24M23 12h-6m-6 0H1m20.66 8.66l-4.24-4.24M9.17 9.17L4.93 4.93" />
              </svg>
            }
          />
          <DashboardCard
            title="Pending / Delayed Tasks"
            value={dailyOps?.total_pending_delayed ?? '—'}
            subtitle={`${dailyOps?.pending_tasks ?? 0} pending, ${dailyOps?.delayed_tasks ?? 0} delayed`}
            color={dailyOps?.delayed_tasks > 0 ? 'red' : 'emerald'}
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Attendance Snapshot</h2>
              <div className="space-y-3">
                <DashboardCard
                  title="Collectors/Drivers Time-in Status"
                  value={attendance?.timed_in_count ?? '—'}
                  subtitle="Staff"
                  color="emerald"
                />
                <DashboardCard
                  title="Absent / On Leave Today"
                  value={attendance?.total_absent_or_leave ?? '—'}
                  subtitle="Staff"
                  color={attendance?.total_absent_or_leave > 0 ? 'red' : 'emerald'}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Issue & Incident Summary</h2>
              <ProgressBar
                label="Resolved"
                value={issues?.resolved_count ?? 0}
                max={issues?.total_issues ?? 1}
                color="green"
              />
              <ProgressBar
                label="Unresolved"
                value={issues?.unresolved_count ?? 0}
                max={issues?.total_issues ?? 1}
                color="red"
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Map & Route Monitoring</h2>
                <div className="flex items-center gap-2">
                  {!isLiveLoading && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="font-medium">Live</span>
                    </div>
                  )}
                  {isLiveLoading && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Updating...</span>
                    </div>
                  )}
                </div>
              </div>
              {liveError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">{liveError}</div>
              )}
              <div className="h-96 rounded-md overflow-hidden border border-gray-200 mb-3">
                <MapContainer center={SIPOCOT_CENTER} zoom={13} className="h-full w-full" maxBounds={SIPOCOT_BOUNDS} minZoom={10} maxZoom={18}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={SIPOCOT_CENTER}>
                    <Popup>
                      <div className="p-2.5 text-center">
                        <h3 className="m-0 mb-1 text-green-800">Sipocot</h3>
                        <p className="m-0 text-gray-800">Camarines Sur</p>
                      </div>
                    </Popup>
                  </Marker>
                  {liveTrucks.map((t) => {
                    const stale = isStale(t.ts)
                    const opacity = stale ? 0.6 : 1
                    const status = t.calculated_status || 'idle'
                    const heading = parseFloat(t.heading) || 0
                    return (
                      <Marker
                        key={`truck-${t.truck_id}`}
                        position={[parseFloat(t.lat), parseFloat(t.lng)]}
                        icon={truckMarkerIcon(status, heading, 1.05)}
                        opacity={opacity}
                      >
                        <Popup>
                          <div className="text-sm">
                            <div><strong>{t.plate || `Truck ${t.truck_id}`}</strong> {stale && <span className="text-xs text-gray-500">(Stale)</span>}</div>
                            <div>Driver: {t.driver || 'N/A'}</div>
                            <div>Updated: {new Date(t.ts).toLocaleTimeString()}</div>
                          </div>
                        </Popup>
                      </Marker>
                    )
                  })}
                  {destinations.map((d, i) => (
                    <Marker key={`dest-${i}`} position={[d.lat, d.lng]} icon={truckMarkerIcon('idle', 0, 0.75)}>
                      <Popup>
                        <div className="text-sm">
                          <div><strong>{d.name}</strong></div>
                          {d.time && (<div>Time: {String(d.time).slice(0, 5)}</div>)}
                          <div>Lat/Lng: {d.lat.toFixed(5)}, {d.lng.toFixed(5)}</div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  {collectionPoints.map((point) => (
                    <Marker
                      key={`cp-${point.point_id}`}
                      position={[parseFloat(point.latitude), parseFloat(point.longitude)]}
                      icon={binIcon(point.status)}
                    >
                      <Popup>
                        <div className="text-sm">
                          <div><strong>{point.location_name}</strong></div>
                          <div>Barangay: {point.barangay_id}</div>
                          <div>Status: {
                            point.status === 'completed' ? '✅ Collected' :
                              point.status === 'pending' ? '🗑️ Pending' :
                                point.status === 'skipped' ? '⏭️ Skipped' :
                                  '⚪ Not Scheduled'
                          }</div>
                          {point.is_mrf && <div className="text-xs text-blue-600">MRF Site</div>}
                          {point.last_collected && (
                            <div className="text-xs text-gray-600">
                              Last: {new Date(point.last_collected).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  <MapAutoFit trucks={liveTrucks} />
                </MapContainer>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                  <span>Collection Route</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                  <span>Live Truck</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Equipment & Vehicle Status</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DashboardCard
                  title="Available trucks"
                  value={equipment?.available_trucks ?? '—'}
                  subtitle={`Out of ${equipment?.total_trucks ?? 0} total`}
                  color="emerald"
                />
                <DashboardCard
                  title="Under maintenance"
                  value={equipment?.under_maintenance ?? '—'}
                  subtitle="Trucks"
                  color={equipment?.under_maintenance > 0 ? 'amber' : 'emerald'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
