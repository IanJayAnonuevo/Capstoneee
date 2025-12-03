import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import { FiClock, FiCheckCircle, FiAlertTriangle, FiFilter, FiRefreshCw, FiImage, FiCalendar, FiUser, FiMapPin, FiSearch, FiX, FiTruck, FiAlertCircle } from 'react-icons/fi';
import { MdWarning, MdLocalShipping } from 'react-icons/md';
import axios from 'axios';
import { buildApiUrl } from '../../config/api';
import Skeleton from '../shared/Skeleton';

const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem('access_token');
    } catch (err) {
        console.warn('Unable to read access token', err);
        return null;
    }
};

const getAuthHeaders = (extra = {}) => {
    const token = getAuthToken();
    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
    };
};

const API_BASE_URL = buildApiUrl();

const EMERGENCY_TYPES = [
    { value: 'all', label: 'All Types' },
    { value: 'Breakdown', label: 'Breakdown' },
    { value: 'Flat Tire', label: 'Flat Tire' },
    { value: 'Accident', label: 'Accident' },
    { value: 'Medical Emergency', label: 'Medical' },
    { value: 'Severe Weather', label: 'Weather' },
    { value: 'Other Issue', label: 'Other' },
];

const FOREMAN_ACTIONS = [
    { value: 'acknowledged', label: 'Acknowledged', description: 'Noted and monitoring the situation' },
    { value: 'resolved', label: 'Resolved', description: 'Issue has been fixed, collection resumed' },
    { value: 'escalated', label: 'Escalated', description: 'Requires higher-level intervention' },
];

export default function ForemanEmergencies() {
    const navigate = useNavigate();
    const [emergencies, setEmergencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('active');
    const [filterImpact, setFilterImpact] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmergency, setSelectedEmergency] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [resolving, setResolving] = useState(false);
    const [resolveForm, setResolveForm] = useState({
        action: 'resolved',
        notes: ''
    });
    const [userData, setUserData] = useState(null);

    const backendBaseUrl = API_BASE_URL.replace(/\/api\/?$/, '/');

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUserData(JSON.parse(storedUser));
            } else {
                const userId = localStorage.getItem('user_id');
                if (userId) {
                    setUserData({ user_id: userId });
                }
            }
        } catch (e) {
            console.error("Error parsing user data", e);
        }
    }, []);

    const buildAbsoluteUrl = useCallback((base, path) => {
        if (!base || !path) return null;
        const sanitizedBase = base.replace(/\/+$/, '');
        const sanitizedPath = path.replace(/^\/+/, '');
        return `${sanitizedBase}/${sanitizedPath}`;
    }, []);

    const resolvePhotoUrl = useCallback((rawUrl) => {
        if (!rawUrl) return null;
        const trimmed = String(rawUrl).trim();
        if (!trimmed) return null;

        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

        try {
            const parsed = new URL(trimmed);
            if (['localhost', '127.0.0.1'].includes(parsed.hostname)) {
                const sanitizedPath = parsed.pathname.replace(/^\/+/, '').replace(/^koletrash\//i, '');
                return buildAbsoluteUrl(currentOrigin, sanitizedPath);
            }
            return parsed.toString();
        } catch (error) {
            const sanitizedPath = trimmed.replace(/^(\.\/|\/)+/, '');
            return buildAbsoluteUrl(currentOrigin, sanitizedPath);
        }
    }, [buildAbsoluteUrl]);

    const fetchEmergencies = async () => {
        try {
            setLoading(true);
            setError('');

            const params = new URLSearchParams();
            if (filterStatus !== 'all') {
                params.append('status', filterStatus);
            }
            if (filterImpact !== 'all') {
                params.append('impact', filterImpact);
            }
            if (filterType !== 'all') {
                params.append('type', filterType);
            }
            if (searchTerm.trim()) {
                params.append('search', searchTerm.trim());
            }

            const response = await axios.get(`${buildApiUrl('get_route_emergencies.php')}?${params}`, {
                headers: getAuthHeaders(),
            });

            if (response.data.success) {
                setEmergencies(response.data.emergencies || []);
            } else {
                setError(response.data.message || 'Failed to fetch emergencies');
            }
        } catch (error) {
            console.error('Error fetching emergencies:', error);
            setError('Failed to fetch emergencies. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmergencies();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchEmergencies, 30000);
        return () => clearInterval(interval);
    }, [filterStatus, filterImpact, filterType, searchTerm]);

    const handleResolveEmergency = async () => {
        if (!selectedEmergency || resolving) return;

        try {
            setResolving(true);
            const userId = userData?.user_id || userData?.id || 1;

            const response = await axios.post(
                buildApiUrl('resolve_route_emergency.php'),
                {
                    log_id: selectedEmergency.id,
                    resolved_by: userId,
                    resolution_notes: resolveForm.notes,
                    foreman_action: resolveForm.action,
                },
                {
                    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                }
            );

            if (response.data.success) {
                setShowResolveModal(false);
                setSelectedEmergency(null);
                setResolveForm({ action: 'resolved', notes: '' });
                await fetchEmergencies();
                alert('Emergency ' + resolveForm.action + ' successfully!');
            } else {
                setError(response.data.message || 'Failed to resolve emergency');
            }
        } catch (error) {
            console.error('Error resolving emergency:', error);
            setError('Failed to resolve emergency. Please try again.');
        } finally {
            setResolving(false);
        }
    };

    const getStatusBadge = (emergency) => {
        if (emergency.status === 'resolved') {
            return {
                color: 'text-green-600',
                bgColor: 'bg-green-100',
                icon: FiCheckCircle,
                label: 'Resolved'
            };
        }
        return {
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            icon: FiAlertTriangle,
            label: 'Active'
        };
    };

    const getImpactBadge = (impact) => {
        if (impact === 'cancel') {
            return {
                color: 'text-red-700',
                bgColor: 'bg-red-50',
                label: 'CANCELLED'
            };
        }
        return {
            color: 'text-orange-700',
            bgColor: 'bg-orange-50',
            label: 'DELAYED'
        };
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const EmergencyDetailModal = () => {
        if (!selectedEmergency) return null;

        const statusInfo = getStatusBadge(selectedEmergency);
        const impactInfo = getImpactBadge(selectedEmergency.impact);
        const StatusIcon = statusInfo.icon;
        const attachmentUrl = selectedEmergency.attachment_path ? resolvePhotoUrl(selectedEmergency.attachment_path) : null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
                <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Emergency Details</h3>
                            <div className="flex gap-2 mt-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusInfo.label}
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${impactInfo.bgColor} ${impactInfo.color}`}>
                                    {impactInfo.label}
                                </span>
                            </div>
                        </div>
                        <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* Emergency Type */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <MdWarning className="w-6 h-6 text-red-600" />
                                <h4 className="font-bold text-red-900 text-lg">{selectedEmergency.emergency_type}</h4>
                            </div>
                            {selectedEmergency.delay_minutes && (
                                <p className="text-sm text-red-700">Estimated delay: {selectedEmergency.delay_minutes} minutes</p>
                            )}
                        </div>

                        {/* Route Information */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Route</p>
                                <p className="font-medium text-gray-900 flex items-center gap-1">
                                    <FiTruck className="w-4 h-4" />
                                    {selectedEmergency.route_name}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Barangay</p>
                                <p className="font-medium text-gray-900 flex items-center gap-1">
                                    <FiMapPin className="w-4 h-4" />
                                    {selectedEmergency.barangay_name}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Driver</p>
                                <p className="font-medium text-gray-900 flex items-center gap-1">
                                    <FiUser className="w-4 h-4" />
                                    {selectedEmergency.driver_name}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reported</p>
                                <p className="font-medium text-gray-900 flex items-center gap-1">
                                    <FiCalendar className="w-4 h-4" />
                                    {formatDate(selectedEmergency.reported_at)}
                                </p>
                            </div>
                        </div>

                        {/* Notes */}
                        {selectedEmergency.notes && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Driver Notes</p>
                                <p className="text-gray-800">{selectedEmergency.notes}</p>
                            </div>
                        )}

                        {/* Attachment */}
                        {attachmentUrl && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Evidence</p>
                                <img src={attachmentUrl} alt="Emergency evidence" className="w-full rounded-lg" onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }} />
                                <div style={{ display: 'none' }} className="text-sm text-gray-500">Image unavailable</div>
                            </div>
                        )}

                        {/* Resolution Info */}
                        {selectedEmergency.status === 'resolved' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                                    <h4 className="font-bold text-green-900">Resolution</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-medium">Action:</span> {selectedEmergency.foreman_action || 'Resolved'}</p>
                                    <p><span className="font-medium">Resolved by:</span> {selectedEmergency.resolved_by_name || 'Foreman'}</p>
                                    <p><span className="font-medium">Resolved at:</span> {formatDate(selectedEmergency.resolved_at)}</p>
                                    {selectedEmergency.resolution_notes && (
                                        <div className="mt-2 pt-2 border-t border-green-200">
                                            <p className="font-medium mb-1">Notes:</p>
                                            <p className="text-gray-700">{selectedEmergency.resolution_notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex gap-3">
                        <button
                            onClick={() => setShowDetailModal(false)}
                            className="flex-1 border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-100"
                        >
                            Close
                        </button>
                        {selectedEmergency.status === 'active' && (
                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setShowResolveModal(true);
                                }}
                                className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-green-700"
                            >
                                Resolve Emergency
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const ResolveModal = () => {
        if (!selectedEmergency) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                    <div className="p-5 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800">Resolve Emergency</h3>
                        <p className="text-sm text-gray-600 mt-1">{selectedEmergency.emergency_type} - {selectedEmergency.route_name}</p>
                    </div>

                    <div className="p-5 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                            <div className="space-y-2">
                                {FOREMAN_ACTIONS.map(action => (
                                    <label key={action.value} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="action"
                                            value={action.value}
                                            checked={resolveForm.action === action.value}
                                            onChange={(e) => setResolveForm({ ...resolveForm, action: e.target.value })}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{action.label}</p>
                                            <p className="text-xs text-gray-500">{action.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Notes</label>
                            <textarea
                                value={resolveForm.notes}
                                onChange={(e) => setResolveForm({ ...resolveForm, notes: e.target.value })}
                                placeholder="Describe what action was taken or current status..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                        <button
                            onClick={() => {
                                setShowResolveModal(false);
                                setResolveForm({ action: 'resolved', notes: '' });
                            }}
                            className="flex-1 border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleResolveEmergency}
                            disabled={resolving}
                            className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                            {resolving ? 'Processing...' : 'Confirm'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <IoChevronBack className="w-6 h-6" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <MdWarning className="w-6 h-6 text-red-600" />
                            Emergency Alerts
                        </h1>
                    </div>
                    <button
                        onClick={fetchEmergencies}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        title="Refresh"
                    >
                        <FiRefreshCw className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by route, barangay, driver..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                    />
                </div>

                {/* Filters */}
                <div className="space-y-2">
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {['all', 'active', 'resolved'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === status
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'bg-white border border-gray-200 text-gray-600'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        <select
                            value={filterImpact}
                            onChange={(e) => setFilterImpact(e.target.value)}
                            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 bg-white"
                        >
                            <option value="all">All Impacts</option>
                            <option value="delay">Delay</option>
                            <option value="cancel">Cancel</option>
                        </select>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 bg-white"
                        >
                            {EMERGENCY_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <Skeleton className="h-6 w-32 mb-3" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-3/4 mb-3" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 flex-1" />
                                    <Skeleton className="h-8 flex-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3">
                        <FiAlertCircle className="w-6 h-6 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                ) : emergencies.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiCheckCircle className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No emergencies found</h3>
                        <p className="text-gray-500 mt-1">
                            {filterStatus === 'active' ? 'All clear! No active emergencies.' : 'No emergencies match your filters.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {emergencies.map((emergency) => {
                            const statusInfo = getStatusBadge(emergency);
                            const impactInfo = getImpactBadge(emergency.impact);
                            const StatusIcon = statusInfo.icon;

                            return (
                                <div key={emergency.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-10 h-10 rounded-full ${emergency.status === 'active' ? 'bg-red-100' : 'bg-green-100'} flex items-center justify-center`}>
                                                <MdWarning className={`w-6 h-6 ${emergency.status === 'active' ? 'text-red-600' : 'text-green-600'}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{emergency.emergency_type}</p>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${impactInfo.bgColor} ${impactInfo.color}`}>
                                                    {impactInfo.label}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                                            <StatusIcon className="w-3 h-3 mr-1" />
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    <div className="mb-3 flex-1 space-y-1">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FiTruck className="w-3 h-3 mr-1.5" />
                                            {emergency.route_name}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FiMapPin className="w-3 h-3 mr-1.5" />
                                            {emergency.barangay_name}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FiUser className="w-3 h-3 mr-1.5" />
                                            {emergency.driver_name}
                                        </div>
                                        {emergency.notes && (
                                            <p className="text-sm text-gray-500 line-clamp-2 mt-2">{emergency.notes}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                                        <span className="text-xs text-gray-400 flex items-center">
                                            <FiCalendar className="w-3 h-3 mr-1" />
                                            {formatDate(emergency.reported_at)}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedEmergency(emergency);
                                                    setShowDetailModal(true);
                                                }}
                                                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                                            >
                                                View
                                            </button>
                                            {emergency.status === 'active' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedEmergency(emergency);
                                                        setShowResolveModal(true);
                                                    }}
                                                    className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                                                >
                                                    Resolve
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showDetailModal && <EmergencyDetailModal />}
            {showResolveModal && <ResolveModal />}
        </div>
    );
}
