import { generateText, Output } from 'ai'
import { z } from 'zod'
import { formatContext } from '@/lib/assemble-prompt'
import { withDebugMeta } from '@/lib/ai-log-storage'

export const maxDuration = 120

export const deeperQuestionsSchema = z.object({
  secondOrder: z.array(
    z.object({
      question: z
        .string()
        .describe(
          'A 2nd-order thinking question that explores consequences, dependencies, or implications of the original question'
        ),
      reasoning: z
        .string()
        .describe(
          'Explains what chain of reasoning connects this to the original question and why this deeper layer matters'
        ),
    })
  ),
  thirdOrder: z.array(
    z.object({
      question: z
        .string()
        .describe(
          'A 3rd-order thinking question that explores systemic, long-term, or emergent effects beyond the 2nd order'
        ),
      reasoning: z
        .string()
        .describe(
          'Explains the multi-step reasoning chain from original question through 2nd order to this 3rd-order implication'
        ),
    })
  ),
})

export async function POST(req: Request) {
  try {
    const { originalQuestion, perspective, context } = (await req.json()) as {
      originalQuestion: string
      perspective: string
      context: Record<string, string>
    }
    console.log(`[generate-deeper] Perspective: ${perspective}`)

    const contextBlock = formatContext(context)

    const prompt = `You are an expert in multi-order thinking and systems analysis.

CONTEXT:
${contextBlock}
- Perspective: ${perspective}

ORIGINAL QUESTION:
"${originalQuestion}"

TASK:
Generate 2nd-order and 3rd-order thinking questions derived from the original question above.

2ND-ORDER THINKING:
These questions explore the immediate consequences, dependencies, knock-on effects, and hidden assumptions behind the original question. They ask "And then what?" or "What does this depend on?" or "What are the second-level effects?"
Generate 3 questions.

3RD-ORDER THINKING:
These questions go even deeper - exploring systemic ripple effects, long-term emergent outcomes, feedback loops, unintended consequences, and paradigm-level shifts. They ask "What happens when those second-order effects compound over time?" or "What systemic shifts could emerge?"
Generate 2-3 questions.

GUIDELINES:
- Every question must be highly specific to the given context.
- Each question must include a reasoning note that traces the chain of thinking from the original question.
- Avoid generic questions. Make them reveal non-obvious insights.
- Consider cascading impacts across the organization, market, and stakeholders.`

    const result = await generateText({
      model: 'openai/gpt-5.2',
      prompt,
      output: Output.object({ schema: deeperQuestionsSchema }),
    })

    console.log(`[generate-deeper] Success: ${result.output?.secondOrder?.length || 0} 2nd-order, ${result.output?.thirdOrder?.length || 0} 3rd-order`)
    return Response.json(withDebugMeta(result.output as object, [prompt]))
  } catch (error) {
    console.error('[generate-deeper] Error:', error)
    return Response.json(
      { error: 'Failed to generate deeper questions. Please try again.' },
      { status: 500 }
    )
  }
}
