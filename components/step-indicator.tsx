'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const steps = [
  { label: 'Profile', number: 1 },
  { label: 'Role', number: 2 },
  { label: 'Activity', number: 3 },
  { label: 'Situation', number: 4 },
  { label: 'Questions', number: 5 },
]

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all duration-300 sm:h-8 sm:w-8 sm:text-sm',
                currentStep === step.number &&
                  'bg-primary text-primary-foreground shadow-lg shadow-primary/25',
                currentStep > step.number &&
                  'bg-accent text-accent-foreground',
                currentStep < step.number &&
                  'bg-muted text-muted-foreground'
              )}
            >
              {currentStep > step.number ? (
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              ) : (
                step.number
              )}
            </div>
            <span
              className={cn(
                'hidden text-xs font-medium transition-colors sm:inline sm:text-sm',
                currentStep === step.number && 'text-foreground',
                currentStep > step.number && 'text-accent',
                currentStep < step.number && 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'h-px w-6 transition-colors duration-300 sm:w-10',
                currentStep > step.number ? 'bg-accent' : 'bg-border'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
