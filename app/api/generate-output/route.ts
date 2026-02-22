import { generateText, Output } from 'ai'
import { z } from 'zod'
import { assembleDirectivesPrompt, buildElementSchema, buildFieldOverrideBlock, type PromptAssemblyOptions } from '@/lib/assemble-prompt'
import { SEED_OUTPUT_TYPES } from '@/lib/output-type-definitions'
import { BUILTIN_INSTRUCTION_DIRECTIVES, BUILTIN_SECTION_DRIVERS } from '@/lib/output-type-directives'
import { BUILTIN_PROMPT_METADATA } from '@/lib/output-type-prompt-metadata'
import { withDebugMeta, withUsageMeta, isDebugMode } from '@/lib/ai-log-storage'

export const maxDuration = 120

type FieldDef = { key: string; label: string; [k: string]: unknown }
type DriverDef = { name: string; description: string; fields?: FieldDef[] }
type DirectiveDef = { label: string; content: string }

function resolveDefaults(outputTypeId?: string) {
  if (!outputTypeId) return {}

  const seed = SEED_OUTPUT_TYPES.find((t) => t.id === outputTypeId)
  return {
    fields: seed?.fields?.map((f) => ({ key: f.key, label: f.label })),
    sectionLabel: seed?.sectionLabel,
    elementLabel: seed?.elementLabel,
    prompt: seed?.prompt,
    sectionDrivers: seed?.defaultSectionDrivers ?? BUILTIN_SECTION_DRIVERS[outputTypeId],
    instructionDirectives: BUILTIN_INSTRUCTION_DIRECTIVES[outputTypeId],
    promptOptions: BUILTIN_PROMPT_METADATA[outputTypeId] ?? (seed ? { elementLabel: seed.elementLabel } : undefined),
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      outputTypeId,
      context,
      prompt: reqPrompt,
      fields: reqFields,
      sectionDrivers: reqDrivers,
      instructionDirectives: reqDirectives,
      sectionLabel: reqSectionLabel,
      elementLabel: reqElementLabel,
      promptOptions: reqPromptOptions,
    } = body

    const defaults = resolveDefaults(outputTypeId)

    const fields: FieldDef[] | undefined = reqFields ?? defaults.fields
    const sectionLabel = reqSectionLabel || defaults.sectionLabel || 'section'
    const elementLabel = reqElementLabel || defaults.elementLabel || 'item'
    const prompt: string | undefined = reqPrompt ?? defaults.prompt
    const drivers: DriverDef[] | undefined =
      (Array.isArray(reqDrivers) && reqDrivers.length > 0 ? reqDrivers : undefined) ?? defaults.sectionDrivers
    const directives: DirectiveDef[] | undefined =
      (Array.isArray(reqDirectives) && reqDirectives.length > 0 ? reqDirectives : undefined) ?? defaults.instructionDirectives
    const promptOpts: PromptAssemblyOptions = reqPromptOptions ?? defaults.promptOptions ?? { elementLabel }

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return Response.json({ error: 'Missing fields — provide fields or a valid outputTypeId' }, { status: 400 })
    }
    if (!context || typeof context !== 'object') {
      return Response.json({ error: 'Missing context object' }, { status: 400 })
    }

    const hasDrivers = Array.isArray(drivers) && drivers.length > 0

    if (!hasDrivers) {
      return Response.json({ error: 'No section drivers available — provide sectionDrivers or a valid outputTypeId with defaults' }, { status: 400 })
    }

    console.log(`[generate-output] outputTypeId=${outputTypeId || 'custom'}, drivers=${drivers.length}, directives=${directives?.length ?? 0}`)
    const startTime = Date.now()
    const debugPrompts: string[] | undefined = isDebugMode() ? [] : undefined

    const promises = drivers.map((driver) => {
      const driverFields = driver.fields || fields
      const elementSchema = buildElementSchema(driverFields)
      const schema = z.object({
        sectionName: z.string(),
        sectionDescription: z.string(),
        elements: z.array(elementSchema),
      })

      let driverPrompt: string
      if (directives?.length) {
        driverPrompt = assembleDirectivesPrompt(context, driver, sectionLabel, directives, promptOpts)
      } else if (prompt) {
        const contextLines = Object.entries(context as Record<string, string>)
          .filter(([, v]) => v?.trim())
          .map(([k, v]) => `- ${k}: ${v}`)
          .join('\n')
        driverPrompt = `${prompt}\n\nCONTEXT:\n${contextLines}\n\n${sectionLabel.toUpperCase()}: "${driver.name}"\n${driver.description}\n\nGenerate 3-6 ${elementLabel.toLowerCase()}s. Be specific, practical, and tailored to the context.`
      } else {
        driverPrompt = assembleDirectivesPrompt(context, driver, sectionLabel, [], promptOpts)
      }

      if (driver.fields) {
        driverPrompt += buildFieldOverrideBlock(driverFields)
      }

      if (debugPrompts) debugPrompts.push(driverPrompt)

      return generateText({ model: 'openai/gpt-5.2', providerOptions: { reasoning: { effort: "medium" }}, temperature: 0.2, prompt: driverPrompt, output: Output.object({ schema }) })
        .then((r) => {
          const out = r.output as { sectionName: string; sectionDescription: string; elements: Record<string, string>[] }
          return { ...out, resolvedFields: driver.fields ? driverFields : undefined, _partialUsage: r.usage }
        })
        .catch((err) => {
          console.error(`[generate-output] Error for ${driver.name}:`, err)
          return {
            sectionName: driver.name,
            sectionDescription: driver.description,
            elements: [] as Record<string, string>[],
            resolvedFields: driver.fields ? driverFields : undefined,
            _partialUsage: undefined,
          }
        })
    })

    const allSections = await Promise.all(promises)
    const aggregatedUsage = allSections.reduce((acc, s) => {
      const u = s._partialUsage as { inputTokens?: number; outputTokens?: number; totalTokens?: number } | undefined
      return {
        inputTokens: acc.inputTokens + (u?.inputTokens ?? 0),
        outputTokens: acc.outputTokens + (u?.outputTokens ?? 0),
        totalTokens: acc.totalTokens + (u?.totalTokens ?? 0),
      }
    }, { inputTokens: 0, outputTokens: 0, totalTokens: 0 })

    const relevant = allSections
      .filter((s) => s.elements.length > 0)
      .map(({ _partialUsage, ...rest }) => rest)

    console.log(`[generate-output] ${relevant.length}/${drivers.length} sections in ${Date.now() - startTime}ms`)

    return Response.json(withUsageMeta(withDebugMeta({ sections: relevant }, debugPrompts ?? []), aggregatedUsage))
  } catch (error) {
    console.error('[generate-output] Error:', error)
    return Response.json(
      { error: 'Failed to generate output. Please try again.' },
      { status: 500 },
    )
  }
}
