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

    const prompt = `You are an expert product configuration architect for an AI-powered digital product creation platform.

═══════════════════════════════════════════════
GOAL
═══════════════════════════════════════════════
Design a reusable configuration blueprint that acts as a mold or factory for generating high-quality digital information products. When a user runs this configuration with different context inputs (role, industry, situation, etc.), it should produce meaningfully different products each time — not just surface-level word substitutions, but structurally different content that reflects the unique constraints and opportunities of each context.

The configuration you design is NOT a single product. It is a production system — a blueprint that generates many different products, each tailored to whoever runs it. Think of it as designing a cookie cutter, not baking a single cookie.

USER'S DESCRIPTION:
"${description}"

LIBRARY FIELDS (optional shortcuts — use only when a perfect match exists):
${fieldsList}

AVAILABLE OUTPUT TYPES (use these IDs for outputs):
${outputTypesList}

═══════════════════════════════════════════════
PHILOSOPHY — WHAT MAKES A GREAT CONFIGURATION
═══════════════════════════════════════════════
A great configuration has five properties. Internalize these before you begin designing:

1. REUSABILITY OVER SPECIFICITY — The configuration must produce meaningfully different products for different inputs. If running it with "CISO" vs. "VP Engineering" vs. "Product Manager" yields nearly identical content, the configuration is too narrow. The variable parts (input fields) must be the load-bearing walls.

2. SECTION DRIVERS ARE THE ANALYTICAL LENS — They determine what angles, perspectives, or categories the generated product explores. Generic drivers ("Overview", "Best Practices", "Implementation") produce generic products. Great drivers surface non-obvious angles specific to the topic — the kind of perspectives that make the reader say "I hadn't thought about it that way."

3. INSTRUCTION DIRECTIVES ARE THE QUALITY ENGINE — This is the single most important part of a configuration. Directives are the rules the downstream AI follows when generating content for each section. Weak directives ("be specific", "be actionable") produce weak content. Strong directives include a credible persona, a quality clause, a reasoning process, and a self-check — they force the AI to think deeply rather than produce surface-level output.

4. INPUT FIELDS ARE CONTEXTUAL HANDLES — Each field must be a lever that visibly changes the output. Apply this test to every field: "If I changed this field's value, would the generated content be noticeably different?" If not, the field is decorative — drop it. Fewer high-impact fields (3-5) beat many low-impact fields.

5. ELEMENT FIELDS ARE THE INFORMATION SCHEMA — They define what detail each generated element captures. Different analytical angles (section drivers) often need different detail fields. A "Budget & ROI" driver needs fields like "Cost Implications" and "ROI Metrics"; a "Team Dynamics" driver needs "Stakeholders Affected" and "Communication Strategy". Resist the temptation to use identical fields for every driver when the angles demand different detail.

═══════════════════════════════════════════════
THINKING FRAMEWORK — CONFIGURATION DESIGN PROCESS
═══════════════════════════════════════════════
Follow these steps in order. Each step builds on the previous one.

STEP 1 — UNDERSTAND THE DOMAIN
What is the user trying to create? What audience does it serve? What makes this topic rich enough for a reusable template? Identify the core value proposition: what will people who run this configuration walk away with? If you cannot articulate why someone would run this configuration, the concept is not strong enough.

STEP 2 — IDENTIFY THE VARIABLE DIMENSIONS
What context inputs would cause the generated product to be meaningfully different? These become the configuration's input fields. Aim for 3-5 high-impact inputs. For each candidate, apply the lever test: "Would the content be noticeably different if this value changed?"

HARD CONSTRAINT: AT MOST 5 fields total (library fields + custom fields combined). If you identify more than 5 needs, merge or drop the least essential ones.

For each field, design a custom field with a topic-specific prompt that generates highly relevant suggestions for THIS configuration. Custom fields with tailored prompts vastly outperform generic library fields.
  - Unique camelCase ID (e.g., "securityMaturityLevel", "dealSize", "onboardingStage")
  - A prompt that generates relevant suggestions — use {{otherFieldId}} placeholders for dependencies
  - Appropriate selectionMode: "single" for exclusive choices, "multi" for things like applicable frameworks
  - A descriptive category (e.g., "Topic-Specific", "Audience", "Scope")

Library field shortcut: If a library field is a *perfect* match — meaning its prompt would produce equally relevant suggestions as a custom one — reference it by ID in "fieldIds". This should be the exception.

Rules:
- When in doubt, create a custom field. Err on the side of specificity.
- Do NOT include generic library fields like "industry" or "role" just because they exist.
- Custom field prompts can reference other fields via {{fieldId}} placeholders.

STEP 3 — DESIGN THE ANALYTICAL LENS (Section Drivers)
What angles, perspectives, or categories create the most value when applied to this topic? Design 4-8 custom section drivers. Each represents a meaningful analytical dimension.

Each driver must include its own "fields" array (3-7 fields) tailored to that driver's focus:
  - Think about what detail fields make sense given this driver's angle.
  - The first field should be the primary/title field (set primary: true).
  - Reuse the same key across drivers when the concept is truly the same, but use distinct keys when the angle demands different detail.

STEP 4 — CRAFT THE QUALITY ENGINE (Instruction Directives)
Design 6-10 instruction directives. These directly control downstream content generation quality.

Required directive categories (include ALL of these):
  1. "Role" — A specific expert persona with credibility markers. Not just "expert" but a senior practitioner with concrete, verifiable accomplishments relevant to the topic.
  2. "Task" — What to generate and to what quality bar. Always include a quality clause that anchors expectations beyond the obvious.
  3. "Process" — HOW the AI should reason before generating. Forces deeper thinking and context-grounding. Describe the analytical steps.
  4. "Verification" — A self-check the AI runs before finalizing output. Catches generic or shallow content by testing against the provided context.

Additional directives for tone, depth, format, or domain-specific constraints. For critical fields (the ones most likely to be generic), add a "Field Guidance" directive with concrete Good/Bad examples to anchor the specificity bar.

STEP 5 — DEFINE THE INFORMATION SCHEMA (Element Fields)
Define default element fields (3-7 per output) used when a driver does not define its own. The first field should be primary (set primary: true). Customize them for the topic — do not just copy the output type's defaults. Use "long-text" for paragraph content and "short-text" for brief values.

STEP 6 — ORGANIZE & STRESS-TEST
- Group fields into 1-3 wizard steps. Broad context first, specific/dependent context later.
- Fields have dependencies via {{fieldId}} placeholders: referenced fields must appear in earlier steps.
- Choose the most appropriate output type for what the user wants to create.
- Configuration name: catchy and descriptive of the reusable template concept.
- Apply the Quality Bar below to the complete configuration.

═══════════════════════════════════════════════
ANATOMY OF A GREAT CONFIGURATION — REFERENCE
═══════════════════════════════════════════════
Use these annotated examples as a quality reference when designing each component.

INPUT FIELDS:
  Good: { id: "incidentType", prompt: "Suggest types of cybersecurity incidents that a {{orgProfile}} might face, considering their {{industryVertical}} regulatory environment and threat landscape", selectionMode: "single" }
  — Topic-specific, references other fields, generates suggestions tailored to the configuration's domain.
  Bad: Using the generic library "industry" field for a configuration about cybersecurity incident response — the suggestions would be too broad ("Healthcare", "Finance") when you need incident-type-specific context.

SECTION DRIVERS:
  Good: { name: "Regulatory & Compliance Exposure", description: "Analyze how this incident type triggers mandatory reporting obligations, regulatory scrutiny timelines, and compliance evidence requirements specific to the organization's jurisdiction and industry" }
  — Non-obvious angle, specific to the topic, forces the AI to think about a dimension the user might miss.
  Bad: { name: "Overview", description: "General overview of the topic" }
  — Generic label that produces generic content for any topic. No analytical depth.

INSTRUCTION DIRECTIVES:
  Good Role: "You are a crisis communications director who has led incident response communications for 30+ data breaches across healthcare, financial services, and government organizations, including three incidents that made national news."
  — Specific credibility markers, concrete achievements, domain-relevant experience.
  Bad Role: "You are an expert in cybersecurity."
  — No specificity, no credibility markers, produces generic output.

  Good Field Guidance: "The 'stakeholderMessage' field must contain a ready-to-send communication draft with specific talking points. Good: 'Dear [Board Chair], at 14:32 UTC today, our SOC detected unauthorized lateral movement from a compromised service account in the payments processing subnet. We have isolated the affected segment, engaged CrowdStrike IR, and notified outside counsel at [firm]. No customer PII has left the network based on current forensics. Next board update: 6 hours.' Bad: 'We detected a security incident and are taking appropriate steps to investigate and remediate.'"
  — Concrete Good/Bad examples anchor the specificity bar for the downstream AI.

PER-DRIVER ELEMENT FIELDS:
  Good: A "Legal & Regulatory" driver uses fields like "regulatoryDeadline" (short-text), "reportingObligation" (long-text), "evidencePreservation" (long-text) — tailored to the legal angle.
  A "Technical Containment" driver uses fields like "containmentAction" (short-text), "forensicSteps" (long-text), "toolsRequired" (short-text) — tailored to the technical angle.
  — Different drivers, different fields, each matched to the analytical lens.
  Bad: Every driver uses the same generic fields ("description", "actions", "notes") regardless of angle.

═══════════════════════════════════════════════
QUALITY BAR
═══════════════════════════════════════════════
Check the complete configuration against ALL of these before output:

□ Reusability — Could this configuration be run with 5+ different context inputs (different roles, industries, situations) and produce meaningfully different products each time? If it only works for one specific scenario, it is too narrow.
□ Driver specificity — Does each section driver surface a non-obvious analytical angle specific to the topic? Would removing any driver make the product noticeably less valuable? If a driver could apply to any topic unchanged, replace it.
□ Directive depth — Does the Role directive include specific credibility markers? Does the Task directive include a quality clause? Does the Process directive describe analytical reasoning steps? Does the Verification directive describe a concrete self-check? If any of these are weak, strengthen them.
□ Field schema fit — Do drivers with different analytical angles have different element fields where the angle demands it? If all drivers share identical fields, check whether that is genuinely correct or just laziness.
□ Input field impact — For each input field, would changing its value noticeably change the generated content? If not, drop the field.
□ Directive-driver coherence — Do the directives and drivers work together? The directives should guide the AI to produce excellent content FOR the specific angles the drivers explore.
□ Field guidance anchoring — Does at least one directive include concrete Good/Bad examples for the fields most at risk of being generic?

═══════════════════════════════════════════════
ANTI-PATTERNS
═══════════════════════════════════════════════
If you catch yourself doing any of these, stop and rewrite:

✗ Generic section drivers — Drivers named "Overview", "Best Practices", "Key Considerations", or "Implementation" that could apply to any topic. Every driver name should be specific enough that you can tell what configuration it belongs to.
✗ Weak Role directive — "You are an expert in [topic]" with no credibility markers. Always include concrete achievements, years of experience in specific sub-domains, or named types of engagements.
✗ Missing Verification directive — Every configuration must include a Verification directive with a concrete self-check test.
✗ Directives that say "be specific" without defining what specific means — Always anchor specificity with Good/Bad examples or concrete criteria.
✗ Identical element fields across all drivers — If every driver has the same fields, you probably have not thought hard enough about what detail each angle uniquely needs. Check whether different drivers genuinely need different information schemas.
✗ Decorative input fields — Fields that do not change the output are wasted user effort. Every field must be a load-bearing lever.
✗ Copying output type defaults without customization — Default fields are a starting point. Customize labels, add topic-specific fields, and remove irrelevant ones.
✗ One-sentence driver descriptions — Each driver description should be specific enough to guide the downstream AI toward non-obvious angles. "Covers the financial aspects" is too vague; describe WHAT financial aspects and WHY they matter for this topic.

Generate a complete configuration.`

    const result = await generateText({
      model: 'openai/gpt-5.2',
      providerOptions: { reasoning: { effort: 'high' } },
      temperature: 0.75,
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
