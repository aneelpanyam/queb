import { generateText, Output } from 'ai'
import { z } from 'zod'
import { BUSINESS_PERSPECTIVES } from '@/lib/perspectives'
import { formatContext, assembleDirectivesPrompt, buildElementSchema, buildFieldOverrideBlock } from '@/lib/assemble-prompt'
import { withDebugMeta, isDebugMode } from '@/lib/ai-log-storage'

export const maxDuration = 120

const DEFAULT_LABEL = 'Perspective'

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
      actionSteps: z.string()
        .describe('What concrete actions to take once the answer is known. Empty string if not applicable.'),
      redFlags: z.string()
        .describe('Warning signs or problematic answers to watch for. Empty string if not applicable.'),
      keyMetrics: z.string()
        .describe('Specific KPIs, benchmarks, or numbers to reference. Empty string if not applicable.'),
    })
  ),
})

export const questionsSchema = z.object({
  perspectives: z.array(singlePerspectiveSchema),
})

function buildDefaultPrompt(
  perspective: { name: string; description: string },
  context: Record<string, string>,
  sectionLabel: string,
) {
  const contextBlock = formatContext(context)
  return `You are an expert thinking coach and organizational consultant.

CONTEXT:
${contextBlock}

TASK:
Generate 3-5 thoughtful, probing questions specifically from the "${perspective.name}" perspective.

${sectionLabel.toUpperCase()} DEFINITION:
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
  sectionLabel: string,
  directives?: { label: string; content: string }[],
  collectedPrompts?: string[],
) {
  const prompt = directives?.length
    ? assembleDirectivesPrompt(context, perspective, sectionLabel, directives)
    : buildDefaultPrompt(perspective, context, sectionLabel)

  if (collectedPrompts) collectedPrompts.push(prompt)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt,
    output: Output.object({ schema: singlePerspectiveSchema }),
  })

  return result.output
}

export async function POST(req: Request) {
  try {
    const { context, sectionDrivers, instructionDirectives, sectionLabel } = (await req.json()) as {
      context: Record<string, string>
      sectionDrivers?: { name: string; description: string; fields?: { key: string; label: string; [k: string]: unknown }[] }[]
      instructionDirectives?: { label: string; content: string }[]
      sectionLabel?: string
    }

    const label = sectionLabel || DEFAULT_LABEL
    const perspectives = sectionDrivers?.length ? sectionDrivers : BUSINESS_PERSPECTIVES
    const hasPerDriverFields = sectionDrivers?.some((s) => s.fields?.length) ?? false

    console.log(`[generate-questions] Context keys: ${Object.keys(context).join(', ')}`)
    console.log(`[generate-questions] Starting parallel generation for ${perspectives.length} perspectives${sectionDrivers?.length ? ' (custom)' : ''}${instructionDirectives?.length ? ` (${instructionDirectives.length} directives)` : ''}${hasPerDriverFields ? ' (per-driver fields)' : ''}`)

    const startTime = Date.now()
    const debugPrompts: string[] = isDebugMode() ? [] : undefined as any

    if (hasPerDriverFields) {
      const customDrivers = sectionDrivers!
      const promises = customDrivers.map((perspective) => {
        const fields = perspective.fields
        if (fields?.length) {
          const elementSchema = buildElementSchema(fields)
          const schema = z.object({
            sectionName: z.string(),
            sectionDescription: z.string(),
            elements: z.array(elementSchema),
          })
          const prompt = (instructionDirectives?.length
            ? assembleDirectivesPrompt(context, perspective, label, instructionDirectives)
            : buildDefaultPrompt(perspective, context, label))
            + buildFieldOverrideBlock(fields)
          if (debugPrompts) debugPrompts.push(prompt)
          return generateText({ model: 'openai/gpt-5.2', prompt, output: Output.object({ schema }) })
            .then((r) => ({ ...(r.output as object), resolvedFields: fields }) as { sectionName: string; sectionDescription: string; elements: Record<string, string>[]; resolvedFields: typeof fields })
            .catch((err) => {
              console.error(`[generate-questions] Error for perspective ${perspective.name}:`, err)
              return { sectionName: perspective.name, sectionDescription: perspective.description, elements: [] as Record<string, string>[], resolvedFields: fields }
            })
        }
        return generateQuestionsForPerspective(perspective, context, label, instructionDirectives, debugPrompts)
          .then((r) => ({
            sectionName: r.perspectiveName,
            sectionDescription: r.perspectiveDescription,
            elements: r.questions as unknown as Record<string, string>[],
          }))
          .catch((err) => {
            console.error(`[generate-questions] Error for perspective ${perspective.name}:`, err)
            return { sectionName: perspective.name, sectionDescription: perspective.description, elements: [] as Record<string, string>[] }
          })
      })

      const allSections = await Promise.all(promises)
      const relevant = allSections.filter((s) => s.elements.length > 0)
      console.log(
        `[generate-questions] Success: ${relevant.length}/${perspectives.length} relevant perspectives in ${Date.now() - startTime}ms (per-driver fields)`
      )
      return Response.json(withDebugMeta({ sections: relevant, _perDriverFields: true }, debugPrompts ?? []))
    }

    const perspectivePromises = perspectives.map((perspective) =>
      generateQuestionsForPerspective(perspective, context, label, instructionDirectives, debugPrompts).catch((error) => {
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

    return Response.json(withDebugMeta({ perspectives: relevantPerspectives }, debugPrompts ?? []))
  } catch (error) {
    console.error('[generate-questions] Error:', error)
    return Response.json(
      { error: 'Failed to generate questions. Please try again.' },
      { status: 500 }
    )
  }
}
