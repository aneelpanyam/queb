'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/use-auth'
import { configStorage } from '@/lib/setup-config-storage'
import { fieldStorage } from '@/lib/field-library'
import { outputTypeStorage } from '@/lib/output-type-library'
import type { SetupConfiguration } from '@/lib/setup-config-types'
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
  LogOut,
  ArrowLeft,
  Plus,
  Settings2,
  Play,
  ChevronDown,
} from 'lucide-react'

export default function NewProductPage() {
  const router = useRouter()
  const { authChecked, authenticated, setAuthenticated, handleLogout } = useAuth()

  const [configs, setConfigs] = useState<SetupConfiguration[]>([])

  useEffect(() => {
    setConfigs(configStorage.getAll())
  }, [])

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
              <button onClick={() => router.push('/products')} className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">Products</button>
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

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Button variant="ghost" size="sm" onClick={() => router.push('/products')} className="mb-6 gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Products
        </Button>

        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Create New Product</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a configuration and run it to generate outputs.
          </p>
        </div>

        {configs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-20 text-center">
            <Settings2 className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold text-foreground">No configurations yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create a configuration first — it defines the steps, fields, and outputs for product generation.
            </p>
            <Button onClick={() => router.push('/configurations')} className="mt-6 gap-2">
              <Plus className="h-4 w-4" /> Create Configuration
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {configs.map((config) => {
              const totalFields = config.steps.reduce((sum, s) => sum + s.fields.length, 0)
              const outputNames = config.outputs
                .map((o) => outputTypeStorage.getById(o.outputTypeId)?.name)
                .filter(Boolean)
              return (
                <div key={config.id} className="rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-foreground">{config.name}</h3>
                      {config.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground">{config.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{config.steps.length} steps</span>
                        <span>{totalFields} fields</span>
                        {outputNames.length > 0 && (
                          <span className="font-medium text-primary">{outputNames.join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <Button onClick={() => router.push(`/configurations/${config.id}/run`)} className="gap-1.5">
                      <Play className="h-3.5 w-3.5" /> Run
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
