import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  value: number | undefined | null,
  currency = 'USD',
  compact = false
): string {
  if (value === undefined || value === null || isNaN(value)) return '—'
  const opts: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }
  if (compact && Math.abs(value) >= 1_000_000) {
    opts.notation = 'compact'
    opts.maximumFractionDigits = 1
  }
  return new Intl.NumberFormat('en-US', opts).format(value)
}

export function formatNumber(value: number | undefined | null, decimals = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatCompact(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatPercent(value: number | undefined | null, decimals = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

export function formatDate(dateStr: string | undefined | null, options?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return '—'
  try {
    return new Intl.DateTimeFormat('en-US', options ?? {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return '—'
  }
}

export function formatRelativeTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '—'
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateStr)
  } catch {
    return '—'
  }
}

export function getPriceChangeColor(change: number | undefined | null): string {
  if (change === undefined || change === null) return 'text-muted-foreground'
  if (change > 0) return 'text-emerald-500'
  if (change < 0) return 'text-red-500'
  return 'text-muted-foreground'
}

export function getPriceChangeBg(change: number | undefined | null): string {
  if (change === undefined || change === null) return 'bg-muted'
  if (change > 0) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
  if (change < 0) return 'bg-red-500/10 text-red-600 dark:text-red-400'
  return 'bg-muted text-muted-foreground'
}

export function getSentimentColor(sentiment: string): string {
  switch (sentiment?.toLowerCase()) {
    case 'bullish':
    case 'positive':
      return 'text-emerald-500'
    case 'bearish':
    case 'negative':
      return 'text-red-500'
    default:
      return 'text-yellow-500'
  }
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '…'
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function getAssetTypeIcon(type: string): string {
  switch (type) {
    case 'stock': return '📈'
    case 'crypto': return '₿'
    case 'forex': return '💱'
    case 'commodity': return '🏅'
    case 'index': return '📊'
    default: return '💹'
  }
}

export function getAssetTypeBadgeColor(type: string): string {
  switch (type) {
    case 'stock': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    case 'crypto': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
    case 'forex': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
    case 'commodity': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
    case 'index': return 'bg-green-500/10 text-green-600 dark:text-green-400'
    default: return 'bg-muted text-muted-foreground'
  }
}
