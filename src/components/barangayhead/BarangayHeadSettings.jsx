import React, { useState, useEffect } from 'react';
import { FiUser, FiLock, FiShield, FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import { authService } from '../../services/authService';

export default function BarangayHeadSettings() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // 'profile' | 'password' | 'delete' | null
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const userId = userData.user_id || userData.id;
          if (userId) {
            const response = await authService.getUserData(userId);
            if (response.status === 'success') {
              setUser(response.data);
              setFormData(prev => ({
                ...prev,
                firstname: response.data.firstname || '',
                lastname: response.data.lastname || '',
                email: response.data.email || ''
              }));
            } else {
              setUser(userData);
              setFormData(prev => ({
                ...prev,
                firstname: userData.firstname || '',
                lastname: userData.lastname || '',
                email: userData.email || ''
              }));
            }
          } else {
            setUser(userData);
            setFormData(prev => ({
              ...prev,
              firstname: userData.firstname || '',
              lastname: userData.lastname || '',
              email: userData.email || ''
            }));
          }
        } else {
          console.warn('No user data found in localStorage');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      } finally {
        setFetchingUser(false);
      }
    };
    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleProfileUpdate = async () => {
    const userId = user?.user_id || user?.id;
    if (!userId) {
      setError('User ID not found');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await authService.updateProfile(userId, {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email
      });
      if (response.status === 'success') {
        // Update localStorage with new data from response
        if (response.data) {
          localStorage.setItem('user', JSON.stringify(response.data));
          setUser(response.data);
        } else {
          // Fallback if no data in response
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            userData.firstname = formData.firstname;
            userData.lastname = formData.lastname;
            userData.email = formData.email;
            localStorage.setItem('user', JSON.stringify(userData));
          }
          setUser(prev => ({
            ...prev,
            firstname: formData.firstname,
            lastname: formData.lastname,
            email: formData.email
          }));
        }
        setShowSuccessModal(true);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    const userId = user?.user_id || user?.id;
    if (!userId) {
      setError('User ID not found');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.changePassword(
        userId,
        formData.currentPassword,
        formData.newPassword
      );
      if (response.status === 'success') {
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setShowSuccessModal(true);
      } else {
        setError(response.message || 'Failed to change password');
      }
    } catch (err) {
      setError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // TODO: Add your API call or logic for deleting the account here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      // TODO: Redirect to logout or home after successful deletion
    } catch (err) {
      setError('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  // Modified submit handlers to show confirmation modal
  const onProfileUpdate = (e) => {
    e.preventDefault();
    setConfirmAction('profile');
  };

  const onChangePassword = (e) => {
    e.preventDefault();
    setConfirmAction('password');
  };

  const onDeleteAccount = () => {
    setConfirmAction('delete');
  };

  // Handler to actually perform the action after confirmation
  const handleConfirmedAction = async () => {
    if (confirmAction === 'profile') {
      await handleProfileUpdate();
    } else if (confirmAction === 'password') {
      await handleChangePassword();
    } else if (confirmAction === 'delete') {
      await handleDeleteAccount();
    }
    setConfirmAction(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-2 py-4">
      {/* Loading state while fetching user data */}
      {fetchingUser && (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mr-3"></div>
          <p className="text-green-700">Loading user data...</p>
        </div>
      )}

      {/* Error state */}
      {error && !fetchingUser && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 max-w-md">
          {error}
        </div>
      )}

      {/* Success state */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 max-w-md">
          {success}
        </div>
      )}

      {/* Main content - only show when not fetching */}
      {!fetchingUser && (
        <>
          {/* Success Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
              <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4 animate-fadeIn">
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FiCheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Success!</h3>
                  <p className="text-gray-600 mb-6">
                    {confirmAction === 'profile' 
                      ? 'Your profile has been updated successfully.' 
                      : 'Your password has been changed successfully.'}
                  </p>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-2xl p-4 max-w-xs w-full flex flex-col items-center border border-gray-200 animate-fadeIn sm:p-6" style={{ minWidth: 280, maxWidth: 400 }}>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 mb-2">
              <span className="text-emerald-600 text-xl">
                {confirmAction === 'delete' ? <FiAlertCircle className="text-red-500" /> : <FiCheckCircle />}
              </span>
            </div>
            <h2 className="text-base font-semibold text-gray-900 mb-1 text-center">Confirm Action</h2>
            <p className="text-gray-600 text-xs mb-4 text-center leading-snug">
              {confirmAction === 'profile' && 'Update your profile information?'}
              {confirmAction === 'password' && 'Change your password?'}
              {confirmAction === 'delete' && 'Delete your account? This action cannot be undone.'}
            </p>
            <div className="flex gap-2 w-full mt-1">
              <button
                className={`flex-1 py-1.5 rounded-md text-xs font-medium shadow-none transition focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                  confirmAction === 'delete' 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
                onClick={handleConfirmedAction}
                disabled={loading}
              >
                Confirm
              </button>
              <button
                className="flex-1 py-1.5 rounded-md text-xs font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-200"
                onClick={() => setConfirmAction(null)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md border border-gray-200 w-full max-w-md flex flex-col gap-4 p-4 sm:p-6 md:max-w-lg xl:max-w-4xl mx-auto transition-all duration-300">
        <div className="w-full flex flex-col gap-8 xl:grid xl:grid-cols-2">
          {/* Profile & Security: make responsive row on xl */}
          <div className="flex flex-col gap-4 xl:flex-row xl:gap-8">
            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-2">
                <FiUser className="text-emerald-600" />
                <h2 className="text-base font-semibold text-emerald-700">Profile</h2>
              </div>
              <form className="flex flex-col gap-2" onSubmit={onProfileUpdate}>
                <input
                  name="firstname"
                  className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-emerald-400 outline-none text-sm w-full"
                  type="text"
                  placeholder="First Name"
                  value={formData.firstname}
                  onChange={handleInputChange}
                />
                <input
                  name="lastname"
                  className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-emerald-400 outline-none text-sm w-full"
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastname}
                  onChange={handleInputChange}
                />
                <input
                  name="email"
                  className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-emerald-400 outline-none text-sm w-full"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="border border-emerald-600 text-emerald-700 bg-white rounded px-2 py-1 text-sm font-medium hover:bg-emerald-50 transition disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
            {/* Change Password */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-2 mt-6 xl:mt-0">
                <FiLock className="text-emerald-600" />
                <h2 className="text-base font-semibold text-emerald-700">Security</h2>
              </div>
              <form className="flex flex-col gap-2" onSubmit={onChangePassword}>
                <input
                  name="currentPassword"
                  className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-emerald-400 outline-none text-sm w-full"
                  type="password"
                  placeholder="Current Password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                />
                <input
                  name="newPassword"
                  className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-emerald-400 outline-none text-sm w-full"
                  type="password"
                  placeholder="New Password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                />
                <input
                  name="confirmPassword"
                  className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-emerald-400 outline-none text-sm w-full"
                  type="password"
                  placeholder="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="border border-emerald-600 text-emerald-700 bg-white rounded px-2 py-1 text-sm font-medium hover:bg-emerald-50 transition disabled:opacity-50"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {/* Privacy & Account */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <FiShield className="text-emerald-600" />
                <h2 className="text-base font-semibold text-emerald-700">Privacy & Account</h2>
              </div>
              <button
                onClick={onDeleteAccount}
                disabled={loading}
                className="border border-red-600 text-red-600 bg-white rounded px-2 py-1 text-sm font-medium hover:bg-red-50 transition w-full disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>

            {/* App Info */}
            <div className="text-xs text-gray-400 text-center pt-2 border-t">
              KolekTrash Barangay Head App v1.0.0
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
