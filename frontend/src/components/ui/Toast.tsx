import React, { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ═══════════════════════════════════════════════════════════════════════════
   Global-Fi Ultra — Premium Toast / Notification System v2.0
   Linear-inspired: minimal, precise, informative
═══════════════════════════════════════════════════════════════════════════ */

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast { id: string; type: ToastType; title: string; message?: string }
interface ToastCtx {
  toasts: Toast[]
  toast: { success: (t: string, m?: string) => void; error: (t: string, m?: string) => void; warning: (t: string, m?: string) => void; info: (t: string, m?: string) => void }
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastCtx | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(p => [...p.slice(-4), { id, type, title, message }]) // max 5 toasts
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500)
  }, [])

  const dismiss = useCallback((id: string) => setToasts(p => p.filter(t => t.id !== id)), [])

  const toast = {
    success: (t: string, m?: string) => add('success', t, m),
    error:   (t: string, m?: string) => add('error',   t, m),
    warning: (t: string, m?: string) => add('warning', t, m),
    info:    (t: string, m?: string) => add('info',    t, m),
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx.toast
}

/* ── Visual config per type ── */
const CONFIG: Record<ToastType, {
  Icon: React.ElementType
  container: string
  iconColor: string
  progressColor: string
}> = {
  success: {
    Icon: CheckCircle2,
    container: 'border-[var(--success-border)] bg-[var(--bg-3)]',
    iconColor:  'text-[var(--success-bright)]',
    progressColor: 'bg-[var(--success-bright)]',
  },
  error: {
    Icon: AlertCircle,
    container: 'border-[var(--danger-border)] bg-[var(--bg-3)]',
    iconColor:  'text-[var(--danger-bright)]',
    progressColor: 'bg-[var(--danger-bright)]',
  },
  warning: {
    Icon: AlertTriangle,
    container: 'border-[var(--warning-border)] bg-[var(--bg-3)]',
    iconColor:  'text-[var(--warning-bright)]',
    progressColor: 'bg-[var(--warning-bright)]',
  },
  info: {
    Icon: Info,
    container: 'border-[rgba(37,99,235,0.25)] bg-[var(--bg-3)]',
    iconColor:  'text-[var(--accent-bright)]',
    progressColor: 'bg-[var(--accent-bright)]',
  },
}

function ToastContainer() {
  const ctx = useContext(ToastContext)!

  return (
    <div
      className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 w-[340px] pointer-events-none"
      aria-live="polite"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence initial={false}>
        {ctx.toasts.map(t => {
          const { Icon, container, iconColor, progressColor } = CONFIG[t.type]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{ opacity: 0, x: 16, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'pointer-events-auto relative overflow-hidden',
                'flex items-start gap-3',
                'rounded-xl border p-3.5',
                'shadow-[var(--shadow-float)]',
                container
              )}
              role="alert"
              aria-atomic="true"
            >
              {/* Left accent line */}
              <div className={cn('absolute left-0 top-3 bottom-3 w-0.5 rounded-full', progressColor)} />

              <Icon className={cn('h-4 w-4 mt-0.5 shrink-0 ml-1.5', iconColor)} aria-hidden="true" />

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[var(--text-1)] leading-tight">
                  {t.title}
                </p>
                {t.message && (
                  <p className="text-[12px] text-[var(--text-2)] mt-0.5 leading-relaxed">
                    {t.message}
                  </p>
                )}
              </div>

              <button
                onClick={() => ctx.dismiss(t.id)}
                className={cn(
                  'shrink-0 flex items-center justify-center w-5 h-5 rounded-md',
                  'text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--bg-4)]',
                  'transition-colors duration-100 mt-0.5'
                )}
                aria-label="Dismiss notification"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
