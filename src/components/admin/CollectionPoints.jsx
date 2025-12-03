import { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaFilter } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { buildApiUrl } from '../../config/api'

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icon for collection points
const collectionPointIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token')
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
}

export default function CollectionPoints() {
    const [points, setPoints] = useState([])
    const [barangays, setBarangays] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showMapModal, setShowMapModal] = useState(false)
    const [selectedPoint, setSelectedPoint] = useState(null)
    const [filterBarangay, setFilterBarangay] = useState('')
    const [formData, setFormData] = useState({
        barangay_id: '',
        location_name: '',
        latitude: '',
        longitude: '',
        is_mrf: false,
        geofence_radius: 50
    })

    useEffect(() => {
        fetchBarangays()
        fetchPoints()
    }, [filterBarangay])

    const fetchBarangays = async () => {
        try {
            const response = await fetch(buildApiUrl('get_barangays.php'), {
                headers: getAuthHeaders()
            })
            const data = await response.json()
            if (data.success) {
                setBarangays(data.barangays)
            }
        } catch (error) {
            console.error('Error fetching barangays:', error)
            toast.error('Failed to load barangays')
        }
    }

    const fetchPoints = async () => {
        try {
            setLoading(true)
            const url = filterBarangay
                ? `${buildApiUrl('get_collection_points.php')}?barangay_id=${filterBarangay}`
                : buildApiUrl('get_collection_points.php')

            const response = await fetch(url, {
                headers: getAuthHeaders()
            })
            const data = await response.json()

            if (data.success) {
                setPoints(data.points)
            } else {
                toast.error('Failed to load collection points')
            }
        } catch (error) {
            console.error('Error fetching points:', error)
            toast.error('Failed to load collection points')
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (point = null) => {
        if (point) {
            setSelectedPoint(point)
            setFormData({
                barangay_id: point.barangay_id,
                location_name: point.location_name,
                latitude: point.latitude,
                longitude: point.longitude,
                is_mrf: point.is_mrf,
                geofence_radius: point.geofence_radius
            })
        } else {
            setSelectedPoint(null)
            setFormData({
                barangay_id: '',
                location_name: '',
                latitude: '',
                longitude: '',
                is_mrf: false,
                geofence_radius: 50
            })
        }
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setSelectedPoint(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const url = selectedPoint
                ? buildApiUrl('update_collection_point.php')
                : buildApiUrl('add_collection_point.php')

            const payload = selectedPoint
                ? { point_id: selectedPoint.point_id, ...formData }
                : formData

            const response = await fetch(url, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (data.success) {
                toast.success(data.message)
                handleCloseModal()
                fetchPoints()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error saving point:', error)
            toast.error('Failed to save collection point')
        }
    }

    const handleDelete = async () => {
        if (!selectedPoint) return

        try {
            const response = await fetch(buildApiUrl('delete_collection_point.php'), {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ point_id: selectedPoint.point_id })
            })

            const data = await response.json()

            if (data.success) {
                toast.success(data.message)
                setShowDeleteModal(false)
                setSelectedPoint(null)
                fetchPoints()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error deleting point:', error)
            toast.error('Failed to delete collection point')
        }
    }

    const handleOpenDeleteModal = (point) => {
        setSelectedPoint(point)
        setShowDeleteModal(true)
    }

    const handleRowClick = (point) => {
        setSelectedPoint(point)
        setShowMapModal(true)
    }

    return (
        <div className="p-6 bg-emerald-50 min-h-screen">
            {/* Header removed - using App.jsx header */}
            <div className="mb-6 flex items-center justify-end">
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    <FaPlus /> Add Collection Point
                </button>
            </div>

            {/* Filter */}
            <div className="mb-4 bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3">
                    <FaFilter className="text-emerald-600" />
                    <label className="text-sm font-medium text-emerald-900">Filter by Barangay:</label>
                    <select
                        value={filterBarangay}
                        onChange={(e) => setFilterBarangay(e.target.value)}
                        className="px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="">All Barangays</option>
                        {barangays.map((b) => (
                            <option key={b.barangay_id} value={b.barangay_id}>
                                {b.barangay_name}
                            </option>
                        ))}
                    </select>
                    <span className="ml-auto text-sm text-emerald-700">
                        Total: <strong>{points.length}</strong> collection points
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-emerald-700">Loading...</div>
                ) : points.length === 0 ? (
                    <div className="p-8 text-center text-emerald-700">No collection points found</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-emerald-100 border-b border-emerald-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">Location</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">Barangay</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">Coordinates</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">Type</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-emerald-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-100">
                            {points.map((point) => (
                                <tr
                                    key={point.point_id}
                                    onClick={() => handleRowClick(point)}
                                    className="hover:bg-emerald-50 transition-colors cursor-pointer"
                                >
                                    <td className="px-4 py-3 text-sm text-emerald-900">{point.location_name}</td>
                                    <td className="px-4 py-3 text-sm text-emerald-700">{point.barangay_name}</td>
                                    <td className="px-4 py-3 text-sm text-emerald-700 font-mono">
                                        {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-emerald-700">
                                        {point.is_mrf ? (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">MRF</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Regular</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleOpenModal(point); }}
                                                className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(point); }}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-emerald-100 px-6 py-4">
                            <h2 className="text-xl font-bold text-emerald-900">
                                {selectedPoint ? 'Edit Collection Point' : 'Add Collection Point'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-emerald-900 mb-1">
                                    Barangay <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.barangay_id}
                                    onChange={(e) => setFormData({ ...formData, barangay_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                >
                                    <option value="">Select Barangay</option>
                                    {barangays.map((b) => (
                                        <option key={b.barangay_id} value={b.barangay_id}>
                                            {b.barangay_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-emerald-900 mb-1">
                                    Location Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.location_name}
                                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="e.g., Corner of Main St. and 1st Ave."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-emerald-900 mb-1">
                                        Latitude <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                        className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="14.5995"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-emerald-900 mb-1">
                                        Longitude <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                        className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="120.9842"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_mrf"
                                    checked={formData.is_mrf}
                                    onChange={(e) => setFormData({ ...formData, is_mrf: e.target.checked })}
                                    className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                                />
                                <label htmlFor="is_mrf" className="text-sm font-medium text-emerald-900">
                                    This is a Material Recovery Facility (MRF)
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    {selectedPoint ? 'Update' : 'Add'} Collection Point
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-red-600 mb-4">Delete Collection Point</h2>
                        <p className="text-emerald-900 mb-6">
                            Are you sure you want to delete <strong>{selectedPoint?.location_name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Map Modal */}
            {showMapModal && selectedPoint && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="sticky top-0 bg-white border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-emerald-900">{selectedPoint.location_name}</h2>
                                <p className="text-sm text-emerald-700">{selectedPoint.barangay_name}</p>
                            </div>
                            <button
                                onClick={() => setShowMapModal(false)}
                                className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-4 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-emerald-700">Coordinates</p>
                                    <p className="font-mono text-sm">{selectedPoint.latitude.toFixed(6)}, {selectedPoint.longitude.toFixed(6)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-700">Type</p>
                                    <p className="text-sm">{selectedPoint.is_mrf ? 'Material Recovery Facility (MRF)' : 'Regular Collection Point'}</p>
                                </div>
                            </div>

                            {/* Leaflet Map */}
                            <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
                                <MapContainer
                                    center={[selectedPoint.latitude, selectedPoint.longitude]}
                                    zoom={17}
                                    style={{ height: '100%', width: '100%' }}
                                    scrollWheelZoom={true}
                                    className="z-0"
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker
                                        position={[selectedPoint.latitude, selectedPoint.longitude]}
                                        icon={collectionPointIcon}
                                    >
                                        <Popup>
                                            <div className="p-1">
                                                <h4 className="text-base font-semibold text-gray-900 mb-2">{selectedPoint.location_name}</h4>
                                                <div className="text-sm space-y-1">
                                                    <p className="text-gray-600">
                                                        <span className="font-medium text-gray-900">Barangay:</span> {selectedPoint.barangay_name}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        <span className="font-medium text-gray-900">Type:</span> {selectedPoint.is_mrf ? 'MRF' : 'Regular'}
                                                    </p>
                                                    <p className="text-gray-600 font-mono text-xs">
                                                        {selectedPoint.latitude.toFixed(6)}, {selectedPoint.longitude.toFixed(6)}
                                                    </p>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
