import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import { MdLocalShipping, MdCheckCircle, MdWarning, MdBuild, MdSearch } from 'react-icons/md';
import { FiFilter } from 'react-icons/fi';
import { authService } from '../../services/authService';
import { API_BASE_URL } from '../../config/api';

export default function ForemanTrucks() {
  const navigate = useNavigate();
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/get_trucks.php`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setTrucks(data.trucks || []);
      }
    } catch (error) {
      console.error('Error fetching trucks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in use':
      case 'in_use':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return <MdCheckCircle className="w-5 h-5" />;
      case 'in use':
      case 'in_use':
        return <MdLocalShipping className="w-5 h-5" />;
      case 'maintenance':
        return <MdBuild className="w-5 h-5" />;
      case 'unavailable':
        return <MdWarning className="w-5 h-5" />;
      default:
        return <MdLocalShipping className="w-5 h-5" />;
    }
  };

  const filteredTrucks = trucks.filter(truck => {
    const matchesSearch = truck.plate_num?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.truck_type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || truck.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: trucks.length,
    available: trucks.filter(t => t.status?.toLowerCase() === 'available').length,
    'in use': trucks.filter(t => t.status?.toLowerCase() === 'in use' || t.status?.toLowerCase() === 'in_use').length,
    maintenance: trucks.filter(t => t.status?.toLowerCase() === 'maintenance').length,
    unavailable: trucks.filter(t => t.status?.toLowerCase() === 'unavailable').length
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading trucks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-3 transition-colors"
        >
          <IoChevronBack className="w-5 h-5" />
          <span className="font-medium text-sm">Back</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Truck Status</h1>
        <p className="text-sm text-gray-600">Monitor vehicle conditions and availability</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 flex gap-2">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by plate or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilterMenu(!showFilterMenu)}
          className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <FiFilter className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">Filter</span>
        </button>
      </div>

      {/* Filter Menu */}
      {showFilterMenu && (
        <div className="mb-4 bg-white rounded-xl shadow-md p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter by Status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {['all', 'available', 'in use', 'maintenance', 'unavailable'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setShowFilterMenu(false);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${statusFilter === status
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Trucks</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <MdLocalShipping className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 mb-1">Available</p>
              <p className="text-2xl font-bold text-green-700">{statusCounts.available}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <MdCheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 mb-1">In Use</p>
              <p className="text-2xl font-bold text-blue-700">{statusCounts['in use']}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <MdLocalShipping className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-600 mb-1">Maintenance</p>
              <p className="text-2xl font-bold text-amber-700">{statusCounts.maintenance}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <MdBuild className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Trucks List */}
      {filteredTrucks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <MdLocalShipping className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">
            {searchQuery || statusFilter !== 'all'
              ? 'No trucks found matching your criteria'
              : 'No trucks available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrucks.map((truck) => (
            <div
              key={truck.truck_id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200 cursor-pointer"
              onClick={() => {
                // Future: Navigate to truck details
                console.log('View truck details:', truck);
              }}
            >
              {/* Truck Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <MdLocalShipping className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{truck.plate_num}</h3>
                    <p className="text-xs text-gray-500">{truck.truck_type || 'Standard'}</p>
                  </div>
                </div>
              </div>

              {/* Truck Details */}
              <div className="space-y-2 mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Capacity</span>
                  <span className="text-sm font-medium text-gray-900">{truck.capacity || 'N/A'} tons</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Type</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{truck.truck_type || 'Standard'}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(truck.status)}`}>
                {getStatusIcon(truck.status)}
                <span className="text-sm font-medium capitalize">
                  {truck.status?.replace('_', ' ') || 'Unknown'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
