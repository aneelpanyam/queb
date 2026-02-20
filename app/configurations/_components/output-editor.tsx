'use client'

import type { ConfigOutput } from '@/lib/setup-config-types'
import type { OutputTypeDefinition, OutputTypeField } from '@/lib/output-type-library'
import { getDefaultSectionDrivers, getDefaultInstructionDirectives } from '@/lib/output-type-library'
import type { SectionDriver, InstructionDirective } from '@/lib/setup-config-types'
import { SectionDriversEditor } from './section-drivers-editor'
import { InstructionDirectivesEditor } from './instruction-directives-editor'
import { ElementFieldsEditor } from './element-fields-editor'
import { ChevronDown, ChevronRight, X } from 'lucide-react'

interface OutputEditorProps {
  co: ConfigOutput
  otDef: OutputTypeDefinition
  isExpanded: boolean
  onToggleExpand: () => void
  onRemove: (otId: string) => void
  onUpdateSectionLabelOverride: (otId: string, value: string) => void
  onAddSectionDriver: (otId: string) => void
  onRemoveSectionDriver: (otId: string, idx: number) => void
  onUpdateSectionDriver: (otId: string, idx: number, updates: Partial<SectionDriver>) => void
  onResetSectionDrivers: (otId: string) => void
  onAddDriverField: (otId: string, driverIdx: number) => void
  onRemoveDriverField: (otId: string, driverIdx: number, fieldIdx: number) => void
  onUpdateDriverField: (otId: string, driverIdx: number, fieldIdx: number, updates: Partial<OutputTypeField>) => void
  onClearDriverFields: (otId: string, driverIdx: number) => void
  onAddDirective: (otId: string) => void
  onRemoveDirective: (otId: string, idx: number) => void
  onUpdateDirective: (otId: string, idx: number, updates: Partial<InstructionDirective>) => void
  onResetDirectives: (otId: string) => void
  onClearDirectives: (otId: string) => void
  onAddFieldOverride: (otId: string) => void
  onRemoveFieldOverride: (otId: string, idx: number) => void
  onUpdateFieldOverride: (otId: string, idx: number, updates: Partial<OutputTypeField>) => void
  onResetFieldOverrides: (otId: string) => void
  onClearFieldOverrides: (otId: string) => void
  onSetFieldPrimary: (otId: string, idx: number) => void
}

export function OutputEditor({
  co, otDef, isExpanded, onToggleExpand, onRemove,
  onUpdateSectionLabelOverride,
  onAddSectionDriver, onRemoveSectionDriver, onUpdateSectionDriver, onResetSectionDrivers,
  onAddDriverField, onRemoveDriverField, onUpdateDriverField, onClearDriverFields,
  onAddDirective, onRemoveDirective, onUpdateDirective, onResetDirectives, onClearDirectives,
  onAddFieldOverride, onRemoveFieldOverride, onUpdateFieldOverride, onResetFieldOverrides, onClearFieldOverrides,
  onSetFieldPrimary,
}: OutputEditorProps) {
  const effectiveLabel = co.sectionLabelOverride || otDef.sectionLabel
  const drivers = co.sectionDrivers || []
  const defaults = getDefaultSectionDrivers(otDef)
  const defaultDirectives = getDefaultInstructionDirectives(otDef)
  const directives = co.instructionDirectives || []
  const hasCustomDirectives = co.instructionDirectives !== undefined

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center gap-2 px-3 py-2">
        <button onClick={onToggleExpand} className="rounded p-0.5 text-muted-foreground hover:text-foreground">
          {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold text-foreground">{otDef.name}</span>
          <span className="ml-2 text-[10px] text-muted-foreground">{effectiveLabel} → {otDef.elementLabel}</span>
          {drivers.length > 0 && (
            <span className="ml-2 text-[10px] text-primary">{drivers.length} {effectiveLabel.toLowerCase()}s</span>
          )}
          {hasCustomDirectives && (
            <span className="ml-1.5 text-[10px] text-amber-600">{directives.length} directives</span>
          )}
          {co.fieldOverrides && (
            <span className="ml-1.5 text-[10px] text-emerald-600">{co.fieldOverrides.length} fields</span>
          )}
          {drivers.some((d) => d.fields?.length) && (
            <span className="ml-1.5 text-[10px] text-violet-600">per-driver fields</span>
          )}
        </div>
        <button onClick={() => onRemove(co.outputTypeId)} className="rounded p-1 text-muted-foreground hover:text-destructive">
          <X className="h-3 w-3" />
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-border bg-muted/20 px-4 py-3 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-muted-foreground">Section label:</span>
            <input
              value={co.sectionLabelOverride || ''}
              onChange={(e) => onUpdateSectionLabelOverride(co.outputTypeId, e.target.value)}
              placeholder={otDef.sectionLabel}
              className="h-6 w-32 rounded border border-border bg-background px-2 text-[11px] text-foreground placeholder:text-muted-foreground/40"
            />
            {co.sectionLabelOverride && (
              <button onClick={() => onUpdateSectionLabelOverride(co.outputTypeId, '')} className="text-[10px] text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <SectionDriversEditor
            otId={co.outputTypeId}
            effectiveLabel={effectiveLabel}
            drivers={drivers}
            defaults={defaults}
            onAdd={onAddSectionDriver}
            onRemove={onRemoveSectionDriver}
            onUpdate={onUpdateSectionDriver}
            onReset={onResetSectionDrivers}
            onAddField={onAddDriverField}
            onRemoveField={onRemoveDriverField}
            onUpdateField={onUpdateDriverField}
            onClearFields={onClearDriverFields}
          />

          <InstructionDirectivesEditor
            otId={co.outputTypeId}
            sectionLabel={effectiveLabel}
            directives={directives}
            defaultDirectives={defaultDirectives}
            hasCustomDirectives={hasCustomDirectives}
            onAdd={onAddDirective}
            onRemove={onRemoveDirective}
            onUpdate={onUpdateDirective}
            onReset={onResetDirectives}
            onClear={onClearDirectives}
          />

          <ElementFieldsEditor
            otId={co.outputTypeId}
            elementLabel={otDef.elementLabel}
            otFieldCount={otDef.fields.length}
            otName={otDef.name}
            fieldOverrides={co.fieldOverrides}
            onAdd={onAddFieldOverride}
            onRemove={onRemoveFieldOverride}
            onUpdate={onUpdateFieldOverride}
            onReset={onResetFieldOverrides}
            onClear={onClearFieldOverrides}
            onSetPrimary={onSetFieldPrimary}
          />
        </div>
      )}
    </div>
  )
}
