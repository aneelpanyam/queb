'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/use-auth'
import { aiLogStorage, isDebugMode, type AILogEntry } from '@/lib/ai-log-storage'
import { LoginScreen } from '@/components/login-screen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  BookOpen,
  LogOut,
  Search,
  Trash2,
  Download,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Bug,
} from 'lucide-react'

type SortBy = 'newest' | 'oldest' | 'duration' | 'action'
type StatusFilter = 'all' | 'success' | 'error'

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
  navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard'))
}

export default function LogsPage() {
  const router = useRouter()
  const { authenticated, loading: authLoading, logout } = useAuth()
  const [entries, setEntries] = useState<AILogEntry[]>([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<'prompts' | 'request' | 'response' | null>(null)

  const debugEnabled = isDebugMode()

  useEffect(() => {
    if (authenticated) setEntries(aiLogStorage.getAll())
  }, [authenticated])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' })
      logout()
      toast.info('Signed out')
    } catch { logout() }
  }

  const handleClear = () => {
    aiLogStorage.clear()
    setEntries([])
    toast.success('Logs cleared')
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-logs-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${entries.length} log entries`)
  }

  const actionTypes = useMemo(() => {
    const set = new Set(entries.map((e) => e.action))
    return Array.from(set).sort()
  }, [entries])

  const filtered = useMemo(() => {
    let result = [...entries]
    if (statusFilter === 'success') result = result.filter((e) => e.success)
    if (statusFilter === 'error') result = result.filter((e) => !e.success)
    if (actionFilter !== 'all') result = result.filter((e) => e.action === actionFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (e) =>
          e.action.toLowerCase().includes(q) ||
          e.route.toLowerCase().includes(q) ||
          e.prompts.some((p) => p.toLowerCase().includes(q)) ||
          (e.error && e.error.toLowerCase().includes(q)) ||
          (e.productName && e.productName.toLowerCase().includes(q))
      )
    }
    switch (sortBy) {
      case 'newest': result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); break
      case 'oldest': result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); break
      case 'duration': result.sort((a, b) => b.durationMs - a.durationMs); break
      case 'action': result.sort((a, b) => a.action.localeCompare(b.action)); break
    }
    return result
  }, [entries, statusFilter, actionFilter, search, sortBy])

  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  if (!authenticated) return <LoginScreen />

  const toggleExpanded = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      setExpandedSection(null)
    } else {
      setExpandedId(id)
      setExpandedSection('prompts')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card shadow-sm">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <button onClick={() => router.push('/products')} className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-primary bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <h1 className="font-display text-lg font-bold text-foreground">DigiCraft</h1>
            </button>
            <nav className="hidden items-center gap-1 sm:flex">
              <button onClick={() => router.push('/ideas')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Ideas</button>
              <button onClick={() => router.push('/products')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Products</button>
              <button onClick={() => router.push('/configurations')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Configurations</button>
              <button onClick={() => router.push('/library')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Library</button>
              {debugEnabled && <button className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">Logs</button>}
              <button onClick={() => router.push('/info')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">About</button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    Legacy
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => router.push('/legacy')}>Home</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/legacy?view=history')}>History</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bug className="h-6 w-6 text-primary" />
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">AI Action Log</h2>
              <p className="text-sm text-muted-foreground">
                {debugEnabled
                  ? `Debug mode active — logging all AI actions. ${entries.length} entries.`
                  : 'Debug mode is not enabled. Set NEXT_PUBLIC_DEBUG_MODE=true in .env.local and restart.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={handleClear} className="gap-1.5 text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </Button>
              </>
            )}
          </div>
        </div>

        {entries.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search prompts, actions, errors..."
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  Status: {statusFilter === 'all' ? 'All' : statusFilter === 'success' ? 'Success' : 'Error'}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('success')}>Success</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('error')}>Error</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  Action: {actionFilter === 'all' ? 'All' : actionFilter}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setActionFilter('all')}>All</DropdownMenuItem>
                {actionTypes.map((a) => (
                  <DropdownMenuItem key={a} onClick={() => setActionFilter(a)}>{a}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : sortBy === 'duration' ? 'Duration' : 'Action'}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest first</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('oldest')}>Oldest first</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('duration')}>Longest duration</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('action')}>By action</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-xs text-muted-foreground">{filtered.length} of {entries.length}</span>
          </div>
        )}

        {!debugEnabled && entries.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <Bug className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-display text-lg font-semibold text-foreground">Debug Mode Not Enabled</h3>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              To start collecting AI action logs, add <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">NEXT_PUBLIC_DEBUG_MODE=true</code> to your <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">.env.local</code> file and restart the dev server.
            </p>
          </div>
        )}

        {debugEnabled && entries.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-display text-lg font-semibold text-foreground">No Logs Yet</h3>
            <p className="text-sm text-muted-foreground">Debug mode is active. AI actions will appear here as you use the app.</p>
          </div>
        )}

        <div className="space-y-2">
          {filtered.map((entry) => {
            const isExpanded = expandedId === entry.id
            return (
              <div key={entry.id} className="rounded-lg border border-border bg-card transition-colors hover:border-primary/30">
                <button
                  onClick={() => toggleExpanded(entry.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                  {entry.success
                    ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    : <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground truncate">{entry.action}</span>
                      {entry.productName && (
                        <span className="text-xs text-muted-foreground truncate">— {entry.productName}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground font-mono">{entry.route}</span>
                      <span className="text-xs text-muted-foreground">{relativeTime(entry.timestamp)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                      {formatDuration(entry.durationMs)}
                    </span>
                    {entry.prompts.length > 0 && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {entry.prompts.length} prompt{entry.prompts.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 py-3 space-y-3">
                    {entry.error && (
                      <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {entry.error}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant={expandedSection === 'prompts' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExpandedSection(expandedSection === 'prompts' ? null : 'prompts')}
                        disabled={!entry.prompts.length}
                      >
                        Prompts ({entry.prompts.length})
                      </Button>
                      <Button
                        variant={expandedSection === 'request' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExpandedSection(expandedSection === 'request' ? null : 'request')}
                      >
                        Request Body
                      </Button>
                      <Button
                        variant={expandedSection === 'response' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExpandedSection(expandedSection === 'response' ? null : 'response')}
                        disabled={!entry.responsePreview}
                      >
                        Response Preview
                      </Button>
                    </div>

                    {expandedSection === 'prompts' && entry.prompts.length > 0 && (
                      <div className="space-y-2">
                        {entry.prompts.map((prompt, i) => (
                          <div key={i} className="relative rounded-md bg-muted/50 border border-border">
                            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
                              <span className="text-xs font-medium text-muted-foreground">
                                Prompt {entry.prompts.length > 1 ? `${i + 1} of ${entry.prompts.length}` : ''}
                              </span>
                              <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs" onClick={() => copyToClipboard(prompt)}>
                                <Copy className="h-3 w-3" />
                                Copy
                              </Button>
                            </div>
                            <pre className="max-h-80 overflow-auto p-3 text-xs leading-relaxed whitespace-pre-wrap font-mono text-foreground">
                              {prompt}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}

                    {expandedSection === 'request' && (
                      <div className="relative rounded-md bg-muted/50 border border-border">
                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
                          <span className="text-xs font-medium text-muted-foreground">Request Body</span>
                          <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs" onClick={() => copyToClipboard(JSON.stringify(entry.requestBody, null, 2))}>
                            <Copy className="h-3 w-3" />
                            Copy
                          </Button>
                        </div>
                        <pre className="max-h-80 overflow-auto p-3 text-xs leading-relaxed whitespace-pre-wrap font-mono text-foreground">
                          {JSON.stringify(entry.requestBody, null, 2)}
                        </pre>
                      </div>
                    )}

                    {expandedSection === 'response' && entry.responsePreview && (
                      <div className="relative rounded-md bg-muted/50 border border-border">
                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
                          <span className="text-xs font-medium text-muted-foreground">Response Preview (truncated)</span>
                        </div>
                        <pre className="max-h-80 overflow-auto p-3 text-xs leading-relaxed whitespace-pre-wrap font-mono text-muted-foreground">
                          {entry.responsePreview}
                        </pre>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Model: <span className="font-mono">{entry.model}</span></span>
                      <span>Time: {new Date(entry.timestamp).toLocaleString()}</span>
                      {entry.productId && <span>Product: {entry.productName || entry.productId}</span>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
