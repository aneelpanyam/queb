'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { aiFetch } from '@/lib/ai-fetch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Loader2,
  Check,
  Sparkles,
  AlertCircle,
  X,
  Plus,
} from 'lucide-react'
import type { FieldDefinition } from '@/lib/field-library'
import { resolvePrompt, computeDependencies } from '@/lib/field-library'
import type { InputMapping } from '@/lib/setup-config-types'

// ============================================================
// SmartField — renders any field from the library, fetches
// AI suggestions using the field's resolved prompt.
// ============================================================

export interface SmartFieldProps {
  field: FieldDefinition
  value: string | string[]
  allValues: Record<string, string | string[]>
  promptOverride?: string
  inputMappings?: Record<string, InputMapping>
  onChange: (value: string | string[]) => void
  disabled?: boolean
}

function stringVal(v: string | string[] | undefined): string {
  if (!v) return ''
  return Array.isArray(v) ? v.join(', ') : v
}

export function SmartField({
  field,
  value,
  allValues,
  promptOverride,
  inputMappings,
  onChange,
  disabled,
}: SmartFieldProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customInput, setCustomInput] = useState('')
  const hasSelection = Array.isArray(value) ? value.length > 0 : !!value
  const [showSuggestions, setShowSuggestions] = useState(!hasSelection)
  const fetchedForRef = useRef<string | null>(null)

  // Build context map (flatten multi-values for prompt resolution)
  const flat: Record<string, string> = {}
  for (const [k, v] of Object.entries(allValues)) {
    flat[k] = stringVal(v)
  }

  // Compute dependencies from the prompt template
  const { resolved: dependsOn } = computeDependencies(field, promptOverride)

  // Text-input mappings contribute values too — fold mapped field values in
  if (inputMappings) {
    for (const [ref, mapping] of Object.entries(inputMappings)) {
      if (mapping.type === 'field' && flat[mapping.fieldId]) {
        flat[ref] = flat[mapping.fieldId]
      }
    }
  }

  // Check that all resolved dependencies have values
  const depsMet = dependsOn.every((d) => flat[d]?.trim())
  const depsKey = dependsOn.map((d) => flat[d] || '').join('\x00')

  // Resolve the prompt
  const promptTemplate = promptOverride || field.prompt
  const resolvedPrompt = resolvePrompt(promptTemplate, flat)
  const hasUnresolved = /\{\{\w+\}\}/.test(resolvedPrompt)

  // Fetch suggestions when dependencies change
  useEffect(() => {
    if (!depsMet || hasUnresolved) return
    if (fetchedForRef.current === depsKey) return
    fetchedForRef.current = depsKey

    let cancelled = false
    setLoading(true)
    setError(null)

    aiFetch('/api/generate-field-suggestions', { prompt: resolvedPrompt }, { action: 'Field Suggestions' })
      .then((data) => {
        if (!cancelled) setSuggestions(data.suggestions || [])
      })
      .catch(() => {
        if (!cancelled) setError('Failed to generate suggestions')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      fetchedForRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey, depsMet, hasUnresolved, resolvedPrompt])

  const retry = useCallback(() => {
    fetchedForRef.current = null
    setLoading(true)
    setError(null)
    aiFetch('/api/generate-field-suggestions', { prompt: resolvedPrompt }, { action: 'Field Suggestions' })
      .then((data) => setSuggestions(data.suggestions || []))
      .catch(() => setError('Failed. Check connection.'))
      .finally(() => setLoading(false))
  }, [resolvedPrompt])

  // Selection handlers
  const isMulti = field.selectionMode === 'multi'
  const selectedArray: string[] = Array.isArray(value) ? value : value ? [value] : []

  const toggleItem = (item: string) => {
    if (isMulti) {
      const next = selectedArray.includes(item)
        ? selectedArray.filter((v) => v !== item)
        : [...selectedArray, item]
      onChange(next)
    } else {
      onChange(selectedArray.includes(item) ? '' : item)
      setShowSuggestions(false)
    }
  }

  const addCustom = () => {
    const trimmed = customInput.trim()
    if (!trimmed) return
    if (isMulti) {
      if (!selectedArray.includes(trimmed)) onChange([...selectedArray, trimmed])
    } else {
      onChange(trimmed)
      setShowSuggestions(false)
    }
    setCustomInput('')
  }

  const removeSelected = (item: string) => {
    if (isMulti) {
      onChange(selectedArray.filter((v) => v !== item))
    } else {
      onChange('')
    }
  }

  const missingDeps = dependsOn.filter((d) => !flat[d]?.trim())

  return (
    <div>
      {/* Label */}
      <div className="mb-1.5">
        <label className="block text-sm font-medium text-foreground">
          {field.name}
          <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
            ({isMulti ? 'multi-select' : 'single-select'})
          </span>
        </label>
        <p className="text-[11px] leading-tight text-muted-foreground">{field.description}</p>
      </div>

      {/* Selected values */}
      {selectedArray.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selectedArray.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              {item}
              <button
                type="button"
                onClick={() => removeSelected(item)}
                className="rounded-full p-0.5 hover:bg-primary/20"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Custom input */}
      {field.allowCustomValues && (
        <div className="mb-2 flex items-center gap-2">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder={field.placeholder || `Type your own ${field.name.toLowerCase()}...`}
            disabled={disabled}
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustom()
              }
            }}
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customInput.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Dependencies not met */}
      {missingDeps.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 shrink-0 text-primary/50" />
          <span>
            Fill in <strong>{missingDeps.join(', ')}</strong> to see AI suggestions
          </span>
        </div>
      )}

      {/* Loading */}
      {depsMet && loading && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <Sparkles className="h-3.5 w-3.5 text-primary/50" />
          <span>Generating {field.name.toLowerCase()} suggestions...</span>
        </div>
      )}

      {/* Error */}
      {depsMet && error && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
          <button
            type="button"
            onClick={retry}
            className="ml-auto rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/20"
          >
            Retry
          </button>
        </div>
      )}

      {/* Suggestions */}
      {depsMet && !loading && !error && suggestions.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowSuggestions((p) => !p)}
            className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
          >
            <Sparkles className="h-3 w-3" />
            {showSuggestions ? 'Hide' : 'Show'} AI suggestions ({suggestions.length})
          </button>
          {showSuggestions && (
            <div className="flex max-h-52 flex-wrap gap-1.5 overflow-auto rounded-lg border border-border bg-muted/20 p-2">
              {suggestions.map((s) => {
                const selected = selectedArray.includes(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleItem(s)}
                    disabled={disabled}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      selected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground hover:bg-primary/10 hover:text-primary'
                    } border ${selected ? 'border-primary' : 'border-border'}`}
                  >
                    {s}
                    {selected && <Check className="h-3 w-3" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
