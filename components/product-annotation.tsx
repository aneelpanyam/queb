'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  ANNOTATION_TYPE_META,
  type Annotation,
  type AnnotationType,
} from '@/lib/product-types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  FileText,
  MessageSquare,
  Target,
  Lightbulb,
  AlertTriangle,
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
} from 'lucide-react'

const ICON_MAP: Record<string, typeof FileText> = {
  FileText,
  MessageSquare,
  Target,
  Lightbulb,
  AlertTriangle,
  ClipboardList,
}

const ANNOTATION_TYPES: AnnotationType[] = [
  'expert-note',
  'opinion',
  'guidance',
  'tip',
  'warning',
  'example',
]

interface AnnotationCardProps {
  annotation: Annotation
  onEdit: (annotation: Annotation) => void
  onDelete: (id: string) => void
}

function AnnotationCard({ annotation, onEdit, onDelete }: AnnotationCardProps) {
  const meta = ANNOTATION_TYPE_META[annotation.type]
  const Icon = ICON_MAP[meta.icon] || FileText

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn('inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide', meta.color)}>
            <Icon className="h-3 w-3" />
            {meta.label}
          </span>
          <span className="text-sm font-semibold text-foreground">{annotation.title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button onClick={() => onEdit(annotation)} className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(annotation.id)} className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{annotation.content}</p>
      {annotation.author && (
        <p className="mt-2 text-xs text-muted-foreground">
          — {annotation.author} · {new Date(annotation.updatedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}

interface AnnotationFormProps {
  initial?: Annotation
  defaultAuthor?: string
  onSave: (data: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

function AnnotationForm({ initial, defaultAuthor, onSave, onCancel }: AnnotationFormProps) {
  const [type, setType] = useState<AnnotationType>(initial?.type || 'expert-note')
  const [title, setTitle] = useState(initial?.title || '')
  const [content, setContent] = useState(initial?.content || '')
  const [author, setAuthor] = useState(initial?.author || defaultAuthor || '')

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return
    onSave({ type, title: title.trim(), content: content.trim(), author: author.trim() })
  }

  return (
    <div className="rounded-lg border-2 border-primary/20 bg-card p-4 shadow-sm">
      <div className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">
        {initial ? 'Edit Annotation' : 'New Annotation'}
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {ANNOTATION_TYPES.map((t) => {
          const meta = ANNOTATION_TYPE_META[t]
          const Icon = ICON_MAP[meta.icon] || FileText
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold transition-all',
                type === t
                  ? cn(meta.color, 'ring-1 ring-current')
                  : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'
              )}
            >
              <Icon className="h-3 w-3" />
              {meta.label}
            </button>
          )
        })}
      </div>

      <div className="space-y-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Annotation title..." className="text-sm" />
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share your expertise, opinion, or guidance..." className="min-h-[100px] text-sm" />
        <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" className="text-sm" />
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} className="gap-1.5">
          <X className="h-3.5 w-3.5" /> Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={!title.trim() || !content.trim()} className="gap-1.5">
          <Check className="h-3.5 w-3.5" /> {initial ? 'Update' : 'Add'}
        </Button>
      </div>
    </div>
  )
}

interface ProductAnnotationsProps {
  annotations: Annotation[]
  defaultAuthor?: string
  onAdd: (data: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdate: (id: string, data: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDelete: (id: string) => void
}

export function ProductAnnotations({ annotations, defaultAuthor, onAdd, onUpdate, onDelete }: ProductAnnotationsProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAdd = (data: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => {
    onAdd(data)
    setShowForm(false)
  }

  const handleEdit = (annotation: Annotation) => {
    setEditingId(annotation.id)
    setShowForm(false)
  }

  const handleUpdate = (id: string, data: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => {
    onUpdate(id, data)
    setEditingId(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
          Annotations {annotations.length > 0 && `(${annotations.length})`}
        </h3>
        {!showForm && !editingId && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="h-7 gap-1.5 text-xs">
            <Plus className="h-3 w-3" /> Add Annotation
          </Button>
        )}
      </div>

      {annotations.map((annotation) =>
        editingId === annotation.id ? (
          <AnnotationForm
            key={annotation.id}
            initial={annotation}
            defaultAuthor={defaultAuthor}
            onSave={(data) => handleUpdate(annotation.id, data)}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <AnnotationCard key={annotation.id} annotation={annotation} onEdit={handleEdit} onDelete={onDelete} />
        )
      )}

      {showForm && (
        <AnnotationForm defaultAuthor={defaultAuthor} onSave={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      {annotations.length === 0 && !showForm && (
        <p className="py-2 text-center text-xs text-muted-foreground">
          No annotations yet. Add your expert insights to make this product valuable.
        </p>
      )}
    </div>
  )
}
