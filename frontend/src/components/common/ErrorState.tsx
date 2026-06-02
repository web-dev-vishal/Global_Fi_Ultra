import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-10 px-4 text-center',
        'rounded-xl border border-red-500/20 bg-red-500/5',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="mb-3 p-2.5 rounded-xl bg-red-500/10">
        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
      {message && (
        <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">{message}</p>
      )}
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  )
}
