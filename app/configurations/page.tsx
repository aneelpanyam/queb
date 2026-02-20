'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/use-auth'
import { LoginScreen } from '@/components/login-screen'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { BookOpen, LogOut, Plus, Settings2, Wand2, ChevronDown, Upload } from 'lucide-react'

import { useConfigurations } from './_hooks/use-configurations'
import { useAIWizard } from './_hooks/use-ai-wizard'
import { useConfigExportImport } from './_hooks/use-config-export-import'
import { ConfigBuilder } from './_components/config-builder'
import { ConfigurationsList } from './_components/configurations-list'
import { AIWizardDialog } from './_components/ai-wizard-dialog'
import { ExportImportToolbar } from './_components/export-import-toolbar'

export default function ConfigurationsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ConfigurationsPageInner />
    </Suspense>
  )
}

function ConfigurationsPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { authChecked, authenticated, setAuthenticated, handleLogout } = useAuth()

  const cfgs = useConfigurations()

  const wizard = useAIWizard(
    cfgs.allFields,
    cfgs.allOutputTypes,
    (builderState) => {
      cfgs.openBuilderWithState(builderState)
    },
  )

  const exportImport = useConfigExportImport(
    cfgs.configs,
    () => cfgs.loadData(),
  )

  useEffect(() => {
    const { fields } = cfgs.loadData()

    const ideaConfigParam = searchParams.get('ideaConfig')
    if (ideaConfigParam) {
      try {
        const configuration = JSON.parse(ideaConfigParam)
        const { builderState } = wizard.processAIConfiguration(configuration, fields)

        cfgs.openBuilderWithState(builderState)
        toast.success('Configuration generated from idea! Review and save below.')
        router.replace('/configurations')
      } catch {
        // Ignore malformed param
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router])

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  if (!authenticated) return <LoginScreen onSuccess={() => setAuthenticated(true)} />

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
              <button className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">Configurations</button>
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Configurations</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Assemble steps, fields, and outputs into reusable generation workflows
            </p>
          </div>
          {cfgs.builderMode === 'closed' && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => wizard.setWizardOpen(true)} className="gap-2">
                <Wand2 className="h-4 w-4" /> AI Wizard
              </Button>
              <Button onClick={cfgs.openCreate} className="gap-2">
                <Plus className="h-4 w-4" /> New Configuration
              </Button>
            </div>
          )}
        </div>

        {cfgs.builderMode === 'closed' && cfgs.configs.length > 0 && (
          <ExportImportToolbar
            selectMode={exportImport.selectMode}
            selectedCount={exportImport.selectedForExport.size}
            onImport={exportImport.handleImport}
            onExportAll={exportImport.handleExportAll}
            onExportSelected={exportImport.handleExportSelected}
            onEnterSelectMode={() => exportImport.setSelectMode(true)}
            onCancelSelectMode={exportImport.cancelSelectMode}
          />
        )}

        {cfgs.builderMode !== 'closed' && (
          <div className="mb-8">
            <ConfigBuilder
              initial={cfgs.builderInit}
              allFields={cfgs.allFields}
              allOutputTypes={cfgs.allOutputTypes}
              onSave={cfgs.handleSave}
              onCancel={cfgs.closeBuilder}
            />
          </div>
        )}

        {cfgs.configs.length === 0 && cfgs.builderMode === 'closed' ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-20 text-center">
            <Settings2 className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold text-foreground">No configurations yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Define steps, pull in fields from the library, choose outputs, and create a reusable generation workflow.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Button variant="outline" onClick={exportImport.handleImport} className="gap-2">
                <Upload className="h-4 w-4" /> Import
              </Button>
              <Button variant="outline" onClick={() => wizard.setWizardOpen(true)} className="gap-2">
                <Wand2 className="h-4 w-4" /> AI Wizard
              </Button>
              <Button onClick={cfgs.openCreate} className="gap-2">
                <Plus className="h-4 w-4" /> Create Manually
              </Button>
            </div>
          </div>
        ) : (
          <ConfigurationsList
            configs={cfgs.configs}
            allOutputTypes={cfgs.allOutputTypes}
            selectMode={exportImport.selectMode}
            selectedForExport={exportImport.selectedForExport}
            onToggleExportSelect={exportImport.toggleExportSelect}
            onRun={(id) => router.push(`/configurations/${id}/run`)}
            onDuplicate={cfgs.openDuplicate}
            onEdit={cfgs.openEdit}
            onDelete={cfgs.handleDelete}
          />
        )}

        <AIWizardDialog
          open={wizard.wizardOpen}
          onOpenChange={wizard.setWizardOpen}
          prompt={wizard.wizardPrompt}
          onPromptChange={wizard.setWizardPrompt}
          loading={wizard.wizardLoading}
          error={wizard.wizardError}
          onGenerate={wizard.handleWizardGenerate}
          onClearError={() => wizard.setWizardError(null)}
        />
      </main>
    </div>
  )
}
