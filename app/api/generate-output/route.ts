import { generateText, Output } from 'ai'
import { z } from 'zod'
import { formatContext } from '@/lib/assemble-prompt'
import { withDebugMeta } from '@/lib/ai-log-storage'

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const { prompt, context, sectionLabel, elementLabel, fields, sectionDrivers, instructionDirectives } = await req.json()

    if (!prompt || !fields || !Array.isArray(fields)) {
      return Response.json({ error: 'Missing prompt or fields' }, { status: 400 })
    }

    const contextBlock = context && typeof context === 'object' && Object.keys(context).length > 0
      ? `\n\nCONTEXT:\n${formatContext(context)}`
      : ''

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

    const hasDrivers = Array.isArray(sectionDrivers) && sectionDrivers.length > 0
    const fieldSpec = fields.map((f: { key: string; label: string }) => `"${f.key}" (${f.label})`).join(', ')

    const hasDirectives = Array.isArray(instructionDirectives) && instructionDirectives.length > 0

    let finalPrompt: string
    if (hasDirectives) {
      const directivesList = instructionDirectives.map((d: { label: string; content: string }, i: number) => `${i + 1}. [${d.label}] ${d.content}`).join('\n')
      finalPrompt = `${prompt}${contextBlock}\n\nINSTRUCTIONS:\n${directivesList}`
      if (hasDrivers) {
        finalPrompt += `\n\nSECTION STRUCTURE:\nGenerate exactly these ${sectionLabel || 'section'}s (one per driver):\n${sectionDrivers.map((d: { name: string; description: string }, i: number) => `${i + 1}. "${d.name}" — ${d.description}`).join('\n')}`
      }
      finalPrompt += `\nEach ${elementLabel || 'item'} must have these fields: ${fieldSpec}.`
    } else {
      const driverBlock = hasDrivers
        ? `\n\nSECTION STRUCTURE:\nGenerate exactly these ${sectionLabel || 'section'}s (one per driver):\n${sectionDrivers.map((d: { name: string; description: string }, i: number) => `${i + 1}. "${d.name}" — ${d.description}`).join('\n')}\nEach ${sectionLabel || 'section'} should contain 3-6 ${elementLabel || 'item'}s.`
        : `\n\nOUTPUT FORMAT:\nGenerate 4-8 ${sectionLabel || 'section'}s, each containing 3-6 ${elementLabel || 'item'}s.\nEach ${sectionLabel || 'section'} should have a clear name and description.`
      finalPrompt = `${prompt}${contextBlock}${driverBlock}\nEach ${elementLabel || 'item'} must have these fields: ${fieldSpec}.\nBe specific, practical, and tailored to the context provided.`
    }

    const result = await generateText({
      model: 'openai/gpt-5.2',
      prompt: finalPrompt,
      output: Output.object({ schema: outputSchema }),
    })

    return Response.json(withDebugMeta(result.output as object, [finalPrompt]))
  } catch (error) {
    console.error('[generate-output] Error:', error)
    return Response.json(
      { error: 'Failed to generate output. Please try again.' },
      { status: 500 },
    )
  }
}
