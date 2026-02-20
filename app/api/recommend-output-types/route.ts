import { generateText, Output } from 'ai'
import { z } from 'zod'
import { withDebugMeta, isDebugMode } from '@/lib/ai-log-storage'

export const maxDuration = 60

const outputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A 2-3 sentence overview of the recommended approach — which output types to create and in what order, and why this combination works for the idea.'
    ),
  recommendations: z.array(
    z.object({
      outputTypeId: z
        .string()
        .describe('The exact id of the recommended output type from the catalog'),
      rationale: z
        .string()
        .describe(
          'One concise sentence explaining why this output type fits the idea and what it delivers.'
        ),
    })
  ),
})

export async function POST(req: Request) {
  try {
    const { ideaDescription, outputTypes } = (await req.json()) as {
      ideaDescription: string
      outputTypes: {
        id: string
        name: string
        description: string
        sectionLabel: string
        elementLabel: string
        supportsDeepDive?: boolean
      }[]
    }

    if (!ideaDescription?.trim()) {
      return Response.json({ error: 'Missing idea description' }, { status: 400 })
    }

    const catalog = outputTypes
      .map(
        (ot) =>
          `- id="${ot.id}" | ${ot.name}: ${ot.description} (sections: "${ot.sectionLabel}s", elements: "${ot.elementLabel}s"${ot.supportsDeepDive ? ', supports deep-dive' : ''})`
      )
      .join('\n')

    const prompt = `You are an expert product strategist for the Queb digital product creation platform. Given a product idea, recommend which output type(s) the user should create — and in what order — to best bring the idea to life.

AVAILABLE OUTPUT TYPES:
${catalog}

THE IDEA:
${ideaDescription}

TASK:
Recommend 1-4 output types from the catalog above. For each, explain in one sentence why it fits this idea. Also provide a short summary (2-3 sentences) of the overall approach — which types to create, in what order, and why.

GUIDELINES:
- Only recommend output types that genuinely fit the idea. Do not pad the list.
- Use the exact "id" values from the catalog.
- If multiple types work, suggest a logical creation order (e.g. exploratory types first, then execution types).
- Be specific about what each type delivers for THIS idea — not generic descriptions.
- Keep it concise. This is a quick recommendation, not a detailed plan.`

    const debugPrompts: string[] = isDebugMode() ? [prompt] : (undefined as never)

    const result = await generateText({
      model: 'openai/gpt-5.2',
      prompt,
      output: Output.object({ schema: outputSchema }),
    })

    return Response.json(withDebugMeta(result.output as object, debugPrompts ?? []))
  } catch (error) {
    console.error('[recommend-output-types] Error:', error)
    return Response.json(
      { error: 'Failed to generate recommendations. Please try again.' },
      { status: 500 }
    )
  }
}
