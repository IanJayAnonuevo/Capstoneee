import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { FiCalendar, FiUser, FiFileText, FiCheck, FiX, FiClock, FiDownload } from 'react-icons/fi';

export default function ForemanLeaveRequests() {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [reviewingId, setReviewingId] = useState(null);
    const [reviewNote, setReviewNote] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const leaveTypeLabels = {
        sick: 'Sick Leave',
        vacation: 'Vacation Leave',
        emergency: 'Emergency Leave',
        personal: 'Personal Leave',
        bereavement: 'Bereavement Leave',
        other: 'Other'
    };

    useEffect(() => {
        fetchLeaveRequests();
    }, [filter]);

    const fetchLeaveRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Authentication token missing');
            }

            const url = `${API_BASE_URL}/list_leave_requests.php?status=${filter}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.status === 'success') {
                setLeaveRequests(data.data.requests || []);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to fetch leave requests' });
            }
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (requestId, decision) => {
        setReviewingId(requestId);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Authentication token missing');
            }

            const response = await fetch(`${API_BASE_URL}/review_leave_request.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    request_id: requestId,
                    decision: decision,
                    review_note: reviewNote || null
                })
            });

            const data = await response.json();
            if (data.status === 'success') {
                setMessage({
                    type: 'success',
                    text: `Leave request ${decision === 'approved' ? 'approved' : 'declined'} successfully!`
                });
                setReviewNote('');
                fetchLeaveRequests(); // Refresh the list
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to review leave request' });
            }
        } catch (error) {
            console.error('Error reviewing leave request:', error);
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setReviewingId(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const calculateDays = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    return (
        <div className="flex-1 bg-gray-50 px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Leave Requests</h1>
                <p className="text-sm text-gray-600">Review and manage leave requests from personnel</p>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`mb-4 p-3 rounded-lg border ${message.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2 border-b border-gray-200">
                {['pending', 'approved', 'declined'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 font-medium text-sm capitalize transition-colors ${filter === status
                                ? 'text-emerald-600 border-b-2 border-emerald-600'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
            ) : leaveRequests.length === 0 ? (
                <div className="text-center py-12">
                    <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No {filter} leave requests found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {leaveRequests.map((request) => (
                        <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <FiUser className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{request.personnel_name}</h3>
                                        <p className="text-sm text-gray-600">{request.role_name}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${request.request_status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : request.request_status === 'approved'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                    {request.request_status.charAt(0).toUpperCase() + request.request_status.slice(1)}
                                </span>
                            </div>

                            {/* Leave Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <FiFileText className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Type:</span>
                                    <span className="font-medium text-gray-800">{leaveTypeLabels[request.leave_type] || request.leave_type}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <FiClock className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Duration:</span>
                                    <span className="font-medium text-gray-800">{calculateDays(request.start_date, request.end_date)} day(s)</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <FiCalendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">From:</span>
                                    <span className="font-medium text-gray-800">{formatDate(request.start_date)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <FiCalendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">To:</span>
                                    <span className="font-medium text-gray-800">{formatDate(request.end_date)}</span>
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{request.reason}</p>
                            </div>

                            {/* Document */}
                            {request.document_path && (
                                <div className="mb-4">
                                    <a
                                        href={`${window.location.origin}/${request.document_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                                    >
                                        <FiDownload className="w-4 h-4" />
                                        View Supporting Document
                                    </a>
                                </div>
                            )}

                            {/* Review Section (only for pending requests) */}
                            {request.request_status === 'pending' && (
                                <div className="border-t border-gray-200 pt-4">
                                    <textarea
                                        value={reviewNote}
                                        onChange={(e) => setReviewNote(e.target.value)}
                                        placeholder="Add a review note (optional)..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        rows="2"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleReview(request.id, 'approved')}
                                            disabled={reviewingId === request.id}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                        >
                                            <FiCheck className="w-4 h-4" />
                                            {reviewingId === request.id ? 'Processing...' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => handleReview(request.id, 'declined')}
                                            disabled={reviewingId === request.id}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                        >
                                            <FiX className="w-4 h-4" />
                                            {reviewingId === request.id ? 'Processing...' : 'Decline'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Review Info (for reviewed requests) */}
                            {request.request_status !== 'pending' && (
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <div>
                                            <span className="text-gray-600">Reviewed by:</span>
                                            <span className="font-medium text-gray-800 ml-2">{request.foreman_name || 'Unknown'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">On:</span>
                                            <span className="font-medium text-gray-800 ml-2">{formatDate(request.reviewed_at)}</span>
                                        </div>
                                    </div>
                                    {request.review_note && (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Note:</span> {request.review_note}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
