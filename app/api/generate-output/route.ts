import { generateText, Output } from 'ai'
import { z } from 'zod'

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const { prompt, sectionLabel, elementLabel, fields } = await req.json()

    if (!prompt || !fields || !Array.isArray(fields)) {
      return Response.json({ error: 'Missing prompt or fields' }, { status: 400 })
    }

    const fieldSchemaEntries: Record<string, z.ZodTypeAny> = {}
    for (const f of fields) {
      fieldSchemaEntries[f.key] = z.string().describe(f.label)
    }

    const elementSchema = z.object(fieldSchemaEntries)

    const sectionSchema = z.object({
      name: z.string().describe(`The ${sectionLabel || 'section'} name`),
      description: z.string().describe(`A brief description of this ${sectionLabel || 'section'}`),
      elements: z.array(elementSchema).describe(`The ${elementLabel || 'item'}s in this ${sectionLabel || 'section'}`),
    })

    const outputSchema = z.object({
      sections: z.array(sectionSchema),
    })

    const result = await generateText({
      model: 'openai/gpt-5.2',
      prompt: `${prompt}

OUTPUT FORMAT:
Generate 4-8 ${sectionLabel || 'section'}s, each containing 3-6 ${elementLabel || 'item'}s.
Each ${sectionLabel || 'section'} should have a clear name and description.
Each ${elementLabel || 'item'} must have these fields: ${fields.map((f: { key: string; label: string }) => `"${f.key}" (${f.label})`).join(', ')}.
Be specific, practical, and tailored to the context provided.`,
      output: Output.object({ schema: outputSchema }),
    })

    return Response.json(result.output)
  } catch (error) {
    console.error('[generate-output] Error:', error)
    return Response.json(
      { error: 'Failed to generate output. Please try again.' },
      { status: 500 },
    )
  }
}
