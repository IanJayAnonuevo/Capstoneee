import { Fragment } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useLoader } from '../../contexts/LoaderContext'
import {
  FaTachometerAlt,
  FaUsers,
  FaCalendarAlt,
  FaMapMarkedAlt,
  FaTasks,
  FaTruckMoving,
  FaBuilding,
  FaComments,
  FaExclamationCircle,
  FaSignOutAlt
} from 'react-icons/fa'

const navSections = [
  [
    { to: '/admin/dashboard', label: 'Dashboard', icon: FaTachometerAlt, exact: true }
  ],
  [
    { to: '/admin/users', label: 'Manage Users', icon: FaUsers },
    { to: '/admin/schedule', label: 'Manage Schedule', icon: FaCalendarAlt },
    { to: '/admin/routes', label: 'Manage Routes', icon: FaMapMarkedAlt },
    { to: '/admin/task-management', label: 'Task Management', icon: FaTasks },
    { to: '/admin/pickup', label: 'Special Pickup', icon: FaTruckMoving },
    { to: '/admin/barangay', label: 'Barangay Activity', icon: FaBuilding }
  ],
  [
    { to: '/admin/feedback', label: 'Feedback', icon: FaComments },
    { to: '/admin/issues', label: 'Issues', icon: FaExclamationCircle }
  ]
]

const DARK_GREEN = '#052e1b'
const DARK_GREEN_LIGHT = '#0a3f25'
const ACCENT_GREEN = '#3dd68c'

export default function Sidebar({ handleLogout }) {
  const location = useLocation()
  const { showLoader } = useLoader()

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
  <aside className="sticky top-4 mx-4 flex h-[calc(100vh-2rem)] w-60 flex-col rounded-3xl border border-white/10 bg-[color:var(--sidebar-bg)] text-white shadow-[0_24px_60px_rgba(5,45,25,0.45)]"
      style={{ '--sidebar-bg': DARK_GREEN, '--sidebar-bg-light': DARK_GREEN_LIGHT }}>
      <div className="flex items-center gap-3 px-6 pt-6 pb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[color:var(--accent-green)] font-semibold"
          style={{ '--accent-green': ACCENT_GREEN }}>
          KT
        </div>
        <div className="leading-tight">
          <p className="text-[11px] uppercase tracking-[0.4em] text-white/70">Admin</p>
          <p className="text-lg font-semibold text-white">KolekTrash</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-4 pt-2 space-y-5">
        {navSections.map((section, sectionIndex) => (
          <Fragment key={`section-${sectionIndex}`}>
            <div className="space-y-1.5">
              {section.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    onClick={(event) => handleNavClick(event, item.to)}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-white/15 text-white shadow-[0_12px_30px_rgba(5,60,30,0.35)]'
                          : 'text-white/70 hover:bg-[color:var(--sidebar-bg-light)] hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
                            isActive
                              ? 'bg-[color:var(--accent-green)]/25 text-[color:var(--accent-green)] shadow-inner shadow-emerald-900/25'
                              : 'bg-white/5 text-white/80 group-hover:bg-[color:var(--accent-green)]/20 group-hover:text-[color:var(--accent-green)]'
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <span className="tracking-wide">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
            {sectionIndex < navSections.length - 1 && <div className="mx-3 my-3 h-px bg-white/15" />}
          </Fragment>
        ))}
      </nav>

      <div className="px-5 pb-6 pt-2 space-y-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full rounded-2xl bg-emerald-500/90 px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-lg shadow-emerald-900/25 transition-all duration-200 hover:bg-emerald-500"
        >
          <FaSignOutAlt size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
