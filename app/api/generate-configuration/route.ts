import { generateText, Output } from 'ai'
import { z } from 'zod'

export const maxDuration = 120

const newFieldSchema = z.object({
  id: z.string().describe('A unique camelCase identifier for this new field (e.g. "budgetRange", "teamSize")'),
  name: z.string().describe('Human-readable field name'),
  description: z.string().describe('What this field captures'),
  prompt: z.string().describe('Prompt to generate suggestions. Use {{otherFieldId}} placeholders to reference other fields'),
  selectionMode: z.enum(['single', 'multi']).describe('Whether the user picks one or multiple values'),
  category: z.string().describe('Category grouping (e.g. "Core", "Context", "Audience", "Topic-Specific")'),
})

const configSchema = z.object({
  name: z.string().describe('Short, catchy configuration name'),
  description: z.string().describe('One-sentence summary of what this configuration produces'),
  steps: z.array(
    z.object({
      name: z.string().describe('Step name (e.g. "Role Context", "Industry Focus")'),
      description: z.string().describe('Brief description of what this step captures'),
      fieldIds: z
        .array(z.string())
        .describe('IDs of existing library fields to include in this step, ordered by dependency'),
      newFields: z
        .array(newFieldSchema)
        .describe('Ad-hoc field definitions for fields NOT in the library that this configuration needs'),
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

AVAILABLE FIELDS in the library (you may reference these by ID):
${fieldsList}

AVAILABLE OUTPUT TYPES (use these IDs for outputs):
${outputTypesList}

HARD CONSTRAINT: The configuration must use AT MOST 5 fields total (library fields + ad-hoc fields combined). Choose only the highest-impact inputs. If you identify more than 5 needs, merge or drop the least essential ones.

═══════════════════════════════════════════════
STEP 1: IDENTIFY WHAT CONTEXT THIS IDEA NEEDS
═══════════════════════════════════════════════
Analyze the user's description and determine: "What specific pieces of context does this idea need from the user to produce great output?"

For each candidate input, apply this test: "Would the generated content be noticeably different if this value changed?" If not, drop it.

Aim for 3-5 high-impact contextual inputs. Examples:
- "Know your role: Pain points of CISO" → industry, role scope, security maturity level (3 fields)
- "SaaS onboarding email course" → industry, service, target audience, onboarding stage (4 fields)
- "Sales battle cards for enterprise deals" → service, competitor, buyer persona, deal size (4 fields)

═══════════════════════════════════════════════
STEP 2: MATCH NEEDS TO LIBRARY, FILL GAPS
═══════════════════════════════════════════════
For each contextual input identified above:
1. Check if an existing library field captures it. Only use it if it's a genuine match — don't force-fit.
2. If no library field matches, define a NEW AD-HOC FIELD in the step's "newFields" array:
   - Unique camelCase ID (e.g., "securityMaturityLevel", "dealSize", "onboardingStage")
   - A clear prompt that generates relevant suggestions (use {{otherFieldId}} placeholders for dependencies)
   - Appropriate selectionMode: "single" for exclusive choices, "multi" for things like applicable frameworks
   - A descriptive category (e.g., "Topic-Specific", "Audience", "Scope")

Rules:
- Do NOT include library fields just because they exist.
- If "industry" or "role" isn't relevant to the idea, skip them.
- Ad-hoc fields are preferred when the idea has specific, topic-level context that generic library fields can't capture well.

═══════════════════════════════════════════════
STEP 3: ORGANIZE INTO STEPS & OUTPUTS
═══════════════════════════════════════════════
- Group fields into 1-3 wizard steps. Put broad context first and specific/dependent context later.
- Fields have dependencies via {{fieldId}} prompt placeholders: ensure referenced fields appear in earlier steps.
- Choose the most appropriate output type(s) for what the user wants to create.

Section drivers (4-8 entries):
- Design custom drivers specific to the user's topic. Each driver represents a meaningful angle/category for the content.

Instruction directives (4-8 entries):
- Tell the AI exactly how to generate content for this topic. Typically include:
  - A "Role" directive: who the AI should act as (domain expert persona)
  - A "Task" directive: what to generate and to what standard
  - Directives for tone, specificity, depth, format, constraints, etc.

Configuration name: make it catchy and descriptive.

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
