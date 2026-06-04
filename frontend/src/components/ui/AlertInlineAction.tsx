import React from 'react'
import { ArrowRight, Mail, AlertTriangle, Info, CheckCircle2, Zap } from 'lucide-react'
import { Alert, AlertTitle, buttonVariants } from '@/components/ui/Alert'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/* ═══════════════════════════════════════════════════════════════════════════
   AlertInlineAction — Alert banner with a right-aligned link/action CTA
   Direct equivalent of Alert4, built with codebase-native primitives.

   Usage:
     <AlertInlineAction
       variant="teal"
       message="You have a new message!"
       actionLabel="View"
       actionHref="#"
     />
═══════════════════════════════════════════════════════════════════════════ */

type AlertVariant = 'default' | 'info' | 'success' | 'warning' | 'danger' | 'teal' | 'ai'

/* Icon to use per variant */
const VARIANT_ICONS: Record<AlertVariant, React.ElementType> = {
  default:  Info,
  info:     Info,
  success:  CheckCircle2,
  warning:  AlertTriangle,
  danger:   AlertTriangle,
  teal:     Mail,
  ai:       Zap,
}

/* Teal-specific link button colours (matches original Alert4 exactly) */
const ACTION_COLORS: Record<AlertVariant, string> = {
  default:  'text-[var(--text-2)] hover:bg-[var(--bg-4)]',
  info:     'text-[var(--accent-bright)] hover:bg-[var(--accent-subtle)]',
  success:  'text-[var(--success-bright)] hover:bg-[var(--success-subtle)]',
  warning:  'text-[var(--warning-bright)] hover:bg-[var(--warning-subtle)]',
  danger:   'text-[var(--danger-bright)] hover:bg-[var(--danger-subtle)]',
  teal:     'text-teal-400 hover:bg-[rgba(20,184,166,0.10)] dark:text-teal-400 dark:hover:bg-[rgba(20,184,166,0.10)]',
  ai:       'text-[var(--ai-bright)] hover:bg-[var(--ai-subtle)]',
}

export interface AlertInlineActionProps {
  /** Alert colour variant */
  variant?: AlertVariant
  /** The message text shown in the alert */
  message: string
  /** Label for the right-side CTA link */
  actionLabel?: string
  /** href for the CTA anchor */
  actionHref?: string
  /** Click handler (used instead of href for SPA navigation) */
  onAction?: () => void
  /** Override the left icon */
  icon?: React.ReactNode
  /** Extra className forwarded to the Alert root */
  className?: string
}

export function AlertInlineAction({
  variant = 'teal',
  message,
  actionLabel = 'Link',
  actionHref = '#',
  onAction,
  icon,
  className,
}: AlertInlineActionProps) {
  const DefaultIcon = VARIANT_ICONS[variant]
  const actionColor = ACTION_COLORS[variant]

  return (
    <Alert
      variant={variant}
      className={cn(
        'flex items-center justify-between gap-3 py-3',
        /* Override icon vertical alignment — keep it centred in single-line banners */
        '[&>svg]:mt-0 [&>svg]:translate-y-0',
        className
      )}
    >
      {/* Left icon */}
      {icon ?? <DefaultIcon aria-hidden="true" />}

      {/* Message */}
      <AlertTitle className="flex-1 leading-none">
        {message}
      </AlertTitle>

      {/* Right CTA */}
      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className={cn(
            buttonVariants({ variant: 'link', size: 'sm' }),
            'group h-7 rounded-lg px-2.5 border-transparent',
            actionColor
          )}
        >
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      ) : (
        <a
          href={actionHref}
          className={cn(
            buttonVariants({ variant: 'link', size: 'sm' }),
            'group h-7 rounded-lg px-2.5 border-transparent',
            actionColor
          )}
        >
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      )}
    </Alert>
  )
}
