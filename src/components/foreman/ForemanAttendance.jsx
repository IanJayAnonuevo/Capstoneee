import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import { MdPrint, MdFileDownload, MdCheckCircle, MdCancel, MdPending, MdAccessTime } from 'react-icons/md';

const API_BASE_URL = 'http://localhost/Capstoneee/backend/api';

export default function ForemanAttendance() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending'); // 'all', 'pending', 'verified', 'rejected'
  const [summary, setSummary] = useState({
    pending: { AM: 0, PM: 0 },
    verified: { AM: 0, PM: 0 },
    rejected: { AM: 0, PM: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, filterStatus]);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const statusParam = filterStatus === 'all' ? '' : `&status=${filterStatus}`;
      const response = await fetch(`${API_BASE_URL}/get_pending_attendance.php?date=${selectedDate}${statusParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setAttendanceData(data.attendance);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleVerification = async (attendanceId, status, personName) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('access_token');
      const userData = JSON.parse(localStorage.getItem('user'));
      const foremanId = userData?.user_id || 91;
      
      const response = await fetch(`${API_BASE_URL}/verify_attendance.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          attendance_id: attendanceId,
          foreman_id: foremanId,
          verification_status: status
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const actionText = status === 'verified' ? 'Verified' : 'Rejected';
        setMessage({ 
          type: 'success', 
          text: `${personName} - ${actionText} successfully` 
        });
        fetchAttendance();
        
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to verify attendance' });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    alert('Export functionality will be implemented');
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getAttendanceStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <span className="inline-block px-1 rounded text-[9px] font-medium bg-green-100 text-green-800">
          ✓
        </span>;
      case 'absent':
        return <span className="inline-block px-1 rounded text-[9px] font-medium bg-red-100 text-red-800">
          ✗
        </span>;
      case 'on-leave':
        return <span className="inline-block px-1 rounded text-[9px] font-medium bg-blue-100 text-blue-800">
          📋
        </span>;
      case 'pending':
        return <span className="inline-block px-1 rounded text-[9px] font-medium bg-gray-100 text-gray-800">
          ⏳
        </span>;
      default:
        return <span className="text-gray-400 text-[9px]">-</span>;
    }
  };

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-block px-1 rounded text-[9px] font-medium bg-yellow-100 text-yellow-800">
          ⏳
        </span>;
      case 'verified':
        return <span className="inline-block px-1 rounded text-[9px] font-medium bg-green-100 text-green-800">
          ✓
        </span>;
      case 'rejected':
        return <span className="inline-block px-1 rounded text-[9px] font-medium bg-red-100 text-red-800">
          ✗
        </span>;
      default:
        return null;
    }
  };

  const isLate = (timeIn, session) => {
    if (!timeIn) return false;
    const [hours, minutes] = timeIn.split(':').map(Number);
    if (session === 'AM') {
      // Late if after 6:00 AM
      return hours >= 6;
    } else {
      // Late if after 1:00 PM (13:00)
      return hours >= 13;
    }
  };

  const pendingCount = summary.pending.AM + summary.pending.PM;
  const filteredData = attendanceData;

  return (
    <div className="p-3 max-w-full mx-auto">
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-2 transition-colors"
        >
          <IoChevronBack className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Attendance Verification</h1>
        <p className="text-xs text-gray-600">Verify personnel attendance</p>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && filterStatus !== 'pending' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-3 rounded">
          <div className="flex items-center">
            <MdPending className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">
                {pendingCount} pending
              </p>
              <button 
                onClick={() => setFilterStatus('pending')}
                className="text-xs text-yellow-700 underline hover:text-yellow-900"
              >
                View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date and Filter Controls */}
      <div className="bg-white rounded-lg shadow p-3 mb-3">
        {/* Date Selection */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">Filter</label>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-all ${
                filterStatus === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              Pending ({summary.pending.AM + summary.pending.PM})
            </button>
            <button
              onClick={() => setFilterStatus('verified')}
              className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-all ${
                filterStatus === 'verified'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              Verified ({summary.verified.AM + summary.verified.PM})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-all ${
                filterStatus === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              All
            </button>
          </div>
        </div>
        
        {message.text && (
          <div className={`mb-2 p-2 rounded flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.type === 'success' ? <MdCheckCircle className="w-4 h-4" /> : <MdCancel className="w-4 h-4" />}
            <span className="text-xs font-medium">{message.text}</span>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
            <div className="text-yellow-800 text-xs font-medium">Pending</div>
            <div className="text-lg font-bold text-yellow-900">
              {summary.pending.AM + summary.pending.PM}
            </div>
            <div className="text-[10px] text-yellow-700">
              AM:{summary.pending.AM} PM:{summary.pending.PM}
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <div className="text-green-800 text-xs font-medium">Verified</div>
            <div className="text-lg font-bold text-green-900">
              {summary.verified.AM + summary.verified.PM}
            </div>
            <div className="text-[10px] text-green-700">
              AM:{summary.verified.AM} PM:{summary.verified.PM}
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <div className="text-red-800 text-xs font-medium">Rejected</div>
            <div className="text-lg font-bold text-red-900">
              {summary.rejected.AM + summary.rejected.PM}
            </div>
            <div className="text-[10px] text-red-700">
              AM:{summary.rejected.AM} PM:{summary.rejected.PM}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Verification Table */}
      <div className="bg-white rounded-lg shadow p-3 mb-3">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-green-700">
            {filterStatus === 'pending' ? 'Pending' : 
             filterStatus === 'verified' ? 'Verified' : 'All Records'}
          </h2>
          <h3 className="text-xs font-medium text-gray-900">
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </h3>
        </div>

        {filteredData.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded">
            <MdAccessTime className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">No records</p>
            <p className="text-gray-500 text-xs mt-1">
              {filterStatus === 'pending' ? 'Personnel will appear after time in' : 'Try different date'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-3">
            <table className="w-full border border-gray-800 text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-800 px-2 py-1 text-left font-semibold text-gray-900">Name</th>
                  <th className="border border-gray-800 px-1 py-1 text-center font-semibold text-gray-900">Shift</th>
                  <th className="border border-gray-800 px-1 py-1 text-center font-semibold text-gray-900">Time In</th>
                  <th className="border border-gray-800 px-1 py-1 text-center font-semibold text-gray-900">Time Out</th>
                  <th className="border border-gray-800 px-1 py-1 text-center font-semibold text-gray-900">Status</th>
                  <th className="border border-gray-800 px-1 py-1 text-center font-semibold text-gray-900">Verify</th>
                  {filterStatus === 'pending' && (
                    <th className="border border-gray-800 px-1 py-1 text-center font-semibold text-gray-900">Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((record) => {
                  const personName = `${record.firstname || ''} ${record.lastname || ''}`.trim() || record.username;
                  
                  return (
                    <tr key={record.attendance_id} className="hover:bg-gray-50">
                      <td className="border border-gray-800 px-2 py-1 text-gray-900 font-medium">
                        <div className="text-[11px] leading-tight">
                          {personName}
                          <div className="text-[9px] text-gray-500">{record.designation}</div>
                        </div>
                      </td>
                      <td className="border border-gray-800 px-1 py-1 text-center">
                        <span className={`inline-block px-1 rounded text-[10px] font-bold ${
                          record.session === 'AM' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {record.session}
                        </span>
                      </td>
                      <td className="border border-gray-800 px-1 py-1 text-center">
                        {record.time_in ? (
                          <div className="text-[10px]">
                            {formatTime(record.time_in)}
                            {isLate(record.time_in, record.session) && (
                              <div className="text-red-600 font-bold">⚠️</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="border border-gray-800 px-1 py-1 text-center text-[10px]">
                        {record.time_out ? formatTime(record.time_out) : '-'}
                      </td>
                      <td className="border border-gray-800 px-1 py-1 text-center">
                        {getAttendanceStatusBadge(record.status)}
                      </td>
                      <td className="border border-gray-800 px-1 py-1 text-center">
                        {getVerificationBadge(record.verification_status)}
                      </td>
                      {filterStatus === 'pending' && (
                        <td className="border border-gray-800 px-1 py-1">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleVerification(record.attendance_id, 'verified', personName)}
                              disabled={loading}
                              className="px-2 py-1 bg-green-600 text-white rounded text-[10px] font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                              <MdCheckCircle className="w-3 h-3" />
                              ✓
                            </button>
                            <button
                              onClick={() => handleVerification(record.attendance_id, 'rejected', personName)}
                              disabled={loading}
                              className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                              <MdCancel className="w-3 h-3" />
                              ✗
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}


        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
          >
            <MdPrint className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
          >
            <MdFileDownload className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
