import { generateText, Output } from 'ai'
import { z } from 'zod'
import { assembleDirectivesPrompt, buildElementSchema, buildFieldOverrideBlock, type PromptAssemblyOptions } from '@/lib/assemble-prompt'
import { getPromptAssemblyOptionsById } from '@/lib/output-type-library'
import { BUILTIN_INSTRUCTION_DIRECTIVES } from '@/lib/output-type-directives'
import { withDebugMeta, isDebugMode } from '@/lib/ai-log-storage'

export const maxDuration = 120

const DEFAULT_LABEL = 'Lens'

const singleSectionSchema = z.object({
  sectionName: z.string().describe('The lens or theme name'),
  sectionDescription: z.string().describe('Brief description of this analytical lens'),
  cards: z.array(
    z.object({
      title: z.string().describe('A clear, specific card title'),
      strengths: z.string().describe('Key strengths and advantages'),
      weaknesses: z.string().describe('Weaknesses, gaps, and vulnerabilities'),
      talkingPoints: z.string().describe('Key talking points and differentiators'),
      objectionHandling: z.string().describe('Anticipated objections with concrete responses — "When they say X, you say Y". Empty string if not applicable.'),
      winStrategy: z.string().describe('The strategic game plan or recommended response. Empty string if not applicable.'),
      pricingIntel: z.string().describe('Relevant pricing, cost, or resource implications. Empty string if not applicable.'),
    })
  ),
})

async function generateForSection(
  section: { name: string; description: string },
  context: Record<string, string>,
  sectionLabel: string,
  directives: { label: string; content: string }[],
  promptOpts: PromptAssemblyOptions,
  collectedPrompts?: string[],
) {
  const prompt = assembleDirectivesPrompt(context, section, sectionLabel, directives, promptOpts)

  if (collectedPrompts) collectedPrompts.push(prompt)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt,
    output: Output.object({ schema: singleSectionSchema }),
  })

  return result.output
}

const DEFAULT_SECTIONS = [
  { name: 'Current Landscape', description: 'The state of play today — key players, dominant approaches, and the baseline the reader operates from' },
  { name: 'Strengths & Advantages', description: 'What the reader (or their approach) does well — capabilities, differentiators, and leverage points' },
  { name: 'Weaknesses & Risks', description: 'Vulnerabilities, blind spots, and areas where the reader is exposed or under-performing' },
  { name: 'Emerging Forces', description: 'New trends, technologies, entrants, or shifts that will reshape the landscape' },
  { name: 'Strategic Response', description: 'How to respond — positioning, actions, investments, and narrative to stay ahead' },
] as const

export async function POST(req: Request) {
  try {
    const { context, sectionDrivers, instructionDirectives, sectionLabel, promptOptions } = (await req.json()) as {
      context: Record<string, string>
      sectionDrivers?: { name: string; description: string; fields?: { key: string; label: string; [k: string]: unknown }[] }[]
      instructionDirectives?: { label: string; content: string }[]
      sectionLabel?: string
      promptOptions?: PromptAssemblyOptions
    }

    const label = sectionLabel || DEFAULT_LABEL
    const promptOpts = promptOptions ?? getPromptAssemblyOptionsById('battle-cards', 'card')
    const effectiveDirectives = instructionDirectives?.length ? instructionDirectives : BUILTIN_INSTRUCTION_DIRECTIVES['battle-cards'] ?? []
    const sections = sectionDrivers?.length ? sectionDrivers : DEFAULT_SECTIONS
    const hasPerDriverFields = sectionDrivers?.some((s) => s.fields?.length) ?? false

    console.log(`[generate-battle-cards] Context keys: ${Object.keys(context).join(', ')}${sectionDrivers?.length ? ' (custom sections)' : ''}${instructionDirectives?.length ? ` (${instructionDirectives.length} directives)` : ''}${hasPerDriverFields ? ' (per-driver fields)' : ''}`)

    const startTime = Date.now()
    const debugPrompts: string[] = isDebugMode() ? [] : undefined as any

    if (hasPerDriverFields) {
      const customDrivers = sectionDrivers!
      const promises = customDrivers.map((sec) => {
        const fields = sec.fields
        if (fields?.length) {
          const elementSchema = buildElementSchema(fields)
          const schema = z.object({
            sectionName: z.string(),
            sectionDescription: z.string(),
            elements: z.array(elementSchema),
          })
          const prompt = assembleDirectivesPrompt(context, sec, label, effectiveDirectives, promptOpts)
            + buildFieldOverrideBlock(fields)
          if (debugPrompts) debugPrompts.push(prompt)
          return generateText({ model: 'openai/gpt-5.2', prompt, output: Output.object({ schema }) })
            .then((r) => ({ ...(r.output as object), resolvedFields: fields }) as { sectionName: string; sectionDescription: string; elements: Record<string, string>[]; resolvedFields: typeof fields })
            .catch((err) => {
              console.error(`[generate-battle-cards] Error for ${sec.name}:`, err)
              return { sectionName: sec.name, sectionDescription: sec.description, elements: [] as Record<string, string>[], resolvedFields: fields }
            })
        }
        return generateForSection(sec, context, label, effectiveDirectives, promptOpts, debugPrompts)
          .then((r) => ({
            sectionName: r.sectionName,
            sectionDescription: r.sectionDescription,
            elements: r.cards as unknown as Record<string, string>[],
          }))
          .catch((err) => {
            console.error(`[generate-battle-cards] Error for ${sec.name}:`, err)
            return { sectionName: sec.name, sectionDescription: sec.description, elements: [] as Record<string, string>[] }
          })
      })

      const allSections = await Promise.all(promises)
      const relevant = allSections.filter((s) => s.elements.length > 0)
      console.log(`[generate-battle-cards] ${relevant.length}/${sections.length} sections in ${Date.now() - startTime}ms (per-driver fields)`)
      return Response.json(withDebugMeta({ sections: relevant, _perDriverFields: true }, debugPrompts ?? []))
    }

    const promises = sections.map((sec) =>
      generateForSection(sec, context, label, effectiveDirectives, promptOpts, debugPrompts).catch((err) => {
        console.error(`[generate-battle-cards] Error for ${sec.name}:`, err)
        return { sectionName: sec.name, sectionDescription: sec.description, cards: [] }
      })
    )

    const allSections = await Promise.all(promises)
    const relevant = allSections.filter((s) => s.cards.length > 0)

    console.log(`[generate-battle-cards] ${relevant.length}/${sections.length} sections in ${Date.now() - startTime}ms`)

    return Response.json(withDebugMeta({ sections: relevant }, debugPrompts ?? []))
  } catch (error) {
    console.error('[generate-battle-cards] Error:', error)
    return Response.json({ error: 'Failed to generate battle cards.' }, { status: 500 })
  }
}
