import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  ListTodo, CheckCircle2, Clock, AlertTriangle, TrendingUp, Activity,
} from 'lucide-react'
import { dashboardApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

const STATUS_COLORS = { todo: '#94a3b8', in_progress: '#6366f1', completed: '#22c55e' }
const PRIORITY_COLORS = { low: '#38bdf8', medium: '#f59e0b', high: '#ef4444' }
const STATUS_LABEL = { todo: 'To Do', in_progress: 'In Progress', completed: 'Completed' }

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 120 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-extrabold text-slate-900 mt-4">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.stats().then((r) => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-slate-900">
          Hi, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mb-6">Here's your task overview</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={ListTodo} label="Total Tasks" value={stats.total_tasks}
          color="bg-gradient-to-br from-brand-500 to-brand-600" delay={0} />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed_tasks}
          color="bg-gradient-to-br from-green-500 to-emerald-600" delay={0.1} />
        <StatCard icon={Clock} label="Pending" value={stats.pending_tasks}
          color="bg-gradient-to-br from-amber-500 to-orange-600" delay={0.2} />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue_tasks}
          color="bg-gradient-to-br from-red-500 to-rose-600" delay={0.3} />
      </div>

      {/* Completion progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-600" />
            <span className="font-semibold text-slate-800">Completion Rate</span>
          </div>
          <span className="text-2xl font-extrabold text-brand-600">
            {stats.completion_percentage}%
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.completion_percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full"
          />
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <h3 className="font-semibold text-slate-800 mb-4">Tasks by Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                innerRadius={55} outerRadius={90} paddingAngle={3}>
                {pieData.map((entry) => (
                  <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 flex-wrap">
            {pieData.map((d) => (
              <div key={d.key} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-3 h-3 rounded-full" style={{ background: STATUS_COLORS[d.key] }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <h3 className="font-semibold text-slate-800 mb-4">Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {barData.map((entry) => (
                  <Cell key={entry.key} fill={PRIORITY_COLORS[entry.key]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-brand-600" />
          <h3 className="font-semibold text-slate-800">Recent Activity</h3>
        </div>
        {stats.recent_activities.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No activity yet</p>
        ) : (
          <div className="space-y-3">
            {stats.recent_activities.map((a) => (
              <div key={a.id} className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                <span className="text-slate-700 capitalize">{a.action.replace('_', ' ')}</span>
                {a.detail && <span className="text-slate-400 truncate">— {a.detail}</span>}
                <span className="ml-auto text-xs text-slate-400 shrink-0">
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
