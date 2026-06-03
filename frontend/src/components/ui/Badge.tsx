import React from 'react'

// Status badge variants per spec
type BadgeVariant = 'blue' | 'green' | 'red' | 'amber' | 'slate' | 'purple' | 'cyan'

const V: Record<BadgeVariant, string> = {
  blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  green:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  red:    'bg-red-500/10 text-red-400 border-red-500/20',
  amber:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  slate:  'bg-slate-700/60 text-slate-400 border-slate-700',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  cyan:   'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
}

const D: Record<BadgeVariant, string> = {
  blue:   'bg-blue-400',
  green:  'bg-emerald-400',
  red:    'bg-red-400',
  amber:  'bg-amber-400',
  slate:  'bg-slate-400',
  purple: 'bg-purple-400',
  cyan:   'bg-cyan-400',
}

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  dot?: boolean
}

export function Badge({ variant = 'slate', children, className = '', dot }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${V[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${D[variant]} pulse-dot`} />}
      {children}
    </span>
  )
}
