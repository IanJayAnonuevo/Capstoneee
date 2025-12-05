import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { FiPlay, FiStopCircle, FiXCircle, FiFileText, FiArrowLeft, FiClock, FiCalendar, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import TimeInModal from '../shared/TimeInModal';
import LeaveRequestModal from '../shared/LeaveRequestModal';

export default function AttendancePage() {
    const navigate = useNavigate();
    const today = new Date().toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // Attendance state
    const [attendanceStatus, setAttendanceStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showTimeInModal, setShowTimeInModal] = useState(false);
    const [modalIntent, setModalIntent] = useState('time_in');
    const [modalAttendanceDate, setModalAttendanceDate] = useState(null);
    const [modalSession, setModalSession] = useState(null);
    const [showAbsentModal, setShowAbsentModal] = useState(false);
    const [absentReason, setAbsentReason] = useState('');
    const [absentRequirements, setAbsentRequirements] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showTimeInSuccessModal, setShowTimeInSuccessModal] = useState(false);
    const [hasSubmittedAbsence, setHasSubmittedAbsence] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [hasSubmittedLeave, setHasSubmittedLeave] = useState(false);

    // New Session Status State
    const [sessionStatus, setSessionStatus] = useState({
        am: { hasTimeIn: false, hasTimeOut: false, isVerified: false, pending: false },
        pm: { hasTimeIn: false, hasTimeOut: false, isVerified: false, pending: false }
    });

    // Time Window Constants
    const [now, setNow] = useState(new Date());

    // Morning Session
    const AM_START_HOUR = 5;
    const AM_END_HOUR = 6;

    // Afternoon Session
    const PM_START_HOUR = 13; // 1 PM
    const PM_END_HOUR = 14;   // 2 PM

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 30 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Check for pending/approved time-in requests today
    useEffect(() => {
        const checkTodayAttendance = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('user'));
                const token = localStorage.getItem('access_token');
                if (!userData?.user_id || !token) return;

                const d = new Date();
                const todayLocal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                // 1) Check attendance table
                const attendanceUrl = `${API_BASE_URL}/get_attendance.php?date=${todayLocal}&user_id=${userData.user_id}`;
                const attendanceResp = await fetch(attendanceUrl, { headers: { 'Authorization': `Bearer ${token}` } });
                const attendanceData = await attendanceResp.json();
                console.log('get_attendance API response:', attendanceData);

                // 2) Check requests table
                const reqUrl = `${API_BASE_URL}/list_attendance_requests.php?date_from=${todayLocal}&date_to=${todayLocal}`;
                const reqResp = await fetch(reqUrl, { headers: { 'Authorization': `Bearer ${token}` } });
                const reqData = await reqResp.json();
                console.log('list_attendance_requests API response:', reqData);

                // Process AM/PM status
                const newStatus = {
                    am: { hasTimeIn: false, hasTimeOut: false, isVerified: false, pending: false },
                    pm: { hasTimeIn: false, hasTimeOut: false, isVerified: false, pending: false }
                };

                if (attendanceData.success && Array.isArray(attendanceData.attendance)) {
                    attendanceData.attendance.forEach(a => {
                        if (String(a.user_id) !== String(userData.user_id)) return;
                        const sess = a.session === 'AM' ? 'am' : (a.session === 'PM' ? 'pm' : null);
                        if (sess) {
                            newStatus[sess].hasTimeIn = !!a.time_in;
                            newStatus[sess].hasTimeOut = !!a.time_out;
                            newStatus[sess].isVerified = a.verification_status === 'verified';
                        }
                    });
                }

                if (reqData.status === 'success' && Array.isArray(reqData.data?.requests)) {
                    reqData.data.requests.forEach(r => {
                        if (String(r.user_id) !== String(userData.user_id)) return;
                        if (r.request_status === 'pending') {
                            const sess = r.session === 'AM' ? 'am' : (r.session === 'PM' ? 'pm' : null);
                            if (sess) newStatus[sess].pending = true;
                        }
                    });
                }

                setSessionStatus(newStatus);
                console.log('Updated Session Status:', newStatus);

            } catch (error) {
                console.error('Error checking attendance:', error);
            }
        };

        checkTodayAttendance();
    }, []);

    // Determine current window and button state
    const currentHour = now.getHours();

    let currentWindow = 'CLOSED';
    let activeSession = null;

    // Morning Window
    if (currentHour >= AM_START_HOUR && currentHour < AM_END_HOUR) {
        currentWindow = 'AM_TIME_IN';
        activeSession = 'am';
    }
    // Afternoon Window
    else if (currentHour >= PM_START_HOUR && currentHour < PM_END_HOUR) {
        currentWindow = 'PM_TIME_IN';
        activeSession = 'pm';
    }

    // Logic for enabling buttons - only time-in is allowed
    const isTimeInEnabled = (
        (currentWindow === 'AM_TIME_IN' && !sessionStatus.am.hasTimeIn && !sessionStatus.am.pending) ||
        (currentWindow === 'PM_TIME_IN' && !sessionStatus.pm.hasTimeIn && !sessionStatus.pm.pending)
    );

    const otherButtonsEnabled = true; // Always allow absent/leave for now, or refine as needed



    // Handle absent marking - show modal
    const handleAbsent = () => {
        setShowAbsentModal(true);
        setAbsentReason('');
        setAbsentRequirements('');
    };

    // Submit absent with reason
    const submitAbsent = async () => {
        if (!absentReason.trim()) {
            setMessage({ type: 'error', text: 'Please provide a reason for absence.' });
            return;
        }

        if (!absentRequirements.trim()) {
            setMessage({ type: 'error', text: 'Please list required documents/proof.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData || !userData.user_id) {
                setMessage({ type: 'error', text: 'User not found. Please log in again.' });
                return;
            }

            const token = localStorage.getItem('access_token');
            if (!token) {
                setMessage({ type: 'error', text: 'Authentication token missing. Please log in again.' });
                return;
            }

            const currentDate = new Date();
            const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
            const hour = currentDate.getHours();
            const session = hour < 12 ? 'AM' : 'PM';

            const response = await fetch(`${API_BASE_URL}/personnel_time_in.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: userData.user_id,
                    attendance_date: formattedDate,
                    session: session,
                    action: 'absent',
                    reason: absentReason,
                    requirements: absentRequirements
                })
            });

            const data = await response.json();
            console.log('Absence API response:', data);

            if (data.success) {
                console.log('Setting showSuccessModal to true');
                setShowAbsentModal(false);
                setShowSuccessModal(true);
                setHasSubmittedAbsence(true);
                setAbsentReason('');
                setAbsentRequirements('');
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to mark absent.' });
            }
        } catch (error) {
            console.error('Absent marking error:', error);
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    // Handle leave filing
    const handleFileLeave = () => {
        setShowLeaveModal(true);
    };

    // Handle leave request success
    const handleLeaveSuccess = (data) => {
        setMessage({ type: 'success', text: 'Leave request submitted successfully! Awaiting foreman approval.' });
        setHasSubmittedLeave(true);
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Main Content Container */}
            <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
                {/* Header */}
                <div className="mb-2">
                    <h1 className="text-3xl font-semibold text-gray-800">Attendance</h1>
                    <p className="text-gray-500 mt-1">{today}</p>
                </div>

                {/* Success/Error Messages */}
                {message.text && (
                    <div className={`shadow-lg rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                        : message.type === 'info'
                            ? 'bg-blue-50 text-blue-800 border border-blue-100'
                            : 'bg-red-50 text-red-800 border border-red-100'
                        }`}>
                        {message.type === 'success' ? <FiCheckCircle className="w-5 h-5 mt-0.5 shrink-0" /> : <FiAlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
                        <div className="text-sm font-medium">{message.text}</div>
                    </div>
                )}

                {/* Attendance Menu Cards */}
                <div className="space-y-3">
                    {/* Daily Attendance */}
                    <button
                        type="button"
                        disabled={
                            currentWindow === 'CLOSED' ||
                            loading ||
                            (activeSession && sessionStatus[activeSession]?.pending) ||
                            (activeSession && sessionStatus[activeSession]?.hasTimeIn)
                        }
                        onClick={() => {
                            setModalIntent('time_in');
                            setModalSession(activeSession === 'am' ? 'AM' : 'PM');
                            setShowTimeInModal(true);
                        }}
                        className={`w-full rounded-xl shadow-sm border p-4 flex items-center gap-4 transition-all duration-200 ${currentWindow === 'CLOSED' ||
                            loading ||
                            (activeSession && sessionStatus[activeSession]?.pending) ||
                            (activeSession && sessionStatus[activeSession]?.hasTimeIn)
                            ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                            : 'bg-white hover:bg-gray-50 border-gray-200 hover:shadow-md cursor-pointer'
                            }`}
                    >
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${currentWindow === 'CLOSED' ||
                            loading ||
                            (activeSession && sessionStatus[activeSession]?.pending) ||
                            (activeSession && sessionStatus[activeSession]?.hasTimeIn)
                            ? 'bg-gray-200' : 'bg-emerald-100'
                            }`}>
                            <FiClock className={`w-6 h-6 ${currentWindow === 'CLOSED' ||
                                loading ||
                                (activeSession && sessionStatus[activeSession]?.pending) ||
                                (activeSession && sessionStatus[activeSession]?.hasTimeIn)
                                ? 'text-gray-400' : 'text-emerald-700'
                                }`} />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className={`font-semibold text-base ${currentWindow === 'CLOSED' ||
                                loading ||
                                (activeSession && sessionStatus[activeSession]?.pending) ||
                                (activeSession && sessionStatus[activeSession]?.hasTimeIn)
                                ? 'text-gray-500' : 'text-gray-900'
                                }`}>
                                Time In
                            </h3>
                            <p className="text-sm text-gray-500">
                                {activeSession && sessionStatus[activeSession]?.pending
                                    ? 'Request pending approval'
                                    : (activeSession && sessionStatus[activeSession]?.hasTimeIn)
                                        ? 'Already timed in for this session'
                                        : currentWindow === 'CLOSED'
                                            ? 'Available during time-in windows (5-6 AM, 1-2 PM)'
                                            : 'Submit time-in request with photo proof'}
                            </p>
                        </div>
                    </button>

                    {/* Attendance Verification */}
                    <button
                        type="button"
                        onClick={() => navigate('/truckdriver/attendance-verification')}
                        className="w-full bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-md"
                    >
                        <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <FiCheckCircle className="w-6 h-6 text-emerald-700" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900 text-base">Attendance Verification</h3>
                            <p className="text-sm text-gray-500">View verification status and details</p>
                        </div>
                    </button>

                    {/* Attendance Logs */}
                    <button
                        type="button"
                        onClick={() => navigate('/truckdriver/attendance-logs')}
                        className="w-full bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-md"
                    >
                        <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <FiFileText className="w-6 h-6 text-emerald-700" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900 text-base">Attendance Logs</h3>
                            <p className="text-sm text-gray-500">Review history of attendance records</p>
                        </div>
                    </button>

                    {/* Requests and Approvals */}
                    <button
                        type="button"
                        onClick={() => navigate('/truckdriver/leave-requests')}
                        className="w-full bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-md"
                    >
                        <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <FiCalendar className="w-6 h-6 text-emerald-700" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900 text-base">Requests and Approvals</h3>
                            <p className="text-sm text-gray-500">File and manage leave requests</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Success Modal */}
            {
                showSuccessModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center animate-in zoom-in-95 duration-200">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiCheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Absence Recorded!</h3>
                            <p className="text-gray-600 mb-6">
                                Your absence has been successfully recorded and is now pending foreman verification.
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                                <p className="text-sm text-blue-800">
                                    <strong>📋 Next Steps:</strong><br />
                                    • Ensure you have all required documents ready<br />
                                    • Wait for foreman verification<br />
                                    • Check back for approval status
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                            >
                                Got it, thanks!
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Absent Modal */}
            {
                showAbsentModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Mark as Absent</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reason for Absence <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={absentReason}
                                        onChange={(e) => setAbsentReason(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        rows="3"
                                        placeholder="e.g., Sick, Emergency, Personal matters"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Required Documents/Proof <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={absentRequirements}
                                        onChange={(e) => setAbsentRequirements(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        rows="3"
                                        placeholder="e.g., Medical certificate, Police report, etc."
                                    />
                                </div>
                                <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                                    📌 Note: Your absence request will be submitted to the foreman for verification. Please ensure all required documents are ready.
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAbsentModal(false)}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={submitAbsent}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Time In Success Modal */}
            {
                showTimeInSuccessModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center animate-in zoom-in-95 duration-200">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiCheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Time-In Request Submitted!</h3>
                            <p className="text-gray-600 mb-6">
                                Your attendance request has been successfully submitted and is now pending foreman approval.
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                                <p className="text-sm text-blue-800">
                                    <strong>📋 Next Steps:</strong><br />
                                    • Your request is pending verification<br />
                                    • Wait for foreman approval<br />
                                    • You'll be notified once approved<br />
                                    • Check your attendance status later
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowTimeInSuccessModal(false)}
                                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                            >
                                Got it, thanks!
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Time In Modal */}
            <TimeInModal
                isOpen={showTimeInModal}
                onClose={() => setShowTimeInModal(false)}
                userData={JSON.parse(localStorage.getItem('user') || '{}')}
                intent={modalIntent}
                attendanceDate={modalAttendanceDate}
                session={modalSession}
                onSuccess={() => {
                    setShowTimeInSuccessModal(true);
                    // Optimistically update pending status
                    const sess = activeSession;
                    if (sess) {
                        setSessionStatus(prev => ({
                            ...prev,
                            [sess]: { ...prev[sess], pending: true }
                        }));
                    }
                }}
            />

            {/* Leave Request Modal */}
            <LeaveRequestModal
                isOpen={showLeaveModal}
                onClose={() => setShowLeaveModal(false)}
                userData={JSON.parse(localStorage.getItem('user') || '{}')}
                onSuccess={handleLeaveSuccess}
            />
        </div >
    );
}
