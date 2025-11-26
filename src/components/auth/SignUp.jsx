import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiUser, FiMail, FiLock, FiMapPin, FiChevronDown, FiUserPlus, FiCheck, FiX, FiCheckCircle, FiAlertTriangle, FiArrowLeft, FiArrowRight, FiShield, FiRefreshCcw, FiClock } from 'react-icons/fi'
import axios from "axios";
import logo from '../../assets/logo/logo.png'
import { buildApiUrl } from '../../config/api'

const barangays = [
  'Aldezar',
  'Alteza',
  'Anib',
  'Awayan',
  'Azucena',
  'Bagong Sirang',
  'Binahian',
  'Bolo Norte',
  'Bolo Sur',
  'Bulan',
  'Bulawan',
  'Cabuyao',
  'Caima',
  'Calagbangan',
  'Calampinay',
  'Carayrayan',
  'Cotmo',
  'Gabi',
  'Gaongan',
  'Impig',
  'Lipilip',
  'Lubigan Jr.',
  'Lubigan Sr.',
  'Malaguico',
  'Malubago',
  'Manangle',
  'Mangapo',
  'Mangga',
  'Manlubang',
  'Mantila',
  'North Centro (Poblacion)',
  'North Villazar',
  'Sagrada Familia',
  'Salanda',
  'Salvacion',
  'San Isidro',
  'San Vicente',
  'Serranzana',
  'South Centro (Poblacion)',
  'South Villazar',
  'Taisan',
  'Tara',
  'Tible',
  'Tula-tula',
  'Vigaan',
  'Yabo'
]

const MIN_LOADING_DURATION_MS = 2000

const waitForMinimumDuration = async (startTime, minDuration = MIN_LOADING_DURATION_MS) => {
  const elapsed = Date.now() - startTime
  if (elapsed < minDuration) {
    await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed))
  }
}

export default function SignUp({ onLoginClick } = {}) {
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    contact_num: '',
    email: '',
    username: '',
    barangay: barangays[0],
    password: '',
    confirmPassword: '',
    address: '',
    barangay_id: ''
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [feedbackModal, setFeedbackModal] = useState({ open: false, type: 'success', title: '', message: '' })
  const [redirectCountdown, setRedirectCountdown] = useState(0)
  const [verificationCode, setVerificationCode] = useState(new Array(6).fill(''))
  const [verificationError, setVerificationError] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [verifiedEmail, setVerifiedEmail] = useState('')
  const [verificationExpiry, setVerificationExpiry] = useState(null)
  const [verificationDevCode, setVerificationDevCode] = useState(null)
  const [resendTimer, setResendTimer] = useState(0)
  const [loadingState, setLoadingState] = useState(null)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState(null) // null = unknown, true/false when checked
  const navigate = useNavigate()

  const steps = [
    {
      key: 'personal',
      title: 'Personal Info',
      description: 'Tell us a little about yourself.',
      fields: ['firstname', 'lastname', 'contact_num', 'email']
    },
    {
      key: 'account',
      title: 'Account Security',
      description: 'Create credentials for your account.',
      fields: ['username', 'password', 'confirmPassword']
    },
    {
      key: 'location',
      title: 'Address Details',
      description: 'Let us know where we can reach you.',
      fields: ['barangay_id', 'address']
    },
    {
      key: 'verify',
      title: 'Verify Email',
      description: 'Enter the code we sent to confirm your email.',
      fields: []
    }
  ]

  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = steps.length

  const handleGoToLogin = useCallback(() => {
    const base = window.location.pathname.startsWith('/kolektrash') ? '/kolektrash' : ''
    const loginUrl = `${base}/login`

    setFeedbackModal(prev => ({ ...prev, open: false }))
    setRedirectCountdown(0)

    if (typeof onLoginClick === 'function') {
      onLoginClick()
    }

    try {
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Navigate fallback triggered:', err)
    }

    window.setTimeout(() => {
      if (window.location.pathname !== loginUrl) {
        window.location.href = loginUrl
      }
    }, 150)
  }, [navigate, onLoginClick])

  useEffect(() => {
    let timer
    if (feedbackModal.open && feedbackModal.type === 'success') {
      setRedirectCountdown(5)
      timer = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            handleGoToLogin()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [feedbackModal.open, feedbackModal.type, handleGoToLogin])

  useEffect(() => {
    if (!verificationSent || resendTimer <= 0) return

    const timer = setInterval(() => {
      setResendTimer(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [verificationSent, resendTimer])

  // Validation rules
  const validationRules = {
    firstname: (value) => {
      if (!value.trim()) return 'First name is required'
      if (value.length < 2) return 'First name must be at least 2 characters'
      if (!/^[a-zA-Z\s]+$/.test(value)) return 'First name can only contain letters and spaces'
      return null
    },
    lastname: (value) => {
      if (!value.trim()) return 'Last name is required'
      if (value.length < 2) return 'Last name must be at least 2 characters'
      if (!/^[a-zA-Z\s]+$/.test(value)) return 'Last name can only contain letters and spaces'
      return null
    },
    contact_num: (value) => {
      if (!value.trim()) return 'Contact number is required'
      if (!/^(\+63|0)?9\d{9}$/.test(value.replace(/\s/g, ''))) return 'Please enter a valid Philippine mobile number'
      return null
    },
    email: (value) => {
      if (!value.trim()) return 'Email is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address'
      return null
    },
    username: (value) => {
      if (!value.trim()) return 'Username is required'
      if (value.length < 3) return 'Username must be at least 3 characters'
      if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores'
      return null
    },
    barangay_id: (value) => {
      if (!value) return 'Please select a barangay'
      return null
    },
    password: (value) => {
      if (!value) return 'Password is required'
      if (value.length < 6) return 'Password must be at least 6 characters'
      if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter'
      if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter'
      if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number'
      return null
    },
    confirmPassword: (value) => {
      if (!value) return 'Please confirm your password'
      if (value !== form.password) return 'Passwords do not match'
      return null
    },
    address: (value) => {
      if (!value.trim()) return 'Address is required'
      if (value.length < 10) return 'Address must be at least 10 characters'
      return null
    }
  }

  // Validate single field
  const validateField = (name, value) => {
    const rule = validationRules[name]
    return rule ? rule(value) : null
  }

  // Validate all fields
  const validateForm = () => {
    const newErrors = {}
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key])
      if (error) newErrors[key] = error
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle field change with validation
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }

    if (name === 'email' && verificationSent) {
      resetVerificationState()
    }

    if (name === 'email') {
      // Reset availability state until rechecked
      setEmailAvailable(null)
    }
  }

  // Handle field blur with validation
  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))

    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))

    // On email blur, check server-side availability when format is valid
    if (name === 'email' && !error) {
      void checkEmailAvailability(value)
    }
  }

  const markFieldsTouched = (fields) =>
    fields.reduce((acc, field) => {
      acc[field] = true
      return acc
    }, {})

  const validateStep = (stepIndex) => {
    const step = steps[stepIndex]
    if (!step) return true

    const stepErrors = {}
    step.fields.forEach(field => {
      const error = validateField(field, form[field])
      if (error) stepErrors[field] = error
    })

    // Also enforce email availability on step 0
    if (stepIndex === 0) {
      if (checkingEmail) {
        stepErrors.email = stepErrors.email || 'Checking email availability...'
      } else if (emailAvailable === false) {
        stepErrors.email = 'Email already in use.'
      }
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...stepErrors }))
      setTouched(prev => ({ ...prev, ...markFieldsTouched(step.fields) }))
      return false
    }

    return true
  }

  // Server-side email availability check
  const checkEmailAvailability = async (value) => {
    const normalized = (value || '').trim().toLowerCase()
    if (!normalized) {
      setEmailAvailable(null)
      return false
    }
    // If format invalid, do not call backend
    if (validateField('email', normalized)) {
      setEmailAvailable(null)
      return false
    }

    try {
      setCheckingEmail(true)
      const res = await axios.post(buildApiUrl('check_email.php'), { email: normalized })
      const data = res.data || {}
      if (data.success && data.available === true) {
        setEmailAvailable(true)
        // clear only our availability error
        setErrors(prev => ({ ...prev, email: prev.email && prev.email !== 'Email already in use.' ? prev.email : null }))
        return true
      } else {
        setEmailAvailable(false)
        setErrors(prev => ({ ...prev, email: data.message || 'Email already in use.' }))
        return false
      }
    } catch {
      setEmailAvailable(null)
      setErrors(prev => ({ ...prev, email: 'Unable to validate email right now.' }))
      return false
    } finally {
      setCheckingEmail(false)
    }
  }

  const resetVerificationState = () => {
    setVerificationCode(new Array(6).fill(''))
    setVerificationError('')
    setVerificationSent(false)
    setVerifiedEmail('')
    setVerificationExpiry(null)
    setVerificationDevCode(null)
    setResendTimer(0)
  }

  const sendVerificationCode = async ({ isResend = false, autoAdvance = false } = {}) => {
    if (!isResend) {
      const isValid = validateStep(2)
      if (!isValid) {
        return
      }
    }

    if (!isResend && verificationSent && form.email !== verifiedEmail) {
      resetVerificationState()
    }

    setVerificationError('')
    setError('')
    setLoading(true)
    setLoadingState('sending-code')
    const startTime = Date.now()

    try {
      if (!isResend && form.email !== verifiedEmail && verificationSent) {
        resetVerificationState()
      }

      const response = await axios.post(buildApiUrl('signup_verification.php'), {
        action: 'send_verification_code',
        email: form.email,
        firstname: form.firstname,
        lastname: form.lastname
      })

      const data = response.data ?? {}
      const deliveryFailed = (data.delivery || '').toLowerCase() === 'failed'


      setVerificationSent(true)
      setVerifiedEmail(form.email)
      setVerificationCode(new Array(6).fill(''))
      setVerificationExpiry(data?.expiry_time ?? null)
      setVerificationDevCode(deliveryFailed ? data?.verification_code ?? null : null)

      if (deliveryFailed) {
        const failureDetails = data?.email_error
          ? ` Email provider responded with: ${data.email_error}.`
          : ''
        setVerificationError('Verification code email could not be sent automatically.' + failureDetails)
      } else {
        setVerificationError('')
      }
      setResendTimer(60)

      if (autoAdvance) {
        setCurrentStep(3)
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send verification code. Please try again.'
      if (verificationSent || isResend) {
        setVerificationError(message)
      } else {
        setError(message)
      }

      const retryAfter = error.response?.data?.retry_after
      if (retryAfter) {
        setResendTimer(Math.max(0, Math.ceil(Number(retryAfter))))
      }

      if (autoAdvance) {
        resetVerificationState()
      }
      setVerificationDevCode(null)
    } finally {
      await waitForMinimumDuration(startTime)
      setLoading(false)
      setLoadingState(null)
    }
  }

  const handleVerificationCodeChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return

    const updated = [...verificationCode]
    updated[index] = value
    setVerificationCode(updated)

    if (value && index < verificationCode.length - 1) {
      const nextInput = document.getElementById(`verification-code-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleVerificationCodeKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`verification-code-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const completeRegistration = async () => {
    const code = verificationCode.join('')

    if (code.length !== 6) {
      setVerificationError('Please enter the 6-digit verification code sent to your email.')
      return
    }

    if (!verificationSent || verifiedEmail !== form.email) {
      setVerificationError('Please request a new verification code for the current email address.')
      return
    }

    if (!validateForm()) {
      const allTouched = {}
      Object.keys(form).forEach(key => allTouched[key] = true)
      setTouched(allTouched)
      setCurrentStep(0)
      return
    }

    setVerificationError('')
    setError('')
    setLoading(true)
    setLoadingState('verifying-code')
    const startTime = Date.now()

    try {
      await axios.post(buildApiUrl('signup_verification.php'), {
        action: 'verify_code',
        email: form.email,
        verification_code: code
      })

      setLoadingState('creating-account')

      const res = await axios.post(buildApiUrl('register_resident.php'), {
        ...form,
        verification_code: code
      })

      const message = res.data?.message || 'Your account has been created successfully.'
      setSuccess(message)
      setFeedbackModal({
        open: true,
        type: 'success',
        title: 'Account Created!',
        message
      })
      setRedirectCountdown(5)

      setForm({
        firstname: '',
        lastname: '',
        contact_num: '',
        email: '',
        username: '',
        barangay: barangays[0],
        password: '',
        confirmPassword: '',
        address: '',
        barangay_id: ''
      })
      setErrors({})
      setTouched({})
      setCurrentStep(0)
      resetVerificationState()
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.'

      if (message.toLowerCase().includes('verification')) {
        setVerificationError(message)
      } else {
        setError(message)
        setFeedbackModal({
          open: true,
          type: 'error',
          title: 'Registration Failed',
          message
        })
        setRedirectCountdown(0)
      }
    } finally {
      await waitForMinimumDuration(startTime)
      setLoading(false)
      setLoadingState(null)
    }
  }

  const getLoadingCopy = () => {
    switch (loadingState) {
      case 'sending-code':
        return {
          title: 'Sending verification code...',
          subtitle: 'We are delivering a secure code to your email.'
        }
      case 'verifying-code':
        return {
          title: 'Verifying your email...',
          subtitle: 'Hold on while we confirm your verification code.'
        }
      case 'creating-account':
        return {
          title: 'Creating your account...',
          subtitle: 'Please wait while we set up your profile.'
        }
      default:
        return {
          title: 'Processing...',
          subtitle: 'Please wait a moment.'
        }
    }
  }

  const handleNext = async () => {
    if (currentStep >= 2) return

    // Validate current step fields first
    const isValid = validateStep(currentStep)
    if (!isValid) return

    // On step 0, ensure server-side email availability check is done and passed
    if (currentStep === 0) {
      const emailError = validateField('email', form.email)
      if (!emailError) {
        // Always ensure we have a fresh result; rely on the function's return
        const ok = await checkEmailAvailability(form.email)
        if (!ok) {
          // Error message should already be set by the checker; block advance
          return
        }
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1))
  }

  const handleBack = () => {
    if (currentStep === 0) return

    if (currentStep === 3) {
      resetVerificationState()
    }

    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (currentStep === 0 || currentStep === 1) {
      handleNext()
      return
    }

    if (currentStep === 2) {
      await sendVerificationCode({ autoAdvance: true })
      return
    }

    if (currentStep === 3) {
      await completeRegistration()
    }
  }

  // Helper function to get field status
  const getFieldStatus = (name) => {
    if (!touched[name]) return 'default'
    if (errors[name]) return 'error'
    if (form[name] && !errors[name]) return 'success'
    return 'default'
  }

  // Helper function to get field classes
  const getFieldClasses = (name) => {
    const baseClasses = "pl-12 w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
    const status = getFieldStatus(name)

    switch (status) {
      case 'error':
        return `${baseClasses} border-red-300 focus:ring-red-500`
      case 'success':
        return `${baseClasses} border-green-300 focus:ring-green-500`
      default:
        return `${baseClasses} border-gray-300 focus:ring-green-500`
    }
  }

  const loadingCopy = getLoadingCopy()

  return (
    <>
      {/* Enhanced loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-2xl shadow-2xl max-w-sm mx-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
            <h3 className="mt-6 text-xl font-semibold text-gray-800">{loadingCopy.title}</h3>
            <p className="text-sm text-gray-600 mt-2">{loadingCopy.subtitle}</p>
            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback modal */}
      {feedbackModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
            {feedbackModal.type === 'error' && (
              <button
                type="button"
                onClick={() => setFeedbackModal(prev => ({ ...prev, open: false }))}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            )}
            <div className="flex flex-col items-center text-center space-y-4 mt-2">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-inner ${feedbackModal.type === 'success'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                  }`}
              >
                {feedbackModal.type === 'success' ? (
                  <FiCheckCircle size={36} />
                ) : (
                  <FiAlertTriangle size={32} />
                )}
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${feedbackModal.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                  {feedbackModal.title}
                </h3>
                <p className="text-gray-600 mt-2 whitespace-pre-wrap">{feedbackModal.message}</p>
              </div>
              {feedbackModal.type === 'success' ? (
                <div className="flex flex-col items-center gap-4 w-full mt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Redirecting to login in {redirectCountdown}s...</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-green-100 overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-1000"
                      style={{ width: `${Math.max(0, (5 - redirectCountdown) * 20)}%` }}
                    ></div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGoToLogin}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Go to Login Now
                  </button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-3 w-full mt-4">
                  <button
                    type="button"
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow"
                    onClick={() => setFeedbackModal(prev => ({ ...prev, open: false }))}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-100 px-4 py-6">
        <div className="w-full max-w-md md:max-w-5xl flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Left side: Branding - hidden on mobile, shown on desktop */}
          <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-green-500 to-green-600 items-center justify-center relative overflow-hidden">
            <div className="text-center text-white p-8">
              <div className="flex items-center justify-center mb-6">
                <img
                  src={logo}
                  alt="KolekTrash logo"
                  className="h-20 w-auto drop-shadow-lg"
                />
              </div>
              <h1 className="text-4xl font-bold tracking-[0.2em] uppercase mb-3">KOLEKTRASH</h1>
              <p className="text-green-100 text-lg font-medium">MENRO Waste Collection System</p>
            </div>
          </div>

          {/* Mobile header - visible only on mobile */}
          <div className="md:hidden bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-6 px-6 border-b border-white/10">
            <div className="flex items-center justify-center mb-3">
              <img
                src={logo}
                alt="KolekTrash logo"
                className="h-12 w-auto drop-shadow"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-[0.25em] uppercase">KOLEKTRASH</h1>
            <p className="text-green-100 text-sm mt-1 font-medium">MENRO Waste Collection System</p>
          </div>

          {/* Right side: SignUp form */}
          <div className="w-full md:w-3/5 p-5 sm:p-6 md:p-10 flex flex-col justify-center max-h-[90vh] md:max-h-none overflow-y-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
              <p className="text-gray-600 text-sm sm:text-base">Fill in your details to get started</p>
            </div>

            {/* Error Message */}
            {error && !feedbackModal.open && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-md mb-4 shadow-sm">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && !feedbackModal.open && (
              <div className="bg-green-50 border-l-4 border-green-400 text-green-700 px-4 py-3 rounded-r-md mb-4 shadow-sm">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  <span className="text-sm">{success}</span>
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                {steps.map((step, index) => {
                  const isActive = index === currentStep
                  const isCompleted = index < currentStep
                  return (
                    <div key={step.key} className="flex items-center">
                      <div className="flex flex-col items-center min-w-[4.5rem]">
                        <div
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-colors duration-200 ${isCompleted
                              ? 'bg-green-500 border-green-500 text-white'
                              : isActive
                                ? 'bg-green-50 border-green-500 text-green-600'
                                : 'bg-white border-gray-200 text-gray-400'
                            }`}
                        >
                          {index + 1}
                        </div>
                        <span
                          className={`mt-2 text-xs font-medium text-center ${isCompleted || isActive ? 'text-green-600' : 'text-gray-500'
                            }`}
                        >
                          {step.title}
                        </span>
                      </div>
                      {index < totalSteps - 1 && (
                        <div
                          className={`hidden sm:block w-16 h-0.5 mx-2 ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                        ></div>
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="mt-4 text-center text-sm text-gray-500">{steps[currentStep].description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 0 && (
                <div className="space-y-4 sm:space-y-5">
                  {/* First Name */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">First Name</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
                        <FiUser size={18} />
                      </span>
                      <input
                        type="text"
                        name="firstname"
                        required
                        value={form.firstname}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getFieldClasses('firstname')}
                        placeholder="Enter your first name"
                        disabled={loading}
                      />
                      {getFieldStatus('firstname') === 'success' && (
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500">
                          <FiCheck size={18} />
                        </span>
                      )}
                      {getFieldStatus('firstname') === 'error' && (
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500">
                          <FiX size={18} />
                        </span>
                      )}
                    </div>
                    {touched.firstname && errors.firstname && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <FiX size={12} />
                        {errors.firstname}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Last Name</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
                        <FiUser size={18} />
                      </span>
                      <input
                        type="text"
                        name="lastname"
                        required
                        value={form.lastname}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getFieldClasses('lastname')}
                        placeholder="Enter your last name"
                        disabled={loading}
                      />
                      {getFieldStatus('lastname') === 'success' && (
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500">
                          <FiCheck size={18} />
                        </span>
                      )}
                      {getFieldStatus('lastname') === 'error' && (
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500">
                          <FiX size={18} />
                        </span>
                      )}
                    </div>
                    {touched.lastname && errors.lastname && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <FiX size={12} />
                        {errors.lastname}
                      </p>
                    )}
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Contact Number</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
                        <FiUser size={18} />
                      </span>
                      <input
                        type="text"
                        name="contact_num"
                        required
                        value={form.contact_num}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getFieldClasses('contact_num')}
                        placeholder="e.g., 09123456789"
                        disabled={loading}
                      />
                      {getFieldStatus('contact_num') === 'success' && (
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500">
                          <FiCheck size={18} />
                        </span>
                      )}
                      {getFieldStatus('contact_num') === 'error' && (
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500">
                          <FiX size={18} />
                        </span>
                      )}
                    </div>
                    {touched.contact_num && errors.contact_num && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <FiX size={12} />
                        {errors.contact_num}
                      </p>
                    )}
                    {!errors.contact_num && !verificationSent && (
                      <p className="text-xs text-gray-500">We'll use this number only for important service updates.</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
                        <FiMail size={18} />
                      </span>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getFieldClasses('email')}
                        placeholder="example@example.com"
                        disabled={loading || verificationSent}
                      />
                      {getFieldStatus('email') === 'success' && (
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500">
                          <FiCheck size={18} />
                        </span>
                      )}
                      {getFieldStatus('email') === 'error' && (
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500">
                          <FiX size={18} />
                        </span>
                      )}
                    </div>
                    {touched.email && errors.email && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <FiX size={12} />
                        {errors.email}
                      </p>
                    )}
                    {verificationSent && !errors.email && (
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <FiShield size={12} />
                        <span>
                          Verification code sent to <span className="font-semibold">{verifiedEmail}</span>. Email locked while verifying.
                        </span>
                      </div>
                    )}
                    {!verificationSent && !errors.email && (
                      <p className="text-xs text-gray-500">We'll send a verification code to confirm your email.</p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4 sm:space-y-5">
                  {/* Username */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Username</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
                        <FiUser size={18} />
                      </span>
                      <input
                        type="text"
                        name="username"
                        required
                        value={form.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getFieldClasses('username')}
                        placeholder="Choose a username"
                        disabled={loading}
                      />
                      {getFieldStatus('username') === 'success' && (
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500">
                          <FiCheck size={18} />
                        </span>
                      )}
                      {getFieldStatus('username') === 'error' && (
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500">
                          <FiX size={18} />
                        </span>
                      )}
                    </div>
                    {touched.username && errors.username && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <FiX size={12} />
                        {errors.username}
                      </p>
                    )}
                  </div>

                  {/* Password and Confirm Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-700">Password</label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
                          <FiLock size={18} />
                        </span>
                        <input
                          type="password"
                          name="password"
                          required
                          value={form.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getFieldClasses('password')}
                          placeholder="Min. 6 characters"
                          disabled={loading}
                        />
                      </div>
                      {touched.password && errors.password && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <FiX size={12} />
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
                          <FiLock size={18} />
                        </span>
                        <input
                          type="password"
                          name="confirmPassword"
                          required
                          value={form.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getFieldClasses('confirmPassword')}
                          placeholder="Confirm password"
                          disabled={loading}
                        />
                      </div>
                      {touched.confirmPassword && errors.confirmPassword && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <FiX size={12} />
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4 sm:space-y-5">
                  {/* Barangay Dropdown */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Barangay</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors z-10">
                        <FiMapPin size={18} />
                      </span>
                      <select
                        name="barangay_id"
                        value={form.barangay_id}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className={getFieldClasses('barangay_id')}
                      >
                        <option value="">Select Barangay</option>
                        <option value="01-ALDZR">Aldezar</option>
                        <option value="02-ALTZ">Alteza</option>
                        <option value="03-ANB">Anib</option>
                        <option value="04-AWYN">Awayan</option>
                        <option value="05-AZCN">Azucena</option>
                        <option value="06-BGNGS">Bagong Sirang</option>
                        <option value="07-BNHN">Binahian</option>
                        <option value="08-BLNRT">Bolo Norte</option>
                        <option value="09-BLSR">Bolo Sur</option>
                        <option value="10-BLN">Bulan</option>
                        <option value="11-BLWN">Bulawan</option>
                        <option value="12-CBY">Cabuyao</option>
                        <option value="13-CM">Caima</option>
                        <option value="14-CLGBN">Calagbangan</option>
                        <option value="15-CLMPN">Calampinay</option>
                        <option value="16-CRYRY">Carayrayan</option>
                        <option value="17-CTM">Cotmo</option>
                        <option value="18-GB">Gabi</option>
                        <option value="19-GNGN">Gaongan</option>
                        <option value="20-IMPG">Impig</option>
                        <option value="21-LPLP">Lipilip</option>
                        <option value="22-LBGNJ">Lubigan Jr.</option>
                        <option value="23-LBGNS">Lubigan Sr.</option>
                        <option value="24-MLGC">Malaguico</option>
                        <option value="25-MLBG">Malubago</option>
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <FiChevronDown size={16} />
                      </span>
                    </div>
                    {touched.barangay_id && errors.barangay_id && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <FiX size={12} />
                        {errors.barangay_id}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Address</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
                        <FiMapPin size={18} />
                      </span>
                      <input
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your address"
                        required
                        className={getFieldClasses('address')}
                        disabled={loading}
                      />
                      {getFieldStatus('address') === 'success' && (
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500">
                          <FiCheck size={18} />
                        </span>
                      )}
                      {getFieldStatus('address') === 'error' && (
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500">
                          <FiX size={18} />
                        </span>
                      )}
                    </div>
                    {touched.address && errors.address && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <FiX size={12} />
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Verify your email</h2>
                    <p className="text-gray-600 text-sm">
                      Enter the 6-digit code we sent to{' '}
                      <span className="text-green-600 font-semibold">{verifiedEmail || form.email}</span>
                    </p>
                    {verificationExpiry && (
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        Code expires at {verificationExpiry}
                      </p>
                    )}
                  </div>


                  {verificationError && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm shadow-sm">
                      {verificationError}
                    </div>
                  )}

                  {verificationDevCode && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm shadow-sm space-y-1">
                      <p className="font-medium">Temporary verification code for testing:</p>
                      <p className="font-mono text-lg tracking-widest text-amber-900">{verificationDevCode}</p>
                      <p className="text-xs text-amber-600">
                        Email delivery failed. Update <code className="bg-white px-1 py-0.5 rounded">backend/config/email.php</code> with valid SMTP credentials to enable automatic sending.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-center gap-2">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        id={`verification-code-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(event) => handleVerificationCodeChange(index, event.target.value)}
                        onKeyDown={(event) => handleVerificationCodeKeyDown(index, event)}
                        className="w-12 h-14 text-center border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-xl font-semibold bg-gray-50 focus:bg-white transition-all duration-200"
                        disabled={loading}
                      />
                    ))}
                  </div>

                  <div className="text-center space-y-2">
                    <button
                      type="button"
                      onClick={() => sendVerificationCode({ isResend: true })}
                      disabled={loading || resendTimer > 0}
                      className="inline-flex items-center justify-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 disabled:text-gray-400 transition-colors"
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend verification code'}
                    </button>
                    <p className="text-xs text-gray-500">
                      Make sure to check your spam or promotions folder if you don't see the email.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="w-full sm:w-auto sm:mr-auto inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600 font-semibold py-3 px-5 rounded-xl transition-all duration-200 bg-white shadow-sm hover:shadow"
                  >
                    Back
                  </button>
                )}
                {currentStep < 2 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={loading || (currentStep === 0 && (checkingEmail || emailAvailable === false))}
                    className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Next
                  </button>
                ) : currentStep === 2 ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <span>Send Verification Code</span>
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loadingState === 'creating-account' ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Creating Account...</span>
                      </>
                    ) : loadingState === 'verifying-code' ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <span>Complete Registration</span>
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* Navigation Links */}
            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a
                  href={window.location.pathname.startsWith('/kolektrash') ? '/kolektrash/login' : '/login'}
                  className="text-green-600 hover:text-green-700 font-medium transition-colors underline focus:outline-none focus:ring-0"
                >
                  Sign in here
                </a>
              </p>
              <Link
                to="/"
                className="inline-flex items-center text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                Back to Home
              </Link>
            </div>

            {/* Terms and Privacy */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-green-600 hover:text-green-700 underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-green-600 hover:text-green-700 underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 
