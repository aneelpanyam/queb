'use client'

import { cn } from '@/lib/utils'
import type { Product, Annotation, DissectionData, DeeperData, AnswerData, AssistantData } from '@/lib/product-types'
import type { OutputTypeDefinition } from '@/lib/output-types'
import { ProductAnnotations } from '@/components/product-annotation'
import { QuestionDissection } from '@/components/question-dissection'
import { QuestionAnswer } from '@/components/question-answer'
import { ElementDetail } from '@/components/element-detail'
import { ChecklistSectionDetail } from '@/components/checklist-section-detail'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Microscope, Layers, Sparkles, Globe, RefreshCw } from 'lucide-react'
import {
  type SelectedNode, type AssistantScope,
  SECTION_NAV_TYPES, dissectionKey, annotationKey,
  getContextEntries, getSectionPrimaryKey, getElementPrimary, matchesElement,
} from '../_lib/product-editor-utils'

interface ProductDetailPanelProps {
  product: Product
  outputTypeDef: OutputTypeDefinition
  selectedNode: SelectedNode | null
  dissectionMap: Record<string, DissectionData>
  deeperMap: Record<string, DeeperData>
  answerMap: Record<string, AnswerData>
  assistantData: AssistantData | null
  dissectionLoading: boolean
  activeDissectKey: string | null
  deeperLoading: boolean
  hiddenDissections: Set<string>
  answerLoading: boolean
  activeAnswerKey: string | null
  hiddenAnswers: Set<string>
  editingField: string | null
  editValue: string
  onStartEdit: (fieldKey: string, currentValue: string) => void
  onSaveEdit: (sIndex: number, eIndex: number, fieldKey: string) => void
  onCancelEdit: () => void
  onEditValueChange: (val: string) => void
  onDissect: (itemText: string, sectionName: string, key: string) => void
  onGoDeeper: (question: string, sectionName: string, sIndex: number, eIndex: number) => void
  onFindAnswer: (question: string, key: string) => void
  onToggleHiddenDissection: (key: string) => void
  onToggleHiddenAnswer: (key: string) => void
  onToggleElementVisibility: (sIndex: number, eIndex: number) => void
  onUpdateElementField: (sIndex: number, eIndex: number, fieldKey: string, value: string) => void
  onAddAnnotation: (key: string, data: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateAnnotation: (key: string, annotationId: string, data: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDeleteAnnotation: (key: string, annotationId: string) => void
  onOpenAssistant: (scope: AssistantScope) => void
}

export function ProductDetailPanel({
  product, outputTypeDef, selectedNode,
  dissectionMap, deeperMap, answerMap, assistantData,
  dissectionLoading, activeDissectKey, deeperLoading, hiddenDissections,
  answerLoading, activeAnswerKey, hiddenAnswers,
  editingField, editValue,
  onStartEdit, onSaveEdit, onCancelEdit, onEditValueChange,
  onDissect, onGoDeeper, onFindAnswer,
  onToggleHiddenDissection, onToggleHiddenAnswer,
  onToggleElementVisibility, onUpdateElementField,
  onAddAnnotation, onUpdateAnnotation, onDeleteAnnotation,
  onOpenAssistant,
}: ProductDetailPanelProps) {
  const selectedSection = selectedNode ? product.sections[selectedNode.sIndex] : null
  const selectedElement =
    selectedNode?.type === 'element' && selectedSection
      ? selectedSection.elements[selectedNode.eIndex]
      : null
  const selectedDeeper = selectedNode && 'eIndex' in selectedNode ? deeperMap[`${selectedNode.sIndex}-${selectedNode.eIndex}`] : undefined
  const secondQ = selectedNode?.type === 'second' && selectedDeeper ? selectedDeeper.secondOrder[selectedNode.index] : null
  const thirdQ = selectedNode?.type === 'third' && selectedDeeper ? selectedDeeper.thirdOrder[selectedNode.index] : null

  const displayPrimary =
    selectedNode?.type === 'element'
      ? selectedElement?.fields[getSectionPrimaryKey(product, outputTypeDef, selectedNode.sIndex)] || (selectedElement ? Object.values(selectedElement.fields)[0] : undefined)
      : selectedNode?.type === 'second'
        ? secondQ?.question
        : thirdQ?.question
  const displayReasoning =
    selectedNode?.type === 'second' ? secondQ?.reasoning
    : selectedNode?.type === 'third' ? thirdQ?.reasoning
    : null

  const currentDKey = selectedNode ? dissectionKey(selectedNode) : ''
  const currentAKey = selectedNode ? annotationKey(selectedNode) : ''
  const dissection = currentDKey ? dissectionMap[currentDKey] : undefined
  const currentAnswer = currentDKey ? answerMap[currentDKey] : undefined
  const currentAnnotations = product.annotations[currentAKey] || []
  const isQuestionBook = product.outputType === 'questions'

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center gap-6 border-b border-border bg-card/95 px-8 py-3.5 text-xs text-muted-foreground backdrop-blur-sm">
        {getContextEntries(product).map((e) => (
          <span key={e.label}><strong className="font-semibold text-foreground">{e.label}:</strong> {e.value}</span>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-background">
        {!selectedNode || !selectedSection ? (
          <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Select {SECTION_NAV_TYPES.has(product.outputType) ? 'a checklist' : `a ${outputTypeDef.elementLabel.toLowerCase()}`} from the left to edit and annotate.
            </p>
          </div>
        ) : selectedNode.type === 'section' ? (
          <div className="mx-auto w-full px-6 py-4 pb-12">
            <ChecklistSectionDetail
              section={selectedSection}
              sIndex={selectedNode.sIndex}
              product={product}
              dissectionMap={dissectionMap}
              onDissect={onDissect}
              dissectionLoading={dissectionLoading}
              activeDissectKey={activeDissectKey}
              onToggleElementVisibility={onToggleElementVisibility}
              onUpdateElementField={onUpdateElementField}
              onAddAnnotation={onAddAnnotation}
              onUpdateAnnotation={onUpdateAnnotation}
              onDeleteAnnotation={onDeleteAnnotation}
            />
          </div>
        ) : (
          <div className="mx-auto w-full space-y-5 px-6 py-4 pb-12">
            <div>
              <div className="mb-2.5 flex items-center gap-2">
                <div className="inline-block rounded-md bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary">
                  {selectedSection.name}
                </div>
                {(() => {
                  const count = assistantData?.suggestions.filter((s) => s.targetSection === selectedSection.name && !s.targetElement).length || 0
                  return (
                    <button
                      onClick={() => onOpenAssistant({ level: 'section', sectionName: selectedSection.name })}
                      className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors hover:bg-primary/10', count > 0 ? 'bg-amber-500/10 text-amber-600' : 'text-muted-foreground hover:text-primary')}
                      title={count > 0 ? `${count} section-level suggestions` : 'Open section analysis'}
                    >
                      <Sparkles className="h-3 w-3" />
                      {count > 0 && count}
                    </button>
                  )
                })()}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{selectedSection.description}</p>
            </div>

            {selectedNode.type === 'element' && selectedElement ? (
              <ElementDetail
                outputType={product.outputType || 'questions'}
                outputTypeDef={outputTypeDef}
                sectionName={selectedSection.name}
                sectionDescription={selectedSection.description}
                element={selectedElement}
                sIndex={selectedNode.sIndex}
                eIndex={selectedNode.eIndex}
                editingField={editingField}
                editValue={editValue}
                onStartEdit={onStartEdit}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
                onEditValueChange={onEditValueChange}
                resolvedFields={product.resolvedFields}
                sectionResolvedFields={selectedSection?.resolvedFields}
              />
            ) : (
              <h2 className="text-[16px] font-bold leading-tight tracking-tight text-foreground">{displayPrimary}</h2>
            )}

            {displayReasoning && (
              <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">Context & Reasoning</div>
                <p className="text-[14.5px] leading-relaxed text-foreground">{displayReasoning}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {selectedNode.type === 'element' && (
                <Button variant="outline" size="sm"
                  onClick={() => onOpenAssistant({ level: 'element', sectionName: selectedSection.name, sIndex: selectedNode.sIndex, eIndex: selectedNode.eIndex })}
                  className="gap-2 border-primary/30 text-primary hover:bg-primary/5">
                  <Sparkles className="h-4 w-4" />
                  {(() => {
                    const elPrimary = getElementPrimary(product, outputTypeDef, selectedNode.sIndex, selectedNode.eIndex)
                    const elSuggestions = assistantData?.suggestions.filter(
                      (s) => s.targetSection === selectedSection.name && matchesElement(s, elPrimary)
                    ).length || 0
                    return elSuggestions > 0 ? `Suggestions (${elSuggestions})` : 'Analyze'
                  })()}
                </Button>
              )}
              {(outputTypeDef.supportsDeepDive || outputTypeDef.supportsDeeperQuestions) && (<>
                {outputTypeDef.supportsDeepDive && (
                  <Button variant="outline" size="sm"
                    onClick={() => {
                      if (dissection && !dissectionLoading) {
                        onToggleHiddenDissection(currentDKey)
                      } else if (displayPrimary && selectedSection) {
                        onDissect(displayPrimary, selectedSection.name, currentDKey)
                      }
                    }}
                    disabled={dissectionLoading}
                    className={cn('gap-2', dissection && !hiddenDissections.has(currentDKey) && 'border-primary/50 bg-primary/5 text-primary')}>
                    {dissectionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Microscope className="h-4 w-4" />}
                    {dissectionLoading ? 'Generating...' : dissection && !hiddenDissections.has(currentDKey) ? 'Hide deep dive' : 'Deep dive'}
                  </Button>
                )}
                {outputTypeDef.supportsDeeperQuestions && selectedNode.type === 'element' && (
                  <Button variant="outline" size="sm"
                    onClick={() => { if (displayPrimary && selectedSection) onGoDeeper(displayPrimary, selectedSection.name, selectedNode.sIndex, selectedNode.eIndex) }}
                    disabled={deeperLoading || !!selectedDeeper}
                    className={cn('gap-2', selectedDeeper && 'border-primary/50 bg-primary/5 text-primary')}>
                    {deeperLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
                    {deeperLoading ? 'Thinking deeper...' : selectedDeeper ? 'Deeper loaded' : 'Go deeper'}
                  </Button>
                )}
              </>)}
              {isQuestionBook && (selectedNode.type === 'element' || selectedNode.type === 'second' || selectedNode.type === 'third') && (
                <Button variant="outline" size="sm"
                  onClick={() => {
                    if (currentAnswer && !answerLoading) {
                      onToggleHiddenAnswer(currentDKey)
                    } else if (displayPrimary) {
                      onFindAnswer(displayPrimary, currentDKey)
                    }
                  }}
                  disabled={answerLoading && activeAnswerKey === currentDKey}
                  className={cn('gap-2', currentAnswer && !hiddenAnswers.has(currentDKey) && 'border-emerald-500/50 bg-emerald-500/5 text-emerald-600')}>
                  {answerLoading && activeAnswerKey === currentDKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                  {answerLoading && activeAnswerKey === currentDKey ? 'Researching...' : currentAnswer && !hiddenAnswers.has(currentDKey) ? 'Hide answer' : currentAnswer ? 'Show answer' : 'Find answer'}
                </Button>
              )}
            </div>

            {isQuestionBook && (answerLoading && activeAnswerKey === currentDKey || (currentAnswer && !hiddenAnswers.has(currentDKey))) && (
              <div className="mt-6 space-y-4">
                {answerLoading && activeAnswerKey === currentDKey && !currentAnswer && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching the web and synthesizing an answer...
                    </div>
                    <Skeleton className="h-5 w-56" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-4 w-72" />
                  </div>
                )}
                {currentAnswer && !hiddenAnswers.has(currentDKey) && (
                  <div>
                    <QuestionAnswer data={currentAnswer} />
                    <div className="mt-3 flex gap-2">
                      <Button variant="ghost" size="sm"
                        onClick={() => { if (displayPrimary) onFindAnswer(displayPrimary, currentDKey) }}
                        disabled={answerLoading}
                        className="gap-1.5 text-xs text-muted-foreground">
                        <RefreshCw className="h-3 w-3" /> Re-research
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(dissectionLoading || (dissection && !hiddenDissections.has(currentDKey))) && (
              <div className="mt-6 space-y-8">
                {dissectionLoading && !dissection && (
                  <div className="space-y-4"><Skeleton className="h-5 w-56" /><Skeleton className="h-24 w-full" /></div>
                )}
                {dissection && !hiddenDissections.has(currentDKey) && <QuestionDissection data={dissection} />}
              </div>
            )}

            {selectedNode.type === 'element' && selectedDeeper && (
              <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Deeper Questions</h3>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">Select any from the sidebar to view and annotate.</p>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-primary">2nd-order ({selectedDeeper.secondOrder.length})</p>
                  <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                    {selectedDeeper.secondOrder.map((dq, i) => <li key={i} className="line-clamp-1">{dq.question}</li>)}
                  </ul>
                  <p className="text-xs font-semibold text-primary">3rd-order ({selectedDeeper.thirdOrder.length})</p>
                  <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                    {selectedDeeper.thirdOrder.map((tq, i) => <li key={i} className="line-clamp-1">{tq.question}</li>)}
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-8 border-t border-border pt-6">
              <ProductAnnotations
                annotations={currentAnnotations}
                defaultAuthor={product.branding.authorName}
                onAdd={(data) => onAddAnnotation(currentAKey, data)}
                onUpdate={(id, data) => onUpdateAnnotation(currentAKey, id, data)}
                onDelete={(id) => onDeleteAnnotation(currentAKey, id)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
