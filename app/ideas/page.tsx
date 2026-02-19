'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/use-auth'
import { ideaStorage } from '@/lib/idea-storage'
import { outputTypeStorage } from '@/lib/output-type-library'
import { fieldStorage } from '@/lib/field-library'
import {
  FRAMEWORK_DEFINITIONS,
  IDEA_STATUSES,
  getFrameworkDef,
  assembleIdeaDescription,
  type Idea,
  type IdeaFramework,
  type IdeaStatus,
} from '@/lib/idea-types'
import { downloadJson, buildFilename, openFilePicker, readJsonFile, type ExportBundle } from '@/lib/export-import'
import { LoginScreen } from '@/components/login-screen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  BookOpen,
  Plus,
  Sparkles,
  Trash2,
  LogOut,
  Search,
  ChevronDown,
  ChevronRight,
  Calendar,
  SlidersHorizontal,
  LayoutGrid,
  Download,
  Upload,
  Star,
  Lightbulb,
  ArrowRight,
  X,
  Loader2,
  Wand2,
  PenLine,
  Target,
  Briefcase,
  Gift,
  LayoutGridIcon,
} from 'lucide-react'

// ============================================================
// Helpers
// ============================================================

type GroupBy = 'none' | 'status' | 'framework' | 'tag'
type SortBy = 'updated' | 'created' | 'rating' | 'name'

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
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(dateStr).toLocaleDateString()
}

const FRAMEWORK_ICONS: Record<string, React.ElementType> = {
  Target, Briefcase, Gift, LayoutGrid: LayoutGridIcon, PenLine,
}

function FrameworkIcon({ iconName, className }: { iconName: string; className?: string }) {
  const Icon = FRAMEWORK_ICONS[iconName] || Lightbulb
  return <Icon className={className} />
}

function StarRating({ value, onChange }: { value?: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? 0 : n)}
          className="p-0.5 transition-colors"
        >
          <Star
            className={`h-4 w-4 ${n <= (value || 0) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
          />
        </button>
      ))}
    </div>
  )
}

// ============================================================
// Main page
// ============================================================

export default function IdeasPage() {
  const router = useRouter()
  const { authChecked, authenticated, setAuthenticated, handleLogout } = useAuth()

  const [ideas, setIdeas] = useState<Idea[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'all'>('all')
  const [frameworkFilter, setFrameworkFilter] = useState<IdeaFramework | 'all'>('all')
  const [groupBy, setGroupBy] = useState<GroupBy>('none')
  const [sortBy, setSortBy] = useState<SortBy>('updated')
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // Dialogs
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null)

  // AI generation state
  const [aiTopic, setAiTopic] = useState('')
  const [aiFramework, setAiFramework] = useState<IdeaFramework>('problem-solution')
  const [aiCount, setAiCount] = useState(5)
  const [aiGenerating, setAiGenerating] = useState(false)

  // New idea state
  const [newFramework, setNewFramework] = useState<IdeaFramework>('problem-solution')
  const [newTitle, setNewTitle] = useState('')

  // Config generation state
  const [generatingConfigId, setGeneratingConfigId] = useState<string | null>(null)

  const reload = useCallback(() => setIdeas(ideaStorage.getAll()), [])

  useEffect(() => { reload() }, [reload])

  // ---- Filter / Sort / Group ----
  const filtered = useMemo(() => {
    let result = [...ideas]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          Object.values(i.frameworkData).some((v) => v.toLowerCase().includes(q)) ||
          i.tags.some((t) => t.toLowerCase().includes(q)) ||
          i.notes.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') result = result.filter((i) => i.status === statusFilter)
    if (frameworkFilter !== 'all') result = result.filter((i) => i.framework === frameworkFilter)
    return result
  }, [ideas, search, statusFilter, frameworkFilter])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    switch (sortBy) {
      case 'updated':
        return arr.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      case 'created':
        return arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      case 'rating':
        return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'name':
        return arr.sort((a, b) => a.title.localeCompare(b.title))
      default:
        return arr
    }
  }, [filtered, sortBy])

  const grouped = useMemo(() => {
    if (groupBy === 'none') return { '': sorted }
    const map: Record<string, Idea[]> = {}
    for (const idea of sorted) {
      let key = ''
      if (groupBy === 'status') key = IDEA_STATUSES.find((s) => s.value === idea.status)?.label || idea.status
      else if (groupBy === 'framework') key = getFrameworkDef(idea.framework).name
      else if (groupBy === 'tag') {
        if (idea.tags.length === 0) key = 'Untagged'
        for (const tag of idea.tags.length > 0 ? idea.tags : ['Untagged']) {
          if (!map[tag]) map[tag] = []
          map[tag].push(idea)
        }
        continue
      }
      if (!map[key]) map[key] = []
      map[key].push(idea)
    }
    return map
  }, [sorted, groupBy])

  // ---- Actions ----
  const handleDelete = (id: string) => {
    ideaStorage.remove(id)
    if (expandedIdeaId === id) setExpandedIdeaId(null)
    reload()
    toast.success('Idea deleted')
  }

  const handleCreateIdea = () => {
    if (!newTitle.trim()) {
      toast.error('Title is required')
      return
    }
    const fw = getFrameworkDef(newFramework)
    const frameworkData: Record<string, string> = {}
    for (const f of fw.fields) frameworkData[f.key] = ''
    ideaStorage.save({
      title: newTitle.trim(),
      status: 'spark',
      framework: newFramework,
      frameworkData,
      suggestedOutputTypes: [],
      tags: [],
      notes: '',
    })
    reload()
    setShowNewDialog(false)
    setNewTitle('')
    toast.success('Idea created')
  }

  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) {
      toast.error('Enter a topic first')
      return
    }
    setAiGenerating(true)
    try {
      const res = await fetch('/api/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          framework: aiFramework,
          count: aiCount,
          existingIdeas: ideas.map((i) => i.title),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Generation failed')
      }
      const data = await res.json()
      const generated = data.ideas || []
      let saved = 0
      for (const raw of generated) {
        ideaStorage.save({
          title: raw.title || 'Untitled Idea',
          status: 'spark',
          framework: aiFramework,
          frameworkData: raw.frameworkData || {},
          suggestedOutputTypes: raw.suggestedOutputTypes || [],
          tags: [],
          notes: '',
        })
        saved++
      }
      reload()
      setShowAIDialog(false)
      setAiTopic('')
      toast.success(`Generated ${saved} idea${saved !== 1 ? 's' : ''}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate ideas')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleUpdateIdea = (id: string, updates: Partial<Omit<Idea, 'id' | 'createdAt'>>) => {
    ideaStorage.update(id, updates)
    reload()
  }

  const handleCreateConfiguration = async (idea: Idea) => {
    setGeneratingConfigId(idea.id)
    try {
      const outputTypes = outputTypeStorage.getAll()
      const fields = fieldStorage.getAll()

      const outputTypeNames: Record<string, string> = {}
      for (const ot of outputTypes) outputTypeNames[ot.id] = ot.name

      const description = assembleIdeaDescription(idea, outputTypeNames)

      const res = await fetch('/api/generate-configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          availableFields: fields.map((f) => ({ id: f.id, name: f.name, description: f.description, category: f.category })),
          availableOutputTypes: outputTypes.map((ot) => ({ id: ot.id, name: ot.name, description: ot.description, sectionLabel: ot.sectionLabel, elementLabel: ot.elementLabel })),
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Configuration generation failed')
      }

      const data = await res.json()
      const cfg = data.configuration

      ideaStorage.update(idea.id, { status: 'built' })
      reload()

      const params = new URLSearchParams({ ideaConfig: JSON.stringify(cfg), ideaId: idea.id })
      router.push(`/configurations?${params.toString()}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate configuration')
    } finally {
      setGeneratingConfigId(null)
    }
  }

  // ---- Export / Import ----
  const handleExportAll = () => {
    if (ideas.length === 0) return
    const bundle: ExportBundle<Idea> = { version: 1, type: 'ideas', exportedAt: new Date().toISOString(), items: ideas }
    downloadJson(bundle, buildFilename('ideas', ideas.length))
    toast.success(`Exported ${ideas.length} idea${ideas.length !== 1 ? 's' : ''}`)
  }

  const handleImport = async () => {
    const file = await openFilePicker()
    if (!file) return
    try {
      const bundle = await readJsonFile<Idea>(file)
      if (bundle.type !== 'ideas') {
        toast.error('Invalid file: expected an ideas export')
        return
      }
      let imported = 0, skipped = 0
      const existing = new Set(ideaStorage.getAll().map((i) => i.id))
      for (const item of bundle.items) {
        if (existing.has(item.id)) { skipped++; continue }
        ideaStorage.save({ ...item })
        imported++
      }
      reload()
      if (imported > 0) toast.success(`Imported ${imported} idea${imported !== 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} skipped)` : ''}`)
      else toast.error('No new ideas found in the file')
    } catch {
      toast.error('Failed to read import file')
    }
  }

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  // ---- Auth guards ----
  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Checking session...</p>
        </div>
      </div>
    )
  }
  if (!authenticated) return <LoginScreen onSuccess={() => setAuthenticated(true)} />

  const hasFilters = search || statusFilter !== 'all' || frameworkFilter !== 'all'
  const groupEntries = Object.entries(grouped)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              <button className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">Ideas</button>
              <button onClick={() => router.push('/products')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Products</button>
              <button onClick={() => router.push('/configurations')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Configurations</button>
              <button onClick={() => router.push('/library')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Library</button>
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
        {/* Page title + actions */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Idea Book</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {ideas.length} idea{ideas.length !== 1 ? 's' : ''} &middot; Capture, structure, and develop digital product concepts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowAIDialog(true)} className="gap-2">
              <Sparkles className="h-4 w-4" /> Generate with AI
            </Button>
            <Button onClick={() => setShowNewDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" /> New Idea
            </Button>
          </div>
        </div>

        {/* Export/Import toolbar */}
        {ideas.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleImport} className="h-8 gap-1.5 text-xs">
              <Upload className="h-3.5 w-3.5" /> Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportAll} className="h-8 gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> Export All
            </Button>
          </div>
        )}

        {/* Filter & Group Bar */}
        {ideas.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ideas..."
                  className="h-8 pl-8 text-sm"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as IdeaStatus | 'all')}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All statuses</option>
                {IDEA_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              <select
                value={frameworkFilter}
                onChange={(e) => setFrameworkFilter(e.target.value as IdeaFramework | 'all')}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All frameworks</option>
                {FRAMEWORK_DEFINITIONS.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>

              <div className="h-5 w-px bg-border" />

              <div className="flex items-center gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={groupBy}
                  onChange={(e) => { setGroupBy(e.target.value as GroupBy); setCollapsedGroups(new Set()) }}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="none">No grouping</option>
                  <option value="status">Group by status</option>
                  <option value="framework">Group by framework</option>
                  <option value="tag">Group by tag</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="updated">Last updated</option>
                  <option value="created">Date created</option>
                  <option value="rating">Rating</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>

              {hasFilters && (
                <button
                  onClick={() => { setSearch(''); setStatusFilter('all'); setFrameworkFilter('all') }}
                  className="h-8 rounded-md px-2 text-xs font-medium text-primary hover:bg-primary/10"
                >
                  Clear filters
                </button>
              )}
            </div>
            {hasFilters && (
              <p className="text-xs text-muted-foreground">
                Showing {filtered.length} of {ideas.length} idea{ideas.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        {ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-20 text-center">
            <Lightbulb className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold text-foreground">No ideas yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Start capturing digital product ideas — manually or with AI.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Button variant="outline" onClick={() => setShowAIDialog(true)} className="gap-2">
                <Sparkles className="h-4 w-4" /> Generate with AI
              </Button>
              <Button onClick={() => setShowNewDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" /> New Idea
              </Button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 text-center">
            <Search className="mb-4 h-10 w-10 text-muted-foreground/40" />
            <h3 className="text-base font-semibold text-foreground">No matching ideas</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupEntries.map(([groupKey, groupIdeas]) => {
              const isCollapsed = collapsedGroups.has(groupKey)
              const showGroupHeader = groupBy !== 'none' && groupKey

              return (
                <div key={groupKey || '__ungrouped'}>
                  {showGroupHeader && (
                    <button
                      onClick={() => toggleGroup(groupKey)}
                      className="mb-2 flex w-full items-center gap-2 rounded-lg bg-muted/50 px-4 py-2.5 text-left transition-colors hover:bg-muted"
                    >
                      {isCollapsed ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      <span className="text-sm font-semibold text-foreground">{groupKey}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{groupIdeas.length}</span>
                    </button>
                  )}

                  {!isCollapsed && (
                    <div className="space-y-2">
                      {groupIdeas.map((idea) => (
                        <IdeaCard
                          key={idea.id}
                          idea={idea}
                          expanded={expandedIdeaId === idea.id}
                          onToggle={() => setExpandedIdeaId(expandedIdeaId === idea.id ? null : idea.id)}
                          onUpdate={(updates) => handleUpdateIdea(idea.id, updates)}
                          onDelete={() => handleDelete(idea.id)}
                          onCreateConfig={() => handleCreateConfiguration(idea)}
                          generatingConfig={generatingConfigId === idea.id}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ---- New Idea Dialog ---- */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>New Idea</DialogTitle>
            <DialogDescription>Choose a framework and give your idea a title.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 overflow-y-auto flex-1 min-h-0">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Title</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. HR Retention Question Book"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateIdea()}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Framework</label>
              <div className="grid gap-1.5">
                {FRAMEWORK_DEFINITIONS.map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setNewFramework(fw.id)}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${newFramework === fw.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                  >
                    <FrameworkIcon iconName={fw.icon} className={`h-4 w-4 shrink-0 ${newFramework === fw.id ? 'text-primary' : 'text-muted-foreground'}`} />
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
            <Button variant="ghost" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateIdea} disabled={!newTitle.trim()}>Create Idea</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- AI Generate Dialog ---- */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
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
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g. HR management, SaaS onboarding, real estate investing"
                onKeyDown={(e) => e.key === 'Enter' && !aiGenerating && handleAIGenerate()}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Framework</label>
              <select
                value={aiFramework}
                onChange={(e) => setAiFramework(e.target.value as IdeaFramework)}
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
                value={aiCount}
                onChange={(e) => setAiCount(Number(e.target.value))}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {[3, 5, 8, 10].map((n) => (
                  <option key={n} value={n}>{n} ideas</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAIDialog(false)} disabled={aiGenerating}>Cancel</Button>
            <Button onClick={handleAIGenerate} disabled={!aiTopic.trim() || aiGenerating} className="gap-2">
              {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {aiGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================================
// Idea Card — shows summary, expands to full detail editor
// ============================================================

function IdeaCard({
  idea,
  expanded,
  onToggle,
  onUpdate,
  onDelete,
  onCreateConfig,
  generatingConfig,
}: {
  idea: Idea
  expanded: boolean
  onToggle: () => void
  onUpdate: (updates: Partial<Omit<Idea, 'id' | 'createdAt'>>) => void
  onDelete: () => void
  onCreateConfig: () => void
  generatingConfig: boolean
}) {
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
          {idea.status === 'ready' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateConfig}
              disabled={generatingConfig}
              className="h-8 gap-1.5 text-xs"
              title="Create Configuration from this idea"
            >
              {generatingConfig ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
              {generatingConfig ? 'Creating...' : 'Create Config'}
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
          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Title</label>
            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="text-sm" />
          </div>

          {/* Status */}
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

          {/* Framework fields */}
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

          {/* Suggested output types */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Suggested Product Types</label>
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

          {/* Tags */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Tags (comma-separated)</label>
            <Input
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="e.g. hr, retention, enterprise"
              className="text-sm"
            />
          </div>

          {/* Notes */}
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

          {/* Action row */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {(idea.status === 'ready' || idea.status === 'developing') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCreateConfig}
                  disabled={generatingConfig}
                  className="gap-1.5"
                >
                  {generatingConfig ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                  {generatingConfig ? 'Generating Configuration...' : 'Create Configuration'}
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
