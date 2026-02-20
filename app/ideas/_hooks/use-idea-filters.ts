'use client'

import { useState, useMemo } from 'react'
import {
  FRAMEWORK_DEFINITIONS,
  IDEA_STATUSES,
  getFrameworkDef,
  type Idea,
  type IdeaStatus,
  type IdeaFramework,
} from '@/lib/idea-types'
import type { GroupBy, SortBy } from '../_lib/ideas-utils'

export function useIdeaFilters(ideas: Idea[]) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'all'>('all')
  const [frameworkFilter, setFrameworkFilter] = useState<IdeaFramework | 'all'>('all')
  const [groupBy, setGroupBy] = useState<GroupBy>('none')
  const [sortBy, setSortBy] = useState<SortBy>('updated')
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    let result = [...ideas]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          Object.values(i.frameworkData).some((v) => v.toLowerCase().includes(q)) ||
          i.tags.some((t) => t.toLowerCase().includes(q)) ||
          i.notes.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') result = result.filter((i) => i.status === statusFilter)
    if (frameworkFilter !== 'all') result = result.filter((i) => i.framework === frameworkFilter)
    return result
  }, [ideas, search, statusFilter, frameworkFilter])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    switch (sortBy) {
      case 'updated':
        return arr.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      case 'created':
        return arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      case 'rating':
        return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'name':
        return arr.sort((a, b) => a.title.localeCompare(b.title))
      default:
        return arr
    }
  }, [filtered, sortBy])

  const grouped = useMemo(() => {
    if (groupBy === 'none') return { '': sorted }
    const map: Record<string, Idea[]> = {}
    for (const idea of sorted) {
      let key = ''
      if (groupBy === 'status') key = IDEA_STATUSES.find((s) => s.value === idea.status)?.label || idea.status
      else if (groupBy === 'framework') key = getFrameworkDef(idea.framework).name
      else if (groupBy === 'tag') {
        if (idea.tags.length === 0) key = 'Untagged'
        for (const tag of idea.tags.length > 0 ? idea.tags : ['Untagged']) {
          if (!map[tag]) map[tag] = []
          map[tag].push(idea)
        }
        continue
      }
      if (!map[key]) map[key] = []
      map[key].push(idea)
    }
    return map
  }, [sorted, groupBy])

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const hasFilters = !!(search || statusFilter !== 'all' || frameworkFilter !== 'all')

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setFrameworkFilter('all')
  }

  const handleSetGroupBy = (v: GroupBy) => {
    setGroupBy(v)
    setCollapsedGroups(new Set())
  }

  return {
    search, setSearch,
    statusFilter, setStatusFilter,
    frameworkFilter, setFrameworkFilter,
    groupBy, setGroupBy: handleSetGroupBy,
    sortBy, setSortBy,
    collapsedGroups,
    filtered,
    sorted,
    grouped,
    toggleGroup,
    hasFilters,
    clearFilters,
  }
}
