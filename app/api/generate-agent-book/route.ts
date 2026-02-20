import { generateText, Output } from 'ai'
import { z } from 'zod'
import { AGENT_OPPORTUNITY_AREAS } from '@/lib/agent-opportunity-areas'
import { formatContext, assembleDirectivesPrompt, buildElementSchema, buildFieldOverrideBlock } from '@/lib/assemble-prompt'
import { withDebugMeta, isDebugMode } from '@/lib/ai-log-storage'

export const maxDuration = 120

const DEFAULT_LABEL = 'Opportunity Area'

const singleOpportunitySchema = z.object({
  opportunityName: z.string().describe('The workflow opportunity area name'),
  opportunityDescription: z.string().describe('Brief description of what this opportunity area covers'),
  agents: z.array(
    z.object({
      agentName: z.string().describe('A short, descriptive name for the AI agent'),
      description: z.string().describe('Clear description of what the agent does and what problem it solves'),
      howItWorks: z.string().describe('How the agent operates — trigger, steps, tools used, and output produced'),
      keyCapabilities: z.string().describe('The specific tasks this agent automates or augments, and what manual work it replaces'),
      dataAndTools: z.string().describe('Integrations, APIs, data sources, and tools the agent needs to function'),
      complexity: z.string().describe('Implementation complexity: Low, Medium, or High — with a brief justification'),
      expectedImpact: z.string().describe('Expected ROI, time saved, quality improvement, or other measurable benefit'),
      quickStart: z.string().describe('The first concrete step to build or try this agent — actionable and specific'),
    })
  ),
})

function buildDefaultPrompt(
  opportunity: { name: string; description: string },
  context: Record<string, string>,
  sectionLabel: string,
) {
  const contextBlock = formatContext(context)
  const label = sectionLabel.toLowerCase()
  return `You are an AI agent strategist who identifies high-impact opportunities to deploy AI agents across workflows.

CONTEXT:
${contextBlock}

TASK:
Generate 3-5 AI agent ideas for the "${opportunity.name}" ${label}.

${sectionLabel.toUpperCase()} DEFINITION:
${opportunity.name}: ${opportunity.description}

GUIDELINES:
- Only generate agents if this opportunity area is genuinely relevant to the given context. If not relevant, return an empty agents array.
- Each agent must be specific to the described context — not a generic AI tool suggestion.
- Agent names should be memorable and descriptive (e.g. "Lead Research Autopilot", "Deal Risk Scanner").
- Describe how each agent actually works — trigger, data flow, actions, and output.
- Be specific about what tools, APIs, and data sources the agent needs.
- Rate implementation complexity honestly: Low (off-the-shelf or simple API chain), Medium (custom logic, some integration work), High (significant engineering, custom models, or complex orchestration).
- Expected impact should be concrete and measurable where possible.
- Quick-start hints must be actionable — the first real step, not "think about it".
- Vary the complexity — include both quick-win agents and more ambitious ones.
- Tailor all agents to the specific role, industry, and workflow context provided.`
}

async function generateForOpportunity(
  opportunity: { name: string; description: string },
  context: Record<string, string>,
  sectionLabel: string,
  directives?: { label: string; content: string }[],
  collectedPrompts?: string[],
) {
  const prompt = directives?.length
    ? assembleDirectivesPrompt(context, opportunity, sectionLabel, directives)
    : buildDefaultPrompt(opportunity, context, sectionLabel)

  if (collectedPrompts) collectedPrompts.push(prompt)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt,
    output: Output.object({ schema: singleOpportunitySchema }),
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
    const opportunities = sectionDrivers?.length ? sectionDrivers : AGENT_OPPORTUNITY_AREAS
    const hasPerDriverFields = sectionDrivers?.some((s) => s.fields?.length) ?? false

    console.log(`[generate-agent-book] Context keys: ${Object.keys(context).join(', ')}${sectionDrivers?.length ? ' (custom opportunities)' : ''}${instructionDirectives?.length ? ` (${instructionDirectives.length} directives)` : ''}${hasPerDriverFields ? ' (per-driver fields)' : ''}`)

    const startTime = Date.now()
    const debugPrompts: string[] = isDebugMode() ? [] : undefined as any

    if (hasPerDriverFields) {
      const drivers = opportunities as { name: string; description: string; fields?: { key: string; label: string; [k: string]: unknown }[] }[]
      const promises = drivers.map((opp) => {
        const fields = opp.fields
        if (fields?.length) {
          const elementSchema = buildElementSchema(fields)
          const schema = z.object({
            sectionName: z.string(),
            sectionDescription: z.string(),
            elements: z.array(elementSchema),
          })
          const prompt = (instructionDirectives?.length
            ? assembleDirectivesPrompt(context, opp, label, instructionDirectives)
            : buildDefaultPrompt(opp, context, label))
            + buildFieldOverrideBlock(fields)
          if (debugPrompts) debugPrompts.push(prompt)
          return generateText({ model: 'openai/gpt-5.2', prompt, output: Output.object({ schema }) })
            .then((r) => ({ ...(r.output as object), resolvedFields: fields }) as { sectionName: string; sectionDescription: string; elements: Record<string, string>[]; resolvedFields: typeof fields })
            .catch((err) => {
              console.error(`[generate-agent-book] Error for opportunity ${opp.name}:`, err)
              return { sectionName: opp.name, sectionDescription: opp.description, elements: [] as Record<string, string>[], resolvedFields: fields }
            })
        }
        return generateForOpportunity(opp, context, label, instructionDirectives, debugPrompts)
          .then((r) => ({
            sectionName: r.opportunityName,
            sectionDescription: r.opportunityDescription,
            elements: r.agents as unknown as Record<string, string>[],
          }))
          .catch((err) => {
            console.error(`[generate-agent-book] Error for opportunity ${opp.name}:`, err)
            return { sectionName: opp.name, sectionDescription: opp.description, elements: [] as Record<string, string>[] }
          })
      })

      const allSections = await Promise.all(promises)
      const relevant = allSections.filter((s) => s.elements.length > 0)
      console.log(`[generate-agent-book] ${relevant.length}/${opportunities.length} opportunities in ${Date.now() - startTime}ms (per-driver fields)`)
      return Response.json(withDebugMeta({ sections: relevant, _perDriverFields: true }, debugPrompts ?? []))
    }

    const promises = opportunities.map((opportunity) =>
      generateForOpportunity(opportunity, context, label, instructionDirectives, debugPrompts).catch((err) => {
        console.error(`[generate-agent-book] Error for ${opportunity.name}:`, err)
        return { opportunityName: opportunity.name, opportunityDescription: opportunity.description, agents: [] }
      })
    )

    const allOpportunities = await Promise.all(promises)
    const relevant = allOpportunities.filter((o) => o.agents.length > 0)

    console.log(`[generate-agent-book] ${relevant.length}/${opportunities.length} opportunities in ${Date.now() - startTime}ms`)

    return Response.json(withDebugMeta({ opportunities: relevant }, debugPrompts ?? []))
  } catch (error) {
    console.error('[generate-agent-book] Error:', error)
    return Response.json({ error: 'Failed to generate agent book.' }, { status: 500 })
  }
}
