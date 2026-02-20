'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/use-auth'
import { LoginScreen } from '@/components/login-screen'
import { Button } from '@/components/ui/button'
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
  LogOut,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Search,
} from 'lucide-react'

import { useIdeas } from './_hooks/use-ideas'
import { useIdeaGeneration } from './_hooks/use-idea-generation'
import { useIdeaFilters } from './_hooks/use-idea-filters'
import { IdeaCard } from './_components/idea-card'
import { NewIdeaDialog, AIGenerateDialog } from './_components/idea-generation-dialog'
import { IdeasToolbar } from './_components/ideas-toolbar'

export default function IdeasPage() {
  const router = useRouter()
  const { authChecked, authenticated, setAuthenticated, handleLogout } = useAuth()

  const ideasHook = useIdeas()
  const gen = useIdeaGeneration(ideasHook.reload, ideasHook.ideas)
  const filters = useIdeaFilters(ideasHook.ideas)

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

  const groupEntries = Object.entries(filters.grouped)

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
              {ideasHook.ideas.length} idea{ideasHook.ideas.length !== 1 ? 's' : ''} &middot; Capture, structure, and develop digital product concepts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => gen.setShowAIDialog(true)} className="gap-2">
              <Sparkles className="h-4 w-4" /> Generate with AI
            </Button>
            <Button onClick={() => gen.setShowNewDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" /> New Idea
            </Button>
          </div>
        </div>

        <IdeasToolbar
          ideasCount={ideasHook.ideas.length}
          filteredCount={filters.filtered.length}
          hasFilters={filters.hasFilters}
          search={filters.search}
          onSearchChange={filters.setSearch}
          statusFilter={filters.statusFilter}
          onStatusFilterChange={filters.setStatusFilter}
          frameworkFilter={filters.frameworkFilter}
          onFrameworkFilterChange={filters.setFrameworkFilter}
          groupBy={filters.groupBy}
          onGroupByChange={filters.setGroupBy}
          sortBy={filters.sortBy}
          onSortByChange={filters.setSortBy}
          onClearFilters={filters.clearFilters}
          onExportAll={ideasHook.handleExportAll}
          onImport={ideasHook.handleImport}
        />

        {/* Content */}
        {ideasHook.ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-20 text-center">
            <Lightbulb className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold text-foreground">No ideas yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Start capturing digital product ideas — manually or with AI.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Button variant="outline" onClick={() => gen.setShowAIDialog(true)} className="gap-2">
                <Sparkles className="h-4 w-4" /> Generate with AI
              </Button>
              <Button onClick={() => gen.setShowNewDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" /> New Idea
              </Button>
            </div>
          </div>
        ) : filters.filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 text-center">
            <Search className="mb-4 h-10 w-10 text-muted-foreground/40" />
            <h3 className="text-base font-semibold text-foreground">No matching ideas</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupEntries.map(([groupKey, groupIdeas]) => {
              const isCollapsed = filters.collapsedGroups.has(groupKey)
              const showGroupHeader = filters.groupBy !== 'none' && groupKey

              return (
                <div key={groupKey || '__ungrouped'}>
                  {showGroupHeader && (
                    <button
                      onClick={() => filters.toggleGroup(groupKey)}
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
                          expanded={ideasHook.expandedIdeaId === idea.id}
                          onToggle={() => ideasHook.setExpandedIdeaId(ideasHook.expandedIdeaId === idea.id ? null : idea.id)}
                          onUpdate={(updates) => ideasHook.handleUpdateIdea(idea.id, updates)}
                          onDelete={() => ideasHook.handleDelete(idea.id)}
                          onCreateConfig={() => gen.handleCreateConfiguration(idea)}
                          generatingConfig={gen.generatingConfigId === idea.id}
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

      <NewIdeaDialog
        open={gen.showNewDialog}
        onOpenChange={gen.setShowNewDialog}
        title={gen.newTitle}
        onTitleChange={gen.setNewTitle}
        framework={gen.newFramework}
        onFrameworkChange={gen.setNewFramework}
        onCreate={gen.handleCreateIdea}
      />

      <AIGenerateDialog
        open={gen.showAIDialog}
        onOpenChange={gen.setShowAIDialog}
        topic={gen.aiTopic}
        onTopicChange={gen.setAiTopic}
        framework={gen.aiFramework}
        onFrameworkChange={gen.setAiFramework}
        count={gen.aiCount}
        onCountChange={gen.setAiCount}
        generating={gen.aiGenerating}
        onGenerate={gen.handleAIGenerate}
      />
    </div>
  )
}
