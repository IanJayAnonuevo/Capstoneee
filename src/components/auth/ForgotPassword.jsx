import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiEye, FiEyeOff, FiLock, FiMail, FiCheckCircle, FiX, FiAlertCircle, FiArrowLeft } from 'react-icons/fi'
import logo from '../../assets/logo/logo.png'
import { buildApiUrl } from '../../config/api'

export default function ForgotPassword({ onBackToLogin }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpSent, setOtpSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalType, setModalType] = useState('info') 
  const navigate = useNavigate()

  const showAlert = (message, type = 'info') => {
    setModalMessage(message)
    setModalType(type)
    setShowModal(true)
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
  const response = await fetch(buildApiUrl('forgot_password.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_reset_code',
          email: email
        })
      })
      
      const data = await response.json()
      
      if (data.status === 'success') {
        setOtpSent(true)
        setStep(2)
        const transport = data?.data?.transport ? String(data.data.transport).toLowerCase() : null
        const deliveredViaFallback = transport && transport !== 'smtp'
        const baseMessage = 'Reset code sent to your email! Please check your inbox and enter the 6-digit code. If you can\'t find it, please check your Spam or Junk folder.'
        if (deliveredViaFallback) {
          console.warn('Reset code sent using fallback mail transport. Please review SMTP credentials to restore automatic delivery.')
        }
        // Since the API now sends the code via email, we'll show a message
        // and let the user manually enter the code they receive
        showAlert(baseMessage, deliveredViaFallback ? 'info' : 'success')
      } else {
        const detail = data.email_error ? `\nDetails: ${data.email_error}` : ''
        showAlert((data.message || 'Failed to send reset code') + detail, 'error')
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showAlert('Network error: ' + error.message + '. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (idx, value) => {
    if (!/^[0-9]?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[idx] = value
    setOtp(newOtp)
    if (value && idx < 5) {
      document.getElementById(`otp-${idx + 1}`).focus()
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const resetCode = otp.join('')
    
    try {
  const response = await fetch(buildApiUrl('forgot_password.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify_reset_code',
          email: email,
          reset_code: resetCode
        })
      })
      
      const data = await response.json()
      
      if (data.status === 'success') {
        setStep(3)
      } else {
        showAlert(data.message || 'Invalid reset code', 'error')
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showAlert('Network error: ' + error.message + '. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.')
      return
    }
    setPasswordError('')
    setLoading(true)
    
    const resetCode = otp.join('')
    
    try {
  const response = await fetch(buildApiUrl('forgot_password.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reset_password',
          email: email,
          reset_code: resetCode,
          new_password: newPassword
        })
      })
      
      const data = await response.json()
      
      if (data.status === 'success') {
        setSuccess(true)
        // Clear temporary data
        localStorage.removeItem('temp_reset_code')
      } else {
        showAlert(data.message || 'Failed to reset password', 'error')
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showAlert('Network error: ' + error.message + '. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    if (typeof onBackToLogin === 'function') {
      onBackToLogin()
    } else {
      navigate('/login')
    }
  }

  return (
    <>
      {/* Enhanced loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-2xl shadow-2xl max-w-sm mx-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
            <h3 className="mt-6 text-xl font-semibold text-gray-800">
              {step === 1 && 'Sending reset code...'}
              {step === 2 && 'Verifying code...'}
              {step === 3 && 'Updating password...'}
            </h3>
            <p className="text-sm text-gray-600 mt-2">Please wait a moment</p>
            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fadeIn">
            <div className="p-8">
              {/* Close button - top right */}
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              {/* Centered icon */}
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  modalType === 'success' ? 'bg-green-100' : 
                  modalType === 'error' ? 'bg-red-100' : 'bg-emerald-100'
                }`}>
                  {modalType === 'success' ? (
                    <FiCheckCircle className="w-8 h-8 text-green-600" />
                  ) : modalType === 'error' ? (
                    <FiAlertCircle className="w-8 h-8 text-red-600" />
                  ) : (
                    <FiMail className="w-8 h-8 text-emerald-600" />
                  )}
                </div>
              </div>
              
              {/* Centered title */}
              <h3 className={`text-xl font-bold mb-3 text-center ${
                modalType === 'success' ? 'text-green-800' : 
                modalType === 'error' ? 'text-red-800' : 'text-emerald-800'
              }`}>
                {modalType === 'success' ? 'Success!' : 
                 modalType === 'error' ? 'Error' : 'Information'}
              </h3>
              
              {/* Centered message */}
              <p className="text-gray-600 mb-6 text-center leading-relaxed">{modalMessage}</p>
              
              {/* OK button */}
              <button
                onClick={() => setShowModal(false)}
                className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                  modalType === 'success' ? 'bg-green-600 hover:bg-green-700' : 
                  modalType === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-100 px-4 py-6">
        <div className="w-full max-w-md md:max-w-4xl flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Left side: Branding - hidden on mobile, shown on desktop */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-500 to-green-600 items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            <div className="relative z-10 text-center text-white p-8">
              <div className="flex items-center justify-center mb-6">
                <img
                  src={logo}
                  alt="KolekTrash logo"
                  className="h-20 w-auto drop-shadow-lg"
                />
              </div>
              <h1 className="text-4xl font-bold mb-4">Password Reset</h1>
              <p className="text-green-100 text-lg mb-8">Secure & Simple Recovery</p>
              <div className="space-y-3 text-green-100">
                <div className="flex items-center justify-center gap-3">
                  <span className="w-3 h-3 bg-green-200 rounded-full"></span>
                  <span>Email Verification</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="w-3 h-3 bg-green-200 rounded-full"></span>
                  <span>OTP Security</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="w-3 h-3 bg-green-200 rounded-full"></span>
                  <span>Instant Access</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile header - visible only on mobile */}
          <div className="md:hidden bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-6 px-6">
            <div className="flex items-center justify-center mb-3">
              <img
                src={logo}
                alt="KolekTrash logo"
                className="h-12 w-auto drop-shadow"
              />
            </div>
            <h1 className="text-xl font-bold">Password Reset</h1>
            <p className="text-green-100 text-sm mt-1">Recover your account</p>
          </div>
          
          {/* Right side: Form content */}
          <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
            
            {/* Step 1: Email Input */}
            {step === 1 && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
                  <p className="text-gray-600 text-sm">Enter your email to receive a reset code</p>
                </div>
                
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
                        <FiMail size={18} />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="pl-12 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter your email address"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <span>Send Reset Code</span>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Enter Verification Code</h2>
                  <p className="text-gray-600 text-sm">We sent a 6-digit code to</p>
                  <p className="text-green-600 font-semibold text-sm">{email}</p>
                </div>
                
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700 text-center">Verification Code</label>
                    <div className="flex justify-center gap-2 mt-4">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(idx, e.target.value)}
                          className="w-12 h-14 text-center border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-xl font-semibold bg-gray-50 focus:bg-white transition-all duration-200"
                          disabled={loading}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify Code</span>
                    )}
                  </button>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-green-600 hover:text-green-700 font-medium transition-colors text-sm"
                    >
                      Didn't receive code? Try again
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step 3: New Password */}
            {step === 3 && !success && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Create New Password</h2>
                  <p className="text-gray-600 text-sm">Enter a strong password for your account</p>
                </div>
                
                {passwordError && (
                  <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-md mb-6 shadow-sm">
                    <div className="flex items-center">
                      <span className="text-red-500 mr-2">⚠️</span>
                      <span className="text-sm">{passwordError}</span>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">New Password</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
                        <FiLock size={18} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="pl-12 pr-12 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter new password (min. 6 characters)"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Confirm New Password</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
                        <FiLock size={18} />
                      </span>
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="pl-12 pr-12 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Confirm new password"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Success State */}
            {success && (
              <>
                <div className="text-center mb-8">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FiCheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Password Reset Successful!</h2>
                  <p className="text-gray-600 text-sm">Your password has been updated successfully.</p>
                  <p className="text-gray-600 text-sm">You can now login with your new password.</p>
                </div>
                
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <FiArrowLeft size={20} />
                  <span>Back to Login</span>
                </button>
              </>
            )}

            {/* Navigation Links */}
            {!success && (
              <div className="mt-6 text-center space-y-3">
                <Link
                  to="/"
                  className="inline-flex items-center text-gray-500 hover:text-gray-700 text-sm transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            )}

            {/* Terms and Privacy */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Secure password recovery powered by{' '}
                <span className="text-green-600 font-medium">KolekTrash</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 
