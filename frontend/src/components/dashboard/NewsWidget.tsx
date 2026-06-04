import React from 'react'
import { ExternalLink } from 'lucide-react'
import { SkeletonText } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import type { NewsArticle } from '@/types'

/* ═══════════════════════════════════════════════════════════════════════════
   NewsWidget — Premium news feed
   Clean article rows with sentiment tagging and source attribution
═══════════════════════════════════════════════════════════════════════════ */

function relTime(s: string) {
  const diff = Date.now() - new Date(s).getTime()
  const h    = Math.floor(diff / 3_600_000)
  if (h < 1)  return `${Math.floor(diff / 60_000)}m ago`
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function getSentiment(title: string): 'bullish' | 'bearish' | 'neutral' {
  const t = title.toLowerCase()
  if (/surges|rally|record|beat|growth|jumps|high|optimism|strong/.test(t)) return 'bullish'
  if (/falls|drops|decline|concern|fears|weak|loss|crash|below/.test(t))     return 'bearish'
  return 'neutral'
}

const SENTIMENT: Record<string, string> = {
  bullish: 'bg-[var(--success-subtle)] text-[var(--success-bright)] border-[var(--success-border)]',
  bearish: 'bg-[var(--danger-subtle)]  text-[var(--danger-bright)]  border-[var(--danger-border)]',
  neutral: 'bg-[var(--warning-subtle)] text-[var(--warning-bright)] border-[var(--warning-border)]',
}

interface NewsWidgetProps { articles?: NewsArticle[]; loading?: boolean }

export function NewsWidget({ articles = [], loading }: NewsWidgetProps) {
  return (
    <div
      className="rounded-xl bg-[var(--bg-2)] border border-[var(--border-2)] overflow-hidden h-full"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-1)]">
        <p className="text-[13px] font-semibold text-[var(--text-1)]">Market News</p>
      </div>

      {/* Articles */}
      <div>
        {loading ? (
          <div className="p-5 space-y-5">
            {[...Array(4)].map((_, i) => <SkeletonText key={i} lines={3} />)}
          </div>
        ) : (
          articles.slice(0, 5).map((a, i) => {
            const sentiment = getSentiment(a.title)
            const isLast    = i === Math.min(articles.length, 5) - 1

            return (
              <a
                key={i}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'group flex flex-col gap-1.5 px-5 py-3.5',
                  'hover:bg-[var(--bg-3)] transition-colors duration-100',
                  !isLast && 'border-b border-[var(--border-1)]'
                )}
              >
                {/* Title */}
                <p className={cn(
                  'text-[12px] text-[var(--text-2)] leading-snug line-clamp-2',
                  'group-hover:text-[var(--text-1)] transition-colors'
                )}>
                  {a.title}
                </p>

                {/* Meta row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {a.source && (
                    <span className="text-[10px] font-medium text-[var(--text-3)] bg-[var(--bg-4)] border border-[var(--border-2)] px-1.5 py-0.5 rounded">
                      {a.source}
                    </span>
                  )}
                  {a.publishedAt && (
                    <span className="text-[10px] text-[var(--text-3)]">
                      {relTime(a.publishedAt)}
                    </span>
                  )}
                  <span className={cn(
                    'ml-auto text-[10px] font-semibold rounded px-1.5 py-0.5 border capitalize',
                    SENTIMENT[sentiment]
                  )}>
                    {sentiment}
                  </span>
                  <ExternalLink className="h-3 w-3 text-[var(--text-4)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            )
          })
        )}
      </div>
    </div>
  )
}
