import { generateText, Output } from 'ai'
import { z } from 'zod'
import { DECISION_DOMAINS } from '@/lib/decision-domains'
import { assembleDirectivesPrompt, buildElementSchema, buildFieldOverrideBlock, type PromptAssemblyOptions } from '@/lib/assemble-prompt'
import { getPromptAssemblyOptionsById } from '@/lib/output-type-library'
import { BUILTIN_INSTRUCTION_DIRECTIVES } from '@/lib/output-type-directives'
import { withDebugMeta, isDebugMode } from '@/lib/ai-log-storage'

export const maxDuration = 120

const DEFAULT_LABEL = 'Decision Domain'

const singleDomainSchema = z.object({
  domainName: z.string().describe('The decision domain name'),
  domainDescription: z.string().describe('Brief description of what this decision domain covers'),
  decisions: z.array(
    z.object({
      decision: z.string().describe('A specific decision that must be made — framed as a clear choice'),
      context: z.string().describe('Why this decision matters now — what is at stake, who is affected, and what happens if it is delayed'),
      options: z.string().describe('The realistic alternatives (2-3 minimum), including the status quo, with honest trade-offs for each'),
      criteria: z.string().describe('The factors that should guide this choice — cost, speed, risk, alignment, reversibility, stakeholder impact, etc.'),
      risks: z.string().describe('What goes wrong if you choose poorly — worst-case scenarios and failure modes. Empty string if not applicable.'),
      stakeholders: z.string().describe('Who is affected, who needs to be consulted, who has veto power. Empty string if not applicable.'),
      recommendation: z.string().describe('A synthesized recommended path given the options and criteria. Empty string if not applicable.'),
    })
  ),
})

async function generateForDomain(
  domain: { name: string; description: string },
  context: Record<string, string>,
  sectionLabel: string,
  directives: { label: string; content: string }[],
  promptOpts: PromptAssemblyOptions,
  collectedPrompts?: string[],
) {
  const prompt = assembleDirectivesPrompt(context, domain, sectionLabel, directives, promptOpts)

  if (collectedPrompts) collectedPrompts.push(prompt)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt,
    output: Output.object({ schema: singleDomainSchema }),
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
    const promptOpts = promptOptions ?? getPromptAssemblyOptionsById('decision-books', 'decision')
    const effectiveDirectives = instructionDirectives?.length ? instructionDirectives : BUILTIN_INSTRUCTION_DIRECTIVES['decision-books'] ?? []
    const domains = sectionDrivers?.length ? sectionDrivers : DECISION_DOMAINS
    const hasPerDriverFields = sectionDrivers?.some((s) => s.fields?.length) ?? false

    console.log(`[generate-decision-books] Context keys: ${Object.keys(context).join(', ')}${sectionDrivers?.length ? ' (custom domains)' : ''}${instructionDirectives?.length ? ` (${instructionDirectives.length} directives)` : ''}${hasPerDriverFields ? ' (per-driver fields)' : ''}`)

    const startTime = Date.now()
    const debugPrompts: string[] = isDebugMode() ? [] : undefined as any

    if (hasPerDriverFields) {
      const drivers = domains as { name: string; description: string; fields?: { key: string; label: string; [k: string]: unknown }[] }[]
      const promises = drivers.map((domain) => {
        const fields = domain.fields
        if (fields?.length) {
          const elementSchema = buildElementSchema(fields)
          const schema = z.object({
            sectionName: z.string(),
            sectionDescription: z.string(),
            elements: z.array(elementSchema),
          })
          const prompt = assembleDirectivesPrompt(context, domain, label, effectiveDirectives, promptOpts)
            + buildFieldOverrideBlock(fields)
          if (debugPrompts) debugPrompts.push(prompt)
          return generateText({ model: 'openai/gpt-5.2', prompt, output: Output.object({ schema }) })
            .then((r) => ({ ...(r.output as object), resolvedFields: fields }) as { sectionName: string; sectionDescription: string; elements: Record<string, string>[]; resolvedFields: typeof fields })
            .catch((err) => {
              console.error(`[generate-decision-books] Error for domain ${domain.name}:`, err)
              return { sectionName: domain.name, sectionDescription: domain.description, elements: [] as Record<string, string>[], resolvedFields: fields }
            })
        }
        return generateForDomain(domain, context, label, effectiveDirectives, promptOpts, debugPrompts)
          .then((r) => ({
            sectionName: r.domainName,
            sectionDescription: r.domainDescription,
            elements: r.decisions as unknown as Record<string, string>[],
          }))
          .catch((err) => {
            console.error(`[generate-decision-books] Error for domain ${domain.name}:`, err)
            return { sectionName: domain.name, sectionDescription: domain.description, elements: [] as Record<string, string>[] }
          })
      })

      const allSections = await Promise.all(promises)
      const relevant = allSections.filter((s) => s.elements.length > 0)
      console.log(`[generate-decision-books] ${relevant.length}/${domains.length} domains in ${Date.now() - startTime}ms (per-driver fields)`)
      return Response.json(withDebugMeta({ sections: relevant, _perDriverFields: true }, debugPrompts ?? []))
    }

    const promises = domains.map((domain) =>
      generateForDomain(domain, context, label, effectiveDirectives, promptOpts, debugPrompts).catch((err) => {
        console.error(`[generate-decision-books] Error for ${domain.name}:`, err)
        return { domainName: domain.name, domainDescription: domain.description, decisions: [] }
      })
    )

    const allDomains = await Promise.all(promises)
    const relevant = allDomains.filter((d) => d.decisions.length > 0)

    console.log(`[generate-decision-books] ${relevant.length}/${domains.length} domains in ${Date.now() - startTime}ms`)

    return Response.json(withDebugMeta({ domains: relevant }, debugPrompts ?? []))
  } catch (error) {
    console.error('[generate-decision-books] Error:', error)
    return Response.json({ error: 'Failed to generate decision book.' }, { status: 500 })
  }
}
