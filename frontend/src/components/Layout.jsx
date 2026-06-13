import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CheckSquare, User, LogOut, Bell, Menu, X, Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { miscApi } from '../api/client'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
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

  const SidebarContent = () => (
    <div className="h-full flex flex-col p-5">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
          <Zap size={20} className="text-white" />
        </div>
        <span className="text-xl font-extrabold tracking-tight">TaskFlow</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.to
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-brand-600 rounded-xl"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={18} className={`relative z-10 ${active ? 'text-white' : 'text-slate-500'}`} />
              <span className={`relative z-10 ${active ? 'text-white' : 'text-slate-600'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 fixed h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed h-screen w-64 bg-white z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2">
            <Menu size={22} />
          </button>
          <div className="hidden lg:block font-semibold text-slate-700 capitalize">
            {location.pathname.replace('/', '') || 'dashboard'}
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs((s) => !s)}
                className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <Bell size={20} className="text-slate-600" />
                {unread > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold"
                  >
                    {unread}
                  </motion.span>
                )}
              </button>
              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <span className="font-semibold text-sm">Notifications</span>
                      {unread > 0 && (
                        <button onClick={markAll} className="text-xs text-brand-600 font-medium">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifs.length === 0 ? (
                        <p className="p-6 text-center text-sm text-slate-400">No notifications</p>
                      ) : (
                        notifs.map((n) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 border-b border-slate-50 ${!n.is_read ? 'bg-brand-50/50' : ''}`}
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
            <Link to="/profile" className="flex items-center gap-2">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                  {user?.full_name?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-slate-700">
                {user?.full_name}
              </span>
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
