import { generateText, Output } from 'ai'
import { z } from 'zod'
import { BUSINESS_PERSPECTIVES } from '@/lib/perspectives'

export const maxDuration = 120

// Schema for a single perspective's questions
const singlePerspectiveSchema = z.object({
  perspectiveName: z.string().describe('The name of the perspective'),
  perspectiveDescription: z
    .string()
    .describe('A brief description of what this perspective focuses on'),
  questions: z.array(
    z.object({
      question: z
        .string()
        .describe('A thought-provoking question from this perspective'),
      relevance: z
        .string()
        .describe(
          'A note explaining why this question is important and what insights it can uncover'
        ),
      infoPrompt: z
        .string()
        .describe(
          'A practical guidance prompt that tells the user exactly what data, documents, people, or analysis they should consult to answer this question well. Be specific about sources, metrics, and methods.'
        ),
    })
  ),
})

export const questionsSchema = z.object({
  perspectives: z.array(singlePerspectiveSchema),
})

// Helper function to generate questions for a single perspective
async function generateQuestionsForPerspective(
  perspective: { name: string; description: string },
  context: {
    role: string
    activity: string
    situation: string
    additionalContext: any
    industry: string
    service: string
  }
) {
  const { role, activity, situation, additionalContext, industry, service } = context

  // Format additional context if provided
  let additionalContextBlock = ''
  if (additionalContext && Array.isArray(additionalContext) && additionalContext.length > 0) {
    const items = additionalContext
      .filter((c: { label: string; value: string }) => c.label?.trim() && c.value?.trim())
      .map((c: { label: string; value: string }) => `- ${c.label}: ${c.value}`)
      .join('\n')
    if (items) {
      additionalContextBlock = `\n\nADDITIONAL CONTEXT:\n${items}`
    }
  }

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt: `You are an expert thinking coach and organizational consultant.

CONTEXT:
- Industry: ${industry}
- Service: ${service}
- Role: ${role}
- Activity: ${activity}
- Situation: "${situation}"${additionalContextBlock}

TASK:
Generate 3-5 thoughtful, probing questions specifically from the "${perspective.name}" perspective.

PERSPECTIVE DEFINITION:
${perspective.name}: ${perspective.description}

GUIDELINES:
- Only generate questions if this perspective is genuinely relevant to the given role, activity, and situation. If not relevant, return an empty questions array.
- Every question must be specific to the described situation, not generic.
- Actively incorporate any additional context provided (team size, budget, timeline, stakeholders, challenges, etc.) to make questions sharper and more actionable.
- Each question must come with a relevance note explaining why this question matters for this specific context and what kind of insight it can unlock.
- Each question must include an infoPrompt: a practical guidance note telling the user exactly what data sources, documents, people, metrics, tools, or analysis methods they should consult to answer the question well. Be highly specific (e.g., "Review your Q3 customer churn report and compare against industry benchmarks from Gartner" rather than "Look at your data").
- Questions should provoke deep thinking and help uncover blind spots.
- Consider the industry norms and the service being delivered when framing questions.`,
    output: Output.object({ schema: singlePerspectiveSchema }),
  })

  return result.output
}

export async function POST(req: Request) {
  try {
    const { role, activity, situation, additionalContext, industry, service } = await req.json()
    console.log(`[generate-questions] Role: ${role}, Activity: ${activity}, Industry: ${industry}`)
    console.log(`[generate-questions] Starting parallel generation for ${BUSINESS_PERSPECTIVES.length} perspectives`)

    const startTime = Date.now()

    // Generate questions for all perspectives in parallel
    const perspectivePromises = BUSINESS_PERSPECTIVES.map((perspective) =>
      generateQuestionsForPerspective(perspective, {
        role,
        activity,
        situation,
        additionalContext,
        industry,
        service,
      }).catch((error) => {
        console.error(`[generate-questions] Error for perspective ${perspective.name}:`, error)
        // Return a fallback perspective with empty questions on error
        return {
          perspectiveName: perspective.name,
          perspectiveDescription: perspective.description,
          questions: [],
        }
      })
    )

    const allPerspectives = await Promise.all(perspectivePromises)

    // Filter out perspectives with no questions (not relevant)
    const relevantPerspectives = allPerspectives.filter((p) => p.questions.length > 0)

    const duration = Date.now() - startTime
    console.log(
      `[generate-questions] Success: ${relevantPerspectives.length}/${BUSINESS_PERSPECTIVES.length} relevant perspectives in ${duration}ms`
    )

    return Response.json({ perspectives: relevantPerspectives })
  } catch (error) {
    console.error('[generate-questions] Error:', error)
    return Response.json(
      { error: 'Failed to generate questions. Please try again.' },
      { status: 500 }
    )
  }
}
