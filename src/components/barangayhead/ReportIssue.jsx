import React, { useState, useEffect } from 'react';
import { FiUser, FiMapPin, FiAlertCircle, FiCamera, FiCheckCircle, FiChevronDown, FiChevronUp, FiTag, FiX } from 'react-icons/fi';
import axios from 'axios';

const API_BASE_URL = 'https://kolektrash.systemproj.com/backend/api';

const issueTypes = [
  'Missed or delayed pickups',
  'Overflowing or insufficient bins',
  'Unpleasant odors from trash areas',
  'Rude or unprofessional service from collectors',
  'Others'
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

export default function ReportIssue() {
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

  // Fetch user data from database on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user data from localStorage to get the user ID
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userDataLocal = JSON.parse(storedUser);
          
          // Get user_id and role, checking all possible properties
          const userId = userDataLocal.user_id || userDataLocal.id || userDataLocal.userId;
          const userRole = userDataLocal.role || userDataLocal.user_type || userDataLocal.userType;
          
          if (!userId) {
            throw new Error('User ID not found in stored data');
          }
          
          // We'll verify the role after getting fresh data from the database
          // Fetch user details from database using the get_user endpoint
          const response = await axios.get(`${API_BASE_URL}/get_user.php`, {
            params: { id: userId }
          });
          
          if (response.data.status === 'success') {
            const user = response.data.data;

            // Verify the user is a barangay head using the role from database
            if (user.role !== 'Barangay Head' && user.role !== 'barangay_head') {
              throw new Error('Access denied. Only barangay heads can access this page.');
            }
            setUserData(user);
            setForm(prevForm => ({
              ...prevForm,
              name: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
              barangay: user.barangay_id || user.barangay
            }));
          } else {
            console.error('Failed to fetch user data:', response.data.message);
            setError('Failed to load user data. Please try again.');
          }
        } else {
          setError('No user data found. Please log in again.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        
        // Determine the specific error case
        if (error.message === 'Network Error') {
          setError('Unable to connect to server. Please check your connection and try again.');
        } else if (error.message.includes('User ID not found')) {
          setError('Session expired. Please log out and log in again.');
        } else if (error.message.includes('Access denied')) {
          setError('Access denied. This page is only accessible to barangay heads.');
        } else if (error.response?.data?.message) {
          if (error.response.data.message.includes('User ID is required')) {
            setError('Session error. Please log out and log in again.');
          } else {
            setError(`Error: ${error.response.data.message}`);
          }
        } else {
          setError('Error loading user data. Please try refreshing the page.');
        }
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

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Photo size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      setForm(prev => ({ ...prev, photo: selectedFile }));
      setError(''); // Clear any previous errors
    }
  };

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate required fields
    if (!form.issueType || !form.exactLocation || !form.description) {
      setError('Please fill in all required fields (issue type, exact location, description).');
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

    if (!userData?.user_id) {
      setError('User information is missing. Please reload the page.');
      return;
    }

    setPendingSubmission({
      reporterId: userData.user_id,
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

      const response = await axios.post(`${API_BASE_URL}/submit_issue_report.php`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
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
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(response.data.message || 'Failed to submit issue report');
      }
    } catch (error) {
      console.error('Error submitting issue report:', error);
      setError(error.response?.data?.message || error.message || 'Failed to submit issue report. Please try again.');
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

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">
            <FiAlertCircle /> {error}
          </div>
        )}
        {/* Name - Disabled */}
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
            value={form.barangay} 
            disabled 
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none text-base" 
          />
        </div>

        {/* Issue Type - Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-0.5">
            <FiTag className="text-green-500" /> Issue Type
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowIssueType(!showIssueType)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <span>{form.issueType || 'Select issue type'}</span>
              {showIssueType ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {showIssueType && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {issueTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-green-50 text-gray-700"
                    onClick={() => {
                      setForm(prev => ({ ...prev, issueType: type }));
                      setShowIssueType(false);
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
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
            placeholder="Provide the specific spot (e.g., Zone 3, near the plaza)"
          />
          <p className="text-xs text-gray-500 mt-1">Give a precise area so the MENRO team can respond faster.</p>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-0.5">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            rows="4"
            placeholder="Describe the issue in detail..."
          />
        </div>

        {/* Photo Upload */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-0.5">
            <FiCamera className="text-green-500" /> Photo
          </label>
          <input
            type="file"
            name="photo"
            onChange={handlePhotoChange}
            accept="image/*"
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent flex items-center justify-center gap-2"
          >
            <FiCamera />
            {form.photo ? form.photo.name : 'Choose a photo'}
          </label>
          {form.photo && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(form.photo)}
                alt="Selected"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || isSubmitting}
          className={`w-full px-4 py-2 rounded-lg font-medium text-white transition-colors ${
            loading || isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
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
