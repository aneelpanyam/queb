import { generateText, Output } from 'ai'
import { z } from 'zod'
import { formatContext, assembleDirectivesPrompt, buildElementSchema, buildFieldOverrideBlock, type PromptAssemblyOptions } from '@/lib/assemble-prompt'
import { getPromptAssemblyOptionsById } from '@/lib/output-type-library'
import { withDebugMeta, isDebugMode } from '@/lib/ai-log-storage'

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const { prompt, context, sectionLabel, elementLabel, fields, sectionDrivers, instructionDirectives, promptOptions, outputTypeId } = await req.json()

    if (!prompt || !fields || !Array.isArray(fields)) {
      return Response.json({ error: 'Missing prompt or fields' }, { status: 400 })
    }

    const label = sectionLabel || 'section'
    const elLabel = elementLabel || 'item'
    const promptOpts: PromptAssemblyOptions = promptOptions ?? (outputTypeId ? getPromptAssemblyOptionsById(outputTypeId, elLabel) : { elementLabel: elLabel })

    const contextBlock = context && typeof context === 'object' && Object.keys(context).length > 0
      ? `\n\nCONTEXT:\n${formatContext(context)}`
      : ''

    const hasDrivers = Array.isArray(sectionDrivers) && sectionDrivers.length > 0
    const hasPerDriverFields = hasDrivers && sectionDrivers.some((d: { fields?: unknown[] }) => d.fields?.length)
    const hasDirectives = Array.isArray(instructionDirectives) && instructionDirectives.length > 0

    if (hasPerDriverFields) {
      const debugPrompts: string[] = isDebugMode() ? [] : undefined as any
      const startTime = Date.now()

      const promises = sectionDrivers.map((driver: { name: string; description: string; fields?: { key: string; label: string; [k: string]: unknown }[] }) => {
        const driverFields = driver.fields || fields
        const elementSchema = buildElementSchema(driverFields)
        const schema = z.object({
          sectionName: z.string(),
          sectionDescription: z.string(),
          elements: z.array(elementSchema),
        })

        const driverPrompt = (hasDirectives
          ? assembleDirectivesPrompt(context, driver, label, instructionDirectives, promptOpts)
          : `${prompt}${contextBlock}\n\n${label.toUpperCase()} DEFINITION:\n${driver.name}: ${driver.description}\nBe specific, practical, and tailored to the context provided.`)
          + buildFieldOverrideBlock(driverFields)

        if (debugPrompts) debugPrompts.push(driverPrompt)

        return generateText({ model: 'openai/gpt-5.2', prompt: driverPrompt, output: Output.object({ schema }) })
          .then((r) => ({
            ...(r.output as object),
            resolvedFields: driver.fields ? driverFields : undefined,
          }) as { sectionName: string; sectionDescription: string; elements: Record<string, string>[]; resolvedFields?: typeof driverFields })
          .catch((err) => {
            console.error(`[generate-output] Error for ${driver.name}:`, err)
            return {
              sectionName: driver.name,
              sectionDescription: driver.description,
              elements: [] as Record<string, string>[],
              resolvedFields: driver.fields ? driverFields : undefined,
            }
          })
      })

      const allSections = await Promise.all(promises)
      const relevant = allSections.filter((s) => s.elements.length > 0)

      console.log(`[generate-output] ${relevant.length}/${sectionDrivers.length} sections in ${Date.now() - startTime}ms (per-driver fields)`)

      return Response.json(withDebugMeta({ sections: relevant, _perDriverFields: true }, debugPrompts ?? []))
    }

    const fieldSchemaEntries: Record<string, z.ZodTypeAny> = {}
    for (const f of fields) {
      fieldSchemaEntries[f.key] = z.string().describe(f.label)
    }

    const elementSchema = z.object(fieldSchemaEntries)

    const sectionSchema = z.object({
      name: z.string().describe(`The ${label} name`),
      description: z.string().describe(`A brief description of this ${label}`),
      elements: z.array(elementSchema).describe(`The ${elLabel}s in this ${label}`),
    })

    const outputSchema = z.object({
      sections: z.array(sectionSchema),
    })

    const fieldSpec = fields.map((f: { key: string; label: string }) => `"${f.key}" (${f.label})`).join(', ')

    let finalPrompt: string
    if (hasDirectives) {
      const directivesList = instructionDirectives.map((d: { label: string; content: string }, i: number) => `${i + 1}. [${d.label}] ${d.content}`).join('\n')
      finalPrompt = `${prompt}${contextBlock}\n\nINSTRUCTIONS:\n${directivesList}`
      if (hasDrivers) {
        finalPrompt += `\n\nSECTION STRUCTURE:\nGenerate exactly these ${label}s (one per driver):\n${sectionDrivers.map((d: { name: string; description: string }, i: number) => `${i + 1}. "${d.name}" — ${d.description}`).join('\n')}`
      }
      finalPrompt += `\nEach ${elLabel} must have these fields: ${fieldSpec}.`
    } else {
      const driverBlock = hasDrivers
        ? `\n\nSECTION STRUCTURE:\nGenerate exactly these ${label}s (one per driver):\n${sectionDrivers.map((d: { name: string; description: string }, i: number) => `${i + 1}. "${d.name}" — ${d.description}`).join('\n')}\nEach ${label} should contain 3-6 ${elLabel}s.`
        : `\n\nOUTPUT FORMAT:\nGenerate 4-8 ${label}s, each containing 3-6 ${elLabel}s.\nEach ${label} should have a clear name and description.`
      finalPrompt = `${prompt}${contextBlock}${driverBlock}\nEach ${elLabel} must have these fields: ${fieldSpec}.\nBe specific, practical, and tailored to the context provided.`
    }

    const result = await generateText({
      model: 'openai/gpt-5.2',
      prompt: finalPrompt,
      output: Output.object({ schema: outputSchema }),
    })

    return Response.json(withDebugMeta(result.output as object, [finalPrompt]))
  } catch (error) {
    console.error('[generate-output] Error:', error)
    return Response.json(
      { error: 'Failed to generate output. Please try again.' },
      { status: 500 },
    )
  }
}
