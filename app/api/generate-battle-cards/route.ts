import { generateText, Output } from 'ai'
import { z } from 'zod'
import { formatContext, assembleDirectivesPrompt } from '@/lib/assemble-prompt'

export const maxDuration = 120

const singleSectionSchema = z.object({
  sectionName: z.string().describe('The competitor or competitive theme name'),
  sectionDescription: z.string().describe('Brief description of this competitive section'),
  cards: z.array(
    z.object({
      title: z.string().describe('A clear, specific card title'),
      strengths: z.string().describe('Their key strengths and advantages'),
      weaknesses: z.string().describe('Their weaknesses, gaps, and vulnerabilities'),
      talkingPoints: z.string().describe('Your talking points, differentiators, and objection handlers'),
    })
  ),
})

function buildDefaultPrompt(
  section: { name: string; description: string },
  context: Record<string, string>,
) {
  const contextBlock = formatContext(context)
  return `You are a competitive intelligence and sales enablement expert.

CONTEXT:
${contextBlock}

TASK:
Generate 3-5 battle cards for the "${section.name}" competitive section.

SECTION DEFINITION:
${section.name}: ${section.description}

GUIDELINES:
- Only generate cards if this competitive section is genuinely relevant to the given context. If not relevant, return an empty cards array.
- Each card needs a clear title, honest strength/weakness analysis, and actionable talking points.
- Focus on intelligence that sales teams can use in real conversations.
- Include specific differentiators and objection handlers.
- Tailor everything to the specific context provided.`
}

async function generateForSection(
  section: { name: string; description: string },
  context: Record<string, string>,
  directives?: { label: string; content: string }[],
) {
  const prompt = directives?.length
    ? assembleDirectivesPrompt(context, section, 'Competitor', directives)
    : buildDefaultPrompt(section, context)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt,
    output: Output.object({ schema: singleSectionSchema }),
  })

  return result.output
}

const DEFAULT_SECTIONS = [
  { name: 'Direct Competitors', description: 'Head-to-head competitors offering similar products or services to the same target market' },
  { name: 'Indirect Competitors', description: 'Alternative solutions or substitute approaches that solve the same underlying problem differently' },
  { name: 'Emerging Threats', description: 'New entrants, disruptors, or adjacent players expanding into this space' },
  { name: 'DIY & Status Quo', description: 'The option to do nothing, build in-house, or continue with current manual processes' },
  { name: 'Positioning & Differentiation', description: 'How to position against the competitive landscape — unique value, messaging, and strategic narrative' },
] as const

export async function POST(req: Request) {
  try {
    const { context, sectionDrivers, instructionDirectives } = (await req.json()) as {
      context: Record<string, string>
      sectionDrivers?: { name: string; description: string }[]
      instructionDirectives?: { label: string; content: string }[]
    }

    const sections = sectionDrivers?.length ? sectionDrivers : DEFAULT_SECTIONS
    console.log(`[generate-battle-cards] Context keys: ${Object.keys(context).join(', ')}${sectionDrivers?.length ? ' (custom sections)' : ''}${instructionDirectives?.length ? ` (${instructionDirectives.length} directives)` : ''}`)

    const startTime = Date.now()

    const promises = sections.map((sec) =>
      generateForSection(sec, context, instructionDirectives).catch((err) => {
        console.error(`[generate-battle-cards] Error for ${sec.name}:`, err)
        return { sectionName: sec.name, sectionDescription: sec.description, cards: [] }
      })
    )

    const allSections = await Promise.all(promises)
    const relevant = allSections.filter((s) => s.cards.length > 0)

    console.log(`[generate-battle-cards] ${relevant.length}/${sections.length} sections in ${Date.now() - startTime}ms`)

    return Response.json({ sections: relevant })
  } catch (error) {
    console.error('[generate-battle-cards] Error:', error)
    return Response.json({ error: 'Failed to generate battle cards.' }, { status: 500 })
  }
}
