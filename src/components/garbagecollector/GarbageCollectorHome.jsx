import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { MdMenuBook, MdReport, MdAccessTime, MdEvent } from 'react-icons/md';





function GarbageCollectorHome() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // New Session Status State
  const [sessionStatus, setSessionStatus] = React.useState({
    am: { hasTimeIn: false, hasTimeOut: false, isVerified: false, pending: false },
    pm: { hasTimeIn: false, hasTimeOut: false, isVerified: false, pending: false }
  });

  // Time Window Constants
  const [now, setNow] = React.useState(new Date());

  // Morning Session
  const AM_START_HOUR = 5;
  const AM_END_HOUR = 6;
  const AM_TIMEOUT_START = 12;
  const AM_TIMEOUT_END = 13;

  // Afternoon Session
  const PM_START_HOUR = 13; // 1 PM
  const PM_END_HOUR = 14;   // 2 PM
  const PM_TIMEOUT_START = 17; // 5 PM
  const PM_TIMEOUT_END = 18;   // 6 PM

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Check for pending/approved time-in requests today
  React.useEffect(() => {
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

  // Determine current window
  const currentHour = now.getHours();

  let currentWindow = 'CLOSED';

  // Morning Windows
  if (currentHour >= AM_START_HOUR && currentHour < AM_END_HOUR) {
    currentWindow = 'AM_TIME_IN';
  } else if (currentHour >= AM_TIMEOUT_START && currentHour < AM_TIMEOUT_END) {
    currentWindow = 'AM_TIME_OUT';
  }
  // Afternoon Windows
  else if (currentHour >= PM_START_HOUR && currentHour < PM_END_HOUR) {
    currentWindow = 'PM_TIME_IN';
  } else if (currentHour >= PM_TIMEOUT_START && currentHour < PM_TIMEOUT_END) {
    currentWindow = 'PM_TIME_OUT';
  }

  const quickActions = [
    {
      title: 'Attendance',
      description: 'Time In, Time Out, Absent, Leave',
      icon: MdAccessTime,
      ctaLabel: 'Manage attendance',
      onClick: () => navigate('/garbagecollector/attendance'),
    },
    {
      title: 'View Tasks',
      description: "Stay on top of today's assignments.",
      icon: MdReport,
      ctaLabel: 'Open tasks',
      onClick: () => navigate('/garbagecollector/tasks')
    },
    {
      title: 'View Schedule',
      description: 'Check your upcoming collection schedule.',
      icon: MdEvent,
      ctaLabel: 'See schedule',
      onClick: () => navigate('/garbagecollector/schedule')
    },
    {
      title: 'View Routes',
      description: 'Review assigned barangays and checkpoints.',
      icon: MdMenuBook,
      ctaLabel: 'Browse routes',
      onClick: () => navigate('/garbagecollector/routes')
    }
  ];

  return (
    <div className="flex-1 bg-gray-50 px-4 py-4">
      {/* Attendance Status Notification - Minimal & Top */}
      {currentWindow !== 'CLOSED' && (
        <div className="mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Morning Notifications */}
          {currentWindow === 'AM_TIME_IN' && !sessionStatus.am.hasTimeIn && !sessionStatus.am.pending && (
            <div className="flex items-center justify-between bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r shadow-sm">
              <div>
                <p className="font-bold text-emerald-800 text-sm">Morning Session Open</p>
                <p className="text-xs text-emerald-600">Time-in window: 5:00 - 6:00 AM</p>
              </div>
            </div>
          )}
          {currentWindow === 'AM_TIME_OUT' && sessionStatus.am.hasTimeIn && !sessionStatus.am.hasTimeOut && (
            <div className="flex items-center justify-between bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r shadow-sm">
              <div>
                <p className="font-bold text-amber-800 text-sm">Morning Break Open</p>
                <p className="text-xs text-amber-600">Time-out window: 12:00 - 1:00 PM</p>
              </div>
            </div>
          )}

          {/* Afternoon Notifications */}
          {currentWindow === 'PM_TIME_IN' && !sessionStatus.pm.hasTimeIn && !sessionStatus.pm.pending && (
            <div className="flex items-center justify-between bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r shadow-sm">
              <div>
                <p className="font-bold text-emerald-800 text-sm">Afternoon Session Open</p>
                <p className="text-xs text-emerald-600">Time-in window: 1:00 - 2:00 PM</p>
              </div>
            </div>
          )}
          {currentWindow === 'PM_TIME_OUT' && sessionStatus.pm.hasTimeIn && !sessionStatus.pm.hasTimeOut && (
            <div className="flex items-center justify-between bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r shadow-sm">
              <div>
                <p className="font-bold text-indigo-800 text-sm">End of Day Open</p>
                <p className="text-xs text-indigo-600">Time-out window: 5:00 - 6:00 PM</p>
              </div>
            </div>
          )}
        </div>
      )}



      {/* Main Content */}
      <div className="px-0 py-0">
        <div>
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-green-800">Quick Actions</h2>
            <p className="text-sm text-slate-500">Jump straight into your most frequent tasks.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                type="button"
                className="group relative flex h-full w-full flex-col justify-between rounded-2xl bg-gradient-to-br from-green-700 to-green-600 p-6 text-left text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
                    <action.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-white">{action.title}</h3>
                    <p className="text-sm leading-relaxed text-white/80">{action.description}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between text-sm font-medium text-white/90">
                  <span>{action.ctaLabel}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors group-hover:bg-white group-hover:text-green-700">
                    <FiChevronRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GarbageCollectorHome;
