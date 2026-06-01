import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ToastMessage } from '@/types'

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  error: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
  warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
      role="region"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = icons[toast.type]
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-sm',
                styles[toast.type]
              )}
              role="alert"
              aria-atomic="true"
            >
              <Icon className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs mt-0.5 opacity-80">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
