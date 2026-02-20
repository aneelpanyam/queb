'use client'

import type { SectionDriver } from '@/lib/setup-config-types'
import type { OutputTypeField } from '@/lib/output-type-library'
import { Plus, X, RotateCcw, Layers } from 'lucide-react'

interface SectionDriversEditorProps {
  otId: string
  effectiveLabel: string
  drivers: SectionDriver[]
  defaults: SectionDriver[]
  onAdd: (otId: string) => void
  onRemove: (otId: string, idx: number) => void
  onUpdate: (otId: string, idx: number, updates: Partial<SectionDriver>) => void
  onReset: (otId: string) => void
  onAddField: (otId: string, driverIdx: number) => void
  onRemoveField: (otId: string, driverIdx: number, fieldIdx: number) => void
  onUpdateField: (otId: string, driverIdx: number, fieldIdx: number, updates: Partial<OutputTypeField>) => void
  onClearFields: (otId: string, driverIdx: number) => void
}

export function SectionDriversEditor({
  otId, effectiveLabel, drivers, defaults,
  onAdd, onRemove, onUpdate, onReset,
  onAddField, onRemoveField, onUpdateField, onClearFields,
}: SectionDriversEditorProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3 w-3 text-primary/60" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
            {effectiveLabel} Drivers
          </span>
          <span className="text-[10px] text-muted-foreground">
            — the AI generates one {effectiveLabel.toLowerCase()} per driver
          </span>
        </div>
        <div className="flex items-center gap-1">
          {defaults.length > 0 && (
            <button
              onClick={() => onReset(otId)}
              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Reset to defaults"
            >
              <RotateCcw className="h-2.5 w-2.5" /> Reset
            </button>
          )}
          <button
            onClick={() => onAdd(otId)}
            className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10"
          >
            <Plus className="h-2.5 w-2.5" /> Add
          </button>
        </div>
      </div>

      {drivers.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card px-3 py-4 text-center">
          <p className="text-[11px] text-muted-foreground">
            No {effectiveLabel.toLowerCase()} drivers defined. The AI will auto-generate sections.
          </p>
          {defaults.length > 0 && (
            <button
              onClick={() => onReset(otId)}
              className="mt-1.5 text-[11px] font-medium text-primary hover:underline"
            >
              Load {defaults.length} defaults
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {drivers.map((driver, idx) => (
            <div key={idx} className="group/driver rounded-md border border-border bg-card px-2 py-1.5">
              <div className="flex items-start gap-2">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-primary/10 text-[9px] font-bold text-primary">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <input
                    value={driver.name}
                    onChange={(e) => onUpdate(otId, idx, { name: e.target.value })}
                    placeholder={`${effectiveLabel} name...`}
                    className="w-full border-none bg-transparent px-0 text-[11px] font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                  <input
                    value={driver.description}
                    onChange={(e) => onUpdate(otId, idx, { description: e.target.value })}
                    placeholder="Description..."
                    className="w-full border-none bg-transparent px-0 text-[10px] text-muted-foreground placeholder:text-muted-foreground/30 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => onRemove(otId, idx)}
                  className="mt-0.5 rounded p-0.5 text-muted-foreground/40 opacity-0 transition-opacity hover:text-destructive group-hover/driver:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="ml-6 mt-1 border-t border-border/50 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-medium text-muted-foreground">
                    {driver.fields?.length ? `${driver.fields.length} custom fields` : 'Default fields'}
                  </span>
                  <div className="flex items-center gap-1">
                    {driver.fields && (
                      <button
                        onClick={() => onClearFields(otId, idx)}
                        className="text-[9px] text-muted-foreground hover:text-foreground"
                      >
                        Use defaults
                      </button>
                    )}
                    <button
                      onClick={() => onAddField(otId, idx)}
                      className="flex items-center gap-0.5 text-[9px] font-medium text-violet-600 hover:text-violet-700"
                    >
                      <Plus className="h-2.5 w-2.5" /> Field
                    </button>
                  </div>
                </div>
                {driver.fields && driver.fields.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {driver.fields.map((field, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-1.5">
                        <input
                          value={field.key}
                          onChange={(e) => onUpdateField(otId, idx, fIdx, { key: e.target.value.replace(/\s/g, '') })}
                          placeholder="key"
                          className="w-16 border-none bg-transparent px-0 text-[10px] font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                        />
                        <input
                          value={field.label}
                          onChange={(e) => onUpdateField(otId, idx, fIdx, { label: e.target.value })}
                          placeholder="Label"
                          className="min-w-0 flex-1 border-none bg-transparent px-0 text-[10px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                        />
                        <select
                          value={field.type}
                          onChange={(e) => onUpdateField(otId, idx, fIdx, { type: e.target.value as 'short-text' | 'long-text' })}
                          className="h-4 rounded border border-border bg-background px-0.5 text-[8px]"
                        >
                          <option value="short-text">Short</option>
                          <option value="long-text">Long</option>
                        </select>
                        <button
                          onClick={() => onRemoveField(otId, idx, fIdx)}
                          className="rounded p-0.5 text-muted-foreground/30 hover:text-destructive"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
