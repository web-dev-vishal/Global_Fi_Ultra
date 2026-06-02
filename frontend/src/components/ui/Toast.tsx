import React, { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastCtx {
  toasts: Toast[]
  toast: {
    success: (title: string, msg?: string) => void
    error: (title: string, msg?: string) => void
    warning: (title: string, msg?: string) => void
    info: (title: string, msg?: string) => void
  }
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastCtx | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(p => [...p, { id, type, title, message }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)
  }, [])

  const dismiss = useCallback((id: string) => setToasts(p => p.filter(t => t.id !== id)), [])

  const toast = {
    success: (t: string, m?: string) => add('success', t, m),
    error:   (t: string, m?: string) => add('error', t, m),
    warning: (t: string, m?: string) => add('warning', t, m),
    info:    (t: string, m?: string) => add('info', t, m),
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

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle2, error: AlertCircle, warning: AlertTriangle, info: Info,
}

const styles: Record<ToastType, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  error:   'border-red-500/30 bg-red-500/10 text-red-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  info:    'border-blue-500/30 bg-blue-500/10 text-blue-300',
}

function ToastContainer() {
  const ctx = useContext(ToastContext)!
  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {ctx.toasts.map(t => {
          const Icon = icons[t.type]
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 backdrop-blur-sm',
                'shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
                styles[t.type]
              )}
            >
              <Icon className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.message && <p className="text-xs opacity-80 mt-0.5">{t.message}</p>}
              </div>
              <button onClick={() => ctx.dismiss(t.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
