'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { OutputTypeDefinition } from '@/lib/output-type-library'
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
} from 'lucide-react'

interface ElementDetailProps {
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
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; icon: typeof Zap }> = {
  High: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-600 dark:text-red-400', icon: Zap },
  Medium: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', icon: Target },
  Low: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-600 dark:text-blue-400', icon: Clock },
}

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

function QuestionDetail(props: ElementDetailProps) {
  const { element, sIndex, eIndex, outputTypeDef } = props
  const primaryKey = outputTypeDef.fields.find((f) => f.primary)?.key || 'question'
  const primaryVal = element.fields[primaryKey] || ''

  return (
    <div className="space-y-5">
      <EditablePrimary fieldKey={primaryKey} value={primaryVal} sIndex={sIndex} eIndex={eIndex} {...editProps(props)} />

      {element.fields.relevance && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            <Target className="h-3.5 w-3.5" /> Why This Matters
          </div>
          <EditableField fieldKey="relevance" value={element.fields.relevance} sIndex={sIndex} eIndex={eIndex} {...editProps(props)} />
        </div>
      )}

      {element.fields.infoPrompt && (
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            <ArrowUpRight className="h-3.5 w-3.5" /> How to Find the Answer
          </div>
          <EditableField fieldKey="infoPrompt" value={element.fields.infoPrompt} sIndex={sIndex} eIndex={eIndex} {...editProps(props)} />
        </div>
      )}
    </div>
  )
}

function ChecklistDetail(props: ElementDetailProps) {
  const { element, sIndex, eIndex } = props
  const item = element.fields.item || ''
  const description = element.fields.description || ''
  const priority = element.fields.priority || 'Medium'
  const pStyle = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium
  const PIcon = pStyle.icon

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <EditablePrimary fieldKey="item" value={item} sIndex={sIndex} eIndex={eIndex} {...editProps(props)} />
        </div>
        <span className={cn('mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold', pStyle.bg, pStyle.text)}>
          <PIcon className="h-3 w-3" /> {priority}
        </span>
      </div>

      {description && (
        <div className={cn('rounded-lg border p-5', pStyle.bg)}>
          <div className={cn('mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide', pStyle.text)}>
            <Shield className="h-3.5 w-3.5" /> What to Know
          </div>
          <EditableField fieldKey="description" value={description} sIndex={sIndex} eIndex={eIndex} {...editProps(props)} />
        </div>
      )}
    </div>
  )
}

function EmailCourseDetail(props: ElementDetailProps) {
  const { element, sIndex, eIndex } = props
  const subject = element.fields.subject || ''
  const body = element.fields.body || ''
  const cta = element.fields.callToAction || ''

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Mail className="h-5 w-5 shrink-0 text-primary" />
        <EditablePrimary fieldKey="subject" value={subject} sIndex={sIndex} eIndex={eIndex} {...editProps(props)} />
      </div>

      {body && (
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="prose-sm max-w-none">
            <EditableField fieldKey="body" value={body} sIndex={sIndex} eIndex={eIndex} {...editProps(props)}
              valueClassName="whitespace-pre-wrap text-[14px] leading-[1.75]" />
          </div>
        </div>
      )}

      {cta && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
            <ArrowUpRight className="h-3.5 w-3.5" /> Call to Action
          </div>
          <EditableField fieldKey="callToAction" value={cta} sIndex={sIndex} eIndex={eIndex} {...editProps(props)}
            valueClassName="font-semibold text-primary" multiline={false} />
        </div>
      )}
    </div>
  )
}

function PromptPackDetail(props: ElementDetailProps) {
  const { element, sIndex, eIndex } = props
  const prompt = element.fields.prompt || ''
  const context = element.fields.context || ''
  const expectedOutput = element.fields.expectedOutput || ''
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 shrink-0 text-primary" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">AI Prompt Template</span>
      </div>

      <div className="relative rounded-lg border border-border bg-muted/50 p-5 font-mono">
        <button onClick={handleCopy}
          className="absolute right-3 top-3 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          {copied ? <><CheckCheck className="mr-1.5 inline h-3 w-3 text-green-500" /> Copied</> : <><Copy className="mr-1.5 inline h-3 w-3" /> Copy</>}
        </button>
        <EditableField fieldKey="prompt" value={prompt} sIndex={sIndex} eIndex={eIndex} {...editProps(props)}
          valueClassName="whitespace-pre-wrap text-[13.5px] leading-[1.7] font-mono" />
      </div>

      {context && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            <Target className="h-3.5 w-3.5" /> When to Use
          </div>
          <EditableField fieldKey="context" value={context} sIndex={sIndex} eIndex={eIndex} {...editProps(props)} />
        </div>
      )}

      {expectedOutput && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            <CheckCheck className="h-3.5 w-3.5" /> Expected Output
          </div>
          <EditableField fieldKey="expectedOutput" value={expectedOutput} sIndex={sIndex} eIndex={eIndex} {...editProps(props)} />
        </div>
      )}
    </div>
  )
}

function BattleCardDetail(props: ElementDetailProps) {
  const { element, sIndex, eIndex } = props
  const title = element.fields.title || ''
  const strengths = element.fields.strengths || ''
  const weaknesses = element.fields.weaknesses || ''
  const talkingPoints = element.fields.talkingPoints || ''

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Swords className="h-5 w-5 shrink-0 text-primary" />
        <EditablePrimary fieldKey="title" value={title} sIndex={sIndex} eIndex={eIndex} {...editProps(props)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {strengths && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
              <ThumbsUp className="h-3.5 w-3.5" /> Their Strengths
            </div>
            <EditableField fieldKey="strengths" value={strengths} sIndex={sIndex} eIndex={eIndex} {...editProps(props)}
              valueClassName="whitespace-pre-wrap" />
          </div>
        )}

        {weaknesses && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-green-600 dark:text-green-400">
              <ThumbsDown className="h-3.5 w-3.5" /> Their Weaknesses
            </div>
            <EditableField fieldKey="weaknesses" value={weaknesses} sIndex={sIndex} eIndex={eIndex} {...editProps(props)}
              valueClassName="whitespace-pre-wrap" />
          </div>
        )}
      </div>

      {talkingPoints && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
            <MessageSquare className="h-3.5 w-3.5" /> Your Talking Points
          </div>
          <EditableField fieldKey="talkingPoints" value={talkingPoints} sIndex={sIndex} eIndex={eIndex} {...editProps(props)}
            valueClassName="whitespace-pre-wrap font-medium" />
        </div>
      )}
    </div>
  )
}

function GenericDetail(props: ElementDetailProps) {
  const { element, sIndex, eIndex, outputTypeDef } = props
  const primaryField = outputTypeDef.fields.find((f) => f.primary)
  const primaryKey = primaryField?.key || Object.keys(element.fields)[0]
  const primaryVal = element.fields[primaryKey] || ''
  const nonPrimaryFields = outputTypeDef.fields.filter((f) => !f.primary)

  return (
    <div className="space-y-5">
      <EditablePrimary fieldKey={primaryKey} value={primaryVal} sIndex={sIndex} eIndex={eIndex} {...editProps(props)} />

      {nonPrimaryFields.map((fieldDef) => {
        const value = element.fields[fieldDef.key]
        if (!value) return null
        return (
          <div key={fieldDef.key} className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">{fieldDef.label}</div>
            <EditableField fieldKey={fieldDef.key} value={value} sIndex={sIndex} eIndex={eIndex} {...editProps(props)} />
          </div>
        )
      })}
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

const RENDERERS: Record<string, (props: ElementDetailProps) => React.JSX.Element> = {
  questions: QuestionDetail,
  checklist: ChecklistDetail,
  'email-course': EmailCourseDetail,
  prompts: PromptPackDetail,
  'battle-cards': BattleCardDetail,
}

export function ElementDetail(props: ElementDetailProps) {
  const Renderer = RENDERERS[props.outputType] || GenericDetail
  return <Renderer {...props} />
}
