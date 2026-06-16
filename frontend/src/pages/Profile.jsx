import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, User, Lock, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { userApi, authApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [tab, setTab] = useState('profile')
  const fileRef = useRef()

  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    bio: user?.bio || '',
  })
  const [pwd, setPwd] = useState({ current_password: '', new_password: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  const field = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 transition-colors'

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await userApi.updateProfile(profile)
      await refreshUser()
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await userApi.uploadAvatar(file)
      await refreshUser()
      toast.success('Avatar updated')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (pwd.new_password !== pwd.confirm) return toast.error('Passwords do not match')
    setSaving(true)
    try {
      await authApi.changePassword(pwd.current_password, pwd.new_password)
      toast.success('Password changed')
      setPwd({ current_password: '', new_password: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Change failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Account Settings</h1>

      {/* Avatar header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/60 shadow-sm mb-6 flex items-center gap-5"
      >
        <div className="relative">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg hover:bg-brand-700 transition-colors"
          >
            <Camera size={15} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadAvatar} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{user?.full_name}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">@{user?.username}</p>
          <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-medium capitalize">
            {user?.role}
          </span>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'password', label: 'Password', icon: Lock },
        ].map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Icon size={16} /> {t.label}
            </button>
          )
        })}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/60 shadow-sm"
      >
        {tab === 'profile' ? (
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Full name</label>
              <input className={field} value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Username</label>
              <input className={field} value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Bio</label>
              <textarea className={field} rows={3} value={profile.bio}
                placeholder="Tell us about yourself…"
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
            </div>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors">
              <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        ) : (
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Current password</label>
              <input type="password" className={field} value={pwd.current_password}
                onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">New password</label>
              <input type="password" className={field} value={pwd.new_password} minLength={6}
                onChange={(e) => setPwd({ ...pwd, new_password: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Confirm new password</label>
              <input type="password" className={field} value={pwd.confirm}
                onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} required />
            </div>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors">
              <Lock size={16} /> {saving ? 'Updating…' : 'Change Password'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
