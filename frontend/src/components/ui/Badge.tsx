import React from 'react'
import { cn } from '@/lib/utils'

/* ═══════════════════════════════════════════════════════════════════════════
   Global-Fi Ultra — Premium Badge Component v2.0
   Variants: blue | green | red | amber | slate | purple | ai | gold | cyan
   Sizes: xs | sm (default) | md
═══════════════════════════════════════════════════════════════════════════ */

type BadgeVariant = 'blue' | 'green' | 'red' | 'amber' | 'slate' | 'purple' | 'ai' | 'gold' | 'cyan'
type BadgeSize    = 'xs' | 'sm' | 'md'

const VARIANTS: Record<BadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
  blue:   { bg: 'bg-[var(--accent-subtle)]',        text: 'text-[var(--accent-bright)]',   border: 'border-[rgba(37,99,235,0.2)]',    dot: 'bg-[var(--accent-bright)]' },
  green:  { bg: 'bg-[var(--success-subtle)]',        text: 'text-[var(--success-bright)]',  border: 'border-[var(--success-border)]',  dot: 'bg-[var(--success-bright)]' },
  red:    { bg: 'bg-[var(--danger-subtle)]',          text: 'text-[var(--danger-bright)]',   border: 'border-[var(--danger-border)]',   dot: 'bg-[var(--danger-bright)]' },
  amber:  { bg: 'bg-[var(--warning-subtle)]',         text: 'text-[var(--warning-bright)]',  border: 'border-[var(--warning-border)]',  dot: 'bg-[var(--warning-bright)]' },
  slate:  { bg: 'bg-[var(--bg-4)]',                   text: 'text-[var(--text-2)]',           border: 'border-[var(--border-3)]',        dot: 'bg-[var(--text-3)]' },
  purple: { bg: 'bg-[rgba(124,58,237,0.08)]',         text: 'text-[#A78BFA]',                border: 'border-[rgba(124,58,237,0.2)]',   dot: 'bg-[#A78BFA]' },
  ai:     { bg: 'bg-[var(--ai-subtle)]',              text: 'text-[var(--ai-bright)]',       border: 'border-[var(--ai-border)]',       dot: 'bg-[var(--ai-bright)]' },
  gold:   { bg: 'bg-[var(--gold-subtle)]',            text: 'text-[var(--gold-bright)]',     border: 'border-[rgba(180,83,9,0.2)]',     dot: 'bg-[var(--gold-bright)]' },
  cyan:   { bg: 'bg-[rgba(8,145,178,0.10)]',          text: 'text-[var(--info-bright)]',     border: 'border-[rgba(8,145,178,0.2)]',    dot: 'bg-[var(--info-bright)]' },
}

const SIZES: Record<BadgeSize, string> = {
  xs: 'text-[9px]  px-1.5 py-0.5 gap-1   rounded',
  sm: 'text-[10px] px-2   py-0.5 gap-1   rounded-full',
  md: 'text-[11px] px-2.5 py-1   gap-1.5 rounded-full',
}

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  children: React.ReactNode
  className?: string
  dot?: boolean
  pulseDot?: boolean
}

export function Badge({
  variant = 'slate',
  size = 'sm',
  children,
  className = '',
  dot,
  pulseDot,
}: BadgeProps) {
  const v = VARIANTS[variant]

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold border leading-none',
        v.bg, v.text, v.border,
        SIZES[size],
        className
      )}
    >
      {(dot || pulseDot) && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          v.dot,
          pulseDot && 'pulse-dot'
        )} />
      )}
      {children}
    </span>
  )
}
