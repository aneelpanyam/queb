import { generateText, Output } from 'ai'
import { z } from 'zod'

export const maxDuration = 120
export async function POST(req: Request) {
  try {
  const { question, perspective, role, activity, situation, industry, service } =
    await req.json()
  console.log(`[dissect-question] Perspective: ${perspective}, Role: ${role}`)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    output: Output.object({
      schema: z.object({
        thinkingFramework: z.array(
          z.object({
            step: z.number().describe('Step number in the thinking process'),
            title: z.string().describe('Short title for this thinking step'),
            description: z
              .string()
              .describe(
                'Detailed explanation of what to consider and how to think about it at this step'
              ),
          })
        ),
        checklist: z.array(
          z.object({
            item: z.string().describe('The checklist action item'),
            description: z
              .string()
              .describe('Why this item matters and how to execute it'),
            isRequired: z
              .boolean()
              .describe('Whether this is a must-do vs nice-to-have'),
          })
        ),
        resources: z.array(
          z.object({
            title: z.string().describe('Name of the resource'),
            type: z
              .string()
              .describe(
                'Type: Blog, Book, Tool, Framework, Report, Course, or Community'
              ),
            url: z
              .string()
              .describe(
                'A realistic URL or search query for the resource'
              ),
            description: z
              .string()
              .describe('How this resource helps answer the question'),
          })
        ),
        keyInsight: z
          .string()
          .describe(
            'A summary of what answering this question well unlocks -- the strategic value of getting this right'
          ),
      }),
    }),
    prompt: `You are a senior management consultant and strategic advisor. A professional needs help deeply understanding and answering a specific question.

Context:
- Industry: ${industry}
- Service: ${service}
- Role: ${role}
- Activity: ${activity}
- Situation: ${situation}
- Perspective: ${perspective}

The question to dissect:
"${question}"

Provide:
1. A THINKING FRAMEWORK: 5-7 structured steps for how to methodically think through this question. Each step should build on the previous one, moving from gathering context to forming a well-reasoned answer.

2. A CHECKLIST: 6-10 actionable items the person should complete to thoroughly answer this question. Mark truly essential items as required. Include specific data to gather, people to consult, analyses to run, and validations to perform.

3. RESOURCES: 5-8 real, specific resources that would help. Include a mix of types (blogs, books, tools, frameworks, reports). For URLs, use real domains and realistic paths (e.g., hbr.org/..., mckinsey.com/..., specific tool websites). Each resource should directly relate to answering this question in this industry context.

4. A KEY INSIGHT: One powerful paragraph about what getting the answer to this question right will unlock strategically. Be specific to the role and situation.`,
  })

  console.log(`[dissect-question] Success: ${result.output?.thinkingFramework?.length || 0} steps, ${result.output?.resources?.length || 0} resources`)
  return Response.json(result.output)
  } catch (error) {
    console.error('[dissect-question] Error:', error)
    return Response.json(
      { error: 'Failed to dissect question. Please try again.' },
      { status: 500 }
    )
  }
}
