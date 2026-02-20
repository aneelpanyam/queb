'use client'

import { cn } from '@/lib/utils'
import type { Product, AssistantData, DeeperData } from '@/lib/product-types'
import type { OutputTypeDefinition } from '@/lib/output-types'
import {
  type SelectedNode, type AssistantScope,
  SECTION_NAV_TYPES, getContextEntries, getSectionPrimaryKey, getElementPrimary, matchesElement,
} from '../_lib/product-editor-utils'
import { Eye, EyeOff, MessageSquareText, Sparkles } from 'lucide-react'

interface ProductEditorSidebarProps {
  product: Product
  outputTypeDef: OutputTypeDefinition
  selectedNode: SelectedNode | null
  deeperMap: Record<string, DeeperData>
  assistantData: AssistantData | null
  onSelectNode: (node: SelectedNode) => void
  onToggleSectionVisibility: (sIndex: number) => void
  onToggleElementVisibility: (sIndex: number, eIndex: number) => void
  onOpenAssistant: (scope: AssistantScope) => void
}

export function ProductEditorSidebar({
  product, outputTypeDef, selectedNode, deeperMap, assistantData,
  onSelectNode, onToggleSectionVisibility, onToggleElementVisibility, onOpenAssistant,
}: ProductEditorSidebarProps) {
  return (
    <aside className="flex w-[340px] min-w-[340px] flex-col border-r border-border bg-card">
      <div className="shrink-0 border-b border-border p-4">
        <div className="mb-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs leading-relaxed text-muted-foreground">
          {getContextEntries(product).map((e, i) => (
            <span key={e.label}>
              {i > 0 && <span className="mr-1">·</span>}
              <strong className="font-semibold text-foreground">{e.value}</strong>
            </span>
          ))}
        </div>
        {product.targetAudience && !product.contextFields && (
          <div className="mt-1.5 text-[10px] font-medium text-primary">Audience: {product.targetAudience}</div>
        )}
      </div>

      <div className="shrink-0 border-b border-border bg-muted/30 px-4 py-3">
        <div className="text-[13px] font-bold uppercase tracking-wider text-primary">
          {SECTION_NAV_TYPES.has(product.outputType) ? 'Checklists' : `${outputTypeDef.sectionLabel}s`}{' '}
          <span className="text-[10px] font-medium text-muted-foreground">
            {SECTION_NAV_TYPES.has(product.outputType)
              ? `(${product.sections.filter((s) => !s.hidden).length} checklists, ${product.sections.filter((s) => !s.hidden).reduce((sum, s) => sum + s.elements.filter((el) => !el.hidden).length, 0)} steps)`
              : `(${product.sections.filter((s) => !s.hidden).reduce((sum, s) => sum + s.elements.filter((el) => !el.hidden).length, 0)} ${outputTypeDef.elementLabel.toLowerCase()}s)`
            }
          </span>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto p-2.5">
        {product.sections.map((section, sIndex) => {
          const sHidden = !!section.hidden
          const annotationsInSection = section.elements.reduce((sum, _, eIdx) => sum + (product.annotations[`${sIndex}-${eIdx}`]?.length || 0), 0)
          const sectionAnnotations = product.annotations[`section-${sIndex}`]?.length || 0
          const totalAnnotations = annotationsInSection + sectionAnnotations
          const sectionSuggestionCount = assistantData?.suggestions.filter((s) => s.targetSection === section.name && !s.targetElement).length || 0
          const useSectionNav = SECTION_NAV_TYPES.has(product.outputType)

          if (useSectionNav) {
            const isSelected = selectedNode?.type === 'section' && selectedNode.sIndex === sIndex
            const visibleSteps = section.elements.filter((el) => !el.hidden).length
            return (
              <div key={sIndex} className={cn(sHidden && 'opacity-40')}>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelectNode({ type: 'section', sIndex })}
                    className={cn(
                      'block min-w-0 flex-1 rounded-md px-3 py-3 text-left transition-all',
                      isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                    )}
                  >
                    <span className={cn('block text-[13px] font-semibold leading-snug', isSelected ? 'text-primary' : 'text-foreground')}>
                      {section.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                      {visibleSteps} step{visibleSteps !== 1 ? 's' : ''}
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center gap-1 pr-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onOpenAssistant({ level: 'section', sectionName: section.name }) }}
                      className={cn('rounded p-0.5 transition-colors', sectionSuggestionCount > 0 ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground/30 hover:text-primary')}
                      title={sectionSuggestionCount > 0 ? `${sectionSuggestionCount} suggestions` : 'Analyze section'}
                    >
                      <Sparkles className="h-3 w-3" />
                    </button>
                    {totalAnnotations > 0 && (
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">{totalAnnotations}</span>
                    )}
                    <button onClick={() => onToggleSectionVisibility(sIndex)} className="rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-foreground">
                      {sHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div key={sIndex} className={cn('mb-0', sHidden && 'opacity-40')}>
              <div className="flex items-center justify-between px-2 py-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">{section.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenAssistant({ level: 'section', sectionName: section.name })}
                    className={cn('rounded p-0.5 transition-colors', sectionSuggestionCount > 0 ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground/30 hover:text-primary')}
                    title={sectionSuggestionCount > 0 ? `${sectionSuggestionCount} suggestions` : 'Analyze section'}
                  >
                    <Sparkles className="h-3 w-3" />
                  </button>
                  {totalAnnotations > 0 && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">{totalAnnotations}</span>
                  )}
                  <button onClick={() => onToggleSectionVisibility(sIndex)} className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground" title={sHidden ? 'Show' : 'Hide'}>
                    {sHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              <div className="mb-1">
                {section.elements.map((el, eIndex) => {
                  const isSelected = selectedNode?.type === 'element' && selectedNode.sIndex === sIndex && selectedNode.eIndex === eIndex
                  const isParent = selectedNode && 'eIndex' in selectedNode && selectedNode.sIndex === sIndex && selectedNode.eIndex === eIndex
                  const elHidden = !!el.hidden
                  const elAnnotations = product.annotations[`${sIndex}-${eIndex}`]?.length || 0
                  const sectionPK = getSectionPrimaryKey(product, outputTypeDef, sIndex)
                  const label = el.fields[sectionPK] || Object.values(el.fields)[0] || '(empty)'
                  const short = label.length > 60 ? label.slice(0, 57) + '...' : label
                  const elPrimary = el.fields[sectionPK] || Object.values(el.fields)[0] || ''
                  const hasElSuggestions = assistantData?.suggestions.some(
                    (s) => s.targetSection === section.name && matchesElement(s, elPrimary)
                  ) || false

                  return (
                    <div key={eIndex} className={cn(elHidden && 'opacity-40')}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onSelectNode({ type: 'element', sIndex, eIndex })}
                          className={cn(
                            'block min-w-0 flex-1 rounded-md px-3 py-2 text-left text-[13px] leading-snug transition-all',
                            isSelected ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          {short}
                        </button>
                        <div className="flex shrink-0 items-center gap-0.5 pr-1">
                          {hasElSuggestions && <Sparkles className="h-3 w-3 text-amber-500" />}
                          {elAnnotations > 0 && <MessageSquareText className="h-3 w-3 text-primary/60" />}
                          <button onClick={() => onToggleElementVisibility(sIndex, eIndex)} className="rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-foreground">
                            {elHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>

                      {isParent && outputTypeDef.supportsDeeperQuestions && deeperMap[`${sIndex}-${eIndex}`] && (
                        <div className="ml-4 border-l border-border/50 pl-2">
                          {deeperMap[`${sIndex}-${eIndex}`].secondOrder.map((dq, idx) => {
                            const is2 = selectedNode?.type === 'second' && selectedNode.sIndex === sIndex && selectedNode.eIndex === eIndex && selectedNode.index === idx
                            return (
                              <button key={`2-${idx}`} onClick={() => onSelectNode({ type: 'second', sIndex, eIndex, index: idx })}
                                className={cn('block w-full rounded-md px-2 py-1.5 text-left text-[11px] leading-snug transition-all', is2 ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                                <span className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded bg-blue-500/10 text-[9px] font-bold text-blue-600">2</span>
                                {dq.question.length > 50 ? dq.question.slice(0, 47) + '...' : dq.question}
                              </button>
                            )
                          })}
                          {deeperMap[`${sIndex}-${eIndex}`].thirdOrder.map((dq, idx) => {
                            const is3 = selectedNode?.type === 'third' && selectedNode.sIndex === sIndex && selectedNode.eIndex === eIndex && selectedNode.index === idx
                            return (
                              <button key={`3-${idx}`} onClick={() => onSelectNode({ type: 'third', sIndex, eIndex, index: idx })}
                                className={cn('block w-full rounded-md px-2 py-1.5 text-left text-[11px] leading-snug transition-all', is3 ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                                <span className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded bg-green-500/10 text-[9px] font-bold text-green-600">3</span>
                                {dq.question.length > 50 ? dq.question.slice(0, 47) + '...' : dq.question}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
