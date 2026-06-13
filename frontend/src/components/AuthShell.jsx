import { motion } from 'framer-motion'
import { Zap, CheckCircle2 } from 'lucide-react'

const features = [
  'Organize tasks with priorities & due dates',
  'Beautiful Kanban board & calendar views',
  'AI-powered assistant to boost productivity',
  'Real-time analytics and insights',
]

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-1/2 aurora-bg relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-black/20" />

        {/* Floating blobs */}
        <motion.div
          animate={{ y: [0, -24, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-16 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 left-10 w-52 h-52 bg-violet-300/15 rounded-full blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-sm text-white"
        >
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center ring-1 ring-white/30">
              <Zap size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">TaskFlow</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-3">
            Manage your work,<br />beautifully.
          </h1>
          <p className="text-white/70 text-sm mb-8 leading-relaxed">
            The all-in-one workspace to plan, track and complete your tasks — with your team or solo.
          </p>
          <ul className="space-y-3">
            {features.map((f, i) => (
              <motion.li
                key={f}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <CheckCircle2 size={17} className="text-white/80 flex-shrink-0" />
                <span className="text-white/80 text-sm">{f}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <Zap size={19} className="text-white" />
            </div>
            <span className="text-xl font-bold">TaskFlow</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{title}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-7">{subtitle}</p>
          {children}
        </motion.div>
      </div>
    </div>
  )
}
