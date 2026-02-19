import { generateText, Output } from 'ai'
import { z } from 'zod'

export const maxDuration = 120

const configSchema = z.object({
  name: z.string().describe('Short, catchy configuration name'),
  description: z.string().describe('One-sentence summary of what this configuration produces'),
  steps: z.array(
    z.object({
      name: z.string().describe('Step name (e.g. "Role Context", "Industry Focus")'),
      description: z.string().describe('Brief description of what this step captures'),
      fieldIds: z
        .array(z.string())
        .describe('IDs of fields to include in this step, ordered by dependency'),
    })
  ),
  outputs: z.array(
    z.object({
      outputTypeId: z.string().describe('ID of the output type'),
      sectionDrivers: z.array(
        z.object({
          name: z.string().describe('Section driver name'),
          description: z.string().describe('What this driver focuses on'),
        })
      ),
      instructionDirectives: z.array(
        z.object({
          label: z.string().describe('Short label (e.g. "Role", "Task", "Tone")'),
          content: z.string().describe('The instruction content for the AI'),
        })
      ),
    })
  ),
})

export async function POST(req: Request) {
  try {
    const { description, availableFields, availableOutputTypes } = (await req.json()) as {
      description: string
      availableFields: { id: string; name: string; description: string; category: string }[]
      availableOutputTypes: { id: string; name: string; description: string; sectionLabel?: string; elementLabel?: string }[]
    }

    if (!description?.trim()) {
      return Response.json({ error: 'Description is required' }, { status: 400 })
    }

    const fieldsList = availableFields
      .map((f) => `  - "${f.id}" (${f.name}): ${f.description} [${f.category}]`)
      .join('\n')

    const outputTypesList = availableOutputTypes
      .map((ot) => `  - "${ot.id}" (${ot.name}): ${ot.description}${ot.sectionLabel ? ` — sections called "${ot.sectionLabel}s"` : ''}`)
      .join('\n')

    const prompt = `You are an expert product configuration architect for an AI content generation platform.

A user wants to create a configuration that generates a specific product. Based on their description, design a complete configuration.

USER'S DESCRIPTION:
"${description}"

AVAILABLE FIELDS (use these IDs in your steps — fields have dependency chains, so order matters):
${fieldsList}

AVAILABLE OUTPUT TYPES (use these IDs for outputs):
${outputTypesList}

DESIGN RULES:
1. Choose fields that are relevant to the user's description. Group them into logical steps.
2. Fields have dependencies implied by their order: industry → service → role → activity → situation is the typical chain.
3. Steps should be organized logically — put prerequisite fields in earlier steps.
4. Choose the most appropriate output type(s) for what the user wants to create.
5. Design custom section drivers that are specific to the user's topic, NOT generic. Each driver should represent a meaningful category or angle for the content.
6. Design instruction directives that tell the AI exactly how to generate content for this specific topic. Typically include:
   - A "Role" directive describing who the AI should act as
   - A "Task" directive describing what to generate
   - Additional directives for tone, specificity, format, etc.
7. Section drivers should have 4-8 entries, each with a descriptive name and a 1-2 sentence description.
8. Instruction directives should have 4-8 entries covering role, task, guidelines, and constraints.
9. Make the configuration name catchy and descriptive.
10. Focus on the USER's specific topic — avoid generic content.

Generate a complete configuration.`

    const result = await generateText({
      model: 'openai/gpt-5.2',
      prompt,
      output: Output.object({ schema: configSchema }),
    })

    return Response.json({ configuration: result.output })
  } catch (error) {
    console.error('[generate-configuration] Error:', error)
    return Response.json(
      { error: 'Failed to generate configuration. Please try again.' },
      { status: 500 }
    )
  }
}
