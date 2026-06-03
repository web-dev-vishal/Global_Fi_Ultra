import React from 'react'
import { ExternalLink, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import type { NewsArticle } from '@/types'

function relTime(s: string) {
  const diff = Date.now() - new Date(s).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function getSentiment(title: string): 'bullish' | 'bearish' | 'neutral' {
  const t = title.toLowerCase()
  if (/surges|rally|record|beat|growth|jumps|high|optimism|strong/.test(t)) return 'bullish'
  if (/falls|drops|decline|concern|fears|weak|loss|crash|below/.test(t)) return 'bearish'
  return 'neutral'
}

// Sentiment badge styles per spec
const SENTIMENT_STYLES: Record<string, string> = {
  bullish: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  bearish: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
  neutral: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
}

interface NewsWidgetProps {
  articles?: NewsArticle[]
  loading?: boolean
}

export function NewsWidget({ articles = [], loading }: NewsWidgetProps) {
  return (
    /* Level 2 card */
    <div className="bg-white dark:bg-[#131D2E] border border-slate-200/80 dark:border-[var(--border)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-1)]">Market News</h3>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {loading ? (
          <div className="p-5 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : articles.slice(0, 5).map((a, i) => {
          const sentiment = getSentiment(a.title)
          return (
            <a
              key={i}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-5 py-3.5 group border-l-2 border-l-transparent hover:border-l-blue-500 hover:pl-[18px] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-150"
            >
              <p className="text-sm text-[var(--text-2)] font-medium leading-snug group-hover:text-[var(--text-1)] transition-colors line-clamp-2 mb-1.5">
                {a.title}
              </p>
              <div className="flex items-center flex-wrap gap-1.5">
                {a.source && (
                  <span className="bg-slate-100 dark:bg-slate-800 text-[var(--text-3)] text-[10px] rounded px-1.5 py-0.5">
                    {a.source}
                  </span>
                )}
                {a.publishedAt && (
                  <span className="flex items-center gap-1 text-[var(--text-3)] text-[11px]">
                    <Clock className="h-3 w-3" />
                    {relTime(a.publishedAt)}
                  </span>
                )}
                <span className={cn('ml-auto text-[10px] rounded-full px-2 py-0.5 font-medium capitalize', SENTIMENT_STYLES[sentiment])}>
                  {sentiment}
                </span>
                <ExternalLink className="h-3 w-3 text-[var(--text-3)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
