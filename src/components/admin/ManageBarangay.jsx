import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin } from 'react-icons/fi';
import { buildApiUrl } from '../../config/api';

export default function ManageBarangay() {
    const [barangays, setBarangays] = useState([]);
    const [clusters, setClusters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCluster, setSelectedCluster] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentBarangay, setCurrentBarangay] = useState(null);
    const [formData, setFormData] = useState({
        barangay_id: '',
        barangay_name: '',
        cluster_id: '',
        latitude: '',
        longitude: ''
    });
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchBarangays();
        fetchClusters();
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchBarangays = async () => {
        try {
            const response = await fetch(buildApiUrl('get_barangays.php'), {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.success) {
                setBarangays(data.barangays);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to fetch barangays');
        } finally {
            setLoading(false);
        }
    };

    const fetchClusters = async () => {
        try {
            const response = await fetch(buildApiUrl('get_clusters.php'), {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.success) {
                setClusters(data.clusters);
            }
        } catch (err) {
            console.error('Failed to fetch clusters', err);
        }
    };

    const handleOpenModal = (barangay = null) => {
        if (barangay) {
            setCurrentBarangay(barangay);
            setFormData({
                barangay_id: barangay.barangay_id,
                barangay_name: barangay.barangay_name,
                cluster_id: barangay.cluster_id || '',
                latitude: barangay.latitude || '',
                longitude: barangay.longitude || ''
            });
        } else {
            setCurrentBarangay(null);
            setFormData({
                barangay_id: '',
                barangay_name: '',
                cluster_id: '',
                latitude: '',
                longitude: ''
            });
        }
        setError(null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (barangay) => {
        setCurrentBarangay(barangay);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const url = currentBarangay
            ? buildApiUrl('update_barangay.php')
            : buildApiUrl('create_barangay.php');

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (data.success) {
                setSuccessMessage(data.message);
                setIsModalOpen(false);
                fetchBarangays();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(buildApiUrl('delete_barangay.php'), {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ barangay_id: currentBarangay.barangay_id })
            });
            const data = await response.json();

            if (data.success) {
                setSuccessMessage(data.message);
                setIsDeleteModalOpen(false);
                fetchBarangays();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to delete barangay');
        }
    };

    const filteredBarangays = selectedCluster === 'all'
        ? barangays
        : barangays.filter(b => b.cluster_id === selectedCluster);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Filter and Add Button Row */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">🔻 Filter by Barangay:</span>
                    <select
                        value={selectedCluster}
                        onChange={(e) => setSelectedCluster(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                    >
                        <option value="all">All Barangays</option>
                        {clusters.map(cluster => (
                            <option key={cluster.cluster_id} value={cluster.cluster_id}>
                                {cluster.cluster_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-emerald-600 font-medium">
                        Total: {filteredBarangays.length} barangays
                    </span>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm font-medium"
                    >
                        <FiPlus className="w-4 h-4" /> Add Barangay
                    </button>
                </div>
            </div>

            {successMessage && (
                <div className="mb-4 bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-200 flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    {successMessage}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cluster</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Coordinates</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading barangays...</td>
                            </tr>
                        ) : filteredBarangays.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No barangays found</td>
                            </tr>
                        ) : (
                            filteredBarangays.map((barangay) => (
                                <tr key={barangay.barangay_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{barangay.barangay_id}</td>
                                    <td className="px-6 py-4 text-emerald-700 font-medium">{barangay.barangay_name}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {barangay.cluster_id || 'Unassigned'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">
                                        {barangay.latitude && barangay.longitude ? (
                                            <div className="flex items-center gap-1">
                                                <FiMapPin className="w-3 h-3 text-gray-400" />
                                                {barangay.latitude}, {barangay.longitude}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">Not set</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(barangay)}
                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                                title="Edit"
                                            >
                                                <FiEdit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(barangay)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {currentBarangay ? 'Edit Barangay' : 'Add New Barangay'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Barangay ID *</label>
                                <input
                                    type="text"
                                    required
                                    disabled={!!currentBarangay}
                                    value={formData.barangay_id}
                                    onChange={(e) => setFormData({ ...formData, barangay_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                                    placeholder="e.g., 01-ALDZ"
                                />
                                {!currentBarangay && <p className="text-xs text-gray-500 mt-1">Must be unique</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Barangay Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.barangay_name}
                                    onChange={(e) => setFormData({ ...formData, barangay_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                                    placeholder="Enter barangay name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cluster</label>
                                <select
                                    value={formData.cluster_id}
                                    onChange={(e) => setFormData({ ...formData, cluster_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                                >
                                    <option value="">Select Cluster</option>
                                    {clusters.map(cluster => (
                                        <option key={cluster.cluster_id} value={cluster.cluster_id}>
                                            {cluster.cluster_name} ({cluster.cluster_id})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                                        placeholder="13.000000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                                        placeholder="123.000000"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm text-sm font-medium"
                                >
                                    {currentBarangay ? 'Save Changes' : 'Create Barangay'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiTrash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Barangay?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Are you sure you want to delete <span className="font-medium text-gray-900">{currentBarangay?.barangay_name}</span>? This action cannot be undone.
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm text-sm font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
