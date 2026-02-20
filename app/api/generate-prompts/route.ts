import { generateText, Output } from 'ai'
import { z } from 'zod'
import { PROMPT_USE_CASES } from '@/lib/prompt-use-cases'
import { formatContext, assembleDirectivesPrompt, buildElementSchema, buildFieldOverrideBlock } from '@/lib/assemble-prompt'
import { withDebugMeta, isDebugMode } from '@/lib/ai-log-storage'

export const maxDuration = 120

const DEFAULT_LABEL = 'Use Case'

const singleUseCaseSchema = z.object({
  categoryName: z.string().describe('The prompt use-case category'),
  categoryDescription: z.string().describe('What kinds of prompts this category contains'),
  prompts: z.array(
    z.object({
      prompt: z.string().describe('A complete, ready-to-use AI prompt template. Include placeholders like [specific detail] where the user should customize.'),
      context: z.string().describe('When to use this prompt — the specific situation or trigger'),
      expectedOutput: z.string().describe('What kind of output the user should expect from this prompt'),
      variations: z.string().describe('2-3 alternative versions for different scenarios. Empty string if not applicable.'),
      tips: z.string().describe('Practical advice for getting better results. Empty string if not applicable.'),
      exampleOutput: z.string().describe('A short sample of what good output looks like. Empty string if not applicable.'),
    })
  ),
})

function buildDefaultPrompt(
  useCase: { name: string; description: string },
  context: Record<string, string>,
  sectionLabel: string,
) {
  const contextBlock = formatContext(context)
  const label = sectionLabel.toLowerCase()
  return `You are an expert AI prompt engineer who creates highly effective prompt templates.

CONTEXT:
${contextBlock}

TASK:
Generate 3-5 ready-to-use AI prompt templates for the "${useCase.name}" ${label}.

${sectionLabel.toUpperCase()} DEFINITION:
${useCase.name}: ${useCase.description}

GUIDELINES:
- Each prompt must be complete and copy-paste ready — a user should be able to use it immediately.
- Include [bracketed placeholders] where the user needs to fill in specifics.
- Prompts should leverage domain knowledge and terminology relevant to the provided context.
- The "context" field should describe the specific trigger or situation when this prompt is most useful.
- The "expectedOutput" should set realistic expectations for what the AI will produce.
- Vary the complexity — include both quick tactical prompts and deeper strategic ones.
- If this ${label} is not very relevant, still include at least 1 prompt.`
}

async function generateForUseCase(
  useCase: { name: string; description: string },
  context: Record<string, string>,
  sectionLabel: string,
  directives?: { label: string; content: string }[],
  collectedPrompts?: string[],
) {
  const prompt = directives?.length
    ? assembleDirectivesPrompt(context, useCase, sectionLabel, directives)
    : buildDefaultPrompt(useCase, context, sectionLabel)

  if (collectedPrompts) collectedPrompts.push(prompt)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt,
    output: Output.object({ schema: singleUseCaseSchema }),
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
    const useCases = sectionDrivers?.length ? sectionDrivers : PROMPT_USE_CASES
    const hasPerDriverFields = sectionDrivers?.some((s) => s.fields?.length) ?? false

    console.log(`[generate-prompts] Context keys: ${Object.keys(context).join(', ')}${sectionDrivers?.length ? ' (custom use cases)' : ''}${instructionDirectives?.length ? ` (${instructionDirectives.length} directives)` : ''}${hasPerDriverFields ? ' (per-driver fields)' : ''}`)

    const startTime = Date.now()
    const debugPrompts: string[] = isDebugMode() ? [] : undefined as any

    if (hasPerDriverFields) {
      const drivers = useCases as { name: string; description: string; fields?: { key: string; label: string; [k: string]: unknown }[] }[]
      const promises = drivers.map((uc) => {
        const fields = uc.fields
        if (fields?.length) {
          const elementSchema = buildElementSchema(fields)
          const schema = z.object({
            sectionName: z.string(),
            sectionDescription: z.string(),
            elements: z.array(elementSchema),
          })
          const prompt = (instructionDirectives?.length
            ? assembleDirectivesPrompt(context, uc, label, instructionDirectives)
            : buildDefaultPrompt(uc, context, label))
            + buildFieldOverrideBlock(fields)
          if (debugPrompts) debugPrompts.push(prompt)
          return generateText({ model: 'openai/gpt-5.2', prompt, output: Output.object({ schema }) })
            .then((r) => ({ ...(r.output as object), resolvedFields: fields }) as { sectionName: string; sectionDescription: string; elements: Record<string, string>[]; resolvedFields: typeof fields })
            .catch((err) => {
              console.error(`[generate-prompts] Error for use case ${uc.name}:`, err)
              return { sectionName: uc.name, sectionDescription: uc.description, elements: [] as Record<string, string>[], resolvedFields: fields }
            })
        }
        return generateForUseCase(uc, context, label, instructionDirectives, debugPrompts)
          .then((r) => ({
            sectionName: r.categoryName,
            sectionDescription: r.categoryDescription,
            elements: r.prompts as unknown as Record<string, string>[],
          }))
          .catch((err) => {
            console.error(`[generate-prompts] Error for use case ${uc.name}:`, err)
            return { sectionName: uc.name, sectionDescription: uc.description, elements: [] as Record<string, string>[] }
          })
      })

      const allSections = await Promise.all(promises)
      const relevant = allSections.filter((s) => s.elements.length > 0)
      console.log(`[generate-prompts] ${relevant.length}/${useCases.length} categories in ${Date.now() - startTime}ms (per-driver fields)`)
      return Response.json(withDebugMeta({ sections: relevant, _perDriverFields: true }, debugPrompts ?? []))
    }

    const promises = useCases.map((uc) =>
      generateForUseCase(uc, context, label, instructionDirectives, debugPrompts).catch((err) => {
        console.error(`[generate-prompts] Error for ${uc.name}:`, err)
        return { categoryName: uc.name, categoryDescription: uc.description, prompts: [] }
      })
    )

    const allCategories = await Promise.all(promises)
    const relevant = allCategories.filter((c) => c.prompts.length > 0)

    console.log(`[generate-prompts] ${relevant.length}/${useCases.length} categories in ${Date.now() - startTime}ms`)

    return Response.json(withDebugMeta({ categories: relevant }, debugPrompts ?? []))
  } catch (error) {
    console.error('[generate-prompts] Error:', error)
    return Response.json({ error: 'Failed to generate prompts.' }, { status: 500 })
  }
}
