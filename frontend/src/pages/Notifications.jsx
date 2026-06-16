import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, CheckCheck, Trash2, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { miscApi } from '../api/client'
import toast from 'react-hot-toast'

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

function groupByDay(notifs) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  const groups = []
  const buckets = { Today: [], Yesterday: [], Earlier: [] }
  notifs.forEach(n => {
    const d = new Date(n.created_at)
    if (d >= today) buckets.Today.push(n)
    else if (d >= yesterday) buckets.Yesterday.push(n)
    else buckets.Earlier.push(n)
  })
  if (buckets.Today.length) groups.push({ label: 'Today', items: buckets.Today })
  if (buckets.Yesterday.length) groups.push({ label: 'Yesterday', items: buckets.Yesterday })
  if (buckets.Earlier.length) groups.push({ label: 'Earlier', items: buckets.Earlier })
  return groups
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = () => {
    setLoading(true)
    miscApi.notifications().then(r => { setNotifs(r.data); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const markOne = async (id) => {
    await miscApi.markRead(id)
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAll = async () => {
    await miscApi.markAllRead()
    setNotifs(ns => ns.map(n => ({ ...n, is_read: true })))
    toast.success('All notifications marked as read')
  }

  const visible = filter === 'unread' ? notifs.filter(n => !n.is_read) : notifs
  const groups = groupByDay(visible)
  const unreadCount = notifs.filter(n => !n.is_read).length

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell size={20} className="text-brand-600 dark:text-brand-400" />
            Notifications
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-600 text-white">{unreadCount}</span>
            )}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{notifs.length} total notifications</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors">
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {[['all', 'All'], ['unread', 'Unread']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              filter === val
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}>
            {label}
            {val === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 text-xs">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <BellOff size={36} className="text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">You're all caught up!</p>
        </motion.div>
      ) : (
        <div className="space-y-5">
          {groups.map(({ label, items }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">{label}</p>
              <div className="space-y-2">
                <AnimatePresence>
                  {items.map((n, i) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                        !n.is_read
                          ? 'bg-brand-50/60 dark:bg-brand-900/15 border-brand-100 dark:border-brand-800/40'
                          : 'bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/50'
                      }`}
                      onClick={() => !n.is_read && markOne(n.id)}
                    >
                      {/* Unread dot */}
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                        !n.is_read ? 'bg-brand-500' : 'bg-transparent'
                      }`} />

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${
                          !n.is_read ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'
                        }`}>{n.title}</p>
                        {n.message && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                        )}
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{timeAgo(n.created_at)}</p>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {n.link && (
                          <Link to={n.link} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                            <ExternalLink size={13} />
                          </Link>
                        )}
                        {!n.is_read && (
                          <button onClick={e => { e.stopPropagation(); markOne(n.id) }}
                            className="p-1 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/30 text-brand-500 dark:text-brand-400 transition-colors">
                            <CheckCheck size={13} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
