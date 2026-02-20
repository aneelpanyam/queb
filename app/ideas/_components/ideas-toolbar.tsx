'use client'

import {
  FRAMEWORK_DEFINITIONS,
  IDEA_STATUSES,
  type IdeaStatus,
  type IdeaFramework,
} from '@/lib/idea-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  LayoutGrid,
  SlidersHorizontal,
  Download,
  Upload,
} from 'lucide-react'
import type { GroupBy, SortBy } from '../_lib/ideas-utils'

interface IdeasToolbarProps {
  ideasCount: number
  filteredCount: number
  hasFilters: boolean
  search: string
  onSearchChange: (v: string) => void
  statusFilter: IdeaStatus | 'all'
  onStatusFilterChange: (v: IdeaStatus | 'all') => void
  frameworkFilter: IdeaFramework | 'all'
  onFrameworkFilterChange: (v: IdeaFramework | 'all') => void
  groupBy: GroupBy
  onGroupByChange: (v: GroupBy) => void
  sortBy: SortBy
  onSortByChange: (v: SortBy) => void
  onClearFilters: () => void
  onExportAll: () => void
  onImport: () => void
}

export function IdeasToolbar({
  ideasCount, filteredCount, hasFilters,
  search, onSearchChange,
  statusFilter, onStatusFilterChange,
  frameworkFilter, onFrameworkFilterChange,
  groupBy, onGroupByChange,
  sortBy, onSortByChange,
  onClearFilters,
  onExportAll, onImport,
}: IdeasToolbarProps) {
  if (ideasCount === 0) return null

  return (
    <>
      {/* Export/Import */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onImport} className="h-8 gap-1.5 text-xs">
          <Upload className="h-3.5 w-3.5" /> Import
        </Button>
        <Button variant="outline" size="sm" onClick={onExportAll} className="h-8 gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" /> Export All
        </Button>
      </div>

      {/* Filter & Group Bar */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search ideas..."
              className="h-8 pl-8 text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as IdeaStatus | 'all')}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All statuses</option>
            {IDEA_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            value={frameworkFilter}
            onChange={(e) => onFrameworkFilterChange(e.target.value as IdeaFramework | 'all')}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All frameworks</option>
            {FRAMEWORK_DEFINITIONS.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>

          <div className="h-5 w-px bg-border" />

          <div className="flex items-center gap-1.5">
            <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={groupBy}
              onChange={(e) => onGroupByChange(e.target.value as GroupBy)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="none">No grouping</option>
              <option value="status">Group by status</option>
              <option value="framework">Group by framework</option>
              <option value="tag">Group by tag</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as SortBy)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="updated">Last updated</option>
              <option value="created">Date created</option>
              <option value="rating">Rating</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="h-8 rounded-md px-2 text-xs font-medium text-primary hover:bg-primary/10"
            >
              Clear filters
            </button>
          )}
        </div>
        {hasFilters && (
          <p className="text-xs text-muted-foreground">
            Showing {filteredCount} of {ideasCount} idea{ideasCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </>
  )
}
