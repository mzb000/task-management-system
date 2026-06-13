import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { taskApi } from '../api/client'

const empty = {
  title: '', description: '', due_date: '', priority: 'medium', status: 'todo', tags: '',
}

export default function TaskModal({ open, onClose, onSaved, task }) {
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        due_date: task.due_date ? task.due_date.slice(0, 10) : '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        tags: task.tags || '',
      })
    } else {
      setForm(empty)
    }
  }, [task, open])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      ...form,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
    }
    try {
      if (task) {
        await taskApi.update(task.id, payload)
        toast.success('Task updated')
      } else {
        await taskApi.create(payload)
        toast.success('Task created')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const field = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">
                  {task ? 'Edit Task' : 'Create Task'}
                </h3>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={submit} className="p-5 space-y-4">
                <input
                  className={field} placeholder="Task title" required
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <textarea
                  className={field} rows={3} placeholder="Description (optional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Priority</label>
                    <select className={field} value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
                    <select className={field} value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Due date</label>
                    <input type="date" className={field} value={form.due_date}
                      onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Tags</label>
                    <input className={field} placeholder="design, urgent" value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-slate-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60">
                    {loading ? 'Saving…' : task ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
