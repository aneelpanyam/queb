'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { aiFetch } from '@/lib/ai-fetch'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Layers, Loader2, Microscope } from 'lucide-react'
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

import type { DissectionData } from '@/lib/product-types'

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
  context: Record<string, string>
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
  const [hiddenDissections, setHiddenDissections] = useState<Set<string>>(new Set())

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
      const data = await aiFetch('/api/dissect-question', {
          question: displayQuestion,
          perspective: perspective.perspectiveName,
          context,
        }, { action: 'Dissect Question' })
      onDissectionUpdate(key, data)
      // Ensure the dissection is shown when newly generated
      setHiddenDissections(prev => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
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
      const data = await aiFetch('/api/generate-deeper-questions', {
          originalQuestion: question.question,
          perspective: perspective.perspectiveName,
          context,
        }, { action: 'Go Deeper' })
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
    <div className="flex h-full max-h-[640px] flex-col overflow-y-auto bg-background">
      <div className="mx-auto w-full space-y-5 px-6 py-4 pb-6">
        {/* Perspective badge & description */}
        <div className="space-y-5">
          <div>
            <div className="mb-2.5 inline-block rounded-md bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary">
              {perspective.perspectiveName}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {perspective.perspectiveDescription}
            </p>
          </div>

          {/* Question / title */}
          <h2 className="text-[16px] font-bold leading-tight tracking-tight text-foreground">
            {displayQuestion}
          </h2>
        </div>

        {/* Why This Matters card */}
        {selectedNode.type === 'question' && question?.relevance && (
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">
              Why This Matters
            </div>
            <p className="text-[14.5px] leading-relaxed text-foreground">
              {question.relevance}
            </p>
          </div>
        )}

        {/* How to Find the Answer card */}
        {selectedNode.type === 'question' && question?.infoPrompt && (
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">
              How to Find the Answer
            </div>
            <p className="text-[14.5px] leading-relaxed text-foreground">
              {question.infoPrompt}
            </p>
          </div>
        )}

        {/* Context & reasoning for 2nd/3rd order */}
        {displayReasoning && (
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">
              Context & Reasoning
            </div>
            <p className="text-[14.5px] leading-relaxed text-foreground">
              {displayReasoning}
            </p>
          </div>
        )}

        {/* Actions: Dissect (all types), Go deeper (main only) */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (dissection && !dissectionLoading) {
                // Toggle visibility instead of deleting data
                setHiddenDissections(prev => {
                  const next = new Set(prev)
                  if (next.has(key)) {
                    next.delete(key)
                  } else {
                    next.add(key)
                  }
                  return next
                })
              } else {
                handleDissect()
              }
            }}
            disabled={dissectionLoading}
            className={cn(
              'gap-2',
              dissection && !hiddenDissections.has(key) && 'border-primary/50 bg-primary/5 text-primary'
            )}
          >
            {dissectionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Microscope className="h-4 w-4" />
            )}
            {dissectionLoading
              ? 'Generating...'
              : dissection && !hiddenDissections.has(key)
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
                'gap-2',
                deeper && 'border-primary/50 bg-primary/5 text-primary'
              )}
            >
              {deeperLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Layers className="h-4 w-4" />
              )}
              {deeperLoading
                ? 'Thinking deeper...'
                : deeper
                  ? 'Deeper questions loaded'
                  : 'Go deeper'}
            </Button>
          )}
        </div>

        {/* Deep dive content */}
        {(dissectionLoading || (dissection && !hiddenDissections.has(key))) && (
          <div className="mt-10 space-y-8">
            {dissectionLoading && !dissection && (
              <div className="space-y-4">
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            )}
            {dissection && !hiddenDissections.has(key) && <QuestionDissection data={dissection} />}
          </div>
        )}

        {/* Deeper questions summary (when main question has deeper loaded) */}
        {selectedNode.type === 'question' && deeper && (
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Deeper Questions</h3>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Second and third order questions were generated. Select any from the left sidebar to view its context and run a deep dive.
            </p>
            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-xs font-semibold text-primary">
                  2nd-order ({deeper.secondOrder.length})
                </p>
                <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                  {deeper.secondOrder.slice(0, 3).map((dq, i) => (
                    <li key={i} className="line-clamp-1">
                      {dq.question}
                    </li>
                  ))}
                  {deeper.secondOrder.length > 3 && (
                    <li>+{deeper.secondOrder.length - 3} more in sidebar</li>
                  )}
                </ul>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold text-primary">
                  3rd-order ({deeper.thirdOrder.length})
                </p>
                <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
