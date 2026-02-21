'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { Product, AssistantData, DeeperData, DissectionData } from '@/lib/product-types'
import type { OutputTypeDefinition } from '@/lib/output-types'
import { formatCost, formatTokenCount, type ProductCostData } from '@/lib/ai-pricing'
import {
  type SelectedNode, type AssistantScope,
  SECTION_NAV_TYPES, getContextEntries, getSectionPrimaryKey, getElementPrimary, matchesElement,
  getOutputTypeIcon, stripLeadingNumber,
} from '../_lib/product-editor-utils'
import { Eye, EyeOff, ChevronDown, ChevronRight, Coins, Microscope, MessageSquareText } from 'lucide-react'

interface ProductEditorSidebarProps {
  product: Product
  outputTypeDef: OutputTypeDefinition
  costData: ProductCostData
  selectedNode: SelectedNode | null
  deeperMap: Record<string, DeeperData>
  dissectionMap: Record<string, DissectionData>
  assistantData: AssistantData | null
  onSelectNode: (node: SelectedNode | null) => void
  onToggleSectionVisibility: (sIndex: number) => void
  onToggleElementVisibility: (sIndex: number, eIndex: number) => void
  onOpenAssistant: (scope: AssistantScope) => void
  onCoverMode?: () => void
}

export function ProductEditorSidebar({
  product, outputTypeDef, costData, selectedNode, deeperMap, dissectionMap, assistantData,
  onSelectNode, onToggleSectionVisibility, onToggleElementVisibility, onOpenAssistant, onCoverMode,
}: ProductEditorSidebarProps) {
  const [costOpen, setCostOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(
    () => new Set(product.sections.map((_, i) => i))
  )

  const toggleCollapse = (sIndex: number) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sIndex)) next.delete(sIndex)
      else next.add(sIndex)
      return next
    })
  }

  useEffect(() => {
    if (selectedNode && 'sIndex' in selectedNode) {
      setCollapsedSections((prev) => {
        if (!prev.has(selectedNode.sIndex)) return prev
        const next = new Set(prev)
        next.delete(selectedNode.sIndex)
        return next
      })
    }
  }, [selectedNode])

  const TypeIcon = getOutputTypeIcon(product.outputType)
  const useSectionNav = SECTION_NAV_TYPES.has(product.outputType)
  const totalVisible = product.sections.filter((s) => !s.hidden).reduce(
    (sum, s) => sum + (useSectionNav ? 1 : s.elements.filter((el) => !el.hidden).length),
    0,
  )
  const totalAll = useSectionNav
    ? product.sections.length
    : product.sections.reduce((sum, s) => sum + s.elements.length, 0)

  return (
    <aside className="flex w-[340px] min-w-[340px] flex-col border-r border-border bg-card">
      <div
        role="button"
        tabIndex={0}
        onClick={() => { onSelectNode(null); onCoverMode?.() }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectNode(null); onCoverMode?.() } }}
        className="shrink-0 cursor-pointer border-b border-border px-4 py-3.5 transition-colors hover:bg-muted/50"
        title="View product cover"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <TypeIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-display text-[14px] font-bold tracking-tight text-foreground">{product.name}</h2>
            <p className="text-[11px] text-muted-foreground">{outputTypeDef.name}</p>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-b border-border bg-muted/30 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <span className="font-display text-[12px] font-bold uppercase tracking-wider text-primary">
            {useSectionNav ? 'Checklists' : `${outputTypeDef.sectionLabel}s`}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground">
            {totalVisible} of {totalAll} {useSectionNav ? (outputTypeDef.sectionLabel?.toLowerCase() || 'item') : (outputTypeDef.elementLabel?.toLowerCase() || 'item')}s
          </span>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {product.sections.map((section, sIndex) => {
          const sHidden = !!section.hidden
          const annotationsInSection = section.elements.reduce((sum, _, eIdx) => sum + (product.annotations[`${sIndex}-${eIdx}`]?.length || 0), 0)
          const sectionAnnotations = product.annotations[`section-${sIndex}`]?.length || 0
          const totalAnnotations = annotationsInSection + sectionAnnotations
          const hasSectionDissection = !!dissectionMap[`section-${sIndex}`]
          const sectionNum = sIndex + 1

          if (useSectionNav) {
            const isSelected = selectedNode?.type === 'section' && selectedNode.sIndex === sIndex
            const visibleSteps = section.elements.filter((el) => !el.hidden).length
            return (
              <div key={sIndex} className={cn(sHidden && 'opacity-40')}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectNode({ type: 'section', sIndex })}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectNode({ type: 'section', sIndex }) } }}
                  className={cn(
                    'group flex w-full cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-all',
                    isSelected
                      ? 'border-l-2 border-l-primary bg-primary/8'
                      : 'border-l-2 border-l-transparent hover:bg-muted',
                  )}
                >
                  <span className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded font-display text-[11px] font-bold',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}>
                    {sectionNum}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className={cn(
                      'block font-display text-[13px] font-semibold leading-snug',
                      isSelected ? 'text-primary' : 'text-foreground',
                    )}>
                      {stripLeadingNumber(section.name)}
                    </span>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{visibleSteps} step{visibleSteps !== 1 ? 's' : ''}</span>
                      {totalAnnotations > 0 && (
                        <span className="flex items-center gap-0.5 text-primary">
                          <MessageSquareText className="h-2.5 w-2.5" />{totalAnnotations}
                        </span>
                      )}
                      {hasSectionDissection && <Microscope className="h-2.5 w-2.5 text-blue-500" />}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleSectionVisibility(sIndex) }}
                    className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground/40 opacity-0 transition-all group-hover:opacity-100 hover:text-foreground"
                  >
                    {sHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            )
          }

          const isCollapsed = collapsedSections.has(sIndex)

          return (
            <div key={sIndex} className={cn(sHidden && 'opacity-40')}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleCollapse(sIndex)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCollapse(sIndex) } }}
                className="group flex cursor-pointer items-center gap-2 px-2 pb-1 pt-3"
              >
                {isCollapsed
                  ? <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                  : <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                }
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-primary/10 font-display text-[9px] font-bold text-primary">
                  {sectionNum}
                </span>
                <span className="min-w-0 flex-1 font-display text-[11px] font-bold uppercase tracking-wider text-primary leading-tight">
                  {stripLeadingNumber(section.name)}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  {totalAnnotations > 0 && (
                    <span className="text-[9px] font-bold text-primary/60">{totalAnnotations}</span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleSectionVisibility(sIndex) }}
                    className="rounded p-0.5 text-muted-foreground/40 opacity-0 transition-all group-hover:opacity-100 hover:text-foreground"
                    title={sHidden ? 'Show' : 'Hide'}
                  >
                    {sHidden ? <EyeOff className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
                  </button>
                </div>
              </div>

              {!isCollapsed && <div className="mb-1">
                {section.elements.map((el, eIndex) => {
                  const isSelected = selectedNode?.type === 'element' && selectedNode.sIndex === sIndex && selectedNode.eIndex === eIndex
                  const isParent = selectedNode && 'eIndex' in selectedNode && selectedNode.sIndex === sIndex && selectedNode.eIndex === eIndex
                  const elHidden = !!el.hidden
                  const elAnnotations = product.annotations[`${sIndex}-${eIndex}`]?.length || 0
                  const hasDissection = !!dissectionMap[`${sIndex}-${eIndex}`]
                  const sectionPK = getSectionPrimaryKey(product, outputTypeDef, sIndex)
                  const rawLabel = el.fields[sectionPK] || Object.values(el.fields)[0] || '(empty)'
                  const label = stripLeadingNumber(rawLabel)
                  const short = label.length > 55 ? label.slice(0, 52) + '...' : label

                  return (
                    <div key={eIndex} className={cn(elHidden && 'opacity-40')}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectNode({ type: 'element', sIndex, eIndex })}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectNode({ type: 'element', sIndex, eIndex }) } }}
                        className={cn(
                          'group flex w-full cursor-pointer items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-all',
                          isSelected
                            ? 'border-l-2 border-l-primary bg-primary/8'
                            : 'border-l-2 border-l-transparent hover:bg-muted',
                        )}
                      >
                        <span className="mt-0.5 shrink-0 text-[10px] font-medium tabular-nums text-muted-foreground/60">
                          {sectionNum}.{eIndex + 1}
                        </span>
                        <span className={cn(
                          'min-w-0 flex-1 text-[12.5px] leading-snug',
                          isSelected ? 'font-semibold text-primary' : 'text-muted-foreground group-hover:text-foreground',
                        )}>
                          {short}
                        </span>
                        <div className="mt-0.5 flex shrink-0 items-center gap-1">
                          {hasDissection && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" title="Has deep dive" />}
                          {elAnnotations > 0 && <span className="h-1.5 w-1.5 rounded-full bg-primary" title={`${elAnnotations} annotation${elAnnotations !== 1 ? 's' : ''}`} />}
                          <button
                            onClick={(e) => { e.stopPropagation(); onToggleElementVisibility(sIndex, eIndex) }}
                            className="rounded p-0.5 text-muted-foreground/30 opacity-0 transition-all group-hover:opacity-100 hover:text-foreground"
                          >
                            {elHidden ? <EyeOff className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
                          </button>
                        </div>
                      </div>

                      {isParent && outputTypeDef.supportsDeeperQuestions && deeperMap[`${sIndex}-${eIndex}`] && (
                        <div className="ml-7 border-l border-border/40 pl-2">
                          {deeperMap[`${sIndex}-${eIndex}`].secondOrder.map((dq, idx) => {
                            const is2 = selectedNode?.type === 'second' && selectedNode.sIndex === sIndex && selectedNode.eIndex === eIndex && selectedNode.index === idx
                            return (
                              <button key={`2-${idx}`} onClick={() => onSelectNode({ type: 'second', sIndex, eIndex, index: idx })}
                                className={cn(
                                  'flex w-full items-start gap-1.5 rounded-md px-2 py-1.5 text-left text-[11px] leading-snug transition-all',
                                  is2 ? 'bg-primary/8 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}>
                                <span className="mt-px inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded bg-blue-500/10 text-[8px] font-bold text-blue-600">2</span>
                                <span className="min-w-0">{dq.question.length > 45 ? dq.question.slice(0, 42) + '...' : dq.question}</span>
                              </button>
                            )
                          })}
                          {deeperMap[`${sIndex}-${eIndex}`].thirdOrder.map((dq, idx) => {
                            const is3 = selectedNode?.type === 'third' && selectedNode.sIndex === sIndex && selectedNode.eIndex === eIndex && selectedNode.index === idx
                            return (
                              <button key={`3-${idx}`} onClick={() => onSelectNode({ type: 'third', sIndex, eIndex, index: idx })}
                                className={cn(
                                  'flex w-full items-start gap-1.5 rounded-md px-2 py-1.5 text-left text-[11px] leading-snug transition-all',
                                  is3 ? 'bg-primary/8 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}>
                                <span className="mt-px inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded bg-green-500/10 text-[8px] font-bold text-green-600">3</span>
                                <span className="min-w-0">{dq.question.length > 45 ? dq.question.slice(0, 42) + '...' : dq.question}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>}
            </div>
          )
        })}
      </nav>

      {costData.entries.length > 0 && (
        <div className="shrink-0 border-t border-border">
          <button
            onClick={() => setCostOpen((prev) => !prev)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Coins className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">AI Cost</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-emerald-600">{formatCost(costData.totalCost)}</span>
              {costOpen ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            </div>
          </button>

          {costOpen && (
            <div className="max-h-[240px] overflow-y-auto border-t border-border/50 px-4 py-2">
              <div className="mb-2 flex gap-3 text-[10px] text-muted-foreground">
                <span>{formatTokenCount(costData.totalInputTokens)} in</span>
                <span>{formatTokenCount(costData.totalOutputTokens)} out</span>
                <span>{costData.entries.length} call{costData.entries.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-1.5">
                {[...costData.entries].reverse().map((entry, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 rounded-md bg-muted/40 px-2.5 py-1.5">
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-foreground">{entry.action}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatTokenCount(entry.usage.promptTokens)} in · {formatTokenCount(entry.usage.completionTokens)} out · {entry.model}
                      </div>
                    </div>
                    <span className="shrink-0 text-[11px] font-semibold text-emerald-600">{formatCost(entry.cost)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
