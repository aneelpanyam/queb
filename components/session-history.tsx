'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { SavedSession } from '@/lib/session-storage'
import {
  Clock,
  Trash2,
  ChevronRight,
  FolderOpen,
  Search,
  Building2,
  Briefcase,
  User,
  Target,
} from 'lucide-react'

interface SessionHistoryProps {
  sessions: SavedSession[]
  onLoad: (session: SavedSession) => void
  onDelete: (id: string) => void
  onBack: () => void
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

export function SessionHistory({
  sessions,
  onLoad,
  onDelete,
  onBack,
}: SessionHistoryProps) {
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = sessions.filter((s) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      s.industry.toLowerCase().includes(q) ||
      s.service.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.activity.toLowerCase().includes(q) ||
      s.situation.toLowerCase().includes(q)
    )
  })

  const totalQuestions = (s: SavedSession) =>
    s.perspectives.reduce((sum, p) => sum + (p.questions?.length || 0), 0)

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          No saved sessions yet
        </h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Complete a question generation flow and save it to see it here.
        </p>
        <Button variant="outline" onClick={onBack} className="mt-6 gap-2">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to Question Book
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search sessions by industry, role, activity..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Session Count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} of {sessions.length} session{sessions.length !== 1 ? 's' : ''}
      </p>

      {/* Session Cards */}
      <div className="space-y-3">
        {filtered.map((session) => (
          <div
            key={session.id}
            className="group rounded-lg border border-border bg-card transition-colors hover:border-primary/30"
          >
            <button
              onClick={() => onLoad(session)}
              className="w-full p-4 text-left"
            >
              {/* Top row: meta chips */}
              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  {session.industry}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  <Briefcase className="h-3 w-3" />
                  {session.service}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  <User className="h-3 w-3" />
                  {session.role}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                  <Target className="h-3 w-3" />
                  {session.activity}
                </span>
              </div>

              {/* Situation preview */}
              <p className="line-clamp-2 text-sm leading-relaxed text-foreground/80">
                {session.situation}
              </p>

              {/* Bottom row: stats */}
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(session.createdAt)}
                </span>
                <span>
                  {session.perspectives.length} perspectives
                </span>
                <span>{totalQuestions(session)} questions</span>
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </button>

            {/* Delete button */}
            <div className="border-t border-border/50 px-4 py-2">
              {confirmDelete === session.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-destructive">Delete this session?</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(session.id)
                      setConfirmDelete(null)
                    }}
                  >
                    Yes, delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      setConfirmDelete(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setConfirmDelete(session.id)
                  }}
                  className={cn(
                    'flex items-center gap-1.5 text-xs text-muted-foreground/60 transition-colors hover:text-destructive',
                    'opacity-0 group-hover:opacity-100'
                  )}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && search.trim() && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No sessions match &ldquo;{search}&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}
