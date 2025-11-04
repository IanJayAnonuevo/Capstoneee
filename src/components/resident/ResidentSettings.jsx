import React, { useState, useEffect } from 'react';
import { FiUser, FiLock, FiShield, FiAlertCircle, FiCheckCircle, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { authService } from '../../services/authService';

export default function ResidentSettings() {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Confirmation modal state
  const [confirmAction, setConfirmAction] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastCompletedAction, setLastCompletedAction] = useState(null);
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Fetch user data from database on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user data from localStorage first to get the user ID
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const userId = userData.user_id || userData.id;
          if (userId) {
            const response = await authService.getUserData(userId);
            if (response.status === 'success') {
              const user = response.data;
              setUserData(user);
              setFormData({
                firstname: user.firstname || '',
                lastname: user.lastname || '',
                email: user.email || '',
                phone: user.phone || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              });
            } else {
              console.error('Failed to fetch user data:', response.message);
              // Fallback to stored data
              setUserData(userData);
              setFormData({
                firstname: userData.firstname || '',
                lastname: userData.lastname || '',
                email: userData.email || '',
                phone: userData.phone || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              });
            }
          } else {
            // Use stored data if no ID
            setUserData(userData);
            setFormData({
              firstname: userData.firstname || '',
              lastname: userData.lastname || '',
              email: userData.email || '',
              phone: userData.phone || '',
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            });
          }
        } else {
          setError('No user data found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Error loading user data');
        // Try to use stored data as fallback
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUserData(userData);
            setFormData({
              firstname: userData.firstname || '',
              lastname: userData.lastname || '',
              email: userData.email || '',
              phone: userData.phone || '',
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            });
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleProfileUpdate = async () => {
    const userId = userData?.user_id || userData?.id;
    if (!userId) {
      setError('User data not found');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.updateProfile(userId, {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone
      });
      
      if (response.status === 'success') {
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(response.data));
        setUserData(response.data);
  setLastCompletedAction('profile');
  setShowSuccessModal(true);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    const userId = userData?.user_id || userData?.id;
    if (!userId) {
      setError('User data not found');
      return;
    }
    if (!formData.currentPassword || !formData.newPassword) {
      setError('Please fill in all password fields');
      return;
    }
    setLoading(true);
    setError('');
    
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
  setLastCompletedAction('password');
  setShowSuccessModal(true);
      } else {
        setError(response.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Password change error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      if (!userData?.user_id && !userData?.id) {
        setError('User data not found');
        setLoading(false);
        return;
      }
      const userId = userData.user_id || userData.id;
  const response = await fetch('https://kolektrash.systemproj.com/backend/api/delete_account.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      const result = await response.json();
      if (result.status === 'success') {
        localStorage.removeItem('user');
        setUserData(null);
        setSuccess('Account deleted successfully!');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        setError(result.message || 'Failed to delete account');
      }
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

  const actionCopy = {
    profile: {
      title: 'Save profile changes',
      description: 'Review your updated details before saving.'
    },
    password: {
      title: 'Update password',
      description: 'Confirm you want to update your account password.'
    },
    delete: {
      title: 'Delete account',
      description: 'This permanently removes your account and data.'
    }
  };

  const successCopy = {
    profile: 'Your profile information is now up to date.',
    password: 'Your password has been changed successfully.'
  };

  const inputClassName =
    'mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-gray-400';

  const primaryButtonClass =
    'inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60';

  const secondaryButtonClass =
    'inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60';

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Loading state */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
          <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white px-8 py-6 shadow-lg">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />
            <p className="text-sm font-medium text-gray-700">Loading your settings…</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
          <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <FiCheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Changes saved</h3>
                  <p className="text-sm text-gray-600">
                    {successCopy[lastCompletedAction] || 'Your settings have been updated.'}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setShowSuccessModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className={`${primaryButtonClass} mt-6`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${confirmAction === 'delete' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                {confirmAction === 'delete' ? <FiAlertCircle className="h-5 w-5" /> : <FiShield className="h-5 w-5" />}
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">{actionCopy[confirmAction]?.title || 'Confirm action'}</h2>
                <p className="text-xs text-gray-500">{actionCopy[confirmAction]?.description}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              {confirmAction === 'delete'
                ? 'Once deleted, your data cannot be recovered.'
                : 'Select confirm to continue or cancel to go back.'}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className={`${confirmAction === 'delete' ? 'bg-red-500 hover:bg-red-600 focus:ring-red-200' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-200'} inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60`}
                onClick={handleConfirmedAction}
                disabled={loading}
              >
                Confirm
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => setConfirmAction(null)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="rounded-lg border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Resident settings</h1>
              <p className="mt-1 text-sm text-gray-600">Manage your personal details, password, and account status in one place.</p>
            </div>
            {userData && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                <p><span className="font-medium text-gray-700">Signed in as:</span> {`${userData.firstname || ''} ${userData.lastname || ''}`.trim() || 'Resident'}</p>
                <p>{userData.email || 'No email on file'}</p>
              </div>
            )}
          </div>
        </header>

        {(error || success) && (
          <div className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${
            error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}>
            <div className="mt-0.5">
              {error ? <FiAlertCircle className="h-5 w-5" /> : <FiCheckCircle className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-medium">{error ? 'Update failed' : 'Update successful'}</p>
              <p>{error || success}</p>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <FiUser className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Profile information</h2>
                <p className="text-sm text-gray-600">Keep these details current so we can send timely collection updates.</p>
              </div>
            </div>
            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onProfileUpdate}>
              <label className="text-sm font-medium text-gray-700">
                First name
                <input
                  name="firstname"
                  type="text"
                  placeholder="Juan"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  className={inputClassName}
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Last name
                <input
                  name="lastname"
                  type="text"
                  placeholder="Dela Cruz"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  className={inputClassName}
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Email address
                <input
                  name="email"
                  type="email"
                  placeholder="juan@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={inputClassName}
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Mobile number
                <input
                  name="phone"
                  type="tel"
                  placeholder="09XX XXX XXXX"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={inputClassName}
                />
              </label>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500">We only use your contact information to notify you about collection schedules and important updates.</p>
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={loading} className={secondaryButtonClass}>
                  {loading ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <FiLock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Password</h2>
                  <p className="text-sm text-gray-600">Use a strong password to keep your account secure.</p>
                </div>
              </div>
              <form className="mt-6 space-y-4" onSubmit={onChangePassword}>
                <label className="text-sm font-medium text-gray-700">
                  Current password
                  <div className="relative mt-2">
                    <input
                      name="currentPassword"
                      type={passwordVisibility.current ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className={`${inputClassName} pr-10 mt-0`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                      aria-label={passwordVisibility.current ? 'Hide current password' : 'Show current password'}
                    >
                      {passwordVisibility.current ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
                <label className="text-sm font-medium text-gray-700">
                  New password
                  <div className="relative mt-2">
                    <input
                      name="newPassword"
                      type={passwordVisibility.new ? 'text' : 'password'}
                      placeholder="Create a new password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className={`${inputClassName} pr-10 mt-0`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                      aria-label={passwordVisibility.new ? 'Hide new password' : 'Show new password'}
                    >
                      {passwordVisibility.new ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Confirm new password
                  <div className="relative mt-2">
                    <input
                      name="confirmPassword"
                      type={passwordVisibility.confirm ? 'text' : 'password'}
                      placeholder="Retype new password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`${inputClassName} pr-10 mt-0`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                      aria-label={passwordVisibility.confirm ? 'Hide confirmation password' : 'Show confirmation password'}
                    >
                      {passwordVisibility.confirm ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
                <button type="submit" disabled={loading} className={primaryButtonClass}>
                  {loading ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <FiShield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Privacy & account</h2>
                  <p className="text-sm text-gray-600">You can deactivate your account if you no longer use KolekTrash.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onDeleteAccount}
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Processing…' : 'Delete account'}
              </button>
              <p className="mt-3 text-xs text-gray-500">
                This removes your data permanently. If you plan to return, consider keeping your account active instead.
              </p>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">KolekTrash Resident</h3>
              <p className="mt-2 text-xl font-semibold text-gray-800">Version 1.0.0</p>
              <p className="mt-3 text-sm text-gray-600">
                Need assistance? Email <span className="font-medium text-gray-700">support@kolektrash.ph</span> or open the chat assistant anytime.
              </p>
              <div className="mt-4 space-y-1 text-xs text-gray-500">
                <p>• Last synced: {new Date().toLocaleDateString()}</p>
                <p>• Secure cloud backups enabled</p>
                <p>• Privacy compliant</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
