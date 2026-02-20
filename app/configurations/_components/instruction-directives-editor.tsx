'use client'

import type { InstructionDirective } from '@/lib/setup-config-types'
import { Plus, X, RotateCcw, ScrollText, Pencil as PencilSmall } from 'lucide-react'

interface InstructionDirectivesEditorProps {
  otId: string
  sectionLabel: string
  directives: InstructionDirective[]
  defaultDirectives: InstructionDirective[]
  hasCustomDirectives: boolean
  onAdd: (otId: string) => void
  onRemove: (otId: string, idx: number) => void
  onUpdate: (otId: string, idx: number, updates: Partial<InstructionDirective>) => void
  onReset: (otId: string) => void
  onClear: (otId: string) => void
}

export function InstructionDirectivesEditor({
  otId, sectionLabel, directives, defaultDirectives, hasCustomDirectives,
  onAdd, onRemove, onUpdate, onReset, onClear,
}: InstructionDirectivesEditorProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ScrollText className="h-3 w-3 text-primary/60" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
            Instruction Directives
          </span>
          <span className="text-[10px] text-muted-foreground">
            — rules the AI follows per {sectionLabel.toLowerCase()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {hasCustomDirectives && defaultDirectives.length > 0 && (
            <button
              onClick={() => onClear(otId)}
              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Use defaults (don't customize)"
            >
              <X className="h-2.5 w-2.5" /> Use defaults
            </button>
          )}
          {hasCustomDirectives && defaultDirectives.length > 0 && (
            <button
              onClick={() => onReset(otId)}
              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Reset to defaults"
            >
              <RotateCcw className="h-2.5 w-2.5" /> Reset
            </button>
          )}
          {hasCustomDirectives && (
            <button
              onClick={() => onAdd(otId)}
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
                onClick={() => onReset(otId)}
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
                    onChange={(e) => onUpdate(otId, idx, { label: e.target.value })}
                    placeholder="Directive label..."
                    className="w-full border-none bg-transparent px-0 text-[11px] font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                  <textarea
                    value={dir.content}
                    onChange={(e) => onUpdate(otId, idx, { content: e.target.value })}
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
                  onClick={() => onRemove(otId, idx)}
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
            onClick={() => onReset(otId)}
            className="mt-1.5 flex items-center gap-0.5 mx-auto text-[11px] font-medium text-primary hover:underline"
          >
            <PencilSmall className="h-2.5 w-2.5" /> Customize directives
          </button>
        </div>
      )}
    </div>
  )
}
