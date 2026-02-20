import { generateText, Output } from 'ai'
import { z } from 'zod'
import { withDebugMeta } from '@/lib/ai-log-storage'

export const maxDuration = 60

const suggestionsSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of suggestions based on the given prompt'),
})

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      return Response.json({ error: 'Missing prompt' }, { status: 400 })
    }

    const finalPrompt = `${prompt}\n\nReturn the items as a flat list of concise strings. No numbering, no descriptions — just the values.`

    const result = await generateText({
      model: 'openai/gpt-5.2',
      prompt: finalPrompt,
      output: Output.object({ schema: suggestionsSchema }),
    })

    return Response.json(withDebugMeta({ suggestions: result.output?.suggestions || [] }, [finalPrompt]))
  } catch (error) {
    console.error('[generate-field-suggestions] Error:', error)
    return Response.json(
      { error: 'Failed to generate suggestions.' },
      { status: 500 },
    )
  }
}
