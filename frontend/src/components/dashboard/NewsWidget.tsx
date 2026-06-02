import React from 'react'
import { ExternalLink, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import type { NewsArticle } from '@/types'

function relTime(s: string) {
  const diff = Date.now() - new Date(s).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

interface NewsWidgetProps {
  articles?: NewsArticle[]
  loading?: boolean
}

export function NewsWidget({ articles = [], loading }: NewsWidgetProps) {
  return (
    <div className="bg-[#131D2E] border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/50">
        <h3 className="text-sm font-semibold text-white">Market News</h3>
      </div>
      <div className="divide-y divide-slate-700/40">
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
        ) : articles.slice(0, 5).map((a, i) => (
          <a
            key={i}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-5 py-3.5 hover:bg-slate-800/30 transition-colors group"
          >
            <p className="text-sm text-slate-300 font-medium leading-snug group-hover:text-white transition-colors line-clamp-2 mb-1.5">
              {a.title}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {a.source && <span className="font-medium text-slate-400">{a.source}</span>}
              {a.publishedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {relTime(a.publishedAt)}
                </span>
              )}
              <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
