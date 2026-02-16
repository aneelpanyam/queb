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

export function QuestionsTreeNav({
  perspectives,
  deeperMap,
  selectedNode,
  onSelect,
  expandedPerspectives,
  onTogglePerspective,
  expandedQuestions,
  onToggleQuestion,
}: QuestionsTreeNavProps) {
  return (
    <aside className="flex w-full flex-col border border-border bg-card lg:w-72 lg:flex-shrink-0">
      <div className="p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Question Library
        </h2>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {perspectives.map((perspective, pIndex) => {
          const isPerspectiveOpen = expandedPerspectives.has(pIndex)
          const questionCount = perspective.questions?.length ?? 0

          return (
            <div key={pIndex} className="mb-1">
              <button
                type="button"
                onClick={() => onTogglePerspective(pIndex)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-foreground hover:bg-muted"
              >
                {isPerspectiveOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className="truncate">{perspective.perspectiveName}</span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {questionCount}
                </span>
              </button>

              {isPerspectiveOpen && perspective.questions && (
                <div className="ml-3 mt-0.5 border-l border-border pl-2">
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

                    return (
                      <div key={qIndex} className="mb-1">
                        <button
                          type="button"
                          onClick={() => onSelect(questionNode)}
                          className={cn(
                            'flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm',
                            isQuestionSelected
                              ? 'bg-primary/10 font-medium text-primary'
                              : 'text-foreground hover:bg-muted'
                          )}
                        >
                          <span
                            className={cn(
                              'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                              isQuestionSelected
                                ? 'bg-primary'
                                : 'bg-muted-foreground'
                            )}
                          />
                          <span className="line-clamp-2">{q.question}</span>
                        </button>

                        {/* Second-order children */}
                        {deeper?.secondOrder && deeper.secondOrder.length > 0 && (
                          <div className="ml-3 mt-0.5 border-l border-border pl-2">
                            <button
                              type="button"
                              onClick={() =>
                                onToggleQuestion(questionTreeKey)
                              }
                              className="flex w-full items-center gap-1.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                            >
                              {isQuestionExpanded ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                              )}
                              2nd-order ({deeper.secondOrder.length})
                            </button>
                            {isQuestionExpanded &&
                              deeper.secondOrder.map((dq, i) => {
                                const secondNode: SelectedNode = {
                                  type: 'second',
                                  pIndex,
                                  qIndex,
                                  index: i,
                                }
                                const isSecondSelected = isSelected(
                                  selectedNode,
                                  secondNode
                                )
                                return (
                                  <div key={`2-${i}`} className="mb-0.5 ml-2">
                                    <button
                                      type="button"
                                      onClick={() => onSelect(secondNode)}
                                      className={cn(
                                        'flex w-full items-start gap-2 rounded px-2 py-1 text-left text-xs',
                                        isSecondSelected
                                          ? 'bg-primary/10 font-medium text-primary'
                                          : 'text-foreground hover:bg-muted'
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          'mt-1 h-1 w-1 shrink-0 rounded-full',
                                          isSecondSelected
                                            ? 'bg-primary'
                                            : 'bg-muted-foreground/70'
                                        )}
                                      />
                                      <span className="line-clamp-2">
                                        {dq.question}
                                      </span>
                                    </button>
                                  </div>
                                )
                              })}
                            {isQuestionExpanded &&
                              deeper.thirdOrder?.map((tq, i) => {
                                const thirdNode: SelectedNode = {
                                  type: 'third',
                                  pIndex,
                                  qIndex,
                                  index: i,
                                }
                                const isThirdSelected = isSelected(
                                  selectedNode,
                                  thirdNode
                                )
                                return (
                                  <div
                                    key={`3-${i}`}
                                    className="ml-2 mb-0.5 border-l border-border/60 pl-2"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => onSelect(thirdNode)}
                                      className={cn(
                                        'flex w-full items-start gap-2 rounded px-2 py-1 text-left text-xs',
                                        isThirdSelected
                                          ? 'bg-primary/10 font-medium text-primary'
                                          : 'text-foreground hover:bg-muted'
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          'mt-1 h-1 w-1 shrink-0 rounded-full',
                                          isThirdSelected
                                            ? 'bg-primary'
                                            : 'bg-muted-foreground/50'
                                        )}
                                      />
                                      <span className="line-clamp-2">
                                        {tq.question}
                                      </span>
                                    </button>
                                  </div>
                                )
                              })}
                          </div>
                        )}
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
