import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, AtSign } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthShell from '../components/AuthShell'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Welcome 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Start managing your tasks in seconds">
      <form onSubmit={submit}>
        <Input
          label="Full name" icon={User} placeholder="John Doe"
          value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
        />
        <Input
          label="Username" icon={AtSign} placeholder="johndoe"
          value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <Input
          label="Email" icon={Mail} type="email" placeholder="you@example.com"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Password" icon={Lock} type="password" placeholder="Min. 6 characters"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          required minLength={6}
        />
        <button
          type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
