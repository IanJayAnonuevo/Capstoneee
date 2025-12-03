import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import { FiEye, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiFilter, FiRefreshCw, FiImage, FiCalendar, FiUser, FiMapPin, FiSearch, FiExternalLink, FiX, FiCamera } from 'react-icons/fi';
import axios from 'axios';
import { buildApiUrl } from '../../config/api';
import Skeleton from '../shared/Skeleton';

const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
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
    ...extra,
  };
};

const API_BASE_URL = buildApiUrl();

export default function ForemanIssues() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoLoadError, setPhotoLoadError] = useState(false);
  const [userData, setUserData] = useState(null);

  // Multi-select states
  const [selectedIssues, setSelectedIssues] = useState(new Set());
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const backendBaseUrl = API_BASE_URL.replace(/\/api\/?$/, '/');

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      } else {
        const userId = localStorage.getItem('user_id');
        if (userId) {
          setUserData({ user_id: userId });
        }
      }
    } catch (e) {
      console.error("Error parsing user data", e);
    }
  }, []);

  const buildAbsoluteUrl = useCallback((base, path) => {
    if (!base || !path) return null;
    const sanitizedBase = base.replace(/\/+$/, '');
    const sanitizedPath = path.replace(/^\/+/, '');
    return `${sanitizedBase}/${sanitizedPath}`;
  }, []);

  const resolvePhotoUrl = useCallback((rawUrl) => {
    if (!rawUrl) return null;
    const trimmed = String(rawUrl).trim();
    if (!trimmed) return null;

    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

    try {
      const parsed = new URL(trimmed);

      if (['localhost', '127.0.0.1'].includes(parsed.hostname)) {
        const sanitizedPath = parsed.pathname.replace(/^\/+/, '').replace(/^koletrash\//i, '');
        const originCandidates = Array.from(new Set([
          currentOrigin,
          backendBaseUrl,
          buildAbsoluteUrl(currentOrigin, 'backend')
        ].filter(Boolean)));

        for (const candidate of originCandidates) {
          if (candidate) {
            return buildAbsoluteUrl(candidate, sanitizedPath);
          }
        }
      }

      return parsed.toString();
    } catch (error) {
      const sanitizedPath = trimmed.replace(/^(\.\/|\/)+/, '');
      const originCandidates = Array.from(new Set([
        currentOrigin,
        backendBaseUrl,
        buildAbsoluteUrl(currentOrigin, 'backend')
      ].filter(Boolean)));

      for (const candidate of originCandidates) {
        if (candidate) {
          return buildAbsoluteUrl(candidate, sanitizedPath);
        }
      }

      return null;
    }
  }, [backendBaseUrl, buildAbsoluteUrl]);

  const openInNewTab = useCallback((url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const openPhotoPreview = useCallback((report) => {
    if (!report) return;
    const resolvedUrl = report.resolutionPhotoUrl || report.resolvedPhotoUrl || null;
    const originalUrl = report.submittedPhotoUrl || resolvePhotoUrl(report.photo_url) || null;

    if (!resolvedUrl && !originalUrl) {
      setPhotoPreview({
        resolvedUrl: null,
        originalUrl: null,
        reporter: report.name,
        issueType: report.issue_type,
        createdAt: report.created_at
      });
      setPhotoLoadError(true);
      return;
    }

    setPhotoLoadError(false);
    setPhotoPreview({
      resolvedUrl,
      originalUrl,
      reporter: report.name,
      issueType: report.issue_type,
      createdAt: report.created_at
    });
  }, [resolvePhotoUrl]);

  const closePhotoPreview = () => {
    setPhotoPreview(null);
    setPhotoLoadError(false);
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      } else {
        // When showing 'all', exclude closed issues
        params.append('exclude_closed', 'true');
      }

      const response = await axios.get(`${buildApiUrl('get_issues.php')}?${params}`, {
        headers: getAuthHeaders(),
      });

      if (response.data.status === 'success') {
        const normalizedReports = (response.data.data || []).map((report) => {
          const submittedPhotoUrl = resolvePhotoUrl(report.photo_url);
          const resolutionPhotoUrl = resolvePhotoUrl(report.resolution_photo_url);

          return {
            ...report,
            submittedPhotoUrl,
            resolutionPhotoUrl,
            resolvedPhotoUrl: resolutionPhotoUrl || submittedPhotoUrl,
            resolution_notes: report.resolution_notes || '',
            resolved_by_name: report.resolved_by_name || null,
            resolved_at: report.resolved_at || null
          };
        });

        setReports(normalizedReports);
      } else {
        setError(response.data.message || 'Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  const updateReportStatus = async (reportId, newStatus, resolutionNotes = '', resolutionPhoto = null, options = {}) => {
    try {
      setUpdatingStatus(true);
      const { keepExistingPhoto = false } = options;
      const resolverId = userData?.user_id || userData?.id || 1; // Fallback to 1 if user data missing

      if (newStatus === 'resolved' && resolutionPhoto) {
        const formData = new FormData();
        formData.append('issue_id', reportId);
        formData.append('status', newStatus);
        formData.append('resolved_by', resolverId);
        formData.append('resolution_notes', resolutionNotes);
        formData.append('resolution_photo', resolutionPhoto);

        const response = await axios.post(`${buildApiUrl('resolve_issue_with_photo.php')}`, formData, {
          headers: getAuthHeaders(),
        });

        if (response.data.status === 'success') {
          setReports(prev => prev.map(report =>
            report.id === reportId
              ? {
                ...report,
                status: newStatus,
                resolution_notes: resolutionNotes,
                resolution_photo_url: response.data.data.resolution_photo_url,
                resolutionPhotoUrl: resolvePhotoUrl(response.data.data.resolution_photo_url),
                resolvedPhotoUrl: resolvePhotoUrl(response.data.data.resolution_photo_url),
                resolved_at: response.data.data.updated_at || report.resolved_at
              }
              : report
          ));
          setShowModal(false);
          setSelectedReport(null);
          fetchReports();
        } else {
          setError(response.data.message || 'Failed to resolve issue');
        }
      } else {
        const response = await axios.post(
          buildApiUrl('update_issue_status.php'),
          {
            issue_id: reportId,
            status: newStatus,
            resolved_by: resolverId,
            resolution_notes: resolutionNotes
          },
          {
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          }
        );

        if (response.data.status === 'success') {
          setReports(prev => prev.map(report => {
            if (report.id !== reportId) return report;

            const shouldClearResolution = newStatus !== 'resolved';
            const nextResolutionPhotoPath = shouldClearResolution
              ? null
              : (keepExistingPhoto ? report.resolution_photo_url : report.resolution_photo_url);
            const nextResolutionPhotoUrl = resolvePhotoUrl(nextResolutionPhotoPath);

            return {
              ...report,
              status: newStatus,
              resolution_notes: newStatus === 'resolved' ? resolutionNotes : '',
              resolved_at: newStatus === 'resolved' ? response.data.data.updated_at : null,
              resolution_photo_url: nextResolutionPhotoPath,
              resolutionPhotoUrl: nextResolutionPhotoUrl,
              resolvedPhotoUrl: nextResolutionPhotoUrl || report.submittedPhotoUrl
            };
          }));
          setShowModal(false);
          setSelectedReport(null);
          fetchReports();
        } else {
          setError(response.data.message || 'Failed to update status');
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: FiClock, label: 'Pending' };
      case 'active':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: FiAlertCircle, label: 'Active' };
      case 'resolved':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: FiCheckCircle, label: 'Resolved' };
      case 'closed':
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: FiXCircle, label: 'Closed' };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: FiClock, label: 'Unknown' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.issue_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.barangay.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Multi-select handlers
  const handleLongPressStart = (report) => {
    const timer = setTimeout(() => {
      setIsSelectionMode(true);
      toggleSelection(report.id);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const toggleSelection = (issueId) => {
    setSelectedIssues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(issueId)) {
        newSet.delete(issueId);
      } else {
        newSet.add(issueId);
      }
      if (newSet.size === 0) {
        setIsSelectionMode(false);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIssues.size === filteredReports.length) {
      setSelectedIssues(new Set());
      setIsSelectionMode(false);
    } else {
      const allIds = new Set(filteredReports.map(report => report.id));
      setSelectedIssues(allIds);
      setIsSelectionMode(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIssues.size === 0) return;
    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    try {
      setUpdatingStatus(true);
      setShowBulkDeleteModal(false);

      // Delete from database
      const deletePromises = Array.from(selectedIssues).map(issueId =>
        axios.post(
          buildApiUrl('delete_issue_report.php'),
          { issue_id: issueId },
          {
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          }
        )
      );

      await Promise.all(deletePromises);

      // Refresh the list
      await fetchReports();

      setSelectedIssues(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Error bulk deleting:', error);
      setError('Failed to delete some issues');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCardClick = (report, event) => {
    if (isSelectionMode) {
      toggleSelection(report.id);
    } else if (event.ctrlKey || event.metaKey) {
      setIsSelectionMode(true);
      toggleSelection(report.id);
    } else {
      openPhotoPreview(report);
    }
  };

  const StatusUpdateModal = () => {
    if (!selectedReport) return null;

    const [newStatus, setNewStatus] = useState(selectedReport.status);
    const initialResolutionPhotoUrl = selectedReport.resolutionPhotoUrl || null;
    const [resolutionNotes, setResolutionNotes] = useState(selectedReport.resolution_notes || '');
    const [resolutionPhoto, setResolutionPhoto] = useState(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState(initialResolutionPhotoUrl);
    const [useExistingPhoto, setUseExistingPhoto] = useState(Boolean(initialResolutionPhotoUrl));

    const normalizedIssueType = (selectedReport.issue_type || '').trim().toLowerCase();
    const isProofOptional = normalizedIssueType === 'rude or unprofessional service from collectors';
    const requiresResolutionProof = newStatus === 'resolved' && !isProofOptional;

    const handlePhotoChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setResolutionPhoto(file);
        setUseExistingPhoto(false);
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreviewUrl(reader.result);
        reader.readAsDataURL(file);
      }
    };

    const removePhoto = () => {
      if (resolutionPhoto) {
        setResolutionPhoto(null);
        if (initialResolutionPhotoUrl) {
          setPhotoPreviewUrl(initialResolutionPhotoUrl);
          setUseExistingPhoto(true);
        } else {
          setPhotoPreviewUrl(null);
          setUseExistingPhoto(false);
        }
      } else if (useExistingPhoto) {
        setPhotoPreviewUrl(null);
        setUseExistingPhoto(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="p-5">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Update Issue Status</h3>

            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Issue</p>
                <p className="font-medium text-gray-900">{selectedReport.issue_type}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedReport.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {newStatus === 'resolved' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resolution Photo {requiresResolutionProof && <span className="text-red-500">*</span>}
                  </label>

                  {!photoPreviewUrl ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiCamera className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">Tap to upload proof</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    </label>
                  ) : (
                    <div className="relative">
                      <img src={photoPreviewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {requiresResolutionProof && !resolutionPhoto && !useExistingPhoto && (
                    <p className="mt-1 text-xs text-red-500">Proof photo required.</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Notes</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe how the issue was resolved..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateReportStatus(
                    selectedReport.id,
                    newStatus,
                    resolutionNotes,
                    resolutionPhoto,
                    { keepExistingPhoto: useExistingPhoto && !resolutionPhoto }
                  )}
                  disabled={updatingStatus || (requiresResolutionProof && !resolutionPhoto && !useExistingPhoto)}
                  className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {updatingStatus ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoChevronBack className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Manage Issues</h1>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {isSelectionMode && (
              <>
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors bg-blue-600 text-white shadow-md"
                >
                  {selectedIssues.size === filteredReports.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedIssues.size === 0 || updatingStatus}
                  className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors bg-red-600 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <FiX className="w-4 h-4" />
                  Delete ({selectedIssues.size})
                </button>
              </>
            )}
            {['all', 'pending', 'resolved'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === status
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600'
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Skeleton variant="circular" className="w-8 h-8 flex-shrink-0" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-lg" />
                </div>
                <div className="mb-3 flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                  <Skeleton className="h-3 w-24" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3">
            <FiAlertCircle className="w-6 h-6 flex-shrink-0" />
            <p>{error}</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No issues found</h3>
            <p className="text-gray-500 mt-1">Great job! Everything seems to be in order.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => {
              const statusInfo = getStatusInfo(report.status);
              const StatusIcon = statusInfo.icon;
              const isSelected = selectedIssues.has(report.id);

              return (
                <div
                  key={report.id}
                  onClick={(e) => handleCardClick(report, e)}
                  onTouchStart={() => handleLongPressStart(report)}
                  onTouchEnd={handleLongPressEnd}
                  onMouseDown={() => handleLongPressStart(report)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  className={`bg-white rounded-xl p-4 shadow-sm border-2 flex flex-col cursor-pointer transition-all relative ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100'
                    }`}
                >
                  {isSelectionMode && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                        }`}>
                        {isSelected && (
                          <FiCheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                        {report.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{report.name}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <FiMapPin className="w-3 h-3 mr-1" />
                          {report.barangay}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="mb-3 flex-1">
                    <h4 className="font-medium text-gray-800 mb-1">{report.issue_type}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-400 flex items-center">
                      <FiCalendar className="w-3 h-3 mr-1" />
                      {formatDate(report.created_at)}
                    </span>
                    {!isSelectionMode && (
                      <div className="flex gap-2">
                        {(report.photo_url || report.resolvedPhotoUrl) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openPhotoPreview(report);
                            }}
                            className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                          >
                            <FiImage className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(report);
                            setShowModal(true);
                          }}
                          disabled={report.status === 'resolved'}
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg ${report.status === 'resolved'
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                          Manage
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Photo Preview Modal */}
      {photoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={closePhotoPreview}>
          <div className="relative max-w-full max-h-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={closePhotoPreview}
              className="absolute -top-10 right-0 text-white p-2"
            >
              <FiX className="w-6 h-6" />
            </button>
            {!photoLoadError && photoPreview.resolvedUrl ? (
              <img
                src={photoPreview.resolvedUrl}
                alt="Issue"
                className="max-w-full max-h-[80vh] rounded-lg"
                onError={() => setPhotoLoadError(true)}
              />
            ) : (
              <div className="bg-white p-6 rounded-lg text-center">
                <p>Image unavailable</p>
                {photoPreview.originalUrl && (
                  <button
                    onClick={() => openInNewTab(photoPreview.originalUrl)}
                    className="mt-2 text-blue-600 underline"
                  >
                    Open original link
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && <StatusUpdateModal />}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiX className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete {selectedIssues.size} Issue(s)?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {selectedIssues.size} issue{selectedIssues.size > 1 ? 's' : ''}? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkDelete}
                  disabled={updatingStatus}
                  className="flex-1 py-3 px-4 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50"
                >
                  {updatingStatus ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
