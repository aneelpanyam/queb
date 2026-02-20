'use client'

import type { FieldDefinition } from '@/lib/field-library'
import type { OutputTypeDefinition } from '@/lib/output-type-library'
import type { BuilderState } from '../_lib/config-builder-utils'
import { useConfigBuilder } from '../_hooks/use-config-builder'
import { StepEditor } from './step-editor'
import { OutputEditor } from './output-editor'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, X, Check, FileOutput } from 'lucide-react'

interface ConfigBuilderProps {
  initial: BuilderState
  allFields: FieldDefinition[]
  allOutputTypes: OutputTypeDefinition[]
  onSave: (data: BuilderState) => void
  onCancel: () => void
}

export function ConfigBuilder({ initial, allFields, allOutputTypes, onSave, onCancel }: ConfigBuilderProps) {
  const builder = useConfigBuilder(initial, allFields, allOutputTypes)
  const outputTypeIds = builder.state.outputs.map((o) => o.outputTypeId)

  const handleSetFieldPrimary = (otId: string, idx: number) => {
    builder.setState((p) => ({
      ...p,
      outputs: p.outputs.map((o) => {
        if (o.outputTypeId !== otId) return o
        return {
          ...o,
          fieldOverrides: (o.fieldOverrides || []).map((f, i) => ({
            ...f,
            primary: i === idx ? true : undefined,
          })),
        }
      }),
    }))
  }

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-card shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Input
              value={builder.state.name}
              onChange={(e) => builder.setState((p) => ({ ...p, name: e.target.value }))}
              placeholder="Configuration name..."
              className="max-w-md border-none bg-transparent px-0 text-lg font-bold text-foreground focus-visible:ring-0"
            />
            <Input
              value={builder.state.description}
              onChange={(e) => builder.setState((p) => ({ ...p, description: e.target.value }))}
              placeholder="Description..."
              className="mt-1 max-w-lg border-none bg-transparent px-0 text-sm text-muted-foreground focus-visible:ring-0"
            />
          </div>
          <button onClick={onCancel} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="border-b border-border px-6 py-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Steps & Fields</h3>
          <Button variant="outline" size="sm" onClick={builder.addStep} className="h-7 gap-1 text-xs">
            <Plus className="h-3 w-3" /> Add Step
          </Button>
        </div>

        <div className="space-y-2">
          {builder.state.steps.map((step, stepIdx) => (
            <StepEditor
              key={step.id}
              step={step}
              stepIdx={stepIdx}
              totalSteps={builder.state.steps.length}
              isExpanded={builder.expandedStep === step.id}
              allFields={allFields}
              allSteps={builder.state.steps}
              allFieldIdsInConfig={builder.allFieldIdsInConfig}
              showFieldPicker={builder.showFieldPicker === step.id}
              groupedFields={builder.grouped}
              onToggleExpand={() => builder.setExpandedStep(builder.expandedStep === step.id ? null : step.id)}
              onUpdateStep={builder.updateStep}
              onMoveStep={builder.moveStep}
              onRemoveStep={builder.removeStep}
              onAddField={builder.addFieldToStep}
              onRemoveField={builder.removeFieldFromStep}
              onUpdateField={builder.updateFieldInStep}
              onToggleFieldPicker={() => builder.setShowFieldPicker(builder.showFieldPicker === step.id ? null : step.id)}
            />
          ))}
        </div>
      </div>

      <div className="border-b border-border px-6 py-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
            <FileOutput className="mr-1 inline h-3 w-3" /> Outputs to Produce
          </h3>
        </div>

        <div className="space-y-2">
          {builder.state.outputs.map((co) => {
            const otDef = allOutputTypes.find((ot) => ot.id === co.outputTypeId)
            if (!otDef) return null
            return (
              <OutputEditor
                key={co.outputTypeId}
                co={co}
                otDef={otDef}
                isExpanded={builder.expandedOutput === co.outputTypeId}
                onToggleExpand={() => builder.setExpandedOutput(builder.expandedOutput === co.outputTypeId ? null : co.outputTypeId)}
                onRemove={builder.removeOutput}
                onUpdateSectionLabelOverride={builder.updateSectionLabelOverride}
                onAddSectionDriver={builder.addSectionDriver}
                onRemoveSectionDriver={builder.removeSectionDriver}
                onUpdateSectionDriver={builder.updateSectionDriver}
                onResetSectionDrivers={builder.resetSectionDrivers}
                onAddDriverField={builder.addDriverField}
                onRemoveDriverField={builder.removeDriverField}
                onUpdateDriverField={builder.updateDriverField}
                onClearDriverFields={builder.clearDriverFields}
                onAddDirective={builder.addDirective}
                onRemoveDirective={builder.removeDirective}
                onUpdateDirective={builder.updateDirective}
                onResetDirectives={builder.resetDirectives}
                onClearDirectives={builder.clearDirectives}
                onAddFieldOverride={builder.addFieldOverride}
                onRemoveFieldOverride={builder.removeFieldOverride}
                onUpdateFieldOverride={builder.updateFieldOverride}
                onResetFieldOverrides={builder.resetFieldOverrides}
                onClearFieldOverrides={builder.clearFieldOverrides}
                onSetFieldPrimary={handleSetFieldPrimary}
              />
            )
          })}
        </div>

        <div className="relative mt-2">
          <Button variant="outline" size="sm" onClick={() => builder.setShowOutputPicker(!builder.showOutputPicker)} className="h-7 gap-1 text-xs">
            <Plus className="h-3 w-3" /> Add Output
          </Button>
          {builder.showOutputPicker && (
            <div className="absolute left-0 top-8 z-50 max-h-48 w-72 overflow-auto rounded-lg border border-border bg-popover p-2 shadow-lg">
              {allOutputTypes.map((ot) => {
                const inUse = outputTypeIds.includes(ot.id)
                return (
                  <button
                    key={ot.id}
                    disabled={inUse}
                    onClick={() => builder.addOutput(ot.id)}
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

      <div className="flex items-center justify-between px-6 py-4">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(builder.state)} disabled={!builder.canSave} className="gap-1.5">
          <Check className="h-3.5 w-3.5" /> Save Configuration
        </Button>
      </div>
    </div>
  )
}
