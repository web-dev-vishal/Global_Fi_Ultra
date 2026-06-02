import React from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'blue' | 'green' | 'red' | 'amber' | 'slate' | 'purple' | 'cyan'

const variants: Record<BadgeVariant, string> = {
  blue:   'bg-blue-500/15 text-blue-400 border-blue-500/25',
  green:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  red:    'bg-red-500/15 text-red-400 border-red-500/25',
  amber:  'bg-amber-500/15 text-amber-400 border-amber-500/25',
  slate:  'bg-slate-500/15 text-slate-400 border-slate-500/25',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  cyan:   'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
}

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  dot?: boolean
}

export function Badge({ variant = 'slate', children, className, dot }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
      variants[variant],
      className
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  )
}

const dotColors: Record<BadgeVariant, string> = {
  blue:   'bg-blue-400',
  green:  'bg-emerald-400',
  red:    'bg-red-400',
  amber:  'bg-amber-400',
  slate:  'bg-slate-400',
  purple: 'bg-purple-400',
  cyan:   'bg-cyan-400',
}
