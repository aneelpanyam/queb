'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText, Loader2 } from 'lucide-react'
import type { WorkbookPdfSettings } from '@/lib/workbook-pdf-export'
import { DEFAULT_PDF_SETTINGS } from '@/lib/workbook-pdf-export'

interface WorkbookPdfSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (settings: WorkbookPdfSettings) => void
  loading: boolean
}

export function WorkbookPdfSettingsDialog({
  open,
  onOpenChange,
  onExport,
  loading,
}: WorkbookPdfSettingsDialogProps) {
  const [settings, setSettings] = useState<WorkbookPdfSettings>({ ...DEFAULT_PDF_SETTINGS })

  const update = <K extends keyof WorkbookPdfSettings>(key: K, value: WorkbookPdfSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Export Workbook PDF
          </DialogTitle>
          <DialogDescription>
            Customize your KDP-ready PDF before exporting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-hints" className="text-sm font-medium">Show Hints</Label>
              <p className="text-xs text-muted-foreground">
                Hints at the bottom of each page (first letter, word count)
              </p>
            </div>
            <Switch
              id="show-hints"
              checked={settings.showHints}
              onCheckedChange={(v) => update('showHints', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-intro" className="text-sm font-medium">Section Intro</Label>
              <p className="text-xs text-muted-foreground">
                Description paragraph at the top of each topic page
              </p>
            </div>
            <Switch
              id="show-intro"
              checked={settings.showSectionIntro}
              onCheckedChange={(v) => update('showSectionIntro', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-difficulty" className="text-sm font-medium">Difficulty Indicator</Label>
              <p className="text-xs text-muted-foreground">
                Star rating next to each question (*, **, ***)
              </p>
            </div>
            <Switch
              id="show-difficulty"
              checked={settings.showDifficulty}
              onCheckedChange={(v) => update('showDifficulty', v)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Answer Box Size</Label>
              <span className="text-xs font-medium text-muted-foreground">
                {settings.answerBoxLines} line{settings.answerBoxLines !== 1 ? 's' : ''}
              </span>
            </div>
            <Slider
              value={[settings.answerBoxLines]}
              onValueChange={([v]) => update('answerBoxLines', v)}
              min={1}
              max={6}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              More lines = more writing space per question
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={() => onExport(settings)} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {loading ? 'Generating...' : 'Export PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
