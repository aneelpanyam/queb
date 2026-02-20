// ============================================================
// Setup Configuration — assembles steps, fields, and outputs
// ============================================================

export type InputMapping =
  | { type: 'field'; fieldId: string }
  | { type: 'text' }

export interface ConfigStepField {
  fieldId: string
  required: boolean
  promptOverride?: string
  /** Maps unresolved prompt placeholders to either an existing field or a text input */
  inputMappings?: Record<string, InputMapping>
  /** Unique key within the config — used for {{ref}} placeholders and value storage (empty-field instances) */
  customName?: string
  /** Display label shown in the UI (empty-field instances) */
  customLabel?: string
  /** Override the library field's selectionMode (empty-field instances) */
  customSelectionMode?: 'single' | 'multi'
}

/** Returns the effective key for a ConfigStepField: customName if set, otherwise fieldId */
export function getFieldKey(csf: ConfigStepField): string {
  return csf.customName || csf.fieldId
}

export interface ConfigStep {
  id: string
  name: string
  description: string
  fields: ConfigStepField[]
}

export interface SectionDriver {
  name: string
  description: string
  /** Per-driver element fields — overrides the output type / config-level fields for this section only */
  fields?: import('@/lib/output-type-library').OutputTypeField[]
}

export interface InstructionDirective {
  label: string
  content: string
}

export interface ConfigOutput {
  outputTypeId: string
  promptOverride?: string
  /** Override the output type's section label (e.g. "Competitor" → "Lens") */
  sectionLabelOverride?: string
  /** Custom section drivers (perspectives, dimensions, stages, etc.) to use instead of defaults */
  sectionDrivers?: SectionDriver[]
  /** Custom instruction directives — individual rules/guidelines the AI follows when generating. Uses full defaults when omitted. */
  instructionDirectives?: InstructionDirective[]
  /** Custom element fields — overrides the output type's default field schema when set */
  fieldOverrides?: import('@/lib/output-type-library').OutputTypeField[]
}

export interface SetupConfiguration {
  id: string
  name: string
  description: string
  steps: ConfigStep[]
  outputs: ConfigOutput[]
  createdAt: string
  updatedAt: string
}

/** Collect every effective field key used in a configuration */
export function allFieldIds(config: SetupConfiguration): string[] {
  return config.steps.flatMap((s) => s.fields.map((f) => getFieldKey(f)))
}

/** Flatten filled values into the legacy flat shape for product creation */
export function valuesToLegacyContext(values: Record<string, string | string[]>) {
  const str = (k: string) => {
    const v = values[k]
    return Array.isArray(v) ? v.join(', ') : v || ''
  }
  return {
    industry: str('industry'),
    service: str('service'),
    role: str('role'),
    activity: str('activity'),
    situation: str('situation'),
    targetAudience: str('targetAudience'),
    additionalContext: Object.entries(values)
      .filter(([k]) => !['industry', 'service', 'role', 'activity', 'situation', 'targetAudience'].includes(k))
      .filter(([, v]) => (Array.isArray(v) ? v.length > 0 : !!v))
      .map(([k, v]) => ({ label: k, value: Array.isArray(v) ? v.join(', ') : String(v) })),
  }
}
