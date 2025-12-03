import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useLoader } from '../../contexts/LoaderContext'
import {
  FiHome,
  FiUser,
  FiMap,
  FiCalendar,
  FiTruck,
  FiActivity,
  FiMessageSquare,
  FiAlertCircle,
  FiLogOut
} from 'react-icons/fi'
import { FaUsers, FaMapMarkedAlt, FaCalendarAlt, FaTasks, FaTruckMoving, FaBuilding, FaComments, FaExclamationCircle, FaSignOutAlt, FaTachometerAlt, FaChevronDown, FaChevronRight, FaMapMarkerAlt } from 'react-icons/fa'

// Keep structure simple but allow dynamic icon coloring
const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', Icon: FaTachometerAlt },
  { divider: true },
  { to: '/admin/users', label: 'Manage Users', Icon: FaUsers },
  { to: '/admin/schedule', label: 'Manage Schedule', Icon: FaCalendarAlt },
  { to: '/admin/routes', label: 'Manage Routes', Icon: FaMapMarkedAlt },
  { to: '/admin/collection-points', label: 'Collection Points', Icon: FaMapMarkerAlt },
  {
    label: 'Task Management',
    Icon: FaTasks,
    children: [
      { to: '/admin/task-management/today', label: "Today's tasks" },
      { to: '/admin/task-management/past', label: 'Past tasks' }
    ]
  },
  { to: '/admin/barangays', label: 'Manage Barangays', Icon: FaBuilding },
  { to: '/admin/pickup', label: 'Special Pickup', Icon: FaTruckMoving },
  { divider: true },
  { to: '/admin/feedback', label: 'Feedback', Icon: FaComments },
  { to: '/admin/issues', label: 'Issues', Icon: FaExclamationCircle },
  // Logout moved to avatar menu in header
]

function getSectionLabel(index) {
  // Sections based on divider positions in navItems
  if (index === 0) return 'Overview'
  if (index === 2) return 'Operations'
  if (index === 8) return 'Engagement'
  if (index === 12) return 'Account'
  return null
}

export default function Sidebar({ handleLogout }) {
  const location = useLocation()
  const { showLoader } = useLoader()
  const [expandedMenus, setExpandedMenus] = useState({})

  const toggleMenu = (label) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  const handleNavClick = (event, targetPath) => {
    if (!targetPath || location.pathname === targetPath) {
      return
    }

    void showLoader({
      primaryText: 'Loading your next view…',
      secondaryText: 'We’re preparing the section you selected.',
      variant: 'login'
    })
  }

  return (
    <aside className="w-64 h-screen sticky top-0 bg-gradient-to-b from-emerald-950 to-emerald-800 text-emerald-50 flex flex-col shadow-2xl">
      <div className="px-6 py-6 text-xl font-extrabold tracking-wide border-b border-emerald-900/60 flex items-center">
        <svg className="w-8 h-8 mr-3 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2c-.28 0-.56.06-.81.18l-7 3.11A2 2 0 003 7.06V12c0 5.25 3.92 9.74 8.47 10.93.36.09.74.09 1.1 0C17.08 21.74 21 17.25 21 12V7.06a2 2 0 00-1.19-1.77l-7-3.11A1.98 1.98 0 0012 2zm0 2.18l7 3.11V12c0 4.41-3.29 8.19-7 9.32C8.29 20.19 5 16.41 5 12V7.29l7-3.11z" />
        </svg>
        KolekTrash Admin
      </div>

      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-700/50 scrollbar-track-transparent">
        {navItems.map((item, idx) => {
          if (item.divider) {
            return <hr key={`div-${idx}`} className="my-4 border-emerald-900/40" />
          }

          const section = getSectionLabel(idx)
          const isLogout = !!item.isLogout
          const isActive = item.to ? location.pathname === item.to : false
          const Icon = item.Icon
          const hasChildren = item.children && item.children.length > 0
          const isExpanded = expandedMenus[item.label]

          // Check if any child is active to keep menu expanded or highlight parent
          const isChildActive = hasChildren && item.children.some(child => location.pathname === child.to)

          // Auto-expand if child is active (optional, can be done in useEffect too)
          // For now, let's rely on manual toggle or initial state if we wanted. 
          // But to make it nice, let's ensure it's open if active.
          // We can do this with a useEffect, but let's just use the state.

          if (isLogout) {
            return (
              <div key={`logout-wrap-${idx}`} className="mt-auto px-3 pt-2">
                <button
                  onClick={handleLogout}
                  className="group flex items-center w-full px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-150 text-emerald-100/90 hover:text-white hover:bg-emerald-700/40"
                >
                  <Icon className="w-5 h-5 mr-3 text-emerald-300 group-hover:text-emerald-200" />
                  {item.label}
                </button>
              </div>
            )
          }

          return (
            <div key={item.label || item.to} className="px-3">
              {section && (
                <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300/70">
                  {section}
                </div>
              )}

              {hasChildren ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={[
                      'w-full relative flex items-center mt-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-150',
                      (isExpanded || isChildActive) ? 'text-white' : 'text-emerald-100/90 hover:bg-emerald-700/40 hover:text-white'
                    ].join(' ')}
                  >
                    <Icon className="w-5 h-5 mr-3 text-emerald-300" />
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    {isExpanded ? <FaChevronDown className="w-3 h-3" /> : <FaChevronRight className="w-3 h-3" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-1 ml-4 border-l border-emerald-700/50 pl-2 space-y-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          onClick={(event) => handleNavClick(event, child.to)}
                          className={({ isActive: childActive }) => {
                            return [
                              'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150',
                              childActive ? 'bg-emerald-700/60 text-white' : 'text-emerald-200/80 hover:text-white hover:bg-emerald-700/30'
                            ].join(' ')
                          }}
                        >
                          <span className="truncate">{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.to}
                  onClick={(event) => handleNavClick(event, item.to)}
                  end={item.to === '/admin/dashboard'}
                  className={({ isActive: linkActive }) => {
                    const active = linkActive || isActive
                    return [
                      'relative flex items-center mt-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-150',
                      active ? 'bg-emerald-700/60 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]' : 'text-emerald-100/90 hover:bg-emerald-700/40 hover:text-white'
                    ].join(' ')
                  }}
                >
                  <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-emerald-400/0 group-hover:bg-emerald-400/30" />
                  <Icon className="w-5 h-5 mr-3 text-emerald-300" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              )}
            </div>
          )
        })}
      </nav>

      <div className="px-4 py-3 border-t border-emerald-900/60 text-[11px] text-emerald-300/70">
        v1.0 • Stay green ♻️
      </div>
    </aside>
  )
}
