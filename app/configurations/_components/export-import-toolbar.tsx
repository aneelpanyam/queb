'use client'

import { Button } from '@/components/ui/button'
import { Download, Upload } from 'lucide-react'

interface ExportImportToolbarProps {
  selectMode: boolean
  selectedCount: number
  onImport: () => void
  onExportAll: () => void
  onExportSelected: () => void
  onEnterSelectMode: () => void
  onCancelSelectMode: () => void
}

export function ExportImportToolbar({
  selectMode, selectedCount,
  onImport, onExportAll, onExportSelected,
  onEnterSelectMode, onCancelSelectMode,
}: ExportImportToolbarProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={onImport} className="h-8 gap-1.5 text-xs">
        <Upload className="h-3.5 w-3.5" /> Import
      </Button>
      <Button variant="outline" size="sm" onClick={onExportAll} className="h-8 gap-1.5 text-xs">
        <Download className="h-3.5 w-3.5" /> Export All
      </Button>
      {!selectMode ? (
        <Button variant="ghost" size="sm" onClick={onEnterSelectMode} className="h-8 gap-1.5 text-xs text-muted-foreground">
          Export Selected...
        </Button>
      ) : (
        <>
          <div className="h-5 w-px bg-border" />
          <span className="text-xs text-muted-foreground">
            {selectedCount} selected
          </span>
          <Button variant="outline" size="sm" onClick={onExportSelected} disabled={selectedCount === 0} className="h-8 gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export {selectedCount > 0 ? selectedCount : ''}
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancelSelectMode} className="h-8 text-xs text-muted-foreground">
            Cancel
          </Button>
        </>
      )}
    </div>
  )
}
