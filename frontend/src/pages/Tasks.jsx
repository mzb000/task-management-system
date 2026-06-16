import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Pencil, Trash2, Calendar, Tag, CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { taskApi } from '../api/client'
import TaskModal from '../components/TaskModal'

const PRIORITY_STYLES = {
  low: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}
const STATUS_STYLES = {
  todo: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  in_progress: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}
const STATUS_LABEL = { todo: 'To Do', in_progress: 'In Progress', completed: 'Completed' }

const selectCls = 'px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors'

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
    taskApi.list(params).then(r => setTasks(r.data)).finally(() => setLoading(false))
  }, [search, statusFilter, priorityFilter, sortBy])

  useEffect(() => {
    const t = setTimeout(load, 250)
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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Tasks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{tasks.length} task{tasks.length !== 1 && 's'}</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all shadow-sm shadow-brand-600/20">
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2.5 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search tasks..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
          />
        </div>
        <select className={selectCls} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select className={selectCls} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="">All priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select className={selectCls} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="created_at">Newest</option>
          <option value="due_date">Due date</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20" />)}
        </div>
      ) : tasks.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-slate-400 dark:text-slate-500 mb-3 text-sm">No tasks found</p>
          <button onClick={openCreate} className="text-brand-600 dark:text-brand-400 font-semibold text-sm hover:underline">
            + Create your first task
          </button>
        </motion.div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {tasks.map(task => {
              const overdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/50 shadow-sm hover:shadow-md dark:hover:shadow-slate-900/20 transition-shadow flex items-start gap-4"
                >
                  <button onClick={() => toggleComplete(task)} className="mt-0.5 flex-shrink-0">
                    <CheckCircle2
                      size={20}
                      className={task.status === 'completed' ? 'text-green-500 fill-green-100 dark:fill-green-900/40' : 'text-slate-300 dark:text-slate-600'}
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-semibold text-sm ${
                        task.status === 'completed'
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}>
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
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 dark:text-slate-500 flex-wrap">
                      {task.due_date && (
                        <span className={`flex items-center gap-1 ${overdue ? 'text-red-500 dark:text-red-400 font-medium' : ''}`}>
                          <Calendar size={12} />
                          {new Date(task.due_date).toLocaleDateString()}
                          {overdue && ' (overdue)'}
                        </span>
                      )}
                      {task.tags && (
                        <span className="flex items-center gap-1">
                          <Tag size={12} /> {task.tags}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(task)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(task.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
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
