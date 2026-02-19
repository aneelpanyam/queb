// ============================================================
// Shared prompt assembly from instruction directives.
// Used by all generation API routes.
// ============================================================

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
