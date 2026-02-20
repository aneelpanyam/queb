'use client'

import { useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { WizardSidebar } from '@/components/wizard-sidebar'
import { QuestionsView } from '@/components/questions-view'
import { LoginScreen } from '@/components/login-screen'
import { SessionHistory } from '@/components/session-history'

import { useLegacyAuth } from './_hooks/use-legacy-auth'
import { useLegacyWizard } from './_hooks/use-legacy-wizard'
import { useLegacySessions } from './_hooks/use-legacy-sessions'
import { LegacyHeader } from './_components/legacy-header'
import { LegacyWizardSteps } from './_components/legacy-wizard-steps'
import { LegacyResultsView } from './_components/legacy-results-view'

export default function LegacyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <LegacyPageInner />
    </Suspense>
  )
}

function LegacyPageInner() {
  const searchParams = useSearchParams()
  const initialView = searchParams.get('view') === 'history' ? 'history' : 'wizard'

  const auth = useLegacyAuth()
  const [view, setView] = useState<'wizard' | 'history' | 'view-session'>(initialView)

  const sessions = useLegacySessions(
    { current: {} } as React.RefObject<Record<string, unknown>>,
    { current: {} } as React.RefObject<Record<string, unknown>>,
  )

  const wizard = useLegacyWizard(
    useCallback((data) => {
      sessions.handleAutoSave(data)
    }, [sessions.handleAutoSave])
  )

  // Re-init sessions with actual refs from wizard
  const sessionsWithRefs = useLegacySessions(
    wizard.dissectionsRef as React.RefObject<Record<string, unknown>>,
    wizard.deeperRef as React.RefObject<Record<string, unknown>>,
  )

  const handleSetView = useCallback((v: 'wizard' | 'history' | 'view-session') => {
    setView(v)
    if (v !== 'view-session') sessionsWithRefs.setViewingSession(null)
  }, [sessionsWithRefs])

  const handleLoadSession = useCallback((session: Parameters<typeof sessionsWithRefs.handleLoadSession>[0]) => {
    sessionsWithRefs.handleLoadSession(session)
    setView('view-session')
  }, [sessionsWithRefs])

  const handleExportSiteForSession = useCallback(() => {
    if (sessionsWithRefs.viewingSession) {
      wizard.handleExportSite(sessionsWithRefs.viewingSession.perspectives, {
        role: sessionsWithRefs.viewingSession.role,
        activity: sessionsWithRefs.viewingSession.activity,
        industry: sessionsWithRefs.viewingSession.industry,
        service: sessionsWithRefs.viewingSession.service,
        situation: sessionsWithRefs.viewingSession.situation,
        additionalContext: sessionsWithRefs.viewingSession.additionalContext,
      })
    }
  }, [wizard, sessionsWithRefs.viewingSession])

  const handleExportSiteForWizard = useCallback(() => {
    wizard.handleExportSite(wizard.questionsData?.perspectives)
  }, [wizard])

  if (!auth.authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Checking session...</p>
        </div>
      </div>
    )
  }

  if (!auth.authenticated) {
    return <LoginScreen onSuccess={() => auth.setAuthenticated(true)} />
  }

  const filledContext = wizard.additionalContext.filter((c) => c.label.trim() && c.value.trim())

  return (
    <div className="min-h-screen bg-background">
      <LegacyHeader
        view={view}
        step={wizard.step}
        savedSessions={sessionsWithRefs.savedSessions}
        onSetView={handleSetView}
        onLogout={auth.handleLogout}
        onRefreshSessions={sessionsWithRefs.refreshSessions}
      />

      <main className="flex min-h-[calc(100vh-3.5rem)] flex-1">
        {view === 'history' && (
          <div className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
            <div className="mx-auto max-w-3xl">
              <div className="mb-8 text-center">
                <h2 className="font-display text-2xl font-bold text-balance text-foreground sm:text-3xl">Saved Sessions</h2>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">Browse and reload your previous question bank sessions</p>
              </div>
              <SessionHistory
                sessions={sessionsWithRefs.savedSessions}
                onLoad={handleLoadSession}
                onDelete={sessionsWithRefs.handleDeleteSession}
                onBack={() => handleSetView('wizard')}
              />
            </div>
          </div>
        )}

        {view === 'view-session' && sessionsWithRefs.viewingSession && (
          <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
            <QuestionsView
              perspectives={sessionsWithRefs.viewingSession.perspectives}
              isLoading={false}
              context={{
                role: sessionsWithRefs.viewingSession.role,
                activity: sessionsWithRefs.viewingSession.activity,
                situation: sessionsWithRefs.viewingSession.situation,
                industry: sessionsWithRefs.viewingSession.industry,
                service: sessionsWithRefs.viewingSession.service,
              }}
              additionalContext={sessionsWithRefs.viewingSession.additionalContext}
              initialDissections={sessionsWithRefs.viewingSession.dissections}
              initialDeeperQuestions={sessionsWithRefs.viewingSession.deeperQuestions}
              onDissectionUpdate={sessionsWithRefs.handleDissectionUpdate}
              onDeeperUpdate={sessionsWithRefs.handleDeeperUpdate}
              onExportSite={handleExportSiteForSession}
              exportLoading={wizard.exportLoading}
            />
          </div>
        )}

        {view === 'wizard' && (
          <>
            {wizard.step <= 4 && (
              <WizardSidebar
                currentStep={wizard.step}
                reachableSteps={wizard.reachableSteps}
                canGoToQuestions={!!wizard.questionsData?.perspectives?.length}
                onStepSelect={(s) => wizard.setStep(s)}
              />
            )}

            <div className="flex flex-1 flex-col overflow-auto">
              {wizard.step <= 4 ? (
                <LegacyWizardSteps
                  step={wizard.step}
                  industry={wizard.industry} service={wizard.service}
                  selectedRole={wizard.selectedRole} selectedActivity={wizard.selectedActivity}
                  situation={wizard.situation} additionalContext={wizard.additionalContext}
                  servicesData={wizard.servicesData} servicesLoading={wizard.servicesLoading}
                  rolesData={wizard.rolesData} rolesLoading={wizard.rolesLoading}
                  activitiesData={wizard.activitiesData} activitiesLoading={wizard.activitiesLoading}
                  questionsLoading={wizard.questionsLoading}
                  questionsHaveData={!!wizard.questionsData?.perspectives?.length}
                  expandedRoleDepartments={wizard.expandedRoleDepartments}
                  expandedActivityCategories={wizard.expandedActivityCategories}
                  onIndustryChange={wizard.setIndustry} onServiceChange={wizard.setService}
                  onSituationChange={wizard.setSituation}
                  onAdditionalContextChange={wizard.setAdditionalContext}
                  onExpandedRoleDepartmentsChange={wizard.setExpandedRoleDepartments}
                  onExpandedActivityCategoriesChange={wizard.setExpandedActivityCategories}
                  onOrgProfileSubmit={wizard.handleOrgProfileSubmit}
                  onSelectRole={wizard.handleSelectRole}
                  onSelectActivity={wizard.handleSelectActivity}
                  onGenerateQuestions={wizard.handleGenerateQuestions}
                  onRegenerateRoles={wizard.handleRegenerateRoles}
                  onRegenerateActivities={wizard.handleRegenerateActivities}
                  onViewQuestions={() => wizard.setStep(5)}
                />
              ) : (
                <LegacyResultsView
                  perspectives={wizard.questionsData?.perspectives || []}
                  isLoading={wizard.questionsLoading}
                  context={{
                    role: wizard.selectedRole || '', activity: wizard.selectedActivity || '',
                    situation: wizard.situation, industry: wizard.industry, service: wizard.service,
                  }}
                  additionalContext={filledContext}
                  exportLoading={wizard.exportLoading}
                  step={wizard.step}
                  questionsHaveData={!!wizard.questionsData?.perspectives?.length}
                  saveStatus={sessionsWithRefs.saveStatus}
                  onDissectionUpdate={sessionsWithRefs.handleDissectionUpdate}
                  onDeeperUpdate={sessionsWithRefs.handleDeeperUpdate}
                  onExportSite={handleExportSiteForWizard}
                  onBack={wizard.handleBack}
                  onSaveSession={() => {
                    if (wizard.selectedRole && wizard.selectedActivity && wizard.questionsData?.perspectives) {
                      sessionsWithRefs.handleSaveSession({
                        industry: wizard.industry.trim(), service: wizard.service.trim(),
                        role: wizard.selectedRole, activity: wizard.selectedActivity,
                        situation: wizard.situation.trim(),
                        additionalContext: wizard.additionalContext.filter((c) => c.label.trim() && c.value.trim()),
                        perspectives: wizard.questionsData.perspectives,
                      })
                    }
                  }}
                  onRegenerate={wizard.handleGenerateQuestions}
                  onStartOver={() => { wizard.handleStartOver(); handleSetView('wizard') }}
                  questionsLoading={wizard.questionsLoading}
                />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
