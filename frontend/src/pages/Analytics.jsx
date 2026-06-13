import { useState, useEffect } from 'react'
import { taskApi } from '../api/client'
import { useTheme } from '../context/ThemeContext'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { TrendingUp, Target, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function Analytics() {
  const { isDark } = useTheme()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    taskApi.list({ limit: 500 }).then(r => {
      setTasks(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
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
      <div className="flex items-center justify-center h-64">
        <div className="w-9 h-9 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )

  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'completed').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const todo = tasks.filter(t => t.status === 'todo').length
  const overdue = tasks.filter(
    t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
  ).length
  const rate = total ? Math.round((completed / total) * 100) : 0

  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, fill: '#f43f5e' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, fill: '#f59e0b' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, fill: '#10b981' },
  ].filter(d => d.value > 0)

  const statusData = [
    { name: 'To Do', value: todo, fill: '#94a3b8' },
    { name: 'In Progress', value: inProgress, fill: '#6366f1' },
    { name: 'Completed', value: completed, fill: '#10b981' },
  ]

  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - (7 - i) * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    return {
      week: `W${i + 1}`,
      Created: tasks.filter(t => { const d = new Date(t.created_at); return d >= weekStart && d < weekEnd }).length,
      Completed: tasks.filter(t => {
        const d = new Date(t.updated_at)
        return t.status === 'completed' && d >= weekStart && d < weekEnd
      }).length,
    }
  })

  const dueDateData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      day: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en', { weekday: 'short' }),
      Tasks: tasks.filter(t => {
        if (!t.due_date || t.status === 'completed') return false
        return new Date(t.due_date).toDateString() === d.toDateString()
      }).length,
    }
  })

  const card = 'bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 p-5 shadow-sm'

  const StatCard = ({ title, value, icon: Icon, gradient, sub }) => (
    <div className={card}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
      {sub && <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</div>}
    </div>
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Your productivity at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={total} icon={Target} gradient="from-brand-500 to-violet-600" sub="All time" />
        <StatCard title="Completed" value={completed} icon={CheckCircle2} gradient="from-emerald-500 to-teal-600" sub={`${rate}% completion rate`} />
        <StatCard title="In Progress" value={inProgress} icon={Clock} gradient="from-blue-500 to-indigo-600" sub="Active now" />
        <StatCard title="Overdue" value={overdue} icon={AlertTriangle} gradient="from-rose-500 to-pink-600" sub="Need attention" />
      </div>

      {/* Completion bar */}
      <div className={card}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <TrendingUp size={15} className="text-brand-600 dark:text-brand-400" />
            Completion Rate
          </h3>
          <span className="text-xl font-bold text-brand-600 dark:text-brand-400">{rate}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-1000"
            style={{ width: `${Math.max(rate, 2)}%` }}
          />
        </div>
        <div className="flex gap-4 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
          <span><strong className="text-slate-700 dark:text-slate-300">{completed}</strong> completed</span>
          <span><strong className="text-slate-700 dark:text-slate-300">{todo}</strong> to do</span>
          <span><strong className="text-slate-700 dark:text-slate-300">{inProgress}</strong> in progress</span>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className={card}>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Weekly Activity (last 8 weeks)</h3>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} allowDecimals={false} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Created" stroke="#6366f1" strokeWidth={2} dot={{ r: 2.5 }} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="Completed" stroke="#10b981" strokeWidth={2} dot={{ r: 2.5 }} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={card}>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Priority Distribution</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={priorityData} cx="50%" cy="50%"
                  innerRadius={50} outerRadius={78} paddingAngle={4} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {priorityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[210px] text-slate-400 dark:text-slate-500 text-sm">No tasks yet</div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className={card}>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={statusData} layout="vertical" barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: tickColor }} allowDecimals={false} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: tickColor }} width={82} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={card}>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Due in Next 7 Days</h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={dueDateData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} allowDecimals={false} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="Tasks" fill="#6366f1" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
