import { useState } from 'react'
import { toast } from 'sonner'
import type { ConfigStep, ConfigStepField, ConfigOutput, SectionDriver, InstructionDirective } from '@/lib/setup-config-types'
import type { FieldDefinition } from '@/lib/field-library'
import { getTransitiveDependencies } from '@/lib/field-library'
import type { OutputTypeDefinition, OutputTypeField } from '@/lib/output-type-library'
import { getDefaultSectionDrivers, getDefaultInstructionDirectives } from '@/lib/output-type-library'
import { type BuilderState, uid } from '../_lib/config-builder-utils'

export function useConfigBuilder(
  initial: BuilderState,
  allFields: FieldDefinition[],
  allOutputTypes: OutputTypeDefinition[],
) {
  const [state, setState] = useState<BuilderState>(initial)
  const [expandedStep, setExpandedStep] = useState<string | null>(initial.steps[0]?.id || null)
  const [showFieldPicker, setShowFieldPicker] = useState<string | null>(null)
  const [showOutputPicker, setShowOutputPicker] = useState(false)
  const [expandedOutput, setExpandedOutput] = useState<string | null>(null)

  const allFieldIdsInConfig = state.steps.flatMap((s) => s.fields.map((f) => f.fieldId))
  const canSave = state.name.trim() && state.steps.length > 0 && state.outputs.length > 0

  const grouped = allFields.reduce<Record<string, FieldDefinition[]>>((acc, f) => {
    ;(acc[f.category] ??= []).push(f)
    return acc
  }, {})

  // --- Step management ---

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

  // --- Field management within a step ---

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

  // --- Output management ---

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

  // --- Section driver management ---

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

  const updateSectionLabelOverride = (otId: string, value: string) => {
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) =>
        o.outputTypeId === otId ? { ...o, sectionLabelOverride: value || undefined } : o
      ),
    }))
  }

  const addDriverField = (otId: string, driverIdx: number) => {
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) => {
        if (o.outputTypeId !== otId) return o
        const drivers = [...(o.sectionDrivers || [])]
        const d = { ...drivers[driverIdx] }
        d.fields = [...(d.fields || []), { key: '', label: '', type: 'long-text' as const }]
        drivers[driverIdx] = d
        return { ...o, sectionDrivers: drivers }
      }),
    }))
  }

  const removeDriverField = (otId: string, driverIdx: number, fieldIdx: number) => {
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) => {
        if (o.outputTypeId !== otId) return o
        const drivers = [...(o.sectionDrivers || [])]
        const d = { ...drivers[driverIdx] }
        const fields = [...(d.fields || [])]
        fields.splice(fieldIdx, 1)
        d.fields = fields.length > 0 ? fields : undefined
        drivers[driverIdx] = d
        return { ...o, sectionDrivers: drivers }
      }),
    }))
  }

  const updateDriverField = (otId: string, driverIdx: number, fieldIdx: number, updates: Partial<OutputTypeField>) => {
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) => {
        if (o.outputTypeId !== otId) return o
        const drivers = [...(o.sectionDrivers || [])]
        const d = { ...drivers[driverIdx] }
        const fields = [...(d.fields || [])]
        fields[fieldIdx] = { ...fields[fieldIdx], ...updates }
        d.fields = fields
        drivers[driverIdx] = d
        return { ...o, sectionDrivers: drivers }
      }),
    }))
  }

  const clearDriverFields = (otId: string, driverIdx: number) => {
    setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) => {
        if (o.outputTypeId !== otId) return o
        const drivers = [...(o.sectionDrivers || [])]
        drivers[driverIdx] = { ...drivers[driverIdx], fields: undefined }
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

  // --- Instruction directive management ---

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

  // --- Element field override management ---

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

  return {
    state, setState,
    expandedStep, setExpandedStep,
    showFieldPicker, setShowFieldPicker,
    showOutputPicker, setShowOutputPicker,
    expandedOutput, setExpandedOutput,
    canSave,
    allFieldIdsInConfig,
    grouped,
    addStep, removeStep, updateStep, moveStep,
    addFieldToStep, removeFieldFromStep, updateFieldInStep,
    addOutput, removeOutput, updateOutput,
    addSectionDriver, removeSectionDriver, updateSectionDriver, updateSectionLabelOverride,
    addDriverField, removeDriverField, updateDriverField, clearDriverFields, resetSectionDrivers,
    addDirective, removeDirective, updateDirective, resetDirectives, clearDirectives,
    addFieldOverride, removeFieldOverride, updateFieldOverride, resetFieldOverrides, clearFieldOverrides,
  }
}
