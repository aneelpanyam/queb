'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const steps = [
  { label: 'Organization Profile', number: 1 },
  { label: 'Role', number: 2 },
  { label: 'Activity', number: 3 },
  { label: 'Situation', number: 4 },
  { label: 'Questions', number: 5 },
]

interface WizardSidebarProps {
  currentStep: number
  /** Steps the user can navigate to (1–5). Step 5 also when canGoToQuestions. */
  reachableSteps?: Set<number>
  canGoToQuestions?: boolean
  onStepSelect?: (step: number) => void
}

export function WizardSidebar({ currentStep, reachableSteps, canGoToQuestions, onStepSelect }: WizardSidebarProps) {
  const isReachable = (stepNumber: number) =>
    reachableSteps?.has(stepNumber) || (stepNumber === 5 && canGoToQuestions)

  return (
    <aside className="flex w-full flex-col border-r border-border bg-card lg:w-56 lg:flex-shrink-0 lg:border-r">
      <div className="p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Setup
        </h2>
      </div>
      <nav className="flex-1 space-y-0.5 px-2 pb-4">
        {steps.map((step) => {
          const isCurrent = currentStep === step.number
          const isComplete = currentStep > step.number
          const canClick = isReachable(step.number)
          const Comp = canClick ? 'button' : 'div'
          return (
            <Comp
              key={step.number}
              type={canClick ? 'button' : undefined}
              onClick={canClick ? () => onStepSelect?.(step.number) : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                canClick && 'cursor-pointer hover:bg-primary/5',
                isCurrent &&
                  'bg-primary/10 font-medium text-primary',
                isComplete && !isCurrent && 'text-muted-foreground',
                !isCurrent && !isComplete && !canClick && 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium',
                  isCurrent &&
                    'border-primary bg-primary text-primary-foreground',
                  isComplete &&
                    !isCurrent &&
                    'border-primary bg-primary text-primary-foreground',
                  !isCurrent &&
                    !isComplete &&
                    'border-muted-foreground/40 bg-transparent text-muted-foreground'
                )}
              >
                {isComplete && !isCurrent ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  step.number
                )}
              </div>
              <span className="truncate">{step.label}</span>
            </Comp>
          )
        })}
      </nav>
    </aside>
  )
}
