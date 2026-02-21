import { generateText, Output } from 'ai'
import { z } from 'zod'
import { getFrameworksForOutputType, type DeepDiveFramework } from '@/lib/deep-dive-frameworks'
import { formatContext } from '@/lib/assemble-prompt'
import { withDebugMeta, withUsageMeta } from '@/lib/ai-log-storage'

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
      description: z.string().describe('Markdown-formatted analysis. Use bullet lists, numbered lists, and **bold** for structure. Never write dense paragraphs — break into scannable points.'),
    })
  ),
  checklist: z.array(
    z.object({
      item: z.string().describe('Action item'),
      description: z.string().describe('Markdown-formatted explanation of why this matters and how to do it'),
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

  'decision-books': (item, section, frameworkCatalog) =>
    `The DECISION to deeply analyze:\n"${item}"\n\nFrom the "${section}" decision domain.\n\nAVAILABLE FRAMEWORKS:\n${frameworkCatalog}\n\nINSTRUCTIONS:\n1. CHOOSE the single best framework from the catalog above based on the nature of this decision.\n2. THINKING FRAMEWORK: Apply that framework's steps to this specific decision. Each step must correspond to a framework stage with deep, context-specific analysis of the options, trade-offs, and stakeholder dynamics.\n3. CHECKLIST: 6-10 specific actions, validations, and stakeholder consultations needed before making this decision.\n4. RESOURCES: 5-8 specific resources (decision frameworks, tools, case studies, industry benchmarks) for making this type of decision well.\n5. KEY INSIGHT: The strategic consequence of getting this decision right vs. wrong — what it unlocks or forecloses.`,

  dossier: (item, section, frameworkCatalog) =>
    `The INTELLIGENCE BRIEFING to deeply analyze:\n"${item}"\n\nFrom the "${section}" intelligence area.\n\nAVAILABLE FRAMEWORKS:\n${frameworkCatalog}\n\nINSTRUCTIONS:\n1. CHOOSE the single best framework from the catalog above based on the nature of this intelligence.\n2. THINKING FRAMEWORK: Apply that framework's steps to this specific briefing. Each step must correspond to a framework stage with deep, evidence-based analysis of findings, implications, and confidence levels.\n3. CHECKLIST: 6-10 specific intelligence-gathering actions, verification steps, and analytical tasks to deepen this briefing.\n4. RESOURCES: 5-8 specific resources (databases, reports, industry sources, analytical tools) for researching this intelligence area.\n5. KEY INSIGHT: The strategic advantage this intelligence provides — what decisions it enables or risks it reveals.`,

  playbook: (item, section, frameworkCatalog) =>
    `The PLAYBOOK PLAY to deeply analyze:\n"${item}"\n\nFrom the "${section}" execution phase.\n\nAVAILABLE FRAMEWORKS:\n${frameworkCatalog}\n\nINSTRUCTIONS:\n1. CHOOSE the single best framework from the catalog above based on the nature of this play.\n2. THINKING FRAMEWORK: Apply that framework's steps to this specific play. Each step must correspond to a framework stage with deep, context-specific analysis of execution details, dependencies, and decision points.\n3. CHECKLIST: 6-10 specific sub-tasks, prerequisites, and verification points to execute this play thoroughly.\n4. RESOURCES: 5-8 specific resources (templates, tools, guides, case studies) that help execute this play well.\n5. KEY INSIGHT: What executing this play well unlocks — the downstream impact on the overall initiative.`,

  'cheat-sheets': (item, section, frameworkCatalog) =>
    `The CHEAT SHEET ENTRY to deeply analyze:\n"${item}"\n\nFrom the "${section}" reference category.\n\nAVAILABLE FRAMEWORKS:\n${frameworkCatalog}\n\nINSTRUCTIONS:\n1. CHOOSE the single best framework from the catalog above based on the nature of this concept.\n2. THINKING FRAMEWORK: Apply that framework's steps to deeply understand this concept. Each step must correspond to a framework stage with concrete examples, relationships, and practical applications.\n3. CHECKLIST: 6-10 specific learning actions, practice exercises, and verification points to truly master this concept.\n4. RESOURCES: 5-8 specific resources (tutorials, documentation, tools, reference materials) for deepening understanding of this concept.\n5. KEY INSIGHT: Why mastering this concept matters — what capability or advantage it gives the practitioner.`,

  ebook: (item, section, frameworkCatalog) =>
    `The BOOK SECTION to deeply analyze:\n"${item}"\n\nFrom the "${section}" chapter.\n\nAVAILABLE FRAMEWORKS:\n${frameworkCatalog}\n\nINSTRUCTIONS:\n1. CHOOSE the single best framework from the catalog above based on the nature of this section.\n2. THINKING FRAMEWORK: Apply that framework's steps to expand this section into richer, more comprehensive content. Each step must map to a framework stage with deep, narrative-quality analysis — the kind of depth a book reader expects.\n3. CHECKLIST: 6-10 specific points, examples, illustrations, and sub-topics that should be covered to make this section truly comprehensive.\n4. RESOURCES: 5-8 specific resources (books, articles, research papers, tools, courses) the author or reader can reference for deeper knowledge.\n5. KEY INSIGHT: The central lesson or principle this section should leave the reader with — what makes this knowledge transformative.`,
}

export async function POST(req: Request) {
  try {
    const { item, section, outputType, context } = (await req.json()) as {
      item: string
      section: string
      outputType: string
      context: Record<string, string>
    }

    const frameworks = getFrameworksForOutputType(outputType)
    const frameworkCatalog = formatFrameworkCatalog(frameworks)

    const typePrompt = OUTPUT_TYPE_PROMPTS[outputType] || OUTPUT_TYPE_PROMPTS.questions
    const itemPrompt = typePrompt(item, section, frameworkCatalog)

    const contextBlock = formatContext(context)

    const prompt = `You are a senior consultant and domain expert who uses structured analytical frameworks to help professionals think deeply about specific items.

CONTEXT:
${contextBlock}

${itemPrompt}

CRITICAL RULES:
- You MUST select one framework from the catalog and set frameworkUsed with its id, name, and shortDescription.
- The thinkingFramework steps MUST follow the selected framework's structure — each step title should reflect a framework stage.
- Do NOT generate generic steps. Every step must contain analysis specific to the item, context, and framework.
- For RESOURCES, use real domains and realistic paths (e.g., hbr.org/..., mckinsey.com/..., specific tool websites).
- Be specific to the context throughout.

FORMATTING RULES (very important):
- All description fields support Markdown. You MUST use it for readability.
- NEVER write dense walls of text. Break content into scannable structure.
- Use **bold** for key terms, concepts, and emphasis.
- When listing multiple items, stakeholders, actions, or considerations, ALWAYS use bullet lists (- item) or numbered lists (1. item).
- Start each step description with a brief framing sentence, then break the detail into a bulleted or numbered list.
- Keep paragraphs to 2-3 sentences max before breaking into a list.`

    const result = await generateText({
      model: 'openai/gpt-5.2',
      output: Output.object({ schema: dissectionSchema }),
      prompt,
    })

    return Response.json(withUsageMeta(withDebugMeta(result.output as object, [prompt]), result.usage))
  } catch (error) {
    console.error('[dissect-item] Error:', error)
    return Response.json({ error: 'Failed to generate deep dive.' }, { status: 500 })
  }
}
