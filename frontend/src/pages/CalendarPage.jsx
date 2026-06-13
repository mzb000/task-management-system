import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { taskApi } from '../api/client'
import TaskModal from '../components/TaskModal'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const PRIORITY_CHIP = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-emerald-100 text-emerald-700',
}
const STATUS_CHIP = {
  todo: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState([])
  const [current, setCurrent] = useState(new Date())
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)

  const load = () =>
    taskApi.list({ limit: 500 }).then(r => setTasks(r.data)).catch(() => {})

  useEffect(() => { load() }, [])

  const year = current.getFullYear()
  const month = current.getMonth()
  const today = new Date()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const tasksForDay = (d) =>
    tasks.filter(t => {
      if (!t.due_date) return false
      const td = new Date(t.due_date)
      return td.getFullYear() === year && td.getMonth() === month && td.getDate() === d
    })

  const selectedTasks = selected ? tasksForDay(selected) : []
  const unscheduled = tasks.filter(t => !t.due_date && t.status !== 'completed')

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isToday = (d) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === d

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1))

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
        <CalendarDays size={24} className="text-brand-600" />
        Calendar
      </h1>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Calendar */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-800">
              {MONTHS[month]} {year}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <ChevronLeft size={18} className="text-slate-600" />
              </button>
              <button
                onClick={() => { setCurrent(new Date()); setSelected(null) }}
                className="px-3 py-1.5 text-xs rounded-lg bg-brand-50 text-brand-600 font-semibold hover:bg-brand-100 transition-colors"
              >
                Today
              </button>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <ChevronRight size={18} className="text-slate-600" />
              </button>
            </div>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d, i) => {
              if (!d) return <div key={`empty-${i}`} className="h-20" />
              const dayTasks = tasksForDay(d)
              const isSelected = selected === d
              const overdue = dayTasks.some(t => t.status !== 'completed')
              return (
                <motion.div
                  key={d}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelected(d === selected ? null : d)}
                  className={`h-20 p-1.5 rounded-xl cursor-pointer transition-colors border ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50 shadow-sm shadow-brand-100'
                      : isToday(d)
                      ? 'border-brand-200 bg-brand-50/50'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-xs font-semibold ${
                    isToday(d) ? 'text-brand-600 bg-brand-600 text-white w-5 h-5 rounded-full flex items-center justify-center' : 'text-slate-700'
                  }`}>
                    {d}
                  </span>
                  <div className="mt-0.5 space-y-0.5 overflow-hidden">
                    {dayTasks.slice(0, 2).map(t => (
                      <div
                        key={t.id}
                        className={`text-[9px] px-1 py-0.5 rounded truncate font-medium leading-none ${PRIORITY_CHIP[t.priority]}`}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[9px] text-slate-400 pl-1">+{dayTasks.length - 2}</div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 space-y-4">
          {/* Selected day */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selected ?? 'none'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
            >
              <h3 className="font-semibold text-slate-700 text-sm mb-3">
                {selected
                  ? `${MONTHS[month]} ${selected}, ${year}`
                  : 'Select a date'}
              </h3>
              {!selected ? (
                <p className="text-xs text-slate-400">Click any date to view tasks</p>
              ) : selectedTasks.length === 0 ? (
                <div>
                  <p className="text-xs text-slate-400 mb-3">No tasks due this day</p>
                  <button
                    onClick={() => { setEditTask(null); setShowModal(true) }}
                    className="w-full py-2 bg-brand-50 text-brand-600 text-xs font-semibold rounded-xl hover:bg-brand-100 transition-colors"
                  >
                    + Add Task
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedTasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => { setEditTask(t); setShowModal(true) }}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:border-brand-200 hover:bg-brand-50/30 transition-colors"
                    >
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{t.title}</p>
                      {t.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{t.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${PRIORITY_CHIP[t.priority]}`}>
                          {t.priority}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${STATUS_CHIP[t.status]}`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Unscheduled */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center justify-between">
              Unscheduled
              <span className="text-xs text-slate-400 font-normal">{unscheduled.length} tasks</span>
            </h3>
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {unscheduled.slice(0, 15).map(t => (
                <div key={t.id} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    t.priority === 'high' ? 'bg-red-400' :
                    t.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  <span className="text-xs text-slate-600 truncate">{t.title}</span>
                </div>
              ))}
              {unscheduled.length === 0 && (
                <p className="text-xs text-slate-400">All tasks have due dates!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <TaskModal
        open={showModal}
        task={editTask}
        onClose={() => { setShowModal(false); setEditTask(null) }}
        onSaved={() => { setShowModal(false); setEditTask(null); load() }}
      />
    </div>
  )
}
