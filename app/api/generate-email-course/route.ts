import { generateText, Output } from 'ai'
import { z } from 'zod'
import { EMAIL_COURSE_STAGES } from '@/lib/email-course-stages'
import { assembleDirectivesPrompt, buildElementSchema, buildFieldOverrideBlock, type PromptAssemblyOptions } from '@/lib/assemble-prompt'
import { getPromptAssemblyOptionsById } from '@/lib/output-type-library'
import { BUILTIN_INSTRUCTION_DIRECTIVES } from '@/lib/output-type-directives'
import { withDebugMeta, isDebugMode } from '@/lib/ai-log-storage'

export const maxDuration = 120

const DEFAULT_LABEL = 'Module'

const singleStageSchema = z.object({
  moduleName: z.string().describe('The module/stage name'),
  moduleDescription: z.string().describe('What this module covers and what the reader will learn'),
  emails: z.array(
    z.object({
      subject: z.string().describe('A compelling email subject line'),
      body: z.string().describe('The full email body — educational, engaging, and actionable. Use paragraphs.'),
      callToAction: z.string().describe('A specific action the reader should take after reading'),
      keyTakeaway: z.string().describe('The single most important lesson — the TL;DR. Empty string if not applicable.'),
      subjectLineVariants: z.string().describe('2-3 alternative subject lines with different angles. Empty string if not applicable.'),
      sendTiming: z.string().describe('When to send this email in the sequence. Empty string if not applicable.'),
    })
  ),
})

async function generateForStage(
  stage: { name: string; description: string },
  context: Record<string, string>,
  sectionLabel: string,
  directives: { label: string; content: string }[],
  promptOpts: PromptAssemblyOptions,
  collectedPrompts?: string[],
) {
  const prompt = assembleDirectivesPrompt(context, stage, sectionLabel, directives, promptOpts)

  if (collectedPrompts) collectedPrompts.push(prompt)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt,
    output: Output.object({ schema: singleStageSchema }),
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
    const promptOpts = promptOptions ?? getPromptAssemblyOptionsById('email-course', 'email')
    const effectiveDirectives = instructionDirectives?.length ? instructionDirectives : BUILTIN_INSTRUCTION_DIRECTIVES['email-course'] ?? []
    const stages = sectionDrivers?.length ? sectionDrivers : EMAIL_COURSE_STAGES
    const hasPerDriverFields = sectionDrivers?.some((s) => s.fields?.length) ?? false

    console.log(`[generate-email-course] Context keys: ${Object.keys(context).join(', ')}${sectionDrivers?.length ? ' (custom stages)' : ''}${instructionDirectives?.length ? ` (${instructionDirectives.length} directives)` : ''}${hasPerDriverFields ? ' (per-driver fields)' : ''}`)

    const startTime = Date.now()
    const debugPrompts: string[] = isDebugMode() ? [] : undefined as any

    if (hasPerDriverFields) {
      const drivers = stages as { name: string; description: string; fields?: { key: string; label: string; [k: string]: unknown }[] }[]
      const promises = drivers.map((stage) => {
        const fields = stage.fields
        if (fields?.length) {
          const elementSchema = buildElementSchema(fields)
          const schema = z.object({
            sectionName: z.string(),
            sectionDescription: z.string(),
            elements: z.array(elementSchema),
          })
          const prompt = assembleDirectivesPrompt(context, stage, label, effectiveDirectives, promptOpts)
            + buildFieldOverrideBlock(fields)
          if (debugPrompts) debugPrompts.push(prompt)
          return generateText({ model: 'openai/gpt-5.2', prompt, output: Output.object({ schema }) })
            .then((r) => ({ ...(r.output as object), resolvedFields: fields }) as { sectionName: string; sectionDescription: string; elements: Record<string, string>[]; resolvedFields: typeof fields })
            .catch((err) => {
              console.error(`[generate-email-course] Error for stage ${stage.name}:`, err)
              return { sectionName: stage.name, sectionDescription: stage.description, elements: [] as Record<string, string>[], resolvedFields: fields }
            })
        }
        return generateForStage(stage, context, label, effectiveDirectives, promptOpts, debugPrompts)
          .then((r) => ({
            sectionName: r.moduleName,
            sectionDescription: r.moduleDescription,
            elements: r.emails as unknown as Record<string, string>[],
          }))
          .catch((err) => {
            console.error(`[generate-email-course] Error for stage ${stage.name}:`, err)
            return { sectionName: stage.name, sectionDescription: stage.description, elements: [] as Record<string, string>[] }
          })
      })

      const allSections = await Promise.all(promises)
      const relevant = allSections.filter((s) => s.elements.length > 0)
      console.log(`[generate-email-course] ${relevant.length}/${stages.length} modules in ${Date.now() - startTime}ms (per-driver fields)`)
      return Response.json(withDebugMeta({ sections: relevant, _perDriverFields: true }, debugPrompts ?? []))
    }

    const promises = stages.map((stage) =>
      generateForStage(stage, context, label, effectiveDirectives, promptOpts, debugPrompts).catch((err) => {
        console.error(`[generate-email-course] Error for ${stage.name}:`, err)
        return { moduleName: stage.name, moduleDescription: stage.description, emails: [] }
      })
    )

    const allModules = await Promise.all(promises)
    const relevant = allModules.filter((m) => m.emails.length > 0)

    console.log(`[generate-email-course] ${relevant.length}/${stages.length} modules in ${Date.now() - startTime}ms`)

    return Response.json(withDebugMeta({ modules: relevant }, debugPrompts ?? []))
  } catch (error) {
    console.error('[generate-email-course] Error:', error)
    return Response.json({ error: 'Failed to generate email course.' }, { status: 500 })
  }
}
