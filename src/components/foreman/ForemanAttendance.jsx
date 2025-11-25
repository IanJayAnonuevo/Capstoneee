import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { MdPrint, MdFileDownload, MdCheckCircle, MdCancel, MdPending, MdAccessTime, MdImage, MdRefresh, MdDateRange, MdEventNote, MdFactCheck } from 'react-icons/md';
import { API_BASE_URL } from '../../config/api';
import { authService } from '../../services/authService';

export default function ForemanAttendance() {
  const navigate = useNavigate();

  // Navigation State
  const [view, setView] = useState('menu'); // 'menu', 'today', 'verification', 'history_months', 'history_calendar', 'daily_detail', 'leave_requests'

  const getLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11

  // Data State
  const [attendanceSheet, setAttendanceSheet] = useState({ attendance: [], personnel: [], summary: null });
  const [verificationData, setVerificationData] = useState([]);
  const [leaveData, setLeaveData] = useState([]); // Placeholder for leave requests
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // --- Data Fetching ---

  const fetchAttendanceSheet = async (date) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/get_attendance.php?date=${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAttendanceSheet({
          attendance: data.attendance,
          personnel: data.personnel,
          summary: data.summary
        });
      } else {
        console.error('Failed to fetch attendance sheet:', data.message);
      }
    } catch (error) {
      console.error('Error fetching attendance sheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationRequests = async (status = 'pending') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const url = `${API_BASE_URL}/list_attendance_requests.php?status=${status}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setVerificationData(data.data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching verification requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveRequests = async () => {
    // Placeholder for fetching leave requests
    // Currently no endpoint provided for leave requests
    setLoading(true);
    setTimeout(() => {
      setLeaveData([]); // Mock empty data
      setLoading(false);
    }, 500);
  };

  // --- Effects ---

  useEffect(() => {
    if (view === 'today' || view === 'daily_detail') {
      fetchAttendanceSheet(selectedDate);
    } else if (view === 'verification') {
      fetchVerificationRequests('pending');
    } else if (view === 'leave_requests') {
      fetchLeaveRequests();
    }
  }, [view, selectedDate]);

  // --- Handlers ---

  const handleBack = () => {
    if (view === 'menu') {
      navigate(-1);
    } else if (view === 'history_calendar') {
      setView('history_months');
    } else if (view === 'daily_detail') {
      setView('history_calendar');
    } else {
      setView('menu');
    }
  };

  const handleReview = async (requestId, decision, personName) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/review_attendance_request.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ request_id: requestId, decision })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setMessage({ type: 'success', text: `${personName} ${decision} successfully` });
        fetchVerificationRequests('pending'); // Refresh list
        setShowPhotoModal(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const resolvePhotoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return authService.resolveAssetUrl(path);
  };

  // --- Render Helpers ---

  const formatTime = (time) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  // --- Views ---

  const renderMenu = () => (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-800">Attendance Monitoring</h1>
        <p className="text-gray-600">Monitor drivers and collectors attendance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Today's Attendance */}
        <div
          onClick={() => {
            setSelectedDate(getLocalDate());
            setView('today');
          }}
          className="bg-[#008F53] rounded-xl p-4 text-white shadow-md relative overflow-hidden cursor-pointer active:scale-95 transition-transform flex flex-col items-center text-center justify-center aspect-square"
        >
          <div className="bg-white/20 p-3 rounded-full mb-2">
            <MdAccessTime className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-sm leading-tight mb-1">Today's Attendance</h2>
          <p className="text-green-100 text-[10px] leading-tight">Track who's here today</p>
        </div>

        {/* Attendance Verification */}
        <div
          onClick={() => setView('verification')}
          className="bg-[#008F53] rounded-xl p-4 text-white shadow-md relative overflow-hidden cursor-pointer active:scale-95 transition-transform flex flex-col items-center text-center justify-center aspect-square"
        >
          <div className="bg-white/20 p-3 rounded-full mb-2">
            <MdFactCheck className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-sm leading-tight mb-1">Verification Requests</h2>
          <p className="text-green-100 text-[10px] leading-tight">Verify time-in photos</p>
        </div>

        {/* Past Attendance */}
        <div
          onClick={() => setView('history_months')}
          className="bg-[#008F53] rounded-xl p-4 text-white shadow-md relative overflow-hidden cursor-pointer active:scale-95 transition-transform flex flex-col items-center text-center justify-center aspect-square"
        >
          <div className="bg-white/20 p-3 rounded-full mb-2">
            <MdDateRange className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-sm leading-tight mb-1">Past Attendance</h2>
          <p className="text-green-100 text-[10px] leading-tight">Browse history</p>
        </div>

        {/* Requests and Approvals */}
        <div
          onClick={() => setView('leave_requests')}
          className="bg-[#008F53] rounded-xl p-4 text-white shadow-md relative overflow-hidden cursor-pointer active:scale-95 transition-transform flex flex-col items-center text-center justify-center aspect-square"
        >
          <div className="bg-white/20 p-3 rounded-full mb-2">
            <MdEventNote className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-sm leading-tight mb-1">Leave Requests</h2>
          <p className="text-green-100 text-[10px] leading-tight">Manage approvals</p>
        </div>
      </div>
    </div>
  );

  const renderDailyView = (title) => {
    const { personnel, attendance, summary } = attendanceSheet;

    const getRecord = (userId, session) => {
      return attendance.find(r => String(r.user_id) === String(userId) && r.session === session);
    };

    return (
      <div className="p-3 max-w-full mx-auto">
        <div className="mb-3">
          <button onClick={handleBack} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-2">
            <IoChevronBack className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="bg-[#008F53] text-white p-4 rounded-t-lg">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold">Attendance Monitoring</h1>
                <h2 className="text-lg font-semibold opacity-90">{title}</h2>
                <p className="text-sm opacity-80 mt-1">
                  DATE: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
                </p>
              </div>
              <MdCheckCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-white border-x border-b border-gray-200 p-4 rounded-b-lg shadow-sm">
            {/* Status Legend */}
            <div className="flex gap-4 mb-4 text-xs font-medium text-gray-700">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500"></span> Present
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500"></span> Absent
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span> On-leave
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th rowSpan="2" className="border border-gray-300 p-2 text-left w-1/4">Name of Worker</th>
                    <th rowSpan="2" className="border border-gray-300 p-2 text-center w-1/6">Designation</th>
                    <th colSpan="2" className="border border-gray-300 p-2 text-center">Morning</th>
                    <th colSpan="2" className="border border-gray-300 p-2 text-center">Afternoon</th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-1 text-center w-[10%]">IN</th>
                    <th className="border border-gray-300 p-1 text-center w-[10%]">OUT</th>
                    <th className="border border-gray-300 p-1 text-center w-[10%]">IN</th>
                    <th className="border border-gray-300 p-1 text-center w-[10%]">OUT</th>
                  </tr>
                </thead>
                <tbody>
                  {personnel.map(person => {
                    const amRecord = getRecord(person.user_id, 'AM');
                    const pmRecord = getRecord(person.user_id, 'PM');

                    return (
                      <tr key={person.user_id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 font-medium">
                          {person.firstname} {person.lastname}
                        </td>
                        <td className="border border-gray-300 p-2 text-center text-gray-600">
                          {person.designation}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {amRecord?.time_in ? formatTime(amRecord.time_in) : ''}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {amRecord?.time_out ? formatTime(amRecord.time_out) : ''}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {pmRecord?.time_in ? formatTime(pmRecord.time_in) : ''}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {pmRecord?.time_out ? formatTime(pmRecord.time_out) : ''}
                        </td>
                      </tr>
                    );
                  })}
                  {personnel.length === 0 && (
                    <tr>
                      <td colSpan="6" className="border border-gray-300 p-4 text-center text-gray-500">
                        No personnel found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary Table */}
            <div className="mt-6">
              <h3 className="text-sm font-bold text-gray-800 mb-2">Summary</h3>
              <table className="w-full border-collapse border border-gray-800 text-xs text-center">
                <thead>
                  <tr>
                    <th rowSpan="2" className="border border-gray-800 p-2 bg-gray-50">Status</th>
                    <th colSpan="2" className="border border-gray-800 p-2 bg-gray-50">Driver</th>
                    <th colSpan="2" className="border border-gray-800 p-2 bg-gray-50">Collector</th>
                  </tr>
                  <tr>
                    <th className="border border-gray-800 p-1 bg-gray-50">AM</th>
                    <th className="border border-gray-800 p-1 bg-gray-50">PM</th>
                    <th className="border border-gray-800 p-1 bg-gray-50">AM</th>
                    <th className="border border-gray-800 p-1 bg-gray-50">PM</th>
                  </tr>
                </thead>
                <tbody>
                  {['Present', 'Absent', 'On-leave'].map(statusLabel => {
                    const key = statusLabel.toLowerCase().replace('-', '_');
                    const s = summary || { driver: { am: {}, pm: {} }, collector: { am: {}, pm: {} } };

                    return (
                      <tr key={key}>
                        <td className="border border-gray-800 p-2 font-medium text-left pl-4">
                          Total {statusLabel}
                        </td>
                        <td className="border border-gray-800 p-2">{s?.driver?.am?.[key] || 0}</td>
                        <td className="border border-gray-800 p-2">{s?.driver?.pm?.[key] || 0}</td>
                        <td className="border border-gray-800 p-2">{s?.collector?.am?.[key] || 0}</td>
                        <td className="border border-gray-800 p-2">{s?.collector?.pm?.[key] || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => window.print()} className="bg-[#008F53] text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-green-700 transition-colors">
                <MdPrint className="w-4 h-4" />
                Print
              </button>
              <button onClick={() => alert('Exporting...')} className="bg-[#008F53] text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-green-700 transition-colors">
                <MdFileDownload className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHistoryMonths = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
      <div className="p-3 max-w-full mx-auto">
        <div className="mb-3">
          <button onClick={handleBack} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-2">
            <IoChevronBack className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="bg-[#008F53] text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">KolekTrash</h1>
              <h2 className="text-sm opacity-90">Past Attendance</h2>
              <p className="text-xs opacity-80">View Record History</p>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded text-sm font-bold">
              {selectedYear}
            </div>
          </div>

          <div className="bg-white border-x border-b border-gray-200 p-4 rounded-b-lg shadow-sm space-y-2">
            {months.map((month, index) => (
              <button
                key={month}
                onClick={() => {
                  setSelectedMonth(index);
                  setView('history_calendar');
                }}
                className="w-full bg-[#008F53] text-white p-3 rounded-lg flex justify-between items-center hover:bg-green-700 transition-colors"
              >
                <span className="font-bold text-sm uppercase">{month} {selectedYear}</span>
                <IoChevronForward className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderHistoryCalendar = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthName = new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' });

    return (
      <div className="p-3 max-w-full mx-auto">
        <div className="mb-3">
          <button onClick={handleBack} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-2">
            <IoChevronBack className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="bg-[#008F53] text-white p-4 rounded-t-lg">
            <h1 className="text-xl font-bold">KolekTrash</h1>
            <h2 className="text-sm opacity-90">Past Attendance</h2>
            <p className="text-xs opacity-80">View Record History</p>
            <div className="mt-4 text-center font-bold text-lg uppercase tracking-widest">
              {monthName} {selectedYear}
            </div>
          </div>

          <div className="bg-white border-x border-b border-gray-200 p-4 rounded-b-lg shadow-sm">
            <p className="text-xs text-gray-500 mb-2 font-medium">Select Date</p>
            <div className="bg-[#008F53] p-4 rounded-lg">
              <div className="grid grid-cols-7 gap-2">
                {days.map(day => (
                  <button
                    key={day}
                    onClick={() => {
                      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      setSelectedDate(dateStr);
                      setView('daily_detail');
                    }}
                    className="aspect-square flex items-center justify-center bg-white/10 text-white hover:bg-white/30 rounded-lg font-bold text-sm transition-colors"
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVerification = () => (
    <div className="p-3 max-w-full mx-auto">
      <div className="mb-3">
        <button onClick={handleBack} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-2">
          <IoChevronBack className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Attendance Verification</h1>
        <p className="text-xs text-gray-600">Verify pending time-in requests</p>
      </div>

      <div className="bg-white rounded-lg shadow p-3">
        {verificationData.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <MdFactCheck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            No pending verification requests
          </div>
        ) : (
          <div className="space-y-3">
            {verificationData.map(req => (
              <div key={req.id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm text-gray-900">{req.personnel_name}</p>
                  <p className="text-xs text-gray-500">{new Date(req.submitted_at).toLocaleString()}</p>
                  {(() => {
                    if (!req.remarks) return null;
                    try {
                      const parsed = JSON.parse(req.remarks);
                      if (parsed && typeof parsed === 'object') {
                        const parts = [];
                        if (parsed.intent) {
                          const intentMap = { time_in: 'Time In', time_out: 'Time Out', absent: 'Absent' };
                          parts.push(intentMap[parsed.intent] || parsed.intent);
                        }
                        if (parsed.session) parts.push(parsed.session);
                        if (parsed.note) parts.push(`"${parsed.note}"`);
                        return <p className="text-xs text-gray-600 mt-1 italic">{parts.join(' • ')}</p>;
                      }
                    } catch (e) { }
                    return <p className="text-xs text-gray-600 mt-1 italic">"{req.remarks}"</p>;
                  })()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReview(req.id, 'approved', req.personnel_name)}
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
                    title="Approve"
                  >
                    <MdCheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleReview(req.id, 'declined', req.personnel_name)}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                    title="Decline"
                  >
                    <MdCancel className="w-5 h-5" />
                  </button>
                  {req.photo_url && (
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setShowPhotoModal(true);
                      }}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                      title="View Photo"
                    >
                      <MdImage className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {showPhotoModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Proof Photo</h3>
              <button onClick={() => setShowPhotoModal(false)}><MdCancel className="w-6 h-6 text-gray-500" /></button>
            </div>
            <img
              src={resolvePhotoUrl(selectedRequest.photo_url)}
              alt="Proof"
              className="w-full rounded-lg"
              onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Image+Error'}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderLeaveRequests = () => (
    <div className="p-3 max-w-full mx-auto">
      <div className="mb-3">
        <button onClick={handleBack} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-2">
          <IoChevronBack className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Requests and Approvals</h1>
        <p className="text-xs text-gray-600">Manage leave requests</p>
      </div>

      <div className="bg-white rounded-lg shadow p-3">
        {leaveData.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <MdEventNote className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            No pending leave requests
          </div>
        ) : (
          <div className="space-y-3">
            {/* Placeholder for leave request items */}
            <p>Leave requests will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {view === 'menu' && renderMenu()}
      {view === 'today' && renderDailyView("Today's Attendance")}
      {view === 'verification' && renderVerification()}
      {view === 'history_months' && renderHistoryMonths()}
      {view === 'history_calendar' && renderHistoryCalendar()}
      {view === 'daily_detail' && renderDailyView("Past Attendance")}
      {view === 'leave_requests' && renderLeaveRequests()}

      {message.text && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-bold ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {message.text}
        </div>
      )}
    </>
  );
}
