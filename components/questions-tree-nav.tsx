'use client'

import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight } from 'lucide-react'

export interface DeeperQuestion {
  question: string
  reasoning: string
}

export interface DeeperData {
  secondOrder: DeeperQuestion[]
  thirdOrder: DeeperQuestion[]
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

export type SelectedNode =
  | { type: 'question'; pIndex: number; qIndex: number }
  | { type: 'second'; pIndex: number; qIndex: number; index: number }
  | { type: 'third'; pIndex: number; qIndex: number; index: number }

interface QuestionsTreeNavProps {
  perspectives: Perspective[]
  deeperMap: Record<string, DeeperData>
  selectedNode: SelectedNode | null
  onSelect: (node: SelectedNode) => void
  expandedPerspectives: Set<number>
  onTogglePerspective: (pIndex: number) => void
  expandedQuestions: Set<string>
  onToggleQuestion: (key: string) => void
}

function nodeKey(node: SelectedNode): string {
  switch (node.type) {
    case 'question':
      return `q-${node.pIndex}-${node.qIndex}`
    case 'second':
      return `2-${node.pIndex}-${node.qIndex}-${node.index}`
    case 'third':
      return `3-${node.pIndex}-${node.qIndex}-${node.index}`
  }
}

function isSelected(
  selected: SelectedNode | null,
  node: SelectedNode
): boolean {
  if (!selected) return false
  return nodeKey(selected) === nodeKey(node)
}

interface QuestionsTreeNavExtendedProps extends QuestionsTreeNavProps {
  context?: {
    role: string
    activity: string
    situation: string
    industry: string
    service: string
  }
  additionalContext?: Array<{ label: string; value: string }>
}

export function QuestionsTreeNav({
  perspectives,
  deeperMap,
  selectedNode,
  onSelect,
  expandedPerspectives,
  onTogglePerspective,
  expandedQuestions,
  onToggleQuestion,
  context,
  additionalContext,
}: QuestionsTreeNavExtendedProps) {
  const totalQuestions = perspectives.reduce(
    (sum, p) => sum + (p.questions?.length ?? 0),
    0
  )

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-card lg:w-[340px] lg:min-w-[340px] lg:flex-shrink-0">
      {/* Header */}
      {false && context && (
        <div className="shrink-0 border-b border-border p-5">
          {/*<h1 className="text-base font-bold tracking-tight text-foreground">
            Question Book
          </h1>*/}
          <div className="text-xs leading-relaxed text-muted-foreground">
            <strong className="font-semibold text-foreground">{context.role}</strong> · {context.activity}
            <br />
            {context.industry} · {context.service}
          </div>
        </div>
      )}

      {/* Situation */}
      {false && context?.situation && (
        <div className="shrink-0 border-b border-border bg-muted/30 px-5 py-3.5">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            Situation
          </div>
          <div className="max-h-20 overflow-y-auto text-xs leading-relaxed text-muted-foreground">
            {context.situation}
          </div>
        </div>
      )}

      {/* Additional Context */}
      {false && additionalContext && additionalContext.length > 0 && (
        <div className="flex shrink-0 flex-col gap-2 border-b border-border bg-muted/20 px-5 py-3">
          {additionalContext.map((ctx, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {ctx.label}
              </div>
              <div className="text-xs leading-relaxed text-muted-foreground">
                {ctx.value}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="shrink-0 border-b border-border bg-muted/30 px-5 py-3.5">
          <div className="mb-1.5 text-[15px] font-bold uppercase tracking-wider text-primary">
            Question Library <span className="text-[10px] text-muted-foreground">({totalQuestions} questions)</span>
          </div>
        </div>
      
      {/* Navigation */}
      <nav className="min-h-0 border-b border-border max-h-[600px] flex-1 overflow-y-auto p-2.5">
        {perspectives.map((perspective, pIndex) => {
          const isPerspectiveOpen = expandedPerspectives.has(pIndex)
          const questionCount = perspective.questions?.length ?? 0

          return (
            <div key={pIndex} className="mb-0">
              <div className="px-2 py-3.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                {perspective.perspectiveName}
              </div>

              {perspective.questions && (
                <div className="mb-1">
                  {perspective.questions.map((q, qIndex) => {
                    const deeperKey = `${pIndex}-${qIndex}`
                    const deeper = deeperMap[deeperKey]
                    const questionNode: SelectedNode = {
                      type: 'question',
                      pIndex,
                      qIndex,
                    }
                    const isQuestionSelected = isSelected(
                      selectedNode,
                      questionNode
                    )
                    const questionTreeKey = `${pIndex}-${qIndex}`
                    const isQuestionExpanded = expandedQuestions.has(
                      questionTreeKey
                    )

                    const short =
                      q.question.length > 65
                        ? q.question.slice(0, 62) + '...'
                        : q.question

                    return (
                      <div key={qIndex} className="mb-0">
                        <button
                          type="button"
                          onClick={() => onSelect(questionNode)}
                          className={cn(
                            'block w-full rounded-md px-3 py-2.5 text-left text-[13px] leading-snug transition-all',
                            isQuestionSelected
                              ? 'bg-primary/10 font-semibold text-primary'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          {short}
                        </button>

                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      
    </aside>
  )
}
