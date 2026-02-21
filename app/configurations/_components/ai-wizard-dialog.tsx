'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Wand2, Sparkles, Loader2 } from 'lucide-react'
import {
  FRAMEWORK_DEFINITIONS,
  getFrameworkDef,
  type IdeaFramework,
} from '@/lib/idea-types'

interface AIWizardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  framework: IdeaFramework
  onFrameworkChange: (fw: IdeaFramework) => void
  frameworkData: Record<string, string>
  onFrameworkDataChange: (data: Record<string, string>) => void
  notes: string
  onNotesChange: (value: string) => void
  selectedOutputTypes: string[]
  onOutputTypesChange: (types: string[]) => void
  availableOutputTypes: { id: string; name: string }[]
  loading: boolean
  error: string | null
  hasContent: boolean
  onGenerate: () => void
  onClearError: () => void
}

export function AIWizardDialog({
  open, onOpenChange,
  framework, onFrameworkChange,
  frameworkData, onFrameworkDataChange,
  notes, onNotesChange,
  selectedOutputTypes, onOutputTypesChange,
  availableOutputTypes,
  loading, error, hasContent,
  onGenerate, onClearError,
}: AIWizardDialogProps) {
  const fwDef = getFrameworkDef(framework)

  const updateField = (key: string, value: string) => {
    onFrameworkDataChange({ ...frameworkData, [key]: value })
  }

  const toggleOutputType = (id: string) => {
    onOutputTypesChange(
      selectedOutputTypes.includes(id)
        ? selectedOutputTypes.filter((t) => t !== id)
        : [...selectedOutputTypes, id]
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && hasContent && !loading) {
      onGenerate()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!loading) { onOpenChange(o); if (!o) onClearError() } }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            AI Configuration Wizard
          </DialogTitle>
          <DialogDescription>
            Describe your product idea using a structured framework. The AI will design a complete configuration with steps, fields, output types, section drivers, and instruction directives.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Framework</label>
            <Select value={framework} onValueChange={(v) => onFrameworkChange(v as IdeaFramework)} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FRAMEWORK_DEFINITIONS.map((fw) => (
                  <SelectItem key={fw.id} value={fw.id}>
                    <span className="font-medium">{fw.name}</span>
                    <span className="ml-2 text-muted-foreground">{fw.description}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {fwDef.fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{field.label}</label>
              {field.multiline ? (
                <Textarea
                  value={frameworkData[field.key] || ''}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="resize-none text-sm"
                  disabled={loading}
                  onKeyDown={handleKeyDown}
                />
              ) : (
                <Input
                  value={frameworkData[field.key] || ''}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="text-sm"
                  disabled={loading}
                  onKeyDown={handleKeyDown}
                />
              )}
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Target Output Types
              <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableOutputTypes.map((ot) => (
                <button
                  key={ot.id}
                  type="button"
                  onClick={() => toggleOutputType(ot.id)}
                  disabled={loading}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedOutputTypes.includes(ot.id)
                      ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {ot.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Additional Notes
              <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Any extra context, constraints, or preferences..."
              rows={2}
              className="resize-none text-sm"
              disabled={loading}
              onKeyDown={handleKeyDown}
            />
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
            disabled={!hasContent || loading}
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
