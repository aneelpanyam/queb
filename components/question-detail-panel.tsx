'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Lightbulb,
  Search,
  ChevronDown,
  ChevronUp,
  Layers,
  Loader2,
  Microscope,
  Info,
  AlertTriangle,
} from 'lucide-react'
import { QuestionDissection } from '@/components/question-dissection'
import type { SelectedNode } from '@/components/questions-tree-nav'

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

/** Decision Explorer-style card: icon + title + content */
function DeepDiveCard({
  icon: Icon,
  iconClassName,
  title,
  children,
  className,
}: {
  icon: typeof Info
  iconClassName?: string
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 shadow-sm',
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            iconClassName ?? 'bg-primary/10 text-primary'
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="text-sm text-foreground/90">{children}</div>
    </div>
  )
}

function dissectionKey(node: SelectedNode): string {
  switch (node.type) {
    case 'question':
      return `${node.pIndex}-${node.qIndex}`
    case 'second':
      return `${node.pIndex}-${node.qIndex}-2-${node.index}`
    case 'third':
      return `${node.pIndex}-${node.qIndex}-3-${node.index}`
  }
}

interface QuestionDetailPanelProps {
  selectedNode: SelectedNode | null
  perspectives: Perspective[]
  context: {
    role: string
    activity: string
    situation: string
    industry: string
    service: string
  }
  dissectionMap: Record<string, DissectionData>
  deeperMap: Record<string, DeeperData>
  onDissectionUpdate: (key: string, data: DissectionData | null) => void
  onDeeperUpdate: (pIndex: number, qIndex: number, data: DeeperData) => void
}

export function QuestionDetailPanel({
  selectedNode,
  perspectives,
  context,
  dissectionMap,
  deeperMap,
  onDissectionUpdate,
  onDeeperUpdate,
}: QuestionDetailPanelProps) {
  const [dissectionLoading, setDissectionLoading] = useState(false)
  const [deeperLoading, setDeeperLoading] = useState(false)
  const [showInfoPrompt, setShowInfoPrompt] = useState(false)

  if (!selectedNode || !perspectives.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-border bg-muted/20 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Select a question from the left to view its detail and deep dive.
        </p>
      </div>
    )
  }

  const pIndex = selectedNode.pIndex
  const qIndex = selectedNode.qIndex
  const perspective = perspectives[pIndex]
  if (!perspective) return null

  const questions = perspective.questions ?? []
  const question =
    selectedNode.type === 'question'
      ? questions[qIndex]
      : null
  const deeper = deeperMap[`${pIndex}-${qIndex}`]
  const secondQuestion =
    selectedNode.type === 'second' && deeper
      ? deeper.secondOrder[selectedNode.index]
      : null
  const thirdQuestion =
    selectedNode.type === 'third' && deeper
      ? deeper.thirdOrder[selectedNode.index]
      : null

  if (
    selectedNode.type === 'question' && !question
  ) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No question selected.
        </p>
      </div>
    )
  }
  if (selectedNode.type === 'second' && !secondQuestion) return null
  if (selectedNode.type === 'third' && !thirdQuestion) return null

  const displayQuestion =
    selectedNode.type === 'question'
      ? question?.question
      : selectedNode.type === 'second'
        ? secondQuestion?.question
        : thirdQuestion?.question
  const displayReasoning =
    selectedNode.type === 'second'
      ? secondQuestion?.reasoning
      : selectedNode.type === 'third'
        ? thirdQuestion?.reasoning
        : null

  const key = dissectionKey(selectedNode)
  const dissection = dissectionMap[key]

  const handleDissect = async () => {
    if (!displayQuestion || !perspective) return
    setDissectionLoading(true)
    try {
      const res = await fetch('/api/dissect-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: displayQuestion,
          perspective: perspective.perspectiveName,
          ...context,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'AI generation failed')
      }
      const data = await res.json()
      onDissectionUpdate(key, data)
      toast.success('Deep dive generated')
    } catch (err) {
      toast.error('Failed to generate deep dive', {
        description: err instanceof Error ? err.message : 'Please try again',
      })
    } finally {
      setDissectionLoading(false)
    }
  }

  const handleGoDeeper = async () => {
    if (selectedNode.type !== 'question' || !question) return
    if (deeper) return
    setDeeperLoading(true)
    try {
      const res = await fetch('/api/generate-deeper-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalQuestion: question.question,
          perspective: perspective.perspectiveName,
          ...context,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'AI generation failed')
      }
      const data = await res.json()
      onDeeperUpdate(pIndex, qIndex, data)
      toast.success('Deeper questions generated')
    } catch (err) {
      toast.error('Failed to generate deeper questions', {
        description: err instanceof Error ? err.message : 'Please try again',
      })
    } finally {
      setDeeperLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <div className="space-y-6 p-4">
        {/* Question / title */}
        <div>
          <p className="text-base font-semibold leading-relaxed text-foreground">
            {displayQuestion}
          </p>
          {selectedNode.type === 'question' && question?.relevance && (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-muted/50 p-3">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                {question.relevance}
              </p>
            </div>
          )}
        </div>

        {/* Why this question / Context (for 2nd/3rd or main question info prompt) */}
        {(displayReasoning || (selectedNode.type === 'question' && question?.infoPrompt)) && (
          <DeepDiveCard
            icon={Info}
            iconClassName="bg-blue-500/10 text-blue-600"
            title={
              selectedNode.type === 'question'
                ? 'Why this question matters'
                : 'Context & reasoning'
            }
          >
            {displayReasoning ? (
              <p className="leading-relaxed">{displayReasoning}</p>
            ) : (
              <>
                {question?.infoPrompt && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowInfoPrompt(!showInfoPrompt)}
                      className="flex w-full items-center gap-1.5 text-left text-xs font-medium text-primary"
                    >
                      <Search className="h-3 w-3" />
                      How to find the answer
                      {showInfoPrompt ? (
                        <ChevronUp className="ml-auto h-3 w-3" />
                      ) : (
                        <ChevronDown className="ml-auto h-3 w-3" />
                      )}
                    </button>
                    {showInfoPrompt && (
                      <p className="mt-2 leading-relaxed">{question.infoPrompt}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </DeepDiveCard>
        )}

        {/* Actions: Dissect (all types), Go deeper (main only) */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (dissection && !dissectionLoading) {
                onDissectionUpdate(key, null)
              } else {
                handleDissect()
              }
            }}
            disabled={dissectionLoading}
            className={cn(
              'gap-1.5',
              dissection && 'border-primary/50 bg-primary/5 text-primary'
            )}
          >
            {dissectionLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Microscope className="h-3.5 w-3.5" />
            )}
            {dissectionLoading
              ? 'Generating...'
              : dissection
                ? 'Hide deep dive'
                : 'Deep dive'}
          </Button>
          {selectedNode.type === 'question' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoDeeper}
              disabled={deeperLoading}
              className={cn(
                'gap-1.5',
                deeper && 'border-primary/50 bg-primary/5 text-primary'
              )}
            >
              {deeperLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Layers className="h-3.5 w-3.5" />
              )}
              {deeperLoading
                ? 'Thinking deeper...'
                : deeper
                  ? 'Deeper questions loaded'
                  : 'Go deeper'}
            </Button>
          )}
        </div>

        {/* Deep dive content - Decision Explorer style */}
        {(dissectionLoading || dissection) && (
          <DeepDiveCard
            icon={AlertTriangle}
            iconClassName="bg-amber-500/10 text-amber-600"
            title="Deep dive"
          >
            {dissectionLoading && !dissection && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            )}
            {dissection && <QuestionDissection data={dissection} />}
          </DeepDiveCard>
        )}

        {/* Deeper questions summary (when main question has deeper loaded) */}
        {selectedNode.type === 'question' && deeper && (
          <DeepDiveCard
            icon={Layers}
            iconClassName="bg-primary/10 text-primary"
            title="Deeper questions"
          >
            <p className="mb-3 text-xs text-muted-foreground">
              Second and third order questions are listed in the left sidebar.
              Select any to view its context and run a deep dive.
            </p>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary">
                2nd-order ({deeper.secondOrder.length})
              </p>
              <ul className="list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
                {deeper.secondOrder.slice(0, 3).map((dq, i) => (
                  <li key={i} className="line-clamp-1">
                    {dq.question}
                  </li>
                ))}
                {deeper.secondOrder.length > 3 && (
                  <li>+{deeper.secondOrder.length - 3} more in sidebar</li>
                )}
              </ul>
              <p className="mt-2 text-xs font-semibold text-primary">
                3rd-order ({deeper.thirdOrder.length})
              </p>
              <ul className="list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
                {deeper.thirdOrder.slice(0, 3).map((tq, i) => (
                  <li key={i} className="line-clamp-1">
                    {tq.question}
                  </li>
                ))}
                {deeper.thirdOrder.length > 3 && (
                  <li>+{deeper.thirdOrder.length - 3} more in sidebar</li>
                )}
              </ul>
            </div>
          </DeepDiveCard>
        )}
      </div>
    </div>
  )
}
