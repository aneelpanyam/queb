'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { outputTypeStorage } from '@/lib/output-type-library'
import {
  IDEA_STATUSES,
  getFrameworkDef,
  type Idea,
} from '@/lib/idea-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Trash2,
  Calendar,
  ArrowRight,
  Loader2,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import { relativeTime, FrameworkIcon, StarRating } from '../_lib/ideas-utils'

interface IdeaCardProps {
  idea: Idea
  expanded: boolean
  onToggle: () => void
  onUpdate: (updates: Partial<Omit<Idea, 'id' | 'createdAt'>>) => void
  onDelete: () => void
  onCreateConfig: () => void
  onRecommend: () => void
  recommending: boolean
}

export function IdeaCard({
  idea,
  expanded,
  onToggle,
  onUpdate,
  onDelete,
  onCreateConfig,
  onRecommend,
  recommending,
}: IdeaCardProps) {
  const router = useRouter()
  const fw = getFrameworkDef(idea.framework)
  const statusDef = IDEA_STATUSES.find((s) => s.value === idea.status)
  const outputTypes = outputTypeStorage.getAll()

  const previewField = fw.fields[0]
  const previewValue = previewField ? idea.frameworkData[previewField.key] : ''

  const [editData, setEditData] = useState(idea.frameworkData)
  const [editNotes, setEditNotes] = useState(idea.notes)
  const [editTitle, setEditTitle] = useState(idea.title)
  const [editTags, setEditTags] = useState(idea.tags.join(', '))
  const [editOutputTypes, setEditOutputTypes] = useState<string[]>(idea.suggestedOutputTypes)

  useEffect(() => {
    setEditData(idea.frameworkData)
    setEditNotes(idea.notes)
    setEditTitle(idea.title)
    setEditTags(idea.tags.join(', '))
    setEditOutputTypes(idea.suggestedOutputTypes)
  }, [idea])

  const handleSave = () => {
    onUpdate({
      title: editTitle.trim() || idea.title,
      frameworkData: editData,
      notes: editNotes,
      tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
      suggestedOutputTypes: editOutputTypes,
    })
    toast.success('Idea updated')
  }

  const toggleOutputType = (otId: string) => {
    setEditOutputTypes((prev) =>
      prev.includes(otId) ? prev.filter((id) => id !== otId) : [...prev, otId]
    )
  }

  return (
    <div className={`rounded-xl border bg-card shadow-sm transition-colors ${expanded ? 'border-primary/40' : 'border-border hover:border-primary/30'}`}>
      {/* Summary row */}
      <div className="flex cursor-pointer items-start gap-4 p-5" onClick={onToggle}>
        <FrameworkIcon iconName={fw.icon} className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 flex-wrap">
            <h3 className="truncate text-base font-semibold text-foreground">{idea.title}</h3>
            {statusDef && (
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusDef.color}`}>
                {statusDef.label}
              </span>
            )}
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              {fw.name}
            </span>
          </div>
          {previewValue && (
            <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{previewValue}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {idea.suggestedOutputTypes.length > 0 && (
              <span>
                {idea.suggestedOutputTypes.map((id) => outputTypes.find((ot) => ot.id === id)?.name || id).join(', ')}
              </span>
            )}
            {idea.tags.length > 0 && (
              <span className="flex items-center gap-1 flex-wrap">
                {idea.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">{t}</Badge>
                ))}
              </span>
            )}
            <StarRating value={idea.rating} onChange={(v) => onUpdate({ rating: (v || undefined) as Idea['rating'] })} />
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {relativeTime(idea.updatedAt)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {!idea.implementationHint && idea.status !== 'built' && idea.status !== 'archived' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRecommend}
              disabled={recommending}
              className="h-8 gap-1.5 text-xs"
              title="Get AI recommendations for which product types to create"
            >
              {recommending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {recommending ? 'Thinking...' : 'Recommend'}
            </Button>
          )}
          {idea.status === 'ready' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateConfig}
              className="h-8 gap-1.5 text-xs"
              title="Create Configuration from this idea"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Create Config
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Expanded detail editor */}
      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Title</label>
            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
            <div className="flex flex-wrap gap-1.5">
              {IDEA_STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => onUpdate({ status: s.value })}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${idea.status === s.value ? s.color + ' ring-1 ring-current' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {fw.fields.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{field.label}</label>
              {field.multiline ? (
                <Textarea
                  value={editData[field.key] || ''}
                  onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  rows={3}
                  className="text-sm"
                />
              ) : (
                <Input
                  value={editData[field.key] || ''}
                  onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="text-sm"
                />
              )}
            </div>
          ))}

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-medium text-muted-foreground">Suggested Product Types</label>
              {idea.status !== 'built' && idea.status !== 'archived' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRecommend}
                  disabled={recommending}
                  className="h-6 gap-1 px-2 text-[10px] text-muted-foreground"
                  title={idea.implementationHint ? 'Regenerate AI recommendations' : 'Get AI recommendations'}
                >
                  {recommending ? <Loader2 className="h-3 w-3 animate-spin" /> : idea.implementationHint ? <RefreshCw className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                  {recommending ? 'Thinking...' : idea.implementationHint ? 'Re-recommend' : 'AI Recommend'}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {outputTypes.map((ot) => (
                <button
                  key={ot.id}
                  onClick={() => toggleOutputType(ot.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${editOutputTypes.includes(ot.id) ? 'bg-primary/15 text-primary ring-1 ring-primary/30' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  {ot.name}
                </button>
              ))}
            </div>
          </div>

          {idea.implementationHint && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
              <p className="text-xs font-medium text-primary">AI Recommendation</p>
              <p className="text-sm text-foreground/90">{idea.implementationHint.summary}</p>
              {idea.implementationHint.recommendations.length > 0 && (
                <ul className="space-y-1">
                  {idea.implementationHint.recommendations.map((rec) => {
                    const ot = outputTypes.find((o) => o.id === rec.outputTypeId)
                    return (
                      <li key={rec.outputTypeId} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-0.5 shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                          {ot?.name || rec.outputTypeId}
                        </span>
                        <span>{rec.rationale}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Tags (comma-separated)</label>
            <Input
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="e.g. hr, retention, enterprise"
              className="text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Notes</label>
            <Textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Free-form notes about this idea..."
              rows={3}
              className="text-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {(idea.status === 'ready' || idea.status === 'developing') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCreateConfig}
                  className="gap-1.5"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  Create Configuration
                </Button>
              )}
              {idea.configurationId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/configurations')}
                  className="gap-1.5 text-xs text-muted-foreground"
                >
                  View Configuration
                </Button>
              )}
            </div>
            <Button size="sm" onClick={handleSave} className="gap-1.5">
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
