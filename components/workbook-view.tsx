'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ProductSection } from '@/lib/product-types'
import { fieldAsString } from '@/lib/product-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, CheckCircle, Sparkles, Gauge } from 'lucide-react'

interface WorkbookSectionViewProps {
  section: ProductSection
  sectionIndex: number
  globalStartNumber: number
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export function WorkbookSectionView({
  section,
  sectionIndex,
  globalStartNumber,
}: WorkbookSectionViewProps) {
  const [showAnswers, setShowAnswers] = useState(false)
  const visibleElements = section.elements.filter((el) => !el.hidden)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">{section.name.replace(/^\d+[\.\)\-:]\s+/, '')}</h2>
          {section.description && (
            <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAnswers((v) => !v)}
          className="gap-2"
        >
          {showAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showAnswers ? 'Hide Answers' : 'Show Answers'}
        </Button>
      </div>

      <div className="space-y-4">
        {visibleElements.map((el, idx) => {
          const qNum = globalStartNumber + idx
          const difficulty = (fieldAsString(el.fields.difficulty) || 'medium').toLowerCase()
          return (
            <div
              key={idx}
              className="rounded-lg border border-border bg-card p-4 shadow-sm transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                  {qNum}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-relaxed text-foreground">
                    {fieldAsString(el.fields.question)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary" className={cn('text-[10px]', DIFFICULTY_COLORS[difficulty])}>
                      <Gauge className="mr-1 h-3 w-3" />
                      {difficulty}
                    </Badge>
                  </div>
                </div>
              </div>

              {showAnswers && (
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      {fieldAsString(el.fields.answer)}
                    </p>
                  </div>
                  {fieldAsString(el.fields.funFact) && (
                    <div className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                      <p className="text-xs italic text-muted-foreground">
                        {fieldAsString(el.fields.funFact)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {visibleElements.length} question{visibleElements.length !== 1 ? 's' : ''} in this topic
      </p>
    </div>
  )
}
