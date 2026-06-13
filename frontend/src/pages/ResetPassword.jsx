import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthShell from '../components/AuthShell'
import Input from '../components/Input'
import { authApi } from '../api/client'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (!token) return toast.error('Invalid reset link')
    setLoading(true)
    try {
      await authApi.resetPassword(token, form.password)
      toast.success('Password reset! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Set new password" subtitle="Choose a strong password">
      <form onSubmit={submit}>
        <Input
          label="New password" icon={Lock} type="password" placeholder="Min. 6 characters"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          required minLength={6}
        />
        <Input
          label="Confirm password" icon={Lock} type="password" placeholder="Repeat password"
          value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          required
        />
        <button
          type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>
      <Link to="/login" className="block text-center text-sm text-slate-500 hover:text-brand-600 mt-6">
        Back to login
      </Link>
    </AuthShell>
  )
}
