'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ProductSection } from '@/lib/product-types'
import type { DissectionData } from '@/lib/product-types'
import { QuestionDissection } from '@/components/question-dissection'
import { ProductAnnotations } from '@/components/product-annotation'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Check,
  Pencil,
  Zap,
  Target,
  Clock,
  Shield,
  Eye,
  EyeOff,
  Microscope,
  Loader2,
  ChevronDown,
  ChevronRight,
  MessageSquareText,
} from 'lucide-react'
import type { Annotation } from '@/lib/product-types'

interface ChecklistSectionDetailProps {
  section: ProductSection
  sIndex: number
  product: {
    outputType: string
    role: string
    activity: string
    situation: string
    industry: string
    service: string
    annotations: Record<string, Annotation[]>
    branding: { authorName: string }
  }
  dissectionMap: Record<string, DissectionData>
  onDissect: (itemText: string, sectionName: string, key: string) => void
  dissectionLoading: boolean
  activeDissectKey: string | null
  onToggleElementVisibility: (sIndex: number, eIndex: number) => void
  onUpdateElementField: (sIndex: number, eIndex: number, fieldKey: string, value: string) => void
  onAddAnnotation: (key: string, data: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateAnnotation: (key: string, annotationId: string, data: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDeleteAnnotation: (key: string, annotationId: string) => void
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; border: string; icon: typeof Zap }> = {
  High: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20', icon: Zap },
  Medium: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', icon: Target },
  Low: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', icon: Clock },
}

export function ChecklistSectionDetail({
  section, sIndex, product, dissectionMap, onDissect, dissectionLoading, activeDissectKey,
  onToggleElementVisibility, onUpdateElementField,
  onAddAnnotation, onUpdateAnnotation, onDeleteAnnotation,
}: ChecklistSectionDetailProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set())
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [hiddenDissections, setHiddenDissections] = useState<Set<string>>(new Set())

  const toggleStep = (eIndex: number) => {
    setExpandedSteps((prev) => {
      const n = new Set(prev)
      if (n.has(eIndex)) n.delete(eIndex)
      else n.add(eIndex)
      return n
    })
  }

  const sectionDissectKey = `section-${sIndex}`
  const sectionDissection = dissectionMap[sectionDissectKey]

  const visibleSteps = section.elements.filter((el) => !el.hidden)
  const totalSteps = section.elements.length
  const highCount = section.elements.filter((el) => !el.hidden && el.fields.priority === 'High').length

  const startEdit = (key: string, value: string) => {
    setEditingField(key)
    setEditValue(value)
  }
  const cancelEdit = () => { setEditingField(null); setEditValue('') }
  const saveEdit = (eIndex: number, fieldKey: string) => {
    if (editValue.trim()) onUpdateElementField(sIndex, eIndex, fieldKey, editValue.trim())
    setEditingField(null)
    setEditValue('')
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <div className="mb-2.5 inline-block rounded-md bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary">
          {section.name}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{section.description}</p>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span>{visibleSteps.length} of {totalSteps} steps visible</span>
          {highCount > 0 && (
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <Zap className="h-3 w-3" /> {highCount} high priority
            </span>
          )}
        </div>
      </div>

      {/* Checklist-level deep dive */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm"
          onClick={() => {
            if (sectionDissection && !dissectionLoading) {
              setHiddenDissections((prev) => {
                const n = new Set(prev)
                if (n.has(sectionDissectKey)) n.delete(sectionDissectKey)
                else n.add(sectionDissectKey)
                return n
              })
            } else {
              onDissect(
                `The "${section.name}" checklist: ${section.description}`,
                section.name,
                sectionDissectKey,
              )
            }
          }}
          disabled={dissectionLoading && activeDissectKey === sectionDissectKey}
          className={cn('gap-2', sectionDissection && !hiddenDissections.has(sectionDissectKey) && 'border-primary/50 bg-primary/5 text-primary')}>
          {dissectionLoading && activeDissectKey === sectionDissectKey
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Microscope className="h-4 w-4" />}
          {dissectionLoading && activeDissectKey === sectionDissectKey
            ? 'Analyzing checklist...'
            : sectionDissection && !hiddenDissections.has(sectionDissectKey)
              ? 'Hide checklist deep dive'
              : 'Deep dive this checklist'}
        </Button>
      </div>

      {/* Section-level dissection */}
      {sectionDissection && !hiddenDissections.has(sectionDissectKey) && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
          <QuestionDissection data={sectionDissection} />
        </div>
      )}

      {/* Section-level annotations */}
      <div className="border-t border-border pt-4">
        <ProductAnnotations
          annotations={product.annotations[sectionDissectKey] || []}
          defaultAuthor={product.branding.authorName}
          onAdd={(data) => onAddAnnotation(sectionDissectKey, data)}
          onUpdate={(id, data) => onUpdateAnnotation(sectionDissectKey, id, data)}
          onDelete={(id) => onDeleteAnnotation(sectionDissectKey, id)}
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Steps</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Individual steps */}
      {section.elements.map((el, eIndex) => {
        const isHidden = !!el.hidden
        const isExpanded = expandedSteps.has(eIndex)
        const priority = el.fields.priority || 'Medium'
        const pStyle = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium
        const PIcon = pStyle.icon
        const stepDissectKey = `${sIndex}-${eIndex}`
        const stepDissection = dissectionMap[stepDissectKey]
        const stepAnnotations = product.annotations[stepDissectKey] || []
        const itemEditKey = `step-item-${sIndex}-${eIndex}`
        const descEditKey = `step-desc-${sIndex}-${eIndex}`

        return (
          <div key={eIndex} className={cn('rounded-lg border transition-all', isHidden ? 'opacity-40 border-border/50' : 'border-border', isExpanded && !isHidden && 'shadow-sm')}>
            {/* Step header — always visible */}
            <div className="flex items-center gap-3 p-4">
              <button onClick={() => toggleStep(eIndex)} className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold', pStyle.bg, pStyle.text, pStyle.border)}>
                <PIcon className="h-3 w-3" /> {priority}
              </span>

              <div className="min-w-0 flex-1">
                {editingField === itemEditKey ? (
                  <div className="space-y-2">
                    <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="text-sm font-semibold" autoFocus rows={2} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(eIndex, 'item')} className="gap-1.5"><Check className="h-3.5 w-3.5" /> Save</Button>
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <p onClick={() => startEdit(itemEditKey, el.fields.item || '')}
                    className="group cursor-text text-sm font-semibold leading-snug text-foreground hover:text-primary" title="Click to edit">
                    {el.fields.item || '(empty)'}
                    <Pencil className="ml-1.5 inline h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {stepAnnotations.length > 0 && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">{stepAnnotations.length}</span>
                )}
                {stepDissection && <Microscope className="h-3 w-3 text-primary/60" />}
                <button onClick={() => onToggleElementVisibility(sIndex, eIndex)}
                  className="rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-foreground">
                  {isHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
              </div>
            </div>

            {/* Expanded step detail */}
            {isExpanded && !isHidden && (
              <div className="border-t border-border/50 px-4 pb-5 pt-4 space-y-4">
                {/* Description */}
                {el.fields.description && (
                  <div className={cn('rounded-lg border p-4', pStyle.bg, pStyle.border)}>
                    <div className={cn('mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide', pStyle.text)}>
                      <Shield className="h-3.5 w-3.5" /> What to Know
                    </div>
                    {editingField === descEditKey ? (
                      <div className="space-y-2">
                        <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="text-[13px]" autoFocus rows={4} />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(eIndex, 'description')} className="gap-1.5"><Check className="h-3.5 w-3.5" /> Save</Button>
                          <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <p onClick={() => startEdit(descEditKey, el.fields.description)}
                        className="group cursor-text text-[13px] leading-relaxed text-foreground hover:text-primary/80" title="Click to edit">
                        {el.fields.description}
                        <Pencil className="ml-1.5 inline h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </p>
                    )}
                  </div>
                )}

                {/* Step-level deep dive */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm"
                    onClick={() => {
                      if (stepDissection && !dissectionLoading) {
                        setHiddenDissections((prev) => {
                          const n = new Set(prev)
                          if (n.has(stepDissectKey)) n.delete(stepDissectKey)
                          else n.add(stepDissectKey)
                          return n
                        })
                      } else {
                        onDissect(el.fields.item || '', section.name, stepDissectKey)
                      }
                    }}
                    disabled={dissectionLoading && activeDissectKey === stepDissectKey}
                    className={cn('gap-1.5 text-xs', stepDissection && !hiddenDissections.has(stepDissectKey) && 'border-primary/50 bg-primary/5 text-primary')}>
                    {dissectionLoading && activeDissectKey === stepDissectKey
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Microscope className="h-3.5 w-3.5" />}
                    {dissectionLoading && activeDissectKey === stepDissectKey
                      ? 'Analyzing...'
                      : stepDissection && !hiddenDissections.has(stepDissectKey)
                        ? 'Hide deep dive'
                        : 'Deep dive this step'}
                  </Button>
                </div>

                {/* Step dissection content */}
                {stepDissection && !hiddenDissections.has(stepDissectKey) && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <QuestionDissection data={stepDissection} />
                  </div>
                )}
                {dissectionLoading && activeDissectKey === stepDissectKey && !stepDissection && (
                  <div className="space-y-3 p-4"><Skeleton className="h-4 w-48" /><Skeleton className="h-20 w-full" /></div>
                )}

                {/* Step-level annotations */}
                <div className="border-t border-border/50 pt-3">
                  <ProductAnnotations
                    annotations={stepAnnotations}
                    defaultAuthor={product.branding.authorName}
                    onAdd={(data) => onAddAnnotation(stepDissectKey, data)}
                    onUpdate={(id, data) => onUpdateAnnotation(stepDissectKey, id, data)}
                    onDelete={(id) => onDeleteAnnotation(stepDissectKey, id)}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
