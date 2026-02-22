'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { OutputTypeDefinition, OutputTypeField } from '@/lib/output-type-library'
import type { ProductSection, FieldValue, TableRow } from '@/lib/product-types'
import { fieldAsString, fieldAsTable } from '@/lib/product-types'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow as UITableRow,
  TableCell,
} from '@/components/ui/table'
import { MarkdownProse } from '@/components/markdown-prose'
import { MarkdownEditor } from '@/components/markdown-editor'
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
  FlaskConical,
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
  onUpdateTable?: (sIndex: number, eIndex: number, fieldKey: string, rows: TableRow[]) => void
  resolvedFields?: OutputTypeField[]
  sectionResolvedFields?: OutputTypeField[]
}

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
  Compass, FileOutput, FlaskConical, Copy, Check, Pencil,
}

function EditableField({
  fieldKey, value, sIndex, eIndex, editingField, editValue,
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
    if (multiline) {
      return (
        <div className={className}>
          <MarkdownEditor
            value={editValue}
            onChange={onEditValueChange}
            onSave={() => onSaveEdit(sIndex, eIndex, fieldKey)}
            onCancel={onCancelEdit}
            minRows={4}
          />
        </div>
      )
    }
    return (
      <div className={cn('space-y-2', className)}>
        <Textarea value={editValue} onChange={(e) => onEditValueChange(e.target.value)} className="text-[14px]" autoFocus rows={2} />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onSaveEdit(sIndex, eIndex, fieldKey)} className="gap-1.5"><Check className="h-3.5 w-3.5" /> Save</Button>
          <Button variant="ghost" size="sm" onClick={onCancelEdit}>Cancel</Button>
        </div>
      </div>
    )
  }
  return (
    <div onClick={() => onStartEdit(editKey, value)} className={cn('group cursor-text rounded-lg transition-colors hover:bg-background/50', className)} title="Click to edit">
      {multiline ? (
        <div className="transition-colors group-hover:text-primary/80">
          <MarkdownProse className={valueClassName}>{value}</MarkdownProse>
          <Pencil className="ml-2 inline h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      ) : (
        <p className={cn('text-[14px] leading-relaxed text-foreground transition-colors group-hover:text-primary/80', valueClassName)}>
          {value}
          <Pencil className="ml-2 inline h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </p>
      )}
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
      <MarkdownEditor
        value={editValue}
        onChange={onEditValueChange}
        onSave={() => onSaveEdit(sIndex, eIndex, fieldKey)}
        onCancel={onCancelEdit}
        minRows={3}
      />
    )
  }
  return (
    <div onClick={() => onStartEdit(editKey, value)}
      className={cn('group cursor-text transition-colors hover:text-primary', className)}
      title="Click to edit">
      <MarkdownProse className="font-display text-xl font-bold leading-tight tracking-tight">{value}</MarkdownProse>
      <Pencil className="ml-2 inline h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  )
}

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
      <MarkdownEditor
        value={editValue}
        onChange={onEditValueChange}
        onSave={() => onSaveEdit(sIndex, eIndex, fieldKey)}
        onCancel={onCancelEdit}
        minRows={6}
        mono
      />
    )
  }
  return (
    <div className="relative rounded-xl border border-border bg-muted/50 p-6 font-mono shadow-sm">
      <button onClick={handleCopy}
        className="absolute right-3 top-3 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        {copied ? <><CheckCheck className="mr-1.5 inline h-3 w-3 text-green-500" /> Copied</> : <><Copy className="mr-1.5 inline h-3 w-3" /> Copy</>}
      </button>
      <div onClick={() => onStartEdit(editKey, value)} className="group cursor-text" title="Click to edit">
        <div className="transition-colors group-hover:text-primary/80">
          <MarkdownProse className="font-mono text-[13.5px] leading-[1.7]">{value}</MarkdownProse>
          <Pencil className="ml-2 inline h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
    </div>
  )
}

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

function FieldCard({
  fieldDef, value, sIndex, eIndex, props,
}: {
  fieldDef: OutputTypeField; value: string; sIndex: number; eIndex: number; props: ElementDetailProps
}) {
  const colorKey = fieldDef.color || 'none'
  const colors = COLOR_MAP[colorKey] || DEFAULT_COLOR
  const IconComponent = fieldDef.icon ? ICON_MAP[fieldDef.icon] : null

  return (
    <div className={cn('rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md', colors.border, colors.bg)}>
      <div className={cn('mb-1 flex items-center gap-2 border-b pb-3 text-xs font-bold uppercase tracking-wide', colors.text, colors.border)}>
        {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
        {fieldDef.label}
      </div>
      <div className="pt-3">
        <EditableField
          fieldKey={fieldDef.key}
          value={value}
          sIndex={sIndex}
          eIndex={eIndex}
          {...editProps(props)}
          multiline={fieldDef.type === 'long-text'}
        />
      </div>
    </div>
  )
}

function TableFieldCard({
  fieldDef, rows, sIndex, eIndex, onUpdateTable,
}: {
  fieldDef: OutputTypeField; rows: TableRow[]; sIndex: number; eIndex: number
  onUpdateTable?: (sIndex: number, eIndex: number, fieldKey: string, rows: TableRow[]) => void
}) {
  const colorKey = fieldDef.color || 'none'
  const colors = COLOR_MAP[colorKey] || DEFAULT_COLOR
  const IconComponent = fieldDef.icon ? ICON_MAP[fieldDef.icon] : null
  const columns = fieldDef.columns || (rows.length > 0 ? Object.keys(rows[0]).map((k) => ({ key: k, label: k })) : [])

  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null)
  const [cellValue, setCellValue] = useState('')

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
  const [resizing, setResizing] = useState(false)
  const tableRef = useRef<HTMLTableElement>(null)
  const dragRef = useRef<{ colKey: string; startX: number; startWidth: number } | null>(null)

  const hasExplicitWidths = Object.keys(columnWidths).length > 0

  const captureWidths = useCallback(() => {
    if (!tableRef.current) return {}
    const ths = tableRef.current.querySelectorAll<HTMLElement>('thead th')
    const widths: Record<string, number> = {}
    columns.forEach((col, i) => {
      if (ths[i]) widths[col.key] = ths[i].offsetWidth
    })
    return widths
  }, [columns])

  const onResizeStart = useCallback((e: React.MouseEvent, colKey: string) => {
    e.preventDefault()
    e.stopPropagation()
    let widths = columnWidths
    if (!hasExplicitWidths) {
      widths = captureWidths()
      setColumnWidths(widths)
    }
    dragRef.current = { colKey, startX: e.clientX, startWidth: widths[colKey] || 100 }
    setResizing(true)
  }, [columnWidths, hasExplicitWidths, captureWidths])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const delta = e.clientX - dragRef.current.startX
      const newWidth = Math.max(60, dragRef.current.startWidth + delta)
      setColumnWidths((prev) => ({ ...prev, [dragRef.current!.colKey]: newWidth }))
    }
    const onUp = () => {
      if (dragRef.current) {
        dragRef.current = null
        setResizing(false)
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  useEffect(() => {
    if (resizing) {
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      return () => {
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [resizing])

  const actionColWidth = onUpdateTable ? 32 : 0
  const tableStyle: React.CSSProperties | undefined = hasExplicitWidths
    ? {
        tableLayout: 'fixed',
        minWidth: Object.values(columnWidths).reduce((s, w) => s + w, 0) + actionColWidth,
      }
    : undefined

  const startCellEdit = (rowIdx: number, colKey: string, current: string) => {
    setEditingCell({ row: rowIdx, col: colKey })
    setCellValue(current)
  }

  const saveCellEdit = () => {
    if (!editingCell || !onUpdateTable) return
    const updated = rows.map((r, i) =>
      i === editingCell.row ? { ...r, [editingCell.col]: cellValue } : r,
    )
    onUpdateTable(sIndex, eIndex, fieldDef.key, updated)
    setEditingCell(null)
    setCellValue('')
  }

  const cancelCellEdit = () => {
    setEditingCell(null)
    setCellValue('')
  }

  const addRow = () => {
    if (!onUpdateTable) return
    const empty: TableRow = {}
    for (const col of columns) empty[col.key] = ''
    onUpdateTable(sIndex, eIndex, fieldDef.key, [...rows, empty])
  }

  const removeRow = (rowIdx: number) => {
    if (!onUpdateTable) return
    onUpdateTable(sIndex, eIndex, fieldDef.key, rows.filter((_, i) => i !== rowIdx))
  }

  return (
    <div className={cn('rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md', colors.border, colors.bg)}>
      <div className={cn('mb-1 flex items-center gap-2 border-b pb-3 text-xs font-bold uppercase tracking-wide', colors.text, colors.border)}>
        {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
        {fieldDef.label}
      </div>
      <div className="pt-3 overflow-x-auto">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No data</p>
        ) : (
          <Table ref={tableRef} style={tableStyle}>
            <TableHeader>
              <UITableRow>
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className="relative select-none text-xs font-semibold"
                    style={hasExplicitWidths ? { width: columnWidths[col.key] } : undefined}
                  >
                    <span className="block pr-2">{col.label}</span>
                    <div
                      onMouseDown={(e) => onResizeStart(e, col.key)}
                      className="absolute -right-px top-0 bottom-0 z-10 w-[5px] cursor-col-resize opacity-0 transition-opacity hover:opacity-100 active:opacity-100"
                    >
                      <div className="mx-auto h-full w-px bg-primary/40" />
                    </div>
                  </TableHead>
                ))}
                {onUpdateTable && <TableHead className="w-8" />}
              </UITableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIdx) => (
                <UITableRow key={rowIdx}>
                  {columns.map((col) => {
                    const isEditing = editingCell?.row === rowIdx && editingCell?.col === col.key
                    return (
                      <TableCell key={col.key} className="py-1.5 align-top">
                        {isEditing ? (
                          <div className="min-w-[180px]">
                            <MarkdownEditor
                              value={cellValue}
                              onChange={setCellValue}
                              onSave={saveCellEdit}
                              onCancel={cancelCellEdit}
                              minRows={3}
                              autoFocus
                            />
                          </div>
                        ) : (
                          <div
                            className={cn('text-sm break-words', onUpdateTable && 'cursor-text group/cell')}
                            onClick={onUpdateTable ? () => startCellEdit(rowIdx, col.key, row[col.key] || '') : undefined}
                            title={onUpdateTable ? 'Click to edit' : undefined}
                          >
                            {row[col.key] ? (
                              <MarkdownProse className="text-[13px] leading-[1.6] [&_p]:mb-1.5 [&_ul]:mb-1.5 [&_ol]:mb-1.5 [&_ul]:ml-4 [&_ol]:ml-4 [&_li]:leading-snug group-hover/cell:text-primary/80">{row[col.key]}</MarkdownProse>
                            ) : (
                              <span className="text-muted-foreground/50">—</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                    )
                  })}
                  {onUpdateTable && (
                    <TableCell className="w-8 py-1.5">
                      <button onClick={() => removeRow(rowIdx)} className="rounded p-0.5 text-muted-foreground/40 hover:text-destructive" title="Remove row">
                        <span className="text-xs">✕</span>
                      </button>
                    </TableCell>
                  )}
                </UITableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {onUpdateTable && (
          <button
            onClick={addRow}
            className="mt-2 flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
          >
            + Add row
          </button>
        )}
      </div>
    </div>
  )
}

export function ElementDetail(props: ElementDetailProps) {
  const { element, sIndex, eIndex, outputTypeDef, outputType, resolvedFields, sectionResolvedFields } = props
  const fields = sectionResolvedFields ?? resolvedFields ?? outputTypeDef.fields
  const primaryField = fields.find((f) => f.primary)
  const primaryKey = primaryField?.key || Object.keys(element.fields)[0]
  const primaryVal = fieldAsString(element.fields[primaryKey])
  const nonPrimaryFields = fields.filter((f) => !f.primary)

  const isPromptType = outputType === 'prompts'

  return (
    <div className="space-y-6">
      {isPromptType ? (
        <>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 shrink-0 text-primary" />
            <span className="font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">AI Prompt Template</span>
          </div>
          <CopyablePrimary fieldKey={primaryKey} value={primaryVal} sIndex={sIndex} eIndex={eIndex} {...editProps(props)} />
        </>
      ) : (
        <EditablePrimary fieldKey={primaryKey} value={primaryVal} sIndex={sIndex} eIndex={eIndex} {...editProps(props)} />
      )}

      {nonPrimaryFields.map((fieldDef) => {
        const rawValue = element.fields[fieldDef.key]
        if (!rawValue) return null

        if (fieldDef.type === 'table') {
          const rows = fieldAsTable(rawValue)
          if (rows.length === 0) return null
          return (
            <TableFieldCard
              key={fieldDef.key}
              fieldDef={fieldDef}
              rows={rows}
              sIndex={sIndex}
              eIndex={eIndex}
              onUpdateTable={props.onUpdateTable}
            />
          )
        }

        const value = fieldAsString(rawValue)
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
