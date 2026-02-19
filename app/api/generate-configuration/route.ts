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

═══════════════════════════════════════════════
STEP 1: IDENTIFY WHAT CONTEXT THIS IDEA NEEDS
═══════════════════════════════════════════════
Before picking any fields, analyze the user's description and ask: "What specific pieces of context does this idea need from the user to produce great output?"

For example:
- "Know your role: Pain points of CISO" → needs: which industry, what the CISO's specific role scope is, maybe the organization's security maturity level, relevant compliance frameworks
- "SaaS onboarding email course" → needs: which industry, the SaaS product/service, who the target audience is, what onboarding stage to focus on, product complexity level
- "Sales battle cards for enterprise deals" → needs: industry, the service/product being sold, who the competitor is, deal size range, buyer persona

List out 3-7 contextual inputs that would meaningfully shape the output quality. Each input should answer: "Would the generated content be noticeably different if this value changed?"

═══════════════════════════════════════════════
STEP 2: MATCH NEEDS TO LIBRARY FIELDS
═══════════════════════════════════════════════
For each contextual input identified above, check if an existing library field captures it well enough. Only use a library field if it's a genuine match — don't force-fit.

Rules:
- Do NOT include library fields just because they exist. A typical configuration uses 3-6 fields total.
- Skip fields that won't meaningfully change the generated output for this specific idea.
- If "industry" isn't relevant to the idea (e.g., a generic personal productivity topic), don't include it.

═══════════════════════════════════════════════
STEP 3: CREATE AD-HOC FIELDS FOR GAPS
═══════════════════════════════════════════════
For each contextual input that has no good library match, define a NEW AD-HOC FIELD in the "newFields" array:
- Give it a unique camelCase ID (e.g., "securityMaturityLevel", "dealSize", "onboardingStage")
- Write a clear prompt that generates relevant suggestions (use {{otherFieldId}} to reference fields the user fills earlier)
- Set the right selectionMode: "single" for choices like maturity level, "multi" for things like applicable frameworks
- Assign a descriptive category (e.g., "Topic-Specific", "Audience", "Scope")

Ad-hoc fields make the configuration laser-focused on the user's specific topic instead of relying only on generic fields.

═══════════════════════════════════════════════
STEP 4: ORGANIZE INTO STEPS & OUTPUTS
═══════════════════════════════════════════════
- Group fields into logical wizard steps. Put broad context first (industry, service) and specific/dependent context later.
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
