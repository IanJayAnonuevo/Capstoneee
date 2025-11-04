import React, { useState, useEffect } from 'react';
import { FiUser, FiMapPin, FiAlertCircle, FiCamera, FiCheckCircle, FiChevronDown, FiChevronUp, FiTag, FiX } from 'react-icons/fi';
import axios from 'axios';
import { buildApiUrl } from '../../config/api';

const issueTypes = [
  'Missed or delayed pickups',
  'Overflowing or insufficient bins',
  'Unpleasant odors from trash areas',
  'Rude or unprofessional service from collectors',
  'Others',
];

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, isSubmitting, issueType, exactLocation, description, barangay }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm p-6 animate-fadeIn">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="text-green-600 text-3xl" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">Submit Issue Report?</h2>
        <p className="text-sm text-gray-600 text-center mb-4">
          Please confirm that you want to send this issue report. This action can't be undone.
        </p>

        <div className="space-y-3 text-sm text-gray-700 mb-6">
          {barangay && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Barangay</p>
              <p className="font-medium text-gray-800">{barangay}</p>
            </div>
          )}
          {issueType && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Issue Type</p>
              <p className="font-medium text-gray-800">{issueType}</p>
            </div>
          )}
          {exactLocation && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Exact Location</p>
              <p className="font-medium text-gray-800 break-words">{exactLocation}</p>
            </div>
          )}
          {description && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Description</p>
              <p className="text-gray-700 whitespace-pre-line break-words">{description}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="sm:flex-1 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="sm:flex-1 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:bg-green-500 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-30 animate-fadeIn">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 w-full max-w-xs sm:max-w-sm mx-4 text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <FiX className="text-xl" />
        </button>
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border border-green-200 mx-auto mb-4">
          <FiCheckCircle className="text-green-600 text-3xl" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Success</h2>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Report submitted successfully! We'll review it shortly.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default function ResidentReport() {
  // State for user data and loading
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    barangay: '',
    issueType: '',
    customIssueType: '',
    exactLocation: '',
    description: '',
    photo: null,
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showIssueType, setShowIssueType] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);

  const normalizeProfileData = (profile = {}, fallbackLocal = {}) => {
    if (!profile && !fallbackLocal) {
      return null;
    }

    const first = profile.firstname || fallbackLocal.firstname || '';
    const last = profile.lastname || fallbackLocal.lastname || '';
    const nameFromProfile = [first, last].filter(Boolean).join(' ').trim();
    const barangayName = profile.barangay || profile.barangay_name || profile.barangayName || fallbackLocal.barangay || fallbackLocal.barangay_name || '';

    return {
      firstname: first,
      lastname: last,
      name: nameFromProfile || fallbackLocal.name || fallbackLocal.username || 'Resident',
      barangay: barangayName,
      barangay_id: profile.barangay_id ?? fallbackLocal.barangay_id ?? null,
      address: profile.address || fallbackLocal.address || fallbackLocal.street || '',
      user_id: profile.user_id || fallbackLocal.user_id || fallbackLocal.id || '',
      profile_image: profile.profile_image || fallbackLocal.profile_image || fallbackLocal.avatar || null
    };
  };

  const applyFallbackUserData = (rawUser) => {
    const normalized = normalizeProfileData(rawUser, rawUser);
    if (!normalized) {
      return false;
    }

    setUserData((prev) => prev || normalized);
    setForm(prevForm => ({
      ...prevForm,
      name: normalized.name,
      barangay: normalized.barangay || prevForm.barangay
    }));

    return true;
  };

  const fetchBarangayName = async (barangayId) => {
    if (!barangayId) return null;
    try {
      const response = await axios.get(buildApiUrl(`get_barangay_details.php?barangay_id=${encodeURIComponent(barangayId)}`));
      if (response.data.status === 'success' && response.data.data?.barangay_name) {
        return response.data.data.barangay_name;
      }
    } catch (err) {
      console.warn('Unable to resolve barangay name', err);
    }
    return null;
  };

  const fetchProfileFromFallback = async (userId, fallbackLocal = {}) => {
    try {
      const response = await axios.get(buildApiUrl(`get_user_details.php?user_id=${encodeURIComponent(userId)}`));
      if (response.data.status === 'success' && response.data.data) {
        const data = response.data.data;
        let barangayName = data.barangay || data.barangay_name || null;
        if (!barangayName && data.barangay_id) {
          barangayName = await fetchBarangayName(data.barangay_id);
        }
        const normalized = normalizeProfileData({
          ...data,
          barangay: barangayName || data.barangay || data.barangay_name || ''
        }, fallbackLocal);
        return normalized;
      }
    } catch (err) {
      console.warn('Fallback profile lookup failed', err);
    }
    return null;
  };

  const fetchResolvedProfile = async (userId, fallbackLocal = {}) => {
    try {
      const response = await axios.get(buildApiUrl(`get_resident_profile.php?user_id=${encodeURIComponent(userId)}`));
      if (response.data.status === 'success' && response.data.data) {
        const normalized = normalizeProfileData(response.data.data, fallbackLocal);
        return { profile: normalized, warning: null };
      }
      const fallbackProfile = await fetchProfileFromFallback(userId, fallbackLocal);
      if (fallbackProfile) {
        return {
          profile: fallbackProfile,
          warning: response.data.message || 'Unable to retrieve the latest profile from the server. Showing cached information instead.'
        };
      }
      throw new Error(response.data.message || 'Failed to load user data');
    } catch (error) {
      console.warn('Primary resident profile fetch failed', error);
      const fallbackProfile = await fetchProfileFromFallback(userId, fallbackLocal);
      if (fallbackProfile) {
        return {
          profile: fallbackProfile,
          warning: 'Unable to reach the profile service. Showing cached information instead.'
        };
      }
      throw error;
    }
  };

  // Fetch user data from database on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user data from localStorage to get the user ID
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userDataLocal = JSON.parse(storedUser);

          // Get user_id, checking all possible properties
          const userId = userDataLocal.user_id || userDataLocal.id;
          if (!userId) {
            applyFallbackUserData(userDataLocal);
            setError('User information is incomplete. Please log in again.');
            return;
          }

          // Attempt to populate using cached/local data before remote fetch
          applyFallbackUserData(userDataLocal);

          // Fetch user details from database using available endpoints
          const { profile, warning } = await fetchResolvedProfile(userId, userDataLocal);
          if (profile) {
            setUserData(profile);
            setForm(prevForm => ({
              ...prevForm,
              name: profile.name,
              barangay: profile.barangay || prevForm.barangay
            }));
            setError(warning || '');
          }
        } else {
          setError('No user data found. Please log in again.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        const storedUser = localStorage.getItem('user');
        const fallbackUser = storedUser ? JSON.parse(storedUser) : null;
        const fallbackApplied = applyFallbackUserData(fallbackUser);
        setError(fallbackApplied
          ? 'Unable to refresh profile from the server right now. Showing saved information instead.'
          : 'Error loading user data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  function handleChange(e) {
    const { name, value, files } = e.target;
    setForm(f => ({
      ...f,
      [name]: files ? files[0] : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate required fields
    if (!form.issueType || !form.exactLocation || !form.description) {
      setError('Please fill in all required fields.');
      return;
    }
    // Validate custom issue type when "Others" is selected
    if (form.issueType === 'Others' && !form.customIssueType.trim()) {
      setError('Please specify your issue type.');
      return;
    }
    if (!form.barangay) {
      setError('Barangay information is missing. Please contact support.');
      return;
    }

    // Get user ID from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setError('User session expired. Please login again.');
      return;
    }
    const { user_id, id } = JSON.parse(storedUser);
    const userId = user_id || id;

    setPendingSubmission({
      reporterId: userId,
      reporterName: form.name,
      barangay: form.barangay,
      issueType: form.issueType === 'Others' ? form.customIssueType : form.issueType,
      exactLocation: form.exactLocation,
      description: form.description,
      photo: form.photo,
    });
    setShowConfirmModal(true);
  }

  const confirmSubmission = async () => {
    if (!pendingSubmission) {
      setShowConfirmModal(false);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('reporter_id', pendingSubmission.reporterId);
      formData.append('reporter_name', pendingSubmission.reporterName);
      formData.append('barangay', pendingSubmission.barangay);
      formData.append('issue_type', pendingSubmission.issueType);
  formData.append('exact_location', pendingSubmission.exactLocation);
      formData.append('description', pendingSubmission.description);
      formData.append('table', 'issue_reports');
      if (pendingSubmission.photo) {
        formData.append('photo', pendingSubmission.photo);
      }

  const response = await axios.post(buildApiUrl('submit_issue_report.php'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        setSuccess(true);
        setForm(prevForm => ({
          ...prevForm,
          issueType: '',
          customIssueType: '',
          exactLocation: '',
          description: '',
          photo: null,
        }));
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response.data.message || 'Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting report');
      setError('Failed to submit report. Please try again later.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
      setPendingSubmission(null);
    }
  };

  const cancelSubmission = () => {
    if (isSubmitting) {
      return;
    }
    setShowConfirmModal(false);
    setPendingSubmission(null);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-green-50 to-white py-8 px-2">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-700 font-medium">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-green-50 to-white py-8 px-2">
      <form
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-green-100 p-6 flex flex-col gap-5 animate-fadeIn"
        onSubmit={handleSubmit}
        style={{ fontFamily: 'inherit' }}
      >
        <h2 className="text-2xl font-bold text-green-800 mb-2 text-center tracking-tight">Submit Report Issue</h2>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-0.5">
            <FiUser className="text-green-500" /> Name
          </label>
          <input 
            type="text" 
            name="name" 
            value={form.name} 
            disabled 
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none text-base" 
          />
        </div>

        {/* Barangay - Disabled */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-0.5">
            <FiMapPin className="text-green-500" /> Barangay
          </label>
          <input 
            type="text" 
            name="barangay" 
            value={form.barangay || 'Not assigned'} 
            disabled 
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none text-base" 
          />
          <p className="text-xs text-gray-500 mt-1">Your assigned barangay (cannot be changed)</p>
        </div>
        {/* Issue Type Dropdown */}
        <div className="flex flex-col gap-1 relative">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-0.5">
            <FiTag className="text-green-500" /> Issue Type <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-green-200 text-base"
            onClick={() => setShowIssueType(v => !v)}
            tabIndex={0}
          >
            <span className={form.issueType ? '' : 'text-gray-400'}>{form.issueType || 'Select Issue Type'}</span>
            {showIssueType ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {showIssueType && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto animate-fadeIn">
              <ul>
                {issueTypes.map((t) => (
                  <li
                    key={t}
                    className={`px-4 py-2 cursor-pointer hover:bg-green-100 ${form.issueType === t ? 'bg-green-50 font-bold' : ''}`}
                    onClick={() => {
                      setForm(f => ({ ...f, issueType: t }));
                      setShowIssueType(false);
                    }}
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {/* Custom Issue Type Input (shown when "Others" is selected) */}
        {form.issueType === 'Others' && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-0.5">
              <FiTag className="text-green-500" /> Specify Issue Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="customIssueType"
              value={form.customIssueType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 text-base bg-white"
              placeholder="Please describe your specific issue"
            />
            <p className="text-xs text-gray-500 mt-1">Provide details about the issue you're experiencing.</p>
          </div>
        )}
        {/* Exact Location */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-0.5">
            <FiMapPin className="text-green-500" /> Exact Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="exactLocation"
            value={form.exactLocation}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 text-base bg-white"
            placeholder="Provide the specific spot (e.g., in front of House #5, Zone 2)"
          />
          <p className="text-xs text-gray-500 mt-1">Share the precise area so our team can respond faster.</p>
        </div>
        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 mb-0.5">Description <span className="text-red-500">*</span></label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-200 text-base bg-gray-50"
            placeholder="Describe the issue..."
          />
        </div>
        {/* Photo Upload */}
        {form.issueType !== 'Rude or unprofessional service from collectors' && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-0.5">
              <FiCamera className="text-green-500" /> Photo Evidence (optional)
            </label>
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              className="w-full file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {form.photo && (
              <span className="text-xs text-gray-500 mt-1">Selected: {form.photo.name}</span>
            )}
          </div>
        )}
        {/* Feedback Messages */}
        {error && (
          <div className="bg-red-50 text-red-600 px-2 py-1 rounded flex items-center gap-1 text-sm justify-center">
            <FiAlertCircle /> {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex justify-center items-center gap-2 py-2 px-4 rounded-lg text-base font-bold text-white transition-colors duration-150 shadow-md mt-2 ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300'
          }`}
        >
          Submit
        </button>
      </form>
      <ConfirmationModal
        isOpen={showConfirmModal}
        onConfirm={confirmSubmission}
        onCancel={cancelSubmission}
        isSubmitting={isSubmitting}
        issueType={pendingSubmission?.issueType}
        exactLocation={pendingSubmission?.exactLocation}
        description={pendingSubmission?.description}
        barangay={pendingSubmission?.barangay}
      />
      <SuccessModal
        isOpen={success}
        onClose={() => setSuccess(false)}
      />
    </div>
  );
}
