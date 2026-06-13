import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CheckSquare, User, LogOut, Bell, Menu, X, Zap,
  Kanban, CalendarDays, BarChart2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { miscApi } from '../api/client'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/kanban', label: 'Kanban', icon: Kanban },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)

  const loadNotifs = () =>
    miscApi.notifications().then((r) => setNotifs(r.data)).catch(() => {})

  useEffect(() => {
    loadNotifs()
    const t = setInterval(loadNotifs, 20000)
    return () => clearInterval(t)
  }, [])

  const unread = notifs.filter((n) => !n.is_read).length

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const markAll = async () => {
    await miscApi.markAllRead()
    loadNotifs()
  }

  const currentLabel = navItems.find(n => n.to === location.pathname)?.label
    || location.pathname.replace('/', '')

  const SidebarContent = () => (
    <div className="h-full flex flex-col py-5 px-3">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-sm shadow-brand-200">
          <Zap size={20} className="text-white" />
        </div>
        <span className="text-xl font-extrabold tracking-tight text-slate-800">TaskFlow</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const active = location.pathname === item.to
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group"
            >
              {active && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-brand-600 rounded-xl"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                size={17}
                className={`relative z-10 transition-colors ${
                  active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span
                className={`relative z-10 transition-colors ${
                  active ? 'text-white' : 'text-slate-600 group-hover:text-slate-800'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <LogOut size={17} />
        Logout
      </button>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 bg-white border-r border-slate-200 fixed h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed h-screen w-60 bg-white z-50 lg:hidden border-r border-slate-200"
            >
              <div className="flex justify-end p-3">
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                  <X size={18} className="text-slate-500" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
              <Menu size={20} className="text-slate-600" />
            </button>
            <span className="font-semibold text-slate-700 capitalize">{currentLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs((s) => !s)}
                className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Bell size={19} className="text-slate-600" />
                {unread > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold"
                  >
                    {unread > 9 ? '9+' : unread}
                  </motion.span>
                )}
              </button>

              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <span className="font-semibold text-sm text-slate-800">Notifications</span>
                      {unread > 0 && (
                        <button onClick={markAll} className="text-xs text-brand-600 font-semibold hover:text-brand-700">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifs.length === 0 ? (
                        <p className="p-6 text-center text-sm text-slate-400">No notifications yet</p>
                      ) : (
                        notifs.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 border-b border-slate-50 last:border-0 ${!n.is_read ? 'bg-brand-50/40' : ''}`}
                          >
                            <p className="text-sm font-medium text-slate-800">{n.title}</p>
                            {n.message && <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar */}
            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-slate-200">
                  {user?.full_name?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-slate-700">{user?.full_name}</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
