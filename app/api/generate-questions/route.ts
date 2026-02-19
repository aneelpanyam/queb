import { generateText, Output } from 'ai'
import { z } from 'zod'
import { BUSINESS_PERSPECTIVES } from '@/lib/perspectives'
import { formatContext, assembleDirectivesPrompt } from '@/lib/assemble-prompt'

export const maxDuration = 120

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

function buildDefaultPrompt(
  perspective: { name: string; description: string },
  context: Record<string, string>,
) {
  const contextBlock = formatContext(context)
  return `You are an expert thinking coach and organizational consultant.

CONTEXT:
${contextBlock}

TASK:
Generate 3-5 thoughtful, probing questions specifically from the "${perspective.name}" perspective.

PERSPECTIVE DEFINITION:
${perspective.name}: ${perspective.description}

GUIDELINES:
- Only generate questions if this perspective is genuinely relevant to the given context. If not relevant, return an empty questions array.
- Every question must be specific to the described context, not generic.
- Actively incorporate all context provided to make questions sharper and more actionable.
- Each question must come with a relevance note explaining why this question matters for this specific context and what kind of insight it can unlock.
- Each question must include an infoPrompt: a practical guidance note telling the user exactly what data sources, documents, people, metrics, tools, or analysis methods they should consult to answer the question well. Be highly specific (e.g., "Review your Q3 customer churn report and compare against industry benchmarks from Gartner" rather than "Look at your data").
- Questions should provoke deep thinking and help uncover blind spots.
- Tailor questions to the specific context fields provided.`
}

async function generateQuestionsForPerspective(
  perspective: { name: string; description: string },
  context: Record<string, string>,
  directives?: { label: string; content: string }[],
) {
  const prompt = directives?.length
    ? assembleDirectivesPrompt(context, perspective, 'Perspective', directives)
    : buildDefaultPrompt(perspective, context)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt,
    output: Output.object({ schema: singlePerspectiveSchema }),
  })

  return result.output
}

export async function POST(req: Request) {
  try {
    const { context, sectionDrivers, instructionDirectives } = (await req.json()) as {
      context: Record<string, string>
      sectionDrivers?: { name: string; description: string }[]
      instructionDirectives?: { label: string; content: string }[]
    }

    const perspectives = sectionDrivers?.length ? sectionDrivers : BUSINESS_PERSPECTIVES
    console.log(`[generate-questions] Context keys: ${Object.keys(context).join(', ')}`)
    console.log(`[generate-questions] Starting parallel generation for ${perspectives.length} perspectives${sectionDrivers?.length ? ' (custom)' : ''}${instructionDirectives?.length ? ` (${instructionDirectives.length} directives)` : ''}`)

    const startTime = Date.now()

    const perspectivePromises = perspectives.map((perspective) =>
      generateQuestionsForPerspective(perspective, context, instructionDirectives).catch((error) => {
        console.error(`[generate-questions] Error for perspective ${perspective.name}:`, error)
        return {
          perspectiveName: perspective.name,
          perspectiveDescription: perspective.description,
          questions: [],
        }
      })
    )

    const allPerspectives = await Promise.all(perspectivePromises)
    const relevantPerspectives = allPerspectives.filter((p) => p.questions.length > 0)

    const duration = Date.now() - startTime
    console.log(
      `[generate-questions] Success: ${relevantPerspectives.length}/${perspectives.length} relevant perspectives in ${duration}ms`
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
