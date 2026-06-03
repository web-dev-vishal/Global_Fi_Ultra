import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ToastMessage } from '@/types'

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

const config: Record<string, { icon: React.ElementType; cls: string; iconCls: string }> = {
  success: {
    icon:    CheckCircle2,
    cls:     'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    iconCls: 'text-emerald-400',
  },
  error: {
    icon:    AlertCircle,
    cls:     'border-red-500/20 bg-red-500/10 text-red-300',
    iconCls: 'text-red-400',
  },
  warning: {
    icon:    AlertTriangle,
    cls:     'border-amber-500/20 bg-amber-500/10 text-amber-300',
    iconCls: 'text-amber-400',
  },
  info: {
    icon:    Info,
    cls:     'border-blue-500/20 bg-blue-500/10 text-blue-300',
    iconCls: 'text-blue-400',
  },
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-[340px] w-full pointer-events-none"
      aria-live="polite"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const { icon: Icon, cls, iconCls } = config[toast.type] ?? config.info
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5',
                'shadow-[0_8px_32px_hsl(240_10%_3.9%/0.6)] backdrop-blur-sm',
                cls
              )}
              role="alert"
              aria-atomic="true"
            >
              <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', iconCls)} aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs mt-0.5 opacity-75 leading-relaxed">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5"
                aria-label="Dismiss"
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
