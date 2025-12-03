import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { FiCheckCircle, FiXCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

export default function AttendanceVerification() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [filter, setFilter] = useState('all'); // all, pending, approved, declined

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('access_token');

            if (!userData?.user_id || !token) {
                setMessage({ type: 'error', text: 'Authentication required' });
                return;
            }

            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            const response = await fetch(
                `${API_BASE_URL}/list_attendance_requests.php?date_from=${dateStr}&date_to=${dateStr}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (data.status === 'success' && Array.isArray(data.data?.requests)) {
                // Filter only user's own requests (all statuses)
                const userRequests = data.data.requests.filter(
                    req => String(req.user_id) === String(userData.user_id)
                );
                setRequests(userRequests);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            setMessage({ type: 'error', text: 'Failed to load verification requests' });
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">Pending</span>;
            case 'approved':
                return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">Approved</span>;
            case 'declined':
                return <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">Declined</span>;
            default:
                return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">{status}</span>;
        }
    };

    // Filter requests based on selected filter
    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        return req.request_status === filter;
    });

    // Count by status
    const counts = {
        all: requests.length,
        pending: requests.filter(r => r.request_status === 'pending').length,
        approved: requests.filter(r => r.request_status === 'approved').length,
        declined: requests.filter(r => r.request_status === 'declined').length
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Main Content */}
            <div className="px-4 py-6 max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold text-gray-800">Attendance Verification</h1>
                    <p className="text-gray-500 mt-1">View verification status and details</p>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${filter === 'all'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        All ({counts.all})
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${filter === 'pending'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        Pending ({counts.pending})
                    </button>
                    <button
                        onClick={() => setFilter('approved')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${filter === 'approved'
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        Approved ({counts.approved})
                    </button>
                    <button
                        onClick={() => setFilter('declined')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${filter === 'declined'
                                ? 'bg-red-500 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        Declined ({counts.declined})
                    </button>
                </div>

                {/* Messages */}
                {message.text && (
                    <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                            : 'bg-red-50 text-red-800 border border-red-100'
                        }`}>
                        {message.type === 'success' ? <FiCheckCircle className="w-5 h-5 mt-0.5" /> : <FiAlertCircle className="w-5 h-5 mt-0.5" />}
                        <div className="text-sm font-medium">{message.text}</div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600"></div>
                        <p className="text-gray-500 mt-3">Loading requests...</p>
                    </div>
                )}

                {/* No Requests */}
                {!loading && filteredRequests.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiCheckCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No {filter !== 'all' ? filter : ''} Requests</h3>
                        <p className="text-gray-500">
                            {filter === 'all'
                                ? "You don't have any attendance requests today."
                                : `You don't have any ${filter} requests today.`
                            }
                        </p>
                    </div>
                )}

                {/* Requests List */}
                {!loading && filteredRequests.length > 0 && (
                    <div className="space-y-3">
                        {filteredRequests.map((request) => (
                            <div
                                key={request.request_id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900 text-base">
                                                {request.request_type === 'time_in' ? 'Time In' : 'Time Out'}
                                            </h3>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-sm font-medium text-gray-600">{request.session}</span>
                                        </div>
                                        <p className="text-sm text-gray-500">{formatDate(request.attendance_date)}</p>
                                    </div>
                                    {getStatusBadge(request.request_status)}
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                    <FiClock className="w-4 h-4" />
                                    <span>{formatTime(request.request_time)}</span>
                                </div>

                                {request.remarks && !request.remarks.startsWith('{') && (
                                    <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">Remarks:</p>
                                        <p className="text-sm text-gray-700">{request.remarks}</p>
                                    </div>
                                )}

                                {request.request_status === 'pending' && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FiClock className="w-3 h-3" />
                                            Waiting for foreman approval
                                        </p>
                                    </div>
                                )}

                                {request.request_status === 'approved' && (
                                    <div className="pt-3 border-t border-emerald-100">
                                        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                            <FiCheckCircle className="w-3 h-3" />
                                            Approved by foreman
                                        </p>
                                    </div>
                                )}

                                {request.request_status === 'declined' && (
                                    <div className="pt-3 border-t border-red-100">
                                        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                                            <FiXCircle className="w-3 h-3" />
                                            Declined by foreman
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
