import { useState, useEffect } from 'react'
import { taskApi } from '../api/client'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { TrendingUp, Target, Clock, AlertTriangle, CheckCircle2, BarChart2 } from 'lucide-react'

export default function Analytics() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    taskApi.list({ limit: 500 }).then(r => {
      setTasks(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
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
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, fill: '#ef4444' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, fill: '#f59e0b' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, fill: '#10b981' },
  ].filter(d => d.value > 0)

  const statusData = [
    { name: 'To Do', value: todo, fill: '#94a3b8' },
    { name: 'In Progress', value: inProgress, fill: '#3b82f6' },
    { name: 'Completed', value: completed, fill: '#10b981' },
  ]

  // Last 8 weeks activity
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

  // Next 7 days due dates
  const dueDateData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      day: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en', { weekday: 'short' }),
      Tasks: tasks.filter(t => {
        if (!t.due_date || t.status === 'completed') return false
        const td = new Date(t.due_date)
        return td.toDateString() === d.toDateString()
      }).length,
    }
  })

  const StatCard = ({ title, value, icon: Icon, color, sub }) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  )

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart2 size={24} className="text-brand-600" />
          Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-1">Your productivity overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={total} icon={Target} color="bg-brand-600" sub="All time" />
        <StatCard title="Completed" value={completed} icon={CheckCircle2} color="bg-emerald-500" sub={`${rate}% completion`} />
        <StatCard title="In Progress" value={inProgress} icon={Clock} color="bg-blue-500" sub="Active now" />
        <StatCard title="Overdue" value={overdue} icon={AlertTriangle} color="bg-red-500" sub="Need attention" />
      </div>

      {/* Completion bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-600" />
            Overall Completion Rate
          </h3>
          <span className="text-2xl font-bold text-brand-600">{rate}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
            style={{ width: `${Math.max(rate, 2)}%` }}
          >
            {rate > 10 && <span className="text-white text-[10px] font-bold">{rate}%</span>}
          </div>
        </div>
        <div className="flex gap-6 mt-3 text-xs text-slate-500">
          <span><strong className="text-slate-700">{completed}</strong> completed</span>
          <span><strong className="text-slate-700">{todo}</strong> to do</span>
          <span><strong className="text-slate-700">{inProgress}</strong> in progress</span>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4">Weekly Activity (last 8 weeks)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Created" stroke="#6d28d9" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="Completed" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4">Priority Distribution</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">No tasks yet</div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4">Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} layout="vertical" barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4">Due in Next 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dueDateData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Tasks" fill="#6d28d9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
