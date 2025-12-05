import React, { useState, useEffect } from 'react';
import RouteMap from './RouteMap';
import DashboardCard from '../common/DashboardCard';
import GenerateRoutesButton from './GenerateRoutesButton';
import { buildApiUrl } from '../../config/api';

const getAuthToken = () => {
    try {
        return localStorage.getItem('access_token');
    } catch (err) {
        console.warn('Unable to read access token', err);
        return null;
    }
};

const getAuthHeaders = (extra = {}) => {
    const token = getAuthToken();
    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra
    };
};

const ManageRoutes = () => {
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [selectedRouteDetails, setSelectedRouteDetails] = useState(null);
    const [filters, setFilters] = useState({
        status: 'all',
        barangay: 'all',
        team_id: 'all',
        date: new Date().toISOString().split('T')[0],
        search: ''
    });
    const [summary, setSummary] = useState({
        scheduled: 0,
        in_progress: 0,
        completed: 0,
        missed: 0,
        cancelled: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [barangays, setBarangays] = useState([]);
    const [teams, setTeams] = useState([]);

    const fetchRoutes = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (filters.status !== 'all') params.append('status', filters.status);
            if (filters.barangay !== 'all') params.append('barangay', filters.barangay);
            if (filters.team_id !== 'all') params.append('team_id', filters.team_id);
            if (filters.date) params.append('date', filters.date);
            if (filters.search) params.append('search', filters.search);
            params.append('include_counts', 'true');

            const url = `${buildApiUrl('get_routes.php')}?${params.toString()}`;
            const response = await fetch(url, { headers: getAuthHeaders() });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setRoutes(data.routes || []);
                if (data.summary) {
                    setSummary(data.summary);
                }

                const uniqueBarangays = [...new Set(data.routes.map(r => r.barangay_name))].filter(Boolean);
                const uniqueTeams = [...new Set(data.routes.map(r => r.team_id))].filter(Boolean);
                setBarangays(uniqueBarangays);
                setTeams(uniqueTeams);
            } else {
                throw new Error(data.message || 'Failed to fetch routes');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching routes:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRouteDetails = async (routeId) => {
        try {
            const url = `${buildApiUrl('get_route_details.php')}?route_id=${routeId}`;
            const response = await fetch(url, { headers: getAuthHeaders() });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setSelectedRouteDetails(data.route);
            } else {
                throw new Error(data.message || 'Failed to fetch route details');
            }
        } catch (err) {
            console.error('Error fetching route details:', err);
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, [filters.date]);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleRouteClick = (route) => {
        setSelectedRoute(route);
        fetchRouteDetails(route.id);
    };

    const getStatusClass = (status) => {
        const statusMap = {
            'scheduled': 'bg-blue-50 text-blue-700 border-blue-200',
            'in_progress': 'bg-amber-50 text-amber-700 border-amber-200',
            'completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'missed': 'bg-red-50 text-red-700 border-red-200',
            'cancelled': 'bg-gray-50 text-gray-700 border-gray-200'
        };
        return statusMap[status] || statusMap['scheduled'];
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <DashboardCard
                    title="Total Routes Scheduled Today"
                    value={summary.scheduled}
                    subtitle={`Across ${barangays.length} Barangays`}
                    color="blue"
                    icon={
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                    }
                />
                <DashboardCard
                    title="Active Collections & Drivers"
                    value={summary.in_progress}
                    subtitle="Currently on route"
                    color="amber"
                    icon={
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 1v6m0 6v6m8.66-15.66l-4.24 4.24M9.17 14.83l-4.24 4.24M23 12h-6m-6 0H1m20.66 8.66l-4.24-4.24M9.17 9.17L4.93 4.93" />
                        </svg>
                    }
                />
                <DashboardCard
                    title="Completed Routes"
                    value={summary.completed}
                    subtitle="Successfully finished"
                    color="emerald"
                    icon={
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <DashboardCard
                    title="Cancelled / Missed"
                    value={summary.cancelled + summary.missed}
                    subtitle="Requires attention"
                    color={summary.cancelled + summary.missed > 0 ? 'red' : 'emerald'}
                    icon={
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
                <div className="flex gap-3 items-center">
                    <input
                        type="date"
                        value={filters.date}
                        onChange={(e) => handleFilterChange('date', e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm hover:border-gray-300"
                    />

                    <button
                        onClick={fetchRoutes}
                        disabled={loading}
                        className="px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>

                    <GenerateRoutesButton onRoutesGenerated={fetchRoutes} />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-2 text-red-800">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-800 hover:text-red-900 font-bold text-lg transition-colors"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Main Content - Map and Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-28rem)] min-h-[600px]">
                {/* Map Panel */}
                <div className="bg-white rounded-xl overflow-hidden shadow-minimal border border-gray-100">
                    <RouteMap routeDetails={selectedRouteDetails} height="100%" />
                </div>

                {/* Table Panel */}
                <div className="bg-white rounded-xl overflow-hidden shadow-minimal border border-gray-100 flex flex-col">
                    {/* Table Header */}
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Routes <span className="text-sm font-normal text-gray-500">({routes.length})</span>
                        </h3>
                    </div>

                    {/* Table Content */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 px-6">
                                <div className="w-12 h-12 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-500 text-sm">Loading routes...</p>
                            </div>
                        ) : routes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <h3 className="text-gray-900 font-medium mb-1">No Routes Found</h3>
                                <p className="text-gray-500 text-sm">Try adjusting your filters or select a different date</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50/50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-100">Route ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-100">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-100">Barangays</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-100">Team</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-100">Time</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-100">Stops</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-100">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {routes.map(route => (
                                        <tr
                                            key={route.id}
                                            className={`cursor-pointer transition-all hover:bg-gray-50 ${selectedRoute?.id === route.id
                                                ? 'bg-emerald-50 border-l-4 border-l-emerald-500'
                                                : 'border-l-4 border-l-transparent'
                                                }`}
                                            onClick={() => handleRouteClick(route)}
                                        >
                                            <td className="px-4 py-3.5 text-sm font-medium text-gray-900">#{route.id}</td>
                                            <td className="px-4 py-3.5 text-sm text-gray-600">{formatDate(route.date)}</td>
                                            <td className="px-4 py-3.5 text-sm text-gray-600">
                                                <span className="inline-block max-w-[200px] truncate" title={route.barangays_passed}>
                                                    {route.barangays_passed || route.barangay_name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-sm text-gray-600">Team {route.team_id}</td>
                                            <td className="px-4 py-3.5 text-sm text-gray-600">
                                                {route.start_time?.substring(0, 5)} - {route.end_time?.substring(0, 5)}
                                            </td>
                                            <td className="px-4 py-3.5 text-sm text-gray-600">{route.stop_count} stops</td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClass(route.status)}`}>
                                                    {route.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageRoutes;
