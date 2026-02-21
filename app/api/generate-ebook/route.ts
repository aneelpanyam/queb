import { generateText, Output } from 'ai'
import { z } from 'zod'
import { EBOOK_CHAPTERS } from '@/lib/ebook-chapters'
import { assembleDirectivesPrompt, buildElementSchema, buildFieldOverrideBlock, type PromptAssemblyOptions } from '@/lib/assemble-prompt'
import { getPromptAssemblyOptionsById } from '@/lib/output-type-library'
import { BUILTIN_INSTRUCTION_DIRECTIVES } from '@/lib/output-type-directives'
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

async function generateForChapter(
  chapter: { name: string; description: string },
  context: Record<string, string>,
  sectionLabel: string,
  directives: { label: string; content: string }[],
  promptOpts: PromptAssemblyOptions,
  collectedPrompts?: string[],
) {
  const prompt = assembleDirectivesPrompt(context, chapter, sectionLabel, directives, promptOpts)

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
    const { context, sectionDrivers, instructionDirectives, sectionLabel, promptOptions } = (await req.json()) as {
      context: Record<string, string>
      sectionDrivers?: { name: string; description: string; fields?: { key: string; label: string; [k: string]: unknown }[] }[]
      instructionDirectives?: { label: string; content: string }[]
      sectionLabel?: string
      promptOptions?: PromptAssemblyOptions
    }

    const label = sectionLabel || DEFAULT_LABEL
    const promptOpts = promptOptions ?? getPromptAssemblyOptionsById('ebook', 'section')
    const effectiveDirectives = instructionDirectives?.length ? instructionDirectives : BUILTIN_INSTRUCTION_DIRECTIVES['ebook'] ?? []
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
          const prompt = assembleDirectivesPrompt(context, ch, label, effectiveDirectives, promptOpts)
            + buildFieldOverrideBlock(fields)
          if (debugPrompts) debugPrompts.push(prompt)
          return generateText({ model: 'openai/gpt-5.2', prompt, output: Output.object({ schema }) })
            .then((r) => ({ ...(r.output as object), resolvedFields: fields }) as { sectionName: string; sectionDescription: string; elements: Record<string, string>[]; resolvedFields: typeof fields })
            .catch((err) => {
              console.error(`[generate-ebook] Error for chapter ${ch.name}:`, err)
              return { sectionName: ch.name, sectionDescription: ch.description, elements: [] as Record<string, string>[], resolvedFields: fields }
            })
        }
        return generateForChapter(ch, context, label, effectiveDirectives, promptOpts, debugPrompts)
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
      generateForChapter(chapter, context, label, effectiveDirectives, promptOpts, debugPrompts).catch((err) => {
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
