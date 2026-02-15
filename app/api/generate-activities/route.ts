import { generateText, Output } from 'ai'
import { z } from 'zod'
import { ACTIVITY_CATEGORIES } from '@/lib/activity-categories'

export const maxDuration = 120

export const activitiesSchema = z.object({
  categories: z.array(
    z.object({
      category: z.string().describe('The activity category name, matching the framework'),
      activities: z.array(
        z.object({
          name: z.string().describe('Specific activity name for this role'),
          description: z.string().describe('A one-line description of how this role performs this activity'),
        })
      ),
    })
  ),
})

export async function POST(req: Request) {
  try {
  const { role, industry, service } = await req.json()
  console.log(`[generate-activities] Role: ${role}, Industry: ${industry}, Service: ${service}`)

  const frameworkText = ACTIVITY_CATEGORIES.map(
    (cat) =>
      `- ${cat.category}: ${cat.description} (e.g. ${cat.exampleActivities.slice(0, 3).join(', ')})`
  ).join('\n')

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt: `You are an organizational design expert.

For the role of "${role}" working in the "${industry}" industry providing "${service}" services, generate a comprehensive list of activities organized by the following activity framework categories.

ACTIVITY FRAMEWORK:
${frameworkText}

RULES:
- For EACH category, generate 2-4 specific activities that a "${role}" would actually perform.
- Activities must be specific to the role, not generic. Tailor them to the industry and service context.
- If a category is not relevant to this role, still include it with at least 1 activity, even if it's a minor part of their work.
- The activity name should be action-oriented (start with a verb or gerund).
- The description should explain what this specifically looks like for a "${role}".`,
    output: Output.object({ schema: activitiesSchema }),
  })

  console.log(`[generate-activities] Success: ${result.output?.categories?.length || 0} categories`)
  return Response.json(result.output)
  } catch (error) {
    console.error('[generate-activities] Error:', error)
    return Response.json(
      { error: 'Failed to generate activities. Please try again.' },
      { status: 500 }
    )
  }
}
