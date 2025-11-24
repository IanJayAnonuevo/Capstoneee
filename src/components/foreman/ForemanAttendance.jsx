import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import { MdPrint, MdFileDownload, MdCheckCircle, MdCancel, MdPending, MdAccessTime, MdImage, MdRefresh } from 'react-icons/md';
import { API_BASE_URL } from '../../config/api';
import { authService } from '../../services/authService';

export default function ForemanAttendance() {
  const navigate = useNavigate();
  
  // Force today's date - calculate fresh every render
  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [attendanceData, setAttendanceData] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending'); // 'all', 'pending', 'verified', 'rejected'
  const [summary, setSummary] = useState({
    pending: 0,
    approved: 0,
    declined: 0
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const resolvePhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    if (typeof photoPath !== 'string') return null;
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://') || 
        photoPath.startsWith('blob:') || photoPath.startsWith('data:')) {
      return photoPath;
    }
    return authService.resolveAssetUrl(photoPath);
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, filterStatus]);

  // Auto-refresh every 30 seconds to catch new requests
  useEffect(() => {
    const interval = setInterval(() => {
      if (filterStatus === 'pending') {
        fetchAttendance();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [filterStatus, selectedDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const dateFrom = selectedDate;
      const dateTo = selectedDate;
      
      // First, fetch ALL requests to get accurate summary counts
      const summaryUrl = `${API_BASE_URL}/list_attendance_requests.php?date_from=${dateFrom}&date_to=${dateTo}`;
      const summaryResponse = await fetch(summaryUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        if (summaryData.status === 'success') {
          const allRequests = summaryData.data.requests || [];
          setSummary({
            pending: allRequests.filter(r => r.request_status === 'pending').length,
            approved: allRequests.filter(r => r.request_status === 'approved').length,
            declined: allRequests.filter(r => r.request_status === 'declined').length
          });
        }
      }
      
      // Then fetch filtered data for the table
      const statusParam = filterStatus === 'all' ? '' : `&status=${filterStatus}`;
      const url = `${API_BASE_URL}/list_attendance_requests.php?date_from=${dateFrom}&date_to=${dateTo}${statusParam}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        if (response.status === 401) {
          // Token expired - prompt to login again
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setAttendanceData(data.data.requests || []);
        setMessage({ type: '', text: '' }); // Clear any previous errors
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fetch attendance requests' });
        setAttendanceData([]);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setMessage({ type: 'error', text: error.message || 'Network error. Please try again.' });
      setAttendanceData([]);
      setSummary({ pending: 0, approved: 0, declined: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId, decision, personName) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE_URL}/review_attendance_request.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          request_id: requestId,
          decision: decision,
          review_note: ''
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        const actionText = decision === 'approved' ? 'Approved' : 'Declined';
        setMessage({ 
          type: 'success', 
          text: `${personName} - ${actionText} successfully` 
        });
        fetchAttendance();
        setShowPhotoModal(false);
        setSelectedRequest(null);
        
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to review request' });
      }
    } catch (error) {
      console.error('Review error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
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

  const pendingCount = summary.pending;
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
          <div className="flex items-center gap-2 mb-1">
            <label className="block text-xs font-medium text-gray-700 flex-1">Date</label>
            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setSelectedDate(today);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              title="Set to today"
            >
              Today
            </button>
            <button
              onClick={fetchAttendance}
              disabled={loading}
              className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded disabled:opacity-50"
              title="Refresh"
            >
              <MdRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
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
              Pending ({summary.pending})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-all ${
                filterStatus === 'approved'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              Approved ({summary.approved})
            </button>
            <button
              onClick={() => setFilterStatus('declined')}
              className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-all ${
                filterStatus === 'declined'
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              Declined ({summary.declined})
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
              {summary.pending}
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <div className="text-green-800 text-xs font-medium">Approved</div>
            <div className="text-lg font-bold text-green-900">
              {summary.approved}
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <div className="text-red-800 text-xs font-medium">Declined</div>
            <div className="text-lg font-bold text-red-900">
              {summary.declined}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Verification Table */}
      <div className="bg-white rounded-lg shadow p-3 mb-3">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-green-700">
            {filterStatus === 'pending' ? 'Pending Requests' : 
             filterStatus === 'approved' ? 'Approved Requests' : 
             filterStatus === 'declined' ? 'Declined Requests' : 'All Requests'}
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
                  <th className="border border-gray-800 px-1 py-1 text-center font-semibold text-gray-900">Role</th>
                  <th className="border border-gray-800 px-1 py-1 text-center font-semibold text-gray-900">Submitted</th>
                  <th className="border border-gray-800 px-1 py-1 text-center font-semibold text-gray-900">Photo</th>
                  <th className="border border-gray-800 px-1 py-1 text-center font-semibold text-gray-900">Status</th>
                  {filterStatus === 'pending' && (
                    <th className="border border-gray-800 px-1 py-1 text-center font-semibold text-gray-900">Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((request) => {
                  const personName = request.personnel_name || request.username || 'Unknown';
                  
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="border border-gray-800 px-2 py-1 text-gray-900 font-medium">
                        <div className="text-[11px] leading-tight">
                          {personName}
                          {request.remarks && (
                            <div className="text-[9px] text-gray-500 mt-1">Note: {request.remarks}</div>
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-800 px-1 py-1 text-center">
                        <span className="inline-block px-1 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                          {request.role_name || 'N/A'}
                        </span>
                      </td>
                      <td className="border border-gray-800 px-1 py-1 text-center text-[10px]">
                        {request.submitted_at ? new Date(request.submitted_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </td>
                      <td className="border border-gray-800 px-1 py-1 text-center">
                        {request.photo_url ? (
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowPhotoModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="View photo"
                          >
                            <MdImage className="w-5 h-5 mx-auto" />
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="border border-gray-800 px-1 py-1 text-center">
                        {request.request_status === 'pending' && (
                          <span className="inline-block px-1 rounded text-[9px] font-medium bg-yellow-100 text-yellow-800">
                            ⏳ Pending
                          </span>
                        )}
                        {request.request_status === 'approved' && (
                          <span className="inline-block px-1 rounded text-[9px] font-medium bg-green-100 text-green-800">
                            ✓ Approved
                          </span>
                        )}
                        {request.request_status === 'declined' && (
                          <span className="inline-block px-1 rounded text-[9px] font-medium bg-red-100 text-red-800">
                            ✗ Declined
                          </span>
                        )}
                      </td>
                      {filterStatus === 'pending' && (
                        <td className="border border-gray-800 px-1 py-1">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleReview(request.id, 'approved', personName)}
                              disabled={loading}
                              className="px-2 py-1 bg-green-600 text-white rounded text-[10px] font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                              <MdCheckCircle className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview(request.id, 'declined', personName)}
                              disabled={loading}
                              className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                              <MdCancel className="w-3 h-3" />
                              Decline
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

      {/* Photo Modal */}
      {showPhotoModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Photo Proof - {selectedRequest.personnel_name || 'Personnel'}
              </h3>
              <button
                onClick={() => {
                  setShowPhotoModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <IoChevronBack className="w-6 h-6 rotate-180" />
              </button>
            </div>
            <div className="p-6">
              {selectedRequest.photo_url ? (
                <img
                  src={resolvePhotoUrl(selectedRequest.photo_url)}
                  alt="Attendance proof"
                  className="w-full h-auto rounded-lg border border-gray-300 shadow-lg"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="sans-serif" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">No photo available</div>
              )}
              {selectedRequest.remarks && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Remarks:</p>
                  <p className="text-sm text-gray-600">{selectedRequest.remarks}</p>
                </div>
              )}
              {filterStatus === 'pending' && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleReview(selectedRequest.id, 'approved', selectedRequest.personnel_name)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <MdCheckCircle className="w-5 h-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReview(selectedRequest.id, 'declined', selectedRequest.personnel_name)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <MdCancel className="w-5 h-5" />
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
