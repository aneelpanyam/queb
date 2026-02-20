import { generateText, Output } from 'ai'
import { z } from 'zod'
import { EBOOK_CHAPTERS } from '@/lib/ebook-chapters'
import { formatContext, assembleDirectivesPrompt, buildElementSchema, buildFieldOverrideBlock } from '@/lib/assemble-prompt'
import { withDebugMeta, isDebugMode } from '@/lib/ai-log-storage'

export const maxDuration = 120

const DEFAULT_LABEL = 'Chapter'

const singleChapterSchema = z.object({
  chapterName: z.string().describe('The chapter title'),
  chapterDescription: z.string().describe('Brief description of what this chapter covers'),
  sections: z.array(
    z.object({
      title: z.string().describe('A clear, descriptive sub-section title that captures the topic covered'),
      content: z.string().describe('Rich, long-form prose (400-800 words) that teaches, explains, and illustrates the topic. Use paragraphs, transitions, and narrative structure — this is a book, not a bullet list.'),
      keyInsight: z.string().describe('The single most important takeaway from this sub-section — the idea the reader should remember above all else'),
      practicalExample: z.string().describe('A concrete, detailed example or scenario that makes abstract concepts tangible. Use realistic names, numbers, and situations.'),
      actionItem: z.string().describe('A specific task, exercise, or reflection the reader should do after reading this sub-section to apply the knowledge immediately'),
    })
  ),
})

function buildDefaultPrompt(
  chapter: { name: string; description: string },
  context: Record<string, string>,
  sectionLabel: string,
) {
  const contextBlock = formatContext(context)
  const label = sectionLabel.toLowerCase()
  return `You are an expert author and instructional designer who creates compelling, comprehensive guides that educate professionals.

CONTEXT:
${contextBlock}

TASK:
Generate 3-5 substantial sub-sections for the "${chapter.name}" ${label}.

${sectionLabel.toUpperCase()} DEFINITION:
${chapter.name}: ${chapter.description}

GUIDELINES:
- Only generate sub-sections if this chapter theme is genuinely relevant to the given context. If not relevant, return an empty sections array.
- Every sub-section must be specific to the described context — not generic filler content.
- The "content" field is the heart of the book. Write 400-800 words of rich, flowing prose per sub-section.
- Teach, explain, and illustrate — the reader should walk away truly understanding the material.
- Include concrete examples, scenarios, and practical illustrations throughout.
- Key insights should distill the single most important takeaway from each sub-section.
- Practical examples must be detailed and realistic, using names, numbers, and situations relevant to the reader.
- Action items should be specific and immediately doable.
- Build progressively within the chapter — start with context, move to core material, end with application.
- Write as an authoritative but approachable expert — like a trusted mentor.
- Tailor depth, terminology, and examples to the specific audience and context provided.`
}

async function generateForChapter(
  chapter: { name: string; description: string },
  context: Record<string, string>,
  sectionLabel: string,
  directives?: { label: string; content: string }[],
  collectedPrompts?: string[],
) {
  const prompt = directives?.length
    ? assembleDirectivesPrompt(context, chapter, sectionLabel, directives)
    : buildDefaultPrompt(chapter, context, sectionLabel)

  if (collectedPrompts) collectedPrompts.push(prompt)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt,
    output: Output.object({ schema: singleChapterSchema }),
  })

  return result.output
}

export async function POST(req: Request) {
  try {
    const { context, sectionDrivers, instructionDirectives, sectionLabel } = (await req.json()) as {
      context: Record<string, string>
      sectionDrivers?: { name: string; description: string; fields?: { key: string; label: string; [k: string]: unknown }[] }[]
      instructionDirectives?: { label: string; content: string }[]
      sectionLabel?: string
    }

    const label = sectionLabel || DEFAULT_LABEL
    const chapters = sectionDrivers?.length ? sectionDrivers : EBOOK_CHAPTERS
    const hasPerDriverFields = sectionDrivers?.some((s) => s.fields?.length) ?? false

    console.log(`[generate-ebook] Context keys: ${Object.keys(context).join(', ')}${sectionDrivers?.length ? ' (custom chapters)' : ''}${instructionDirectives?.length ? ` (${instructionDirectives.length} directives)` : ''}${hasPerDriverFields ? ' (per-driver fields)' : ''}`)

    const startTime = Date.now()
    const debugPrompts: string[] = isDebugMode() ? [] : undefined as any

    if (hasPerDriverFields) {
      const drivers = chapters as { name: string; description: string; fields?: { key: string; label: string; [k: string]: unknown }[] }[]
      const promises = drivers.map((ch) => {
        const fields = ch.fields
        if (fields?.length) {
          const elementSchema = buildElementSchema(fields)
          const schema = z.object({
            sectionName: z.string(),
            sectionDescription: z.string(),
            elements: z.array(elementSchema),
          })
          const prompt = (instructionDirectives?.length
            ? assembleDirectivesPrompt(context, ch, label, instructionDirectives)
            : buildDefaultPrompt(ch, context, label))
            + buildFieldOverrideBlock(fields)
          if (debugPrompts) debugPrompts.push(prompt)
          return generateText({ model: 'openai/gpt-5.2', prompt, output: Output.object({ schema }) })
            .then((r) => ({ ...(r.output as object), resolvedFields: fields }) as { sectionName: string; sectionDescription: string; elements: Record<string, string>[]; resolvedFields: typeof fields })
            .catch((err) => {
              console.error(`[generate-ebook] Error for chapter ${ch.name}:`, err)
              return { sectionName: ch.name, sectionDescription: ch.description, elements: [] as Record<string, string>[], resolvedFields: fields }
            })
        }
        return generateForChapter(ch, context, label, instructionDirectives, debugPrompts)
          .then((r) => ({
            sectionName: r.chapterName,
            sectionDescription: r.chapterDescription,
            elements: r.sections as unknown as Record<string, string>[],
          }))
          .catch((err) => {
            console.error(`[generate-ebook] Error for chapter ${ch.name}:`, err)
            return { sectionName: ch.name, sectionDescription: ch.description, elements: [] as Record<string, string>[] }
          })
      })

      const allSections = await Promise.all(promises)
      const relevant = allSections.filter((s) => s.elements.length > 0)
      console.log(`[generate-ebook] ${relevant.length}/${chapters.length} chapters in ${Date.now() - startTime}ms (per-driver fields)`)
      return Response.json(withDebugMeta({ sections: relevant, _perDriverFields: true }, debugPrompts ?? []))
    }

    const promises = chapters.map((chapter) =>
      generateForChapter(chapter, context, label, instructionDirectives, debugPrompts).catch((err) => {
        console.error(`[generate-ebook] Error for ${chapter.name}:`, err)
        return { chapterName: chapter.name, chapterDescription: chapter.description, sections: [] }
      })
    )

    const allChapters = await Promise.all(promises)
    const relevant = allChapters.filter((c) => c.sections.length > 0)

    console.log(`[generate-ebook] ${relevant.length}/${chapters.length} chapters in ${Date.now() - startTime}ms`)

    return Response.json(withDebugMeta({ chapters: relevant }, debugPrompts ?? []))
  } catch (error) {
    console.error('[generate-ebook] Error:', error)
    return Response.json({ error: 'Failed to generate e-Book.' }, { status: 500 })
  }
}
