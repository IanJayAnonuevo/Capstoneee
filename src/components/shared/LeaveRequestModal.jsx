import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import { FiX, FiUpload } from 'react-icons/fi';

export default function LeaveRequestModal({ isOpen, onClose, userData, onSuccess }) {
    const [leaveType, setLeaveType] = useState('personal');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const leaveTypes = [
        { value: 'sick', label: 'Sick Leave' },
        { value: 'vacation', label: 'Vacation Leave' },
        { value: 'emergency', label: 'Emergency Leave' },
        { value: 'personal', label: 'Personal Leave' },
        { value: 'bereavement', label: 'Bereavement Leave' },
        { value: 'other', label: 'Other' }
    ];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setDocument(file);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!startDate || !endDate || !reason.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            setError('End date cannot be before start date');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Authentication token missing. Please log in again.');
            }

            const formData = new FormData();
            formData.append('leave_type', leaveType);
            formData.append('start_date', startDate);
            formData.append('end_date', endDate);
            formData.append('reason', reason);

            if (document) {
                formData.append('document', document);
            }

            const response = await fetch(`${API_BASE_URL}/submit_leave_request.php`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.status === 'success') {
                setLeaveType('personal');
                setStartDate('');
                setEndDate('');
                setReason('');
                setDocument(null);

                if (onSuccess) {
                    onSuccess(data);
                }

                onClose();
            } else {
                setError(data.message || 'Failed to submit leave request');
            }
        } catch (err) {
            console.error('Leave request error:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setLeaveType('personal');
            setStartDate('');
            setEndDate('');
            setReason('');
            setDocument(null);
            setError('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
                    <h3 className="text-xl font-bold text-gray-900">File Leave Request</h3>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Leave Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Leave Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={leaveType}
                            onChange={(e) => setLeaveType(e.target.value)}
                            disabled={loading}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        >
                            {leaveTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                disabled={loading}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                disabled={loading}
                                min={startDate || new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                required
                            />
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Reason for Leave <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={loading}
                            rows="4"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                            placeholder="Please provide details about your leave request..."
                            required
                        />
                    </div>

                    {/* Document Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Supporting Document (Optional)
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                disabled={loading}
                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                className="hidden"
                                id="document-upload"
                            />
                            <label
                                htmlFor="document-upload"
                                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                            >
                                <FiUpload className="w-5 h-5 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600">
                                    {document ? document.name : 'Click to upload (Max 10MB)'}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                            <strong>📋 Note:</strong> Your request will be sent to the foreman for approval. You'll be notified once reviewed.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
