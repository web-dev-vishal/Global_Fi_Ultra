import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-sm"
      >
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <Zap className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
          <span className="font-bold text-lg text-[var(--text-1)]">
            Global-Fi <span className="text-blue-500 dark:text-blue-400">Ultra</span>
          </span>
        </div>

        <motion.div
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 180 }}
        >
          <span className="block text-[96px] font-black leading-none text-blue-500/20 select-none mb-4">404</span>
        </motion.div>

        <h1 className="text-xl font-bold text-[var(--text-1)] mb-2">Page not found</h1>
        <p className="text-sm text-[var(--text-2)] mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>
            Go back
          </Button>
          <Button onClick={() => navigate('/')} icon={<Home className="h-4 w-4" />}>
            Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
