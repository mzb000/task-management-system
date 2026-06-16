import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings, User, Lock, Palette, Bell, Camera, Save,
  Sun, Moon, Monitor, CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { userApi, authApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'appearance', label: 'Appearance', icon: Palette },
]

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
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
  const labelCls = 'text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block'

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await userApi.updateProfile(profile)
      await refreshUser()
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed')
    } finally { setSaving(false) }
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
    if (pwd.new_password.length < 6) return toast.error('Password must be at least 6 characters')
    setSaving(true)
    try {
      await authApi.changePassword(pwd.current_password, pwd.new_password)
      toast.success('Password changed successfully')
      setPwd({ current_password: '', new_password: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Change failed')
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings size={20} className="text-brand-600 dark:text-brand-400" />
          Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account, security, and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-44 flex-shrink-0">
          <nav className="space-y-1">
            {TABS.map(t => {
              const Icon = t.icon
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                    tab === t.id
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}>
                  <Icon size={15} />
                  {t.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm"
          >
            {/* Profile tab */}
            {tab === 'profile' && (
              <div className="p-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-5">Profile Information</h2>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                  <div className="relative">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold">
                        {user?.full_name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <button onClick={() => fileRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg hover:bg-brand-700 transition-colors">
                      <Camera size={14} />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadAvatar} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{user?.full_name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">@{user?.username}</p>
                    <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-medium capitalize">
                      {user?.role}
                    </span>
                  </div>
                </div>

                <form onSubmit={saveProfile} className="space-y-4">
                  <div>
                    <label className={labelCls}>Full name</label>
                    <input className={field} value={profile.full_name}
                      onChange={e => setProfile({ ...profile, full_name: e.target.value })} required />
                  </div>
                  <div>
                    <label className={labelCls}>Username</label>
                    <input className={field} value={profile.username}
                      onChange={e => setProfile({ ...profile, username: e.target.value })} required />
                  </div>
                  <div>
                    <label className={labelCls}>Bio</label>
                    <textarea className={field} rows={3} value={profile.bio}
                      placeholder="Tell us about yourself…"
                      onChange={e => setProfile({ ...profile, bio: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input className={field + ' opacity-60 cursor-not-allowed'} value={user?.email || ''} disabled />
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Email cannot be changed</p>
                  </div>
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors shadow-sm shadow-brand-600/20">
                    <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Security tab */}
            {tab === 'security' && (
              <div className="p-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-5">Change Password</h2>
                <form onSubmit={changePassword} className="space-y-4 max-w-sm">
                  <div>
                    <label className={labelCls}>Current password</label>
                    <input type="password" className={field} value={pwd.current_password}
                      onChange={e => setPwd({ ...pwd, current_password: e.target.value })} required />
                  </div>
                  <div>
                    <label className={labelCls}>New password</label>
                    <input type="password" className={field} value={pwd.new_password} minLength={6}
                      onChange={e => setPwd({ ...pwd, new_password: e.target.value })} required />
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Minimum 6 characters</p>
                  </div>
                  <div>
                    <label className={labelCls}>Confirm new password</label>
                    <input type="password" className={field} value={pwd.confirm}
                      onChange={e => setPwd({ ...pwd, confirm: e.target.value })} required />
                    {pwd.confirm && pwd.new_password && (
                      <p className={`text-xs mt-1 flex items-center gap-1 ${
                        pwd.confirm === pwd.new_password ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                      }`}>
                        <CheckCircle2 size={11} />
                        {pwd.confirm === pwd.new_password ? 'Passwords match' : 'Passwords do not match'}
                      </p>
                    )}
                  </div>
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors">
                    <Lock size={15} /> {saving ? 'Updating…' : 'Change Password'}
                  </button>
                </form>

                {/* Security info */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Account Security</h3>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Password protection', ok: true },
                      { label: 'Secure login (JWT)', ok: true },
                      { label: 'Two-factor authentication', ok: false, note: 'Coming soon' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          item.ok ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-700'
                        }`}>
                          <CheckCircle2 size={10} className={item.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'} />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                        {item.note && <span className="text-xs text-slate-400 dark:text-slate-500">({item.note})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Appearance tab */}
            {tab === 'appearance' && (
              <div className="p-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-5">Appearance</h2>

                {/* Theme selection */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: Sun, desc: 'Clean and bright' },
                      { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
                    ].map(opt => {
                      const Icon = opt.icon
                      const active = theme === opt.value
                      return (
                        <button key={opt.value} onClick={() => { if (!active) toggleTheme() }}
                          className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                            active
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}>
                          {active && (
                            <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand-600 flex items-center justify-center">
                              <CheckCircle2 size={10} className="text-white" />
                            </span>
                          )}
                          <Icon size={22} className={active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'} />
                          <div className="text-center">
                            <p className={`text-sm font-semibold ${active ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'}`}>{opt.label}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{opt.desc}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Display preferences */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Display</h3>
                  {[
                    { label: 'Compact task cards', desc: 'Show less whitespace in task lists', enabled: false },
                    { label: 'Animations', desc: 'Framer Motion transitions throughout the app', enabled: true },
                    { label: 'Show task counts in sidebar', desc: 'Display number badges on nav items', enabled: true },
                  ].map(pref => (
                    <div key={pref.label} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{pref.label}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{pref.desc}</p>
                      </div>
                      <div className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${
                        pref.enabled ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'
                      }`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow m-1 transition-transform ${
                          pref.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
