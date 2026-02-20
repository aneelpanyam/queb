'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/use-auth'
import { configStorage } from '@/lib/setup-config-storage'
import type { SetupConfiguration, ConfigStep, ConfigStepField, ConfigOutput } from '@/lib/setup-config-types'
import { fieldStorage, type FieldDefinition, computeDependencies, getTransitiveDependencies, sortFieldsByDependency } from '@/lib/field-library'
import { outputTypeStorage, type OutputTypeDefinition, type OutputTypeField, type FieldColor, getDefaultSectionDrivers, getDefaultInstructionDirectives } from '@/lib/output-type-library'
import type { SectionDriver, InstructionDirective } from '@/lib/setup-config-types'
import { LoginScreen } from '@/components/login-screen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  BookOpen,
  LogOut,
  Plus,
  Pencil as PencilSmall,
  Trash2,
  X,
  Check,
  Settings2,
  Copy,
  Play,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  FileOutput,
  Layers,
  RotateCcw,
  ScrollText,
  Sparkles,
  Loader2,
  Wand2,
  Download,
  Upload,
  ListChecks,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { downloadJson, buildFilename, openFilePicker, readJsonFile, type ExportBundle } from '@/lib/export-import'

// ============================================================
// Types for the builder form
// ============================================================

interface BuilderState {
  name: string
  description: string
  steps: ConfigStep[]
  outputs: ConfigOutput[]
}

const FIELD_COLOR_OPTIONS: { value: FieldColor | ''; label: string }[] = [
  { value: '', label: '—' },
  { value: 'amber', label: 'Amber' },
  { value: 'blue', label: 'Blue' },
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'violet', label: 'Violet' },
  { value: 'primary', label: 'Primary' },
  { value: 'none', label: 'None' },
]

const FIELD_ICON_OPTIONS = [
  '', 'Target', 'ArrowUpRight', 'AlertTriangle', 'Shield', 'Zap', 'Clock', 'Mail',
  'Sparkles', 'ThumbsUp', 'ThumbsDown', 'MessageSquare', 'GitBranch', 'Info',
  'CheckCheck', 'ListChecks', 'BarChart3', 'AlertOctagon', 'Lightbulb', 'ClipboardCheck',
  'Bookmark', 'Repeat', 'CalendarClock', 'Shuffle', 'FileText', 'ShieldQuestion',
  'Trophy', 'DollarSign', 'Users', 'Compass', 'FileOutput', 'Scale', 'Swords',
]

const emptyBuilder = (): BuilderState => ({
  name: '',
  description: '',
  steps: [{ id: `s-${Date.now()}`, name: 'Step 1', description: '', fields: [] }],
  outputs: [],
})

function configToBuilder(c: SetupConfiguration): BuilderState {
  return { name: c.name, description: c.description, steps: c.steps, outputs: c.outputs }
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

// ============================================================
// Configuration builder component
// ============================================================

function ConfigBuilder({
  initial,
  allFields,
  allOutputTypes,
  onSave,
  onCancel,
}: {
  initial: BuilderState
  allFields: FieldDefinition[]
  allOutputTypes: OutputTypeDefinition[]
  onSave: (data: BuilderState) => void
  onCancel: () => void
}) {
  const [state, setState] = useState<BuilderState>(initial)
  const [expandedStep, setExpandedStep] = useState<string | null>(initial.steps[0]?.id || null)
  const [showFieldPicker, setShowFieldPicker] = useState<string | null>(null)
  const [showOutputPicker, setShowOutputPicker] = useState(false)
  const [expandedOutput, setExpandedOutput] = useState<string | null>(null)

  const allFieldIdsInConfig = state.steps.flatMap((s) => s.fields.map((f) => f.fieldId))

  const canSave = state.name.trim() && state.steps.length > 0 && state.outputs.length > 0

  // Step management
  const addStep = () => {
    const newStep: ConfigStep = { id: `s-${uid()}`, name: `Step ${state.steps.length + 1}`, description: '', fields: [] }
    setState((p) => ({ ...p, steps: [...p.steps, newStep] }))
    setExpandedStep(newStep.id)
  }

  const removeStep = (stepId: string) => {
    setState((p) => ({ ...p, steps: p.steps.filter((s) => s.id !== stepId) }))
  }

  const updateStep = (stepId: string, updates: Partial<ConfigStep>) => {
    setState((p) => ({
      ...p,
      steps: p.steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)),
    }))
  }

  const moveStep = (stepId: string, dir: -1 | 1) => {
    setState((p) => {
      const idx = p.steps.findIndex((s) => s.id === stepId)
      if (idx === -1 || idx + dir < 0 || idx + dir >= p.steps.length) return p
      const steps = [...p.steps]
      ;[steps[idx], steps[idx + dir]] = [steps[idx + dir], steps[idx]]
      return { ...p, steps }
    })
  }

  // Field management within a step — auto-pulls prompt-derived dependencies
  const addFieldToStep = (stepId: string, fieldId: string) => {
    const currentFieldIds = new Set(state.steps.flatMap((s) => s.fields.map((f) => f.fieldId)))
    const transitiveDeps = getTransitiveDependencies(fieldId)
    const missingDeps = transitiveDeps.filter((d) => !currentFieldIds.has(d))

    const newFields: ConfigStepField[] = [
      ...missingDeps.map((depId) => ({ fieldId: depId, required: false } as ConfigStepField)),
      { fieldId, required: false },
    ]

    const step = state.steps.find((s) => s.id === stepId)
    if (!step) return
    const existingIds = new Set(step.fields.map((f) => f.fieldId))
    const toAdd = newFields.filter((f) => !existingIds.has(f.fieldId))

    updateStep(stepId, { fields: [...step.fields, ...toAdd] })
    setShowFieldPicker(null)

    if (missingDeps.length > 0) {
      const names = missingDeps.map((d) => allFields.find((f) => f.id === d)?.name || d).join(', ')
      toast?.(`Auto-added dependencies: ${names}`)
    }
  }

  const removeFieldFromStep = (stepId: string, fieldId: string) => {
    const step = state.steps.find((s) => s.id === stepId)
    if (!step) return
    updateStep(stepId, { fields: step.fields.filter((f) => f.fieldId !== fieldId) })
  }

  const updateFieldInStep = (stepId: string, fieldId: string, updates: Partial<ConfigStepField>) => {
    const step = state.steps.find((s) => s.id === stepId)
    if (!step) return
    updateStep(stepId, {
      fields: step.fields.map((f) => (f.fieldId === fieldId ? { ...f, ...updates } : f)),
    })
  }

  // Output management
  const addOutput = (otId: string) => {
    const otDef = allOutputTypes.find((ot) => ot.id === otId)
    const driverDefaults = otDef ? getDefaultSectionDrivers(otDef) : []
    const directiveDefaults = otDef ? getDefaultInstructionDirectives(otDef) : []
    setState((p) => ({
      ...p,
      outputs: [...p.outputs, {
        outputTypeId: otId,
        sectionDrivers: driverDefaults.length > 0 ? driverDefaults.map((d) => ({ ...d })) : undefined,
        instructionDirectives: directiveDefaults.length > 0 ? directiveDefaults.map((d) => ({ ...d })) : undefined,
      }],
    }))
    setShowOutputPicker(false)
  }

  const removeOutput = (otId: string) => {
    setState((p) => ({ ...p, outputs: p.outputs.filter((o) => o.outputTypeId !== otId) }))
  }

  const updateOutput = (otId: string, updates: Partial<ConfigOutput>) => {
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) => (o.outputTypeId === otId ? { ...o, ...updates } : o)),
    }))
  }

  const addSectionDriver = (otId: string) => {
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) =>
        o.outputTypeId === otId
          ? { ...o, sectionDrivers: [...(o.sectionDrivers || []), { name: '', description: '' }] }
          : o
      ),
    }))
  }

  const removeSectionDriver = (otId: string, idx: number) => {
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) => {
        if (o.outputTypeId !== otId) return o
        const drivers = [...(o.sectionDrivers || [])]
        drivers.splice(idx, 1)
        return { ...o, sectionDrivers: drivers.length > 0 ? drivers : undefined }
      }),
    }))
  }

  const updateSectionDriver = (otId: string, idx: number, updates: Partial<SectionDriver>) => {
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) => {
        if (o.outputTypeId !== otId) return o
        const drivers = [...(o.sectionDrivers || [])]
        drivers[idx] = { ...drivers[idx], ...updates }
        return { ...o, sectionDrivers: drivers }
      }),
    }))
  }

  const resetSectionDrivers = (otId: string) => {
    const otDef = allOutputTypes.find((ot) => ot.id === otId)
    const defaults = otDef ? getDefaultSectionDrivers(otDef) : []
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) =>
        o.outputTypeId === otId
          ? { ...o, sectionDrivers: defaults.length > 0 ? defaults.map((d) => ({ ...d })) : undefined }
          : o
      ),
    }))
  }

  // Instruction directive management
  const addDirective = (otId: string) => {
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) =>
        o.outputTypeId === otId
          ? { ...o, instructionDirectives: [...(o.instructionDirectives || []), { label: '', content: '' }] }
          : o
      ),
    }))
  }

  const removeDirective = (otId: string, idx: number) => {
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) => {
        if (o.outputTypeId !== otId) return o
        const dirs = [...(o.instructionDirectives || [])]
        dirs.splice(idx, 1)
        return { ...o, instructionDirectives: dirs.length > 0 ? dirs : undefined }
      }),
    }))
  }

  const updateDirective = (otId: string, idx: number, updates: Partial<InstructionDirective>) => {
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) => {
        if (o.outputTypeId !== otId) return o
        const dirs = [...(o.instructionDirectives || [])]
        dirs[idx] = { ...dirs[idx], ...updates }
        return { ...o, instructionDirectives: dirs }
      }),
    }))
  }

  const resetDirectives = (otId: string) => {
    const otDef = allOutputTypes.find((ot) => ot.id === otId)
    const defaults = otDef ? getDefaultInstructionDirectives(otDef) : []
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) =>
        o.outputTypeId === otId
          ? { ...o, instructionDirectives: defaults.length > 0 ? defaults.map((d) => ({ ...d })) : undefined }
          : o
      ),
    }))
  }

  const clearDirectives = (otId: string) => {
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) =>
        o.outputTypeId === otId ? { ...o, instructionDirectives: undefined } : o
      ),
    }))
  }

  // Element field override management
  const addFieldOverride = (otId: string) => {
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) =>
        o.outputTypeId === otId
          ? { ...o, fieldOverrides: [...(o.fieldOverrides || []), { key: '', label: '', type: 'long-text' as const }] }
          : o
      ),
    }))
  }

  const removeFieldOverride = (otId: string, idx: number) => {
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) => {
        if (o.outputTypeId !== otId) return o
        const fields = [...(o.fieldOverrides || [])]
        fields.splice(idx, 1)
        return { ...o, fieldOverrides: fields.length > 0 ? fields : undefined }
      }),
    }))
  }

  const updateFieldOverride = (otId: string, idx: number, updates: Partial<OutputTypeField>) => {
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) => {
        if (o.outputTypeId !== otId) return o
        const fields = [...(o.fieldOverrides || [])]
        fields[idx] = { ...fields[idx], ...updates }
        return { ...o, fieldOverrides: fields }
      }),
    }))
  }

  const resetFieldOverrides = (otId: string) => {
    const otDef = allOutputTypes.find((ot) => ot.id === otId)
    if (!otDef) return
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) =>
        o.outputTypeId === otId
          ? { ...o, fieldOverrides: otDef.fields.map((f) => ({ ...f })) }
          : o
      ),
    }))
  }

  const clearFieldOverrides = (otId: string) => {
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) =>
        o.outputTypeId === otId ? { ...o, fieldOverrides: undefined } : o
      ),
    }))
  }

  const outputTypeIds = state.outputs.map((o) => o.outputTypeId)

  // Group available fields by category
  const grouped = allFields.reduce<Record<string, FieldDefinition[]>>((acc, f) => {
    ;(acc[f.category] ??= []).push(f)
    return acc
  }, {})

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-card shadow-sm">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Input
              value={state.name}
              onChange={(e) => setState((p) => ({ ...p, name: e.target.value }))}
              placeholder="Configuration name..."
              className="max-w-md border-none bg-transparent px-0 text-lg font-bold text-foreground focus-visible:ring-0"
            />
            <Input
              value={state.description}
              onChange={(e) => setState((p) => ({ ...p, description: e.target.value }))}
              placeholder="Description..."
              className="mt-1 max-w-lg border-none bg-transparent px-0 text-sm text-muted-foreground focus-visible:ring-0"
            />
          </div>
          <button onClick={onCancel} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="border-b border-border px-6 py-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Steps & Fields</h3>
          <Button variant="outline" size="sm" onClick={addStep} className="h-7 gap-1 text-xs">
            <Plus className="h-3 w-3" /> Add Step
          </Button>
        </div>

        <div className="space-y-2">
          {state.steps.map((step, stepIdx) => {
            const isExpanded = expandedStep === step.id
            return (
              <div key={step.id} className="rounded-lg border border-border">
                {/* Step header */}
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex gap-0.5">
                    <button onClick={() => moveStep(step.id, -1)} disabled={stepIdx === 0} className="rounded p-0.5 text-muted-foreground/50 hover:text-foreground disabled:opacity-30">▲</button>
                    <button onClick={() => moveStep(step.id, 1)} disabled={stepIdx === state.steps.length - 1} className="rounded p-0.5 text-muted-foreground/50 hover:text-foreground disabled:opacity-30">▼</button>
                  </div>
                  <button onClick={() => setExpandedStep(isExpanded ? null : step.id)} className="flex flex-1 items-center gap-2 text-left">
                    {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">{stepIdx + 1}</span>
                    <span className="text-sm font-semibold text-foreground">{step.name || '(unnamed)'}</span>
                    <span className="text-[10px] text-muted-foreground">{step.fields.length} fields</span>
                  </button>
                  <button onClick={() => removeStep(step.id)} className="rounded p-1 text-muted-foreground hover:text-destructive" title="Remove step">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                {/* Step content */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 px-4 py-3">
                    <div className="mb-3 grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[10px] font-medium text-muted-foreground">Step Name</label>
                        <Input value={step.name} onChange={(e) => updateStep(step.id, { name: e.target.value })} className="h-8 text-sm" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-medium text-muted-foreground">Description</label>
                        <Input value={step.description} onChange={(e) => updateStep(step.id, { description: e.target.value })} className="h-8 text-sm" />
                      </div>
                    </div>

                    {/* Fields in this step — sorted by dependency order */}
                    <div className="space-y-1.5">
                      {(() => {
                        const overrides: Record<string, string> = {}
                        for (const f of step.fields) { if (f.promptOverride) overrides[f.fieldId] = f.promptOverride }
                        return sortFieldsByDependency(step.fields.map((f) => f.fieldId), overrides)
                      })().map((sortedId) => {
                        const csf = step.fields.find((f) => f.fieldId === sortedId)
                        if (!csf) return null
                        const fieldDef = allFields.find((f) => f.id === csf.fieldId)
                        if (!fieldDef) return null
                        const deps = computeDependencies(fieldDef, csf.promptOverride)
                        const allConfigFieldIds = state.steps.flatMap((s) => s.fields.map((f) => f.fieldId))
                        const missingFromConfig = deps.resolved.filter((d) => !allConfigFieldIds.includes(d))

                        const fieldStepIdx = state.steps.findIndex((s) => s.fields.some((f) => f.fieldId === csf.fieldId))
                        const orderWarnings = deps.resolved.filter((depId) => {
                          const depStepIdx = state.steps.findIndex((s) => s.fields.some((f) => f.fieldId === depId))
                          return depStepIdx > fieldStepIdx
                        })

                        return (
                          <div key={csf.fieldId} className="rounded-md border border-border bg-card px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-foreground">{fieldDef.name}</span>
                                  <code className="text-[10px] text-muted-foreground">{fieldDef.id}</code>
                                  <span className="text-[10px] text-muted-foreground">{fieldDef.selectionMode}</span>
                                </div>
                              </div>
                              <label className="flex items-center gap-1 text-[10px]">
                                <input
                                  type="checkbox"
                                  checked={csf.required}
                                  onChange={(e) => updateFieldInStep(step.id, csf.fieldId, { required: e.target.checked })}
                                  className="rounded"
                                />
                                Required
                              </label>
                              <button onClick={() => removeFieldFromStep(step.id, csf.fieldId)} className="rounded p-1 text-muted-foreground hover:text-destructive">
                                <X className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Computed dependencies (read-only) */}
                            {deps.resolved.length > 0 && (
                              <div className="mt-1 flex flex-wrap items-center gap-1">
                                <span className="text-[10px] text-muted-foreground">Requires:</span>
                                {deps.resolved.map((depId) => {
                                  const depName = allFields.find((f) => f.id === depId)?.name || depId
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

                            {/* Unresolved prompt references */}
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
                                          updateFieldInStep(step.id, csf.fieldId, {
                                            inputMappings: Object.keys(rest).length > 0 ? rest : undefined,
                                          })
                                        } else {
                                          updateFieldInStep(step.id, csf.fieldId, {
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

                            {/* Prompt override */}
                            {csf.promptOverride !== undefined && (
                              <div className="mt-1.5">
                                <textarea
                                  value={csf.promptOverride}
                                  onChange={(e) => updateFieldInStep(step.id, csf.fieldId, { promptOverride: e.target.value })}
                                  rows={2}
                                  className="w-full rounded border border-border bg-muted/30 px-2 py-1 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                  placeholder="Custom prompt override..."
                                />
                                <button
                                  type="button"
                                  onClick={() => updateFieldInStep(step.id, csf.fieldId, { promptOverride: undefined })}
                                  className="mt-0.5 text-[10px] text-muted-foreground hover:text-destructive"
                                >
                                  Remove override
                                </button>
                              </div>
                            )}
                            {csf.promptOverride === undefined && (
                              <button
                                type="button"
                                onClick={() => updateFieldInStep(step.id, csf.fieldId, { promptOverride: fieldDef.prompt })}
                                className="mt-1 flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-primary"
                              >
                                <PencilSmall className="h-2.5 w-2.5" /> Customize prompt
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Add field */}
                    <div className="relative mt-2">
                      <Button variant="outline" size="sm" onClick={() => setShowFieldPicker(showFieldPicker === step.id ? null : step.id)} className="h-7 gap-1 text-xs">
                        <Plus className="h-3 w-3" /> Add Field
                      </Button>
                      {showFieldPicker === step.id && (
                        <div className="absolute left-0 top-8 z-50 max-h-60 w-72 overflow-auto rounded-lg border border-border bg-popover p-2 shadow-lg">
                          {Object.entries(grouped).map(([cat, catFields]) => (
                            <div key={cat}>
                              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{cat}</div>
                              {catFields.map((f) => {
                                const inUse = allFieldIdsInConfig.includes(f.id)
                                return (
                                  <button
                                    key={f.id}
                                    disabled={inUse}
                                    onClick={() => addFieldToStep(step.id, f.id)}
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
          })}
        </div>
      </div>

      {/* Outputs */}
      <div className="border-b border-border px-6 py-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
            <FileOutput className="mr-1 inline h-3 w-3" /> Outputs to Produce
          </h3>
        </div>

        <div className="space-y-2">
          {state.outputs.map((co) => {
            const otDef = allOutputTypes.find((ot) => ot.id === co.outputTypeId)
            if (!otDef) return null
            const isExpanded = expandedOutput === co.outputTypeId
            const drivers = co.sectionDrivers || []
            const defaults = getDefaultSectionDrivers(otDef)
            const defaultDirectives = getDefaultInstructionDirectives(otDef)
            const directives = co.instructionDirectives || []
            const hasCustomDirectives = co.instructionDirectives !== undefined
            return (
              <div key={co.outputTypeId} className="rounded-lg border border-border">
                <div className="flex items-center gap-2 px-3 py-2">
                  <button onClick={() => setExpandedOutput(isExpanded ? null : co.outputTypeId)} className="rounded p-0.5 text-muted-foreground hover:text-foreground">
                    {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-foreground">{otDef.name}</span>
                    <span className="ml-2 text-[10px] text-muted-foreground">{otDef.sectionLabel} → {otDef.elementLabel}</span>
                    {drivers.length > 0 && (
                      <span className="ml-2 text-[10px] text-primary">{drivers.length} {otDef.sectionLabel.toLowerCase()}s</span>
                    )}
                    {hasCustomDirectives && (
                      <span className="ml-1.5 text-[10px] text-amber-600">{directives.length} directives</span>
                    )}
                    {co.fieldOverrides && (
                      <span className="ml-1.5 text-[10px] text-emerald-600">{co.fieldOverrides.length} fields</span>
                    )}
                  </div>
                  <button onClick={() => removeOutput(co.outputTypeId)} className="rounded p-1 text-muted-foreground hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 px-4 py-3 space-y-4">
                    {/* Section drivers */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Layers className="h-3 w-3 text-primary/60" />
                          <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
                            {otDef.sectionLabel} Drivers
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            — the AI generates one {otDef.sectionLabel.toLowerCase()} per driver
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {defaults.length > 0 && (
                            <button
                              onClick={() => resetSectionDrivers(co.outputTypeId)}
                              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="Reset to defaults"
                            >
                              <RotateCcw className="h-2.5 w-2.5" /> Reset
                            </button>
                          )}
                          <button
                            onClick={() => addSectionDriver(co.outputTypeId)}
                            className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10"
                          >
                            <Plus className="h-2.5 w-2.5" /> Add
                          </button>
                        </div>
                      </div>

                      {drivers.length === 0 ? (
                        <div className="rounded-md border border-dashed border-border bg-card px-3 py-4 text-center">
                          <p className="text-[11px] text-muted-foreground">
                            No {otDef.sectionLabel.toLowerCase()} drivers defined. The AI will auto-generate sections.
                          </p>
                          {defaults.length > 0 && (
                            <button
                              onClick={() => resetSectionDrivers(co.outputTypeId)}
                              className="mt-1.5 text-[11px] font-medium text-primary hover:underline"
                            >
                              Load {defaults.length} defaults
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {drivers.map((driver, idx) => (
                            <div key={idx} className="group/driver flex items-start gap-2 rounded-md border border-border bg-card px-2 py-1.5">
                              <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-primary/10 text-[9px] font-bold text-primary">
                                {idx + 1}
                              </span>
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <input
                                  value={driver.name}
                                  onChange={(e) => updateSectionDriver(co.outputTypeId, idx, { name: e.target.value })}
                                  placeholder={`${otDef.sectionLabel} name...`}
                                  className="w-full border-none bg-transparent px-0 text-[11px] font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                                />
                                <input
                                  value={driver.description}
                                  onChange={(e) => updateSectionDriver(co.outputTypeId, idx, { description: e.target.value })}
                                  placeholder="Description..."
                                  className="w-full border-none bg-transparent px-0 text-[10px] text-muted-foreground placeholder:text-muted-foreground/30 focus:outline-none"
                                />
                              </div>
                              <button
                                onClick={() => removeSectionDriver(co.outputTypeId, idx)}
                                className="mt-0.5 rounded p-0.5 text-muted-foreground/40 opacity-0 transition-opacity hover:text-destructive group-hover/driver:opacity-100"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Instruction directives */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <ScrollText className="h-3 w-3 text-primary/60" />
                          <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
                            Instruction Directives
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            — rules the AI follows per {otDef.sectionLabel.toLowerCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {hasCustomDirectives && defaultDirectives.length > 0 && (
                            <button
                              onClick={() => clearDirectives(co.outputTypeId)}
                              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="Use defaults (don't customize)"
                            >
                              <X className="h-2.5 w-2.5" /> Use defaults
                            </button>
                          )}
                          {hasCustomDirectives && defaultDirectives.length > 0 && (
                            <button
                              onClick={() => resetDirectives(co.outputTypeId)}
                              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="Reset to defaults"
                            >
                              <RotateCcw className="h-2.5 w-2.5" /> Reset
                            </button>
                          )}
                          {hasCustomDirectives && (
                            <button
                              onClick={() => addDirective(co.outputTypeId)}
                              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10"
                            >
                              <Plus className="h-2.5 w-2.5" /> Add
                            </button>
                          )}
                        </div>
                      </div>

                      {hasCustomDirectives ? (
                        directives.length === 0 ? (
                          <div className="rounded-md border border-dashed border-border bg-card px-3 py-4 text-center">
                            <p className="text-[11px] text-muted-foreground">
                              No directives defined. The AI will have no specific instructions.
                            </p>
                            {defaultDirectives.length > 0 && (
                              <button
                                onClick={() => resetDirectives(co.outputTypeId)}
                                className="mt-1.5 text-[11px] font-medium text-primary hover:underline"
                              >
                                Load {defaultDirectives.length} defaults
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {directives.map((dir, idx) => (
                              <div key={idx} className="group/dir flex items-start gap-2 rounded-md border border-border bg-card px-2 py-1.5">
                                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-amber-500/10 text-[9px] font-bold text-amber-700">
                                  {idx + 1}
                                </span>
                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <input
                                    value={dir.label}
                                    onChange={(e) => updateDirective(co.outputTypeId, idx, { label: e.target.value })}
                                    placeholder="Directive label..."
                                    className="w-full border-none bg-transparent px-0 text-[11px] font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                                  />
                                  <textarea
                                    value={dir.content}
                                    onChange={(e) => updateDirective(co.outputTypeId, idx, { content: e.target.value })}
                                    placeholder="Instruction content..."
                                    rows={1}
                                    className="w-full resize-none border-none bg-transparent px-0 text-[10px] text-muted-foreground placeholder:text-muted-foreground/30 focus:outline-none"
                                    onInput={(e) => {
                                      const el = e.currentTarget
                                      el.style.height = 'auto'
                                      el.style.height = el.scrollHeight + 'px'
                                    }}
                                  />
                                </div>
                                <button
                                  onClick={() => removeDirective(co.outputTypeId, idx)}
                                  className="mt-0.5 rounded p-0.5 text-muted-foreground/40 opacity-0 transition-opacity hover:text-destructive group-hover/dir:opacity-100"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )
                      ) : (
                        <div className="rounded-md border border-dashed border-border bg-card px-3 py-3 text-center">
                          <p className="text-[11px] text-muted-foreground">
                            {defaultDirectives.length > 0
                              ? `Using ${defaultDirectives.length} default directives.`
                              : 'No directives configured.'}
                          </p>
                          <button
                            onClick={() => resetDirectives(co.outputTypeId)}
                            className="mt-1.5 flex items-center gap-0.5 mx-auto text-[11px] font-medium text-primary hover:underline"
                          >
                            <PencilSmall className="h-2.5 w-2.5" /> Customize directives
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Element fields */}
                    {(() => {
                      const fieldOverrides = co.fieldOverrides
                      const hasCustomFields = fieldOverrides !== undefined
                      const currentFields = fieldOverrides || []
                      return (
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <ListChecks className="h-3 w-3 text-primary/60" />
                              <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
                                Element Fields
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                — detail sections shown for each {otDef.elementLabel.toLowerCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {hasCustomFields && (
                                <button
                                  onClick={() => clearFieldOverrides(co.outputTypeId)}
                                  className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
                                  title="Use defaults (don't customize)"
                                >
                                  <X className="h-2.5 w-2.5" /> Use defaults
                                </button>
                              )}
                              {hasCustomFields && (
                                <button
                                  onClick={() => resetFieldOverrides(co.outputTypeId)}
                                  className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
                                  title="Reset to output type defaults"
                                >
                                  <RotateCcw className="h-2.5 w-2.5" /> Reset
                                </button>
                              )}
                              {hasCustomFields && (
                                <button
                                  onClick={() => addFieldOverride(co.outputTypeId)}
                                  className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10"
                                >
                                  <Plus className="h-2.5 w-2.5" /> Add
                                </button>
                              )}
                            </div>
                          </div>

                          {hasCustomFields ? (
                            currentFields.length === 0 ? (
                              <div className="rounded-md border border-dashed border-border bg-card px-3 py-4 text-center">
                                <p className="text-[11px] text-muted-foreground">
                                  No element fields defined.
                                </p>
                                <button
                                  onClick={() => resetFieldOverrides(co.outputTypeId)}
                                  className="mt-1.5 text-[11px] font-medium text-primary hover:underline"
                                >
                                  Load {otDef.fields.length} defaults
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {currentFields.map((field, idx) => (
                                  <div key={idx} className="group/field rounded-md border border-border bg-card px-2 py-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-700">
                                        {idx + 1}
                                      </span>
                                      <input
                                        value={field.key}
                                        onChange={(e) => updateFieldOverride(co.outputTypeId, idx, { key: e.target.value.replace(/\s/g, '') })}
                                        placeholder="key"
                                        className="w-20 border-none bg-transparent px-0 text-[11px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                                      />
                                      <input
                                        value={field.label}
                                        onChange={(e) => updateFieldOverride(co.outputTypeId, idx, { label: e.target.value })}
                                        placeholder="Label"
                                        className="min-w-0 flex-1 border-none bg-transparent px-0 text-[11px] font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                                      />
                                      <select
                                        value={field.type}
                                        onChange={(e) => updateFieldOverride(co.outputTypeId, idx, { type: e.target.value as 'short-text' | 'long-text' })}
                                        className="h-5 rounded border border-border bg-background px-1 text-[9px]"
                                      >
                                        <option value="short-text">Short</option>
                                        <option value="long-text">Long</option>
                                      </select>
                                      <label className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                                        <input
                                          type="radio"
                                          name={`cfg-primary-${co.outputTypeId}-${idx}`}
                                          checked={!!field.primary}
                                          onChange={() => {
                                            setState((p) => ({
                                              ...p,
                                              outputs: p.outputs.map((o) => {
                                                if (o.outputTypeId !== co.outputTypeId) return o
                                                return {
                                                  ...o,
                                                  fieldOverrides: (o.fieldOverrides || []).map((f, i) => ({
                                                    ...f,
                                                    primary: i === idx ? true : undefined,
                                                  })),
                                                }
                                              }),
                                            }))
                                          }}
                                        />
                                        1st
                                      </label>
                                      <button
                                        onClick={() => removeFieldOverride(co.outputTypeId, idx)}
                                        className="rounded p-0.5 text-muted-foreground/40 opacity-0 transition-opacity hover:text-destructive group-hover/field:opacity-100"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                    {!field.primary && (
                                      <div className="ml-6 mt-0.5 flex items-center gap-2">
                                        <select
                                          value={field.color || ''}
                                          onChange={(e) => updateFieldOverride(co.outputTypeId, idx, { color: (e.target.value || undefined) as FieldColor | undefined })}
                                          className="h-5 rounded border border-border bg-background px-1 text-[9px]"
                                        >
                                          {FIELD_COLOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                        <select
                                          value={field.icon || ''}
                                          onChange={(e) => updateFieldOverride(co.outputTypeId, idx, { icon: e.target.value || undefined })}
                                          className="h-5 rounded border border-border bg-background px-1 text-[9px]"
                                        >
                                          {FIELD_ICON_OPTIONS.map((i) => <option key={i} value={i}>{i || '— Icon —'}</option>)}
                                        </select>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )
                          ) : (
                            <div className="rounded-md border border-dashed border-border bg-card px-3 py-3 text-center">
                              <p className="text-[11px] text-muted-foreground">
                                Using {otDef.fields.length} default fields from {otDef.name}.
                              </p>
                              <button
                                onClick={() => resetFieldOverrides(co.outputTypeId)}
                                className="mt-1.5 flex items-center gap-0.5 mx-auto text-[11px] font-medium text-primary hover:underline"
                              >
                                <PencilSmall className="h-2.5 w-2.5" /> Customize fields
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="relative mt-2">
          <Button variant="outline" size="sm" onClick={() => setShowOutputPicker(!showOutputPicker)} className="h-7 gap-1 text-xs">
            <Plus className="h-3 w-3" /> Add Output
          </Button>
          {showOutputPicker && (
            <div className="absolute left-0 top-8 z-50 max-h-48 w-72 overflow-auto rounded-lg border border-border bg-popover p-2 shadow-lg">
              {allOutputTypes.map((ot) => {
                const inUse = outputTypeIds.includes(ot.id)
                return (
                  <button
                    key={ot.id}
                    disabled={inUse}
                    onClick={() => addOutput(ot.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${inUse ? 'opacity-40' : 'hover:bg-muted'}`}
                  >
                    <span className="font-medium text-foreground">{ot.name}</span>
                    <span className="text-[10px] text-muted-foreground">{ot.description}</span>
                    {inUse && <Check className="ml-auto h-3 w-3 text-primary" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(state)} disabled={!canSave} className="gap-1.5">
          <Check className="h-3.5 w-3.5" /> Save Configuration
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// Configurations list page
// ============================================================

export default function ConfigurationsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ConfigurationsPageInner />
    </Suspense>
  )
}

interface AINewField {
  id: string
  name: string
  description: string
  prompt: string
  selectionMode: 'single' | 'multi'
  category: string
}

interface AIStep {
  name: string
  description: string
  fieldIds: string[]
  newFields?: AINewField[]
}

interface AIOutput {
  outputTypeId: string
  sectionDrivers?: { name: string; description: string }[]
  instructionDirectives?: { label: string; content: string }[]
  fields?: { key: string; label: string; type: 'short-text' | 'long-text'; primary?: boolean }[]
}

function ConfigurationsPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { authChecked, authenticated, setAuthenticated, handleLogout } = useAuth()

  const [configs, setConfigs] = useState<SetupConfiguration[]>([])
  const [allFields, setAllFields] = useState<FieldDefinition[]>([])
  const [allOutputTypes, setAllOutputTypes] = useState<OutputTypeDefinition[]>([])
  const [builderMode, setBuilderMode] = useState<'closed' | 'create' | 'edit'>('closed')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [builderInit, setBuilderInit] = useState<BuilderState>(emptyBuilder())

  // AI Wizard state
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardPrompt, setWizardPrompt] = useState('')
  const [wizardLoading, setWizardLoading] = useState(false)
  const [wizardError, setWizardError] = useState<string | null>(null)

  // Export/Import state
  const [selectedForExport, setSelectedForExport] = useState<Set<string>>(new Set())
  const [selectMode, setSelectMode] = useState(false)

  const processAIConfiguration = useCallback((
    configuration: { name?: string; description?: string; steps?: AIStep[]; outputs?: AIOutput[] },
    currentFields: FieldDefinition[],
  ): { builderState: BuilderState; createdFieldCount: number } => {
    const knownFieldIds = new Set(currentFields.map((f) => f.id))
    let createdFieldCount = 0

    const steps = (configuration.steps || []).map((step: AIStep, i: number) => {
      const stepFields: ConfigStepField[] = []

      if (step.newFields?.length) {
        for (const nf of step.newFields) {
          if (knownFieldIds.has(nf.id)) continue
          fieldStorage.save({
            id: nf.id,
            name: nf.name,
            description: nf.description,
            prompt: nf.prompt,
            selectionMode: nf.selectionMode || 'single',
            allowCustomValues: true,
            category: nf.category || 'AI Generated',
            isBuiltIn: false,
          })
          knownFieldIds.add(nf.id)
          createdFieldCount++
        }
      }

      for (const fid of (step.fieldIds || [])) {
        if (knownFieldIds.has(fid)) {
          stepFields.push({ fieldId: fid, required: false })
        }
      }

      if (step.newFields?.length) {
        for (const nf of step.newFields) {
          if (!stepFields.some((sf) => sf.fieldId === nf.id)) {
            stepFields.push({ fieldId: nf.id, required: false })
          }
        }
      }

      return {
        id: `s-${Date.now()}-${i}`,
        name: step.name,
        description: step.description || '',
        fields: stepFields,
      }
    })

    return {
      builderState: {
        name: configuration.name || '',
        description: configuration.description || '',
        steps,
        outputs: (configuration.outputs || []).map((out: AIOutput) => ({
          outputTypeId: out.outputTypeId,
          sectionDrivers: out.sectionDrivers?.length ? out.sectionDrivers : undefined,
          instructionDirectives: out.instructionDirectives?.length ? out.instructionDirectives : undefined,
          fieldOverrides: out.fields?.length ? out.fields.map((f) => ({
            key: f.key,
            label: f.label,
            type: f.type,
            primary: f.primary || undefined,
          })) : undefined,
        })),
      },
      createdFieldCount,
    }
  }, [])

  useEffect(() => {
    const fields = fieldStorage.getAll()
    const outputTypes = outputTypeStorage.getAll()
    setConfigs(configStorage.getAll())
    setAllFields(fields)
    setAllOutputTypes(outputTypes)

    // Auto-open builder when navigated from Idea Book with a generated config
    const ideaConfigParam = searchParams.get('ideaConfig')
    if (ideaConfigParam) {
      try {
        const configuration = JSON.parse(ideaConfigParam)
        const { builderState, createdFieldCount } = processAIConfiguration(configuration, fields)

        if (createdFieldCount > 0) {
          setAllFields(fieldStorage.getAll())
        }

        setBuilderInit(builderState)
        setEditingId(null)
        setBuilderMode('create')
        toast.success(
          createdFieldCount > 0
            ? `Configuration generated from idea with ${createdFieldCount} new field${createdFieldCount !== 1 ? 's' : ''} added to library!`
            : 'Configuration generated from idea! Review and save below.'
        )
        router.replace('/configurations')
      } catch {
        // Ignore malformed param
      }
    }
  }, [searchParams, router, processAIConfiguration])

  const openCreate = () => {
    setBuilderInit(emptyBuilder())
    setEditingId(null)
    setBuilderMode('create')
  }

  const openEdit = (config: SetupConfiguration) => {
    setBuilderInit(configToBuilder(config))
    setEditingId(config.id)
    setBuilderMode('edit')
  }

  const openDuplicate = (config: SetupConfiguration) => {
    setBuilderInit({ ...configToBuilder(config), name: `${config.name} (copy)` })
    setEditingId(null)
    setBuilderMode('create')
  }

  const closeBuilder = () => {
    setBuilderMode('closed')
    setEditingId(null)
  }

  const handleSave = (data: BuilderState) => {
    const payload = {
      name: data.name.trim(),
      description: data.description.trim(),
      steps: data.steps,
      outputs: data.outputs,
    }
    if (builderMode === 'create') {
      configStorage.save(payload)
      toast.success('Configuration created')
    } else if (editingId) {
      configStorage.update(editingId, payload)
      toast.success('Configuration updated')
    }
    setConfigs(configStorage.getAll())
    closeBuilder()
  }

  const handleDelete = (id: string) => {
    configStorage.remove(id)
    setConfigs(configStorage.getAll())
    toast.success('Configuration deleted')
  }

  const handleWizardGenerate = async () => {
    if (!wizardPrompt.trim()) return
    setWizardLoading(true)
    setWizardError(null)
    try {
      const res = await fetch('/api/generate-configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: wizardPrompt.trim(),
          availableFields: allFields.map((f) => ({
            id: f.id,
            name: f.name,
            description: f.description,
            category: f.category,
          })),
          availableOutputTypes: allOutputTypes.map((ot) => ({
            id: ot.id,
            name: ot.name,
            description: ot.description,
            sectionLabel: ot.sectionLabel,
            elementLabel: ot.elementLabel,
            defaultFields: ot.fields.map((f) => ({ key: f.key, label: f.label, type: f.type })),
          })),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Request failed')
      }
      const { configuration } = await res.json()

      const { builderState, createdFieldCount } = processAIConfiguration(configuration, allFields)

      if (createdFieldCount > 0) {
        setAllFields(fieldStorage.getAll())
      }

      setWizardOpen(false)
      setWizardPrompt('')
      setBuilderInit(builderState)
      setEditingId(null)
      setBuilderMode('create')
      toast.success(
        createdFieldCount > 0
          ? `Configuration generated with ${createdFieldCount} new field${createdFieldCount !== 1 ? 's' : ''} added to library!`
          : 'Configuration generated! Review and save below.'
      )
    } catch (err) {
      setWizardError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setWizardLoading(false)
    }
  }

  const handleExportAll = () => {
    if (configs.length === 0) { toast.error('No configurations to export'); return }
    const bundle: ExportBundle<SetupConfiguration> = {
      version: 1, type: 'configurations', exportedAt: new Date().toISOString(), items: configs,
    }
    downloadJson(bundle, buildFilename('configurations', configs.length))
    toast.success(`Exported ${configs.length} configuration${configs.length !== 1 ? 's' : ''}`)
  }

  const handleExportSelected = () => {
    const selected = configs.filter((c) => selectedForExport.has(c.id))
    if (selected.length === 0) { toast.error('No configurations selected'); return }
    const bundle: ExportBundle<SetupConfiguration> = {
      version: 1, type: 'configurations', exportedAt: new Date().toISOString(), items: selected,
    }
    downloadJson(bundle, buildFilename('configurations', selected.length))
    toast.success(`Exported ${selected.length} configuration${selected.length !== 1 ? 's' : ''}`)
    setSelectMode(false)
    setSelectedForExport(new Set())
  }

  const handleImport = async () => {
    try {
      const file = await openFilePicker()
      if (!file) return
      const bundle = await readJsonFile<SetupConfiguration>(file)
      if (bundle.type !== 'configurations' && bundle.type !== 'full-backup') {
        toast.error('Wrong file type — expected a configurations export')
        return
      }
      const existingIds = new Set(configs.map((c) => c.id))
      let imported = 0
      let skipped = 0
      for (const item of bundle.items) {
        if (!item.id || !item.name || !item.steps) { skipped++; continue }
        if (existingIds.has(item.id)) {
          configStorage.update(item.id, item)
        } else {
          const raw = localStorage.getItem('queb-setup-configurations')
          const all: SetupConfiguration[] = raw ? JSON.parse(raw) : []
          all.unshift(item)
          localStorage.setItem('queb-setup-configurations', JSON.stringify(all.slice(0, 200)))
        }
        imported++
      }
      setConfigs(configStorage.getAll())
      if (imported > 0) toast.success(`Imported ${imported} configuration${imported !== 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} skipped)` : ''}`)
      else toast.error('No valid configurations found in the file')
    } catch (err) {
      toast.error('Import failed', { description: err instanceof Error ? err.message : 'Invalid file' })
    }
  }

  const toggleExportSelect = (id: string) => {
    setSelectedForExport((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  if (!authenticated) return <LoginScreen onSuccess={() => setAuthenticated(true)} />

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card shadow-sm">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <button onClick={() => router.push('/products')} className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-primary bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <h1 className="font-display text-lg font-bold text-foreground">DigiCraft</h1>
            </button>
            <nav className="hidden items-center gap-1 sm:flex">
              <button onClick={() => router.push('/ideas')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Ideas</button>
              <button onClick={() => router.push('/products')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Products</button>
              <button className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">Configurations</button>
              <button onClick={() => router.push('/library')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Library</button>
              <button onClick={() => router.push('/info')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">About</button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    Legacy
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => router.push('/legacy')}>Home</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/legacy?view=history')}>History</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Configurations</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Assemble steps, fields, and outputs into reusable generation workflows
            </p>
          </div>
          {builderMode === 'closed' && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setWizardOpen(true)} className="gap-2">
                <Wand2 className="h-4 w-4" /> AI Wizard
              </Button>
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" /> New Configuration
              </Button>
            </div>
          )}
        </div>

        {/* Export/Import toolbar */}
        {builderMode === 'closed' && configs.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleImport} className="h-8 gap-1.5 text-xs">
              <Upload className="h-3.5 w-3.5" /> Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportAll} className="h-8 gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> Export All
            </Button>
            {!selectMode ? (
              <Button variant="ghost" size="sm" onClick={() => setSelectMode(true)} className="h-8 gap-1.5 text-xs text-muted-foreground">
                Export Selected...
              </Button>
            ) : (
              <>
                <div className="h-5 w-px bg-border" />
                <span className="text-xs text-muted-foreground">
                  {selectedForExport.size} selected
                </span>
                <Button variant="outline" size="sm" onClick={handleExportSelected} disabled={selectedForExport.size === 0} className="h-8 gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" /> Export {selectedForExport.size > 0 ? selectedForExport.size : ''}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setSelectMode(false); setSelectedForExport(new Set()) }} className="h-8 text-xs text-muted-foreground">
                  Cancel
                </Button>
              </>
            )}
          </div>
        )}

        {builderMode !== 'closed' && (
          <div className="mb-8">
            <ConfigBuilder
              initial={builderInit}
              allFields={allFields}
              allOutputTypes={allOutputTypes}
              onSave={handleSave}
              onCancel={closeBuilder}
            />
          </div>
        )}

        {configs.length === 0 && builderMode === 'closed' ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-20 text-center">
            <Settings2 className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold text-foreground">No configurations yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Define steps, pull in fields from the library, choose outputs, and create a reusable generation workflow.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Button variant="outline" onClick={handleImport} className="gap-2">
                <Upload className="h-4 w-4" /> Import
              </Button>
              <Button variant="outline" onClick={() => setWizardOpen(true)} className="gap-2">
                <Wand2 className="h-4 w-4" /> AI Wizard
              </Button>
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" /> Create Manually
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {configs.map((config) => {
              const totalFields = config.steps.reduce((sum, s) => sum + s.fields.length, 0)
              const outputNames = config.outputs
                .map((o) => allOutputTypes.find((ot) => ot.id === o.outputTypeId)?.name)
                .filter(Boolean)
              return (
                <div key={config.id} className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/30">
                  <div className="flex items-start justify-between gap-4">
                    {selectMode && (
                      <button
                        onClick={() => toggleExportSelect(config.id)}
                        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${selectedForExport.has(config.id) ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30 hover:border-primary/50'}`}
                      >
                        {selectedForExport.has(config.id) && <Check className="h-3 w-3" />}
                      </button>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-foreground">{config.name}</h3>
                      {config.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground">{config.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{config.steps.length} steps</span>
                        <span>{totalFields} fields</span>
                        <span className="font-medium text-primary">
                          Outputs: {outputNames.length > 0 ? outputNames.join(', ') : '(none)'}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {config.steps.map((step) => (
                          <span key={step.id} className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                            {step.name} ({step.fields.length})
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button variant="default" size="sm" onClick={() => router.push(`/configurations/${config.id}/run`)} className="h-8 gap-1.5 text-xs" title="Run">
                        <Play className="h-3 w-3" /> Run
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDuplicate(config)} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" title="Duplicate">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(config)} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" title="Edit">
                        <PencilSmall className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(config.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {/* AI Wizard Dialog */}
        <Dialog open={wizardOpen} onOpenChange={(open) => { if (!wizardLoading) { setWizardOpen(open); if (!open) setWizardError(null) } }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                AI Configuration Wizard
              </DialogTitle>
              <DialogDescription>
                Describe what you want to generate in plain English. The AI will design a complete configuration with steps, fields, output types, section drivers, and instruction directives.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  What would you like to create?
                </label>
                <Textarea
                  value={wizardPrompt}
                  onChange={(e) => setWizardPrompt(e.target.value)}
                  placeholder={'e.g. "Know your role: Pain points of CISO"\n\nor\n\n"An email course teaching SaaS founders how to reduce churn, organized by lifecycle stage"'}
                  rows={5}
                  className="resize-none"
                  disabled={wizardLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && wizardPrompt.trim() && !wizardLoading) {
                      handleWizardGenerate()
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Be specific about the topic, target audience, and type of content you want.
                </p>
              </div>

              {wizardError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {wizardError}
                </div>
              )}

              {wizardLoading && (
                <div className="flex items-center gap-3 rounded-md border border-primary/20 bg-primary/5 px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Designing your configuration...</p>
                    <p className="text-xs text-muted-foreground">Choosing fields, output types, drivers, and directives</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => { setWizardOpen(false); setWizardError(null) }}
                disabled={wizardLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleWizardGenerate}
                disabled={!wizardPrompt.trim() || wizardLoading}
                className="gap-2"
              >
                {wizardLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Generate Configuration
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
