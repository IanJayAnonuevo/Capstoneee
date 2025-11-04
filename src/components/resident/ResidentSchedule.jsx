import React, { useEffect, useMemo, useState } from 'react';
import { FiFilter, FiMapPin, FiTruck, FiClock, FiAlertCircle, FiChevronDown } from 'react-icons/fi';
import { authService } from '../../services/authService';
import { fetchResidentScheduleMap, scheduleData as fallbackScheduleData } from '../../services/scheduleService';

const clusterStyles = {
  'Priority Barangays': {
    gradient: 'from-emerald-400 to-emerald-600',
    labelText: 'text-emerald-700/80',
    iconColor: 'text-emerald-500',
    timeChip: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    truckChip: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    badgeHighlight: 'bg-emerald-100 text-emerald-700',
  },
  'Priority Cluster': {
    gradient: 'from-emerald-400 to-emerald-600',
    labelText: 'text-emerald-700/80',
    iconColor: 'text-emerald-500',
    timeChip: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    truckChip: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    badgeHighlight: 'bg-emerald-100 text-emerald-700',
  },
  'Metro Sipocot': {
    gradient: 'from-green-400 to-green-600',
    labelText: 'text-green-700/80',
    iconColor: 'text-green-500',
    timeChip: 'bg-green-50 text-green-700 border border-green-100',
    truckChip: 'bg-green-100 text-green-800 border border-green-200',
    badgeHighlight: 'bg-green-100 text-green-700',
  },
  'Cluster A': {
    gradient: 'from-teal-400 to-teal-600',
    labelText: 'text-teal-700/80',
    iconColor: 'text-teal-500',
    timeChip: 'bg-teal-50 text-teal-700 border border-teal-100',
    truckChip: 'bg-teal-100 text-teal-800 border border-teal-200',
    badgeHighlight: 'bg-teal-100 text-teal-700',
  },
  'Cluster B': {
    gradient: 'from-sky-400 to-blue-600',
    labelText: 'text-sky-700/80',
    iconColor: 'text-sky-500',
    timeChip: 'bg-sky-50 text-sky-700 border border-sky-100',
    truckChip: 'bg-sky-100 text-sky-800 border border-sky-200',
    badgeHighlight: 'bg-sky-100 text-sky-700',
  },
  'Cluster C': {
    gradient: 'from-amber-400 to-orange-500',
    labelText: 'text-amber-700/80',
    iconColor: 'text-amber-600',
    timeChip: 'bg-amber-50 text-amber-700 border border-amber-100',
    truckChip: 'bg-amber-100 text-amber-800 border border-amber-200',
    badgeHighlight: 'bg-amber-100 text-amber-700',
  },
  'Cluster D': {
    gradient: 'from-purple-400 to-fuchsia-500',
    labelText: 'text-purple-700/80',
    iconColor: 'text-purple-500',
    timeChip: 'bg-purple-50 text-purple-700 border border-purple-100',
    truckChip: 'bg-purple-100 text-purple-800 border border-purple-200',
    badgeHighlight: 'bg-purple-100 text-purple-700',
  },
  'Unassigned Cluster': {
    gradient: 'from-slate-400 to-slate-600',
    labelText: 'text-slate-700/80',
    iconColor: 'text-slate-500',
    timeChip: 'bg-slate-50 text-slate-700 border border-slate-100',
    truckChip: 'bg-slate-100 text-slate-800 border border-slate-200',
    badgeHighlight: 'bg-slate-100 text-slate-700',
  },
  default: {
    gradient: 'from-slate-400 to-slate-600',
    labelText: 'text-slate-700/80',
    iconColor: 'text-slate-500',
    timeChip: 'bg-slate-50 text-slate-700 border border-slate-100',
    truckChip: 'bg-slate-100 text-slate-800 border border-slate-200',
    badgeHighlight: 'bg-slate-100 text-slate-700',
  },
};

const clusterStyleAliases = {
  'priority barangays': 'Priority Barangays',
  'priority cluster': 'Priority Cluster',
  'metro sipocot': 'Metro Sipocot',
  'metro sipocot cluster': 'Metro Sipocot',
  'metro-sipocot': 'Metro Sipocot',
  'cluster a': 'Cluster A',
  'cluster b': 'Cluster B',
  'cluster c': 'Cluster C',
  'cluster d': 'Cluster D',
  'unassigned cluster': 'Unassigned Cluster',
};

const dynamicClusterPalette = [
  {
    gradient: 'from-lime-400 to-emerald-500',
    labelText: 'text-lime-700/80',
    iconColor: 'text-lime-500',
    timeChip: 'bg-lime-50 text-lime-700 border border-lime-100',
    truckChip: 'bg-lime-100 text-lime-800 border border-lime-200',
    badgeHighlight: 'bg-lime-100 text-lime-700',
  },
  {
    gradient: 'from-cyan-400 to-blue-500',
    labelText: 'text-cyan-700/80',
    iconColor: 'text-cyan-500',
    timeChip: 'bg-cyan-50 text-cyan-700 border border-cyan-100',
    truckChip: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    badgeHighlight: 'bg-cyan-100 text-cyan-700',
  },
  {
    gradient: 'from-rose-400 to-pink-500',
    labelText: 'text-rose-700/80',
    iconColor: 'text-rose-500',
    timeChip: 'bg-rose-50 text-rose-700 border border-rose-100',
    truckChip: 'bg-rose-100 text-rose-800 border border-rose-200',
    badgeHighlight: 'bg-rose-100 text-rose-700',
  },
  {
    gradient: 'from-amber-400 to-yellow-500',
    labelText: 'text-amber-700/80',
    iconColor: 'text-amber-500',
    timeChip: 'bg-amber-50 text-amber-700 border border-amber-100',
    truckChip: 'bg-amber-100 text-amber-800 border border-amber-200',
    badgeHighlight: 'bg-amber-100 text-amber-700',
  },
  {
    gradient: 'from-indigo-400 to-purple-500',
    labelText: 'text-indigo-700/80',
    iconColor: 'text-indigo-500',
    timeChip: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    truckChip: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    badgeHighlight: 'bg-indigo-100 text-indigo-700',
  },
];

const clusterDynamicStyleCache = new Map();

const computeClusterHash = (value = '') => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return hash;
};

const getClusterStyle = (clusterName = '') => {
  const name = clusterName?.toString().trim();
  if (!name) {
    return clusterStyles.default;
  }

  if (clusterStyles[name]) {
    return clusterStyles[name];
  }

  const normalized = name.toLowerCase();
  const aliasKey = clusterStyleAliases[normalized];
  if (aliasKey && clusterStyles[aliasKey]) {
    return clusterStyles[aliasKey];
  }

  if (!clusterDynamicStyleCache.has(normalized)) {
    const paletteIndex = computeClusterHash(normalized) % dynamicClusterPalette.length;
    clusterDynamicStyleCache.set(normalized, { ...dynamicClusterPalette[paletteIndex] });
  }

  return clusterDynamicStyleCache.get(normalized) || clusterStyles.default;
};

const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dayNames = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

const normalizeBarangay = (value = '') =>
  value
    .toString()
    .replace(/[_-]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const formatBarangay = (value = '') =>
  value
    .toLowerCase()
    .split(' ')
    .map(word =>
      word
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-')
    )
    .join(' ');

const getBarangayInitial = (value = '') => {
  const firstChar = value.trim().charAt(0);
  return firstChar ? firstChar.toUpperCase() : '?';
};

const toDisplayTime = (time = '') => {
  if (!time) return '';
  const [hourStr, minuteStr = '00'] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const minutes = minuteStr.padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minutes} ${ampm}`;
};

const toMinutes = (time = '') => {
  const [hourStr, minuteStr = '0'] = time.split(':');
  return parseInt(hourStr || '0', 10) * 60 + parseInt(minuteStr || '0', 10);
};

export default function ResidentSchedule() {
  const [selectedCluster, setSelectedCluster] = useState('All Clusters');
  const [autoSelectCluster, setAutoSelectCluster] = useState(true);
  const [showMyBarangayOnly, setShowMyBarangayOnly] = useState(false);
  const [userBarangay, setUserBarangay] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [scheduleMap, setScheduleMap] = useState({});
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [scheduleError, setScheduleError] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          setLoadingUser(false);
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        const resolvedId = parsedUser.user_id || parsedUser.id;

        if (!resolvedId) {
          setLoadingUser(false);
          return;
        }

        const response = await authService.getUserData(resolvedId);

        if (response.status === 'success') {
          const data = response.data || {};
          setUserBarangay(data.barangay || data.barangay_name || '');
        } else {
          setUserBarangay(parsedUser.barangay || parsedUser.barangay_name || '');
          setErrorMessage('We could not personalize your schedule completely. Showing default overview.');
        }
      } catch (error) {
        console.error('Failed to load user data for schedule:', error);
        setErrorMessage('We could not personalize your schedule completely. Showing default overview.');
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchSchedules = async () => {
      setLoadingSchedule(true);
      try {
        const map = await fetchResidentScheduleMap({ signal: controller.signal });
        if (!isMounted) return;
        setScheduleMap(map);
        setScheduleError('');
      } catch (error) {
        if (error?.name === 'AbortError') return;
        console.error('Failed to load resident schedules from predefined data:', error);
        if (!isMounted) return;
        setScheduleError('We had trouble loading the live schedule, so a fallback plan is shown.');
        setScheduleMap(fallbackScheduleData);
      } finally {
        if (isMounted) {
          setLoadingSchedule(false);
        }
      }
    };

    fetchSchedules();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const scheduleEntries = useMemo(() => {
    const entries = [];

    Object.entries(scheduleMap || {}).forEach(([cluster, trucks]) => {
      Object.entries(trucks || {}).forEach(([truck, days]) => {
        (Array.isArray(days) ? days : []).forEach(daySchedule => {
          if (!daySchedule || !daySchedule.day) return;
          const events = Array.isArray(daySchedule.events) ? daySchedule.events : [];
          events.forEach(event => {
            if (!event) return;
            const startTime = event.time || '';
            entries.push({
              id: `${cluster}-${truck}-${daySchedule.day}-${event.label}-${startTime}`,
              cluster,
              truck,
              day: daySchedule.day,
              dayName: dayNames[daySchedule.day] || daySchedule.day,
              dateNumber: daySchedule.date,
              barangay: formatBarangay(event.label),
              barangayNormalized: normalizeBarangay(event.label),
              startTime,
              endTime: event.end,
            });
          });
        });
      });
    });

    return entries.sort((a, b) => {
      const dayDifference = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDifference !== 0) return dayDifference;
      return toMinutes(a.startTime) - toMinutes(b.startTime);
    });
  }, [scheduleMap]);

  const normalizedBarangay = normalizeBarangay(userBarangay);

  const residentCluster = useMemo(() => {
    if (!normalizedBarangay) return null;
    const match = scheduleEntries.find(entry => entry.barangayNormalized === normalizedBarangay);
    return match ? match.cluster : null;
  }, [normalizedBarangay, scheduleEntries]);

  useEffect(() => {
    if (!residentCluster || !autoSelectCluster) {
      return;
    }
    setSelectedCluster((current) => {
      if (!current || current === 'All Clusters') {
        return residentCluster;
      }
      return current;
    });
  }, [residentCluster, autoSelectCluster]);

  useEffect(() => {
    if (selectedCluster !== 'All Clusters' && scheduleMap && !scheduleMap[selectedCluster]) {
      setSelectedCluster('All Clusters');
      setAutoSelectCluster(false);
    }
  }, [selectedCluster, scheduleMap]);

  const handleClusterChange = (value) => {
    setAutoSelectCluster(false);
    setSelectedCluster(value);
  };

  const handleToggleMyBarangay = () => {
    if (!normalizedBarangay) {
      return;
    }
    setShowMyBarangayOnly((prev) => {
      const next = !prev;
      if (next && residentCluster) {
        setSelectedCluster(residentCluster);
      }
      setAutoSelectCluster(false);
      return next;
    });
  };

  const clusters = useMemo(() => {
    const clusterNames = Object.keys(scheduleMap || {});
    clusterNames.sort((a, b) => a.localeCompare(b));
    return ['All Clusters', ...clusterNames];
  }, [scheduleMap]);

  const filteredEntries = useMemo(() => {
    return scheduleEntries.filter(entry => {
      if (selectedCluster !== 'All Clusters' && entry.cluster !== selectedCluster) {
        return false;
      }
      if (showMyBarangayOnly && normalizedBarangay) {
        return entry.barangayNormalized === normalizedBarangay;
      }
      return true;
    });
  }, [scheduleEntries, selectedCluster, showMyBarangayOnly, normalizedBarangay]);

  const groupedSchedules = useMemo(() => {
    const groups = filteredEntries.reduce((acc, entry) => {
      if (!acc[entry.day]) {
        acc[entry.day] = [];
      }
      acc[entry.day].push(entry);
      return acc;
    }, {});

    return dayOrder
      .filter(day => groups[day]?.length)
      .map(day => ({
        day,
        dayName: dayNames[day] || day,
        dateNumber: groups[day][0]?.dateNumber,
        items: groups[day].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)),
      }));
  }, [filteredEntries]);

  if (loadingUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 px-4">
        <div className="bg-white shadow-lg border border-green-100 rounded-2xl px-6 py-5 flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-green-700">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-gradient-to-br from-green-50 via-white to-green-50 py-6 px-3 sm:py-8 sm:px-4">
      <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6">
        <div className="bg-white rounded-3xl shadow-xl border border-green-100/70 p-4 sm:p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-green-900 tracking-tight">Collection Schedule Overview</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                {normalizedBarangay
                  ? `Showing schedules for barangays under ${residentCluster || 'your assigned'} cluster.`
                  : 'Browse the planned collection schedules for each cluster.'}
              </p>
              {normalizedBarangay && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  <FiMapPin className="text-green-600" />
                  <span>Your Barangay: {formatBarangay(userBarangay)}</span>
                  {residentCluster && <span className="text-xs text-green-600/80">({residentCluster})</span>}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
              <label className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white text-sm">
                <FiFilter className="text-green-600" />
                <select
                  value={selectedCluster}
                  onChange={(e) => handleClusterChange(e.target.value)}
                  className="bg-transparent focus:outline-none text-gray-800"
                >
                  {clusters.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={handleToggleMyBarangay}
                disabled={!normalizedBarangay}
                className={`px-3 py-2 sm:px-4 rounded-xl text-sm font-semibold transition-colors border ${
                  showMyBarangayOnly
                    ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                    : 'bg-white text-green-700 border-green-200 hover:bg-green-50'
                } ${!normalizedBarangay ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                {showMyBarangayOnly ? 'Showing My Barangay' : 'Focus on My Barangay'}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              <FiAlertCircle className="text-yellow-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {scheduleError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <FiAlertCircle className="text-red-500" />
              <span>{scheduleError}</span>
            </div>
          )}

          <div className="mt-5 space-y-3 sm:space-y-4">
            {loadingSchedule ? (
              <div className="border border-green-200 rounded-2xl bg-white/80 py-12 sm:py-16 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-base font-semibold text-green-800">Loading collection schedules...</p>
                <p className="text-sm text-green-700 mt-1">Fetching the latest predefined routes from MENRO.</p>
              </div>
            ) : groupedSchedules.length === 0 ? (
              <div className="border border-dashed border-green-200 rounded-2xl bg-green-50/50 py-16 flex flex-col items-center justify-center text-center">
                <div className="text-3xl mb-3">🗓️</div>
                <p className="text-base font-semibold text-green-800">No schedules found for this selection</p>
                <p className="text-sm text-green-700 mt-1">Try choosing a different cluster or show all barangays.</p>
              </div>
            ) : (
              groupedSchedules.map(group => (
                <details
                  key={group.day}
                  open
                  className="group rounded-2xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5"
                >
                  <summary className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 text-left list-none cursor-pointer sm:cursor-default [&::-webkit-details-marker]:hidden">
                    <div>
                      <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">{group.dayName}</h2>
                      {group.dateNumber && (
                        <p className="text-[11px] sm:text-xs uppercase tracking-wide text-gray-500">Weekday Slot • Day {group.dateNumber}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2">
                      <p className="text-[11px] sm:text-xs text-gray-500 font-medium tracking-wide">
                        {group.items.length} scheduled {group.items.length === 1 ? 'barangay' : 'barangays'}
                      </p>
                      <FiChevronDown className="h-4 w-4 text-gray-400 transition-transform sm:hidden group-open:rotate-180" />
                    </div>
                  </summary>

                  <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                    {group.items.map(item => {
                      const clusterStyle = getClusterStyle(item.cluster);
                      return (
                        <div
                          key={item.id}
                          className="relative overflow-hidden rounded-xl border border-white/80 bg-white/95 shadow-sm backdrop-blur px-4 py-4 sm:px-5 sm:py-5"
                        >
                          <div className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${clusterStyle.gradient}`}></div>
                          <div className="flex flex-col gap-3 sm:gap-4">
                            <div className="flex items-start gap-3">
                              <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${clusterStyle.gradient} text-white text-base sm:text-lg font-semibold shadow-inner`}>
                                {getBarangayInitial(item.barangay)}
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className={`text-[11px] sm:text-xs font-semibold uppercase tracking-wide ${clusterStyle.labelText}`}>
                                  {item.cluster}
                                </p>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug">{item.barangay}</h3>
                                {normalizedBarangay && item.barangayNormalized === normalizedBarangay && (
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${clusterStyle.badgeHighlight}`}>
                                    <FiMapPin className="h-3 w-3" /> Your Barangay
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center sm:items-end justify-between gap-2 sm:gap-3 text-[12px] sm:text-sm text-gray-600">
                              <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold ${clusterStyle.timeChip}`}>
                                <FiClock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                {`${toDisplayTime(item.startTime)} – ${toDisplayTime(item.endTime)}`}
                              </span>
                              <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium ${clusterStyle.truckChip}`}>
                                <FiTruck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                {item.truck}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </details>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
