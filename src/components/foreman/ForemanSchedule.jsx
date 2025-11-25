import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import { FiPlus, FiCalendar, FiClock, FiMapPin, FiMoreVertical, FiEdit2, FiTrash2, FiRefreshCw, FiFilter } from 'react-icons/fi';
import { buildApiUrl } from '../../config/api';

const getAuthToken = () => localStorage.getItem('access_token');
const getAuthHeaders = () => ({ Authorization: `Bearer ${getAuthToken()}` });

const scheduleViewOptions = [
  { value: 'priority', label: 'Priority Barangays', type: 'priority', clusterId: '1C-PB' },
  { value: 'clusterA', label: 'Cluster A (Eastern)', type: 'cluster', clusterId: '2C-CA' },
  { value: 'clusterB', label: 'Cluster B (Western)', type: 'cluster', clusterId: '3C-CB' },
  { value: 'clusterC', label: 'Cluster C (Northern)', type: 'cluster', clusterId: '4C-CC' },
  { value: 'clusterD', label: 'Cluster D (Southern)', type: 'cluster', clusterId: '5C-CD' }
];

export default function ForemanSchedule() {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState('priority');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [barangays, setBarangays] = useState([]);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    barangay_id: '',
    day_of_week: 'Monday',
    start_time: '',
    end_time: '',
    week_of_month: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const currentOption = scheduleViewOptions.find(opt => opt.value === selectedView) || scheduleViewOptions[0];
  const isPriority = currentOption.type === 'priority';

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (isPriority) {
        params.set('schedule_type', 'daily_priority,fixed_days');
      } else {
        params.set('schedule_type', 'weekly_cluster');
        params.set('cluster_id', currentOption.clusterId);
        // Default to current week of month logic if needed, or fetch all weeks
        // For simplicity in list view, we might want to fetch all and let user filter or just show all
        // But the API requires week_of_month for weekly_cluster usually? 
        // Let's try to fetch without it to get all, or default to 1 if required.
        // Looking at admin code: params.set('week_of_month', String(weekNumber));
        // Let's calculate current week number
        const today = new Date();
        const weekNum = Math.ceil(today.getDate() / 7);
        params.set('week_of_month', String(weekNum));
      }
      params.set('days', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].join(','));

      const res = await fetch(`${buildApiUrl('get_predefined_schedules.php')}?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setSchedules(data.schedules || []);
      } else {
        setError('Failed to fetch schedules');
      }
    } catch (err) {
      console.error(err);
      setError('Error loading schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchBarangays = async () => {
    try {
      const res = await fetch(buildApiUrl('get_barangays.php'), { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setBarangays(data.barangays || []);
      }
    } catch (err) {
      console.error('Error fetching barangays', err);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchBarangays();
  }, [selectedView]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const barangay = barangays.find(b => String(b.barangay_id) === String(formData.barangay_id));
      const payload = {
        ...formData,
        barangay_name: barangay?.barangay_name,
        cluster_id: currentOption.clusterId,
        schedule_type: isPriority ? 'daily_priority' : 'weekly_cluster',
        frequency_per_day: 1,
        is_active: 1,
        // For weekly cluster, ensure week_of_month is set
        week_of_month: !isPriority ? (formData.week_of_month || 1) : undefined
      };

      const res = await fetch(buildApiUrl('create_predefined_schedule.php'), {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        fetchSchedules();
        setFormData({ barangay_id: '', day_of_week: 'Monday', start_time: '', end_time: '', week_of_month: '' });
      } else {
        alert(data.message || 'Failed to create schedule');
      }
    } catch (err) {
      alert('Error creating schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (schedule) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      const idVal = schedule.schedule_template_id || schedule.id || schedule.schedule_id || schedule.predefined_id;
      const res = await fetch(buildApiUrl('delete_predefined_schedule.php'), {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idVal })
      });
      const data = await res.json();
      if (data.success) {
        fetchSchedules();
      } else {
        alert(data.message || 'Failed to delete schedule');
      }
    } catch (err) {
      alert('Error deleting schedule');
    }
  };

  // Group schedules by day
  const groupedSchedules = {
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
  };
  schedules.forEach(s => {
    if (groupedSchedules[s.day_of_week]) {
      groupedSchedules[s.day_of_week].push(s);
    }
  });

  // Sort by time within each day
  Object.keys(groupedSchedules).forEach(day => {
    groupedSchedules[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
  });

  const AddModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Add Schedule</h3>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
              <select
                required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.barangay_id}
                onChange={e => setFormData({ ...formData, barangay_id: e.target.value })}
              >
                <option value="">Select Barangay</option>
                {barangays
                  .filter(b => isPriority ? b.cluster_id === '1C-PB' : b.cluster_id === currentOption.clusterId)
                  .map(b => (
                    <option key={b.barangay_id} value={b.barangay_id}>{b.barangay_name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
              <select
                required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.day_of_week}
                onChange={e => setFormData({ ...formData, day_of_week: e.target.value })}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {!isPriority && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Week of Month</label>
                <select
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.week_of_month}
                  onChange={e => setFormData({ ...formData, week_of_month: e.target.value })}
                >
                  <option value="">Select Week</option>
                  {[1, 2, 3, 4].map(w => (
                    <option key={w} value={w}>Week {w}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.start_time}
                  onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.end_time}
                  onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

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
          <h1 className="text-xl font-bold text-gray-800">Schedule</h1>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 transition-colors"
            >
              <FiPlus className="w-5 h-5" />
            </button>
            <button
              onClick={fetchSchedules}
              className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
            >
              <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* View Selector */}
        <div className="relative">
          <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-green-500 transition-all text-sm font-medium text-gray-700 appearance-none"
          >
            {scheduleViewOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : (
          Object.entries(groupedSchedules).map(([day, daySchedules]) => (
            daySchedules.length > 0 && (
              <div key={day} className="animate-fade-in">
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                  {day}
                </h2>
                <div className="space-y-3">
                  {daySchedules.map((schedule, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <FiMapPin className="text-green-600 w-4 h-4 flex-shrink-0" />
                          <h3 className="font-bold text-gray-900">{schedule.barangay_name}</h3>
                        </div>
                        <button
                          onClick={() => handleDelete(schedule)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 ml-6">
                        <div className="flex items-center gap-1.5">
                          <FiClock className="w-4 h-4 text-gray-400" />
                          <span>{schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}</span>
                        </div>
                        {!isPriority && schedule.week_of_month && (
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs font-medium">
                            Week {schedule.week_of_month}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))
        )}

        {!loading && schedules.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCalendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No schedules found</h3>
            <p className="text-gray-500 mt-1">Add a schedule to get started</p>
          </div>
        )}
      </div>

      {showAddModal && <AddModal />}
    </div>
  );
}
