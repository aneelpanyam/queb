import { generateText, Output } from 'ai'
import { z } from 'zod'
import { getFrameworksForOutputType, type DeepDiveFramework } from '@/lib/deep-dive-frameworks'

export const maxDuration = 120

const dissectionSchema = z.object({
  frameworkUsed: z.object({
    id: z.string().describe('The framework ID that was selected'),
    name: z.string().describe('Display name of the framework'),
    shortDescription: z.string().describe('One-line summary of the framework'),
  }),
  thinkingFramework: z.array(
    z.object({
      step: z.number().describe('Step number'),
      title: z.string().describe('Short title for this step, matching the framework stage'),
      description: z.string().describe('Deep, specific analysis for this framework step applied to the item'),
    })
  ),
  checklist: z.array(
    z.object({
      item: z.string().describe('Action item'),
      description: z.string().describe('Why this matters and how to do it'),
      isRequired: z.boolean().describe('Must-do vs nice-to-have'),
    })
  ),
  resources: z.array(
    z.object({
      title: z.string().describe('Resource name'),
      type: z.string().describe('Blog, Book, Tool, Framework, Report, Course, or Community'),
      url: z.string().describe('Realistic URL or search query'),
      description: z.string().describe('How this resource helps'),
    })
  ),
  keyInsight: z.string().describe('Summary of what getting this right unlocks'),
})

function formatFrameworkCatalog(frameworks: DeepDiveFramework[]): string {
  return frameworks
    .map(
      (f) =>
        `- **${f.name}** (id: "${f.id}"): ${f.shortDescription}. Best for: ${f.bestFor}.\n  Steps: ${f.steps.map((s, i) => `${i + 1}. ${s}`).join(' ')}`
    )
    .join('\n')
}

const OUTPUT_TYPE_PROMPTS: Record<string, (item: string, section: string, frameworkCatalog: string) => string> = {
  questions: (item, section, frameworkCatalog) =>
    `The QUESTION to deeply analyze:\n"${item}"\n\nFrom the "${section}" perspective.\n\nAVAILABLE FRAMEWORKS:\n${frameworkCatalog}\n\nINSTRUCTIONS:\n1. CHOOSE the single best framework from the catalog above based on the nature of this question.\n2. THINKING FRAMEWORK: Apply that framework's steps to this specific question. Each step in thinkingFramework must correspond to a framework stage and contain deep, specific analysis — not generic filler.\n3. CHECKLIST: 6-10 actionable items to thoroughly answer this question, informed by the framework analysis.\n4. RESOURCES: 5-8 specific resources.\n5. KEY INSIGHT: What getting the answer right unlocks strategically.`,

  checklist: (item, section, frameworkCatalog) =>
    `The CHECKLIST ITEM to deeply analyze:\n"${item}"\n\nFrom the "${section}" checklist dimension.\n\nAVAILABLE FRAMEWORKS:\n${frameworkCatalog}\n\nINSTRUCTIONS:\n1. CHOOSE the single best framework from the catalog above based on the nature of this checklist item.\n2. THINKING FRAMEWORK: Apply that framework's steps to this specific item. Each step must correspond to a framework stage with deep, context-specific analysis.\n3. CHECKLIST: 6-10 sub-tasks or verification points to ensure this item is completed thoroughly.\n4. RESOURCES: 5-8 specific resources (tools, templates, guides) that help execute this item well.\n5. KEY INSIGHT: What doing this item well prevents or enables — the downstream impact.`,

  'email-course': (item, section, frameworkCatalog) =>
    `The EMAIL TOPIC to deeply analyze:\n"${item}"\n\nFrom the "${section}" course module.\n\nAVAILABLE FRAMEWORKS:\n${frameworkCatalog}\n\nINSTRUCTIONS:\n1. CHOOSE the single best framework from the catalog above based on the nature of this email.\n2. THINKING FRAMEWORK: Apply that framework's steps to expand this email into a compelling piece. Each step must map to a framework stage with specific content direction.\n3. CHECKLIST: 6-10 key talking points, examples, and data points to include for maximum impact.\n4. RESOURCES: 5-8 specific resources the email writer can reference or link to.\n5. KEY INSIGHT: The core insight the reader should walk away with — what makes this email memorable and actionable.`,

  prompts: (item, section, frameworkCatalog) =>
    `The AI PROMPT to deeply analyze:\n"${item}"\n\nFrom the "${section}" use-case category.\n\nAVAILABLE FRAMEWORKS:\n${frameworkCatalog}\n\nINSTRUCTIONS:\n1. CHOOSE the single best framework from the catalog above based on the nature of this prompt.\n2. THINKING FRAMEWORK: Apply that framework's steps to optimize and deeply understand this prompt. Each step must map to a framework stage with actionable guidance.\n3. CHECKLIST: 6-10 variations, edge cases, and follow-up prompts that extend this prompt's usefulness.\n4. RESOURCES: 5-8 specific resources on prompt engineering or the domain this prompt covers.\n5. KEY INSIGHT: The strategic value of having this prompt in your toolkit — what capability it gives you.`,

  'battle-cards': (item, section, frameworkCatalog) =>
    `The BATTLE CARD to deeply analyze:\n"${item}"\n\nFrom the "${section}" competitive section.\n\nAVAILABLE FRAMEWORKS:\n${frameworkCatalog}\n\nINSTRUCTIONS:\n1. CHOOSE the single best framework from the catalog above based on the nature of this competitive intelligence.\n2. THINKING FRAMEWORK: Apply that framework's steps to make this intelligence actionable. Each step must map to a framework stage with specific competitive analysis.\n3. CHECKLIST: 6-10 specific objection handlers, proof points, and conversation pivots related to this card.\n4. RESOURCES: 5-8 specific resources for staying current on this competitive landscape.\n5. KEY INSIGHT: The strategic advantage this intelligence gives you in deals.`,
}

export async function POST(req: Request) {
  try {
    const { item, section, outputType, role, activity, situation, industry, service } = await req.json()

    const frameworks = getFrameworksForOutputType(outputType)
    const frameworkCatalog = formatFrameworkCatalog(frameworks)

    const typePrompt = OUTPUT_TYPE_PROMPTS[outputType] || OUTPUT_TYPE_PROMPTS.questions
    const itemPrompt = typePrompt(item, section, frameworkCatalog)

    const result = await generateText({
      model: 'openai/gpt-5.2',
      output: Output.object({ schema: dissectionSchema }),
      prompt: `You are a senior consultant and domain expert who uses structured analytical frameworks to help professionals think deeply about specific items.

Context:
- Industry: ${industry}
- Service: ${service}
- Role: ${role}
- Activity: ${activity}
- Situation: ${situation}

${itemPrompt}

CRITICAL RULES:
- You MUST select one framework from the catalog and set frameworkUsed with its id, name, and shortDescription.
- The thinkingFramework steps MUST follow the selected framework's structure — each step title should reflect a framework stage.
- Do NOT generate generic steps. Every step must contain analysis specific to the item, context, and framework.
- For RESOURCES, use real domains and realistic paths (e.g., hbr.org/..., mckinsey.com/..., specific tool websites).
- Be specific to the role, industry, and situation throughout.`,
    })

    return Response.json(result.output)
  } catch (error) {
    console.error('[dissect-item] Error:', error)
    return Response.json({ error: 'Failed to generate deep dive.' }, { status: 500 })
  }
}
