import React, { useState, useEffect } from 'react';
import {
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiMapPin,
  FiTag,
  FiImage,
  FiUser
} from 'react-icons/fi';
import axios from 'axios';

import { buildApiUrl } from '../../config/api';
import { useLoader } from '../../contexts/LoaderContext';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: FiClock,
      className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    },
    'in-progress': {
      label: 'In Progress',
      icon: FiAlertCircle,
      className: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    resolved: {
      label: 'Resolved',
      icon: FiCheckCircle,
      className: 'bg-green-100 text-green-700 border-green-200'
    },
    closed: {
      label: 'Closed',
      icon: FiXCircle,
      className: 'bg-gray-100 text-gray-700 border-gray-200'
    },
    rejected: {
      label: 'Rejected',
      icon: FiXCircle,
      className: 'bg-red-100 text-red-700 border-red-200'
    },
    active: {
      label: 'Active',
      icon: FiAlertCircle,
      className: 'bg-orange-100 text-orange-700 border-orange-200'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    urgent: {
      label: 'Urgent',
      className: 'bg-red-100 text-red-700 border-red-200'
    },
    high: {
      label: 'High Priority',
      className: 'bg-red-50 text-red-700 border-red-200'
    },
    medium: {
      label: 'Medium Priority',
      className: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    },
    low: {
      label: 'Low Priority',
      className: 'bg-gray-50 text-gray-700 border-gray-200'
    }
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
};

const ImageModal = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition"
        >
          <FiXCircle className="w-8 h-8" />
        </button>
        <img
          src={imageUrl}
          alt="Issue report"
          className="max-w-full max-h-[85vh] object-contain rounded-lg"
        />
      </div>
    </div>
  );
};

const IssueCard = ({ issue }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showResolutionImageModal, setShowResolutionImageModal] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FiTag className="text-green-600" />
              {issue.issue_type}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <FiCalendar className="w-4 h-4" />
            <span>{formatDate(issue.created_at)}</span>
          </div>
        </div>

        <div className="space-y-3">
          {issue.name && (
            <div className="flex items-start gap-2">
              <FiUser className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reported By</p>
                <p className="text-sm text-gray-900">{issue.name}</p>
              </div>
            </div>
          )}

          {issue.barangay && (
            <div className="flex items-start gap-2">
              <FiMapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Barangay</p>
                <p className="text-sm text-gray-900">{issue.barangay}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2">
            <FiAlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{issue.description}</p>
            </div>
          </div>

          {issue.photo_url && (
            <div className="flex items-start gap-2">
              <FiImage className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Photo Evidence</p>
                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition"
                >
                  <FiImage className="w-4 h-4 text-green-600" />
                  View image
                </button>
                <p className="mt-2 text-xs text-gray-500">Opens the full photo preview.</p>
              </div>
            </div>
          )}

          {(issue.status === 'resolved' || issue.status === 'closed') && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
              <div className="flex items-start gap-2">
                <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm text-green-800 font-semibold">
                    {issue.status === 'closed'
                      ? 'This issue has been closed.'
                      : 'This issue has been resolved by the MENRO team.'}
                  </p>
                  {issue.resolved_at && (
                    <p className="text-xs text-green-700 mt-1">Resolved on {formatDate(issue.resolved_at)}</p>
                  )}
                  {issue.resolved_by_name && (
                    <p className="text-xs text-green-700 mt-1 inline-flex items-center gap-1">
                      <FiUser className="w-3.5 h-3.5" />
                      {issue.resolved_by_name}
                    </p>
                  )}
                </div>
              </div>

              {issue.resolution_notes && (
                <div className="p-3 bg-white border border-green-200 rounded-lg">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Resolution Notes</p>
                  <p className="text-sm text-green-900 whitespace-pre-line">{issue.resolution_notes}</p>
                </div>
              )}

              {issue.resolution_photo_url && (
                <div>
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Resolution Proof</p>
                  <button
                    type="button"
                    onClick={() => setShowResolutionImageModal(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm font-medium text-green-700 shadow-sm hover:bg-green-50 hover:border-green-400 transition"
                  >
                    <FiImage className="w-4 h-4 text-green-600" />
                    View image
                  </button>
                  <p className="mt-2 text-xs text-green-700">Opens the full resolution proof preview.</p>
                </div>
              )}
            </div>
          )}

          {issue.status === 'rejected' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium flex items-center gap-2">
                <FiXCircle className="w-4 h-4" />
                This issue has been reviewed and cannot be processed at this time.
              </p>
            </div>
          )}
        </div>
      </div>

      <ImageModal
        isOpen={showImageModal}
        imageUrl={issue.photo_url}
        onClose={() => setShowImageModal(false)}
      />

      <ImageModal
        isOpen={showResolutionImageModal}
        imageUrl={issue.resolution_photo_url}
        onClose={() => setShowResolutionImageModal(false)}
      />
    </>
  );
};

export default function BarangayHeadIssueStatus() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { hideLoader } = useLoader();

  useEffect(() => {
    hideLoader();
  }, []);

  useEffect(() => {
    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError('');

      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setError('User session expired. Please login again.');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(storedUser);
      const userId = userData.user_id || userData.id;
      const userRole = userData.role || userData.user_type || userData.userType;

      if (userRole !== 'Barangay Head' && userRole !== 'barangay_head') {
        setError('Access denied. Only barangay heads can view this page.');
        setLoading(false);
        return;
      }

      let url = buildApiUrl(`get_user_issue_reports.php?user_id=${userId}&role=Barangay Head`);
      if (filterStatus !== 'all') {
        url += `&status=${filterStatus}`;
      }

      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(url, { headers });

      if (response.data.status === 'success') {
        const normalizedIssues = (response.data.data || []).map((issue) => {
          const rawStatus = (issue.status || 'pending').toLowerCase();
          const normalizedStatus = rawStatus === 'open' ? 'active' : rawStatus;
          const normalizedPriority = (issue.priority || 'medium').toLowerCase();
          const reporterName = (issue.name || '').trim();

          return {
            ...issue,
            status: normalizedStatus,
            priority: normalizedPriority,
            name: reporterName !== '' ? reporterName : 'Anonymous Reporter',
            resolution_notes: issue.resolution_notes?.trim() || '',
            resolved_by_name: issue.resolved_by_name?.trim() || null
          };
        });

        setIssues(normalizedIssues);
      } else {
        setError(response.data.message || 'Failed to fetch issues');
      }
    } catch (err) {
      console.error('Error fetching issues:', err);
      setError('Failed to load issue reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Issues' },
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active / In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-green-50 to-white py-8 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-700 font-medium">Loading barangay issue reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-green-50 to-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Barangay Issue Reports</h1>
          <p className="text-gray-600">Track the status of issue reports from your barangay</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterStatus(option.value)}
              className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === option.value
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Issues List */}
        {issues.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
            <FiAlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Issues Found</h3>
            <p className="text-gray-500 mb-6">
              {filterStatus === 'all'
                ? "No issue reports have been submitted from your barangay yet."
                : `No ${filterStatus} issues found for your barangay.`}
            </p>
            <button
              onClick={() => window.location.href = '/barangayhead/report'}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Submit New Report
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Showing {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
            </div>
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


