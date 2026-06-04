import React from 'react'
import { cn } from '@/lib/utils'

/* ═══════════════════════════════════════════════════════════════════════════
   Global-Fi Ultra — Premium Skeleton / Loading States v2.0
═══════════════════════════════════════════════════════════════════════════ */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
  height?: string
}

export function Skeleton({ className = '', lines, height = 'h-3.5', ...props }: SkeletonProps) {
  if (lines) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'shimmer rounded-md',
              height,
              i === lines - 1 ? 'w-3/5' : i % 3 === 1 ? 'w-5/6' : 'w-full'
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn('shimmer rounded-md', height, className)}
      aria-hidden="true"
      {...props}
    />
  )
}

/* ── KPI Card skeleton ── */
export function SkeletonCard({ rows = 2 }: { rows?: number }) {
  return (
    <div className={cn(
      'rounded-xl p-4',
      'bg-[var(--bg-2)] border border-[var(--border-1)]',
      'space-y-3'
    )}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-6 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-28" />
      {Array.from({ length: Math.max(0, rows - 2) }).map((_, i) => (
        <Skeleton key={i} className={cn('h-2.5', i === 0 ? 'w-full' : 'w-1/2')} />
      ))}
    </div>
  )
}

/* ── Table row skeleton ── */
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[var(--border-1)] last:border-0">
      <Skeleton className="h-7 w-7 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-2.5 w-14" />
      </div>
      <Skeleton className="h-3.5 w-16" />
      <Skeleton className="h-5 w-12 rounded-full" />
    </div>
  )
}

/* ── Text block skeleton ── */
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-3',
            i === lines - 1 ? 'w-2/3' : i % 2 === 0 ? 'w-full' : 'w-11/12'
          )}
        />
      ))}
    </div>
  )
}

/* ── Chart skeleton ── */
export function SkeletonChart({ height = 'h-40' }: { height?: string }) {
  return (
    <div className={cn('w-full rounded-xl shimmer', height)} />
  )
}
