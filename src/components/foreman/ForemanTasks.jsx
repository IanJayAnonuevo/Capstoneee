import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import { FiSearch, FiRefreshCw, FiPlus, FiUser, FiMapPin, FiCalendar, FiClock, FiCheckCircle, FiX, FiAlertCircle, FiTruck, FiFilter } from 'react-icons/fi';
import Select from 'react-select';
import { buildApiUrl } from '../../config/api';

const getAuthToken = () => localStorage.getItem('access_token');
const getAuthHeaders = () => ({ Authorization: `Bearer ${getAuthToken()}` });

export default function ForemanTasks() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Data for creation
  const [drivers, setDrivers] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await fetch(buildApiUrl('get_all_task_assignments.php'), { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setAssignments(data.assignments || []);
      } else {
        setError('Failed to fetch assignments');
      }
    } catch (err) {
      console.error(err);
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchCreateData = async () => {
    setCreateLoading(true);
    try {
      const [pRes, tRes, bRes] = await Promise.all([
        fetch(buildApiUrl('get_personnel.php'), { headers: getAuthHeaders() }),
        fetch(buildApiUrl('get_trucks.php'), { headers: getAuthHeaders() }),
        fetch(buildApiUrl('get_barangays.php'), { headers: getAuthHeaders() })
      ]);

      const pData = await pRes.json();
      const tData = await tRes.json();
      const bData = await bRes.json();

      if (pData.success) {
        setDrivers(pData.truck_drivers || []);
        setCollectors(pData.garbage_collectors || []);
      }
      if (tData.success) setTrucks(tData.trucks || []);
      if (bData.success) setBarangays(bData.barangays || []);

    } catch (err) {
      console.error('Error fetching create data', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateClick = () => {
    setShowCreateModal(true);
    fetchCreateData();
  };

  const filteredAssignments = assignments.filter(task => {
    const matchesStatus = statusFilter === 'All' || (task.status || '').toLowerCase() === statusFilter.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (task.barangay_name || '').toLowerCase().includes(searchLower) ||
      (task.driver?.name || '').toLowerCase().includes(searchLower) ||
      (task.truck_plate || '').toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TaskModal = () => {
    if (!selectedTask) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Task Details</h3>
                <p className="text-sm text-gray-500">ID: #{selectedTask.assignment_id}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <FiX className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className={`flex items-center gap-2 p-3 rounded-xl ${getStatusColor(selectedTask.status)} bg-opacity-20`}>
                <span className="font-semibold capitalize">{selectedTask.status || 'Unknown'}</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-green-600">
                    <FiMapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">{selectedTask.barangay_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600">
                    <FiCalendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Schedule</p>
                    <p className="font-semibold text-gray-900">
                      {selectedTask.date} at {selectedTask.time}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 mb-1 text-gray-500">
                    <FiUser className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Driver</span>
                  </div>
                  <p className="font-semibold text-gray-900">{selectedTask.driver?.name || 'Unassigned'}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${selectedTask.driver?.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {selectedTask.driver?.status || 'Pending'}
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 mb-1 text-gray-500">
                    <FiTruck className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Truck</span>
                  </div>
                  <p className="font-semibold text-gray-900">{selectedTask.truck_plate || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 mb-1 text-gray-500">
                    <FiUser className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Collectors</span>
                  </div>
                  <div className="space-y-1">
                    {selectedTask.collectors && selectedTask.collectors.length > 0 ? (
                      selectedTask.collectors.map((c, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="font-medium text-gray-900">{c.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {c.status || 'Pending'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No collectors assigned</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CreateTaskModal = () => {
    const [formData, setFormData] = useState({
      driver_id: '',
      collector_ids: [],
      truck_id: '',
      barangay_id: '',
      date: '',
      time: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        const res = await fetch(buildApiUrl('assign_task.php'), {
          method: 'POST',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            collector_ids: formData.collector_ids.map(c => c.value)
          })
        });
        const data = await res.json();
        if (data.success) {
          alert('Task assigned successfully!');
          setShowCreateModal(false);
          fetchAssignments();
        } else {
          alert(data.message || 'Failed to assign task');
        }
      } catch (err) {
        alert('Error assigning task');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Assign New Task</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <FiX className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                <select
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.barangay_id}
                  onChange={e => setFormData({ ...formData, barangay_id: e.target.value })}
                >
                  <option value="">Select Barangay</option>
                  {barangays.map(b => (
                    <option key={b.barangay_id} value={b.barangay_id}>{b.barangay_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                <select
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.driver_id}
                  onChange={e => setFormData({ ...formData, driver_id: e.target.value })}
                >
                  <option value="">Select Driver</option>
                  {drivers.map(d => (
                    <option key={d.id || d.user_id} value={d.id || d.user_id}>{d.full_name || d.username}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Collectors</label>
                <Select
                  isMulti
                  options={collectors.map(c => ({ value: c.id || c.user_id, label: c.full_name || c.username }))}
                  value={formData.collector_ids}
                  onChange={val => setFormData({ ...formData, collector_ids: val })}
                  className="text-sm"
                  placeholder="Select collectors..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Truck</label>
                <select
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.truck_id}
                  onChange={e => setFormData({ ...formData, truck_id: e.target.value })}
                >
                  <option value="">Select Truck</option>
                  {trucks.map(t => (
                    <option key={t.truck_id} value={t.truck_id}>{t.plate_num} ({t.capacity}kg)</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200 disabled:opacity-50 mt-4"
              >
                {submitting ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </form>
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
          <h1 className="text-xl font-bold text-gray-800">Task Management</h1>
          <div className="ml-auto flex gap-2">
            <button
              onClick={handleCreateClick}
              className="p-2 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 transition-colors"
            >
              <FiPlus className="w-5 h-5" />
            </button>
            <button
              onClick={fetchAssignments}
              className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
            >
              <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search location, driver, truck..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['All', 'Assigned', 'Accepted', 'Completed', 'Declined', 'Cancelled'].map(status => (
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
        {loading && assignments.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3">
            <FiAlertCircle className="w-6 h-6 flex-shrink-0" />
            <p>{error}</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAssignments.map((task) => (
              <div
                key={task.assignment_id}
                onClick={() => {
                  setSelectedTask(task);
                  setShowModal(true);
                }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                      <FiMapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 line-clamp-1">{task.barangay_name}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <FiCalendar className="w-3 h-3 mr-1" />
                        {task.date}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(task.status)}`}>
                    <span className="capitalize">{task.status || 'Unknown'}</span>
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Driver</span>
                    <span className="font-medium text-gray-900">{task.driver?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Truck</span>
                    <span className="font-medium text-gray-900">{task.truck_plate || 'N/A'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    ID: #{task.assignment_id}
                  </span>
                  <span className="text-sm font-medium text-green-600">View Details &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <TaskModal />}
      {showCreateModal && <CreateTaskModal />}
    </div>
  );
}
