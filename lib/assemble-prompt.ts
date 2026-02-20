// ============================================================
// Shared prompt assembly from instruction directives.
// Used by all generation API routes.
// ============================================================

import { z, type ZodTypeAny } from 'zod'

/**
 * Builds a dynamic Zod element schema from field definitions.
 * Used when a section driver has custom per-driver fields.
 */
export function buildElementSchema(fields: { key: string; label: string }[]) {
  const entries: Record<string, ZodTypeAny> = {}
  for (const f of fields) entries[f.key] = z.string().describe(f.label)
  return z.object(entries)
}

export function formatContext(context: Record<string, string>): string {
  return Object.entries(context)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `- ${k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()}: ${v}`)
    .join('\n')
}

/**
 * Assembles a complete LLM prompt from instruction directives.
 *
 * @param context       - Key-value context fields from the user
 * @param section       - The current section driver (perspective, dimension, etc.)
 * @param sectionLabel  - Human label for the section type (e.g. "Perspective", "Dimension")
 * @param directives    - Ordered list of instruction directives to include
 */
/**
 * Builds a strong field-override block for prompts when a section driver
 * has custom fields that differ from the output type defaults.
 * Placed at the end of the prompt so the AI ignores any conflicting
 * field guidance in instruction directives.
 */
export function buildFieldOverrideBlock(fields: { key: string; label: string }[]): string {
  const fieldLines = fields.map((f) => `- "${f.key}": ${f.label}`).join('\n')
  return `\n\nFIELD SCHEMA (use ONLY these fields for each element — ignore any conflicting field guidance above):\n${fieldLines}`
}

export function assembleDirectivesPrompt(
  context: Record<string, string>,
  section: { name: string; description: string },
  sectionLabel: string,
  directives: { label: string; content: string }[],
): string {
  const contextBlock = formatContext(context)
  const instructionsList = directives
    .map((d, i) => `${i + 1}. [${d.label}] ${d.content}`)
    .join('\n')

  return `CONTEXT:
${contextBlock}

${sectionLabel.toUpperCase()}: "${section.name}"
${section.description}

INSTRUCTIONS (follow all of these):
${instructionsList}`
}
