import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '../../config/api';
import { FiX, FiCamera, FiUpload, FiCheckCircle } from 'react-icons/fi';

export default function TimeInModal({ isOpen, onClose, userData, onSuccess, intent = 'time_in', attendanceDate = null, session = null }) {
  const [personnelId, setPersonnelId] = useState(userData?.user_id?.toString() || '');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [scheduleId, setScheduleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const cameraInputRef = useRef(null);

  React.useEffect(() => {
    if (isOpen && userData?.user_id) {
      setPersonnelId(userData.user_id.toString());
    }
  }, [isOpen, userData]);

  const addWatermarkToImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Get current date and time
          const now = new Date();
          const dateStr = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          const timeStr = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: true 
          });

          // Watermark styling
          const fontSize = Math.max(20, Math.floor(img.width / 30));
          ctx.font = `bold ${fontSize}px Arial`;
          
          // Add semi-transparent background for watermark
          const padding = 10;
          const lineHeight = fontSize + 5;
          const bgHeight = (lineHeight * 2) + (padding * 2);
          const bgWidth = canvas.width;
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(0, canvas.height - bgHeight, bgWidth, bgHeight);

          // Add text watermark
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          
          // Draw date
          ctx.fillText(dateStr, padding, canvas.height - bgHeight + padding);
          
          // Draw time
          ctx.fillText(timeStr, padding, canvas.height - bgHeight + padding + lineHeight);

          // Convert canvas to blob
          canvas.toBlob((blob) => {
            const watermarkedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(watermarkedFile);
          }, file.type, 0.95);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = async (e) => {
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

    setError('');

    // Add watermark to the image
    const watermarkedFile = await addWatermarkToImage(file);
    setPhoto(watermarkedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(watermarkedFile);
  };

  const handleCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
      formData.append('user_id', userData?.user_id || personnelId);
      formData.append('photo', photo);
      if (remarks.trim()) {
        formData.append('remarks', remarks.trim());
      }
      // If modal opened for time_out, include intent + attendance_date + session so backend can process accordingly
      if (intent) {
        formData.append('intent', intent);
      }
      if (attendanceDate) {
        formData.append('attendance_date', attendanceDate);
      }
      if (session) {
        formData.append('session', session);
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
        // Close modal immediately and show success on parent
        handleClose();
        onSuccess?.();
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
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <FiCamera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-4">Take a photo for attendance proof</p>
                  <button
                    type="button"
                    onClick={handleCapture}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 mx-auto"
                  >
                    <FiCamera className="w-5 h-5" />
                    Take Photo
                  </button>
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
            </div>
            <p className="text-xs text-gray-500 mt-2">Photo will include date and time watermark</p>
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

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
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
              disabled={loading || !photo}
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







