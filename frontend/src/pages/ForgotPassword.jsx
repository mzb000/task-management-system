import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, MailCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import AuthShell from '../components/AuthShell'
import Input from '../components/Input'
import { authApi } from '../api/client'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Reset password" subtitle="We'll email you a reset link">
      {sent ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
            <MailCheck size={30} className="text-green-600" />
          </div>
          <p className="text-slate-700 font-medium">Check your inbox!</p>
          <p className="text-slate-500 text-sm mt-2">
            If an account exists for {email}, a reset link is on its way.
          </p>
          <p className="text-xs text-slate-400 mt-3">
            (In dev mode the link is printed in the backend console.)
          </p>
        </motion.div>
      ) : (
        <form onSubmit={submit}>
          <Input
            label="Email" icon={Mail} type="email" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required
          />
          <button
            type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
      )}
      <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-slate-500 hover:text-brand-600 mt-6">
        <ArrowLeft size={16} /> Back to login
      </Link>
    </AuthShell>
  )
}
