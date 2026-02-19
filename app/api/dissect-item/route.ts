import { generateText, Output } from 'ai'
import { z } from 'zod'

export const maxDuration = 120

const dissectionSchema = z.object({
  thinkingFramework: z.array(
    z.object({
      step: z.number().describe('Step number'),
      title: z.string().describe('Short title for this step'),
      description: z.string().describe('Detailed explanation of what to consider'),
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

const OUTPUT_TYPE_PROMPTS: Record<string, (item: string, section: string) => string> = {
  questions: (item, section) =>
    `The QUESTION to deeply understand:\n"${item}"\n\nFrom the "${section}" perspective.\n\nProvide:\n1. THINKING FRAMEWORK: 5-7 structured steps for how to methodically think through this question.\n2. CHECKLIST: 6-10 actionable items to thoroughly answer this question.\n3. RESOURCES: 5-8 specific resources.\n4. KEY INSIGHT: What getting the answer right unlocks strategically.`,

  checklist: (item, section) =>
    `The CHECKLIST ITEM to deeply understand:\n"${item}"\n\nFrom the "${section}" checklist dimension.\n\nProvide:\n1. THINKING FRAMEWORK: 5-7 steps explaining WHY this item matters, what to watch for, and how to think about it in context.\n2. CHECKLIST: 6-10 sub-tasks or verification points to ensure this checklist item is completed thoroughly and correctly.\n3. RESOURCES: 5-8 specific resources (tools, templates, guides, frameworks) that help execute this item well.\n4. KEY INSIGHT: What doing this item well prevents or enables — the downstream impact.`,

  'email-course': (item, section) =>
    `The EMAIL TOPIC to deeply understand:\n"${item}"\n\nFrom the "${section}" course module.\n\nProvide:\n1. THINKING FRAMEWORK: 5-7 steps for how to expand this email into a compelling, educational piece.\n2. CHECKLIST: 6-10 key talking points, examples, and data points to include for maximum impact.\n3. RESOURCES: 5-8 specific resources the email writer can reference or link to.\n4. KEY INSIGHT: The core insight the reader should walk away with — what makes this email memorable and actionable.`,

  prompts: (item, section) =>
    `The AI PROMPT to deeply understand:\n"${item}"\n\nFrom the "${section}" use-case category.\n\nProvide:\n1. THINKING FRAMEWORK: 5-7 steps for how to customize and get the best results from this prompt — context setting, iteration strategy, and output refinement.\n2. CHECKLIST: 6-10 variations, edge cases, and follow-up prompts that extend this prompt's usefulness.\n3. RESOURCES: 5-8 specific resources on prompt engineering, the domain this prompt covers, or tools that complement it.\n4. KEY INSIGHT: The strategic value of having this prompt in your toolkit — what capability it gives you.`,

  'battle-cards': (item, section) =>
    `The BATTLE CARD to deeply understand:\n"${item}"\n\nFrom the "${section}" competitive section.\n\nProvide:\n1. THINKING FRAMEWORK: 5-7 steps for how to use this competitive intelligence effectively in conversations.\n2. CHECKLIST: 6-10 specific objection handlers, proof points, and conversation pivots related to this card.\n3. RESOURCES: 5-8 specific resources for staying current on this competitive landscape.\n4. KEY INSIGHT: The strategic advantage this intelligence gives you in deals.`,
}

export async function POST(req: Request) {
  try {
    const { item, section, outputType, role, activity, situation, industry, service } = await req.json()

    const typePrompt = OUTPUT_TYPE_PROMPTS[outputType] || OUTPUT_TYPE_PROMPTS.questions
    const itemPrompt = typePrompt(item, section)

    const result = await generateText({
      model: 'openai/gpt-5.2',
      output: Output.object({ schema: dissectionSchema }),
      prompt: `You are a senior consultant and domain expert. A professional needs a deep dive to fully understand and act on a specific item.

Context:
- Industry: ${industry}
- Service: ${service}
- Role: ${role}
- Activity: ${activity}
- Situation: ${situation}

${itemPrompt}

For RESOURCES, use real domains and realistic paths (e.g., hbr.org/..., mckinsey.com/..., specific tool websites).
Be specific to the role, industry, and situation throughout.`,
    })

    return Response.json(result.output)
  } catch (error) {
    console.error('[dissect-item] Error:', error)
    return Response.json({ error: 'Failed to generate deep dive.' }, { status: 500 })
  }
}
