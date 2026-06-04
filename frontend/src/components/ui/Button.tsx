import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ═══════════════════════════════════════════════════════════════════════════
   Global-Fi Ultra — Premium Button Component v2.0
   Variants: primary | secondary | ghost | danger | success | warning | outline | ai
   Sizes: xs | sm | md | lg | icon | icon-sm | icon-lg
═══════════════════════════════════════════════════════════════════════════ */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'outline' | 'ai'
type Size    = 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

/* ── Variant styles ── */
const VARIANTS: Record<Variant, string> = {
  primary: [
    'bg-[var(--accent)] hover:bg-[var(--accent-hover)]',
    'text-white font-semibold',
    'border-transparent',
    'shadow-[0_1px_3px_rgba(0,0,0,0.25),0_0_0_1px_rgba(37,99,235,0.3)]',
    'hover:shadow-[0_2px_8px_var(--accent-glow),0_0_0_1px_rgba(37,99,235,0.5)]',
  ].join(' '),

  secondary: [
    'bg-[var(--bg-4)] hover:bg-[var(--bg-5)]',
    'text-[var(--text-1)] font-medium',
    'border-[var(--border-3)] hover:border-[var(--border-4)]',
  ].join(' '),

  ghost: [
    'bg-transparent hover:bg-[var(--bg-4)]',
    'text-[var(--text-2)] hover:text-[var(--text-1)]',
    'border-transparent',
  ].join(' '),

  outline: [
    'bg-transparent hover:bg-[var(--bg-3)]',
    'text-[var(--text-2)] hover:text-[var(--text-1)]',
    'border-[var(--border-3)] hover:border-[var(--border-4)]',
  ].join(' '),

  danger: [
    'bg-[var(--danger)] hover:bg-[#EF4444]',
    'text-white font-semibold',
    'border-transparent',
    'shadow-[0_1px_3px_rgba(0,0,0,0.25)]',
    'hover:shadow-[0_2px_8px_var(--danger-subtle)]',
  ].join(' '),

  success: [
    'bg-[var(--success)] hover:bg-[#10B981]',
    'text-white font-semibold',
    'border-transparent',
    'shadow-[0_1px_3px_rgba(0,0,0,0.25)]',
    'hover:shadow-[0_2px_8px_var(--success-subtle)]',
  ].join(' '),

  warning: [
    'bg-[var(--warning)] hover:bg-[#F59E0B]',
    'text-white font-semibold',
    'border-transparent',
    'shadow-[0_1px_3px_rgba(0,0,0,0.25)]',
  ].join(' '),

  ai: [
    'bg-[var(--ai)] hover:bg-[#8B5CF6]',
    'text-white font-semibold',
    'border-transparent',
    'shadow-[0_1px_3px_rgba(0,0,0,0.25),0_0_0_1px_rgba(124,58,237,0.3)]',
    'hover:shadow-[0_2px_12px_var(--ai-subtle),0_0_0_1px_rgba(124,58,237,0.5)]',
  ].join(' '),
}

/* ── Size styles ── */
const SIZES: Record<Size, string> = {
  xs:       'h-6   px-2.5 text-[11px] gap-1  rounded-md',
  sm:       'h-7   px-3   text-[12px] gap-1.5 rounded-md',
  md:       'h-8   px-3.5 text-[13px] gap-2  rounded-lg',
  lg:       'h-9   px-5   text-[13px] gap-2  rounded-lg',
  icon:     'h-8   w-8    text-[13px]        rounded-lg',
  'icon-sm':'h-7   w-7    text-[12px]        rounded-md',
  'icon-lg':'h-9   w-9    text-[14px]        rounded-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      className={cn(
        /* Base */
        'inline-flex items-center justify-center',
        'border font-[450] leading-none',
        'transition-all duration-100',
        'hover:scale-[1.02] active:scale-[0.98]',
        /* Focus */
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-1',
        'focus-visible:ring-offset-[var(--bg-0)]',
        /* Disabled */
        'disabled:pointer-events-none',
        'disabled:opacity-40',
        'disabled:shadow-none',
        /* Variant + Size */
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0 flex items-center">{icon}</span>
      ) : null}

      {children}

      {!loading && iconRight && (
        <span className="shrink-0 flex items-center">{iconRight}</span>
      )}
    </button>
  )
}
