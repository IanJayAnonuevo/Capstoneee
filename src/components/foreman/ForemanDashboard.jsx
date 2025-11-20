import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiBell } from 'react-icons/fi';
import { MdLogout, MdPeople, MdCalendarToday, MdAssignment, MdLocalShipping, MdReportProblem, MdSettings } from 'react-icons/md';
import logo from '../../assets/logo/logo.png';
import { useLoader } from '../../contexts/LoaderContext';
import { authService } from '../../services/authService';

export default function ForemanDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { showLoader } = useLoader();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const foremanName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user.username || 'Foreman';

  const navLinks = [
    { label: 'Monitor Attendance', icon: <MdPeople className="w-6 h-6" />, to: '/foreman/attendance' },
    { label: 'Manage Schedule', icon: <MdCalendarToday className="w-6 h-6" />, to: '/foreman/schedule' },
    { label: 'Task Management', icon: <MdAssignment className="w-6 h-6" />, to: '/foreman/tasks' },
    { label: 'Truck Status', icon: <MdLocalShipping className="w-6 h-6" />, to: '/foreman/trucks' },
    { label: 'Special Pickup', icon: <MdReportProblem className="w-6 h-6" />, to: '/foreman/special-pickup' },
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
    
    // Call logout API to set online_status to offline
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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-green-700 to-green-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col shadow-2xl`}
      >
        {/* User Info */}
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <button
                  key={link.label}
                  className={`flex items-center w-full px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    isActive
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

        {/* Logout Button */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
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
          <button
            aria-label="Notifications"
            className="relative p-2 rounded-full text-white hover:text-green-200 transition-colors"
          >
            <FiBell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
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

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <p className="text-gray-700 font-medium">Loading...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
