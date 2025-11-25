import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import { MdPerson, MdLock, MdEmail, MdPhone, MdBadge, MdSave, MdCancel, MdEdit } from 'react-icons/md';
import { authService } from '../../services/authService';

export default function ForemanSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await authService.getUserData(userId);
      if (response.success) {
        setUser(response.user);
        setProfileData({
          first_name: response.user.first_name || '',
          last_name: response.user.last_name || '',
          email: response.user.email || '',
          phone: response.user.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      showMessage('error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('user_id');
      const response = await authService.updateProfile(userId, profileData);

      if (response.success) {
        showMessage('success', 'Profile updated successfully');
        setEditMode(false);
        fetchUserData();

        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...profileData }));
      } else {
        showMessage('error', response.message || 'Failed to update profile');
      }
    } catch (error) {
      showMessage('error', 'Error updating profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const userId = localStorage.getItem('user_id');
      const response = await authService.changePassword(
        userId,
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (response.success) {
        showMessage('success', 'Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        showMessage('error', response.message || 'Failed to change password');
      }
    } catch (error) {
      showMessage('error', 'Error changing password');
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-3 transition-colors"
        >
          <IoChevronBack className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'profile'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'password'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Password
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'account'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Account
        </button>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div
          className={`mb-4 p-3 rounded-lg ${message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
            }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <MdEdit className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    disabled={!editMode}
                    className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${!editMode ? 'bg-gray-50 text-gray-600' : ''
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    disabled={!editMode}
                    className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${!editMode ? 'bg-gray-50 text-gray-600' : ''
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!editMode}
                    className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${!editMode ? 'bg-gray-50 text-gray-600' : ''
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <MdPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    disabled={!editMode}
                    className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${!editMode ? 'bg-gray-50 text-gray-600' : ''
                      }`}
                  />
                </div>
              </div>
            </div>

            {editMode && (
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <MdSave className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setProfileData({
                      first_name: user.first_name || '',
                      last_name: user.last_name || '',
                      email: user.email || '',
                      phone: user.phone || ''
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <MdCancel className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <MdSave className="w-4 h-4" />
              Change Password
            </button>
          </form>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && user && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <MdPerson className="w-6 h-6 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Username</p>
                <p className="font-medium text-gray-900">{user.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <MdBadge className="w-6 h-6 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="font-medium text-gray-900 capitalize">{user.role?.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <MdEmail className="w-6 h-6 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Email Status</p>
                <p className="font-medium text-gray-900">
                  {user.email_verified ? (
                    <span className="text-green-600">✓ Verified</span>
                  ) : (
                    <span className="text-amber-600">Not Verified</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Account Created</p>
                <p className="font-medium text-gray-900">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
