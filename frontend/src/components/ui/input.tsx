import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-lg border border-border bg-white px-3 py-1 text-sm text-foreground',
        'placeholder:text-muted-foreground/50',
        'hover:border-border/70',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-secondary',
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
Input.displayName = 'Input'

export { Input }
