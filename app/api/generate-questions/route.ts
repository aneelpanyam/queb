import { generateText, Output } from 'ai'
import { z } from 'zod'
import { BUSINESS_PERSPECTIVES } from '@/lib/perspectives'

export const maxDuration = 120

export const questionsSchema = z.object({
  perspectives: z.array(
    z.object({
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
  ),
})

export async function POST(req: Request) {
  try {
    const { role, activity, situation, additionalContext, industry, service } = await req.json()
    console.log(`[generate-questions] Role: ${role}, Activity: ${activity}, Industry: ${industry}`)

    const perspectivesList = BUSINESS_PERSPECTIVES.map(
      (p, i) => `${i + 1}. ${p.name}: ${p.description}`
    ).join('\n')

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
Generate thoughtful, probing questions from each of the following pre-defined business perspectives. For each perspective, generate 3-5 questions that are highly specific to the given context (industry, service, role, activity, situation, and any additional context provided).

PERSPECTIVES:
${perspectivesList}

GUIDELINES:
- Only include perspectives that are genuinely relevant to the given role, activity, and situation. Skip perspectives that would produce generic or low-value questions.
- Every question must be specific to the described situation, not generic.
- Actively incorporate any additional context provided (team size, budget, timeline, stakeholders, challenges, etc.) to make questions sharper and more actionable.
- Each question must come with a relevance note explaining why this question matters for this specific context and what kind of insight it can unlock.
- Each question must include an infoPrompt: a practical guidance note telling the user exactly what data sources, documents, people, metrics, tools, or analysis methods they should consult to answer the question well. Be highly specific (e.g., "Review your Q3 customer churn report and compare against industry benchmarks from Gartner" rather than "Look at your data").
- Questions should provoke deep thinking and help uncover blind spots.
- Consider the industry norms and the service being delivered when framing questions.`,
      output: Output.object({ schema: questionsSchema }),
    })

    console.log(`[generate-questions] Success: ${result.output?.perspectives?.length || 0} perspectives`)
    return Response.json(result.output)
  } catch (error) {
    console.error('[generate-questions] Error:', error)
    return Response.json(
      { error: 'Failed to generate questions. Please try again.' },
      { status: 500 }
    )
  }
}
