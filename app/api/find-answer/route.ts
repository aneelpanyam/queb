import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { withDebugMeta, withUsageMeta } from '@/lib/ai-log-storage'

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const { question, context } = (await req.json()) as {
      question: string
      context: {
        industry?: string
        service?: string
        role?: string
        activity?: string
        situation?: string
        [key: string]: string | undefined
      }
    }

    if (!question?.trim()) {
      return Response.json({ error: 'Question is required.' }, { status: 400 })
    }

    const contextLines = Object.entries(context)
      .filter(([, v]) => v?.trim())
      .map(
        ([k, v]) =>
          `- ${k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()}: ${v}`
      )
      .join('\n')

    const prompt = `You are a research assistant helping a professional find an accurate, well-sourced answer.

PROFESSIONAL CONTEXT:
${contextLines}

QUESTION:
${question}

INSTRUCTIONS:
- Search the web for authoritative, recent sources relevant to this question and context.
- Synthesize a clear, thorough answer drawing from the search results.
- Where possible, cite specific data, statistics, expert opinions, or frameworks.
- If the answer varies by circumstance, explain the key factors and trade-offs.
- Be honest about uncertainty — if evidence is mixed or incomplete, say so.
- Structure the answer with clear paragraphs. Use markdown formatting for readability.
- Keep the answer focused and actionable for someone in the described role and industry.

CRITICAL FORMAT RULES:
- This is a one-shot research report, NOT a conversation. Do NOT ask the reader follow-up questions, do NOT offer to tailor or refine, do NOT say "let me know" or "tell me more".
- If there are important variables that would change the answer, present them as a decision-tree or "it depends" section WITHIN the answer itself (e.g., "If you have X, then Y; if not, then Z").
- End the answer with the conclusion or a clear summary — never with questions directed at the reader.`

    const genResult = await generateText({
      model: 'openai/gpt-5.2',
      prompt,
      tools: {
        web_search: openai.tools.webSearch({}),
      },
    })
    const { text, sources } = genResult

    const verifiedSources = (sources ?? [])
      .filter(
        (s): s is { sourceType: string; url: string; title?: string } =>
          'url' in s && typeof s.url === 'string' && s.url.startsWith('http')
      )
      .map((s) => ({ url: s.url, title: s.title || new URL(s.url).hostname }))

    const uniqueSources = Array.from(
      new Map(verifiedSources.map((s) => [s.url, s])).values()
    )

    const usage = genResult.totalUsage ?? genResult.usage
    return Response.json(withUsageMeta(withDebugMeta({
      answer: text,
      sources: uniqueSources,
      generatedAt: new Date().toISOString(),
    }, [prompt]), usage))
  } catch (error) {
    console.error('[find-answer] Error:', error)
    return Response.json(
      { error: 'Failed to find answer. Please try again.' },
      { status: 500 }
    )
  }
}
