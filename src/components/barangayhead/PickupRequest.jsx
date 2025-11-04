import React, { useState, useEffect } from 'react';
import { FiUser, FiMapPin, FiPhone, FiCalendar, FiCheckCircle, FiAlertCircle, FiBox, FiX } from 'react-icons/fi';
import { authService } from '../../services/authService';

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, isSubmitting, formData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm p-6 animate-fadeIn">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="text-green-600 text-3xl" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">Submit Pickup Request?</h2>
        <p className="text-sm text-gray-600 text-center mb-4">
          Please confirm that you want to submit this special pickup request.
        </p>

        <div className="space-y-3 text-sm text-gray-700 mb-6">
          {formData.barangay && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Barangay</p>
              <p className="font-medium text-gray-800">{formData.barangay}</p>
            </div>
          )}
          {formData.contact && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Contact Number</p>
              <p className="font-medium text-gray-800">{formData.contact}</p>
            </div>
          )}
          {formData.date && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Preferred Date</p>
              <p className="font-medium text-gray-800">{new Date(formData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          )}
          {formData.type && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Type of Waste</p>
              <p className="font-medium text-gray-800">{formData.type}</p>
            </div>
          )}
          {formData.notes && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Notes</p>
              <p className="text-gray-700 whitespace-pre-line break-words">{formData.notes}</p>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Success!</h2>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Your special pickup request has been submitted successfully. The MENRO team will review it shortly.
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

export default function PickupRequest() {
  // State for user data and loading
  const [userData, setUserData] = useState(null);
  const [barangayHeadData, setBarangayHeadData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    name: '',
    barangay: '',
    contact: '',
    date: today, // Set default date to today
    type: '',
    notes: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);

  // Fetch user data and barangay head data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user data from localStorage first to get the user ID
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userDataLocal = JSON.parse(storedUser);
          
          // Get user_id and role, checking all possible properties
          const userId = userDataLocal.user_id || userDataLocal.id || userDataLocal.userId;
          
          // Fetch fresh data from database using the user ID
          if (userId) {
            const response = await authService.getUserData(userId);
            if (response.status === 'success') {
              const user = response.data;
              setUserData(user);
              setForm(prevForm => ({
                ...prevForm,
                name: user.full_name || `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Barangay Head User',
                barangay: user.barangay || '',
                contact: user.phone || ''
              }));

              // Fetch barangay head data if we have a barangay
              const userBarangay = user.barangay;
              if (userBarangay) {
                try {
                  const barangayHeadResponse = await authService.getBarangayHead(userBarangay);
                  if (barangayHeadResponse.status === 'success') {
                    setBarangayHeadData(barangayHeadResponse.data);
                  }
                } catch (barangayHeadError) {
                  console.error('Error fetching barangay head data:', barangayHeadError);
                }
              }
            } else {
              console.error('Failed to fetch user data:', response.message);
              // Fallback to stored data
              setUserData(userDataLocal);
              setForm(prevForm => ({
                ...prevForm,
                name: userDataLocal.full_name || userDataLocal.fullName || userDataLocal.name || 'Barangay Head User',
                barangay: userDataLocal.barangay || userDataLocal.assignedArea || '',
                contact: userDataLocal.phone || ''
              }));
            }
          } else {
            // Use stored data if no ID
            setUserData(userDataLocal);
            setForm(prevForm => ({
              ...prevForm,
              name: userDataLocal.full_name || userDataLocal.fullName || userDataLocal.name || 'Barangay Head User',
              barangay: userDataLocal.barangay || userDataLocal.assignedArea || '',
              contact: userDataLocal.phone || ''
            }));
          }
        } else {
          setError('No user data found. Please log in again.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Error loading user data');
        // Try to use stored data as fallback
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userDataLocal = JSON.parse(storedUser);
            setUserData(userDataLocal);
            setForm(prevForm => ({
              ...prevForm,
              name: userDataLocal.full_name || userDataLocal.fullName || userDataLocal.name || 'Barangay Head User',
              barangay: userDataLocal.barangay || userDataLocal.assignedArea || '',
              contact: userDataLocal.phone || ''
            }));
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

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!form.contact || !form.date || !form.type) {
      setError('Please fill in all required fields.');
      return;
    }

    // Store the form data for submission
    setPendingSubmission({
      requester_id: userData?.id,
      requester_name: form.name,
      barangay: form.barangay,
      contact_number: form.contact,
      pickup_date: form.date,
      waste_type: form.type,
      notes: form.notes || ''
    });
    
    // Show confirmation modal
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
      const response = await authService.submitPickupRequest(pendingSubmission);
      
      if (response.status === 'success') {
        setShowConfirmModal(false);
        setShowSuccessModal(true);
        // Reset form but keep name, barangay, and contact
        setForm(prevForm => ({ 
          ...prevForm, 
          date: today,
          type: '', 
          notes: ''
        }));
      } else {
        setError(response.message || 'Failed to submit pickup request');
        setShowConfirmModal(false);
      }
    } catch (error) {
      console.error('Error submitting pickup request:', error);
      setError(error.message || 'Failed to submit pickup request. Please try again.');
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
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

  const filteredBarangays = [];

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-green-50 to-white py-8 px-2">
      <form
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-green-100 p-6 flex flex-col gap-5 animate-fadeIn"
        onSubmit={handleSubmit}
        style={{ fontFamily: 'inherit' }}
      >
        <h2 className="text-2xl font-bold text-green-800 mb-2 text-center tracking-tight">Special Pick-up Request</h2>
        
        {/* Display barangay head info if available */}
        {barangayHeadData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <h3 className="text-sm font-semibold text-green-800 mb-1">Barangay Head Information</h3>
            <p className="text-xs text-green-700">
              <strong>Name:</strong> {barangayHeadData.name}
            </p>
            <p className="text-xs text-green-700">
              <strong>Barangay:</strong> {barangayHeadData.barangay}
            </p>
            {barangayHeadData.email && (
              <p className="text-xs text-green-700">
                <strong>Email:</strong> {barangayHeadData.email}
              </p>
            )}
          </div>
        )}

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
            value={form.barangay || 'Not assigned'} 
            disabled 
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none text-base" 
          />
        </div>
        {/* Contact Number */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-0.5">
            <FiPhone className="text-green-500" /> Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="contact"
            value={form.contact}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-200 text-base"
            placeholder="e.g. 09XXXXXXXXX"
            required
          />
        </div>
        {/* Date */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-0.5">
            <FiCalendar className="text-green-500" /> Preferred Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            min={today} // Prevent past dates
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-200 text-base"
            required
          />
        </div>
        {/* Type of Waste */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-0.5">
            <FiBox className="text-green-500" /> Type of Waste <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-200 text-base"
            placeholder="e.g. Bulky, Hazardous, Recyclable, etc."
            required
          />
        </div>
        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-0.5">
            Notes (optional)
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-200 text-base resize-none"
            placeholder="Additional details..."
          />
        </div>
        <button
          type="submit"
          disabled={loading || isSubmitting}
          className={`w-full px-4 py-2 rounded-lg font-medium text-white transition-colors ${
            loading || isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
          }`}
        >
          {loading || isSubmitting ? 'Processing...' : 'Submit Request'}
        </button>
      </form>
      
      <ConfirmationModal
        isOpen={showConfirmModal}
        onConfirm={confirmSubmission}
        onCancel={cancelSubmission}
        isSubmitting={isSubmitting}
        formData={form}
      />
      
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
