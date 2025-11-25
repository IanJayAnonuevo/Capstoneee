import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiLock, FiAlertCircle, FiX, FiEye, FiEyeOff } from 'react-icons/fi'
import SignUp from './SignUp'
import ForgotPassword from './ForgotPassword'
import logo from '../../assets/logo/logo.png'
import Skeleton from '../shared/Skeleton'

const MIN_LOADING_DURATION_MS = 2000

const waitForMinimumDuration = async (startTime, minDuration = MIN_LOADING_DURATION_MS) => {
  const elapsed = Date.now() - startTime
  if (elapsed < minDuration) {
    await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed))
  }
}

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',  // Changed from email to username
    password: '',
  })

  const [showSignUp, setShowSignUp] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [errorTitle, setErrorTitle] = useState('Sign-in Error')
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorField, setErrorField] = useState('') // Track which field has error: 'username' or 'password'
  const [isMounting, setIsMounting] = useState(true)

  useEffect(() => {
    // Simulate initial loading for skeleton
    const timer = setTimeout(() => {
      setIsMounting(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const openErrorModal = (message, title = 'Sign-in Error') => {
    setErrorTitle(title)
    setErrorMessage(message)
    setShowErrorModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setShowErrorModal(false)
    setErrorField('') // Clear error field
    setLoading(true)

    const startTime = Date.now()
    let redirectPath = null


    try {
      console.log('Sending login request...', { username: formData.username, password: formData.password })

      // Use the authService instead of direct fetch
      const { authService } = await import('../../services/authService.js')
      const data = await authService.login({
        username: formData.username,
        password: formData.password
      })

      console.log('Login response:', data)

      if (data.status === 'success' && data.data) {
        if (data.access_token) {
          try {
            localStorage.setItem('access_token', data.access_token)
            if (typeof data.expires_in === 'number') {
              const expiresAt = Date.now() + data.expires_in * 1000
              localStorage.setItem('token_expires_at', String(expiresAt))
            } else {
              localStorage.removeItem('token_expires_at')
            }
            if (data.token_type) {
              localStorage.setItem('token_type', data.token_type)
            } else {
              localStorage.removeItem('token_type')
            }
          } catch (storageError) {
            console.error('Unable to persist session token:', storageError)
          }
        }

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.data))
        localStorage.setItem('user_id', data.data.user_id) // Use 'user_id' as the user ID

        const userRole = (data.data.role || '').toLowerCase()
        console.log('User role:', userRole) // Debug log

        // Redirect based on user role
        switch (userRole) {
          case 'admin':
            console.log('Redirecting to admin dashboard...')
            redirectPath = '/admin/dashboard'
            break
          case 'resident':
            redirectPath = '/resident'
            break
          case 'barangay_head':
            redirectPath = '/barangayhead'
            break
          case 'truck_driver':
            redirectPath = '/truckdriver'
            break
          case 'garbage_collector':
            redirectPath = '/garbagecollector'
            break
          case 'foreman':
            redirectPath = '/foreman'
            break
          default:
            console.error('Invalid role:', userRole)
            openErrorModal('Invalid user role: ' + data.data.role, 'Role Not Supported')
        }


      } else {
        // Determine which field has error based on message
        const msg = (data.message || '').toLowerCase()
        if (msg.includes('username') || msg.includes('user not found')) {
          setErrorField('username')
        } else if (msg.includes('password')) {
          setErrorField('password')
        } else {
          setErrorField('both') // If unclear, mark both
        }
        openErrorModal(data.message || 'Login failed. Please check your credentials.', 'Invalid Credentials')
      }
    } catch (err) {
      console.error('Login error:', err)
      const fallbackMessage = err instanceof Error ? err.message : 'Network error. Please try again later.'
      const title = err instanceof Error && err.message.toLowerCase().includes('network')
        ? 'Network Error'
        : 'Sign-in Error'
      openErrorModal(fallbackMessage, title)
    }

    if (redirectPath) {
      await waitForMinimumDuration(startTime)
    }
    setLoading(false)

    if (redirectPath) {
      navigate(redirectPath, { replace: true })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (showSignUp) {
    return <SignUp onLoginClick={() => setShowSignUp(false)} />
  }
  if (showForgot) {
    return <ForgotPassword onBackToLogin={() => setShowForgot(false)} />
  }

  if (isMounting) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-100 px-4 py-6">
        <div className="w-full max-w-md md:max-w-4xl flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Left side skeleton */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-500 to-green-600 items-center justify-center relative overflow-hidden p-8">
            <div className="flex flex-col items-center w-full">
              <Skeleton variant="circular" className="w-20 h-20 mb-6 bg-white/20" />
              <Skeleton className="h-10 w-3/4 mb-3 bg-white/20" />
              <Skeleton className="h-6 w-1/2 bg-white/20" />
            </div>
          </div>

          {/* Mobile header skeleton - visible only on mobile */}
          <div className="md:hidden bg-gradient-to-r from-green-500 to-green-600 py-8 px-6 flex flex-col items-center">
            <Skeleton variant="circular" className="w-14 h-14 mb-4 bg-white/20" />
            <Skeleton className="h-8 w-48 mb-2 bg-white/20" />
            <Skeleton className="h-4 w-64 bg-white/20" />
          </div>

          {/* Right side skeleton */}
          <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
            <div className="text-center mb-8">
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            <div className="space-y-6">
              <div className="space-y-1">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
            <div className="mt-8 text-center">
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-2xl shadow-2xl max-w-sm mx-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
            <h3 className="mt-6 text-xl font-semibold text-gray-800">Signing you in...</h3>
            <p className="text-sm text-gray-600 mt-2">Please wait while we verify your credentials</p>
            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-fadeIn">
            <button
              type="button"
              onClick={() => setShowErrorModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              aria-label="Close error dialog"
            >
              <FiX className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <FiAlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-700">{errorTitle}</h3>
                <p className="text-gray-600 mt-2 leading-relaxed">
                  {errorMessage || 'Login failed. Please check your credentials and try again.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowErrorModal(false)}
                className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-100 px-4 py-6">
        <div className="w-full max-w-md md:max-w-4xl flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Left side: Branding or image placeholder */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-500 to-green-600 items-center justify-center relative overflow-hidden">
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
          <div className="md:hidden bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-8 px-6">
            <div className="flex items-center justify-center mb-4">
              <img
                src={logo}
                alt="KolekTrash logo"
                className="h-14 w-auto drop-shadow"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-[0.25em] uppercase">KOLEKTRASH</h1>
            <p className="text-green-100 text-sm mt-2 font-medium">MENRO Waste Collection System</p>
          </div>

          {/* Right side: Login form */}
          <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
              <p className="text-gray-600 text-sm">Sign in to your account to continue</p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                  Username
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
                    <FiUser size={18} />
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className={`pl-12 w-full px-4 py-3 border ${errorField === 'username' || errorField === 'both'
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-green-500'
                      } rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white`}
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
                    <FiLock size={18} />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-12 pr-12 w-full px-4 py-3 border ${errorField === 'password' || errorField === 'both'
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-green-500'
                      } rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm -mt-3 pt-0">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-green-600 hover:text-green-700 font-medium transition-colors underline bg-transparent border-none focus:outline-none focus:ring-0"
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  onClick={() => setShowSignUp(true)}
                  className="text-green-600 hover:text-green-700 font-medium transition-colors underline bg-transparent border-none focus:ring-0"
                >
                  Create account
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Additional info section */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our{' '}
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

export default Login 
