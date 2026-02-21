import { generateText, Output } from 'ai'
import { z } from 'zod'
import { FRAMEWORK_DEFINITIONS, IDEATION_STRATEGIES } from '@/lib/idea-types'
import type { IdeaFramework, IdeationStrategy } from '@/lib/idea-types'
import { withDebugMeta, withUsageMeta } from '@/lib/ai-log-storage'

export const maxDuration = 120

const DEFAULT_OUTPUT_TYPES = [
  { id: 'questions', name: 'Question Book', description: 'Multi-perspective questions with thinking frameworks, checklists, and resources' },
  { id: 'checklist', name: 'Checklist', description: 'Actionable checklists organized by category with priority levels' },
  { id: 'email-course', name: 'Email Course', description: 'Multi-part email sequences for nurturing, onboarding, or education' },
  { id: 'prompts', name: 'Prompt Pack', description: 'Curated AI prompt templates for specific roles and tasks' },
  { id: 'battle-cards', name: 'Battle Cards', description: 'Structured analysis cards for competitive intel or structured comparison' },
  { id: 'decision-books', name: 'Decision Book', description: 'Structured decision guides with options, trade-offs, and decision criteria' },
  { id: 'dossier', name: 'Dossier', description: 'Comprehensive intelligence briefings with findings, implications, and evidence' },
  { id: 'playbook', name: 'Playbook', description: 'Step-by-step operational execution guides with instructions and decision criteria' },
  { id: 'cheat-sheets', name: 'Cheat Sheet', description: 'Concise quick-reference cards with definitions, examples, and shortcuts' },
  { id: 'agent-book', name: 'Agent Book', description: 'AI agent ideas organized by workflow opportunity — what to build and how' },
  { id: 'ebook', name: 'e-Book', description: 'Long-form guides organized into chapters for education and thought leadership' },
]

const ideaSchema = z.object({
  ideas: z.array(
    z.object({
      title: z.string().describe('A clear, compelling name for this configuration blueprint — describes the reusable template concept, not a single finished product'),
      frameworkFields: z
        .array(z.object({
          key: z.string().describe('The framework field key (e.g. "problem", "targetAudience")'),
          value: z.string().describe('Substantive content (2-4 sentences of real analysis) describing the reusable pattern, not a one-word answer'),
        }))
        .describe('Array of key-value pairs matching the framework fields'),
      suggestedOutputTypes: z
        .array(z.string())
        .describe('1-3 output type IDs this configuration blueprint would naturally produce'),
    })
  ),
})

export async function POST(req: Request) {
  try {
    const {
      topic,
      framework,
      strategy = 'balanced',
      count = 5,
      existingIdeas = [],
      outputTypes,
    } = (await req.json()) as {
      topic: string
      framework: IdeaFramework
      strategy?: IdeationStrategy
      count?: number
      existingIdeas?: string[]
      outputTypes?: { id: string; name: string; description: string }[]
    }

    if (!topic?.trim()) {
      return Response.json({ error: 'Topic is required' }, { status: 400 })
    }

    const fw = FRAMEWORK_DEFINITIONS.find((f) => f.id === framework)
    if (!fw) {
      return Response.json({ error: 'Invalid framework' }, { status: 400 })
    }

    const strat = IDEATION_STRATEGIES.find((s) => s.id === strategy) ?? IDEATION_STRATEGIES[0]
    const catalog = outputTypes?.length ? outputTypes : DEFAULT_OUTPUT_TYPES

    const fieldsDescription = fw.fields
      .map((f) => `  - "${f.key}" (${f.label}): ${f.placeholder}`)
      .join('\n')

    const outputTypeCatalog = catalog
      .map((ot) => `  - "${ot.id}" (${ot.name}): ${ot.description}`)
      .join('\n')

    const existingList = existingIdeas.length > 0
      ? `\nEXISTING IDEAS (do NOT duplicate these — generate entirely new concepts):\n${existingIdeas.map((t) => `  - ${t}`).join('\n')}\n`
      : ''

    const prompt = `You are an expert digital product strategist and configuration architect. Your purpose is to generate reusable product configuration blueprints — templates that can be configured with different inputs (role, industry, context) to produce many different digital information products.

CRITICAL — CONFIGURATION BLUEPRINT MINDSET:
Each idea you generate becomes a reusable configuration — a mold/factory template, NOT a single finished product. The configuration will have input fields (e.g. role, industry, situation) that the user fills in, and output types that it generates. When a user runs the configuration with different inputs, it produces different products each time.

DO NOT generate specific one-off product titles like "The Customer Success Leader's P&L Simulator" or "Procurement's Leverage Map: Battle Cards for Vendor Negotiations". These are too narrow — they describe a single instantiation, not a reusable template.

DO generate reusable configuration concepts like:
  - "Think like a role" — configure for any role to explore their thinking process and decision-making process
  - "Prompts that role would use" — configure for any role to create the prompts they would use to get the best output
  - "Prepare for role" — configure for any role to create the preparation they would need to do to be successful in their role
  - "Questions a role would ask" — configure for any role to create the questions they would ask to get the best output
  - "Email courses for role" — configure for any role to create the email courses they would use to get the best output
  - "Learn about a topic for a role" — configure for any role to create e-books that they could use to know about the topic. e.g. we could use this create a digital product "Agent AI for SDRs"
  - "Cyber IR Comms Playbooks for an Org Profile" — configure for any incident type or org profile to create playbooks for how to communicate with the media and public about a cyber incident
  - "Know your customer" — configure for any role to explore their customer's needs and pain points
  - "Role Financial Intelligence Framework" — configure for any role to explore their P&L, budget decisions, and financial trade-offs
  - "Stakeholder Relationship Navigator" — configure for any role/context to map key relationships and generate interaction strategies
  - "Decision Landscape Explorer" — configure for any domain to surface the hardest decisions, their trade-offs, and decision criteria

Think of each idea as a FACTORY that produces products, not as a product itself. The title names the factory. The framework fields describe what the factory does and what dimensions it explores.

TOPIC: "${topic}"

IDEATION STRATEGY: ${strat.name}
${strat.description}

GENERATION PROCESS (follow these steps, but remember every output should be a reusable configuration blueprint, not a specific product):
${strat.processSteps.join('\n')}

PRESENTATION FRAMEWORK: ${fw.name}
${fw.description}

Existing ideas: ${existingList}


For each idea, fill in these framework fields with substantive content (2-4 sentences each, not one-word answers). Describe the reusable pattern — what the configuration explores, what dimensions it covers, what kinds of inputs it takes, and what value it delivers across different contexts:
${fieldsDescription}

AVAILABLE OUTPUT TYPES (suggest 1-3 that this configuration would naturally produce when run):
${outputTypeCatalog}

QUALITY BAR (check every idea against ALL of these before output):
□ Reusability — Could this configuration be run with 5+ different inputs (different roles, industries, contexts) and produce meaningfully different products each time? If it only works for one specific role or industry, it is too narrow.
□ Distinct angle — Does this configuration explore a genuinely different dimension or perspective than the others? Each configuration should cover a different analytical lens, not just reword the same concept.
□ Framework depth — Does every framework field contain 2+ sentences describing the reusable pattern, its dimensions, and its value? One-word or one-phrase fields indicate shallow thinking.
□ Output type fit — Do the suggested output types match what this configuration would naturally produce? A decision-focused configuration fits Decision Book; a process-focused one fits Playbook or Checklist.
□ Configurability — Are the variable parts clear? Could someone reading this idea immediately understand what inputs they would provide (role, industry, context, constraint) and what products would come out?
□ Diversity — Across all ${count} ideas, do the configurations cover different dimensions, perspectives, or analytical approaches? No two should produce overlapping products when given the same inputs.
□ Not In Existing Ideas — The idea is not in, or not similar to any of the ideas in the existing ideas list.

ANTI-PATTERNS (if you catch yourself doing any of these, stop and rewrite):
✗ Specific product titles — "The CISO's First 90 Days Security Decision Book" names ONE product. The idea should be "Role Onboarding Decision Framework" which can be configured for any role's first 90 days.
✗ Baked-in audience — if the title or description locks the configuration to one specific role (e.g. "VP Sales"), "industry" (e.g. "SaaS"), or company stage, it is too narrow. The audience should be a parameter, not a constant.
✗ Overlapping configurations — if two ideas would produce nearly identical products when given the same input, merge the angle or find a truly distinct dimension.
✗ One-word framework fields — every field must describe the reusable pattern with enough substance to guide configuration generation downstream.
✗ Formulaic naming — do not use the same title structure for every idea. Vary the naming patterns.
✗ Doesn't produce useful digital products — The idea doesn't produce a digital product that is useful to the target audience.

Generate exactly ${count} configuration blueprint ideas.`

    const result = await generateText({
      model: 'openai/gpt-5.2',
      providerOptions: { reasoning: { effort: 'high' } },
      temperature: 0.75,
      prompt,
      output: Output.object({ schema: ideaSchema }),
    })

    const output = result.output as { ideas: { title: string; frameworkFields: { key: string; value: string }[]; suggestedOutputTypes: string[] }[] }
    const ideas = output.ideas.map((idea) => ({
      title: idea.title,
      frameworkData: Object.fromEntries(idea.frameworkFields.map((f) => [f.key, f.value])),
      suggestedOutputTypes: idea.suggestedOutputTypes,
    }))
    return Response.json(withUsageMeta(withDebugMeta({ ideas }, [prompt]), result.usage))
  } catch (error) {
    console.error('[generate-ideas] Error:', error)
    return Response.json(
      { error: 'Failed to generate ideas. Please try again.' },
      { status: 500 }
    )
  }
}
