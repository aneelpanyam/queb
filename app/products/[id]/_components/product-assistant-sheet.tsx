'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import type { Product, AssistantData, AssistantSuggestion } from '@/lib/product-types'
import type { OutputTypeDefinition } from '@/lib/output-types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Loader2, Sparkles, CheckCircle2, Target, Lightbulb,
  FileText, BarChart3, Layers, MessageSquareText,
} from 'lucide-react'
import { type AssistantScope, getElementPrimary, matchesElement } from '../_lib/product-editor-utils'

interface ProductAssistantSheetProps {
  product: Product
  outputTypeDef: OutputTypeDefinition
  open: boolean
  onOpenChange: (open: boolean) => void
  scope: AssistantScope
  onScopeChange: (scope: AssistantScope) => void
  loading: boolean
  data: AssistantData | null
  onRunAnalysis: (scope: AssistantScope) => void
}

export function ProductAssistantSheet({
  product, outputTypeDef,
  open, onOpenChange,
  scope, onScopeChange,
  loading, data,
  onRunAnalysis,
}: ProductAssistantSheetProps) {
  const getScopedSuggestions = (): AssistantSuggestion[] => {
    if (!data) return []
    if (scope.level === 'product') return data.suggestions
    if (scope.level === 'section') return data.suggestions.filter((s) => s.targetSection === scope.sectionName && !s.targetElement)
    const elPrimary = getElementPrimary(product, outputTypeDef, scope.sIndex, scope.eIndex)
    return data.suggestions.filter((s) => s.targetSection === scope.sectionName && matchesElement(s, elPrimary))
  }

  const scopedSuggestions = getScopedSuggestions()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[440px] sm:max-w-[440px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {scope.level === 'product' && 'Product Analysis'}
            {scope.level === 'section' && `Section: ${scope.sectionName}`}
            {scope.level === 'element' && 'Element Analysis'}
          </SheetTitle>
          <SheetDescription>
            {scope.level === 'product' && 'Suggestions for the entire product.'}
            {scope.level === 'section' && `Suggestions for the "${scope.sectionName}" section.`}
            {scope.level === 'element' && `Suggestions for this specific ${outputTypeDef?.elementLabel?.toLowerCase() || 'element'}.`}
            {data?.analyzedAt && (
              <span className="mt-1 block text-[11px] text-muted-foreground/70">
                Last analyzed {new Date(data.analyzedAt).toLocaleString()}
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        {scope.level !== 'product' && (
          <div className="mb-4 flex items-center gap-1 text-xs">
            <button onClick={() => onScopeChange({ level: 'product' })} className="text-primary hover:underline">Product</button>
            <span className="text-muted-foreground">/</span>
            {scope.level === 'element' ? (
              <>
                <button onClick={() => onScopeChange({ level: 'section', sectionName: scope.sectionName })} className="text-primary hover:underline">{scope.sectionName}</button>
                <span className="text-muted-foreground">/</span>
                <span className="text-foreground font-medium">Element</span>
              </>
            ) : (
              <span className="text-foreground font-medium">{scope.sectionName}</span>
            )}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onRunAnalysis(scope)}
          disabled={loading}
          className="mb-4 w-full gap-2"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {loading ? 'Analyzing...' : scopedSuggestions.length > 0 ? 'Re-analyze' : 'Run analysis'}
        </Button>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-border p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : scopedSuggestions.length === 0 && !data ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No analysis yet. Click the button above to get started.</p>
          </div>
        ) : scopedSuggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="mb-3 h-8 w-8 text-green-500/50" />
            <p className="text-sm text-muted-foreground">No suggestions at this level yet. Run analysis to get specific recommendations.</p>
          </div>
        ) : (
          <SuggestionsList
            suggestions={scopedSuggestions}
            scope={scope}
            data={data}
            onScopeChange={onScopeChange}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function SuggestionsList({
  suggestions, scope, data, onScopeChange,
}: {
  suggestions: AssistantSuggestion[]
  scope: AssistantScope
  data: AssistantData | null
  onScopeChange: (scope: AssistantScope) => void
}) {
  const categoryMeta: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    annotation: { label: 'Add Annotations', icon: <MessageSquareText className="h-4 w-4" />, color: 'text-blue-600 bg-blue-500/10' },
    content: { label: 'Improve Content', icon: <FileText className="h-4 w-4" />, color: 'text-purple-600 bg-purple-500/10' },
    structure: { label: 'Restructure', icon: <Layers className="h-4 w-4" />, color: 'text-indigo-600 bg-indigo-500/10' },
    audience: { label: 'Audience Fit', icon: <Target className="h-4 w-4" />, color: 'text-green-600 bg-green-500/10' },
    distribution: { label: 'Distribution', icon: <BarChart3 className="h-4 w-4" />, color: 'text-orange-600 bg-orange-500/10' },
    enrichment: { label: 'AI Enrichment', icon: <Sparkles className="h-4 w-4" />, color: 'text-primary bg-primary/10' },
  }
  const priorityColors: Record<string, string> = {
    high: 'bg-red-500/10 text-red-600 border-red-500/20',
    medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    low: 'bg-green-500/10 text-green-600 border-green-500/20',
  }

  const grouped: Record<string, typeof suggestions> = {}
  for (const s of suggestions) {
    ;(grouped[s.category] ??= []).push(s)
  }

  return (
    <div className="space-y-5">
      {scope.level === 'product' && data && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Readiness</span>
            <span className={cn(
              'text-lg font-bold',
              data.completenessScore >= 75 ? 'text-green-600' :
              data.completenessScore >= 50 ? 'text-amber-600' : 'text-red-600'
            )}>
              {data.completenessScore}%
            </span>
          </div>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                data.completenessScore >= 75 ? 'bg-green-500' :
                data.completenessScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${data.completenessScore}%` }}
            />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{data.overallAssessment}</p>
        </div>
      )}

      <p className="text-xs font-semibold text-muted-foreground">{suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}</p>

      {Object.entries(grouped).map(([cat, items]) => {
        const meta = categoryMeta[cat] || { label: cat, icon: <Lightbulb className="h-4 w-4" />, color: 'text-muted-foreground bg-muted' }
        return (
          <div key={cat}>
            <div className="mb-2 flex items-center gap-2">
              <span className={cn('flex h-6 w-6 items-center justify-center rounded-md', meta.color)}>
                {meta.icon}
              </span>
              <span className="text-sm font-semibold text-foreground">{meta.label}</span>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">{items.length}</span>
            </div>
            <div className="space-y-2 pl-8">
              {items.map((suggestion, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-card p-3">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{suggestion.title}</span>
                    <span className={cn('shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase', priorityColors[suggestion.priority] || '')}>
                      {suggestion.priority}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{suggestion.description}</p>
                  {scope.level === 'product' && suggestion.targetSection && (
                    <button
                      onClick={() => onScopeChange({ level: 'section', sectionName: suggestion.targetSection })}
                      className="mt-1.5 text-[10px] font-medium text-primary hover:underline"
                    >
                      {suggestion.targetSection} &rarr;
                    </button>
                  )}
                  {suggestion.targetElement && (
                    <p className="mt-1 text-[10px] italic text-muted-foreground/70">
                      &ldquo;{suggestion.targetElement.length > 80 ? suggestion.targetElement.slice(0, 77) + '...' : suggestion.targetElement}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
