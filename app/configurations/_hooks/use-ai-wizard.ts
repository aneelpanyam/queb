import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { FieldDefinition } from '@/lib/field-library'
import type { OutputTypeDefinition } from '@/lib/output-type-library'
import type { ConfigStepField } from '@/lib/setup-config-types'
import { aiFetch } from '@/lib/ai-fetch'
import { type BuilderState, type AIStep, type AIOutput } from '../_lib/config-builder-utils'

export function useAIWizard(
  allFields: FieldDefinition[],
  allOutputTypes: OutputTypeDefinition[],
  onGenerated: (builderState: BuilderState) => void,
) {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardPrompt, setWizardPrompt] = useState('')
  const [wizardLoading, setWizardLoading] = useState(false)
  const [wizardError, setWizardError] = useState<string | null>(null)

  const processAIConfiguration = useCallback((
    configuration: { name?: string; description?: string; steps?: AIStep[]; outputs?: AIOutput[] },
    currentFields: FieldDefinition[],
  ): { builderState: BuilderState } => {
    const knownFieldIds = new Set(currentFields.map((f) => f.id))

    const steps = (configuration.steps || []).map((step: AIStep, i: number) => {
      const stepFields: ConfigStepField[] = []

      for (const fid of (step.fieldIds || [])) {
        if (knownFieldIds.has(fid)) {
          stepFields.push({ fieldId: fid, required: false })
        }
      }

      if (step.newFields?.length) {
        for (const nf of step.newFields) {
          if (stepFields.some((sf) => sf.fieldId === nf.id || sf.customName === nf.id)) continue
          stepFields.push({
            fieldId: 'empty-field',
            required: false,
            customName: nf.id,
            customLabel: nf.name,
            promptOverride: nf.prompt,
            customSelectionMode: nf.selectionMode || 'single',
          })
        }
      }

      return {
        id: `s-${Date.now()}-${i}`,
        name: step.name,
        description: step.description || '',
        fields: stepFields,
      }
    })

    return {
      builderState: {
        name: configuration.name || '',
        description: configuration.description || '',
        steps,
        outputs: (configuration.outputs || []).map((out: AIOutput) => {
          const mapFields = (fields?: { key: string; label: string; type: 'short-text' | 'long-text'; primary?: boolean }[]) =>
            fields?.length ? fields.map((f) => ({ key: f.key, label: f.label, type: f.type, primary: f.primary || undefined })) : undefined

          return {
            outputTypeId: out.outputTypeId,
            sectionDrivers: out.sectionDrivers?.length
              ? out.sectionDrivers.map((d) => ({
                  name: d.name,
                  description: d.description,
                  fields: mapFields(d.fields),
                }))
              : undefined,
            instructionDirectives: out.instructionDirectives?.length ? out.instructionDirectives : undefined,
            fieldOverrides: mapFields(out.fields),
          }
        }),
      },
    }
  }, [])

  const handleWizardGenerate = async () => {
    if (!wizardPrompt.trim()) return
    setWizardLoading(true)
    setWizardError(null)
    try {
      const { configuration } = await aiFetch('/api/generate-configuration', {
        description: wizardPrompt.trim(),
        availableFields: allFields
          .filter((f) => f.id !== 'empty-field')
          .map((f) => ({
            id: f.id,
            name: f.name,
            description: f.description,
            category: f.category,
          })),
        availableOutputTypes: allOutputTypes.map((ot) => ({
          id: ot.id,
          name: ot.name,
          description: ot.description,
          sectionLabel: ot.sectionLabel,
          elementLabel: ot.elementLabel,
          defaultFields: ot.fields.map((f) => ({ key: f.key, label: f.label, type: f.type })),
        })),
      }, { action: 'Generate Configuration' })

      const { builderState } = processAIConfiguration(configuration, allFields)

      setWizardOpen(false)
      setWizardPrompt('')
      onGenerated(builderState)
      toast.success('Configuration generated! Review and save below.')
    } catch (err) {
      setWizardError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setWizardLoading(false)
    }
  }

  return {
    wizardOpen, setWizardOpen,
    wizardPrompt, setWizardPrompt,
    wizardLoading, wizardError, setWizardError,
    processAIConfiguration,
    handleWizardGenerate,
  }
}
