'use client'

import { FRAMEWORK_DEFINITIONS, IDEATION_STRATEGIES, type IdeaFramework, type IdeationStrategy } from '@/lib/idea-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Sparkles, Loader2, Wand2 } from 'lucide-react'
import { FrameworkIcon } from '../_lib/ideas-utils'

interface NewIdeaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onTitleChange: (v: string) => void
  framework: IdeaFramework
  onFrameworkChange: (v: IdeaFramework) => void
  onCreate: () => void
}

export function NewIdeaDialog({
  open, onOpenChange, title, onTitleChange, framework, onFrameworkChange, onCreate,
}: NewIdeaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>New Idea</DialogTitle>
          <DialogDescription>Choose a framework and give your idea a title.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 overflow-y-auto flex-1 min-h-0">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Title</label>
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="e.g. HR Retention Question Book"
              onKeyDown={(e) => e.key === 'Enter' && onCreate()}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Framework</label>
            <div className="grid gap-1.5">
              {FRAMEWORK_DEFINITIONS.map((fw) => (
                <button
                  key={fw.id}
                  onClick={() => onFrameworkChange(fw.id)}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${framework === fw.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                >
                  <FrameworkIcon iconName={fw.icon} className={`h-4 w-4 shrink-0 ${framework === fw.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{fw.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{fw.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onCreate} disabled={!title.trim()}>Create Idea</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface AIGenerateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  topic: string
  onTopicChange: (v: string) => void
  framework: IdeaFramework
  onFrameworkChange: (v: IdeaFramework) => void
  strategy: IdeationStrategy
  onStrategyChange: (v: IdeationStrategy) => void
  count: number
  onCountChange: (v: number) => void
  generating: boolean
  onGenerate: () => void
}

export function AIGenerateDialog({
  open, onOpenChange, topic, onTopicChange, framework, onFrameworkChange,
  strategy, onStrategyChange, count, onCountChange, generating, onGenerate,
}: AIGenerateDialogProps) {
  const selectedStrategy = IDEATION_STRATEGIES.find((s) => s.id === strategy)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Ideas with AI
          </DialogTitle>
          <DialogDescription>
            Enter a topic or industry and AI will generate structured digital product ideas.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 overflow-y-auto flex-1 min-h-0">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Topic or Domain</label>
            <Input
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              placeholder="e.g. HR management, SaaS onboarding, real estate investing"
              onKeyDown={(e) => e.key === 'Enter' && !generating && onGenerate()}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Ideation Strategy</label>
            <select
              value={strategy}
              onChange={(e) => onStrategyChange(e.target.value as IdeationStrategy)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {IDEATION_STRATEGIES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {selectedStrategy && (
              <p className="mt-1 text-xs text-muted-foreground">{selectedStrategy.description}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Presentation Framework</label>
            <select
              value={framework}
              onChange={(e) => onFrameworkChange(e.target.value as IdeaFramework)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {FRAMEWORK_DEFINITIONS.map((fw) => (
                <option key={fw.id} value={fw.id}>{fw.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Number of ideas</label>
            <select
              value={count}
              onChange={(e) => onCountChange(Number(e.target.value))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {[3, 5, 8, 10].map((n) => (
                <option key={n} value={n}>{n} ideas</option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={generating}>Cancel</Button>
          <Button onClick={onGenerate} disabled={!topic.trim() || generating} className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {generating ? 'Generating...' : 'Generate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
