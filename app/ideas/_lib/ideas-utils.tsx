'use client'

import {
  Star,
  Lightbulb,
  Target,
  Briefcase,
  Gift,
  PenLine,
  LayoutGridIcon,
} from 'lucide-react'

export type GroupBy = 'none' | 'status' | 'framework' | 'tag'
export type SortBy = 'updated' | 'created' | 'rating' | 'name'

export function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(dateStr).toLocaleDateString()
}

export const FRAMEWORK_ICONS: Record<string, React.ElementType> = {
  Target, Briefcase, Gift, LayoutGrid: LayoutGridIcon, PenLine,
}

export function FrameworkIcon({ iconName, className }: { iconName: string; className?: string }) {
  const Icon = FRAMEWORK_ICONS[iconName] || Lightbulb
  return <Icon className={className} />
}

export function StarRating({ value, onChange }: { value?: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? 0 : n)}
          className="p-0.5 transition-colors"
        >
          <Star
            className={`h-4 w-4 ${n <= (value || 0) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
          />
        </button>
      ))}
    </div>
  )
}
