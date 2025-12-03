import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiBell } from 'react-icons/fi';
import { MdLogout, MdPeople, MdCalendarToday, MdAssignment, MdLocalShipping, MdReportProblem, MdSettings, MdHome } from 'react-icons/md';
import logo from '../../assets/logo/logo.png';
import { useLoader } from '../../contexts/LoaderContext';
import { authService } from '../../services/authService';
import Skeleton from '../shared/Skeleton';

export default function ForemanDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { showLoader } = useLoader();

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const foremanName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.username || 'Foreman';

  const navLinks = [
    { label: 'Home', icon: <MdHome className="w-6 h-6" />, to: '/foreman' },
    { label: 'Monitor Attendance', icon: <MdPeople className="w-6 h-6" />, to: '/foreman/attendance' },
    { label: 'Manage Schedule', icon: <MdCalendarToday className="w-6 h-6" />, to: '/foreman/schedule' },
    { label: 'Task Management', icon: <MdAssignment className="w-6 h-6" />, to: '/foreman/tasks' },
    { label: 'Truck Status', icon: <MdLocalShipping className="w-6 h-6" />, to: '/foreman/trucks' },
    { label: 'Special Pickup', icon: <MdReportProblem className="w-6 h-6" />, to: '/foreman/special-pickup' },
    { label: 'Emergency Alerts', icon: <MdReportProblem className="w-6 h-6" />, to: '/foreman/emergencies' },
    { label: 'Manage Issues', icon: <MdReportProblem className="w-6 h-6" />, to: '/foreman/issues' },
    { label: 'Settings', icon: <MdSettings className="w-6 h-6" />, to: '/foreman/settings' },
  ];

  const handleNavigation = (path, options = {}) => {
    if (options.customAction) {
      options.customAction();
      return;
    }

    if (!options.skipLoading) {
      setIsLoading(true);
    }

    setSidebarOpen(false);

    if (path) {
      setTimeout(() => {
        navigate(path);
        setIsLoading(false);
      }, options.skipLoading ? 0 : 300);
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);

    const userId = localStorage.getItem('user_id');
    if (userId) {
      await authService.logout(parseInt(userId));
    }

    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('token_type');

    await showLoader({
      primaryText: 'Signing you out…',
      secondaryText: 'We\'re securely closing your session.',
      variant: 'login'
    });

    navigate('/', { replace: true });
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    setIsNotificationsLoading(true);
    try {
      const notifRes = await authService.getNotifications();
      const standardNotifs = notifRes.data || [];

      const token = localStorage.getItem('access_token');
      const requestsRes = await fetch(`${authService.resolveAssetUrl('backend/api/list_attendance_requests.php')}?status=pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const requestsData = await requestsRes.json();
      const pendingRequests = requestsData.data?.requests || [];

      const pickupRes = await authService.getPickupRequests({ status: 'pending' });
      const pendingPickups = pickupRes.data || [];

      const requestNotifs = pendingRequests.map(req => ({
        id: `req-${req.id}`,
        type: 'attendance_request',
        title: 'Attendance Verification',
        message: `${req.personnel_name} requested ${req.remarks ? JSON.parse(req.remarks).intent : 'verification'}`,
        created_at: req.submitted_at,
        read: false,
        link: '/foreman/attendance',
        data: req
      }));

      const pickupNotifs = pendingPickups.map(req => ({
        id: `pickup-${req.id || req.request_id}`,
        type: 'pickup_request',
        title: 'New Pickup Request',
        message: `${req.requester_name} requested pickup for ${req.waste_type} in ${req.barangay}`,
        created_at: req.created_at,
        read: false,
        link: '/foreman/special-pickup',
        data: req
      }));

      const allNotifs = [...standardNotifs, ...requestNotifs, ...pickupNotifs].sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      );

      setNotifications(allNotifs);
      setUnreadCount(allNotifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsNotificationsLoading(false);
    }
  };

  useEffect(() => {
    // Simulate initial loading for skeleton
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.read && !notif.id.toString().startsWith('req-') && !notif.id.toString().startsWith('pickup-')) {
      try {
        await authService.markNotificationAsRead(notif.id);
        setNotifications(prev => prev.map(n =>
          n.id === notif.id ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking read:', error);
      }
    }

    setShowNotifications(false);
    if (notif.link) {
      navigate(notif.link);
    } else if (notif.type === 'attendance_request') {
      navigate('/foreman/attendance');
    } else if (notif.type === 'pickup_request') {
      navigate('/foreman/special-pickup');
    }
  };

  const handleClearAll = async () => {
    const standardNotifs = notifications.filter(n => !n.id.toString().startsWith('req-') && !n.id.toString().startsWith('pickup-'));

    setNotifications(prev => prev.filter(n =>
      n.id.toString().startsWith('req-') || n.id.toString().startsWith('pickup-')
    ));
    setUnreadCount(notifications.filter(n =>
      (n.id.toString().startsWith('req-') || n.id.toString().startsWith('pickup-')) && !n.read
    ).length);

    for (const notif of standardNotifs) {
      try {
        await authService.deleteNotification(notif.id);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
    await fetchNotifications();
    setShowClearConfirmModal(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-green-700 to-green-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } flex flex-col shadow-2xl`}
      >
        <div className="p-6 bg-green-800/50 border-b border-green-600">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
              {foremanName.charAt(0)}
            </div>
            <div>
              <h3 className="text-white font-semibold">{foremanName}</h3>
              <p className="text-green-200 text-sm">Foreman</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <button
                  key={link.label}
                  className={`flex items-center w-full px-4 py-3 rounded-xl text-left transition-all duration-200 ${isActive
                    ? 'bg-white text-green-800 shadow-lg'
                    : 'text-white hover:bg-white/10'
                    }`}
                  onClick={() => handleNavigation(link.to)}
                >
                  <span className={`${isActive ? 'text-green-800' : 'text-white'}`}>
                    {link.icon}
                  </span>
                  <span className="ml-3 font-medium">{link.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-green-600">
          <button
            className="flex items-center w-full px-4 py-3 rounded-xl text-left transition-colors bg-red-500 hover:bg-red-600 text-white"
            onClick={() => setShowLogoutModal(true)}
          >
            <MdLogout className="w-6 h-6" />
            <span className="ml-3 font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between bg-green-800 px-4 py-3 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-full text-white hover:text-green-200 focus:outline-none transition-colors md:hidden"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <span className="text-white font-bold text-lg cursor-pointer" onClick={() => handleNavigation('/foreman')}>
            KolekTrash
          </span>

          <div className="relative">
            <button
              onClick={() => navigate('/foreman/notifications')}
              aria-label="Notifications"
              className="relative p-2 rounded-full text-white hover:text-green-200 transition-colors"
            >
              <FiBell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl z-20 overflow-hidden border border-gray-100">
                  <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    <span className="text-xs text-gray-500">{unreadCount} unread</span>
                  </div>

                  {notifications.length > 0 && (
                    <div className="p-2 border-b border-gray-100 flex gap-2">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const standardNotifs = notifications.filter(n => !n.id.toString().startsWith('req-') && !n.id.toString().startsWith('pickup-') && !n.read);

                          setNotifications(prev => prev.map(n =>
                            (!n.id.toString().startsWith('req-') && !n.id.toString().startsWith('pickup-'))
                              ? { ...n, read: true }
                              : n
                          ));
                          setUnreadCount(notifications.filter(n =>
                            (n.id.toString().startsWith('req-') || n.id.toString().startsWith('pickup-')) && !n.read
                          ).length);

                          for (const notif of standardNotifs) {
                            try {
                              await authService.markNotificationAsRead(notif.id);
                            } catch (error) {
                              console.error('Error marking notification as read:', error);
                            }
                          }
                          await fetchNotifications();
                        }}
                        className="flex-1 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark All Read
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowClearConfirmModal(true);
                        }}
                        className="flex-1 px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  )}

                  <div className="max-h-96 overflow-y-auto">
                    {isNotificationsLoading ? (
                      <div className="p-4 space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex gap-3">
                            <Skeleton variant="circular" className="w-8 h-8 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        <FiBell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-green-50/50' : ''}`}
                        >
                          <div className="flex gap-3">
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-green-500' : 'bg-transparent'}`}></div>
                            <div
                              className="flex-1 cursor-pointer"
                              onClick={() => handleNotificationClick(notif)}
                            >
                              <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-2">
                                {new Date(notif.created_at).toLocaleString()}
                              </p>
                            </div>
                            {!notif.id.toString().startsWith('req-') && !notif.id.toString().startsWith('pickup-') && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await authService.deleteNotification(notif.id);
                                    setNotifications(prev => prev.filter(n => n.id !== notif.id));
                                    setUnreadCount(prev => !notif.read ? Math.max(0, prev - 1) : prev);
                                  } catch (error) {
                                    console.error('Error deleting notification:', error);
                                  }
                                }}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 h-full flex flex-col">
              <div className="mb-8">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md p-4 border border-gray-100 flex flex-col items-center justify-center aspect-square">
                    <Skeleton variant="circular" className="w-12 h-12 mb-3" />
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 border border-gray300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-500 rounded-lg text-white font-medium hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Clear All Notifications?</h3>
            <p className="text-gray-600 mb-6">This will permanently delete all your notifications. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-4 py-2 bg-red-500 rounded-lg text-white font-medium hover:bg-red-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
