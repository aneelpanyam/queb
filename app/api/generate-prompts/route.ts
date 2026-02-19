import { generateText, Output } from 'ai'
import { z } from 'zod'
import { PROMPT_USE_CASES } from '@/lib/prompt-use-cases'

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

async function generateForUseCase(
  useCase: { name: string; description: string },
  context: { role: string; activity: string; situation: string; industry: string; service: string },
) {
  const { role, activity, situation, industry, service } = context

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt: `You are an expert AI prompt engineer who creates highly effective prompt templates.

CONTEXT:
- Industry: ${industry}
- Service: ${service}
- Role: ${role}
- Activity: ${activity}
- Situation: "${situation}"

TASK:
Generate 3-5 ready-to-use AI prompt templates for the "${useCase.name}" use case.

USE CASE DEFINITION:
${useCase.name}: ${useCase.description}

GUIDELINES:
- Each prompt must be complete and copy-paste ready — a user should be able to use it immediately.
- Include [bracketed placeholders] where the user needs to fill in specifics.
- Prompts should leverage the role's domain knowledge and industry terminology.
- The "context" field should describe the specific trigger or situation when this prompt is most useful.
- The "expectedOutput" should set realistic expectations for what the AI will produce.
- Vary the complexity — include both quick tactical prompts and deeper strategic ones.
- If this use case is not very relevant, still include at least 1 prompt.`,
    output: Output.object({ schema: singleUseCaseSchema }),
  })

  return result.output
}

export async function POST(req: Request) {
  try {
    const { role, activity, situation, additionalContext, industry, service } = await req.json()
    console.log(`[generate-prompts] Role: ${role}, Activity: ${activity}`)

    const startTime = Date.now()

    const promises = PROMPT_USE_CASES.map((uc) =>
      generateForUseCase(uc, { role, activity, situation, industry, service }).catch((err) => {
        console.error(`[generate-prompts] Error for ${uc.name}:`, err)
        return { categoryName: uc.name, categoryDescription: uc.description, prompts: [] }
      })
    )

    const allCategories = await Promise.all(promises)
    const relevant = allCategories.filter((c) => c.prompts.length > 0)

    console.log(`[generate-prompts] ${relevant.length}/${PROMPT_USE_CASES.length} categories in ${Date.now() - startTime}ms`)

    return Response.json({ categories: relevant })
  } catch (error) {
    console.error('[generate-prompts] Error:', error)
    return Response.json({ error: 'Failed to generate prompts.' }, { status: 500 })
  }
}
