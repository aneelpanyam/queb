import { generateText, Output } from 'ai'
import { z } from 'zod'
import { ACTIVITY_CATEGORIES } from '@/lib/activity-categories'
import { withDebugMeta, withUsageMeta, isDebugMode } from '@/lib/ai-log-storage'

export const maxDuration = 120

// Schema for a single category's activities
const singleCategorySchema = z.object({
  category: z.string().describe('The activity category name, matching the framework'),
  activities: z.array(
    z.object({
      name: z.string().describe('Specific activity name for this role'),
      description: z.string().describe('A one-line description of how this role performs this activity'),
    })
  ),
})

export const activitiesSchema = z.object({
  categories: z.array(singleCategorySchema),
})

// Helper function to generate activities for a single category
async function generateActivitiesForCategory(
  category: { category: string; description: string; exampleActivities: readonly string[] },
  context: {
    role: string
    industry: string
    service: string
  },
  collectedPrompts?: string[],
) {
  const { role, industry, service } = context

  const prompt = `You are an organizational design expert.

For the role of "${role}" working in the "${industry}" industry providing "${service}" services, generate 2-4 specific activities for the following category:

CATEGORY:
${category.category}: ${category.description}

EXAMPLES (for reference, not to copy):
${category.exampleActivities.slice(0, 3).join(', ')}

RULES:
- Generate 2-4 specific activities that a "${role}" would actually perform in this category.
- Activities must be specific to the role, not generic. Tailor them to the industry and service context.
- If this category is not very relevant to this role, still include at least 1 activity, even if it's a minor part of their work.
- The activity name should be action-oriented (start with a verb or gerund).
- The description should explain what this specifically looks like for a "${role}".`

  if (collectedPrompts) collectedPrompts.push(prompt)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt,
    output: Output.object({ schema: singleCategorySchema }),
  })

  return { ...result.output, _partialUsage: result.usage }
}

export async function POST(req: Request) {
  try {
    const { role, industry, service } = await req.json()
    console.log(`[generate-activities] Role: ${role}, Industry: ${industry}, Service: ${service}`)
    console.log(`[generate-activities] Starting parallel generation for ${ACTIVITY_CATEGORIES.length} categories`)

    const startTime = Date.now()
    const debugPrompts: string[] = isDebugMode() ? [] : undefined as any

    // Generate activities for all categories in parallel
    const categoryPromises = ACTIVITY_CATEGORIES.map((category) =>
      generateActivitiesForCategory(category, {
        role,
        industry,
        service,
      }, debugPrompts).catch((error) => {
        console.error(`[generate-activities] Error for category ${category.category}:`, error)
        // Return a fallback category with empty activities on error
        return {
          category: category.category,
          activities: [],
        }
      })
    )

    const allCategories = await Promise.all(categoryPromises)

    const aggregatedUsage = allCategories.reduce((acc, c) => {
      const u = (c as any)._partialUsage as { inputTokens?: number; outputTokens?: number; totalTokens?: number } | undefined
      return {
        inputTokens: acc.inputTokens + (u?.inputTokens ?? 0),
        outputTokens: acc.outputTokens + (u?.outputTokens ?? 0),
        totalTokens: acc.totalTokens + (u?.totalTokens ?? 0),
      }
    }, { inputTokens: 0, outputTokens: 0, totalTokens: 0 })

    // Filter out categories with no activities (errors)
    const validCategories = allCategories
      .filter((c) => c.activities.length > 0)
      .map(({ _partialUsage, ...rest }: any) => rest)

    const duration = Date.now() - startTime
    console.log(
      `[generate-activities] Success: ${validCategories.length}/${ACTIVITY_CATEGORIES.length} categories in ${duration}ms`
    )

    return Response.json(withUsageMeta(withDebugMeta({ categories: validCategories }, debugPrompts ?? []), aggregatedUsage))
  } catch (error) {
    console.error('[generate-activities] Error:', error)
    return Response.json(
      { error: 'Failed to generate activities. Please try again.' },
      { status: 500 }
    )
  }
}
