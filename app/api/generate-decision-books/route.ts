import { generateText, Output } from 'ai'
import { z } from 'zod'
import { DECISION_DOMAINS } from '@/lib/decision-domains'
import { formatContext, assembleDirectivesPrompt, buildElementSchema, buildFieldOverrideBlock } from '@/lib/assemble-prompt'
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

function buildDefaultPrompt(
  domain: { name: string; description: string },
  context: Record<string, string>,
  sectionLabel: string,
) {
  const contextBlock = formatContext(context)
  const label = sectionLabel.toLowerCase()
  return `You are a senior decision strategist and organizational advisor who helps leaders navigate complex choices.

CONTEXT:
${contextBlock}

TASK:
Generate 3-5 key decisions that must be made within the "${domain.name}" ${label}.

${sectionLabel.toUpperCase()} DEFINITION:
${domain.name}: ${domain.description}

GUIDELINES:
- Only generate decisions if this domain is genuinely relevant to the given context. If not relevant, return an empty decisions array.
- Every decision must be specific to the described context — not a generic management question.
- Actively incorporate all context provided to make decisions sharper and more grounded.
- The "context" field must explain what is at stake — why this decision matters now, what happens if delayed.
- The "options" field must present realistic alternatives (at least 2-3), including the status quo, with honest trade-offs.
- The "criteria" field must specify what factors should guide the choice — be specific to this decision.
- Surface decisions that are genuinely difficult — where reasonable people could disagree.
- Tailor decisions to the specific context, constraints, and authority level.`
}

async function generateForDomain(
  domain: { name: string; description: string },
  context: Record<string, string>,
  sectionLabel: string,
  directives?: { label: string; content: string }[],
  collectedPrompts?: string[],
) {
  const prompt = directives?.length
    ? assembleDirectivesPrompt(context, domain, sectionLabel, directives)
    : buildDefaultPrompt(domain, context, sectionLabel)

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
    const { context, sectionDrivers, instructionDirectives, sectionLabel } = (await req.json()) as {
      context: Record<string, string>
      sectionDrivers?: { name: string; description: string; fields?: { key: string; label: string; [k: string]: unknown }[] }[]
      instructionDirectives?: { label: string; content: string }[]
      sectionLabel?: string
    }

    const label = sectionLabel || DEFAULT_LABEL
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
          const prompt = (instructionDirectives?.length
            ? assembleDirectivesPrompt(context, domain, label, instructionDirectives)
            : buildDefaultPrompt(domain, context, label))
            + buildFieldOverrideBlock(fields)
          if (debugPrompts) debugPrompts.push(prompt)
          return generateText({ model: 'openai/gpt-5.2', prompt, output: Output.object({ schema }) })
            .then((r) => ({ ...(r.output as object), resolvedFields: fields }) as { sectionName: string; sectionDescription: string; elements: Record<string, string>[]; resolvedFields: typeof fields })
            .catch((err) => {
              console.error(`[generate-decision-books] Error for domain ${domain.name}:`, err)
              return { sectionName: domain.name, sectionDescription: domain.description, elements: [] as Record<string, string>[], resolvedFields: fields }
            })
        }
        return generateForDomain(domain, context, label, instructionDirectives, debugPrompts)
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
      generateForDomain(domain, context, label, instructionDirectives, debugPrompts).catch((err) => {
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
