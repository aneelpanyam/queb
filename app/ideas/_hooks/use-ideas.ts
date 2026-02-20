'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { ideaStorage } from '@/lib/idea-storage'
import { downloadJson, buildFilename, openFilePicker, readJsonFile, type ExportBundle } from '@/lib/export-import'
import { getFrameworkDef, type Idea } from '@/lib/idea-types'

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null)

  const reload = useCallback(() => setIdeas(ideaStorage.getAll()), [])

  useEffect(() => { reload() }, [reload])

  const handleDelete = (id: string) => {
    ideaStorage.remove(id)
    if (expandedIdeaId === id) setExpandedIdeaId(null)
    reload()
    toast.success('Idea deleted')
  }

  const handleUpdateIdea = (id: string, updates: Partial<Omit<Idea, 'id' | 'createdAt'>>) => {
    ideaStorage.update(id, updates)
    reload()
  }

  const createIdea = (title: string, framework: Idea['framework']) => {
    const fw = getFrameworkDef(framework)
    const frameworkData: Record<string, string> = {}
    for (const f of fw.fields) frameworkData[f.key] = ''
    ideaStorage.save({
      title: title.trim(),
      status: 'spark',
      framework,
      frameworkData,
      suggestedOutputTypes: [],
      tags: [],
      notes: '',
    })
    reload()
  }

  const handleExportAll = () => {
    if (ideas.length === 0) return
    const bundle: ExportBundle<Idea> = { version: 1, type: 'ideas', exportedAt: new Date().toISOString(), items: ideas }
    downloadJson(bundle, buildFilename('ideas', ideas.length))
    toast.success(`Exported ${ideas.length} idea${ideas.length !== 1 ? 's' : ''}`)
  }

  const handleImport = async () => {
    const file = await openFilePicker()
    if (!file) return
    try {
      const bundle = await readJsonFile<Idea>(file)
      if (bundle.type !== 'ideas') {
        toast.error('Invalid file: expected an ideas export')
        return
      }
      let imported = 0, skipped = 0
      const existing = new Set(ideaStorage.getAll().map((i) => i.id))
      for (const item of bundle.items) {
        if (existing.has(item.id)) { skipped++; continue }
        ideaStorage.save({ ...item })
        imported++
      }
      reload()
      if (imported > 0) toast.success(`Imported ${imported} idea${imported !== 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} skipped)` : ''}`)
      else toast.error('No new ideas found in the file')
    } catch {
      toast.error('Failed to read import file')
    }
  }

  return {
    ideas,
    reload,
    expandedIdeaId,
    setExpandedIdeaId,
    handleDelete,
    handleUpdateIdea,
    createIdea,
    handleExportAll,
    handleImport,
  }
}
