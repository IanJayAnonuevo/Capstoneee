import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import { FiSearch, FiRefreshCw, FiUser, FiMapPin, FiCalendar, FiClock, FiCheckCircle, FiX, FiAlertCircle, FiPhone, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { authService } from '../../services/authService';
import Skeleton from '../shared/Skeleton';

export default function ForemanSpecialPickup() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [requestToSchedule, setRequestToSchedule] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await authService.getPickupRequests();
      if (response && response.status === 'success') {
        setRequests(response.data || []);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter.toLowerCase();
    const matchesSearch =
      req.requester_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.barangay?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="w-3 h-3" />;
      case 'scheduled': return <FiCalendar className="w-3 h-3" />;
      case 'completed': return <FiCheckCircle className="w-3 h-3" />;
      case 'declined': return <FiX className="w-3 h-3" />;
      default: return <FiAlertCircle className="w-3 h-3" />;
    }
  };

  const handleSchedule = (request) => {
    setRequestToSchedule(request);
    // Set default date to preferred date if available
    if (request.pickup_date) {
      setScheduleDate(request.pickup_date);
    }
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async () => {
    if (!scheduleDate || !scheduleTime) {
      alert('Please select both date and time');
      return;
    }

    try {
      setActionLoading(true);
      const response = await authService.updatePickupRequestStatus(
        requestToSchedule.id || requestToSchedule.request_id,
        'scheduled',
        {
          scheduled_date: scheduleDate,
          scheduled_time: scheduleTime
        }
      );

      if (response.status === 'success') {
        // Close modals
        setShowScheduleModal(false);
        setShowModal(false);
        // Redirect to calendar
        navigate('/foreman/schedule');
      } else {
        alert('Failed to schedule: ' + response.message);
      }
    } catch (error) {
      console.error('Error scheduling:', error);
      alert('Failed to schedule request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (request) => {
    const reason = prompt('Reason for declining:');
    if (!reason) return;

    try {
      setActionLoading(true);
      const response = await authService.updatePickupRequestStatus(
        request.id || request.request_id,
        'declined',
        { declined_reason: reason }
      );

      if (response.status === 'success') {
        setRequests(prev => prev.map(req =>
          (req.id || req.request_id) === (request.id || request.request_id)
            ? { ...req, status: 'declined', declined_reason: reason }
            : req
        ));
        setSelectedRequest(prev => ({ ...prev, status: 'declined', declined_reason: reason }));
      } else {
        alert('Failed to decline: ' + response.message);
      }
    } catch (error) {
      console.error('Error declining:', error);
      alert('Failed to decline request.');
    } finally {
      setActionLoading(false);
    }
  };

  const RequestModal = () => {
    if (!selectedRequest) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Request Details</h3>
                <p className="text-sm text-gray-500">ID: #{selectedRequest.id || selectedRequest.request_id}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <FiX className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Banner */}
              <div className={`flex items-center gap-2 p-3 rounded-xl ${getStatusColor(selectedRequest.status)} bg-opacity-20`}>
                {getStatusIcon(selectedRequest.status)}
                <span className="font-semibold capitalize">{selectedRequest.status}</span>
              </div>

              {/* Requester Info */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-green-600">
                    <FiUser className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Requester</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.requester_name}</p>
                  </div>
                </div>
                {selectedRequest.contact_number && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600">
                      <FiPhone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-semibold text-gray-900">{selectedRequest.contact_number}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="flex items-center gap-2 mb-1 text-gray-500">
                  <FiMapPin className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Location</span>
                </div>
                <p className="font-semibold text-gray-900">{selectedRequest.barangay}</p>
              </div>


              {/* Date & Notes */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 text-gray-500">
                    <FiCalendar className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Preferred Date</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {selectedRequest.pickup_date ? new Date(selectedRequest.pickup_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </p>
                </div>
                {selectedRequest.notes && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-1 text-gray-500">
                      <FiMessageSquare className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase">Notes</span>
                    </div>
                    <p className="text-sm text-gray-700 italic">"{selectedRequest.notes}"</p>
                  </div>
                )}
              </div>

              {/* Decline Reason */}
              {selectedRequest.declined_reason && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <p className="text-xs font-bold text-red-800 uppercase mb-1">Reason for Decline</p>
                  <p className="text-sm text-red-700">{selectedRequest.declined_reason}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleDecline(selectedRequest)}
                    disabled={actionLoading}
                    className="flex-1 py-3 px-4 bg-red-100 text-red-700 font-medium rounded-xl hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleSchedule(selectedRequest)}
                    disabled={actionLoading}
                    className="flex-1 py-3 px-4 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200 disabled:opacity-50"
                  >
                    {actionLoading ? '...' : 'Schedule'}
                  </button>
                </>
              )}
            </div>
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
          <h1 className="text-xl font-bold text-gray-800">Special Pick-up</h1>
          <button
            onClick={fetchData}
            className="ml-auto p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search requester, barangay..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['All', 'Pending', 'Scheduled', 'Completed', 'Declined'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === status
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && requests.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="circular" className="w-10 h-10" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-lg" />
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3">
            <FiAlertCircle className="w-6 h-6 flex-shrink-0" />
            <p>{error}</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCalendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRequests.map((req) => (
              <div
                key={req.id || req.request_id}
                onClick={() => {
                  setSelectedRequest(req);
                  setShowModal(true);
                }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                      {req.requester_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 line-clamp-1">{req.requester_name}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <FiMapPin className="w-3 h-3 mr-1" />
                        {req.barangay}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(req.status)}`}>
                    {getStatusIcon(req.status)}
                    <span className="ml-1 capitalize">{req.status}</span>
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Preferred Date</span>
                    <span className="font-medium text-gray-900">
                      {req.pickup_date ? new Date(req.pickup_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    Requested {req.created_at ? new Date(req.created_at).toLocaleDateString() : ''}
                  </span>
                  <span className="text-sm font-medium text-green-600">View Details &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <RequestModal />}

      {/* Simple Schedule Modal */}
      {showScheduleModal && requestToSchedule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowScheduleModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Schedule Special Pickup</h3>
                  <p className="text-sm text-gray-500 mt-1">{requestToSchedule.barangay} - {requestToSchedule.requester_name}</p>
                </div>
                <button onClick={() => setShowScheduleModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <FiX className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Date Input */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <FiCalendar className="w-4 h-4 text-green-600" />
                    Schedule Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Time Input */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <FiClock className="w-4 h-4 text-green-600" />
                    Schedule Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex gap-3">
                    <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900 font-medium">Auto-Assignment</p>
                      <p className="text-xs text-blue-700 mt-1">
                        This pickup will be automatically assigned to the priority team working on the selected date and time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleSubmit}
                  disabled={actionLoading || !scheduleDate || !scheduleTime}
                  className="flex-1 py-3 px-4 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Scheduling...' : 'Schedule & Assign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
