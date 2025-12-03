import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const startIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const endIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const intermediateIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to auto-fit map bounds to route
function FitBounds({ positions }) {
    const map = useMap();

    useEffect(() => {
        if (positions && positions.length > 0) {
            const bounds = L.latLngBounds(positions);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [positions, map]);

    return null;
}

const RouteMap = ({ routeDetails, height = '600px' }) => {
    const defaultCenter = [13.7701, 122.9762]; // Philippines center
    const defaultZoom = 13;

    // Extract positions from route stops
    const positions = routeDetails?.stops?.map(stop => [stop.lat, stop.lng]) || [];
    const hasRoute = positions.length > 0;

    // Get marker icon based on position
    const getMarkerIcon = (index, totalStops) => {
        if (index === 0) return startIcon;
        if (index === totalStops - 1) return endIcon;
        return intermediateIcon;
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case 'visited':
                return '#10b981'; // emerald-500
            case 'pending':
                return '#3b82f6'; // blue-500
            case 'skipped':
                return '#ef4444'; // red-500
            default:
                return '#6b7280'; // gray-500
        }
    };

    return (
        <div className="w-full rounded-xl overflow-hidden bg-gray-50" style={{ height }}>
            {!hasRoute ? (
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                    <div className="text-center p-10">
                        <svg className="w-20 h-20 mx-auto mb-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <h3 className="text-2xl font-semibold mb-2">No Route Selected</h3>
                        <p className="text-emerald-50 text-base">Select a route from the table to view it on the map</p>
                    </div>
                </div>
            ) : (
                <MapContainer
                    center={defaultCenter}
                    zoom={defaultZoom}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                    className="z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Route polyline */}
                    <Polyline
                        positions={positions}
                        color="#10b981"
                        weight={4}
                        opacity={0.7}
                    />

                    {/* Markers for each stop */}
                    {routeDetails.stops.map((stop, index) => (
                        <Marker
                            key={stop.id}
                            position={[stop.lat, stop.lng]}
                            icon={getMarkerIcon(index, routeDetails.stops.length)}
                        >
                            <Popup className="rounded-lg">
                                <div className="p-1">
                                    <h4 className="text-base font-semibold text-gray-900 mb-2">{stop.name}</h4>
                                    <div className="text-sm space-y-1">
                                        <p className="text-gray-600">
                                            <span className="font-medium text-gray-900">Sequence:</span> {stop.seq}
                                        </p>
                                        <p className="text-gray-600 flex items-center">
                                            <span className="font-medium text-gray-900 mr-2">Status:</span>
                                            <span
                                                className="inline-block w-2 h-2 rounded-full mr-1.5"
                                                style={{ backgroundColor: getStatusColor(stop.status) }}
                                            ></span>
                                            <span className="capitalize">{stop.status}</span>
                                        </p>
                                        {stop.window_start && (
                                            <p className="text-gray-600">
                                                <span className="font-medium text-gray-900">Window:</span> {stop.window_start} - {stop.window_end}
                                            </p>
                                        )}
                                        {stop.planned_volume_kg && (
                                            <p className="text-gray-600">
                                                <span className="font-medium text-gray-900">Planned Volume:</span> {stop.planned_volume_kg} kg
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Auto-fit bounds to route */}
                    <FitBounds positions={positions} />
                </MapContainer>
            )}
        </div>
    );
};

export default RouteMap;
