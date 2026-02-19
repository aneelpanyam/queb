// ============================================================
// Setup Configuration — assembles steps, fields, and outputs
// ============================================================

export interface ConfigStepField {
  fieldId: string
  dependsOn: string[]
  required: boolean
  promptOverride?: string
}

export interface ConfigStep {
  id: string
  name: string
  description: string
  fields: ConfigStepField[]
}

export interface ConfigOutput {
  outputTypeId: string
  promptOverride?: string
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

/** Collect every field ID used in a configuration */
export function allFieldIds(config: SetupConfiguration): string[] {
  return config.steps.flatMap((s) => s.fields.map((f) => f.fieldId))
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
