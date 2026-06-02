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
        'flex h-9 w-full rounded-lg border bg-[#444f57] px-3 py-1 text-sm text-[#f0ede8]',
        'border-[#4d5860] placeholder:text-[#6D7B8D]',
        'hover:border-[#5d6870]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,208,183,0.35)] focus-visible:border-[rgba(255,208,183,0.5)]',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'transition-all duration-150',
        error && 'border-[#ff6b6b] focus-visible:ring-[rgba(255,107,107,0.3)]',
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
