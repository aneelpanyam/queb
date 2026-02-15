'use client'

import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ArrowRight, Lightbulb, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'

interface SituationFormProps {
  situation: string
  onSituationChange: (value: string) => void
  additionalContext: { label: string; value: string }[]
  onAdditionalContextChange: (ctx: { label: string; value: string }[]) => void
  onSubmit: () => void
  role: string
  activity: string
  isGenerating: boolean
}

const CONTEXT_SUGGESTIONS = [
  { label: 'Team size', placeholder: 'e.g., 12 people across 3 locations' },
  { label: 'Budget constraints', placeholder: 'e.g., $50K quarterly budget, 10% cut expected' },
  { label: 'Timeline', placeholder: 'e.g., Must deliver by Q3 2026' },
  { label: 'Key stakeholders', placeholder: 'e.g., CEO, VP of Product, external investors' },
  { label: 'Current challenges', placeholder: 'e.g., High turnover, legacy systems' },
  { label: 'Recent changes', placeholder: 'e.g., New CTO joined, company restructuring' },
  { label: 'Success metrics', placeholder: 'e.g., 20% revenue growth, NPS > 50' },
  { label: 'Regulatory requirements', placeholder: 'e.g., GDPR compliance, SOC2 audit pending' },
]

export function SituationForm({
  situation,
  onSituationChange,
  additionalContext,
  onAdditionalContextChange,
  onSubmit,
  role,
  activity,
  isGenerating,
}: SituationFormProps) {
  const [showContextFields, setShowContextFields] = useState(additionalContext.length > 0)

  const addContextField = (label: string = '') => {
    onAdditionalContextChange([...additionalContext, { label, value: '' }])
    setShowContextFields(true)
  }

  const removeContextField = (index: number) => {
    const next = additionalContext.filter((_, i) => i !== index)
    onAdditionalContextChange(next)
    if (next.length === 0) setShowContextFields(false)
  }

  const updateContextField = (index: number, field: 'label' | 'value', val: string) => {
    const next = [...additionalContext]
    next[index] = { ...next[index], [field]: val }
    onAdditionalContextChange(next)
  }

  const availableSuggestions = CONTEXT_SUGGESTIONS.filter(
    (s) => !additionalContext.some((c) => c.label === s.label)
  )

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 rounded-lg border border-border bg-card p-3">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Lightbulb className="h-4 w-4 text-primary" />
          <span>Context for better questions</span>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-md bg-primary/10 px-2.5 py-1 font-medium text-primary">
            {role}
          </span>
          <span className="rounded-md bg-accent/10 px-2.5 py-1 font-medium text-accent">
            {activity}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Primary Situation */}
        <div>
          <label
            htmlFor="situation"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Describe your current situation
          </label>
          <Textarea
            id="situation"
            placeholder={`For example: "I'm about to present our Q3 roadmap to the executive team. We've had some delays in the platform migration, and I need to explain the trade-offs we made while still maintaining confidence in our delivery timeline..."`}
            value={situation}
            onChange={(e) => onSituationChange(e.target.value)}
            className="min-h-[120px] resize-none bg-card text-sm leading-relaxed"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            The more specific you are, the more relevant the questions will be.
          </p>
        </div>

        {/* Additional Context */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Additional context
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            {!showContextFields && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-primary hover:text-primary"
                onClick={() => addContextField('')}
              >
                <Plus className="h-3 w-3" />
                Add context
              </Button>
            )}
          </div>

          {showContextFields && (
            <div className="space-y-2.5">
              {additionalContext.map((ctx, idx) => {
                const suggestion = CONTEXT_SUGGESTIONS.find((s) => s.label === ctx.label)
                return (
                  <div
                    key={idx}
                    className="flex gap-2 rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex flex-1 flex-col gap-2">
                      <Input
                        placeholder="Context label (e.g., Team size)"
                        value={ctx.label}
                        onChange={(e) => updateContextField(idx, 'label', e.target.value)}
                        className="h-8 bg-background text-xs font-medium"
                      />
                      <Textarea
                        placeholder={suggestion?.placeholder || 'Provide details...'}
                        value={ctx.value}
                        onChange={(e) => updateContextField(idx, 'value', e.target.value)}
                        className="min-h-[60px] resize-none bg-background text-xs leading-relaxed"
                      />
                    </div>
                    <button
                      onClick={() => removeContextField(idx)}
                      className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove context field"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}

              {/* Quick-add suggestions */}
              {availableSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="mr-1 text-xs text-muted-foreground leading-6">
                    Suggestions:
                  </span>
                  {availableSuggestions.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => addContextField(s.label)}
                      className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Add custom row */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-primary hover:text-primary"
                onClick={() => addContextField('')}
              >
                <Plus className="h-3 w-3" />
                Add another field
              </Button>
            </div>
          )}
        </div>

        <Button
          onClick={onSubmit}
          disabled={!situation.trim() || isGenerating}
          className="mt-1 w-full gap-2"
          size="lg"
        >
          {isGenerating ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Generating Questions...
            </>
          ) : (
            <>
              Generate Questions
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
