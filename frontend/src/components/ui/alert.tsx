import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-xl border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-3.5 [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default:     'bg-[#444f57] border-[#4d5860] text-[#f0ede8]',
        destructive: 'bg-[rgba(255,107,107,0.10)] border-[rgba(255,107,107,0.25)] text-[#ff8f8f] [&>svg]:text-[#ff6b6b]',
        warning:     'bg-[rgba(251,191,36,0.10)] border-[rgba(251,191,36,0.25)] text-[#fbbf24] [&>svg]:text-[#fbbf24]',
        success:     'bg-[rgba(110,231,183,0.10)] border-[rgba(110,231,183,0.25)] text-[#6ee7b7] [&>svg]:text-[#6ee7b7]',
        info:        'bg-[rgba(109,123,141,0.15)] border-[rgba(109,123,141,0.30)] text-[#9fb3c8] [&>svg]:text-[#6D7B8D]',
        highlight:   'bg-[rgba(255,208,183,0.10)] border-[rgba(255,208,183,0.22)] text-[#ffd0b7] [&>svg]:text-[#ffd0b7]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
))
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn('mb-1 font-semibold leading-none tracking-tight', className)} {...props} />
  )
)
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm leading-relaxed [&_p]:leading-relaxed', className)} {...props} />
  )
)
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
