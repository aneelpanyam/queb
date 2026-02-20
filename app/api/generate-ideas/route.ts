import { generateText, Output } from 'ai'
import { z } from 'zod'
import { FRAMEWORK_DEFINITIONS } from '@/lib/idea-types'
import type { IdeaFramework } from '@/lib/idea-types'
import { withDebugMeta } from '@/lib/ai-log-storage'

export const maxDuration = 120

const ideaSchema = z.object({
  ideas: z.array(
    z.object({
      title: z.string().describe('Short, catchy product title'),
      frameworkFields: z
        .array(z.object({
          key: z.string().describe('The framework field key (e.g. "problem", "targetAudience")'),
          value: z.string().describe('The value for this field'),
        }))
        .describe('Array of key-value pairs matching the framework fields'),
      suggestedOutputTypes: z
        .array(z.string())
        .describe('Suggested output type IDs (e.g. "questions", "checklist", "email-course", "prompts", "battle-cards")'),
    })
  ),
})

export async function POST(req: Request) {
  try {
    const { topic, framework, count = 5, existingIdeas = [] } = (await req.json()) as {
      topic: string
      framework: IdeaFramework
      count?: number
      existingIdeas?: string[]
    }

    if (!topic?.trim()) {
      return Response.json({ error: 'Topic is required' }, { status: 400 })
    }

    const fw = FRAMEWORK_DEFINITIONS.find((f) => f.id === framework)
    if (!fw) {
      return Response.json({ error: 'Invalid framework' }, { status: 400 })
    }

    const fieldsDescription = fw.fields
      .map((f) => `  - "${f.key}" (${f.label}): ${f.placeholder}`)
      .join('\n')

    const existingList = existingIdeas.length > 0
      ? `\nEXISTING IDEAS TO AVOID DUPLICATING:\n${existingIdeas.map((t) => `  - ${t}`).join('\n')}\n`
      : ''

    const prompt = `You are an expert digital product strategist and idea generator.

Generate ${count} unique digital product ideas related to the topic below. Each idea should be a concept for a digital information product (question books, checklists, email courses, prompt packs, battle cards, or similar).

TOPIC: "${topic}"

FRAMEWORK: ${fw.name}
${fw.description}

For each idea, fill in these framework fields:
${fieldsDescription}

AVAILABLE OUTPUT TYPES:
  - "questions" (Question Book): Multi-perspective questions with thinking frameworks
  - "checklist" (Checklist): Actionable checklists organized by category
  - "email-course" (Email Course): Multi-part email sequences for education
  - "prompts" (Prompt Pack): Curated AI prompt templates for specific tasks
  - "battle-cards" (Battle Cards): Competitive intelligence cards
${existingList}
RULES:
1. Each idea must be specific and actionable — not vague or generic.
2. Ideas should be diverse — cover different angles, audiences, or niches within the topic.
3. Titles should be catchy and marketable (think "book titles").
4. Framework fields should contain substantive content, not one-word answers.
5. Suggest 1-3 output types that best fit each idea.
6. Focus on ideas that solve real problems for real professional audiences.
7. Avoid duplicating any existing ideas listed above.

Generate ${count} ideas.`

    const result = await generateText({
      model: 'openai/gpt-5.2',
      prompt,
      output: Output.object({ schema: ideaSchema }),
    })

    const output = result.output as { ideas: { title: string; frameworkFields: { key: string; value: string }[]; suggestedOutputTypes: string[] }[] }
    const ideas = output.ideas.map((idea) => ({
      title: idea.title,
      frameworkData: Object.fromEntries(idea.frameworkFields.map((f) => [f.key, f.value])),
      suggestedOutputTypes: idea.suggestedOutputTypes,
    }))
    return Response.json(withDebugMeta({ ideas }, [prompt]))
  } catch (error) {
    console.error('[generate-ideas] Error:', error)
    return Response.json(
      { error: 'Failed to generate ideas. Please try again.' },
      { status: 500 }
    )
  }
}
