'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Wand2, Sparkles, Loader2 } from 'lucide-react'

interface AIWizardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt: string
  onPromptChange: (value: string) => void
  loading: boolean
  error: string | null
  onGenerate: () => void
  onClearError: () => void
}

export function AIWizardDialog({
  open, onOpenChange, prompt, onPromptChange,
  loading, error, onGenerate, onClearError,
}: AIWizardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!loading) { onOpenChange(o); if (!o) onClearError() } }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            AI Configuration Wizard
          </DialogTitle>
          <DialogDescription>
            Describe what you want to generate in plain English. The AI will design a complete configuration with steps, fields, output types, section drivers, and instruction directives.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              What would you like to create?
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder={'e.g. "Know your role: Pain points of CISO"\n\nor\n\n"An email course teaching SaaS founders how to reduce churn, organized by lifecycle stage"'}
              rows={5}
              className="resize-none"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && prompt.trim() && !loading) {
                  onGenerate()
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Be specific about the topic, target audience, and type of content you want.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 rounded-md border border-primary/20 bg-primary/5 px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Designing your configuration...</p>
                <p className="text-xs text-muted-foreground">Choosing fields, output types, drivers, and directives</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => { onOpenChange(false); onClearError() }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={onGenerate}
            disabled={!prompt.trim() || loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate Configuration
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
