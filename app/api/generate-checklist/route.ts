import { generateText, Output } from 'ai'
import { z } from 'zod'
import { CHECKLIST_DIMENSIONS } from '@/lib/checklist-dimensions'
import { assembleDirectivesPrompt, buildElementSchema, buildFieldOverrideBlock, type PromptAssemblyOptions } from '@/lib/assemble-prompt'
import { getPromptAssemblyOptionsById } from '@/lib/output-type-library'
import { BUILTIN_INSTRUCTION_DIRECTIVES } from '@/lib/output-type-directives'
import { withDebugMeta, isDebugMode } from '@/lib/ai-log-storage'

export const maxDuration = 120

const DEFAULT_LABEL = 'Dimension'

const singleDimensionSchema = z.object({
  dimensionName: z.string().describe('The checklist dimension name'),
  dimensionDescription: z.string().describe('Brief description of what this dimension covers'),
  items: z.array(
    z.object({
      item: z.string().describe('A specific, actionable checklist item'),
      description: z.string().describe('Why this item matters and how to complete it properly'),
      priority: z.string().describe('High, Medium, or Low'),
      commonMistakes: z.string().describe('What people typically get wrong on this item. Empty string if not applicable.'),
      tips: z.string().describe('Practical advice from experienced practitioners. Empty string if not applicable.'),
      verificationMethod: z.string().describe('What constitutes done — artifact or test proving completion. Empty string if not applicable.'),
    })
  ),
})

async function generateForDimension(
  dimension: { name: string; description: string },
  context: Record<string, string>,
  sectionLabel: string,
  directives: { label: string; content: string }[],
  promptOpts: PromptAssemblyOptions,
  collectedPrompts?: string[],
) {
  const prompt = assembleDirectivesPrompt(context, dimension, sectionLabel, directives, promptOpts)

  if (collectedPrompts) collectedPrompts.push(prompt)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt,
    output: Output.object({ schema: singleDimensionSchema }),
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
    const promptOpts = promptOptions ?? getPromptAssemblyOptionsById('checklist', 'item')
    const effectiveDirectives = instructionDirectives?.length ? instructionDirectives : BUILTIN_INSTRUCTION_DIRECTIVES['checklist'] ?? []
    const dimensions = sectionDrivers?.length ? sectionDrivers : CHECKLIST_DIMENSIONS
    const hasPerDriverFields = sectionDrivers?.some((s) => s.fields?.length) ?? false

    console.log(`[generate-checklist] Context keys: ${Object.keys(context).join(', ')}${sectionDrivers?.length ? ' (custom dimensions)' : ''}${instructionDirectives?.length ? ` (${instructionDirectives.length} directives)` : ''}${hasPerDriverFields ? ' (per-driver fields)' : ''}`)

    const startTime = Date.now()
    const debugPrompts: string[] = isDebugMode() ? [] : undefined as any

    if (hasPerDriverFields) {
      const drivers = dimensions as { name: string; description: string; fields?: { key: string; label: string; [k: string]: unknown }[] }[]
      const promises = drivers.map((dim) => {
        const fields = dim.fields
        if (fields?.length) {
          const elementSchema = buildElementSchema(fields)
          const schema = z.object({
            sectionName: z.string(),
            sectionDescription: z.string(),
            elements: z.array(elementSchema),
          })
          const prompt = assembleDirectivesPrompt(context, dim, label, effectiveDirectives, promptOpts)
            + buildFieldOverrideBlock(fields)
          if (debugPrompts) debugPrompts.push(prompt)
          return generateText({ model: 'openai/gpt-5.2', prompt, output: Output.object({ schema }) })
            .then((r) => ({ ...(r.output as object), resolvedFields: fields }) as { sectionName: string; sectionDescription: string; elements: Record<string, string>[]; resolvedFields: typeof fields })
            .catch((err) => {
              console.error(`[generate-checklist] Error for dimension ${dim.name}:`, err)
              return { sectionName: dim.name, sectionDescription: dim.description, elements: [] as Record<string, string>[], resolvedFields: fields }
            })
        }
        return generateForDimension(dim, context, label, effectiveDirectives, promptOpts, debugPrompts)
          .then((r) => ({
            sectionName: r.dimensionName,
            sectionDescription: r.dimensionDescription,
            elements: r.items as unknown as Record<string, string>[],
          }))
          .catch((err) => {
            console.error(`[generate-checklist] Error for dimension ${dim.name}:`, err)
            return { sectionName: dim.name, sectionDescription: dim.description, elements: [] as Record<string, string>[] }
          })
      })

      const allSections = await Promise.all(promises)
      const relevant = allSections.filter((s) => s.elements.length > 0)
      console.log(`[generate-checklist] ${relevant.length}/${dimensions.length} relevant in ${Date.now() - startTime}ms (per-driver fields)`)
      return Response.json(withDebugMeta({ sections: relevant, _perDriverFields: true }, debugPrompts ?? []))
    }

    const promises = dimensions.map((dim) =>
      generateForDimension(dim, context, label, effectiveDirectives, promptOpts, debugPrompts).catch((err) => {
        console.error(`[generate-checklist] Error for ${dim.name}:`, err)
        return { dimensionName: dim.name, dimensionDescription: dim.description, items: [] }
      })
    )

    const allDimensions = await Promise.all(promises)
    const relevant = allDimensions.filter((d) => d.items.length > 0)

    console.log(`[generate-checklist] ${relevant.length}/${dimensions.length} relevant in ${Date.now() - startTime}ms`)

    return Response.json(withDebugMeta({ dimensions: relevant }, debugPrompts ?? []))
  } catch (error) {
    console.error('[generate-checklist] Error:', error)
    return Response.json({ error: 'Failed to generate checklist.' }, { status: 500 })
  }
}
