import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  ListTodo, CheckCircle2, Clock, AlertTriangle, TrendingUp,
  Activity, ArrowRight, Calendar, Kanban, ChevronRight,
} from 'lucide-react'
import { dashboardApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const STATUS_COLORS = { todo: '#94a3b8', in_progress: '#6366f1', completed: '#22c55e' }
const PRIORITY_COLORS = { low: '#38bdf8', medium: '#f59e0b', high: '#f43f5e' }
const STATUS_LABEL = { todo: 'To Do', in_progress: 'In Progress', completed: 'Completed' }

const STAT_CONFIG = [
  { key: 'total_tasks', label: 'Total Tasks', icon: ListTodo, from: 'from-brand-500', to: 'to-violet-600' },
  { key: 'completed_tasks', label: 'Completed', icon: CheckCircle2, from: 'from-emerald-500', to: 'to-teal-600' },
  { key: 'pending_tasks', label: 'Pending', icon: Clock, from: 'from-amber-500', to: 'to-orange-500' },
  { key: 'overdue_tasks', label: 'Overdue', icon: AlertTriangle, from: 'from-rose-500', to: 'to-pink-600' },
]

function StatCard({ icon: Icon, label, value, from, to, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 130 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/50 shadow-sm hover:shadow-md dark:hover:shadow-slate-900/30 transition-shadow"
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${from} ${to} flex items-center justify-center mb-4 shadow-sm`}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-none">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">{label}</p>
    </motion.div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.stats().then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  const gridColor = isDark ? '#1e293b' : '#f1f5f9'
  const tickColor = isDark ? '#475569' : '#94a3b8'
  const tooltipStyle = {
    background: isDark ? '#1e293b' : '#fff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: 10,
    fontSize: 12,
    color: isDark ? '#e2e8f0' : '#0f172a',
  }

  if (loading)
    return (
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28" />)}
      </div>
    )

  const pieData = Object.entries(stats.by_status).map(([k, v]) => ({
    name: STATUS_LABEL[k], value: v, key: k,
  }))
  const barData = Object.entries(stats.by_priority).map(([k, v]) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1), value: v, key: k,
  }))

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {getGreeting()}, {user?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {STAT_CONFIG.map((c, i) => (
          <StatCard key={c.key} {...c} value={stats[c.key]} delay={i * 0.07} />
        ))}
      </div>

      {/* Completion bar */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/50 shadow-sm mb-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} className="text-brand-600 dark:text-brand-400" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Overall Progress</span>
          </div>
          <span className="text-lg font-bold text-brand-600 dark:text-brand-400">{stats.completion_percentage}%</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.completion_percentage}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full"
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-slate-400 dark:text-slate-500">{stats.completed_tasks} completed</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{stats.total_tasks} total</span>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/50 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                innerRadius={48} outerRadius={78} paddingAngle={3}>
                {pieData.map((entry) => (
                  <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 flex-wrap mt-1">
            {pieData.map(d => (
              <div key={d.key} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[d.key] }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.37 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/50 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Priority Breakdown</h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={barData} barSize={34}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? '#1e293b' : '#f8fafc', radius: 6 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map(entry => (
                  <Cell key={entry.key} fill={PRIORITY_COLORS[entry.key]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Quick links */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5"
      >
        {[
          { to: '/tasks', label: 'View all tasks', icon: ListTodo, bg: 'bg-brand-50 dark:bg-brand-900/25', color: 'text-brand-600 dark:text-brand-400' },
          { to: '/kanban', label: 'Kanban board', icon: Kanban, bg: 'bg-emerald-50 dark:bg-emerald-900/25', color: 'text-emerald-600 dark:text-emerald-400' },
          { to: '/calendar', label: 'Calendar view', icon: Calendar, bg: 'bg-amber-50 dark:bg-amber-900/25', color: 'text-amber-600 dark:text-amber-400' },
        ].map(item => (
          <Link key={item.to} to={item.to}
            className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/50 hover:shadow-sm transition-shadow group">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg}`}>
                <item.icon size={15} className={item.color} />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
            </div>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
          </Link>
        ))}
      </motion.div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.47 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/50 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-brand-600 dark:text-brand-400" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent Activity</h3>
          </div>
          <Link to="/tasks" className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5">
            View all <ArrowRight size={11} />
          </Link>
        </div>
        {stats.recent_activities.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 py-5 text-center">No activity yet — create your first task!</p>
        ) : (
          <div className="space-y-2.5">
            {stats.recent_activities.map(a => (
              <div key={a.id} className="flex items-center gap-3 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 capitalize">{a.action.replace('_', ' ')}</span>
                {a.detail && <span className="text-slate-400 dark:text-slate-500 truncate text-xs">— {a.detail}</span>}
                <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
