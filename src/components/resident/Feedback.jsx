import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { FiSend, FiUser, FiMapPin, FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { feedbackService } from '../../services/feedbackService';
import { useNavigate } from 'react-router-dom';

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, isSubmitting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-full max-w-sm mx-4 animate-fadeIn">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-50 mb-4 mx-auto">
          <FiAlertCircle className="text-green-600 text-3xl" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">Submit Feedback?</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Are you sure you want to submit this feedback? This action can't be undone.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="sm:flex-1 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="sm:flex-1 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:bg-green-500 disabled:cursor-not-allowed"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 animate-fadeIn">
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
          Thank you for your feedback! We appreciate your input.
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

export default function Feedback() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hoverRating, setHoverRating] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingFeedbackData, setPendingFeedbackData] = useState(null);
  const starLegend = [
    {
      rating: 5,
      title: 'Excellent',
      description: 'Service was outstanding and exceeded expectations.'
    },
    {
      rating: 4,
      title: 'Good',
      description: 'Overall experience was positive with minor areas to improve.'
    },
    {
      rating: 3,
      title: 'Fair',
      description: 'Service met basic expectations but could be better.'
    },
    {
      rating: 2,
      title: 'Needs Improvement',
      description: 'Several issues were experienced that should be addressed.'
    },
    {
      rating: 1,
      title: 'Poor',
      description: 'Service was unsatisfactory and requires immediate attention.'
    }
  ];

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          setError('Please log in to submit feedback.');
          setIsLoading(false);
          navigate('/login');
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        try {
          const userId = parsedUser.user_id || parsedUser.id;
          if (!userId) {
            throw new Error('User ID missing.');
          }

          const token = localStorage.getItem('access_token');
          const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

          const response = await fetch(`${API_BASE_URL}/get_user_details.php?user_id=${userId}`, {
            headers: authHeaders
          });
          const userDetails = await response.json();

          if (userDetails.status === 'success' && userDetails.data) {
            let barangayName = userDetails.data.barangay_name || null;
            const barangayId = userDetails.data.barangay_id;

            if (barangayId && !barangayName) {
              try {
                const barangayResponse = await fetch(`${API_BASE_URL}/get_barangay_details.php?barangay_id=${barangayId}`, {
                  headers: authHeaders
                });
                const barangayData = await barangayResponse.json();
                if (barangayData.status === 'success' && barangayData.data?.barangay_name) {
                  barangayName = barangayData.data.barangay_name;
                }
              } catch (barangayError) {
                console.error('Error fetching barangay details:', barangayError);
              }
            }

            const mergedUser = {
              ...userDetails.data,
              barangay_id: barangayId,
              barangay_name: barangayName || parsedUser.barangay_name,
            };

            setUser(prev => ({
              ...prev,
              ...mergedUser,
            }));
          }
        } catch (detailsError) {
          console.warn('Error fetching additional user details');
        }
      } catch (err) {
        console.error('Resident feedback error:', err);
        setError('Error loading user data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    try {
      if (!user) {
        throw new Error('Please log in to submit feedback');
      }
      if (!user.firstname || !user.lastname) {
        throw new Error('Please complete your profile with your full name');
      }
      if (!user.barangay_name) {
        throw new Error('Barangay information is missing. Please update your profile.');
      }

      const feedbackData = {
        user_id: user.user_id || user.id,
        user_name: `${user.firstname} ${user.lastname}`,
        barangay: user.barangay_name,
        rating: parseInt(rating, 10),
        message: feedbackMessage.trim(),
        feedback_type: 'general',
        status: 'active',
      };

      setPendingFeedbackData(feedbackData);
      setIsConfirmOpen(true);
    } catch (submitError) {
      console.error('Error preparing feedback submission');
      setError(submitError.message || 'An unexpected error occurred');
    }
  };

  const handleConfirmSubmit = async () => {
    if (!pendingFeedbackData) {
      setIsConfirmOpen(false);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await feedbackService.submitFeedback(pendingFeedbackData);

      if (result.success) {
        setShowSuccess(true);
        setFeedbackMessage('');
        setRating(5);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to submit feedback');
      }
    } catch (confirmError) {
      console.error('Error submitting feedback');
      setError(confirmError.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
      setPendingFeedbackData(null);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-4 sm:p-6">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-green-800 mb-2">Submit Feedback</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            We value your input! Help us improve our services.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading user details...</span>
            </div>
          ) : (
            <>
              {user && (
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <FiUser className="text-green-600 text-sm sm:text-base" />
                    <span className="text-sm sm:text-base text-gray-700">
                      {user.firstname && user.lastname ? `${user.firstname} ${user.lastname}` : 'Name not available'}
                    </span>
                  </div>
                  {user.barangay_name && (
                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-green-600 text-sm sm:text-base" />
                      <span className="text-sm sm:text-base text-gray-700">{user.barangay_name}</span>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex justify-center sm:justify-start gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center focus:outline-none transition-colors"
                      >
                        <FaStar
                          className={`text-xl sm:text-2xl ${(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                            } hover:text-yellow-400 transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">How we interpret each rating</p>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {starLegend.map((legend) => {
                        const isActive = rating === legend.rating;
                        return (
                          <li
                            key={legend.rating}
                            className={`flex items-start gap-3 rounded-lg border px-3 py-2 transition-colors ${isActive
                              ? 'border-green-400 bg-green-50'
                              : 'border-transparent bg-white'
                              }`}
                          >
                            <div className="flex items-center gap-1 pt-0.5">
                              {Array.from({ length: legend.rating }).map((_, index) => (
                                <FaStar
                                  key={index}
                                  className={`text-xs ${isActive ? 'text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${isActive ? 'text-green-700' : 'text-gray-700'}`}>
                                {legend.title}
                              </p>
                              <p className="text-xs text-gray-500 leading-relaxed">
                                {legend.description}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Feedback
                  </label>
                  <textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Please share your thoughts..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !feedbackMessage.trim()}
                  className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 text-white font-medium transition-colors ${isSubmitting || !feedbackMessage.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Submit Feedback
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onConfirm={handleConfirmSubmit}
        onCancel={() => {
          setIsConfirmOpen(false);
          setPendingFeedbackData(null);
        }}
        isSubmitting={isSubmitting}
      />
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}
