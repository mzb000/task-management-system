import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Plus, Users, X, Check, Loader2, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { workspaceApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Workspaces() {
  const { user: me } = useAuth()
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [inviteWs, setInviteWs] = useState(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  const load = () =>
    workspaceApi.list().then(r => { setWorkspaces(r.data); setLoading(false) }).catch(() => setLoading(false))

  useEffect(() => { load() }, [])

  const create = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      await workspaceApi.create({ name: newName.trim(), description: newDesc.trim() || null })
      toast.success('Workspace created')
      setNewName(''); setNewDesc('')
      setShowCreate(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create workspace')
    } finally {
      setCreating(false)
    }
  }

  const invite = async (e) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !inviteWs) return
    setInviting(true)
    try {
      await workspaceApi.invite(inviteWs.id, inviteEmail.trim())
      toast.success(`Invited ${inviteEmail}`)
      setInviteEmail('')
      setInviteWs(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not invite user')
    } finally {
      setInviting(false)
    }
  }

  const field = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 transition-colors'

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-9 h-9 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Briefcase size={20} className="text-brand-600 dark:text-brand-400" />
            Workspaces
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{workspaces.length} workspace{workspaces.length !== 1 && 's'}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm shadow-brand-600/20"
        >
          <Plus size={15} /> New Workspace
        </button>
      </div>

      {/* Create workspace modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCreate(false)}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200/50 dark:border-slate-700/50"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">New Workspace</h3>
                <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <X size={18} className="text-slate-500 dark:text-slate-400" />
                </button>
              </div>
              <form onSubmit={create} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Workspace name</label>
                  <input className={field} placeholder="e.g. Design Team" value={newName}
                    onChange={e => setNewName(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Description (optional)</label>
                  <textarea className={field} rows={3} placeholder="What is this workspace for?"
                    value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowCreate(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 font-medium text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={creating}
                    className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 disabled:opacity-60 transition-colors">
                    {creating ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite modal */}
      <AnimatePresence>
        {inviteWs && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setInviteWs(null)}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200/50 dark:border-slate-700/50"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Invite to "{inviteWs.name}"</h3>
                <button onClick={() => setInviteWs(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <X size={18} className="text-slate-500 dark:text-slate-400" />
                </button>
              </div>
              <form onSubmit={invite} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">User's email address</label>
                  <input type="email" className={field} placeholder="colleague@example.com"
                    value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setInviteWs(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 font-medium text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={inviting}
                    className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                    {inviting ? <Loader2 size={14} className="animate-spin" /> : <><UserPlus size={14} /> Invite</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace list */}
      {workspaces.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <Briefcase size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">No workspaces yet</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">Create a workspace to collaborate with your team</p>
          <button onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors">
            <Plus size={15} /> Create Workspace
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workspaces.map((ws, i) => (
            <motion.div
              key={ws.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm p-5"
            >
              {/* Icon + name */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm shadow-brand-600/20">
                  <Briefcase size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate">{ws.name}</h3>
                  {ws.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{ws.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                  <Users size={12} />
                  <span>
                    {ws.owner_id === me?.id ? 'Owner' : 'Member'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {ws.owner_id === me?.id && (
                    <button
                      onClick={() => setInviteWs(ws)}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors"
                    >
                      <UserPlus size={11} /> Invite
                    </button>
                  )}
                  <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/40 rounded-lg">
                    <Check size={10} className="text-emerald-500" /> Active
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
