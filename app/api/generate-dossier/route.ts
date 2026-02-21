import { generateText, Output } from 'ai'
import { z } from 'zod'
import { DOSSIER_SECTIONS } from '@/lib/dossier-sections'
import { assembleDirectivesPrompt, buildElementSchema, buildFieldOverrideBlock, type PromptAssemblyOptions } from '@/lib/assemble-prompt'
import { getPromptAssemblyOptionsById } from '@/lib/output-type-library'
import { BUILTIN_INSTRUCTION_DIRECTIVES } from '@/lib/output-type-directives'
import { withDebugMeta, isDebugMode } from '@/lib/ai-log-storage'

export const maxDuration = 120

const DEFAULT_LABEL = 'Intelligence Area'

const singleSectionSchema = z.object({
  sectionName: z.string().describe('The intelligence area name'),
  sectionDescription: z.string().describe('Brief description of what this intelligence area covers'),
  briefings: z.array(
    z.object({
      title: z.string().describe('A specific, descriptive briefing title that captures the core intelligence finding'),
      summary: z.string().describe('Executive summary in 2-3 sentences — the key takeaway a busy decision-maker needs'),
      keyFindings: z.string().describe('Specific, concrete findings backed by observable signals, data points, or patterns — not vague generalizations'),
      strategicImplications: z.string().describe('What these findings mean for the reader — how should they change their thinking, strategy, or actions?'),
      evidence: z.string().describe('Types of evidence, data sources, reports, or observable signals that support the findings. Be specific about what to look for.'),
      riskAssessment: z.string().describe('Threats or vulnerabilities this area reveals — what could go wrong and what is the likelihood. Empty string if not applicable.'),
      opportunities: z.string().describe('Openings, advantages, or leverage points this intelligence reveals. Empty string if not applicable.'),
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
    const sections = sectionDrivers?.length ? sectionDrivers : DOSSIER_SECTIONS
    const promptOpts = promptOptions ?? getPromptAssemblyOptionsById('dossier', 'briefing')
    const effectiveDirectives = instructionDirectives?.length ? instructionDirectives : BUILTIN_INSTRUCTION_DIRECTIVES['dossier'] ?? []
    const hasPerDriverFields = sectionDrivers?.some((s) => s.fields?.length) ?? false

    console.log(`[generate-dossier] Context keys: ${Object.keys(context).join(', ')}${sectionDrivers?.length ? ' (custom sections)' : ''}${instructionDirectives?.length ? ` (${instructionDirectives.length} directives)` : ''}${hasPerDriverFields ? ' (per-driver fields)' : ''}`)

    const startTime = Date.now()
    const debugPrompts: string[] = isDebugMode() ? [] : undefined as any

    if (hasPerDriverFields) {
      const drivers = sections as { name: string; description: string; fields?: { key: string; label: string; [k: string]: unknown }[] }[]
      const promises = drivers.map((sec) => {
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
              console.error(`[generate-dossier] Error for section ${sec.name}:`, err)
              return { sectionName: sec.name, sectionDescription: sec.description, elements: [] as Record<string, string>[], resolvedFields: fields }
            })
        }
        return generateForSection(sec, context, label, effectiveDirectives, promptOpts, debugPrompts)
          .then((r) => ({
            sectionName: r.sectionName,
            sectionDescription: r.sectionDescription,
            elements: r.briefings as unknown as Record<string, string>[],
          }))
          .catch((err) => {
            console.error(`[generate-dossier] Error for section ${sec.name}:`, err)
            return { sectionName: sec.name, sectionDescription: sec.description, elements: [] as Record<string, string>[] }
          })
      })

      const allSections = await Promise.all(promises)
      const relevant = allSections.filter((s) => s.elements.length > 0)
      console.log(`[generate-dossier] ${relevant.length}/${sections.length} sections in ${Date.now() - startTime}ms (per-driver fields)`)
      return Response.json(withDebugMeta({ sections: relevant, _perDriverFields: true }, debugPrompts ?? []))
    }

    const promises = sections.map((section) =>
      generateForSection(section, context, label, effectiveDirectives, promptOpts, debugPrompts).catch((err) => {
        console.error(`[generate-dossier] Error for ${section.name}:`, err)
        return { sectionName: section.name, sectionDescription: section.description, briefings: [] }
      })
    )

    const allSections = await Promise.all(promises)
    const relevant = allSections.filter((s) => s.briefings.length > 0)

    console.log(`[generate-dossier] ${relevant.length}/${sections.length} sections in ${Date.now() - startTime}ms`)

    return Response.json(withDebugMeta({ sections: relevant }, debugPrompts ?? []))
  } catch (error) {
    console.error('[generate-dossier] Error:', error)
    return Response.json({ error: 'Failed to generate dossier.' }, { status: 500 })
  }
}
