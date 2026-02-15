'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import useSWRMutation from 'swr/mutation'
import { toast } from 'sonner'
import { StepIndicator } from '@/components/step-indicator'
import { WizardSidebar } from '@/components/wizard-sidebar'
import { OrgProfileForm } from '@/components/org-profile-form'
import { RoleSelector } from '@/components/role-selector'
import { ActivitySelector } from '@/components/activity-selector'
import { SituationForm } from '@/components/situation-form'
import { QuestionsView } from '@/components/questions-view'
import { LoginScreen } from '@/components/login-screen'
import { SessionHistory } from '@/components/session-history'
import { sessionStorage as store, type SavedSession } from '@/lib/session-storage'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  BookOpen,
  RotateCcw,
  LogOut,
  History,
  Save,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'

interface Role {
  name: string
  description: string
  icon: string
}

interface Department {
  departmentName: string
  roles: Role[]
}

interface Activity {
  name: string
  description: string
}

interface ActivityCategoryGroup {
  category: string
  activities: Activity[]
}

interface Question {
  question: string
  relevance: string
  infoPrompt: string
}

interface Perspective {
  perspectiveName: string
  perspectiveDescription: string
  questions: Question[]
}

interface AdditionalContextItem {
  label: string
  value: string
}

async function postFetcher<T>(url: string, { arg }: { arg: unknown }): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  })
  if (!res.ok) {
    let message = 'Request failed'
    try {
      const body = await res.json()
      message = body.error || body.message || message
    } catch { /* ignore parse errors */ }
    throw new Error(message)
  }
  return res.json()
}

const COMMON_INDUSTRIES = [
  'Healthcare',
  'Technology',
  'Financial Services',
  'Education',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Telecommunications',
  'Energy & Utilities',
  'Transportation & Logistics',
  'Hospitality',
  'Government',
  'Non-Profit',
  'Media & Entertainment',
  'Agriculture',
  'Construction',
  'Pharmaceutical',
  'Legal Services',
  'Consulting',
  'Insurance',
]

const SESSION_CHECK_INTERVAL = 60_000

export default function QuestionBookPage() {
  // Auth state
  const [authChecked, setAuthChecked] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  const wasAuthenticated = useRef(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth')
        if (res.ok) {
          setAuthenticated(true)
          wasAuthenticated.current = true
        } else {
          if (wasAuthenticated.current) {
            toast.warning('Session expired', { description: 'Please sign in again' })
            wasAuthenticated.current = false
          }
          setAuthenticated(false)
        }
      } catch {
        setAuthenticated(false)
      } finally {
        setAuthChecked(true)
      }
    }
    checkSession()
    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' })
      setAuthenticated(false)
      toast.info('Signed out')
    } catch {
      setAuthenticated(false)
    }
  }, [])

  // View: 'wizard' | 'history' | 'view-session'
  const [view, setView] = useState<'wizard' | 'history' | 'view-session'>('wizard')
  const [step, setStep] = useState(1)

  // Step 1 - Org Profile
  const [industry, setIndustry] = useState('')
  const [service, setService] = useState('')

  // Step 2 - Role
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  // Step 3 - Activity
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)

  // Step 4 - Situation
  const [situation, setSituation] = useState('')
  const [additionalContext, setAdditionalContext] = useState<AdditionalContextItem[]>([])

  // Step 5 - Enrichment tracking for export
  const [exportLoading, setExportLoading] = useState(false)
  const dissectionsRef = useRef<
    Record<string, { thinkingFramework: unknown[]; checklist: unknown[]; resources: unknown[]; keyInsight: string }>
  >({})
  const deeperRef = useRef<
    Record<string, { secondOrder: unknown[]; thirdOrder: unknown[] }>
  >({})

  // Session history
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([])
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')
  const [viewingSession, setViewingSession] = useState<SavedSession | null>(null)

  // Load sessions from localStorage on mount
  useEffect(() => {
    setSavedSessions(store.getAll())
  }, [])

  // Fetch services when industry is set
  const {
    data: servicesData,
    trigger: triggerServices,
    isMutating: servicesLoading,
  } = useSWRMutation<{ services: string[] }, Error, string, { industry: string }>(
    '/api/generate-services',
    postFetcher
  )

  // Fetch roles
  const {
    data: rolesData,
    trigger: triggerRoles,
    isMutating: rolesLoading,
  } = useSWRMutation<
    { departments: Department[] },
    Error,
    string,
    { industry: string; service: string }
  >('/api/generate-roles', postFetcher)

  // Fetch activities
  const {
    data: activitiesData,
    trigger: triggerActivities,
    isMutating: activitiesLoading,
  } = useSWRMutation<
    { categories: ActivityCategoryGroup[] },
    Error,
    string,
    { role: string; industry: string; service: string }
  >('/api/generate-activities', postFetcher)

  // Fetch questions
  const {
    data: questionsData,
    trigger: triggerQuestions,
    isMutating: questionsLoading,
  } = useSWRMutation<
    { perspectives: Perspective[] },
    Error,
    string,
    {
      role: string
      activity: string
      situation: string
      additionalContext: AdditionalContextItem[]
      industry: string
      service: string
    }
  >('/api/generate-questions', postFetcher)

  // Steps that can be navigated to from the left nav (must be after questionsData is defined)
  const reachableSteps = useMemo(() => {
    const s = new Set<number>([1])
    if (industry.trim() && service.trim()) s.add(2)
    if (selectedRole) s.add(3)
    if (selectedActivity) s.add(4)
    if (questionsData?.perspectives?.length) s.add(5)
    return s
  }, [industry, service, selectedRole, selectedActivity, questionsData?.perspectives?.length])

  // Trigger services fetch only when industry value actually changes (avoid re-fetch on focus/re-render)
  const lastFetchedIndustryRef = useRef<string | null>(null)
  useEffect(() => {
    const trimmed = industry.trim()
    if (!trimmed) return
    if (lastFetchedIndustryRef.current === trimmed) return
    const timer = setTimeout(() => {
      lastFetchedIndustryRef.current = trimmed
      triggerServices({ industry: trimmed })
    }, 500)
    return () => clearTimeout(timer)
  }, [industry, triggerServices])
  // Reset when industry is cleared so typing again will fetch
  useEffect(() => {
    if (!industry.trim()) lastFetchedIndustryRef.current = null
  }, [industry])

  const handleOrgProfileSubmit = useCallback(async () => {
    if (industry.trim() && service.trim()) {
      setStep(2)
      setSelectedRole(null)
      setSelectedActivity(null)
      setSituation('')
      setAdditionalContext([])
      setSaveStatus('idle')
      toast.info('Generating roles for your organization...')
      try {
        await triggerRoles({ industry: industry.trim(), service: service.trim() })
        toast.success('Roles generated successfully')
      } catch (err) {
        toast.error('Failed to generate roles', {
          description: err instanceof Error ? err.message : 'Please try again',
        })
        setStep(1)
      }
    }
  }, [industry, service, triggerRoles])

  const handleSelectRole = useCallback(
    async (role: string) => {
      setSelectedRole(role)
      setSelectedActivity(null)
      setSituation('')
      setAdditionalContext([])
      setSaveStatus('idle')
      setStep(3)
      toast.info(`Loading activities for ${role}...`)
      try {
        await triggerActivities({
          role,
          industry: industry.trim(),
          service: service.trim(),
        })
        toast.success('Activities loaded')
      } catch (err) {
        toast.error('Failed to load activities', {
          description: err instanceof Error ? err.message : 'Please try again',
        })
        setStep(2)
      }
    },
    [triggerActivities, industry, service]
  )

  const handleSelectActivity = useCallback((activity: string) => {
    setSelectedActivity(activity)
    setSaveStatus('idle')
    setStep(4)
  }, [])

  const handleGenerateQuestions = useCallback(async () => {
    if (selectedRole && selectedActivity && situation.trim()) {
      setStep(5)
      setSaveStatus('idle')
      dissectionsRef.current = {}
      deeperRef.current = {}
      toast.info('Generating your question book...', { duration: 8000 })
      try {
        const result = await triggerQuestions({
          role: selectedRole,
          activity: selectedActivity,
          situation: situation.trim(),
          additionalContext: additionalContext.filter((c) => c.label.trim() && c.value.trim()),
          industry: industry.trim(),
          service: service.trim(),
        })
        toast.success('Question book ready!')
        // Auto-save to history when questions are generated
        if (result?.perspectives?.length) {
          try {
            store.save({
              industry: industry.trim(),
              service: service.trim(),
              role: selectedRole,
              activity: selectedActivity,
              situation: situation.trim(),
              additionalContext: additionalContext.filter((c) => c.label.trim() && c.value.trim()),
              perspectives: result.perspectives,
            })
            setSavedSessions(store.getAll())
            setSaveStatus('saved')
            toast.success('Saved to History', { description: 'You can access this session anytime from History' })
            setTimeout(() => setSaveStatus('idle'), 3000)
          } catch {
            // ignore storage errors for auto-save
          }
        }
      } catch (err) {
        toast.error('Failed to generate questions', {
          description: err instanceof Error ? err.message : 'Please try again',
        })
        setStep(4)
      }
    }
  }, [selectedRole, selectedActivity, situation, additionalContext, industry, service, triggerQuestions])

  const handleDissectionUpdate = useCallback(
    (perspectiveIndex: number, questionIndex: number, data: Record<string, unknown>) => {
      dissectionsRef.current[`${perspectiveIndex}-${questionIndex}`] = data as typeof dissectionsRef.current[string]
    },
    []
  )

  const handleDeeperUpdate = useCallback(
    (perspectiveIndex: number, questionIndex: number, data: Record<string, unknown>) => {
      deeperRef.current[`${perspectiveIndex}-${questionIndex}`] = data as typeof deeperRef.current[string]
    },
    []
  )

  const handleSaveSession = useCallback(() => {
    if (!questionsData?.perspectives || !selectedRole || !selectedActivity) return
    try {
      const saved = store.save({
        industry: industry.trim(),
        service: service.trim(),
        role: selectedRole,
        activity: selectedActivity,
        situation: situation.trim(),
        additionalContext: additionalContext.filter((c) => c.label.trim() && c.value.trim()),
        perspectives: questionsData.perspectives,
      })
      setSavedSessions(store.getAll())
      setSaveStatus('saved')
      toast.success('Session saved', { description: 'You can access it anytime from History' })
      setTimeout(() => setSaveStatus('idle'), 3000)
      return saved
    } catch (err) {
      toast.error('Failed to save session', {
        description: err instanceof Error ? err.message : 'Storage may be full',
      })
    }
  }, [questionsData, industry, service, selectedRole, selectedActivity, situation, additionalContext])

  const handleLoadSession = useCallback((session: SavedSession) => {
    setViewingSession(session)
    setView('view-session')
  }, [])

  const handleDeleteSession = useCallback((id: string) => {
    store.remove(id)
    setSavedSessions(store.getAll())
    toast.success('Session deleted')
  }, [])

  const handleExportSite = useCallback(async () => {
    const perspectives = view === 'view-session' && viewingSession
      ? viewingSession.perspectives
      : questionsData?.perspectives

    if (!perspectives) return
    setExportLoading(true)

    const contextRole = view === 'view-session' && viewingSession ? viewingSession.role : selectedRole
    const contextActivity = view === 'view-session' && viewingSession ? viewingSession.activity : selectedActivity
    const contextIndustry = view === 'view-session' && viewingSession ? viewingSession.industry : industry.trim()
    const contextService = view === 'view-session' && viewingSession ? viewingSession.service : service.trim()
    const contextSituation = view === 'view-session' && viewingSession ? viewingSession.situation : situation.trim()
    const contextAdditional = view === 'view-session' && viewingSession
      ? viewingSession.additionalContext
      : additionalContext.filter((c) => c.label.trim() && c.value.trim())

    toast.info('Generating your website...')
    try {
      const enrichedPerspectives = perspectives.map((p, pIdx) => ({
        perspective: p.perspectiveName,
        description: p.perspectiveDescription,
        questions: p.questions.map((q, qIdx) => {
          const key = `${pIdx}-${qIdx}`
          return {
            ...q,
            dissection: dissectionsRef.current[key] || undefined,
            deeperQuestions: deeperRef.current[key] || undefined,
          }
        }),
      }))

      const res = await fetch('/api/generate-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: contextIndustry,
          service: contextService,
          role: contextRole,
          activity: contextActivity,
          situation: contextSituation,
          additionalContext: contextAdditional,
          perspectives: enrichedPerspectives,
        }),
      })

      if (!res.ok) throw new Error('Failed to generate')
      const html = await res.text()
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `question-book-${(contextRole || 'guide').toLowerCase().replace(/\s+/g, '-')}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Website downloaded!', { description: `${(contextRole || 'guide').toLowerCase().replace(/\s+/g, '-')}.html` })
    } catch (err) {
      console.error('Export failed:', err)
      toast.error('Failed to export website', {
        description: err instanceof Error ? err.message : 'Please try again',
      })
    } finally {
      setExportLoading(false)
    }
  }, [questionsData, industry, service, selectedRole, selectedActivity, situation, additionalContext, view, viewingSession])

  const handleBack = useCallback(() => {
    setStep((prev) => Math.max(1, prev - 1))
  }, [])

  const handleRegenerateRoles = useCallback(async () => {
    if (!industry.trim() || !service.trim()) return
    toast.info('Regenerating roles...')
    try {
      await triggerRoles({ industry: industry.trim(), service: service.trim() })
      toast.success('Roles regenerated')
    } catch (err) {
      toast.error('Failed to regenerate roles', {
        description: err instanceof Error ? err.message : 'Please try again',
      })
    }
  }, [industry, service, triggerRoles])

  const handleRegenerateActivities = useCallback(async () => {
    if (!selectedRole || !industry.trim() || !service.trim()) return
    toast.info('Regenerating activities...')
    try {
      await triggerActivities({
        role: selectedRole,
        industry: industry.trim(),
        service: service.trim(),
      })
      toast.success('Activities regenerated')
    } catch (err) {
      toast.error('Failed to regenerate activities', {
        description: err instanceof Error ? err.message : 'Please try again',
      })
    }
  }, [selectedRole, industry, service, triggerActivities])

  const handleStartOver = useCallback(() => {
    setStep(1)
    setIndustry('')
    setService('')
    setSelectedRole(null)
    setSelectedActivity(null)
    setSituation('')
    setAdditionalContext([])
    setSaveStatus('idle')
    dissectionsRef.current = {}
    deeperRef.current = {}
    setView('wizard')
    setViewingSession(null)
  }, [])

  // Auth loading
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

  if (!authenticated) {
    return <LoginScreen onSuccess={() => setAuthenticated(true)} />
  }

  const filledContext = additionalContext.filter((c) => c.label.trim() && c.value.trim())

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Decision Explorer style */}
      <header className="sticky top-0 z-10 border-b border-border bg-card shadow-sm">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                if (view !== 'wizard') {
                  setView('wizard')
                  setViewingSession(null)
                }
              }}
              className="flex items-center gap-2.5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-primary bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <h1 className="font-display text-lg font-bold text-foreground">
                Question Book
              </h1>
            </button>
            <nav className="hidden items-center gap-1 sm:flex">
              <button
                onClick={() => {
                  setView('wizard')
                  setViewingSession(null)
                }}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  view === 'wizard'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  setSavedSessions(store.getAll())
                  setView(view === 'history' ? 'wizard' : 'history')
                  if (view === 'history') setViewingSession(null)
                }}
                className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  view === 'history'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                History
                {savedSessions.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {savedSessions.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {view === 'wizard' && (
              <div className="flex items-center gap-2 lg:hidden">
                <StepIndicator currentStep={step} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSavedSessions(store.getAll())
                    setView('history')
                    setViewingSession(null)
                  }}
                  className="relative h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <History className="h-3.5 w-3.5" />
                  History
                  {savedSessions.length > 0 && (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                      {savedSessions.length}
                    </span>
                  )}
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-3.5rem)] flex-1">
        {/* ===== HISTORY VIEW ===== */}
        {view === 'history' && (
          <div className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
            <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <h2 className="font-display text-2xl font-bold text-balance text-foreground sm:text-3xl">
                Saved Sessions
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Browse and reload your previous question bank sessions
              </p>
            </div>
            <SessionHistory
              sessions={savedSessions}
              onLoad={handleLoadSession}
              onDelete={handleDeleteSession}
              onBack={() => setView('wizard')}
            />
            </div>
          </div>
        )}

        {/* ===== VIEW SAVED SESSION ===== (same layout as step 5 Question Book) */}
        {view === 'view-session' && viewingSession && (
          <div className="flex flex-1 flex-col overflow-auto">
            <div className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
              <div className="flex w-full flex-col">
                <div className="mb-6 text-center">
                  <h2 className="font-display text-2xl font-bold text-balance text-foreground sm:text-3xl">
                    Your Question Book
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                    Viewing a previously saved session
                  </p>
                </div>

                {/* Context summary – same as step 5 */}
                <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-sm">
                  <span className="rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
                    {viewingSession.industry}
                  </span>
                  <span className="text-muted-foreground">/</span>
                  <span className="rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
                    {viewingSession.service}
                  </span>
                  <span className="text-muted-foreground">/</span>
                  <span className="rounded-md bg-primary/10 px-2.5 py-1 font-medium text-primary">
                    {viewingSession.role}
                  </span>
                  <span className="text-muted-foreground">/</span>
                  <span className="rounded-md bg-primary/10 px-2.5 py-1 font-medium text-primary">
                    {viewingSession.activity}
                  </span>
                </div>

                {/* Situation – same card as step 5 */}
                <div className="mb-6 rounded-lg border border-border bg-card p-4">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Situation
                  </p>
                  <p className="text-sm leading-relaxed text-foreground">
                    {viewingSession.situation}
                  </p>
                  {viewingSession.additionalContext?.length > 0 && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {viewingSession.additionalContext.map((ctx, i) => (
                        <div
                          key={i}
                          className="rounded-md border border-border/60 bg-muted/30 p-3"
                        >
                          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                            {ctx.label}
                          </p>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {ctx.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="min-h-[480px] flex-1">
            <QuestionsView
              perspectives={viewingSession.perspectives}
              isLoading={false}
              context={{
                role: viewingSession.role,
                activity: viewingSession.activity,
                situation: viewingSession.situation,
                industry: viewingSession.industry,
                service: viewingSession.service,
              }}
              onDissectionUpdate={handleDissectionUpdate}
              onDeeperUpdate={handleDeeperUpdate}
              onExportSite={handleExportSite}
              exportLoading={exportLoading}
            />
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setView('history')
                      setViewingSession(null)
                    }}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to History
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleStartOver}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    New Session
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== WIZARD VIEW ===== */}
        {view === 'wizard' && (
          <>
            {/* Left sidebar - steps list (desktop); hidden on step 5 (Question Library has its own tree) */}
            {step <= 4 && (
              <WizardSidebar
                currentStep={step}
                reachableSteps={reachableSteps}
                canGoToQuestions={!!questionsData?.perspectives?.length}
                onStepSelect={(s) => setStep(s)}
              />
            )}

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-auto">
              <div className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                {step <= 4 ? (
                  /* Steps 1–4: full-width card in main pane */
                  <div className="w-full max-w-full rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
                    {/* Step Title */}
                    <div className="mb-5">
                      {step === 1 && (
                        <div className="text-center">
                          <h2 className="font-display text-2xl font-bold text-balance text-foreground sm:text-3xl">
                            Organization Profile
                          </h2>
                          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                            Tell us about your industry and core service to discover relevant roles
                          </p>
                        </div>
                      )}
                      {step === 2 && (
                        <div className="text-center">
                          <div className="flex flex-wrap items-center justify-center gap-3">
                            <div>
                              <h2 className="font-display text-2xl font-bold text-balance text-foreground sm:text-3xl">
                                Choose your role
                              </h2>
                              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                                Roles organized by department for{' '}
                                <span className="font-medium text-primary">{service}</span> in{' '}
                                <span className="font-medium text-primary">{industry}</span>
                              </p>
                            </div>
                            {rolesData?.departments?.length && !rolesLoading && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRegenerateRoles}
                                className="shrink-0 gap-1.5"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Regenerate
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                      {step === 3 && (
                        <div className="text-center">
                          <div className="flex flex-wrap items-center justify-center gap-3">
                            <div>
                              <h2 className="font-display text-2xl font-bold text-balance text-foreground sm:text-3xl">
                                Pick your activity
                              </h2>
                              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                                What are you working on as a{' '}
                                <span className="font-medium text-primary">{selectedRole}</span>?
                              </p>
                            </div>
                            {activitiesData?.categories?.length && !activitiesLoading && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRegenerateActivities}
                                className="shrink-0 gap-1.5"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Regenerate
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                      {step === 4 && (
                        <div className="text-center">
                          <h2 className="font-display text-2xl font-bold text-balance text-foreground sm:text-3xl">
                            Set the scene
                          </h2>
                          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                            Describe your specific situation for personalized questions
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Step Content */}
                    {step === 1 && (
              <OrgProfileForm
                industry={industry}
                service={service}
                onIndustryChange={setIndustry}
                onServiceChange={setService}
                onSubmit={handleOrgProfileSubmit}
                isLoading={rolesLoading}
                suggestedIndustries={COMMON_INDUSTRIES}
                suggestedServices={servicesData?.services || []}
                industriesLoading={false}
                servicesLoading={servicesLoading}
              />
            )}

            {step === 2 && (
              <RoleSelector
                departments={rolesData?.departments || []}
                selectedRole={selectedRole}
                onSelect={handleSelectRole}
                isLoading={rolesLoading}
              />
            )}

            {step === 3 && (
              <ActivitySelector
                categories={activitiesData?.categories || []}
                selectedActivity={selectedActivity}
                onSelect={handleSelectActivity}
                isLoading={activitiesLoading}
              />
            )}

            {step === 4 && selectedRole && selectedActivity && (
              <>
                <SituationForm
                  situation={situation}
                  onSituationChange={setSituation}
                  additionalContext={additionalContext}
                  onAdditionalContextChange={setAdditionalContext}
                  onSubmit={handleGenerateQuestions}
                  role={selectedRole}
                  activity={selectedActivity}
                  isGenerating={questionsLoading}
                />
                {questionsData?.perspectives?.length ? (
                  <div className="mt-6 flex justify-center border-t border-border pt-6">
                    <Button
                      variant="secondary"
                      onClick={() => setStep(5)}
                      className="gap-2"
                    >
                      View your question book
                    </Button>
                  </div>
                ) : null}
              </>
            )}
                  </div>
                ) : (
                  /* Step 5: full-width Question Book with tree + detail */
                  <div className="flex w-full flex-col">
                    <div className="mb-6 text-center">
                      <h2 className="font-display text-2xl font-bold text-balance text-foreground sm:text-3xl">
                        Your Question Book
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                        Questions from multiple perspectives to deepen your thinking
                      </p>
                    </div>

                    {/* Context summary */}
                    <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-sm">
                      <span className="rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
                        {industry}
                      </span>
                      <span className="text-muted-foreground">/</span>
                      <span className="rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
                        {service}
                      </span>
                      <span className="text-muted-foreground">/</span>
                      <span className="rounded-md bg-primary/10 px-2.5 py-1 font-medium text-primary">
                        {selectedRole}
                      </span>
                      <span className="text-muted-foreground">/</span>
                      <span className="rounded-md bg-primary/10 px-2.5 py-1 font-medium text-primary">
                        {selectedActivity}
                      </span>
                    </div>

                    {/* Situation display */}
                    <div className="mb-6 rounded-lg border border-border bg-card p-4">
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Situation
                      </p>
                      <p className="text-sm leading-relaxed text-foreground">{situation}</p>
                      {filledContext.length > 0 && (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {filledContext.map((ctx, i) => (
                            <div
                              key={i}
                              className="rounded-md border border-border/60 bg-muted/30 p-3"
                            >
                              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                {ctx.label}
                              </p>
                              <p className="text-xs leading-relaxed text-muted-foreground">
                                {ctx.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="min-h-[480px] flex-1">
                <QuestionsView
                  perspectives={questionsData?.perspectives || []}
                  isLoading={questionsLoading}
                  context={{
                    role: selectedRole || '',
                    activity: selectedActivity || '',
                    situation: situation,
                    industry: industry,
                    service: service,
                  }}
                  onDissectionUpdate={handleDissectionUpdate}
                  onDeeperUpdate={handleDeeperUpdate}
                  onExportSite={handleExportSite}
                  exportLoading={exportLoading}
                />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between px-4 sm:px-6 lg:px-8">
              {step > 1 ? (
                <Button variant="ghost" onClick={handleBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {/* Save Button on step 5 */}
                {step === 5 && questionsData?.perspectives && questionsData.perspectives.length > 0 && (
                  <Button
                    variant={saveStatus === 'saved' ? 'secondary' : 'outline'}
                    onClick={handleSaveSession}
                    disabled={saveStatus === 'saved'}
                    className="gap-2"
                  >
                    {saveStatus === 'saved' ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Session
                      </>
                    )}
                  </Button>
                )}

                {step === 5 && (
                  <>
                    {questionsData?.perspectives?.length && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateQuestions()}
                        disabled={questionsLoading}
                        className="gap-1.5"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Regenerate
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleStartOver}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Start Over
                    </Button>
                  </>
                )}
              </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
