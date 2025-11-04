import React from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'

const ENV_COLORS = {
  primary: '#2d5016',
  secondary: '#4a7c59',
  accent: '#8fbc8f',
  light: '#f8faf5',
  white: '#ffffff',
  text: '#2c3e50',
  textLight: '#7f8c8d',
  success: '#27ae60',
  warning: '#f39c12',
  error: '#e74c3c',
  border: '#e8f5e8',
  shadow: 'rgba(45, 80, 22, 0.08)',
  bark: '#5d4e37',
  moss: '#9caa7b',
  leaf: '#6b8e23',
  soil: '#8b4513'
}

// chart code removed per layout request

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
  [13.6000, 122.7000], // Southwest (wider city/country buffer)
  [13.9000, 123.2000], // Northeast
]

import { buildApiUrl } from '../../config/api';

const truckMarkerIcon = (scale = 1) => {
  const size = 36 * scale
  const anchorX = size / 2
  const anchorY = size * 0.85
  const popupY = size * 0.75

  return L.divIcon({
    className: 'truck-marker-icon',
    html: `<div style="font-size:${size}px; line-height:1; transform: translate(-50%, -70%);">🚛</div>`,
    iconSize: [size, size],
    iconAnchor: [anchorX, anchorY],
    popupAnchor: [0, -popupY]
  })
}

// Auto-fit helper component
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
  const [destinations, setDestinations] = React.useState([]) // today's scheduled destinations

  React.useEffect(() => {
    let timer = null
    const load = async () => {
      try {
        setIsLiveLoading(true)
        setLiveError(null)
  const res = await fetch(buildApiUrl('live_trucks.php?since=300&limit=2'))
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
        timer = setTimeout(load, 5000)
      }
    }
    load()
    return () => { if (timer) clearTimeout(timer) }
  }, [])

  // Load today's scheduled destination pins (barangay/collection points)
  React.useEffect(() => {
    const fetchDestinations = async () => {
      try {
  const today = new Date().toISOString().slice(0,10)
  const res = await fetch(buildApiUrl(`get_scheduled_routes.php?date=${today}`))
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
  }, [])
  return (
    <div className="p-6 max-w-full overflow-x-auto bg-emerald-50 min-h-screen font-sans">
      {/* Top bar - layout only, content unchanged */}
      <div className="mb-6">
        <h1 className="text-4xl md:text-5xl text-green-800 mb-1 font-semibold tracking-tight">Task Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600 m-0">Track operations and monitor activities</p>
      </div>

      {/* Layout: main content + right KPI panel */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
        {/* Main content: top 3 boxes + sections */}
            <div>
          {/* Live Map replaces the top three boxes */}
        <div className="bg-white rounded-md border border-gray-200 p-4">
          <h2 className="text-lg mb-3 text-green-900 font-medium">Live Map</h2>
          {liveError && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{liveError}</div>
          )}
          <div className="h-96 rounded-sm overflow-hidden border border-gray-200">
            <MapContainer
              center={SIPOCOT_CENTER}
              zoom={13}
              className="h-full w-full"
              maxBounds={SIPOCOT_BOUNDS}
              minZoom={10}
              maxZoom={18}
            >
              <TileLayer
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://srtm.csi.cgiar.org/">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
              />
              <Marker position={SIPOCOT_CENTER} icon={truckMarkerIcon(0.9)}>
                <Popup>
                  <div className="p-2.5 text-center">
                    <h3 className="m-0 mb-1 text-green-800">Sipocot</h3>
                    <p className="m-0 text-gray-800">Camarines Sur</p>
                  </div>
                </Popup>
              </Marker>

              {/* Live trucks (up to two) with stale dimming */}
                {liveTrucks.map((t, idx) => {
                const stale = isStale(t.ts)
                  const opacity = stale ? 0.6 : 1
                return (
                    <Marker key={`truck-${t.truck_id}`} position={[parseFloat(t.lat), parseFloat(t.lng)]} icon={truckMarkerIcon(1.05)} opacity={opacity}>
                    <Popup>
                      <div className="text-sm">
                        <div><strong>{t.plate || `Truck ${t.truck_id}`}</strong> {stale && <span className="text-xs text-gray-500">(Stale)</span>}</div>
                        <div>Driver: {t.driver || 'N/A'}</div>
                        <div>Speed: {t.speed ?? 0} km/h</div>
                        <div>Accuracy: {t.accuracy ?? '—'} m</div>
                        <div>Updated: {new Date(t.ts).toLocaleTimeString()}</div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}

                {/* Destination pins (today) */}
                {destinations.map((d, i) => (
                  <Marker key={`dest-${i}`} position={[d.lat, d.lng]} icon={truckMarkerIcon(0.75)}>
                    <Popup>
                      <div className="text-sm">
                        <div><strong>{d.name}</strong></div>
                        {d.time && (<div>Time: {String(d.time).slice(0,5)}</div>)}
                        <div>Lat/Lng: {d.lat.toFixed(5)}, {d.lng.toFixed(5)}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              {/* Auto-fit to include available trucks */}
              <MapAutoFit trucks={liveTrucks} />
            </MapContainer>
          </div>
          {isLiveLoading && (
            <div className="mt-2 text-xs text-gray-600">Loading live trucks…</div>
          )}
          </div>

          {/* Task Summary (left column) */}
          <div className="mt-6">
            {/* Task Summary */}
            <div>
              <h2 className="text-base font-medium text-green-900 mb-3">Task Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({length:6}).map((_,i)=> (
                  <div key={i} className="bg-white rounded-md border border-emerald-200 p-4">
                    <div className="text-2xl font-semibold text-green-900">0</div>
                    <div className="text-xs text-gray-500 mt-1">Placeholder</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column: KPI cards stacked */}
        <aside>
          <div className="space-y-3">
            <div className="bg-white rounded-md p-4 border border-emerald-200">
              <div className="text-sm text-emerald-900 font-semibold">Total Collections</div>
              <div className="mt-2 text-3xl font-semibold text-emerald-900">100</div>
              <div className="text-xs text-emerald-600 mt-1">≈ daily pickups</div>
            </div>
            <div className="bg-white rounded-md p-4 border border-emerald-200">
              <div className="text-sm text-emerald-900 font-semibold">Completed Today</div>
              <div className="mt-2 text-3xl font-semibold text-emerald-900">20</div>
              <div className="text-xs text-emerald-600 mt-1">Marked completed</div>
            </div>
            <div className="bg-white rounded-md p-4 border border-emerald-200">
              <div className="text-sm text-emerald-900 font-semibold">Delayed</div>
              <div className="mt-2 text-3xl font-semibold text-red-600">12</div>
              <div className="text-xs text-emerald-600 mt-1">Follow-up required</div>
            </div>
            <div className="bg-white rounded-md p-4 border border-emerald-200">
              <div className="text-sm text-emerald-900 font-semibold">Active Trucks</div>
              <div className="mt-2 text-3xl font-semibold text-emerald-900">2</div>
              <div className="text-xs text-emerald-600 mt-1">Currently online</div>
            </div>
          </div>
        </aside>
      </div>

      {/* charts removed per request */}
    </div>
  )
}
