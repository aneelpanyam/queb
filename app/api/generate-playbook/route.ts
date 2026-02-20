import { generateText, Output } from 'ai'
import { z } from 'zod'
import { PLAYBOOK_PHASES } from '@/lib/playbook-phases'
import { formatContext, assembleDirectivesPrompt } from '@/lib/assemble-prompt'

export const maxDuration = 120

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
) {
  const contextBlock = formatContext(context)
  return `You are a senior operations strategist and execution expert who creates practical, field-tested playbooks.

CONTEXT:
${contextBlock}

TASK:
Generate 3-5 actionable plays for the "${phase.name}" execution phase.

PHASE DEFINITION:
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
  directives?: { label: string; content: string }[],
) {
  const prompt = directives?.length
    ? assembleDirectivesPrompt(context, phase, 'Phase', directives)
    : buildDefaultPrompt(phase, context)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt,
    output: Output.object({ schema: singlePhaseSchema }),
  })

  return result.output
}

export async function POST(req: Request) {
  try {
    const { context, sectionDrivers, instructionDirectives } = (await req.json()) as {
      context: Record<string, string>
      sectionDrivers?: { name: string; description: string }[]
      instructionDirectives?: { label: string; content: string }[]
    }

    const phases = sectionDrivers?.length ? sectionDrivers : PLAYBOOK_PHASES
    console.log(`[generate-playbook] Context keys: ${Object.keys(context).join(', ')}${sectionDrivers?.length ? ' (custom phases)' : ''}${instructionDirectives?.length ? ` (${instructionDirectives.length} directives)` : ''}`)

    const startTime = Date.now()

    const promises = phases.map((phase) =>
      generateForPhase(phase, context, instructionDirectives).catch((err) => {
        console.error(`[generate-playbook] Error for ${phase.name}:`, err)
        return { phaseName: phase.name, phaseDescription: phase.description, plays: [] }
      })
    )

    const allPhases = await Promise.all(promises)
    const relevant = allPhases.filter((p) => p.plays.length > 0)

    console.log(`[generate-playbook] ${relevant.length}/${phases.length} phases in ${Date.now() - startTime}ms`)

    return Response.json({ phases: relevant })
  } catch (error) {
    console.error('[generate-playbook] Error:', error)
    return Response.json({ error: 'Failed to generate playbook.' }, { status: 500 })
  }
}
