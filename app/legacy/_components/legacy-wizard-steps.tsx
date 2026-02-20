'use client'

import { OrgProfileForm } from '@/components/org-profile-form'
import { RoleSelector } from '@/components/role-selector'
import { ActivitySelector } from '@/components/activity-selector'
import { SituationForm } from '@/components/situation-form'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { COMMON_INDUSTRIES, type AdditionalContextItem } from '../_hooks/use-legacy-wizard'

interface LegacyWizardStepsProps {
  step: number
  industry: string
  service: string
  selectedRole: string | null
  selectedActivity: string | null
  situation: string
  additionalContext: AdditionalContextItem[]
  servicesData: { services: string[] } | undefined
  servicesLoading: boolean
  rolesData: { departments: { departmentName: string; roles: { name: string; description: string; icon: string }[] }[] } | undefined
  rolesLoading: boolean
  activitiesData: { categories: { category: string; activities: { name: string; description: string }[] }[] } | undefined
  activitiesLoading: boolean
  questionsLoading: boolean
  questionsHaveData: boolean
  expandedRoleDepartments: Set<string>
  expandedActivityCategories: Set<string>
  onIndustryChange: (v: string) => void
  onServiceChange: (v: string) => void
  onSituationChange: (v: string) => void
  onAdditionalContextChange: (v: AdditionalContextItem[]) => void
  onExpandedRoleDepartmentsChange: (v: Set<string>) => void
  onExpandedActivityCategoriesChange: (v: Set<string>) => void
  onOrgProfileSubmit: () => void
  onSelectRole: (role: string) => void
  onSelectActivity: (activity: string) => void
  onGenerateQuestions: () => void
  onRegenerateRoles: () => void
  onRegenerateActivities: () => void
  onViewQuestions: () => void
}

export function LegacyWizardSteps({
  step, industry, service, selectedRole, selectedActivity,
  situation, additionalContext,
  servicesData, servicesLoading,
  rolesData, rolesLoading,
  activitiesData, activitiesLoading,
  questionsLoading, questionsHaveData,
  expandedRoleDepartments, expandedActivityCategories,
  onIndustryChange, onServiceChange,
  onSituationChange, onAdditionalContextChange,
  onExpandedRoleDepartmentsChange, onExpandedActivityCategoriesChange,
  onOrgProfileSubmit, onSelectRole, onSelectActivity,
  onGenerateQuestions, onRegenerateRoles, onRegenerateActivities,
  onViewQuestions,
}: LegacyWizardStepsProps) {
  return (
    <div className="flex-1 px-4 py-8 pb-20 sm:px-6 sm:py-10 sm:pb-24 lg:px-8">
      <div className="w-full max-w-full rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          {step === 1 && (
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-balance text-foreground sm:text-3xl">Organization Profile</h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">Tell us about your industry and core service to discover relevant roles</p>
            </div>
          )}
          {step === 2 && (
            <div className="text-center">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <div>
                  <h2 className="font-display text-2xl font-bold text-balance text-foreground sm:text-3xl">Choose your role</h2>
                  <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                    Roles organized by department for <span className="font-medium text-primary">{service}</span> in <span className="font-medium text-primary">{industry}</span>
                  </p>
                </div>
                {rolesData?.departments?.length && !rolesLoading && (
                  <Button variant="ghost" size="sm" onClick={onRegenerateRoles} className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground">
                    <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                  </Button>
                )}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="text-center">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <div>
                  <h2 className="font-display text-2xl font-bold text-balance text-foreground sm:text-3xl">Pick your activity</h2>
                  <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                    What are you working on as a <span className="font-medium text-primary">{selectedRole}</span>?
                  </p>
                </div>
                {activitiesData?.categories?.length && !activitiesLoading && (
                  <Button variant="ghost" size="sm" onClick={onRegenerateActivities} className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground">
                    <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                  </Button>
                )}
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-balance text-foreground sm:text-3xl">Set the scene</h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">Describe your specific situation for personalized questions</p>
            </div>
          )}
        </div>

        {step === 1 && (
          <OrgProfileForm
            industry={industry} service={service}
            onIndustryChange={onIndustryChange} onServiceChange={onServiceChange}
            onSubmit={onOrgProfileSubmit} isLoading={rolesLoading}
            suggestedIndustries={COMMON_INDUSTRIES}
            suggestedServices={servicesData?.services || []}
            industriesLoading={false} servicesLoading={servicesLoading}
          />
        )}
        {step === 2 && (
          <RoleSelector
            departments={rolesData?.departments || []}
            selectedRole={selectedRole}
            onSelect={onSelectRole}
            isLoading={rolesLoading}
            expandedDepartments={expandedRoleDepartments}
            onExpandedDepartmentsChange={onExpandedRoleDepartmentsChange}
          />
        )}
        {step === 3 && (
          <ActivitySelector
            categories={activitiesData?.categories || []}
            selectedActivity={selectedActivity}
            onSelect={onSelectActivity}
            isLoading={activitiesLoading}
            expandedCategories={expandedActivityCategories}
            onExpandedCategoriesChange={onExpandedActivityCategoriesChange}
          />
        )}
        {step === 4 && selectedRole && selectedActivity && (
          <>
            <SituationForm
              situation={situation} onSituationChange={onSituationChange}
              additionalContext={additionalContext} onAdditionalContextChange={onAdditionalContextChange}
              onSubmit={onGenerateQuestions}
              role={selectedRole} activity={selectedActivity}
              isGenerating={questionsLoading}
            />
            {questionsHaveData ? (
              <div className="mt-6 flex justify-center border-t border-border pt-6">
                <Button variant="secondary" onClick={onViewQuestions} className="gap-2">View your questions</Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
