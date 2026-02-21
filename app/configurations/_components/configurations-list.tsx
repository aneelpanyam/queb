'use client'

import { useState } from 'react'
import type { SetupConfiguration } from '@/lib/setup-config-types'
import type { OutputTypeDefinition } from '@/lib/output-type-library'
import { FRAMEWORK_DEFINITIONS } from '@/lib/idea-types'
import { Button } from '@/components/ui/button'
import { Check, Copy, Pencil as PencilSmall, Trash2, Play, Sparkles, ChevronDown } from 'lucide-react'

function GenerationInputsSection({ config, allOutputTypes }: { config: SetupConfiguration; allOutputTypes: OutputTypeDefinition[] }) {
  const [open, setOpen] = useState(false)
  const gi = config.generationInputs
  if (!gi) return null

  const fwDef = FRAMEWORK_DEFINITIONS.find((f) => f.id === gi.framework)
  const fwName = fwDef?.name || gi.framework

  const filledFields = fwDef?.fields
    .map((f) => ({ label: f.label, value: gi.frameworkData[f.key]?.trim() }))
    .filter((f) => f.value)
    ?? Object.entries(gi.frameworkData)
      .filter(([, v]) => v?.trim())
      .map(([k, v]) => ({ label: k, value: v }))

  const outputTypeNames = gi.suggestedOutputTypes
    ?.map((id) => allOutputTypes.find((ot) => ot.id === id)?.name || id)

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Sparkles className="h-3 w-3" />
        <span>AI generated from {fwName}</span>
        <ChevronDown className={`ml-auto h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-2 space-y-2 text-xs">
          {filledFields.map((f) => (
            <div key={f.label}>
              <span className="font-medium text-muted-foreground">{f.label}:</span>{' '}
              <span className="text-foreground/80">{f.value}</span>
            </div>
          ))}
          {gi.notes && (
            <div>
              <span className="font-medium text-muted-foreground">Notes:</span>{' '}
              <span className="text-foreground/80">{gi.notes}</span>
            </div>
          )}
          {outputTypeNames && outputTypeNames.length > 0 && (
            <div>
              <span className="font-medium text-muted-foreground">Suggested outputs:</span>{' '}
              <span className="text-foreground/80">{outputTypeNames.join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ConfigurationsListProps {
  configs: SetupConfiguration[]
  allOutputTypes: OutputTypeDefinition[]
  selectMode: boolean
  selectedForExport: Set<string>
  onToggleExportSelect: (id: string) => void
  onRun: (configId: string) => void
  onDuplicate: (config: SetupConfiguration) => void
  onEdit: (config: SetupConfiguration) => void
  onDelete: (configId: string) => void
}

export function ConfigurationsList({
  configs, allOutputTypes, selectMode, selectedForExport,
  onToggleExportSelect, onRun, onDuplicate, onEdit, onDelete,
}: ConfigurationsListProps) {
  return (
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
                  onClick={() => onToggleExportSelect(config.id)}
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
                <GenerationInputsSection config={config} allOutputTypes={allOutputTypes} />
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="default" size="sm" onClick={() => onRun(config.id)} className="h-8 gap-1.5 text-xs" title="Run">
                  <Play className="h-3 w-3" /> Run
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDuplicate(config)} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" title="Duplicate">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(config)} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" title="Edit">
                  <PencilSmall className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(config.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
