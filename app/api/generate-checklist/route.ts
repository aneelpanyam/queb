import { generateText, Output } from 'ai'
import { z } from 'zod'
import { CHECKLIST_DIMENSIONS } from '@/lib/checklist-dimensions'

export const maxDuration = 120

const singleDimensionSchema = z.object({
  dimensionName: z.string().describe('The checklist dimension name'),
  dimensionDescription: z.string().describe('Brief description of what this dimension covers'),
  items: z.array(
    z.object({
      item: z.string().describe('A specific, actionable checklist item'),
      description: z.string().describe('Why this item matters and how to complete it properly'),
      priority: z.string().describe('High, Medium, or Low'),
    })
  ),
})

function formatContext(context: Record<string, string>): string {
  return Object.entries(context)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `- ${k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()}: ${v}`)
    .join('\n')
}

async function generateForDimension(
  dimension: { name: string; description: string },
  context: Record<string, string>,
) {
  const contextBlock = formatContext(context)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt: `You are an expert process consultant and operations advisor.

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
- Tailor everything to the specific context provided.`,
    output: Output.object({ schema: singleDimensionSchema }),
  })

  return result.output
}

export async function POST(req: Request) {
  try {
    const { context } = (await req.json()) as { context: Record<string, string> }
    console.log(`[generate-checklist] Context keys: ${Object.keys(context).join(', ')}`)

    const startTime = Date.now()

    const promises = CHECKLIST_DIMENSIONS.map((dim) =>
      generateForDimension(dim, context).catch((err) => {
        console.error(`[generate-checklist] Error for ${dim.name}:`, err)
        return { dimensionName: dim.name, dimensionDescription: dim.description, items: [] }
      })
    )

    const allDimensions = await Promise.all(promises)
    const relevant = allDimensions.filter((d) => d.items.length > 0)

    console.log(`[generate-checklist] ${relevant.length}/${CHECKLIST_DIMENSIONS.length} relevant in ${Date.now() - startTime}ms`)

    return Response.json({ dimensions: relevant })
  } catch (error) {
    console.error('[generate-checklist] Error:', error)
    return Response.json({ error: 'Failed to generate checklist.' }, { status: 500 })
  }
}
