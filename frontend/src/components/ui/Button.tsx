import React from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'danger' | 'ghost' | 'success' | 'warning' | 'outline'
type Size    = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
}

// Per spec: primary blue-600, ghost = border ghost, danger = red, disabled = slate-700
const V: Record<Variant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-500 text-white border-transparent shadow-lg shadow-blue-600/20',
  danger:  'bg-red-600/90 hover:bg-red-600 text-white border-transparent',
  ghost:   'bg-transparent border-[var(--border-md)] text-[var(--text-2)] hover:border-[var(--border)] hover:text-[var(--text-1)]',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent',
  warning: 'bg-amber-600 hover:bg-amber-500 text-white border-transparent',
  outline: 'bg-transparent border-slate-300 dark:border-[var(--border)] hover:border-slate-400 dark:hover:border-[var(--border-md)] text-[var(--text-2)] hover:text-[var(--text-1)]',
}

const S: Record<Size, string> = {
  sm:       'h-7 px-3 text-xs gap-1.5',
  md:       'h-9 px-4 text-sm gap-2',
  lg:       'h-10 px-6 text-sm gap-2',
  icon:     'h-9 w-9',
  'icon-sm':'h-7 w-7',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg border font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0B1220] disabled:pointer-events-none disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:border-transparent ${V[variant]} ${S[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        : icon
        ? <span className="shrink-0">{icon}</span>
        : null
      }
      {children}
    </button>
  )
}
