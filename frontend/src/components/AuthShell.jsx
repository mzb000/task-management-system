import { motion } from 'framer-motion'
import { Zap, CheckCircle2 } from 'lucide-react'

const features = [
  'Organize tasks with priorities & due dates',
  'Beautiful dashboard with live analytics',
  'Collaborate, comment & @mention your team',
  'Stay on top with smart notifications',
]

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-1/2 aurora-bg relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-black/10" />
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-md text-white"
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Zap size={24} />
            </div>
            <span className="text-2xl font-extrabold">TaskFlow</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Manage your work, beautifully.
          </h1>
          <p className="text-white/80 mb-8">
            The all-in-one workspace to plan, track and complete your tasks with your team.
          </p>
          <ul className="space-y-3">
            {features.map((f, i) => (
              <motion.li
                key={f}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12 }}
                className="flex items-center gap-3"
              >
                <CheckCircle2 size={20} className="text-white/90 shrink-0" />
                <span className="text-white/90 text-sm">{f}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* floating blobs */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 right-16 w-32 h-32 bg-white/10 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-24 left-12 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl"
        />
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-xl font-extrabold">TaskFlow</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{title}</h2>
          <p className="text-slate-500 mb-8">{subtitle}</p>
          {children}
        </motion.div>
      </div>
    </div>
  )
}
