'use client'

import { QuestionsView } from '@/components/questions-view'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RotateCcw, Save, CheckCircle2, RefreshCw } from 'lucide-react'
import type { AdditionalContextItem } from '../_hooks/use-legacy-wizard'

interface LegacyResultsViewProps {
  perspectives: { perspectiveName: string; perspectiveDescription: string; questions: { question: string; relevance: string; infoPrompt: string }[] }[]
  isLoading: boolean
  context: { role: string; activity: string; situation: string; industry: string; service: string }
  additionalContext: AdditionalContextItem[]
  exportLoading: boolean
  step: number
  questionsHaveData: boolean
  saveStatus: 'idle' | 'saved'
  onDissectionUpdate: (perspectiveIndex: number, questionIndex: number, data: unknown) => void
  onDeeperUpdate: (perspectiveIndex: number, questionIndex: number, data: unknown) => void
  onExportSite: () => void
  onBack: () => void
  onSaveSession: () => void
  onRegenerate: () => void
  onStartOver: () => void
  questionsLoading: boolean
}

export function LegacyResultsView({
  perspectives, isLoading, context, additionalContext, exportLoading,
  step, questionsHaveData, saveStatus,
  onDissectionUpdate, onDeeperUpdate, onExportSite,
  onBack, onSaveSession, onRegenerate, onStartOver, questionsLoading,
}: LegacyResultsViewProps) {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <QuestionsView
        perspectives={perspectives}
        isLoading={isLoading}
        context={context}
        additionalContext={additionalContext}
        onDissectionUpdate={onDissectionUpdate}
        onDeeperUpdate={onDeeperUpdate}
        onExportSite={onExportSite}
        exportLoading={exportLoading}
      />
      <div className="mt-8 mb-8 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {step > 1 ? (
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          {step === 5 && questionsHaveData && (
            <Button
              variant={saveStatus === 'saved' ? 'secondary' : 'outline'}
              onClick={onSaveSession}
              disabled={saveStatus === 'saved'}
              className="gap-2"
            >
              {saveStatus === 'saved' ? (
                <><CheckCircle2 className="h-4 w-4 text-accent" /> Saved</>
              ) : (
                <><Save className="h-4 w-4" /> Save Session</>
              )}
            </Button>
          )}
          {step === 5 && (
            <>
              {questionsHaveData && (
                <Button variant="ghost" size="sm" onClick={onRegenerate} disabled={questionsLoading}
                  className="gap-1.5 text-muted-foreground hover:text-foreground">
                  <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                </Button>
              )}
              <Button variant="outline" onClick={onStartOver} className="gap-2">
                <RotateCcw className="h-4 w-4" /> Start Over
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
