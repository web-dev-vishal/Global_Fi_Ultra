import React from 'react'
import { Search, X } from 'lucide-react'

interface UserSearchProps { value: string; onChange: (v: string) => void }

export function UserSearch({ value, onChange }: UserSearchProps) {
  return (
    <div className="relative w-full max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search by name or email…"
        className="w-full h-9 pl-9 pr-8 bg-slate-800/60 border border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:outline-none rounded-lg text-sm text-white placeholder:text-slate-500 transition-colors"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
