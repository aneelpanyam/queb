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
 * Builds a strong field-override block for prompts when a section driver
 * has custom fields that differ from the output type defaults.
 * Placed at the end of the prompt so the AI ignores any conflicting
 * field guidance in instruction directives.
 */
export function buildFieldOverrideBlock(fields: { key: string; label: string }[]): string {
  const fieldLines = fields.map((f) => `- "${f.key}": ${f.label}`).join('\n')
  return `\n\nFIELD SCHEMA (use ONLY these fields for each element — ignore any conflicting field guidance above):\n${fieldLines}`
}

// ============================================================
// Prompt assembly options and defaults
// ============================================================

export interface PromptAssemblyOptions {
  preamble?: string
  generationProcess?: string
  qualityBar?: string[]
  antiPatterns?: string[]
  elementLabel?: string
}

export function buildDefaultGenerationProcess(sectionLabel: string, elementLabel: string): string {
  const sl = sectionLabel.toLowerCase()
  const el = elementLabel.toLowerCase()
  return [
    `1. ANALYZE — Read every context field. Identify the 2-3 constraints that should most shape what you generate (audience level, domain specifics, success criteria). These are your binding constraints — every ${el} must visibly reflect them.`,
    `2. SCOPE — For this specific ${sl}, determine whether it is genuinely relevant to the context. If it is, identify 3-5 specific angles that are non-obvious and high-value — go beyond what the reader would think of on their own.`,
    `3. DRAFT — Generate each ${el} with concrete specificity. Use real tool names, realistic metrics, named frameworks, specific scenarios, and plausible numbers. Never use placeholder language ("various tools", "key stakeholders", "relevant metrics").`,
    `4. VERIFY — Before finalizing, check every ${el} against the Quality Bar below. Revise or replace anything that fails even one check.`,
  ].join('\n')
}

export function buildDefaultQualityBar(): string[] {
  return [
    'Specificity — Would this element be noticeably different if the context fields changed? If it could apply to any industry/role/situation, it is too generic. Rewrite it.',
    'Actionability — Could the reader act on this within their current role, tools, and authority? If it requires unstated prerequisites, either add them or replace the element.',
    'Novelty — Does this surface something the reader likely has not considered? If it is obvious conventional wisdom, replace it with a non-obvious angle or a deeper layer of the same idea.',
    'Completeness — Are ALL required fields populated with substantive content? No field should contain filler, a single sentence when a paragraph is expected, or a restated version of another field.',
  ]
}

export function buildDefaultAntiPatterns(): string[] {
  return [
    'Generic platitudes ("leverage synergies", "drive innovation", "align stakeholders") — use concrete, domain-specific language grounded in the context provided.',
    'Echo-chamber content — do not just restate or paraphrase the context back. Add analytical value, frameworks, or angles beyond what was provided.',
    'Uniform depth — vary element complexity. Include some quick, tactical items alongside deeper strategic ones.',
    'Placeholder language ("various tools", "key metrics", "relevant stakeholders") — always name specific tools, metrics, people, or artifacts.',
    'Filler fields — every field in every element must carry independent value. If a field just restates another field in different words, rewrite it with distinct content.',
    'Numbered titles — do NOT prefix element titles or section names with sequential numbers (e.g. "1. Title", "2) Title"). Numbering is handled by the UI. Write titles as plain descriptive text.',
  ]
}

// ============================================================
// Directive grouping
// ============================================================

const DIRECTIVE_CATEGORY_MAP: Record<string, string> = {
  role: 'PERSONA',
  persona: 'PERSONA',
  task: 'MANDATE',
  mandate: 'MANDATE',
  process: 'GENERATION APPROACH',
  verification: 'GENERATION APPROACH',
  guardrail: 'GUARDRAILS',
  'safety & governance': 'GUARDRAILS',
  safety: 'GUARDRAILS',
  governance: 'GUARDRAILS',
  constraint: 'GUARDRAILS',
}

function groupDirectives(directives: { label: string; content: string }[]): string {
  const groups: Record<string, { label: string; content: string }[]> = {}
  const ungrouped: { label: string; content: string }[] = []

  for (const d of directives) {
    const category = DIRECTIVE_CATEGORY_MAP[d.label.toLowerCase()]
    if (category) {
      if (!groups[category]) groups[category] = []
      groups[category].push(d)
    } else {
      ungrouped.push(d)
    }
  }

  const hasGroups = Object.keys(groups).length > 0

  if (!hasGroups) {
    return `INSTRUCTIONS (follow all of these):\n${directives.map((d, i) => `${i + 1}. [${d.label}] ${d.content}`).join('\n')}`
  }

  const parts: string[] = []
  const categoryOrder = ['PERSONA', 'MANDATE', 'GENERATION APPROACH', 'GUARDRAILS']

  for (const cat of categoryOrder) {
    if (groups[cat]?.length) {
      parts.push(`${cat}:\n${groups[cat].map((d) => `- [${d.label}] ${d.content}`).join('\n')}`)
    }
  }

  if (ungrouped.length > 0) {
    parts.push(`INSTRUCTIONS:\n${ungrouped.map((d, i) => `${i + 1}. [${d.label}] ${d.content}`).join('\n')}`)
  }

  return parts.join('\n\n')
}

// ============================================================
// Main assembly function
// ============================================================

/**
 * Assembles a complete, structured LLM prompt from instruction
 * directives and optional output-type-level prompt metadata.
 *
 * Prompt structure:
 *   PREAMBLE → CONTEXT → SECTION DRIVER → GENERATION PROCESS →
 *   INSTRUCTIONS → QUALITY BAR → ANTI-PATTERNS
 */
export function assembleDirectivesPrompt(
  context: Record<string, string>,
  section: { name: string; description: string },
  sectionLabel: string,
  directives: { label: string; content: string }[],
  options?: PromptAssemblyOptions,
): string {
  const elementLabel = options?.elementLabel || 'element'
  const contextBlock = formatContext(context)

  const preamble = options?.preamble || ''

  const generationProcess = options?.generationProcess
    || buildDefaultGenerationProcess(sectionLabel, elementLabel)

  const qualityBar = options?.qualityBar || buildDefaultQualityBar()
  const antiPatterns = options?.antiPatterns || buildDefaultAntiPatterns()

  const parts: string[] = []

  // 1. Preamble
  if (preamble) {
    parts.push(preamble)
  }

  // 2. Context with usage instruction
  parts.push(
    `CONTEXT (ground every ${elementLabel} in these — content that does not connect to at least one context field does not belong):\n${contextBlock}`,
  )

  // 3. Section driver
  parts.push(
    `${sectionLabel.toUpperCase()}: "${section.name}"\n${section.description}`,
  )

  // 4. Generation process
  parts.push(
    `GENERATION PROCESS (follow these steps in order):\n${generationProcess}`,
  )

  // 5. Instructions / directives (grouped when possible)
  parts.push(groupDirectives(directives))

  // 6. Quality bar
  parts.push(
    `QUALITY BAR (check every ${elementLabel} against ALL of these before output):\n${qualityBar.map((q) => `□ ${q}`).join('\n')}`,
  )

  // 7. Anti-patterns
  parts.push(
    `ANTI-PATTERNS (if you catch yourself doing any of these, stop and rewrite):\n${antiPatterns.map((a) => `✗ ${a}`).join('\n')}`,
  )

  return parts.join('\n\n')
}
