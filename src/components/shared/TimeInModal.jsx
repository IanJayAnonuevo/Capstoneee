import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '../../config/api';
import { FiX, FiCamera, FiUpload, FiCheckCircle } from 'react-icons/fi';

export default function TimeInModal({ isOpen, onClose, userData, onSuccess }) {
  const [personnelId, setPersonnelId] = useState(userData?.user_id?.toString() || '');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [scheduleId, setScheduleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  React.useEffect(() => {
    if (isOpen && userData?.user_id) {
      setPersonnelId(userData.user_id.toString());
    }
  }, [isOpen, userData]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setPhoto(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!personnelId.trim()) {
      setError('Personnel ID is required');
      setLoading(false);
      return;
    }

    if (!photo) {
      setError('Photo proof is required');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication token missing. Please log in again.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('user_id', personnelId);
      formData.append('photo', photo);
      if (remarks.trim()) {
        formData.append('remarks', remarks.trim());
      }
      if (scheduleId.trim()) {
        formData.append('schedule_id', scheduleId.trim());
      }

      const response = await fetch(`${API_BASE_URL}/create_attendance_request.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit attendance request');
      }
    } catch (err) {
      console.error('Time-in error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setPhoto(null);
    setPhotoPreview(null);
    setRemarks('');
    setScheduleId('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Time In Request</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Personnel ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personnel ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={personnelId}
              onChange={(e) => setPersonnelId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter your Personnel ID"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo Proof <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FiCamera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">No photo selected</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={handleCapture}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                    >
                      <FiCamera className="w-4 h-4" />
                      Take Photo
                    </button>
                    <button
                      type="button"
                      onClick={handleUpload}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FiUpload className="w-4 h-4" />
                      Upload
                    </button>
                  </div>
                </div>
              )}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Maximum file size: 5MB (JPG, PNG, WEBP)</p>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Add any additional notes..."
            />
          </div>

          {/* Schedule ID (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schedule ID (Optional)
            </label>
            <input
              type="text"
              value={scheduleId}
              onChange={(e) => setScheduleId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter schedule ID if applicable"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <FiCheckCircle className="w-5 h-5" />
              <span>Attendance request submitted! Waiting for foreman approval.</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !photo || !personnelId.trim()}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



