import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Pencil, Trash2, Calendar, Tag, CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { taskApi } from '../api/client'
import TaskModal from '../components/TaskModal'

const PRIORITY_STYLES = {
  low: 'bg-sky-100 text-sky-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
}
const STATUS_STYLES = {
  todo: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-brand-100 text-brand-700',
  completed: 'bg-green-100 text-green-700',
}
const STATUS_LABEL = { todo: 'To Do', in_progress: 'In Progress', completed: 'Completed' }

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    const params = { sort_by: sortBy, order: 'desc' }
    if (search) params.search = search
    if (statusFilter) params.status = statusFilter
    if (priorityFilter) params.priority = priorityFilter
    taskApi.list(params).then((r) => setTasks(r.data)).finally(() => setLoading(false))
  }, [search, statusFilter, priorityFilter, sortBy])

  useEffect(() => {
    const t = setTimeout(load, 250) // debounce search
    return () => clearTimeout(t)
  }, [load])

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    await taskApi.remove(id)
    toast.success('Task deleted')
    load()
  }

  const toggleComplete = async (task) => {
    const next = task.status === 'completed' ? 'todo' : 'completed'
    await taskApi.update(task.id, { status: next })
    load()
  }

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (task) => { setEditing(task); setModalOpen(true) }

  const selectCls = 'px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500'

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500">{tasks.length} task{tasks.length !== 1 && 's'}</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 active:scale-95 transition-all">
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search tasks…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select className={selectCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select className={selectCls} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select className={selectCls} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="created_at">Newest</option>
          <option value="due_date">Due date</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : tasks.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-400 mb-3">No tasks found</p>
          <button onClick={openCreate} className="text-brand-600 font-semibold">+ Create your first task</button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => {
              const overdue = task.due_date && new Date(task.due_date) < new Date()
                && task.status !== 'completed'
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-start gap-4"
                >
                  <button onClick={() => toggleComplete(task)} className="mt-0.5 shrink-0">
                    <CheckCircle2
                      size={22}
                      className={task.status === 'completed' ? 'text-green-500 fill-green-100' : 'text-slate-300'}
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-semibold text-slate-800 ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </h3>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[task.status]}`}>
                        {STATUS_LABEL[task.status]}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                      {task.due_date && (
                        <span className={`flex items-center gap-1 ${overdue ? 'text-red-500 font-medium' : ''}`}>
                          <Calendar size={13} />
                          {new Date(task.due_date).toLocaleDateString()}
                          {overdue && ' (overdue)'}
                        </span>
                      )}
                      {task.tags && (
                        <span className="flex items-center gap-1">
                          <Tag size={13} /> {task.tags}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(task)}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(task.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={load} task={editing} />
    </div>
  )
}
