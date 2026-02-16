'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Loader2, Download } from 'lucide-react'
import { QuestionsTreeNav, type SelectedNode } from '@/components/questions-tree-nav'
import { QuestionDetailPanel } from '@/components/question-detail-panel'

interface DeeperQuestion {
  question: string
  reasoning: string
}

interface DeeperData {
  secondOrder: DeeperQuestion[]
  thirdOrder: DeeperQuestion[]
}

interface DissectionData {
  thinkingFramework: { step: number; title: string; description: string }[]
  checklist: { item: string; description: string; isRequired: boolean }[]
  resources: { title: string; type: string; url: string; description: string }[]
  keyInsight: string
}

interface Question {
  question: string
  relevance: string
  infoPrompt: string
}

interface Perspective {
  perspectiveName: string
  perspectiveDescription: string
  questions: Question[]
}

interface QuestionsViewProps {
  perspectives: Perspective[]
  isLoading: boolean
  context: {
    role: string
    activity: string
    situation: string
    industry: string
    service: string
  }
  initialDissections?: Record<string, DissectionData>
  initialDeeperQuestions?: Record<string, DeeperData>
  onDissectionUpdate?: (
    perspectiveIndex: number,
    questionIndex: number,
    data: DissectionData | null
  ) => void
  onDeeperUpdate?: (
    perspectiveIndex: number,
    questionIndex: number,
    data: DeeperData
  ) => void
  onExportSite?: () => void
  exportLoading?: boolean
}

export function QuestionsView({
  perspectives,
  isLoading,
  context,
  initialDissections,
  initialDeeperQuestions,
  onDissectionUpdate,
  onDeeperUpdate,
  onExportSite,
  exportLoading,
}: QuestionsViewProps) {
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null)
  const [dissectionMap, setDissectionMap] = useState<
    Record<string, DissectionData>
  >(initialDissections || {})
  const [deeperMap, setDeeperMap] = useState<Record<string, DeeperData>>(
    initialDeeperQuestions || {}
  )
  const [expandedPerspectives, setExpandedPerspectives] = useState<Set<number>>(
    () => new Set()
  )
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    () => new Set()
  )

  // Update maps when initial values change (e.g., when loading a session)
  useEffect(() => {
    if (initialDissections) {
      setDissectionMap(initialDissections)
    }
  }, [initialDissections])

  useEffect(() => {
    if (initialDeeperQuestions) {
      setDeeperMap(initialDeeperQuestions)
    }
  }, [initialDeeperQuestions])

  useEffect(() => {
    if (perspectives.length > 0 && expandedPerspectives.size === 0) {
      setExpandedPerspectives(new Set([0]))
      /*setExpandedPerspectives(
        new Set(perspectives.map((_, i) => i))
      )*/
    }
  }, [perspectives, expandedPerspectives.size])

  useEffect(() => {
    if (perspectives.length > 0 && selectedNode === null) {
      for (let p = 0; p < perspectives.length; p++) {
        const qs = perspectives[p].questions ?? []
        if (qs.length > 0) {
          setSelectedNode({ type: 'question', pIndex: p, qIndex: 0 })
          return
        }
      }
    }
  }, [perspectives.length, selectedNode])

  const handleDissectionUpdate = (key: string, data: DissectionData | null) => {
    if (data) {
      setDissectionMap((prev) => ({ ...prev, [key]: data }))
      const match = key.match(/^(\d+)-(\d+)$/)
      if (match && onDissectionUpdate) {
        onDissectionUpdate(Number(match[1]), Number(match[2]), data)
      }
    } else {
      setDissectionMap((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      // Notify parent when removing (for persistence)
      const match = key.match(/^(\d+)-(\d+)$/)
      if (match && onDissectionUpdate) {
        onDissectionUpdate(Number(match[1]), Number(match[2]), null)
      }
    }
  }

  const handleDeeperUpdate = (pIndex: number, qIndex: number, data: DeeperData) => {
    setDeeperMap((prev) => ({ ...prev, [`${pIndex}-${qIndex}`]: data }))
    onDeeperUpdate?.(pIndex, qIndex, data)
  }

  const togglePerspective = (pIndex: number) => {
    setExpandedPerspectives((prev) => {
      const next = new Set(prev)
      if (next.has(pIndex)) next.delete(pIndex)
      else next.add(pIndex)
      return next
    })
  }

  const toggleQuestion = (key: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  if (isLoading && perspectives.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <Skeleton className="mb-1 h-5 w-40" />
                <Skeleton className="h-3 w-60" />
              </div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="rounded-md bg-muted/50 p-3">
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Export Bar */}
      {perspectives.length > 0 && onExportSite && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Export as Website
            </p>
            <p className="text-xs text-muted-foreground">
              Download a standalone HTML file with all questions, dissections, and deeper thinking included
            </p>
          </div>
          <Button
            onClick={onExportSite}
            disabled={exportLoading}
            size="sm"
            className="gap-2"
          >
            {exportLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {exportLoading ? 'Generating...' : 'Download HTML'}
          </Button>
        </div>
      )}

      {/* Two-column: Tree nav + Detail */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:overflow-hidden">
        <QuestionsTreeNav
          perspectives={perspectives}
          deeperMap={deeperMap}
          selectedNode={selectedNode}
          onSelect={setSelectedNode}
          expandedPerspectives={expandedPerspectives}
          onTogglePerspective={togglePerspective}
          expandedQuestions={expandedQuestions}
          onToggleQuestion={toggleQuestion}
        />
        <div className="min-h-0 flex-1 overflow-hidden border border-border bg-card lg:min-w-0">
          <QuestionDetailPanel
            selectedNode={selectedNode}
            perspectives={perspectives}
            context={context}
            dissectionMap={dissectionMap}
            deeperMap={deeperMap}
            onDissectionUpdate={handleDissectionUpdate}
            onDeeperUpdate={handleDeeperUpdate}
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading more perspectives...
        </div>
      )}
    </div>
  )
}
