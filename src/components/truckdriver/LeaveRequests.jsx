import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { FiArrowLeft, FiPlus, FiClock, FiCheckCircle, FiXCircle, FiCalendar } from 'react-icons/fi';
import LeaveRequestModal from '../shared/LeaveRequestModal';

export default function LeaveRequests() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    const fetchLeaveRequests = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('access_token');

            if (!userData?.user_id || !token) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/list_leave_requests.php`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.status === 'success' && data.data && data.data.requests) {
                const requestsArray = data.data.requests;
                const userRequests = requestsArray.filter(req =>
                    String(req.user_id) === String(userData.user_id)
                );
                setRequests(userRequests);
            }
        } catch (error) {
            console.error('Error fetching leave requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                        <FiCheckCircle className="w-4 h-4" />
                        Approved
                    </span>
                );
            case 'declined':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                        <FiXCircle className="w-4 h-4" />
                        Declined
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                        <FiXCircle className="w-4 h-4" />
                        Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                        <FiClock className="w-4 h-4" />
                        Pending
                    </span>
                );
        }
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        return req.request_status === filter;
    });

    const counts = {
        all: requests.length,
        pending: requests.filter(r => r.request_status === 'pending').length,
        approved: requests.filter(r => r.request_status === 'approved').length,
        declined: requests.filter(r => r.request_status === 'declined').length,
        cancelled: requests.filter(r => r.request_status === 'cancelled').length
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <div className="px-4 py-6 max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/truckdriver/attendance')}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <FiArrowLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-800">Leave Requests</h1>
                            <p className="text-gray-500 text-sm">Manage your leave applications</p>
                        </div>
                    </div>
                </div>

                {/* File Leave Button */}
                <button
                    onClick={() => setShowLeaveModal(true)}
                    className="w-full mb-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm p-4 flex items-center justify-center gap-2 transition-all duration-200 font-semibold"
                >
                    <FiPlus className="w-5 h-5" />
                    File Leave Request
                </button>

                {/* Filter Tabs */}
                <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'pending', label: 'Pending' },
                        { key: 'approved', label: 'Approved' },
                        { key: 'declined', label: 'Declined' },
                        { key: 'cancelled', label: 'Cancelled' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${filter === tab.key
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {tab.label} ({counts[tab.key]})
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600"></div>
                        <p className="text-gray-500 mt-3">Loading requests...</p>
                    </div>
                )}

                {/* Requests List */}
                {!loading && (
                    <div className="space-y-4">
                        {filteredRequests.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                                <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No {filter !== 'all' ? filter : ''} leave requests found</p>
                            </div>
                        ) : (
                            filteredRequests.map((request, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {request.leave_type?.replace('_', ' ').toUpperCase() || 'Leave Request'}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {new Date(request.start_date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                                {request.end_date && request.end_date !== request.start_date && (
                                                    <> - {new Date(request.end_date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}</>
                                                )}
                                            </p>
                                        </div>
                                        {getStatusBadge(request.request_status)}
                                    </div>

                                    {request.reason && (
                                        <div className="mb-3">
                                            <p className="text-sm text-gray-700">
                                                <span className="font-medium">Reason:</span> {request.reason}
                                            </p>
                                        </div>
                                    )}

                                    {request.review_note && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <p className="text-sm text-blue-800">
                                                <span className="font-medium">Foreman Remarks:</span> {request.review_note}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                                        Submitted: {new Date(request.submitted_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Leave Request Modal */}
            {showLeaveModal && (
                <LeaveRequestModal
                    isOpen={showLeaveModal}
                    onClose={() => {
                        setShowLeaveModal(false);
                        fetchLeaveRequests();
                    }}
                />
            )}
        </div>
    );
}
