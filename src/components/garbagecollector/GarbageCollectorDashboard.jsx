import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiBell, FiClock, FiCalendar, FiMapPin, FiCheckSquare, FiSettings } from 'react-icons/fi';
import { MdHome, MdLogout } from 'react-icons/md';
import { IoChevronForward } from 'react-icons/io5';
import { authService } from '../../services/authService';
import { StatusProvider } from '../../contexts/StatusContext';
import { calculateUnreadCount, dispatchNotificationCount } from '../../utils/notificationUtils';
import { buildApiUrl } from '../../config/api';
import BrandedLoader from '../shared/BrandedLoader';
import { useLoader } from '../../contexts/LoaderContext';

const navigation = [
  { name: 'Home', icon: <MdHome className="w-6 h-6" />, href: '/garbagecollector', showLoading: true },
  { name: 'Attendance', icon: <FiClock className="w-6 h-6" />, href: '/garbagecollector/attendance', showLoading: true },
  { name: 'Collection Schedule', icon: <FiCalendar className="w-6 h-6" />, href: '/garbagecollector/schedule', showLoading: true },
  { name: 'Routes', icon: <FiMapPin className="w-6 h-6" />, href: '/garbagecollector/routes', showLoading: true },
  { name: 'Tasks', icon: <FiCheckSquare className="w-6 h-6" />, href: '/garbagecollector/tasks', showLoading: true },
  { name: 'Settings', icon: <FiSettings className="w-6 h-6" />, href: '/garbagecollector/settings', showLoading: true },
  { name: 'Logout', icon: <MdLogout className="w-6 h-6 text-red-500" />, action: () => { }, showLoading: false },
];

export default function GarbageCollectorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [resolvedUserId, setResolvedUserId] = useState(null);
  const [assignmentTeamIds, setAssignmentTeamIds] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState('');
  const [avatarCooldownUntil, setAvatarCooldownUntil] = useState(null);
  const fileInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { showLoader } = useLoader();

  const normalizeAvatarUrl = (value) => {
    if (!value || typeof value !== 'string') return null;
    if (value.startsWith('blob:') || value.startsWith('data:')) {
      return value;
    }
    return authService.resolveAssetUrl(value);
  };

  const COOLDOWN_DURATION_MS = 24 * 60 * 60 * 1000;
  const AUTO_ROUTE_KEY_PREFIX = 'collector:autoRoute:v1:';

  const authHeaders = React.useCallback(() => {
    try {
      const token = localStorage.getItem('access_token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch (_) {
      return {};
    }
  }, []);

  const parseServerTime = React.useCallback((value) => {
    if (!value || typeof value !== 'string') return null;
    const normalized = value.replace(' ', 'T');
    const msWithZ = Date.parse(`${normalized}Z`);
    if (!Number.isNaN(msWithZ)) return msWithZ;
    const msLocal = Date.parse(normalized);
    return Number.isNaN(msLocal) ? null : msLocal;
  }, []);

  const parseServerTimestamp = (value) => {
    if (!value || typeof value !== 'string') return null;
    const formatted = value.replace(' ', 'T');
    const candidate = `${formatted}+08:00`;
    const parsed = Date.parse(candidate);
    if (Number.isNaN(parsed)) {
      const fallback = Date.parse(value);
      return Number.isNaN(fallback) ? null : fallback;
    }
    return parsed;
  };

  const computeCooldownUntil = (timestampString) => {
    const parsed = parseServerTimestamp(timestampString);
    if (!parsed) return null;
    const target = parsed + COOLDOWN_DURATION_MS;
    return target > Date.now() ? target : null;
  };

  const formatCooldownMessage = (targetMs) => {
    if (!targetMs) return '';
    const diffMs = targetMs - Date.now();
    if (diffMs <= 0) return '';
    const totalMinutes = Math.ceil(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `You can change your photo again in ${hours}h ${minutes}m.`;
    }
    return `You can change your photo again in ${totalMinutes} minute${totalMinutes === 1 ? '' : 's'}.`;
  };

  const getAvatarStorageKey = () => {
    const identifier = resolvedUserId || user?.user_id || user?.id || localStorage.getItem('user_id');
    return identifier ? `garbageCollectorAvatar:${identifier}` : null;
  };

  const handleAvatarClick = () => {
    if (isAvatarUploading) {
      return;
    }

    if (avatarCooldownUntil && avatarCooldownUntil <= Date.now()) {
      setAvatarCooldownUntil(null);
    }

    if (avatarCooldownUntil && avatarCooldownUntil > Date.now()) {
      setAvatarUploadError(formatCooldownMessage(avatarCooldownUntil));
      return;
    }

    setAvatarUploadError('');
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) {
      return;
    }

    const targetUserId = resolvedUserId || user?.user_id || user?.id || localStorage.getItem('user_id');
    if (!targetUserId) {
      setAvatarUploadError('Profile is still loading. Try again soon.');
      event.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAvatarUploadError('Use a PNG, JPG, WEBP, or GIF image.');
      event.target.value = '';
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setAvatarUploadError('Image must be smaller than 2 MB.');
      event.target.value = '';
      return;
    }

    setAvatarUploadError('');
    const previousAvatar = avatarPreview;
    const tempPreview = URL.createObjectURL(file);
    setAvatarPreview(tempPreview);
    setIsAvatarUploading(true);

    try {
      const formData = new FormData();
      formData.append('user_id', targetUserId);
      formData.append('avatar', file);

      const response = await authService.uploadProfileImage(formData);
      if (response?.status === 'success') {
        const relativePath = response?.data?.relativePath || response?.relativePath || null;
        const providedUrl = response?.data?.imageUrl || response?.imageUrl || tempPreview;
        const resolvedUrl = normalizeAvatarUrl(relativePath || providedUrl);

        setAvatarPreview(resolvedUrl);

        const key = getAvatarStorageKey();
        if (key && resolvedUrl) {
          localStorage.setItem(key, resolvedUrl);
        }

        const updatedAt = response?.data?.updatedAt || null;
        const cooldownUntil = computeCooldownUntil(updatedAt) || (Date.now() + COOLDOWN_DURATION_MS);
        setAvatarCooldownUntil(cooldownUntil);

        setUser((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            profile_image: relativePath || prev.profile_image || providedUrl,
            profile_image_updated_at: updatedAt || prev?.profile_image_updated_at,
            avatar: resolvedUrl,
          };
        });

        try {
          const stored = localStorage.getItem('user');
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.profile_image = relativePath || parsed.profile_image || providedUrl;
            parsed.profile_image_updated_at = updatedAt || parsed.profile_image_updated_at;
            parsed.avatar = resolvedUrl;
            localStorage.setItem('user', JSON.stringify(parsed));
          }
        } catch (storageError) {
          console.error('Unable to update stored user with new avatar:', storageError);
        }
      } else {
        setAvatarPreview(previousAvatar || null);
        setAvatarUploadError(response?.message || 'Upload failed. Please try again.');
      }
    } catch (error) {
      setAvatarPreview(previousAvatar || null);
      let fallbackMessage = error?.message || 'Upload failed. Please try again.';
      const payload = error?.payload;
      if (payload?.cooldownRemainingSeconds) {
        let cooldownUntil = null;
        if (payload?.cooldownEndsAt) {
          cooldownUntil = payload.cooldownEndsAt * 1000;
        } else {
          cooldownUntil = Date.now() + payload.cooldownRemainingSeconds * 1000;
        }
        if (cooldownUntil) {
          setAvatarCooldownUntil(cooldownUntil);
          const message = formatCooldownMessage(cooldownUntil);
          if (message) {
            fallbackMessage = message;
          }
        }
      }
      setAvatarUploadError(fallbackMessage);
    } finally {
      setIsAvatarUploading(false);
      URL.revokeObjectURL(tempPreview);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Check for URL parameters (backup method)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const routeStarted = urlParams.get('route_started');
    const barangay = urlParams.get('barangay');

    if (routeStarted) {
      console.log('Route started detected via URL - Route ID:', routeStarted, 'Barangay:', barangay);
      // Clear URL parameters for clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Navigate to routes page
      navigate('/garbagecollector/routes');
    }
  }, [navigate]);

  // Auto-redirect removed per request



  // Fetch user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const fallbackId = localStorage.getItem('user_id');
          const computedUserId = parsed.user_id || parsed.id || fallbackId;

          if (computedUserId) {
            const response = await authService.getUserData(computedUserId);
            if (response.status === 'success') {
              setUser(response.data);
              setResolvedUserId(computedUserId);
              const avatarKey = `garbageCollectorAvatar:${computedUserId}`;
              const remoteAvatar = normalizeAvatarUrl(response.data?.profile_image || response.data?.avatar || response.data?.profileImage || null);
              const storedAvatar = normalizeAvatarUrl(localStorage.getItem(avatarKey));
              setAvatarPreview(remoteAvatar || storedAvatar || null);
              setAvatarCooldownUntil(computeCooldownUntil(response.data?.profile_image_updated_at));
            } else {
              console.error('Failed to fetch user data:', response.message);
              setUser(parsed);
              if (computedUserId) {
                setResolvedUserId(computedUserId);
                const avatarKey = `garbageCollectorAvatar:${computedUserId}`;
                const storedAvatar = normalizeAvatarUrl(localStorage.getItem(avatarKey));
                const fallbackAvatar = normalizeAvatarUrl(parsed?.profile_image || parsed?.avatar || parsed?.profileImage || null);
                setAvatarPreview(fallbackAvatar || storedAvatar || null);
                setAvatarCooldownUntil(computeCooldownUntil(parsed?.profile_image_updated_at));
              }
            }
          } else {
            setUser(parsed);
            if (fallbackId) {
              setResolvedUserId(fallbackId);
              const avatarKey = `garbageCollectorAvatar:${fallbackId}`;
              const storedAvatar = normalizeAvatarUrl(localStorage.getItem(avatarKey));
              const fallbackAvatar = normalizeAvatarUrl(parsed?.profile_image || parsed?.avatar || parsed?.profileImage || null);
              setAvatarPreview(fallbackAvatar || storedAvatar || null);
              setAvatarCooldownUntil(computeCooldownUntil(parsed?.profile_image_updated_at));
            }
          }
        } else {
          console.warn('No user data found in localStorage');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            const fallbackId = parsed?.user_id || parsed?.id || localStorage.getItem('user_id');
            if (fallbackId) {
              setResolvedUserId(fallbackId);
              const avatarKey = `garbageCollectorAvatar:${fallbackId}`;
              const storedAvatar = normalizeAvatarUrl(localStorage.getItem(avatarKey));
              const fallbackAvatar = normalizeAvatarUrl(parsed?.profile_image || parsed?.avatar || parsed?.profileImage || null);
              setAvatarPreview(fallbackAvatar || storedAvatar || null);
              setAvatarCooldownUntil(computeCooldownUntil(parsed?.profile_image_updated_at));
            }
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch collector assignments (team IDs) for auto-start routing
  useEffect(() => {
    if (!resolvedUserId) return;
    let cancelled = false;

    const loadAssignments = async () => {
      try {
        const res = await fetch(buildApiUrl(`get_personnel_schedule.php?user_id=${resolvedUserId}&role=collector`), {
          headers: { ...authHeaders() }
        });
        const data = await res.json().catch(() => null);
        if (cancelled || !data?.success || !Array.isArray(data.schedules)) return;
        const ids = Array.from(
          new Set(
            data.schedules
              .map((schedule) => {
                const raw = schedule?.team_id ?? schedule?.teamId ?? schedule?.assignment_id;
                if (raw === undefined || raw === null || raw === '') return null;
                const num = Number(raw);
                return Number.isFinite(num) && num > 0 ? num : null;
              })
              .filter(Boolean)
          )
        );
        setAssignmentTeamIds(ids);
        try {
          localStorage.setItem(`collector:teamIds:${resolvedUserId}`, JSON.stringify(ids));
        } catch (_) { }
      } catch (error) {
        console.error('Failed to load collector assignments for auto-start:', error);
        try {
          const cached = JSON.parse(localStorage.getItem(`collector:teamIds:${resolvedUserId}`) || '[]');
          if (Array.isArray(cached) && cached.length) {
            setAssignmentTeamIds((prev) => (prev.length ? prev : cached));
          }
        } catch (_) { }
      }
    };

    loadAssignments();
    return () => {
      cancelled = true;
    };
  }, [resolvedUserId, authHeaders]);

  // Poll active routes; auto-redirect collectors when their driver starts a task
  useEffect(() => {
    if (!resolvedUserId || !assignmentTeamIds.length) return;
    let cancelled = false;
    let timeoutId = null;
    const RECENT_WINDOW_MS = 6 * 60 * 60 * 1000;
    const autoKey = `${AUTO_ROUTE_KEY_PREFIX}${resolvedUserId}`;

    const readAutoRecord = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(autoKey) || 'null');
        if (stored && typeof stored === 'object') return stored;
        if (stored && Number.isFinite(stored)) {
          return { routeId: Number(stored), startedAt: null };
        }
      } catch (_) { }
      return null;
    };

    const writeAutoRecord = (routeId, startedAt) => {
      try {
        localStorage.setItem(autoKey, JSON.stringify({ routeId, startedAt }));
      } catch (_) { }
    };

    const pollActiveRoutes = async () => {
      try {
        const res = await fetch(buildApiUrl(`get_active_routes.php?user_id=${resolvedUserId}`), {
          headers: { ...authHeaders() }
        });
        const data = await res.json().catch(() => null);
        if (!data?.success || cancelled) return;
        const now = Date.now();
        const activeRoutes = Array.isArray(data.active_routes) ? data.active_routes : [];
        const normalized = activeRoutes
          .map((route) => {
            const routeId = Number(route?.route_id ?? route?.id ?? 0);
            const teamId = Number(route?.team_id ?? route?.assignment_id ?? route?.teamId ?? 0);
            const startedAt = route?.started_at || null;
            const startedMs = startedAt ? parseServerTime(startedAt) : null;
            return { routeId, teamId, startedAt, startedMs, raw: route };
          })
          .filter((entry) => entry.routeId > 0 && entry.teamId > 0)
          .filter((entry) => assignmentTeamIds.some((id) => Number(id) === entry.teamId))
          .filter((entry) => {
            if (!entry.startedMs) return true;
            return now - entry.startedMs <= RECENT_WINDOW_MS;
          })
          .sort((a, b) => (b.startedMs || 0) - (a.startedMs || 0));

        if (!normalized.length) return;

        const candidate = normalized[0];
        const lastRecord = readAutoRecord();
        const alreadyHandled =
          lastRecord &&
          lastRecord.routeId === candidate.routeId &&
          (candidate.startedAt ? lastRecord.startedAt === candidate.startedAt : true);

        if (alreadyHandled) return;

        const onRoutePage = location.pathname.startsWith(`/garbagecollector/route/${candidate.routeId}`);
        writeAutoRecord(candidate.routeId, candidate.startedAt || null);
        if (!onRoutePage) {
          navigate(`/garbagecollector/route/${candidate.routeId}`, {
            state: {
              autoStarted: true,
              barangay: candidate.raw?.barangay || candidate.raw?.barangay_name || ''
            }
          });
        }
      } catch (error) {
        console.error('Failed to poll active routes for auto-start:', error);
      } finally {
        if (!cancelled) {
          timeoutId = setTimeout(pollActiveRoutes, 10000);
        }
      }
    };

    pollActiveRoutes();
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [resolvedUserId, assignmentTeamIds, authHeaders, navigate, location.pathname, parseServerTime]);


  // Fetch unread notifications count periodically
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const uidFromUser = (() => {
      try { return storedUser ? JSON.parse(storedUser)?.user_id || JSON.parse(storedUser)?.id : null; } catch { return null; }
    })();
    const uid = localStorage.getItem('user_id') || uidFromUser || user?.user_id || user?.id;
    if (!uid) return;

    setResolvedUserId((current) => (current ? current : uid));

    let isActive = true;

    const loadUnread = async () => {
      try {
        const token = (() => { try { return localStorage.getItem('access_token'); } catch { return null; } })();
        const res = await fetch(buildApiUrl(`get_notifications.php?recipient_id=${uid}`), { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        const data = await res.json();
        if (isActive && data?.success) {
          const notifications = data.notifications || [];
          const count = calculateUnreadCount(notifications);
          setUnreadNotifications(count);
          dispatchNotificationCount(uid, notifications);
        }
      } catch (_) {
        // ignore network errors for badge
      }
    };

    loadUnread();
    const intervalId = setInterval(loadUnread, 60000); // refresh every 60s
    return () => { isActive = false; clearInterval(intervalId); };
  }, [user]);

  useEffect(() => {
    if (!resolvedUserId) return;

    const handleSync = (event) => {
      const { userId, count } = event.detail || {};
      if (String(userId) === String(resolvedUserId)) {
        setUnreadNotifications(count);
      }
    };

    window.addEventListener('notificationsUpdated', handleSync);
    return () => window.removeEventListener('notificationsUpdated', handleSync);
  }, [resolvedUserId]);

  // User profile from database
  const fallbackName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim();
  const displayName = (user?.fullName && user.fullName.trim()) || fallbackName || 'Loading...';
  const derivedAvatar = normalizeAvatarUrl(user?.profile_image || user?.avatar || user?.profileImage || null);
  const effectiveAvatar = avatarPreview || derivedAvatar || null;
  const avatarLetter = displayName && displayName !== 'Loading...' ? displayName.charAt(0).toUpperCase() : 'G';

  const userProfile = {
    name: displayName,
    role: user?.role || 'Garbage Collector',
    avatarUrl: effectiveAvatar,
    avatarInitial: avatarLetter,
    username: user?.username || '',
    email: user?.email || '',
    assignedArea: user?.assignedArea || ''
  };

  const activeCooldownMessage = avatarUploadError ? '' : formatCooldownMessage(avatarCooldownUntil);

  const confirmLogout = async () => {
    setShowLogoutModal(false);

    // Call logout API to set online_status to offline
    const userId = localStorage.getItem('user_id');
    if (userId) {
      const { authService } = await import('../../services/authService');
      await authService.logout(parseInt(userId));
    }

    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    await showLoader({
      primaryText: 'Signing you out…',
      secondaryText: 'We\'re securely closing your session.',
      variant: 'login'
    });
    navigate('/login', { replace: true });
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleNavigation = (targetPath, options = {}) => {
    const { skipLoading = false, closeSidebar = false, customAction } = options;

    if (!skipLoading && targetPath && location.pathname !== targetPath) {
      void showLoader({
        primaryText: 'Loading your next view…',
        secondaryText: 'We’re preparing the section you selected.',
        variant: 'login'
      });
    }

    if (closeSidebar) {
      setSidebarOpen(false);
    }

    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath);
    }

    if (customAction) {
      customAction();
    }
  };

  return (
    <StatusProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 w-full max-w-full relative">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleAvatarChange}
        />
        {/* Loading state */}
        <BrandedLoader
          visible={loading}
          primaryText="Loading your dashboard…"
          secondaryText="Getting your collector tools ready."
          variant="login"
        />

        {/* Hamburger Menu Drawer (Mobile) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setSidebarOpen(false)} />
            <div className="relative bg-white w-[320px] max-w-[88%] h-full shadow-2xl z-50 animate-fadeInLeft flex flex-col rounded-r-2xl overflow-hidden">
              {/* Profile Section */}
              <div className="bg-gradient-to-b from-green-800 to-green-700 px-5 pt-6 pb-5 relative">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute right-3 top-3 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <FiX className="w-5 h-5" />
                </button>
                <div className="flex items-center text-left gap-3">
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    title="Change profile picture"
                    className="relative w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shrink-0 shadow-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-green-200 focus:ring-offset-2 focus:ring-offset-green-700"
                  >
                    {isAvatarUploading ? (
                      <span className="w-6 h-6 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
                    ) : userProfile.avatarUrl ? (
                      <img src={userProfile.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-green-800 font-bold text-lg">{userProfile.avatarInitial}</span>
                    )}
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-white bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">Change</span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-white font-semibold text-[15px] leading-tight truncate w-full">{userProfile.name}</h2>
                    <p className="mt-0.5 text-emerald-50/90 text-[12px]">{userProfile.role}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="flex-1 overflow-y-auto py-4 px-3 bg-gradient-to-b from-white to-emerald-50/30">
                <div className="space-y-2">
                  {navigation.filter(l => l.name !== 'Logout').map((item) => {
                    const isActive = item.href && location.pathname === item.href;
                    return (
                      <button
                        key={item.name}
                        className={`group flex items-center w-full px-4 py-3 rounded-xl text-left transition-all border
                        ${isActive
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-100'}
                      `}
                        onClick={() => handleNavigation(item.href, {
                          closeSidebar: true,
                          skipLoading: item.showLoading === false,
                          customAction: item.action
                        })}
                      >
                        <span className={`flex items-center justify-center w-9 h-9 rounded-lg mr-3 ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'}`}>
                          {item.icon}
                        </span>
                        <span className={`text-sm font-semibold flex-1 text-left ${isActive ? 'text-white' : 'text-emerald-900'}`}>{item.name}</span>
                        <IoChevronForward className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400 group-hover:text-emerald-600'}`} />
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* Logout */}
              <div className="px-3 pb-4 pt-2 bg-white border-t border-emerald-100">
                <button
                  className="flex items-center w-full px-4 py-3 rounded-xl text-left transition-colors bg-red-50 hover:bg-red-100 text-red-700 border border-red-100"
                  onClick={() => handleNavigation(undefined, { closeSidebar: true, skipLoading: true, customAction: () => setShowLogoutModal(true) })}
                >
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg mr-3 bg-red-100 text-red-600">
                    {navigation.find(n => n.name === 'Logout')?.icon}
                  </span>
                  <span className="text-sm font-semibold">Logout</span>
                  <IoChevronForward className="w-4 h-4 ml-auto text-red-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-sm w-full flex flex-col items-center animate-fadeIn">
              <h2 className="text-2xl font-bold text-emerald-700 mb-4">Confirm Logout</h2>
              <p className="mb-6 text-gray-700 text-center">Are you sure you want to log out?</p>
              <div className="flex gap-4 w-full">
                <button
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition focus:outline-emerald-700 focus:ring-2 focus:ring-red-200"
                  onClick={confirmLogout}
                >
                  Yes, Logout
                </button>
                <button
                  className="flex-1 py-2 rounded-lg border border-gray-300 bg-white text-emerald-700 font-semibold shadow hover:bg-gray-50 transition focus:outline-emerald-700 focus:ring-2 focus:ring-emerald-100"
                  onClick={cancelLogout}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Bar */}
        <div className="flex items-center justify-between bg-green-800 px-4 py-3 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-full text-white hover:text-green-200 focus:outline-none transition-colors duration-150 group"
            style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
          >
            <FiMenu className="w-6 h-6 group-hover:scale-110 group-focus:scale-110 transition-transform duration-150" />
          </button>
          <span
            className="text-white font-bold text-lg tracking-wide cursor-pointer hover:text-green-200 transition-colors duration-150"
            onClick={() => handleNavigation('/garbagecollector')}
          >
            KolekTrash
          </span>
          <div className="flex items-center gap-2">
            <button
              aria-label="Notifications"
              className="relative p-2 rounded-full text-white hover:text-green-200 focus:outline-none transition-colors duration-150 group"
              style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
              onClick={() => handleNavigation('/garbagecollector/notifications')}
            >
              <FiBell className="w-6 h-6 group-hover:scale-110 group-focus:scale-110 transition-transform duration-150" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold border border-white">{unreadNotifications}</span>
              )}
            </button>
          </div>
        </div>


        {/* Main Content */}
        <div className="flex-1 flex flex-col w-full">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="mt-auto text-xs text-center text-white bg-green-800 py-2 w-full">
          © 2025 Municipality of Sipocot – MENRO. All rights reserved.
        </footer>
      </div>
    </StatusProvider>
  );
}
