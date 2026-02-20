'use client'

import type { ConfigStep, ConfigStepField } from '@/lib/setup-config-types'
import { getFieldKey } from '@/lib/setup-config-types'
import type { FieldDefinition } from '@/lib/field-library'
import { computeDependencies, sortFieldsByDependency } from '@/lib/field-library'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Plus, Trash2, X, Check, ChevronDown, ChevronRight, AlertTriangle,
  Pencil as PencilSmall,
} from 'lucide-react'

interface StepEditorProps {
  step: ConfigStep
  stepIdx: number
  totalSteps: number
  isExpanded: boolean
  allFields: FieldDefinition[]
  allSteps: ConfigStep[]
  allFieldIdsInConfig: string[]
  showFieldPicker: boolean
  groupedFields: Record<string, FieldDefinition[]>
  onToggleExpand: () => void
  onUpdateStep: (stepId: string, updates: Partial<ConfigStep>) => void
  onMoveStep: (stepId: string, dir: -1 | 1) => void
  onRemoveStep: (stepId: string) => void
  onAddField: (stepId: string, fieldId: string) => void
  onRemoveField: (stepId: string, key: string) => void
  onUpdateField: (stepId: string, key: string, updates: Partial<ConfigStepField>) => void
  onToggleFieldPicker: () => void
}

/** Collect all effective keys across all config steps for dependency resolution */
function configCustomNames(allSteps: ConfigStep[]): Set<string> {
  const names = new Set<string>()
  for (const s of allSteps) {
    for (const f of s.fields) {
      names.add(getFieldKey(f))
    }
  }
  return names
}

export function StepEditor({
  step, stepIdx, totalSteps, isExpanded,
  allFields, allSteps, allFieldIdsInConfig,
  showFieldPicker, groupedFields,
  onToggleExpand, onUpdateStep, onMoveStep, onRemoveStep,
  onAddField, onRemoveField, onUpdateField, onToggleFieldPicker,
}: StepEditorProps) {
  const extraKnownIds = configCustomNames(allSteps)

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex gap-0.5">
          <button onClick={() => onMoveStep(step.id, -1)} disabled={stepIdx === 0} className="rounded p-0.5 text-muted-foreground/50 hover:text-foreground disabled:opacity-30">▲</button>
          <button onClick={() => onMoveStep(step.id, 1)} disabled={stepIdx === totalSteps - 1} className="rounded p-0.5 text-muted-foreground/50 hover:text-foreground disabled:opacity-30">▼</button>
        </div>
        <button onClick={onToggleExpand} className="flex flex-1 items-center gap-2 text-left">
          {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
          <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">{stepIdx + 1}</span>
          <span className="text-sm font-semibold text-foreground">{step.name || '(unnamed)'}</span>
          <span className="text-[10px] text-muted-foreground">{step.fields.length} fields</span>
        </button>
        <button onClick={() => onRemoveStep(step.id)} className="rounded p-1 text-muted-foreground hover:text-destructive" title="Remove step">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-border bg-muted/20 px-4 py-3">
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-medium text-muted-foreground">Step Name</label>
              <Input value={step.name} onChange={(e) => onUpdateStep(step.id, { name: e.target.value })} className="h-8 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium text-muted-foreground">Description</label>
              <Input value={step.description} onChange={(e) => onUpdateStep(step.id, { description: e.target.value })} className="h-8 text-sm" />
            </div>
          </div>

          <div className="space-y-1.5">
            {(() => {
              const overrides: Record<string, string> = {}
              for (const f of step.fields) { if (f.promptOverride) overrides[getFieldKey(f)] = f.promptOverride }
              return sortFieldsByDependency(step.fields.map((f) => getFieldKey(f)), overrides)
            })().map((sortedKey) => {
              const csf = step.fields.find((f) => getFieldKey(f) === sortedKey)
              if (!csf) return null
              const fieldDef = allFields.find((f) => f.id === csf.fieldId)
              if (!fieldDef) return null
              const isCustom = csf.fieldId === 'empty-field'
              const deps = computeDependencies(
                isCustom ? (csf.promptOverride || '') : fieldDef,
                isCustom ? undefined : csf.promptOverride,
                extraKnownIds,
              )
              const allConfigFieldKeys = allSteps.flatMap((s) => s.fields.map((f) => getFieldKey(f)))
              const missingFromConfig = deps.resolved.filter((d) => !allConfigFieldKeys.includes(d))

              const fieldStepIdx = allSteps.findIndex((s) => s.fields.some((f) => getFieldKey(f) === sortedKey))
              const orderWarnings = deps.resolved.filter((depId) => {
                const depStepIdx = allSteps.findIndex((s) => s.fields.some((f) => getFieldKey(f) === depId))
                return depStepIdx > fieldStepIdx
              })

              return (
                <FieldCard
                  key={sortedKey}
                  csf={csf}
                  fieldDef={fieldDef}
                  deps={deps}
                  allFields={allFields}
                  allSteps={allSteps}
                  missingFromConfig={missingFromConfig}
                  orderWarnings={orderWarnings}
                  stepId={step.id}
                  onUpdateField={onUpdateField}
                  onRemoveField={onRemoveField}
                />
              )
            })}
          </div>

          <div className="relative mt-2">
            <Button variant="outline" size="sm" onClick={onToggleFieldPicker} className="h-7 gap-1 text-xs">
              <Plus className="h-3 w-3" /> Add Field
            </Button>
            {showFieldPicker && (
              <div className="absolute left-0 top-8 z-50 max-h-60 w-72 overflow-auto rounded-lg border border-border bg-popover p-2 shadow-lg">
                {Object.entries(groupedFields).map(([cat, catFields]) => (
                  <div key={cat}>
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{cat}</div>
                    {catFields.map((f) => {
                      const isEmptyField = f.id === 'empty-field'
                      const inUse = !isEmptyField && allFieldIdsInConfig.includes(f.id)
                      return (
                        <button
                          key={f.id}
                          disabled={inUse}
                          onClick={() => onAddField(step.id, f.id)}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                            inUse ? 'opacity-40' : 'hover:bg-muted'
                          }`}
                        >
                          <span className="font-medium text-foreground">{f.name}</span>
                          <code className="text-[10px] text-muted-foreground">{f.id}</code>
                          {inUse && <Check className="ml-auto h-3 w-3 text-primary" />}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FieldCard({
  csf, fieldDef, deps, allFields, allSteps, missingFromConfig, orderWarnings, stepId,
  onUpdateField, onRemoveField,
}: {
  csf: ConfigStepField
  fieldDef: FieldDefinition
  deps: { resolved: string[]; unresolved: string[] }
  allFields: FieldDefinition[]
  allSteps: ConfigStep[]
  missingFromConfig: string[]
  orderWarnings: string[]
  stepId: string
  onUpdateField: (stepId: string, key: string, updates: Partial<ConfigStepField>) => void
  onRemoveField: (stepId: string, key: string) => void
}) {
  const key = getFieldKey(csf)
  const isCustom = csf.fieldId === 'empty-field'
  const displayName = csf.customLabel || fieldDef.name
  const displayId = csf.customName || fieldDef.id
  const selectionMode = csf.customSelectionMode || fieldDef.selectionMode

  const depNameForId = (depId: string) => {
    const libField = allFields.find((f) => f.id === depId)
    if (libField) return libField.name
    for (const s of allSteps) {
      for (const f of s.fields) {
        if (f.customName === depId) return f.customLabel || depId
      }
    }
    return depId
  }

  return (
    <div className={`rounded-md border bg-card px-3 py-2 ${isCustom ? 'border-primary/30' : 'border-border'}`}>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">{displayName}</span>
            <code className="text-[10px] text-muted-foreground">{displayId}</code>
            <span className="text-[10px] text-muted-foreground">{selectionMode}</span>
            {isCustom && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">Custom</span>}
          </div>
        </div>
        <label className="flex items-center gap-1 text-[10px]">
          <input
            type="checkbox"
            checked={csf.required}
            onChange={(e) => onUpdateField(stepId, key, { required: e.target.checked })}
            className="rounded"
          />
          Required
        </label>
        <button onClick={() => onRemoveField(stepId, key)} className="rounded p-1 text-muted-foreground hover:text-destructive">
          <X className="h-3 w-3" />
        </button>
      </div>

      {isCustom && (
        <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
          <div>
            <label className="mb-0.5 block text-[9px] font-medium text-muted-foreground">Name (ID)</label>
            <Input
              value={csf.customName || ''}
              onChange={(e) => onUpdateField(stepId, key, { customName: e.target.value })}
              className="h-6 text-[11px]"
              placeholder="camelCaseId"
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[9px] font-medium text-muted-foreground">Label</label>
            <Input
              value={csf.customLabel || ''}
              onChange={(e) => onUpdateField(stepId, key, { customLabel: e.target.value })}
              className="h-6 text-[11px]"
              placeholder="Display Label"
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[9px] font-medium text-muted-foreground">Mode</label>
            <select
              value={csf.customSelectionMode || 'single'}
              onChange={(e) => onUpdateField(stepId, key, { customSelectionMode: e.target.value as 'single' | 'multi' })}
              className="h-6 w-full rounded border border-border bg-background px-1 text-[11px]"
            >
              <option value="single">single</option>
              <option value="multi">multi</option>
            </select>
          </div>
        </div>
      )}

      {deps.resolved.length > 0 && (
        <div className="mt-1 flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-muted-foreground">Requires:</span>
          {deps.resolved.map((depId) => {
            const depName = depNameForId(depId)
            const isMissing = missingFromConfig.includes(depId)
            const hasOrderIssue = orderWarnings.includes(depId)
            return (
              <span
                key={depId}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                  isMissing
                    ? 'bg-destructive/10 text-destructive border-destructive/30'
                    : hasOrderIssue
                      ? 'bg-amber-500/10 text-amber-700 border-amber-500/30'
                      : 'bg-primary/10 text-primary border-primary/30'
                }`}
              >
                {depName}
                {isMissing && ' (missing)'}
                {hasOrderIssue && !isMissing && ' (later step)'}
              </span>
            )
          })}
        </div>
      )}

      {deps.unresolved.length > 0 && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <AlertTriangle className="h-3 w-3 text-amber-500" />
          <span className="text-[10px] text-amber-600">
            Unknown refs: {deps.unresolved.map((r) => `{{${r}}}`).join(', ')}
          </span>
          {deps.unresolved.map((ref) => {
            const mapping = csf.inputMappings?.[ref]
            const isText = mapping?.type === 'text'
            return (
              <button
                key={ref}
                type="button"
                onClick={() => {
                  const current = csf.inputMappings || {}
                  if (isText) {
                    const { [ref]: _, ...rest } = current
                    onUpdateField(stepId, key, {
                      inputMappings: Object.keys(rest).length > 0 ? rest : undefined,
                    })
                  } else {
                    onUpdateField(stepId, key, {
                      inputMappings: { ...current, [ref]: { type: 'text' } },
                    })
                  }
                }}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  isText
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'bg-muted text-muted-foreground border border-transparent hover:border-primary/30'
                }`}
              >
                {ref}: {isText ? 'text input' : 'unmapped'}
              </button>
            )
          })}
        </div>
      )}

      {csf.promptOverride !== undefined && (
        <div className="mt-1.5">
          <textarea
            value={csf.promptOverride}
            onChange={(e) => onUpdateField(stepId, key, { promptOverride: e.target.value })}
            rows={2}
            className="w-full rounded border border-border bg-muted/30 px-2 py-1 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Custom prompt override..."
          />
          {!isCustom && (
            <button
              type="button"
              onClick={() => onUpdateField(stepId, key, { promptOverride: undefined })}
              className="mt-0.5 text-[10px] text-muted-foreground hover:text-destructive"
            >
              Remove override
            </button>
          )}
        </div>
      )}
      {csf.promptOverride === undefined && !isCustom && (
        <button
          type="button"
          onClick={() => onUpdateField(stepId, key, { promptOverride: fieldDef.prompt })}
          className="mt-1 flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-primary"
        >
          <PencilSmall className="h-2.5 w-2.5" /> Customize prompt
        </button>
      )}
    </div>
  )
}
