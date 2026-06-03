import React from 'react'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
  height?: string
}

export function Skeleton({ className = '', lines, height = 'h-4', ...props }: SkeletonProps) {
  if (lines) return (
    <div className="space-y-2" {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`shimmer rounded-lg ${height} ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  )
  return (
    <div
      className={`shimmer rounded-lg ${height} ${className}`}
      aria-hidden="true"
      {...props}
    />
  )
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    /* Level 2 skeleton card */
    <div className="bg-white dark:bg-[#131D2E] border border-slate-200/80 dark:border-[var(--border)] rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-8 w-36" />
      {Array.from({ length: Math.max(0, rows - 2) }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === 0 ? 'w-full' : 'w-2/3'}`} />
      ))}
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
  )
}
