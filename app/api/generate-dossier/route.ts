import { generateText, Output } from 'ai'
import { z } from 'zod'
import { DOSSIER_SECTIONS } from '@/lib/dossier-sections'
import { formatContext, assembleDirectivesPrompt } from '@/lib/assemble-prompt'

export const maxDuration = 120

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

function buildDefaultPrompt(
  section: { name: string; description: string },
  context: Record<string, string>,
) {
  const contextBlock = formatContext(context)
  return `You are a senior intelligence analyst and strategic research expert who produces rigorous, evidence-based briefings.

CONTEXT:
${contextBlock}

TASK:
Generate 3-5 intelligence briefings for the "${section.name}" research area.

AREA DEFINITION:
${section.name}: ${section.description}

GUIDELINES:
- Only generate briefings if this intelligence area is genuinely relevant to the given context. If not relevant, return an empty briefings array.
- Every briefing must be specific to the described context — not a generic industry overview.
- The summary must be an executive-level takeaway in 2-3 sentences.
- Key findings must cite specific, concrete data points, signals, or patterns.
- Strategic implications must explain what this means for the reader's decisions and actions.
- Evidence must reference specific types of sources, reports, or signals to verify.
- Maintain analytical rigor — distinguish between confirmed facts, strong indicators, and speculation.
- Tailor the intelligence to the specific context and decision-making needs provided.`
}

async function generateForSection(
  section: { name: string; description: string },
  context: Record<string, string>,
  directives?: { label: string; content: string }[],
) {
  const prompt = directives?.length
    ? assembleDirectivesPrompt(context, section, 'Intelligence Area', directives)
    : buildDefaultPrompt(section, context)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt,
    output: Output.object({ schema: singleSectionSchema }),
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

    const sections = sectionDrivers?.length ? sectionDrivers : DOSSIER_SECTIONS
    console.log(`[generate-dossier] Context keys: ${Object.keys(context).join(', ')}${sectionDrivers?.length ? ' (custom sections)' : ''}${instructionDirectives?.length ? ` (${instructionDirectives.length} directives)` : ''}`)

    const startTime = Date.now()

    const promises = sections.map((section) =>
      generateForSection(section, context, instructionDirectives).catch((err) => {
        console.error(`[generate-dossier] Error for ${section.name}:`, err)
        return { sectionName: section.name, sectionDescription: section.description, briefings: [] }
      })
    )

    const allSections = await Promise.all(promises)
    const relevant = allSections.filter((s) => s.briefings.length > 0)

    console.log(`[generate-dossier] ${relevant.length}/${sections.length} sections in ${Date.now() - startTime}ms`)

    return Response.json({ sections: relevant })
  } catch (error) {
    console.error('[generate-dossier] Error:', error)
    return Response.json({ error: 'Failed to generate dossier.' }, { status: 500 })
  }
}
