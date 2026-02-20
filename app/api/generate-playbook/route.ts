import { generateText, Output } from 'ai'
import { z } from 'zod'
import { PLAYBOOK_PHASES } from '@/lib/playbook-phases'
import { formatContext, assembleDirectivesPrompt, buildElementSchema, buildFieldOverrideBlock } from '@/lib/assemble-prompt'
import { withDebugMeta, isDebugMode } from '@/lib/ai-log-storage'

export const maxDuration = 120

const DEFAULT_LABEL = 'Phase'

const singlePhaseSchema = z.object({
  phaseName: z.string().describe('The playbook phase name'),
  phaseDescription: z.string().describe('Brief description of what this phase covers'),
  plays: z.array(
    z.object({
      title: z.string().describe('A specific, action-oriented play title that describes what gets done'),
      objective: z.string().describe('What this play accomplishes — the specific outcome or deliverable expected upon completion'),
      instructions: z.string().describe('Concrete, step-by-step guidance someone could follow without additional research. Number the steps. Be specific about tools, methods, and sequences.'),
      decisionCriteria: z.string().describe('Key decision points within this play — when to proceed, when to pivot, and what signals to watch for. Use "If X, then Y" format where applicable.'),
      expectedOutcome: z.string().describe('What success looks like — the tangible deliverable, state, or result when this play is executed well'),
      commonPitfalls: z.string().describe('The most frequent mistakes, shortcuts that backfire, and traps that derail execution. Empty string if not applicable.'),
      tips: z.string().describe('Practical advice from experienced practitioners — insider knowledge that accelerates execution or improves quality. Empty string if not applicable.'),
      timeEstimate: z.string().describe('Realistic time range for completion (e.g., "2-4 hours", "1-2 weeks") accounting for the given context'),
    })
  ),
})

function buildDefaultPrompt(
  phase: { name: string; description: string },
  context: Record<string, string>,
  sectionLabel: string,
) {
  const contextBlock = formatContext(context)
  const label = sectionLabel.toLowerCase()
  return `You are a senior operations strategist and execution expert who creates practical, field-tested playbooks.

CONTEXT:
${contextBlock}

TASK:
Generate 3-5 actionable plays for the "${phase.name}" ${label}.

${sectionLabel.toUpperCase()} DEFINITION:
${phase.name}: ${phase.description}

GUIDELINES:
- Only generate plays if this phase is genuinely relevant to the given context. If not relevant, return an empty plays array.
- Every play must be specific to the described context — not generic process advice.
- Instructions must be step-by-step and concrete enough to follow without additional research.
- Decision criteria must describe key branching points — when to proceed, pivot, or escalate.
- Expected outcomes must describe tangible deliverables or states that indicate success.
- Include realistic time estimates that account for the specific context and constraints.
- Tailor plays to the specific context, team size, resources, and constraints provided.`
}

async function generateForPhase(
  phase: { name: string; description: string },
  context: Record<string, string>,
  sectionLabel: string,
  directives?: { label: string; content: string }[],
  collectedPrompts?: string[],
) {
  const prompt = directives?.length
    ? assembleDirectivesPrompt(context, phase, sectionLabel, directives)
    : buildDefaultPrompt(phase, context, sectionLabel)

  if (collectedPrompts) collectedPrompts.push(prompt)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt,
    output: Output.object({ schema: singlePhaseSchema }),
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
    const phases = sectionDrivers?.length ? sectionDrivers : PLAYBOOK_PHASES
    const hasPerDriverFields = sectionDrivers?.some((s) => s.fields?.length) ?? false

    console.log(`[generate-playbook] Context keys: ${Object.keys(context).join(', ')}${sectionDrivers?.length ? ' (custom phases)' : ''}${instructionDirectives?.length ? ` (${instructionDirectives.length} directives)` : ''}${hasPerDriverFields ? ' (per-driver fields)' : ''}`)

    const startTime = Date.now()
    const debugPrompts: string[] = isDebugMode() ? [] : undefined as any

    if (hasPerDriverFields) {
      const drivers = phases as { name: string; description: string; fields?: { key: string; label: string; [k: string]: unknown }[] }[]
      const promises = drivers.map((ph) => {
        const fields = ph.fields
        if (fields?.length) {
          const elementSchema = buildElementSchema(fields)
          const schema = z.object({
            sectionName: z.string(),
            sectionDescription: z.string(),
            elements: z.array(elementSchema),
          })
          const prompt = (instructionDirectives?.length
            ? assembleDirectivesPrompt(context, ph, label, instructionDirectives)
            : buildDefaultPrompt(ph, context, label))
            + buildFieldOverrideBlock(fields)
          if (debugPrompts) debugPrompts.push(prompt)
          return generateText({ model: 'openai/gpt-5.2', prompt, output: Output.object({ schema }) })
            .then((r) => ({ ...(r.output as object), resolvedFields: fields }) as { sectionName: string; sectionDescription: string; elements: Record<string, string>[]; resolvedFields: typeof fields })
            .catch((err) => {
              console.error(`[generate-playbook] Error for phase ${ph.name}:`, err)
              return { sectionName: ph.name, sectionDescription: ph.description, elements: [] as Record<string, string>[], resolvedFields: fields }
            })
        }
        return generateForPhase(ph, context, label, instructionDirectives, debugPrompts)
          .then((r) => ({
            sectionName: r.phaseName,
            sectionDescription: r.phaseDescription,
            elements: r.plays as unknown as Record<string, string>[],
          }))
          .catch((err) => {
            console.error(`[generate-playbook] Error for phase ${ph.name}:`, err)
            return { sectionName: ph.name, sectionDescription: ph.description, elements: [] as Record<string, string>[] }
          })
      })

      const allSections = await Promise.all(promises)
      const relevant = allSections.filter((s) => s.elements.length > 0)
      console.log(`[generate-playbook] ${relevant.length}/${phases.length} phases in ${Date.now() - startTime}ms (per-driver fields)`)
      return Response.json(withDebugMeta({ sections: relevant, _perDriverFields: true }, debugPrompts ?? []))
    }

    const promises = phases.map((phase) =>
      generateForPhase(phase, context, label, instructionDirectives, debugPrompts).catch((err) => {
        console.error(`[generate-playbook] Error for ${phase.name}:`, err)
        return { phaseName: phase.name, phaseDescription: phase.description, plays: [] }
      })
    )

    const allPhases = await Promise.all(promises)
    const relevant = allPhases.filter((p) => p.plays.length > 0)

    console.log(`[generate-playbook] ${relevant.length}/${phases.length} phases in ${Date.now() - startTime}ms`)

    return Response.json(withDebugMeta({ phases: relevant }, debugPrompts ?? []))
  } catch (error) {
    console.error('[generate-playbook] Error:', error)
    return Response.json({ error: 'Failed to generate playbook.' }, { status: 500 })
  }
}
