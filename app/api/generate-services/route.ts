import { generateText, Output } from 'ai'
import { z } from 'zod'
import { withDebugMeta } from '@/lib/ai-log-storage'

export const maxDuration = 120

const servicesSchema = z.object({
  services: z
    .array(z.string())
    .describe('A list of typical services offered by organizations in this industry'),
})

export async function POST(req: Request) {
  try {
  const { industry } = await req.json()
  console.log(`[generate-services] Generating services for industry: ${industry}`)

  const prompt = `For the "${industry}" industry, list 15-20 typical services that organizations in this industry commonly provide. Be specific and practical. Return only the service names as strings.

Examples for "Healthcare": Patient Care, Telemedicine, Diagnostics & Lab Services, Pharmacy Services, etc.
Examples for "Technology": Software Development, Cloud Services, Cybersecurity, IT Consulting, etc.`

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt,
    output: Output.object({ schema: servicesSchema }),
  })

  console.log(`[generate-services] Success: ${result.output?.services?.length || 0} services`)
  return Response.json(withDebugMeta(result.output as object, [prompt]))
  } catch (error) {
    console.error('[generate-services] Error:', error)
    return Response.json(
      { error: 'Failed to generate services. Please try again.' },
      { status: 500 }
    )
  }
}
