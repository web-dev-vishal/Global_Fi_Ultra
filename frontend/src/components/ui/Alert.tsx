import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/* ═══════════════════════════════════════════════════════════════════════════
   Global-Fi Ultra — Alert / Inline Banner Component
   Variants: default | info | success | warning | danger | teal | ai
   Matches the design system CSS tokens from index.css
═══════════════════════════════════════════════════════════════════════════ */

/* ── Alert container — CVA variant map ── */
const alertVariants = cva(
  /* base */
  [
    'relative w-full flex gap-3 rounded-xl border p-4',
    '[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:mt-0.5',
    'transition-colors duration-100',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-[var(--bg-3)] border-[var(--border-3)]',
          'text-[var(--text-1)]',
          '[&>svg]:text-[var(--text-2)]',
        ].join(' '),

        info: [
          'bg-[var(--accent-subtle)] border-[rgba(37,99,235,0.25)]',
          'text-[var(--accent-bright)]',
          '[&>svg]:text-[var(--accent-bright)]',
        ].join(' '),

        success: [
          'bg-[var(--success-subtle)] border-[var(--success-border)]',
          'text-[var(--success-bright)]',
          '[&>svg]:text-[var(--success-bright)]',
        ].join(' '),

        warning: [
          'bg-[var(--warning-subtle)] border-[var(--warning-border)]',
          'text-[var(--warning-bright)]',
          '[&>svg]:text-[var(--warning-bright)]',
        ].join(' '),

        danger: [
          'bg-[var(--danger-subtle)] border-[var(--danger-border)]',
          'text-[var(--danger-bright)]',
          '[&>svg]:text-[var(--danger-bright)]',
        ].join(' '),

        /* Teal — direct colour token match for the Alert4 design */
        teal: [
          'bg-[rgba(20,184,166,0.10)] border-[rgba(20,184,166,0.30)]',
          'text-teal-400',
          '[&>svg]:text-teal-400',
        ].join(' '),

        ai: [
          'bg-[var(--ai-subtle)] border-[var(--ai-border)]',
          'text-[var(--ai-bright)]',
          '[&>svg]:text-[var(--ai-bright)]',
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

/* ── Alert root ── */
export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  )
}

/* ── AlertTitle ── */
export interface AlertTitleProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function AlertTitle({ className, children, ...props }: AlertTitleProps) {
  return (
    <p
      className={cn(
        'text-[13px] font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}

/* ── AlertDescription ── */
export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function AlertDescription({ className, children, ...props }: AlertDescriptionProps) {
  return (
    <p
      className={cn('text-[12px] leading-relaxed opacity-85 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  )
}

/* ── buttonVariants — for inline link actions inside alerts ── */
export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-1.5',
    'border font-[450] leading-none rounded-lg',
    'transition-all duration-100',
    'hover:scale-[1.02] active:scale-[0.98]',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-1',
    'focus-visible:ring-offset-[var(--bg-0)]',
    'disabled:pointer-events-none disabled:opacity-40',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:   'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white border-transparent shadow-[0_1px_3px_rgba(0,0,0,0.25)]',
        secondary: 'bg-[var(--bg-4)] hover:bg-[var(--bg-5)] text-[var(--text-1)] border-[var(--border-3)]',
        ghost:     'bg-transparent hover:bg-[var(--bg-4)] text-[var(--text-2)] hover:text-[var(--text-1)] border-transparent',
        outline:   'bg-transparent hover:bg-[var(--bg-3)] text-[var(--text-2)] hover:text-[var(--text-1)] border-[var(--border-3)]',
        danger:    'bg-[var(--danger)] hover:bg-[#EF4444] text-white border-transparent',
        link:      'bg-transparent border-transparent underline-offset-4 hover:underline text-[var(--accent-bright)] p-0 h-auto',
      },
      size: {
        xs: 'h-6  px-2.5 text-[11px] gap-1',
        sm: 'h-7  px-3   text-[12px] gap-1.5',
        md: 'h-8  px-3.5 text-[13px] gap-2',
        lg: 'h-9  px-5   text-[13px] gap-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)
