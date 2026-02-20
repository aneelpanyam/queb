import { generateText, Output } from 'ai'
import { z } from 'zod'
import { CHEAT_SHEET_CATEGORIES } from '@/lib/cheat-sheet-categories'
import { formatContext, assembleDirectivesPrompt, buildElementSchema, buildFieldOverrideBlock } from '@/lib/assemble-prompt'
import { withDebugMeta, isDebugMode } from '@/lib/ai-log-storage'

export const maxDuration = 120

const DEFAULT_LABEL = 'Category'

const singleCategorySchema = z.object({
  categoryName: z.string().describe('The cheat sheet category name'),
  categoryDescription: z.string().describe('Brief description of what this category covers'),
  entries: z.array(
    z.object({
      term: z.string().describe('The key term, concept, rule, or reference item — concise and scannable'),
      definition: z.string().describe('Clear, jargon-free explanation in 1-3 sentences. Lead with the most important information.'),
      example: z.string().describe('A concrete, practical example showing the concept in action within the given context. Show, don\'t just tell.'),
      relatedConcepts: z.string().describe('2-4 closely related terms or concepts, comma-separated — helping build a mental map of the domain'),
      commonMistakes: z.string().describe('The most frequent misunderstandings, misapplications, or errors people make with this concept. Empty string if not applicable.'),
      quickTip: z.string().describe('A single, memorable piece of practical advice — the one thing an expert would tell a colleague in passing'),
    })
  ),
})

function buildDefaultPrompt(
  category: { name: string; description: string },
  context: Record<string, string>,
  sectionLabel: string,
) {
  const contextBlock = formatContext(context)
  const label = sectionLabel.toLowerCase()
  return `You are an expert educator and knowledge distiller who creates scannable, high-density reference materials.

CONTEXT:
${contextBlock}

TASK:
Generate 4-8 quick-reference entries for the "${category.name}" ${label}.

${sectionLabel.toUpperCase()} DEFINITION:
${category.name}: ${category.description}

GUIDELINES:
- Only generate entries if this category is genuinely relevant to the given context. If not relevant, return an empty entries array.
- Every entry must be concise and information-dense — optimize for scannability, not completeness.
- Definitions must be clear and jargon-free in 1-3 sentences.
- Examples must be concrete and practical, showing the concept in action.
- Related concepts should help readers build a mental map of the domain.
- Common mistakes should highlight the most frequent misunderstandings.
- Quick tips should be memorable and immediately actionable.
- Prioritize entries by how frequently they are referenced in practice.
- Tailor all entries to the specific context, industry terminology, and audience level provided.`
}

async function generateForCategory(
  category: { name: string; description: string },
  context: Record<string, string>,
  sectionLabel: string,
  directives?: { label: string; content: string }[],
  collectedPrompts?: string[],
) {
  const prompt = directives?.length
    ? assembleDirectivesPrompt(context, category, sectionLabel, directives)
    : buildDefaultPrompt(category, context, sectionLabel)

  if (collectedPrompts) collectedPrompts.push(prompt)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt,
    output: Output.object({ schema: singleCategorySchema }),
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
    const categories = sectionDrivers?.length ? sectionDrivers : CHEAT_SHEET_CATEGORIES
    const hasPerDriverFields = sectionDrivers?.some((s) => s.fields?.length) ?? false

    console.log(`[generate-cheat-sheets] Context keys: ${Object.keys(context).join(', ')}${sectionDrivers?.length ? ' (custom categories)' : ''}${instructionDirectives?.length ? ` (${instructionDirectives.length} directives)` : ''}${hasPerDriverFields ? ' (per-driver fields)' : ''}`)

    const startTime = Date.now()
    const debugPrompts: string[] = isDebugMode() ? [] : undefined as any

    if (hasPerDriverFields) {
      const drivers = categories as { name: string; description: string; fields?: { key: string; label: string; [k: string]: unknown }[] }[]
      const promises = drivers.map((cat) => {
        const fields = cat.fields
        if (fields?.length) {
          const elementSchema = buildElementSchema(fields)
          const schema = z.object({
            sectionName: z.string(),
            sectionDescription: z.string(),
            elements: z.array(elementSchema),
          })
          const prompt = (instructionDirectives?.length
            ? assembleDirectivesPrompt(context, cat, label, instructionDirectives)
            : buildDefaultPrompt(cat, context, label))
            + buildFieldOverrideBlock(fields)
          if (debugPrompts) debugPrompts.push(prompt)
          return generateText({ model: 'openai/gpt-5.2', prompt, output: Output.object({ schema }) })
            .then((r) => ({ ...(r.output as object), resolvedFields: fields }) as { sectionName: string; sectionDescription: string; elements: Record<string, string>[]; resolvedFields: typeof fields })
            .catch((err) => {
              console.error(`[generate-cheat-sheets] Error for category ${cat.name}:`, err)
              return { sectionName: cat.name, sectionDescription: cat.description, elements: [] as Record<string, string>[], resolvedFields: fields }
            })
        }
        return generateForCategory(cat, context, label, instructionDirectives, debugPrompts)
          .then((r) => ({
            sectionName: r.categoryName,
            sectionDescription: r.categoryDescription,
            elements: r.entries as unknown as Record<string, string>[],
          }))
          .catch((err) => {
            console.error(`[generate-cheat-sheets] Error for category ${cat.name}:`, err)
            return { sectionName: cat.name, sectionDescription: cat.description, elements: [] as Record<string, string>[] }
          })
      })

      const allSections = await Promise.all(promises)
      const relevant = allSections.filter((s) => s.elements.length > 0)
      console.log(`[generate-cheat-sheets] ${relevant.length}/${categories.length} categories in ${Date.now() - startTime}ms (per-driver fields)`)
      return Response.json(withDebugMeta({ sections: relevant, _perDriverFields: true }, debugPrompts ?? []))
    }

    const promises = categories.map((category) =>
      generateForCategory(category, context, label, instructionDirectives, debugPrompts).catch((err) => {
        console.error(`[generate-cheat-sheets] Error for ${category.name}:`, err)
        return { categoryName: category.name, categoryDescription: category.description, entries: [] }
      })
    )

    const allCategories = await Promise.all(promises)
    const relevant = allCategories.filter((c) => c.entries.length > 0)

    console.log(`[generate-cheat-sheets] ${relevant.length}/${categories.length} categories in ${Date.now() - startTime}ms`)

    return Response.json(withDebugMeta({ categories: relevant }, debugPrompts ?? []))
  } catch (error) {
    console.error('[generate-cheat-sheets] Error:', error)
    return Response.json({ error: 'Failed to generate cheat sheet.' }, { status: 500 })
  }
}
