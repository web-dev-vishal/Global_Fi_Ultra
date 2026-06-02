import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground',
        'placeholder:text-muted-foreground/50 resize-none',
        'hover:border-border/70',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'transition-all duration-150',
        'dark:bg-secondary/60',
        error && 'border-destructive/60 focus-visible:ring-destructive/30',
        className
      )}
      ref={ref}
      aria-invalid={error}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'

export { Textarea }
