import { generateText, Output } from 'ai'
import { z } from 'zod'
import { PROMPT_USE_CASES } from '@/lib/prompt-use-cases'
import { formatContext, assembleDirectivesPrompt } from '@/lib/assemble-prompt'

export const maxDuration = 120

const singleUseCaseSchema = z.object({
  categoryName: z.string().describe('The prompt use-case category'),
  categoryDescription: z.string().describe('What kinds of prompts this category contains'),
  prompts: z.array(
    z.object({
      prompt: z.string().describe('A complete, ready-to-use AI prompt template. Include placeholders like [specific detail] where the user should customize.'),
      context: z.string().describe('When to use this prompt — the specific situation or trigger'),
      expectedOutput: z.string().describe('What kind of output the user should expect from this prompt'),
    })
  ),
})

function buildDefaultPrompt(
  useCase: { name: string; description: string },
  context: Record<string, string>,
) {
  const contextBlock = formatContext(context)
  return `You are an expert AI prompt engineer who creates highly effective prompt templates.

CONTEXT:
${contextBlock}

TASK:
Generate 3-5 ready-to-use AI prompt templates for the "${useCase.name}" use case.

USE CASE DEFINITION:
${useCase.name}: ${useCase.description}

GUIDELINES:
- Each prompt must be complete and copy-paste ready — a user should be able to use it immediately.
- Include [bracketed placeholders] where the user needs to fill in specifics.
- Prompts should leverage domain knowledge and terminology relevant to the provided context.
- The "context" field should describe the specific trigger or situation when this prompt is most useful.
- The "expectedOutput" should set realistic expectations for what the AI will produce.
- Vary the complexity — include both quick tactical prompts and deeper strategic ones.
- If this use case is not very relevant, still include at least 1 prompt.`
}

async function generateForUseCase(
  useCase: { name: string; description: string },
  context: Record<string, string>,
  directives?: { label: string; content: string }[],
) {
  const prompt = directives?.length
    ? assembleDirectivesPrompt(context, useCase, 'Use Case', directives)
    : buildDefaultPrompt(useCase, context)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt,
    output: Output.object({ schema: singleUseCaseSchema }),
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

    const useCases = sectionDrivers?.length ? sectionDrivers : PROMPT_USE_CASES
    console.log(`[generate-prompts] Context keys: ${Object.keys(context).join(', ')}${sectionDrivers?.length ? ' (custom use cases)' : ''}${instructionDirectives?.length ? ` (${instructionDirectives.length} directives)` : ''}`)

    const startTime = Date.now()

    const promises = useCases.map((uc) =>
      generateForUseCase(uc, context, instructionDirectives).catch((err) => {
        console.error(`[generate-prompts] Error for ${uc.name}:`, err)
        return { categoryName: uc.name, categoryDescription: uc.description, prompts: [] }
      })
    )

    const allCategories = await Promise.all(promises)
    const relevant = allCategories.filter((c) => c.prompts.length > 0)

    console.log(`[generate-prompts] ${relevant.length}/${useCases.length} categories in ${Date.now() - startTime}ms`)

    return Response.json({ categories: relevant })
  } catch (error) {
    console.error('[generate-prompts] Error:', error)
    return Response.json({ error: 'Failed to generate prompts.' }, { status: 500 })
  }
}
