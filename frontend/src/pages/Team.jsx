import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Shield, User, Mail, CheckCircle2, Clock, ListTodo } from 'lucide-react'
import { userApi, taskApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

const ROLE_BADGE = {
  admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  manager: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  member: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
}

export default function Team() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      userApi.list(),
      taskApi.list({ limit: 500 }),
    ]).then(([u, t]) => {
      setUsers(u.data)
      setTasks(t.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const visible = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const statsFor = (userId) => {
    const mine = tasks.filter(t => t.owner_id === userId || t.assignee_id === userId)
    return {
      total: mine.length,
      completed: mine.filter(t => t.status === 'completed').length,
      inProgress: mine.filter(t => t.status === 'in_progress').length,
      todo: mine.filter(t => t.status === 'todo').length,
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-9 h-9 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users size={20} className="text-brand-600 dark:text-brand-400" />
            Team
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{users.length} member{users.length !== 1 && 's'}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search members..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
        />
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-sm">No members found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((u, i) => {
            const stats = statsFor(u.id)
            const isMe = u.id === me?.id
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm p-5 relative overflow-hidden"
              >
                {isMe && (
                  <span className="absolute top-3 right-3 text-[10px] px-1.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 font-semibold">You</span>
                )}

                {/* Avatar + name */}
                <div className="flex items-center gap-3 mb-4">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-lg font-bold ring-2 ring-brand-100 dark:ring-brand-900/40">
                      {u.full_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{u.full_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{u.username}</p>
                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${ROLE_BADGE[u.role] || ROLE_BADGE.member}`}>
                      {u.role === 'admin' && <Shield size={8} className="inline mr-0.5" />}
                      {u.role}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <Mail size={11} />
                  <span className="truncate">{u.email}</span>
                </div>

                {/* Task stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center bg-slate-50 dark:bg-slate-700/40 rounded-xl py-2">
                    <ListTodo size={12} className="mx-auto text-slate-400 dark:text-slate-500 mb-0.5" />
                    <p className="text-base font-bold text-slate-700 dark:text-slate-300">{stats.todo}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">To Do</p>
                  </div>
                  <div className="text-center bg-brand-50 dark:bg-brand-900/20 rounded-xl py-2">
                    <Clock size={12} className="mx-auto text-brand-500 dark:text-brand-400 mb-0.5" />
                    <p className="text-base font-bold text-brand-700 dark:text-brand-300">{stats.inProgress}</p>
                    <p className="text-[10px] text-brand-500 dark:text-brand-400">Active</p>
                  </div>
                  <div className="text-center bg-emerald-50 dark:bg-emerald-900/20 rounded-xl py-2">
                    <CheckCircle2 size={12} className="mx-auto text-emerald-500 dark:text-emerald-400 mb-0.5" />
                    <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">{stats.completed}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Done</p>
                  </div>
                </div>

                {/* Progress bar */}
                {stats.total > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                      <span>{stats.total} tasks</span>
                      <span>{Math.round((stats.completed / stats.total) * 100)}% done</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
