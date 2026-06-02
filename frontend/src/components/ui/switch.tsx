import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-[#4d5860] transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd0b7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#3b444b]',
      'disabled:cursor-not-allowed disabled:opacity-40',
      'data-[state=checked]:bg-[#ffd0b7] data-[state=checked]:border-[#ffd0b7]',
      'data-[state=unchecked]:bg-[#444f57]',
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block h-3.5 w-3.5 rounded-full shadow-md ring-0 transition-transform',
        'data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-0.5',
        'data-[state=checked]:bg-[#3b2a1e] data-[state=unchecked]:bg-[#6D7B8D]'
      )}
    />
  </SwitchPrimitive.Root>
))
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }
