import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, Plus, Pencil, Trash2, MessageSquare, Upload,
  Briefcase, RefreshCw, User, CheckCircle2,
} from 'lucide-react'
import { miscApi } from '../api/client'

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
}

const ACTION_CONFIG = {
  created_task: { icon: Plus, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Created task' },
  updated_task: { icon: Pencil, color: 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400', label: 'Updated task' },
  deleted_task: { icon: Trash2, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', label: 'Deleted task' },
  bulk_deleted_tasks: { icon: Trash2, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', label: 'Bulk deleted' },
  commented: { icon: MessageSquare, color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', label: 'Commented on' },
  uploaded_file: { icon: Upload, color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', label: 'Uploaded to' },
  created_workspace: { icon: Briefcase, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', label: 'Created workspace' },
  updated_profile: { icon: User, color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400', label: 'Updated profile' },
}

const DEFAULT_ACTION = { icon: RefreshCw, color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400', label: 'Action' }

function groupByDay(logs) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  const map = new Map()
  logs.forEach(log => {
    const d = new Date(log.created_at)
    let key
    if (d >= today) key = 'Today'
    else if (d >= yesterday) key = 'Yesterday'
    else key = d.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(log)
  })
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }))
}

export default function ActivityPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    miscApi.activity()
      .then(r => { setLogs(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const groups = groupByDay(logs)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Activity size={20} className="text-brand-600 dark:text-brand-400" />
          Activity Feed
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Your recent actions</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-14 rounded-2xl" />)}
        </div>
      ) : logs.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <Activity size={36} className="text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No activity yet</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Start creating tasks to see your activity here</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {groups.map(({ label, items }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">{label}</p>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-100 dark:bg-slate-700/60" />

                <div className="space-y-1">
                  {items.map((log, i) => {
                    const cfg = ACTION_CONFIG[log.action] || DEFAULT_ACTION
                    const Icon = cfg.icon
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-start gap-3 pl-0 py-2"
                      >
                        {/* Icon circle on timeline */}
                        <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                          <Icon size={15} />
                        </div>

                        <div className="flex-1 min-w-0 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              <span className="text-slate-500 dark:text-slate-400">{cfg.label}</span>
                              {log.detail && (
                                <span className="font-semibold text-slate-800 dark:text-slate-100"> "{log.detail}"</span>
                              )}
                            </p>
                            <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 whitespace-nowrap">{timeAgo(log.created_at)}</span>
                          </div>
                          {log.entity && log.entity !== 'user' && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 capitalize">
                              {log.entity} #{log.entity_id}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
