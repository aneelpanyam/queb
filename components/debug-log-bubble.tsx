'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { aiLogStorage, type AILogEntry } from '@/lib/ai-log-storage'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Bug,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  Trash2,
  Download,
  ExternalLink,
  Clock,
} from 'lucide-react'

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => toast.success('Copied'))
}

export function DebugLogBubble() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<AILogEntry[]>([])
  const [showPageOnly, setShowPageOnly] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<
    'prompts' | 'request' | 'response' | null
  >(null)

  const loadEntries = useCallback(() => {
    setEntries(aiLogStorage.getAll())
  }, [])

  useEffect(() => {
    loadEntries()
    const handler = () => loadEntries()
    window.addEventListener('ai-log-update', handler)
    return () => window.removeEventListener('ai-log-update', handler)
  }, [loadEntries])

  useEffect(() => {
    if (open) loadEntries()
  }, [open, loadEntries])

  const pageContext = useMemo(() => {
    const productMatch = pathname.match(/^\/products\/([^/]+)$/)
    if (productMatch) return { type: 'product' as const, productId: productMatch[1] }
    if (pathname.startsWith('/configurations')) return { type: 'configurations' as const }
    if (pathname.startsWith('/ideas')) return { type: 'ideas' as const }
    return { type: 'all' as const }
  }, [pathname])

  const pageLabel =
    pageContext.type === 'product'
      ? 'This product'
      : pageContext.type === 'configurations'
        ? 'Configurations'
        : pageContext.type === 'ideas'
          ? 'Ideas'
          : null

  const filtered = useMemo(() => {
    if (!showPageOnly || pageContext.type === 'all') return entries
    switch (pageContext.type) {
      case 'product':
        return entries.filter((e) => e.productId === (pageContext as { type: 'product'; productId: string }).productId)
      case 'configurations':
        return entries.filter(
          (e) => e.route.includes('configuration') || e.route.includes('field-suggestion')
        )
      case 'ideas':
        return entries.filter(
          (e) => e.route.includes('ideas') || e.action.toLowerCase().includes('idea')
        )
      default:
        return entries
    }
  }, [entries, showPageOnly, pageContext])

  const toggleExpanded = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      setExpandedSection(null)
    } else {
      setExpandedId(id)
      setExpandedSection('prompts')
    }
  }

  const handleClear = () => {
    aiLogStorage.clear()
    setEntries([])
    toast.success('Logs cleared')
  }

  const handleExport = () => {
    const data = showPageOnly ? filtered : entries
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-logs-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${data.length} log entries`)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20 transition-transform hover:scale-110 active:scale-95"
        title="AI Debug Logs"
      >
        <Bug className="h-5 w-5" />
        {entries.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {entries.length > 99 ? '99+' : entries.length}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-xl">
          <SheetHeader className="shrink-0 border-b border-border px-6 pb-3 pt-6">
            <div className="flex items-center justify-between pr-8">
              <SheetTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-primary" />
                AI Debug Logs
              </SheetTitle>
              <div className="flex gap-1">
                {entries.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExport}
                      className="h-7 w-7 p-0"
                      title="Export"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      title="Clear all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            <SheetDescription>
              {entries.length} total log{entries.length !== 1 ? 's' : ''}
              {pageLabel && showPageOnly
                ? ` · Filtered: ${pageLabel} (${filtered.length})`
                : ''}
            </SheetDescription>
            {pageLabel && (
              <div className="flex gap-1.5 pt-1">
                <Button
                  variant={showPageOnly ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowPageOnly(true)}
                >
                  {pageLabel}
                </Button>
                <Button
                  variant={!showPageOnly ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowPageOnly(false)}
                >
                  All
                </Button>
              </div>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Clock className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm font-medium text-foreground">No logs yet</p>
                <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
                  {showPageOnly && pageLabel
                    ? 'No AI actions on this page yet. Try switching to "All".'
                    : 'AI actions will appear here as you use the app.'}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filtered.map((entry) => {
                  const isExpanded = expandedId === entry.id
                  return (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-border bg-card text-sm transition-colors hover:border-primary/30"
                    >
                      <button
                        onClick={() => toggleExpanded(entry.id)}
                        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                        {entry.success ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-medium text-foreground">
                            {entry.action}
                          </span>
                          <div className="mt-0.5 flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">
                              {relativeTime(entry.timestamp)}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {formatDuration(entry.durationMs)}
                            </span>
                            {entry.prompts.length > 0 && (
                              <span className="text-[10px] font-medium text-primary">
                                {entry.prompts.length}p
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="space-y-2 border-t border-border px-3 py-2.5">
                          {entry.error && (
                            <div className="rounded bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
                              {entry.error}
                            </div>
                          )}

                          <div className="flex gap-1.5">
                            <Button
                              variant={expandedSection === 'prompts' ? 'default' : 'outline'}
                              size="sm"
                              className="h-6 px-2 text-[10px]"
                              onClick={() =>
                                setExpandedSection(
                                  expandedSection === 'prompts' ? null : 'prompts'
                                )
                              }
                              disabled={!entry.prompts.length}
                            >
                              Prompts ({entry.prompts.length})
                            </Button>
                            <Button
                              variant={expandedSection === 'request' ? 'default' : 'outline'}
                              size="sm"
                              className="h-6 px-2 text-[10px]"
                              onClick={() =>
                                setExpandedSection(
                                  expandedSection === 'request' ? null : 'request'
                                )
                              }
                            >
                              Request
                            </Button>
                            <Button
                              variant={expandedSection === 'response' ? 'default' : 'outline'}
                              size="sm"
                              className="h-6 px-2 text-[10px]"
                              onClick={() =>
                                setExpandedSection(
                                  expandedSection === 'response' ? null : 'response'
                                )
                              }
                              disabled={!entry.responsePreview}
                            >
                              Response
                            </Button>
                          </div>

                          {expandedSection === 'prompts' && entry.prompts.length > 0 && (
                            <div className="space-y-1.5">
                              {entry.prompts.map((prompt, i) => (
                                <div
                                  key={i}
                                  className="rounded border border-border bg-muted/50"
                                >
                                  <div className="flex items-center justify-between border-b border-border px-2.5 py-1">
                                    <span className="text-[10px] font-medium text-muted-foreground">
                                      {entry.prompts.length > 1
                                        ? `Prompt ${i + 1}/${entry.prompts.length}`
                                        : 'Prompt'}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 gap-1 px-1.5 text-[10px]"
                                      onClick={() => copyToClipboard(prompt)}
                                    >
                                      <Copy className="h-2.5 w-2.5" />
                                      Copy
                                    </Button>
                                  </div>
                                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap p-2.5 font-mono text-[11px] leading-relaxed text-foreground">
                                    {prompt}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          )}

                          {expandedSection === 'request' && (
                            <div className="rounded border border-border bg-muted/50">
                              <div className="flex items-center justify-between border-b border-border px-2.5 py-1">
                                <span className="text-[10px] font-medium text-muted-foreground">
                                  Request Body
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 gap-1 px-1.5 text-[10px]"
                                  onClick={() =>
                                    copyToClipboard(
                                      JSON.stringify(entry.requestBody, null, 2)
                                    )
                                  }
                                >
                                  <Copy className="h-2.5 w-2.5" />
                                  Copy
                                </Button>
                              </div>
                              <pre className="max-h-48 overflow-auto whitespace-pre-wrap p-2.5 font-mono text-[11px] leading-relaxed text-foreground">
                                {JSON.stringify(entry.requestBody, null, 2)}
                              </pre>
                            </div>
                          )}

                          {expandedSection === 'response' && entry.responsePreview && (
                            <div className="rounded border border-border bg-muted/50">
                              <div className="border-b border-border px-2.5 py-1">
                                <span className="text-[10px] font-medium text-muted-foreground">
                                  Response (truncated)
                                </span>
                              </div>
                              <pre className="max-h-48 overflow-auto whitespace-pre-wrap p-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
                                {entry.responsePreview}
                              </pre>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                            <span>
                              Model: <span className="font-mono">{entry.model}</span>
                            </span>
                            <span className="font-mono">{entry.route}</span>
                            {entry.productName && <span>{entry.productName}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-border px-6 py-3">
            <Link
              href="/logs"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              Open full logs page
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
