import React, { useState, useEffect } from 'react';
import RouteMap from './RouteMap';
import GenerateRoutesButton from './GenerateRoutesButton';
import { buildApiUrl } from '../../config/api';
import './ManageRoutes.css';

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

        try {
            const params = new URLSearchParams();
            if(filters.status !== 'all') params.append('status', filters.status);
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

        // Extract unique barangays and teams for filters
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

// Fetch route details
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

// Load routes on mount and when filters change
useEffect(() => {
    fetchRoutes();
}, [filters.status, filters.barangay, filters.team_id, filters.date]);

// Handle filter changes
const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
};

// Handle status card click
const handleStatusCardClick = (status) => {
    setFilters(prev => ({ ...prev, status: status.toLowerCase().replace(' ', '_') }));
};

// Handle route selection
const handleRouteClick = (route) => {
    setSelectedRoute(route);
    fetchRouteDetails(route.id);
};

// Handle search
const handleSearch = (e) => {
    e.preventDefault();
    fetchRoutes();
};

// Get status badge class
const getStatusClass = (status) => {
    const statusMap = {
        'scheduled': 'scheduled',
        'in_progress': 'in-progress',
        'completed': 'completed',
        'missed': 'missed',
        'cancelled': 'cancelled'
    };
    return statusMap[status] || 'scheduled';
};

// Format date for display
const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

return (
    <div className="route-management-container">
        <div className="route-header">
            <h1>Route Management</h1>
            <p>View, filter, and manage collection routes</p>
        </div>

        {/* Status Summary Cards */}
        <div className="status-summary">
            <div
                className={`status-card scheduled ${filters.status === 'scheduled' ? 'active' : ''}`}
                onClick={() => handleStatusCardClick('scheduled')}
            >
                <div className="status-card-content">
                    <div className="status-icon">📅</div>
                    <div className="status-info">
                        <h3>{summary.scheduled}</h3>
                        <p>Scheduled</p>
                    </div>
                </div>
            </div>

            <div
                className={`status-card in-progress ${filters.status === 'in_progress' ? 'active' : ''}`}
                onClick={() => handleStatusCardClick('in_progress')}
            >
                <div className="status-card-content">
                    <div className="status-icon">🚛</div>
                    <div className="status-info">
                        <h3>{summary.in_progress}</h3>
                        <p>In Progress</p>
                    </div>
                </div>
            </div>

            <div
                className={`status-card completed ${filters.status === 'completed' ? 'active' : ''}`}
                onClick={() => handleStatusCardClick('completed')}
            >
                <div className="status-card-content">
                    <div className="status-icon">✅</div>
                    <div className="status-info">
                        <h3>{summary.completed}</h3>
                        <p>Completed</p>
                    </div>
                </div>
            </div>

            <div
                className={`status-card cancelled ${filters.status === 'cancelled' ? 'active' : ''}`}
                onClick={() => handleStatusCardClick('cancelled')}
            >
                <div className="status-card-content">
                    <div className="status-icon">❌</div>
                    <div className="status-info">
                        <h3>{summary.cancelled}</h3>
                        <p>Cancelled</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Filter Controls */}
        <div className="filter-controls">
            <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
            >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
                <option value="cancelled">Cancelled</option>
            </select>

            <select
                value={filters.barangay}
                onChange={(e) => handleFilterChange('barangay', e.target.value)}
            >
                <option value="all">All Barangays</option>
                {barangays.map(b => (
                    <option key={b} value={b}>{b}</option>
                ))}
            </select>

            <select
                value={filters.team_id}
                onChange={(e) => handleFilterChange('team_id', e.target.value)}
            >
                <option value="all">All Teams</option>
                {teams.map(t => (
                    <option key={t} value={t}>Team {t}</option>
                ))}
            </select>

            <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
            />

            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search routes..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                />
                <button type="submit">🔍</button>
            </form>

            <button className="refresh-btn" onClick={fetchRoutes} disabled={loading}>
                {loading ? '⏳' : '🔄'} Refresh
            </button>
        </div>

        {/* Error Message */}
        {error && (
            <div className="error-message">
                <span>⚠️ {error}</span>
                <button onClick={() => setError(null)}>✕</button>
            </div>
        )}

        {/* Two-Panel Layout */}
        <div className="route-content">
            {/* Map Panel (Left) */}
            <div className="map-panel">
                <RouteMap
                    routeDetails={selectedRouteDetails}
                    height="100%"
                />
            </div>

            {/* Route Table Panel (Right) */}
            <div className="table-panel">
                <div className="table-header">
                    <h3>Routes ({routes.length})</h3>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading routes...</p>
                    </div>
                ) : routes.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>No Routes Found</h3>
                        <p>Try adjusting your filters or select a different date</p>
                    </div>
                ) : (
                    <div className="route-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Route ID</th>
                                    <th>Date</th>
                                    <th>Barangays</th>
                                    <th>Team</th>
                                    <th>Time</th>
                                    <th>Stops</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {routes.map(route => (
                                    <tr
                                        key={route.id}
                                        className={selectedRoute?.id === route.id ? 'selected' : ''}
                                        onClick={() => handleRouteClick(route)}
                                    >
                                        <td>#{route.id}</td>
                                        <td>{formatDate(route.date)}</td>
                                        <td>
                                            <span className="barangays-list" title={route.barangays_passed}>
                                                {route.barangays_passed || route.barangay_name}
                                            </span>
                                        </td>
                                        <td>Team {route.team_id}</td>
                                        <td>
                                            {route.start_time?.substring(0, 5)} - {route.end_time?.substring(0, 5)}
                                        </td>
                                        <td>{route.stop_count} stops</td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(route.status)}`}>
                                                {route.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    </div>
);
};

export default ManageRoutes;
