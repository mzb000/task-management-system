import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CheckSquare, User, LogOut, Bell, Menu, X,
  Kanban, CalendarDays, BarChart2, Sun, Moon, Settings, ChevronDown,
  Users, Briefcase, Activity, BellDot, GraduationCap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Logo from './Logo'
import { miscApi } from '../api/client'

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/tasks', label: 'Tasks', icon: CheckSquare },
      { to: '/kanban', label: 'Kanban', icon: Kanban },
      { to: '/calendar', label: 'Calendar', icon: CalendarDays },
      { to: '/analytics', label: 'Analytics', icon: BarChart2 },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/team', label: 'Team', icon: Users },
      { to: '/workspaces', label: 'Workspaces', icon: Briefcase },
    ],
  },
  {
    label: 'You',
    items: [
      { to: '/notifications', label: 'Notifications', icon: BellDot },
      { to: '/activity', label: 'Activity', icon: Activity },
    ],
  },
  {
    label: 'Learning',
    items: [
      { to: '/learning', label: 'Cloud Learning', icon: GraduationCap },
    ],
  },
]

const navItems = NAV_SECTIONS.flatMap(s => s.items)

export default function Layout() {
  const { user, logout } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const notifRef = useRef(null)
  const userMenuRef = useRef(null)

  const loadNotifs = () => miscApi.notifications().then(r => setNotifs(r.data)).catch(() => {})

  useEffect(() => {
    loadNotifs()
    const t = setInterval(loadNotifs, 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const close = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const unread = notifs.filter(n => !n.is_read).length
  const handleLogout = () => { logout(); navigate('/login') }
  const markAll = async () => { await miscApi.markAllRead(); loadNotifs(); setShowNotifs(false) }

  const currentPage = navItems.find(n => n.to === location.pathname)?.label
    || location.pathname.replace('/', '').replace(/-/g, ' ')

  const SidebarNav = () => (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-white/[0.06] flex-shrink-0">
        <Logo size="sm" textClass="text-[15px] text-white" />
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si}>
            {section.label && (
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-1">{section.label}</p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = location.pathname === item.to
                const Icon = item.icon
                const badge = item.to === '/notifications' ? unread : 0
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className="relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors group"
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 bg-brand-600 rounded-lg"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <Icon
                      size={15}
                      className={`relative z-10 flex-shrink-0 ${
                        active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span className={`relative z-10 flex-1 ${
                      active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}>
                      {item.label}
                    </span>
                    {badge > 0 && (
                      <span className="relative z-10 text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full bg-brand-500 text-white px-1">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section at bottom */}
      <div className="px-3 py-3 border-t border-white/[0.06] flex-shrink-0">
        <Link
          to="/settings"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.06] transition-colors group mb-0.5"
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-white/20 flex-shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-slate-300 truncate leading-none">{user?.full_name}</p>
            <p className="text-[11px] text-slate-600 truncate mt-0.5">{user?.email}</p>
          </div>
          <Settings size={12} className="text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-slate-600 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar — always dark */}
      <aside className="hidden lg:flex w-56 bg-[#060b14] fixed h-screen flex-col border-r border-white/[0.05] z-30">
        <SidebarNav />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -224 }} animate={{ x: 0 }} exit={{ x: -224 }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="fixed h-screen w-56 bg-[#060b14] z-50 lg:hidden border-r border-white/[0.05]"
            >
              <div className="flex justify-end p-3">
                <button onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 transition-colors">
                  <X size={15} className="text-slate-400" />
                </button>
              </div>
              <SidebarNav />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen bg-slate-100 dark:bg-[#0d1422]">
        {/* Topbar */}
        <header className="h-14 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <Menu size={18} className="text-slate-600 dark:text-slate-400" />
            </button>
            <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{currentPage}</h1>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark'
                ? <Sun size={16} className="text-amber-400" />
                : <Moon size={16} className="text-slate-500" />
              }
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(s => !s)}
                className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Bell size={16} className="text-slate-500 dark:text-slate-400" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-brand-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">Notifications</span>
                      {unread > 0 && (
                        <button onClick={markAll} className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifs.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">No notifications</p>
                      ) : (
                        notifs.slice(0, 10).map(n => (
                          <div key={n.id}
                            className={`px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0 ${
                              !n.is_read ? 'bg-brand-50/50 dark:bg-brand-900/20' : ''
                            }`}>
                            {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block mr-1.5 mb-0.5" />}
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 inline">{n.title}</p>
                            {n.message && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700">
                      <Link to="/notifications" onClick={() => setShowNotifs(false)}
                        className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline block text-center">
                        View all notifications
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User dropdown */}
            <div className="relative ml-0.5" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(s => !s)}
                className="flex items-center gap-1.5 pl-1.5 pr-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.full_name?.[0]?.toUpperCase()}
                  </div>
                )}
                <ChevronDown size={13} className="text-slate-400 hidden sm:block" />
              </button>
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 py-1"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.full_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors">
                      <User size={14} /> Profile
                    </Link>
                    <Link to="/settings" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors">
                      <Settings size={14} /> Settings
                    </Link>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <LogOut size={14} /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 xl:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
