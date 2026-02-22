'use client'

import type { OutputTypeField, FieldColor } from '@/lib/output-type-library'
import { FIELD_COLOR_OPTIONS, FIELD_ICON_OPTIONS, type BuilderState } from '../_lib/config-builder-utils'
import { Plus, X, RotateCcw, ListChecks, Pencil as PencilSmall } from 'lucide-react'

interface ElementFieldsEditorProps {
  otId: string
  elementLabel: string
  otFieldCount: number
  otName: string
  fieldOverrides: OutputTypeField[] | undefined
  onAdd: (otId: string) => void
  onRemove: (otId: string, idx: number) => void
  onUpdate: (otId: string, idx: number, updates: Partial<OutputTypeField>) => void
  onReset: (otId: string) => void
  onClear: (otId: string) => void
  onSetPrimary: (otId: string, idx: number) => void
}

export function ElementFieldsEditor({
  otId, elementLabel, otFieldCount, otName,
  fieldOverrides,
  onAdd, onRemove, onUpdate, onReset, onClear, onSetPrimary,
}: ElementFieldsEditorProps) {
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
            — detail sections shown for each {elementLabel.toLowerCase()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {hasCustomFields && (
            <button
              onClick={() => onClear(otId)}
              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Use defaults (don't customize)"
            >
              <X className="h-2.5 w-2.5" /> Use defaults
            </button>
          )}
          {hasCustomFields && (
            <button
              onClick={() => onReset(otId)}
              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Reset to output type defaults"
            >
              <RotateCcw className="h-2.5 w-2.5" /> Reset
            </button>
          )}
          {hasCustomFields && (
            <button
              onClick={() => onAdd(otId)}
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
              onClick={() => onReset(otId)}
              className="mt-1.5 text-[11px] font-medium text-primary hover:underline"
            >
              Load {otFieldCount} defaults
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
                    onChange={(e) => onUpdate(otId, idx, { key: e.target.value.replace(/\s/g, '') })}
                    placeholder="key"
                    className="w-20 border-none bg-transparent px-0 text-[11px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                  <input
                    value={field.label}
                    onChange={(e) => onUpdate(otId, idx, { label: e.target.value })}
                    placeholder="Label"
                    className="min-w-0 flex-1 border-none bg-transparent px-0 text-[11px] font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => {
                      const newType = e.target.value as OutputTypeField['type']
                      const updates: Partial<OutputTypeField> = { type: newType }
                      if (newType === 'table' && !field.columns?.length) {
                        updates.columns = [{ key: 'col1', label: 'Column 1' }, { key: 'col2', label: 'Column 2' }]
                      }
                      if (newType !== 'table') updates.columns = undefined
                      onUpdate(otId, idx, updates)
                    }}
                    className="h-5 rounded border border-border bg-background px-1 text-[9px]"
                  >
                    <option value="short-text">Short</option>
                    <option value="long-text">Long</option>
                    <option value="table">Table</option>
                  </select>
                  <label className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                    <input
                      type="radio"
                      name={`cfg-primary-${otId}-${idx}`}
                      checked={!!field.primary}
                      onChange={() => onSetPrimary(otId, idx)}
                    />
                    1st
                  </label>
                  <button
                    onClick={() => onRemove(otId, idx)}
                    className="rounded p-0.5 text-muted-foreground/40 opacity-0 transition-opacity hover:text-destructive group-hover/field:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                {!field.primary && (
                  <div className="ml-6 mt-0.5 flex items-center gap-2">
                    <select
                      value={field.color || ''}
                      onChange={(e) => onUpdate(otId, idx, { color: (e.target.value || undefined) as FieldColor | undefined })}
                      className="h-5 rounded border border-border bg-background px-1 text-[9px]"
                    >
                      {FIELD_COLOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <select
                      value={field.icon || ''}
                      onChange={(e) => onUpdate(otId, idx, { icon: e.target.value || undefined })}
                      className="h-5 rounded border border-border bg-background px-1 text-[9px]"
                    >
                      {FIELD_ICON_OPTIONS.map((i) => <option key={i} value={i}>{i || '— Icon —'}</option>)}
                    </select>
                  </div>
                )}
                {field.type === 'table' && (
                  <div className="ml-6 mt-1 space-y-1 rounded border border-dashed border-border/60 bg-muted/20 p-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-semibold text-muted-foreground">Columns</span>
                      <button type="button" onClick={() => {
                        const cols = [...(field.columns || [])]
                        cols.push({ key: `col${cols.length + 1}`, label: `Column ${cols.length + 1}` })
                        onUpdate(otId, idx, { columns: cols })
                      }} className="text-[9px] font-medium text-primary hover:underline">+ Add</button>
                    </div>
                    {(field.columns || []).map((col, ci) => (
                      <div key={ci} className="flex items-center gap-1">
                        <input
                          value={col.key}
                          onChange={(e) => {
                            const cols = [...(field.columns || [])]
                            cols[ci] = { ...cols[ci], key: e.target.value.replace(/\s/g, '') }
                            onUpdate(otId, idx, { columns: cols })
                          }}
                          placeholder="key"
                          className="w-16 border-none bg-transparent px-0 text-[9px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                        />
                        <input
                          value={col.label}
                          onChange={(e) => {
                            const cols = [...(field.columns || [])]
                            cols[ci] = { ...cols[ci], label: e.target.value }
                            onUpdate(otId, idx, { columns: cols })
                          }}
                          placeholder="Label"
                          className="min-w-0 flex-1 border-none bg-transparent px-0 text-[9px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                        />
                        <button onClick={() => {
                          const cols = (field.columns || []).filter((_, i) => i !== ci)
                          onUpdate(otId, idx, { columns: cols })
                        }} className="p-0.5 text-muted-foreground/40 hover:text-destructive" disabled={(field.columns || []).length <= 1}>
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="rounded-md border border-dashed border-border bg-card px-3 py-3 text-center">
          <p className="text-[11px] text-muted-foreground">
            Using {otFieldCount} default fields from {otName}.
          </p>
          <button
            onClick={() => onReset(otId)}
            className="mt-1.5 flex items-center gap-0.5 mx-auto text-[11px] font-medium text-primary hover:underline"
          >
            <PencilSmall className="h-2.5 w-2.5" /> Customize fields
          </button>
        </div>
      )}
    </div>
  )
}
