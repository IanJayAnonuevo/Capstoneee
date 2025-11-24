import { Navigate, useLocation } from 'react-router-dom'

const ROLE_PATH_MAP = {
  admin: '/admin/dashboard',
  resident: '/resident',
  barangay_head: '/barangayhead',
  truck_driver: '/truckdriver',
  garbage_collector: '/garbagecollector',
  foreman: '/foreman'
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getUserRole() {
  const user = getStoredUser()
  if (!user || !user.role) return null
  return String(user.role).toLowerCase()
}

export function getDefaultRouteForRole(role) {
  if (!role) return '/'
  return ROLE_PATH_MAP[role] || '/'
}

export function isAuthenticated() {
  const user = getStoredUser()
  if (!user || !user.user_id) return false
  // Require a present, non-expired access token
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return false
    const expiresAtRaw = localStorage.getItem('token_expires_at')
    if (!expiresAtRaw) return true
    const expiresAt = Number(expiresAtRaw)
    if (Number.isFinite(expiresAt)) {
      return Date.now() < expiresAt
    }
    return true
  } catch {
    return false
  }
}

export default function RequireAuth({ children, allowedRoles }) {
  const location = useLocation()
  const user = getStoredUser()

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const role = getUserRole()
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const redirectPath = getDefaultRouteForRole(role)
    return <Navigate to={redirectPath} replace />
  }

  return children
}

export function GuestOnly({ children }) {
  // Only redirect guests if they are actually authenticated (valid token).
  // This prevents a redirect loop when a user object is present in localStorage
  // but the access token is missing or expired.
  if (isAuthenticated()) {
    const role = getUserRole()
    return <Navigate to={getDefaultRouteForRole(role)} replace />
  }
  return children
}





