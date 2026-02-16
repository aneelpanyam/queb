'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Activity {
  name: string
  description: string
}

interface ActivityCategoryGroup {
  category: string
  activities: Activity[]
}

interface ActivitySelectorProps {
  categories: ActivityCategoryGroup[]
  selectedActivity: string | null
  onSelect: (activity: string) => void
  isLoading: boolean
  expandedCategories?: Set<string>
  onExpandedCategoriesChange?: (expanded: Set<string>) => void
}

export function ActivitySelector({
  categories,
  selectedActivity,
  onSelect,
  isLoading,
  expandedCategories: externalExpandedCategories,
  onExpandedCategoriesChange,
}: ActivitySelectorProps) {
  const [internalExpandedCategories, setInternalExpandedCategories] = useState<Set<string>>(
    () => new Set(categories.map((c) => c.category))
  )
  
  const expandedCategories = externalExpandedCategories ?? internalExpandedCategories
  const setExpandedCategories = onExpandedCategoriesChange ?? setInternalExpandedCategories

  const toggleCategory = (category: string) => {
    const next = new Set(expandedCategories)
    if (next.has(category)) {
      next.delete(category)
    } else {
      next.add(category)
    }
    setExpandedCategories(next)
  }
  
  // Initialize external state if provided and empty
  useEffect(() => {
    if (externalExpandedCategories !== undefined && externalExpandedCategories.size === 0 && categories.length > 0) {
      const initial = new Set(categories.map((c) => c.category))
      onExpandedCategoriesChange?.(initial)
    }
  }, [categories.length, externalExpandedCategories, onExpandedCategoriesChange])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="mb-3 h-5 w-48" />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div
                  key={j}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  <Skeleton className="mb-1.5 h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (categories.length === 0) return null

  return (
    <div className="space-y-4">
      {categories.map((group) => {
        const isExpanded = expandedCategories.has(group.category)
        const hasSelected = group.activities.some(
          (a) => a.name === selectedActivity
        )

        return (
          <div
            key={group.category}
            className={cn(
              'overflow-hidden rounded-xl border transition-colors',
              hasSelected
                ? 'border-primary/30 bg-primary/[0.02]'
                : 'border-border bg-card'
            )}
          >
            <button
              onClick={() => toggleCategory(group.category)}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    hasSelected ? 'bg-primary' : 'bg-muted-foreground/40'
                  )}
                />
                <h3 className="text-sm font-semibold text-foreground">
                  {group.category}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {group.activities.length} activities
                </span>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  isExpanded && 'rotate-180'
                )}
              />
            </button>

            {isExpanded && (
              <div className="grid grid-cols-1 gap-2 px-4 pb-4 sm:grid-cols-2">
                {group.activities.map((activity) => {
                  const isSelected = selectedActivity === activity.name
                  return (
                    <button
                      key={activity.name}
                      onClick={() => onSelect(activity.name)}
                      className={cn(
                        'group flex items-start gap-2.5 rounded-lg border p-3 text-left transition-all duration-200',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                          : 'border-transparent bg-muted/30 hover:border-primary/30 hover:bg-muted/60'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={cn(
                              'text-sm font-medium transition-colors',
                              isSelected
                                ? 'text-primary'
                                : 'text-foreground'
                            )}
                          >
                            {activity.name}
                          </p>
                          <ArrowRight
                            className={cn(
                              'h-3 w-3 shrink-0 transition-all',
                              isSelected
                                ? 'translate-x-0 text-primary opacity-100'
                                : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:text-muted-foreground group-hover:opacity-100'
                            )}
                          />
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-foreground/70">
                          {activity.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
