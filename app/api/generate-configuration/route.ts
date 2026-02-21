import { generateText, Output } from 'ai'
import { z } from 'zod'
import { withDebugMeta, withUsageMeta } from '@/lib/ai-log-storage'

export const maxDuration = 120

const newFieldSchema = z.object({
  id: z.string().describe('A unique camelCase identifier for this new field (e.g. "budgetRange", "teamSize")'),
  name: z.string().describe('Human-readable field name'),
  description: z.string().describe('What this field captures'),
  prompt: z.string().describe('Prompt to generate suggestions. Use {{otherFieldId}} placeholders to reference other fields'),
  selectionMode: z.enum(['single', 'multi']).describe('Whether the user picks one or multiple values'),
  category: z.string().describe('Category grouping (e.g. "Core", "Context", "Audience", "Topic-Specific")'),
})

const elementFieldSchema = z.object({
  key: z.string().describe('camelCase field key (e.g. "relevance", "actionSteps")'),
  label: z.string().describe('Human-readable label shown in the UI (e.g. "Why This Matters")'),
  type: z.enum(['short-text', 'long-text']).describe('short-text for brief values, long-text for paragraphs'),
  primary: z.boolean().describe('True for the main/title field (exactly one per output), false for all others'),
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
          fields: z.array(elementFieldSchema).describe(
            'Per-driver element fields tailored to this driver\'s focus. Overrides the output-level fields for this section. ' +
            'Customize field labels and keys to match what makes sense for this specific driver/angle.'
          ),
        })
      ),
      instructionDirectives: z.array(
        z.object({
          label: z.string().describe('Directive category label. MUST include "Role", "Task", "Process", and "Verification". Additional labels: "Tone", "Format", "Depth", "Field Guidance", etc.'),
          content: z.string().describe('The full instruction content. For Role: include specific credibility markers. For Task: include a quality clause. For Process: describe how to reason through the context. For Verification: describe a self-check. For field guidance: include Good/Bad examples.'),
        })
      ),
      fields: z.array(elementFieldSchema)
        .describe('Default element fields for the output. Used as fallback when a section driver does not define its own fields.'),
    })
  ),
})

export async function POST(req: Request) {
  try {
    const { description, availableFields, availableOutputTypes } = (await req.json()) as {
      description: string
      availableFields: { id: string; name: string; description: string; category: string }[]
      availableOutputTypes: { id: string; name: string; description: string; sectionLabel?: string; elementLabel?: string; defaultFields?: { key: string; label: string; type: string }[] }[]
    }

    if (!description?.trim()) {
      return Response.json({ error: 'Description is required' }, { status: 400 })
    }

    const fieldsList = availableFields
      .map((f) => `  - "${f.id}" (${f.name}): ${f.description} [${f.category}]`)
      .join('\n')

    const outputTypesList = availableOutputTypes
      .map((ot) => {
        let line = `  - "${ot.id}" (${ot.name}): ${ot.description}${ot.sectionLabel ? ` — sections called "${ot.sectionLabel}s"` : ''}`
        if (ot.defaultFields?.length) {
          line += `\n    Default fields: ${ot.defaultFields.map((f) => `${f.key} (${f.label})`).join(', ')}`
        }
        return line
      })
      .join('\n')

    const prompt = `You are an expert product configuration architect for an AI content generation platform.

A user wants to create a configuration that generates a specific product. Based on their description, design a complete configuration.

USER'S DESCRIPTION:
"${description}"

LIBRARY FIELDS (optional shortcuts — use only when a perfect match exists):
${fieldsList}

AVAILABLE OUTPUT TYPES (use these IDs for outputs):
${outputTypesList}

HARD CONSTRAINT: The configuration must use AT MOST 5 fields total (library fields + custom fields combined). Choose only the highest-impact inputs. If you identify more than 5 needs, merge or drop the least essential ones.

═══════════════════════════════════════════════
STEP 1: IDENTIFY WHAT CONTEXT THIS IDEA NEEDS
═══════════════════════════════════════════════
Analyze the user's description and determine: "What specific pieces of context does this idea need from the user to produce great output?"

For each candidate input, apply this test: "Would the generated content be noticeably different if this value changed?" If not, drop it.

Aim for 3-5 high-impact contextual inputs. Examples:
- "Know your role: Pain points of CISO" → securityDomain, roleScope, securityMaturityLevel (3 custom fields)
- "SaaS onboarding email course" → productType, onboardingStage, targetPersona, painPoints (4 custom fields)
- "Sales battle cards for enterprise deals" → productOffering, competitor, buyerPersona, dealSize (4 custom fields)

═══════════════════════════════════════════════
STEP 2: DESIGN CONTEXT FIELDS
═══════════════════════════════════════════════
For each contextual input, **design a custom field** with a tailored prompt that captures exactly what this idea needs. Custom fields with topic-specific prompts produce much better AI suggestions than generic library fields.

For each custom field, define it in the step's "newFields" array:
  - Unique camelCase ID (e.g., "securityMaturityLevel", "dealSize", "onboardingStage")
  - A clear, specific prompt that generates highly relevant suggestions for THIS topic (use {{otherFieldId}} placeholders for dependencies)
  - Appropriate selectionMode: "single" for exclusive choices, "multi" for things like applicable frameworks
  - A descriptive category (e.g., "Topic-Specific", "Audience", "Scope")

Library field shortcut: If a library field is a *perfect* match for one of your needs — meaning the library field's prompt would produce equally relevant suggestions as a custom one — you may reference it by ID in "fieldIds" instead of creating a custom field. But this should be the exception, not the rule.

Rules:
- **When in doubt, create a custom field.** Err on the side of specificity.
- Do NOT include generic library fields like "industry" or "role" just because they exist — only use them if the idea genuinely centers on industry/role context.
- A custom "securityMaturityLevel" with a tailored prompt will always outperform a generic "industry" field.
- Custom field prompts can reference other custom fields or library fields via {{fieldId}} placeholders.

═══════════════════════════════════════════════
STEP 3: ORGANIZE INTO STEPS & OUTPUTS
═══════════════════════════════════════════════
- Group fields into 1-3 wizard steps. Put broad context first and specific/dependent context later.
- Fields have dependencies via {{fieldId}} prompt placeholders: ensure referenced fields appear in earlier steps.
- Choose the most appropriate output type(s) for what the user wants to create.

Section drivers (4-8 entries):
- Design custom drivers specific to the user's topic. Each driver represents a meaningful angle/category for the content.
- IMPORTANT: Each driver must include its own "fields" array (3-7 fields) tailored to that driver's specific focus.
  - Think about what detail fields make sense given this driver's angle. Different drivers often need different fields.
  - For example, a "Budget & ROI" driver might need fields like "Cost Implications", "ROI Metrics", "Budget Justification",
    while a "Team Dynamics" driver might need "Stakeholders Affected", "Collaboration Challenges", "Communication Strategy".
  - The first field in each driver should be the primary/title field (set primary: true).
  - Reuse the same key across drivers when the concept is truly the same, but don't force-fit — use distinct keys when the angle demands different detail sections.

Instruction directives (6-10 entries):
- These are the MOST IMPORTANT part — they directly control how the AI generates content.
- Required directive categories (include ALL of these):
  1. "Role" — A specific expert persona with credibility markers. Not just "expert" but "senior practitioner who has [concrete achievement relevant to the topic]".
     Example: { label: "Role", content: "You are a cybersecurity strategist who has designed zero-trust architectures for 50+ enterprise deployments across regulated industries including healthcare and financial services." }
  2. "Task" — What to generate and to what quality bar. Always include a quality clause that anchors expectations.
     Example: { label: "Task", content: "Generate 3-5 actionable security controls that a CISO would implement this quarter — not textbook theory they already know." }
  3. "Process" — HOW the AI should reason before generating. Forces deeper thinking and context-grounding.
     Example: { label: "Process", content: "Before generating, identify the 2-3 context constraints that most affect what controls are practical (e.g., team size, budget, regulatory requirements). Then for this focus area, find angles that go beyond standard compliance checklists." }
  4. "Verification" — A self-check the AI runs before finalizing output. Catches generic or shallow content.
     Example: { label: "Verification", content: "Before finalizing, re-read each control and ask: would this recommendation change if the organization were in a different industry or had a different team size? If not, rewrite it with more context-specific detail." }
- Additional directives for tone, depth, format, or domain-specific constraints.
- For critical fields (the ones most likely to be generic), add a directive with concrete Good/Bad examples:
  Example: { label: "Content Depth", content: "The 'implementation' field must contain step-by-step guidance with named tools and realistic timelines. Good: 'Deploy CrowdStrike Falcon on all endpoints in weeks 1-2, configure EDR policies for the manufacturing OT network in week 3, run a purple-team exercise in week 4.' Bad: 'Implement endpoint protection across the organization using appropriate tools.'" }
  This dramatically improves output quality by anchoring the specificity bar.

Default element fields (3-7 per output):
- Define fallback detail sections used when a driver doesn't specify its own fields.
- The first field should be the primary/title field (set primary: true).
- Use the output type's default fields as a starting point, but customize them for the user's specific topic.
- Use "long-text" for paragraph content and "short-text" for brief values or labels.

Configuration name: make it catchy and descriptive.

Generate a complete configuration.`

    const result = await generateText({
      model: 'openai/gpt-5.2',
      prompt,
      output: Output.object({ schema: configSchema }),
    })

    return Response.json(withUsageMeta(withDebugMeta({ configuration: result.output }, [prompt]), result.usage))
  } catch (error) {
    console.error('[generate-configuration] Error:', error)
    return Response.json(
      { error: 'Failed to generate configuration. Please try again.' },
      { status: 500 }
    )
  }
}
