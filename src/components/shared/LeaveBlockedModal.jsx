import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import { FiAlertCircle, FiX, FiCalendar, FiClock } from 'react-icons/fi';

export default function LeaveBlockedModal({ leaveDetails, onCancel, onClose }) {
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState('');

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const calculateDuration = () => {
        const start = new Date(leaveDetails.start_date);
        const end = new Date(leaveDetails.end_date);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const handleCancelLeave = async () => {
        setCancelling(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/cancel_leave.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    leave_request_id: leaveDetails.leave_request_id,
                    username: leaveDetails.username
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                if (onCancel) {
                    onCancel();
                }
            } else {
                setError(data.message || 'Failed to cancel leave');
            }
        } catch (err) {
            console.error('Cancel leave error:', err);
            setError('Network error. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header with emerald gradient */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <FiX className="w-6 h-6" />
                    </button>

                    <div className="flex flex-col items-center text-center text-white">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border-2 border-white/30">
                            <FiAlertCircle className="w-12 h-12" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            Account on Leave
                        </h2>
                        <p className="text-emerald-50 text-sm">
                            This account is currently on approved leave
                        </p>
                    </div>
                </div>

                {/* Leave Details */}
                <div className="p-6 space-y-4">
                    {/* Leave Type Card */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                                <FiCalendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Leave Type</p>
                                <p className="text-lg font-bold text-emerald-900 capitalize">
                                    {leaveDetails.leave_type?.replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Duration Card */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                                <FiClock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Duration</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {calculateDuration()} day{calculateDuration() > 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-700 font-medium">
                                {formatDate(leaveDetails.start_date)} - {formatDate(leaveDetails.end_date)}
                            </p>
                        </div>
                    </div>

                    {/* Reason */}
                    {leaveDetails.reason && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-2">Reason</p>
                            <p className="text-sm text-gray-700">{leaveDetails.reason}</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Info Message */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-blue-700 text-xs leading-relaxed">
                            💡 You can cancel your leave to regain access to your account, or wait until the leave period ends.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 border border-gray-300"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleCancelLeave}
                            disabled={cancelling}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            {cancelling ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Cancelling...
                                </span>
                            ) : (
                                'Cancel Leave'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
