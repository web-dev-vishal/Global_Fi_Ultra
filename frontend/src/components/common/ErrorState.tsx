import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="mb-3 p-3 rounded-full bg-red-500/10">
        <AlertCircle className="h-6 w-6 text-red-500" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {message && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{message}</p>
      )}
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  )
}
