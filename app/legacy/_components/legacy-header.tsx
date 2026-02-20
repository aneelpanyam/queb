'use client'

import type { SavedSession } from '@/lib/session-storage'
import { StepIndicator } from '@/components/step-indicator'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { BookOpen, LogOut, History, ChevronDown } from 'lucide-react'

interface LegacyHeaderProps {
  view: 'wizard' | 'history' | 'view-session'
  step: number
  savedSessions: SavedSession[]
  onSetView: (view: 'wizard' | 'history' | 'view-session') => void
  onLogout: () => void
  onRefreshSessions: () => void
}

export function LegacyHeader({
  view, step, savedSessions,
  onSetView, onLogout, onRefreshSessions,
}: LegacyHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card shadow-sm">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <a href="/products" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-primary bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <h1 className="font-display text-lg font-bold text-foreground">DigiCraft</h1>
          </a>
          <nav className="hidden items-center gap-1 sm:flex">
            <a href="/ideas" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Ideas</a>
            <a href="/products" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Products</a>
            <a href="/configurations" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Configurations</a>
            <a href="/library" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Library</a>
            <a href="/info" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">About</a>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  Legacy
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => { onSetView('wizard') }}>Home</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  onRefreshSessions()
                  onSetView(view === 'history' ? 'wizard' : 'history')
                }}>
                  History
                  {savedSessions.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">{savedSessions.length}</span>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {view === 'wizard' && (
            <div className="flex items-center gap-2 lg:hidden">
              <StepIndicator currentStep={step} />
              <Button variant="ghost" size="sm" onClick={() => { onRefreshSessions(); onSetView('history') }}
                className="relative h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <History className="h-3.5 w-3.5" />
                History
                {savedSessions.length > 0 && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">{savedSessions.length}</span>
                )}
              </Button>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={onLogout} className="h-8 gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
