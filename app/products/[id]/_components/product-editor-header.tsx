'use client'

import type { Product } from '@/lib/product-types'
import type { OutputTypeDefinition } from '@/lib/output-types'
import { formatCost, type ProductCostData } from '@/lib/ai-pricing'
import { getOutputTypeIcon } from '../_lib/product-editor-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft, Save, CheckCircle2, Download, Loader2,
  LogOut, Pencil, X, Check, Sparkles, FileJson, Coins, FileText,
} from 'lucide-react'

interface ProductEditorHeaderProps {
  product: Product
  outputTypeDef: OutputTypeDefinition
  costData: ProductCostData
  hasUnsavedChanges: boolean
  saveStatus: 'idle' | 'saving' | 'saved'
  exportLoading: boolean
  assistantLoading: boolean
  editingName: boolean
  nameValue: string
  pdfExportLoading?: boolean
  onBack: () => void
  onSave: () => void
  onExportHtml: () => void
  onExportJson: () => void
  onExportMarkdown: () => void
  onExportPdf?: () => void
  onAssistant: () => void
  onLogout: () => void
  onStartEditName: () => void
  onSaveEditName: () => void
  onCancelEditName: () => void
  onNameValueChange: (val: string) => void
  onUpdateName: (name: string) => void
}

export function ProductEditorHeader({
  product, outputTypeDef, costData,
  hasUnsavedChanges, saveStatus, exportLoading, assistantLoading,
  pdfExportLoading,
  editingName, nameValue,
  onBack, onSave, onExportHtml, onExportJson, onExportMarkdown, onExportPdf, onAssistant, onLogout,
  onStartEditName, onSaveEditName, onCancelEditName, onNameValueChange, onUpdateName,
}: ProductEditorHeaderProps) {
  const TypeIcon = getOutputTypeIcon(product.outputType)

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 shadow-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Products
        </Button>
        <div className="h-5 w-px bg-border" />
        {editingName ? (
          <div className="flex items-center gap-2">
            <Input value={nameValue} onChange={(e) => onNameValueChange(e.target.value)} className="h-8 w-72 font-display text-sm font-bold tracking-tight" autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter' && nameValue.trim()) { onUpdateName(nameValue.trim()); onSaveEditName() } if (e.key === 'Escape') onCancelEditName() }}
            />
            <button onClick={() => { if (nameValue.trim()) { onUpdateName(nameValue.trim()); onSaveEditName() } }} className="rounded p-1 text-primary hover:bg-primary/10"><Check className="h-4 w-4" /></button>
            <button onClick={onCancelEditName} className="rounded p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <button onClick={onStartEditName} className="group flex min-w-0 items-center gap-1.5">
            <span className="truncate font-display text-[15px] font-bold tracking-tight text-foreground">{product.name}</span>
            <Pencil className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        )}
        <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-2.5 py-0.5 text-[10px] font-bold text-primary">
          <TypeIcon className="h-3 w-3" />
          {outputTypeDef.name}
        </span>
        {costData.totalCost > 0 && (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600" title={`${costData.entries.length} AI call${costData.entries.length !== 1 ? 's' : ''}`}>
            <Coins className="h-3 w-3" />
            {formatCost(costData.totalCost)}
          </span>
        )}
        {hasUnsavedChanges && (
          <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">Unsaved</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onAssistant} disabled={assistantLoading} className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5">
          {assistantLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          Smart Assistant
        </Button>
        <div className="h-5 w-px bg-border" />
        <Button variant="outline" size="sm" onClick={onExportJson} className="gap-1.5">
          <FileJson className="h-3.5 w-3.5" />
          Export JSON
        </Button>
        <Button variant="outline" size="sm" onClick={onExportHtml} disabled={exportLoading} className="gap-1.5">
          {exportLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          Export HTML
        </Button>
        <Button variant="outline" size="sm" onClick={onExportMarkdown} className="gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          Export MD
        </Button>
        {onExportPdf && (
          <Button variant="outline" size="sm" onClick={onExportPdf} disabled={pdfExportLoading} className="gap-1.5">
            {pdfExportLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
            Export PDF
          </Button>
        )}
        <div className="h-5 w-px bg-border" />
        <Button size="sm" onClick={onSave} disabled={!hasUnsavedChanges && saveStatus !== 'idle'} className="gap-1.5">
          {saveStatus === 'saving' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saveStatus === 'saved' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saveStatus === 'saved' ? 'Saved' : 'Save'}
        </Button>
        <Button variant="ghost" size="icon" onClick={onLogout} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Logout">
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </div>
    </header>
  )
}
