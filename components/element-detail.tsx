'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { OutputTypeDefinition, OutputTypeField } from '@/lib/output-type-library'
import type { ProductSection } from '@/lib/product-types'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Check,
  Pencil,
  Copy,
  CheckCheck,
  ArrowUpRight,
  AlertTriangle,
  Shield,
  Zap,
  Target,
  Clock,
  Mail,
  Sparkles,
  Swords,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Scale,
  GitBranch,
  Info,
  ListChecks,
  BarChart3,
  AlertOctagon,
  Lightbulb,
  ClipboardCheck,
  Bookmark,
  Repeat,
  CalendarClock,
  Shuffle,
  FileText,
  ShieldQuestion,
  Trophy,
  DollarSign,
  Users,
  Compass,
  FileOutput,
  type LucideIcon,
} from 'lucide-react'

export interface ElementDetailProps {
  outputType: string
  outputTypeDef: OutputTypeDefinition
  sectionName: string
  sectionDescription: string
  element: ProductSection['elements'][number]
  sIndex: number
  eIndex: number
  editingField: string | null
  editValue: string
  onStartEdit: (fieldKey: string, currentValue: string) => void
  onSaveEdit: (sIndex: number, eIndex: number, fieldKey: string) => void
  onCancelEdit: () => void
  onEditValueChange: (value: string) => void
  resolvedFields?: OutputTypeField[]
  sectionResolvedFields?: OutputTypeField[]
}

// ============================================================
// Color and icon maps for schema-driven rendering
// ============================================================

const COLOR_MAP: Record<string, { border: string; bg: string; text: string }> = {
  amber:   { border: 'border-amber-500/20',   bg: 'bg-amber-500/5',   text: 'text-amber-600 dark:text-amber-400' },
  blue:    { border: 'border-blue-500/20',    bg: 'bg-blue-500/5',    text: 'text-blue-600 dark:text-blue-400' },
  red:     { border: 'border-red-500/20',     bg: 'bg-red-500/5',     text: 'text-red-600 dark:text-red-400' },
  green:   { border: 'border-green-500/20',   bg: 'bg-green-500/5',   text: 'text-green-600 dark:text-green-400' },
  emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', text: 'text-emerald-600 dark:text-emerald-400' },
  violet:  { border: 'border-violet-500/20',  bg: 'bg-violet-500/5',  text: 'text-violet-600 dark:text-violet-400' },
  primary: { border: 'border-primary/20',     bg: 'bg-primary/5',     text: 'text-primary' },
  none:    { border: 'border-border',         bg: 'bg-card',          text: 'text-muted-foreground' },
}

const DEFAULT_COLOR = COLOR_MAP.none

const ICON_MAP: Record<string, LucideIcon> = {
  Target, ArrowUpRight, AlertTriangle, Shield, Zap, Clock, Mail,
  Sparkles, Swords, ThumbsUp, ThumbsDown, MessageSquare, Scale,
  GitBranch, Info, CheckCheck, ListChecks, BarChart3, AlertOctagon,
  Lightbulb, ClipboardCheck, Bookmark, Repeat, CalendarClock,
  Shuffle, FileText, ShieldQuestion, Trophy, DollarSign, Users,
  Compass, FileOutput, Copy, Check, Pencil,
}

// ============================================================
// Editable field primitives (unchanged)
// ============================================================

function EditableField({
  fieldKey, label, value, sIndex, eIndex, editingField, editValue,
  onStartEdit, onSaveEdit, onCancelEdit, onEditValueChange,
  className, valueClassName, multiline = true,
}: {
  fieldKey: string; label?: string; value: string; sIndex: number; eIndex: number
  editingField: string | null; editValue: string
  onStartEdit: (key: string, val: string) => void
  onSaveEdit: (s: number, e: number, k: string) => void
  onCancelEdit: () => void; onEditValueChange: (v: string) => void
  className?: string; valueClassName?: string; multiline?: boolean
}) {
  const editKey = `field-${sIndex}-${eIndex}-${fieldKey}`
  if (editingField === editKey) {
    return (
      <div className={cn('space-y-2', className)}>
        <Textarea value={editValue} onChange={(e) => onEditValueChange(e.target.value)} className="text-[14px]" autoFocus rows={multiline ? 4 : 2} />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onSaveEdit(sIndex, eIndex, fieldKey)} className="gap-1.5"><Check className="h-3.5 w-3.5" /> Save</Button>
          <Button variant="ghost" size="sm" onClick={onCancelEdit}>Cancel</Button>
        </div>
      </div>
    )
  }
  return (
    <div onClick={() => onStartEdit(editKey, value)} className={cn('group cursor-text', className)} title="Click to edit">
      <p className={cn('text-[14px] leading-relaxed text-foreground transition-colors group-hover:text-primary/80', valueClassName)}>
        {value}
        <Pencil className="ml-2 inline h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </p>
    </div>
  )
}

function EditablePrimary({
  fieldKey, value, sIndex, eIndex, editingField, editValue,
  onStartEdit, onSaveEdit, onCancelEdit, onEditValueChange, className,
}: {
  fieldKey: string; value: string; sIndex: number; eIndex: number
  editingField: string | null; editValue: string
  onStartEdit: (key: string, val: string) => void
  onSaveEdit: (s: number, e: number, k: string) => void
  onCancelEdit: () => void; onEditValueChange: (v: string) => void
  className?: string
}) {
  const editKey = `primary-${sIndex}-${eIndex}`
  if (editingField === editKey) {
    return (
      <div className="space-y-2">
        <Textarea value={editValue} onChange={(e) => onEditValueChange(e.target.value)} className="text-[16px] font-bold leading-tight" autoFocus />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onSaveEdit(sIndex, eIndex, fieldKey)} className="gap-1.5"><Check className="h-3.5 w-3.5" /> Save</Button>
          <Button variant="ghost" size="sm" onClick={onCancelEdit}>Cancel</Button>
        </div>
      </div>
    )
  }
  return (
    <h2 onClick={() => onStartEdit(editKey, value)}
      className={cn('group cursor-text text-[16px] font-bold leading-tight tracking-tight text-foreground transition-colors hover:text-primary', className)}
      title="Click to edit">
      {value}
      <Pencil className="ml-2 inline h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </h2>
  )
}

// ============================================================
// Copyable primary field (for prompts, code snippets, etc.)
// ============================================================

function CopyablePrimary({
  fieldKey, value, sIndex, eIndex, editingField, editValue,
  onStartEdit, onSaveEdit, onCancelEdit, onEditValueChange,
}: {
  fieldKey: string; value: string; sIndex: number; eIndex: number
  editingField: string | null; editValue: string
  onStartEdit: (key: string, val: string) => void
  onSaveEdit: (s: number, e: number, k: string) => void
  onCancelEdit: () => void; onEditValueChange: (v: string) => void
}) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const editKey = `primary-${sIndex}-${eIndex}`
  if (editingField === editKey) {
    return (
      <div className="space-y-2">
        <Textarea value={editValue} onChange={(e) => onEditValueChange(e.target.value)} className="text-[13.5px] font-mono leading-[1.7]" autoFocus rows={6} />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onSaveEdit(sIndex, eIndex, fieldKey)} className="gap-1.5"><Check className="h-3.5 w-3.5" /> Save</Button>
          <Button variant="ghost" size="sm" onClick={onCancelEdit}>Cancel</Button>
        </div>
      </div>
    )
  }
  return (
    <div className="relative rounded-lg border border-border bg-muted/50 p-5 font-mono">
      <button onClick={handleCopy}
        className="absolute right-3 top-3 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        {copied ? <><CheckCheck className="mr-1.5 inline h-3 w-3 text-green-500" /> Copied</> : <><Copy className="mr-1.5 inline h-3 w-3" /> Copy</>}
      </button>
      <div onClick={() => onStartEdit(editKey, value)} className="group cursor-text" title="Click to edit">
        <p className="whitespace-pre-wrap text-[13.5px] leading-[1.7] font-mono text-foreground transition-colors group-hover:text-primary/80">
          {value}
          <Pencil className="ml-2 inline h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </p>
      </div>
    </div>
  )
}

// ============================================================
// Helper to extract edit callback props
// ============================================================

function editProps(props: ElementDetailProps) {
  return {
    editingField: props.editingField,
    editValue: props.editValue,
    onStartEdit: props.onStartEdit,
    onSaveEdit: props.onSaveEdit,
    onCancelEdit: props.onCancelEdit,
    onEditValueChange: props.onEditValueChange,
  }
}

// ============================================================
// Schema-driven renderer — replaces all per-type renderers
// ============================================================

function FieldCard({
  fieldDef, value, sIndex, eIndex, props,
}: {
  fieldDef: OutputTypeField; value: string; sIndex: number; eIndex: number; props: ElementDetailProps
}) {
  const colorKey = fieldDef.color || 'none'
  const colors = COLOR_MAP[colorKey] || DEFAULT_COLOR
  const IconComponent = fieldDef.icon ? ICON_MAP[fieldDef.icon] : null

  return (
    <div className={cn('rounded-lg border p-5', colors.border, colors.bg)}>
      <div className={cn('mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide', colors.text)}>
        {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
        {fieldDef.label}
      </div>
      <EditableField
        fieldKey={fieldDef.key}
        value={value}
        sIndex={sIndex}
        eIndex={eIndex}
        {...editProps(props)}
        valueClassName={fieldDef.type === 'long-text' ? 'whitespace-pre-wrap' : undefined}
        multiline={fieldDef.type === 'long-text'}
      />
    </div>
  )
}

export function ElementDetail(props: ElementDetailProps) {
  const { element, sIndex, eIndex, outputTypeDef, outputType, resolvedFields, sectionResolvedFields } = props
  const fields = sectionResolvedFields ?? resolvedFields ?? outputTypeDef.fields
  const primaryField = fields.find((f) => f.primary)
  const primaryKey = primaryField?.key || Object.keys(element.fields)[0]
  const primaryVal = element.fields[primaryKey] || ''
  const nonPrimaryFields = fields.filter((f) => !f.primary)

  const isPromptType = outputType === 'prompts'

  return (
    <div className="space-y-5">
      {isPromptType ? (
        <>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 shrink-0 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">AI Prompt Template</span>
          </div>
          <CopyablePrimary fieldKey={primaryKey} value={primaryVal} sIndex={sIndex} eIndex={eIndex} {...editProps(props)} />
        </>
      ) : (
        <EditablePrimary fieldKey={primaryKey} value={primaryVal} sIndex={sIndex} eIndex={eIndex} {...editProps(props)} />
      )}

      {nonPrimaryFields.map((fieldDef) => {
        const value = element.fields[fieldDef.key]
        if (!value) return null
        return (
          <FieldCard
            key={fieldDef.key}
            fieldDef={fieldDef}
            value={value}
            sIndex={sIndex}
            eIndex={eIndex}
            props={props}
          />
        )
      })}
    </div>
  )
}
