import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }

export function Card({ children, className, hover = false, padding = 'md', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-[#131D2E] border border-slate-700/50 rounded-xl',
        hover && 'hover:border-slate-600 transition-colors duration-200',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-sm font-semibold text-white', className)} {...props}>
      {children}
    </h3>
  )
}
