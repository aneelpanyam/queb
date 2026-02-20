import { generateText, Output } from 'ai'
import { z } from 'zod'
import { CHECKLIST_DIMENSIONS } from '@/lib/checklist-dimensions'
import { formatContext, assembleDirectivesPrompt } from '@/lib/assemble-prompt'
import { withDebugMeta, isDebugMode } from '@/lib/ai-log-storage'

export const maxDuration = 120

const singleDimensionSchema = z.object({
  dimensionName: z.string().describe('The checklist dimension name'),
  dimensionDescription: z.string().describe('Brief description of what this dimension covers'),
  items: z.array(
    z.object({
      item: z.string().describe('A specific, actionable checklist item'),
      description: z.string().describe('Why this item matters and how to complete it properly'),
      priority: z.string().describe('High, Medium, or Low'),
      commonMistakes: z.string().describe('What people typically get wrong on this item. Empty string if not applicable.'),
      tips: z.string().describe('Practical advice from experienced practitioners. Empty string if not applicable.'),
      verificationMethod: z.string().describe('What constitutes done — artifact or test proving completion. Empty string if not applicable.'),
    })
  ),
})

function buildDefaultPrompt(
  dimension: { name: string; description: string },
  context: Record<string, string>,
) {
  const contextBlock = formatContext(context)
  return `You are an expert process consultant and operations advisor.

CONTEXT:
${contextBlock}

TASK:
Generate a thorough checklist for the "${dimension.name}" dimension.

DIMENSION DEFINITION:
${dimension.name}: ${dimension.description}

GUIDELINES:
- Generate 4-8 specific, actionable checklist items relevant to the given context.
- Only include items if this dimension is genuinely relevant. If not relevant, return an empty items array.
- Each item must be concrete and verifiable — not vague guidance.
- Assign priority: High (must-do, blocking), Medium (should-do, important), Low (nice-to-have, optimization).
- The description should explain WHY this matters and HOW to execute it well.
- Tailor everything to the specific context provided.`
}

async function generateForDimension(
  dimension: { name: string; description: string },
  context: Record<string, string>,
  directives?: { label: string; content: string }[],
  collectedPrompts?: string[],
) {
  const prompt = directives?.length
    ? assembleDirectivesPrompt(context, dimension, 'Dimension', directives)
    : buildDefaultPrompt(dimension, context)

  if (collectedPrompts) collectedPrompts.push(prompt)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt,
    output: Output.object({ schema: singleDimensionSchema }),
  })

  return result.output
}

export async function POST(req: Request) {
  try {
    const { context, sectionDrivers, instructionDirectives } = (await req.json()) as {
      context: Record<string, string>
      sectionDrivers?: { name: string; description: string }[]
      instructionDirectives?: { label: string; content: string }[]
    }

    const dimensions = sectionDrivers?.length ? sectionDrivers : CHECKLIST_DIMENSIONS
    console.log(`[generate-checklist] Context keys: ${Object.keys(context).join(', ')}${sectionDrivers?.length ? ' (custom dimensions)' : ''}${instructionDirectives?.length ? ` (${instructionDirectives.length} directives)` : ''}`)

    const startTime = Date.now()
    const debugPrompts: string[] = isDebugMode() ? [] : undefined as any

    const promises = dimensions.map((dim) =>
      generateForDimension(dim, context, instructionDirectives, debugPrompts).catch((err) => {
        console.error(`[generate-checklist] Error for ${dim.name}:`, err)
        return { dimensionName: dim.name, dimensionDescription: dim.description, items: [] }
      })
    )

    const allDimensions = await Promise.all(promises)
    const relevant = allDimensions.filter((d) => d.items.length > 0)

    console.log(`[generate-checklist] ${relevant.length}/${dimensions.length} relevant in ${Date.now() - startTime}ms`)

    return Response.json(withDebugMeta({ dimensions: relevant }, debugPrompts ?? []))
  } catch (error) {
    console.error('[generate-checklist] Error:', error)
    return Response.json({ error: 'Failed to generate checklist.' }, { status: 500 })
  }
}
