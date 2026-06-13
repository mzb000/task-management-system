import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Kanban as KanbanIcon, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import { taskApi } from '../api/client'
import TaskModal from '../components/TaskModal'

const COLUMNS = [
  { id: 'todo', label: 'To Do', dot: 'bg-slate-400', bg: 'bg-slate-50', border: 'border-slate-200', count: 'bg-slate-100 text-slate-600' },
  { id: 'in_progress', label: 'In Progress', dot: 'bg-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', count: 'bg-blue-100 text-blue-700' },
  { id: 'completed', label: 'Completed', dot: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', count: 'bg-emerald-100 text-emerald-700' },
]

const PRIORITY = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

export default function Kanban() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [dragId, setDragId] = useState(null)
  const [overCol, setOverCol] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)

  const load = () =>
    taskApi.list({ limit: 200 }).then(r => {
      setTasks(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))

  useEffect(() => { load() }, [])

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id)
    return acc
  }, {})

  const handleDrop = async (colId) => {
    if (!dragId || !colId) return
    const task = tasks.find(t => t.id === dragId)
    if (!task || task.status === colId) return
    setTasks(ts => ts.map(t => t.id === dragId ? { ...t, status: colId } : t))
    try {
      await taskApi.update(dragId, { status: colId })
      const label = COLUMNS.find(c => c.id === colId)?.label
      toast.success(`Moved to "${label}"`)
    } catch {
      load()
      toast.error('Failed to update task')
    }
    setDragId(null)
    setOverCol(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <KanbanIcon size={24} className="text-brand-600" />
            Kanban Board
          </h1>
          <p className="text-slate-500 text-sm mt-1">{tasks.length} total tasks · drag cards to change status</p>
        </div>
        <button
          onClick={() => { setEditTask(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {COLUMNS.map(col => (
          <div
            key={col.id}
            onDragOver={e => { e.preventDefault(); setOverCol(col.id) }}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOverCol(null) }}
            onDrop={() => handleDrop(col.id)}
            className={`rounded-2xl border-2 transition-all duration-150 min-h-[520px] ${col.bg} ${
              overCol === col.id ? 'border-brand-400 shadow-lg shadow-brand-100' : col.border
            }`}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/60">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <span className="font-semibold text-slate-700 text-sm">{col.label}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.count}`}>
                {grouped[col.id].length}
              </span>
            </div>

            {/* Cards */}
            <div className="p-3 space-y-2.5">
              {grouped[col.id].map(task => (
                <motion.div
                  key={task.id}
                  layout
                  draggable
                  onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDragId(task.id) }}
                  onDragEnd={() => { setDragId(null); setOverCol(null) }}
                  onClick={() => { setEditTask(task); setShowModal(true) }}
                  whileHover={{ y: -2 }}
                  className={`bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm cursor-pointer group transition-all ${
                    dragId === task.id ? 'opacity-40 scale-95 ring-2 ring-brand-400' : 'hover:shadow-md hover:border-brand-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 leading-snug flex-1">{task.title}</p>
                    <GripVertical size={14} className="text-slate-300 group-hover:text-slate-400 flex-shrink-0 mt-0.5 cursor-grab" />
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{task.description}</p>
                  )}

                  {task.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium border ${PRIORITY[task.priority]}`}>
                      {task.priority}
                    </span>
                    {task.due_date && (
                      <span className={`text-xs font-medium ${
                        new Date(task.due_date) < new Date() && task.status !== 'completed'
                          ? 'text-red-500'
                          : 'text-slate-400'
                      }`}>
                        {new Date(task.due_date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  {task.assignee && (
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-[9px] font-bold">
                        {task.assignee.full_name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-xs text-slate-500 truncate">{task.assignee.full_name}</span>
                    </div>
                  )}
                </motion.div>
              ))}

              {grouped[col.id].length === 0 && (
                <div className={`flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed rounded-xl transition-colors ${
                  overCol === col.id ? 'border-brand-400 bg-brand-50/50 text-brand-400' : 'border-slate-200'
                }`}>
                  <div className="text-2xl mb-1">
                    {overCol === col.id ? '⬇️' : '📋'}
                  </div>
                  <p className="text-xs">
                    {overCol === col.id ? 'Drop here' : 'No tasks'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
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
