'use client'

import type { SetupConfiguration } from '@/lib/setup-config-types'
import type { OutputTypeDefinition } from '@/lib/output-type-library'
import { Button } from '@/components/ui/button'
import { Check, Copy, Pencil as PencilSmall, Trash2, Play } from 'lucide-react'

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
