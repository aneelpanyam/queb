import { generateText, Output } from 'ai'
import { z } from 'zod'
import { withDebugMeta, withUsageMeta } from '@/lib/ai-log-storage'

export const maxDuration = 120

const suggestionSchema = z.object({
  suggestions: z.array(
    z.object({
      category: z
        .enum(['annotation', 'content', 'structure', 'audience', 'distribution', 'enrichment'])
        .describe('Type of suggestion'),
      title: z.string().describe('Short actionable title'),
      description: z.string().describe('Detailed explanation of what to do and why'),
      priority: z.enum(['high', 'medium', 'low']).describe('How impactful this improvement would be'),
      actionType: z
        .enum(['add-annotation', 'edit-content', 'add-section', 'reorder', 'add-example', 'add-context', 'deep-dive', 'other'])
        .describe('The type of action the user should take'),
      targetSection: z.string().describe('Which section this applies to, or empty string if general'),
      targetElement: z.string().describe('Which specific element this applies to (short excerpt), or empty string if section-level or general'),
    })
  ),
  overallAssessment: z.string().describe('2-3 sentence assessment of the quality and readiness'),
  completenessScore: z.number().min(0).max(100).describe('How complete/polished this is (0-100)'),
})

export async function POST(req: Request) {
  try {
    const {
      productName,
      productDescription,
      outputType,
      contextSummary,
      sections,
      annotationCount,
      elementCount,
      hiddenCount,
      focusSection,
      focusElement,
    } = (await req.json()) as {
      productName: string
      productDescription: string
      outputType: string
      contextSummary: string
      sections: { name: string; description: string; elementCount: number; sampleElements: string[]; annotationCount?: number }[]
      annotationCount: number
      elementCount: number
      hiddenCount: number
      focusSection?: string
      focusElement?: { sectionName: string; content: string; fields: Record<string, string> }
    }

    const sectionsBlock = sections
      .map(
        (s, i) =>
          `  ${i + 1}. "${s.name}" — ${s.description}\n     ${s.elementCount} elements${s.annotationCount ? `, ${s.annotationCount} annotations` : ''}. Samples: ${s.sampleElements.slice(0, 3).map((e) => `"${e}"`).join(', ')}`
      )
      .join('\n')

    let prompt: string

    if (focusElement) {
      const fieldsBlock = Object.entries(focusElement.fields)
        .map(([k, v]) => `  - ${k}: "${v}"`)
        .join('\n')

      prompt = `You are a product quality advisor analyzing a SPECIFIC ELEMENT within a digital product.

PRODUCT: "${productName}" (${outputType})
CONTEXT: ${contextSummary}

SECTION: "${focusElement.sectionName}"

ELEMENT BEING ANALYZED:
${fieldsBlock}

ALL SECTIONS (for context):
${sectionsBlock}

TASK:
Provide deep, specific suggestions to improve this individual element. Think about:
- Is the content specific enough or too generic?
- What expert knowledge, real-world context, or examples would elevate this?
- What annotations (tips, warnings, expert notes, examples) should be added?
- How could the wording be sharpened for the target audience?
- What follow-up enrichments (deep dives, related questions) would add value?

RULES:
- Every suggestion must have targetSection set to "${focusElement.sectionName}" and targetElement referencing this element.
- Suggest 4-6 highly specific, actionable items.
- The overallAssessment should evaluate this specific element.
- The completenessScore should reflect this element's readiness (0-100).
- Be concrete: suggest actual wording changes, specific annotation content, etc.`
    } else if (focusSection) {
      const focusSectionData = sections.find((s) => s.name === focusSection)
      const focusBlock = focusSectionData
        ? `\nFOCUS SECTION: "${focusSectionData.name}"
Description: ${focusSectionData.description}
Elements: ${focusSectionData.elementCount}
${focusSectionData.annotationCount ? `Annotations: ${focusSectionData.annotationCount}` : 'No annotations yet'}
All elements in this section:
${focusSectionData.sampleElements.map((e, i) => `  ${i + 1}. "${e}"`).join('\n')}\n`
        : ''

      prompt = `You are a product quality advisor analyzing a SPECIFIC SECTION of a digital product.

PRODUCT: "${productName}" (${outputType})
CONTEXT: ${contextSummary}

ALL SECTIONS (for context):
${sectionsBlock}
${focusBlock}
TASK:
Provide detailed suggestions to improve the "${focusSection}" section. Analyze each element, identify gaps, and suggest concrete improvements.

PROVIDE SUGGESTIONS IN THESE CATEGORIES:
1. **Annotation** — Which specific elements need expert notes, opinions, tips, warnings, or examples?
2. **Content** — Which elements need editing, rewording, or expansion? What's missing?
3. **Structure** — Should elements be reordered? Are there missing elements?
4. **Audience** — How can this section be better tailored to the target audience?
5. **Enrichment** — Which elements would benefit from deep dives or other AI enrichment?

RULES:
- Be extremely specific: reference actual element content.
- Every suggestion must have targetSection set to "${focusSection}".
- Set targetElement to a short excerpt of the specific element when applicable, or empty string for section-wide suggestions.
- Suggest 5-8 highly actionable items.
- The overallAssessment should be about this section specifically.
- The completenessScore should reflect this section's readiness (0-100).`
    } else {
      prompt = `You are a product quality advisor for AI-generated digital products.

Analyze this product and provide specific, actionable suggestions to elevate it beyond raw AI-generated content.

PRODUCT:
- Name: "${productName}"
- Description: "${productDescription || '(none)'}"
- Output Type: ${outputType}
- Context: ${contextSummary}
- Total elements: ${elementCount}
- Hidden/curated out: ${hiddenCount}
- Annotations added: ${annotationCount}

SECTIONS:
${sectionsBlock}

PROVIDE SUGGESTIONS IN THESE CATEGORIES:
1. **Annotation** — Where should the creator add expert notes, opinions, tips, warnings, or examples?
2. **Content** — Which elements need editing, rewording, or expansion?
3. **Structure** — Should sections be reordered, merged, or split? Missing sections?
4. **Audience** — How to better tailor to the target audience?
5. **Distribution** — How to package, share, or monetize?
6. **Enrichment** — Where to use deep dives, deeper questions, etc.?

RULES:
- Be specific: reference actual section names and content patterns.
- Set targetSection to the relevant section name, or empty string for general suggestions.
- Set targetElement to a short excerpt when a suggestion targets a specific element, or empty string otherwise.
- Suggest 8-12 actionable items across categories.
- Be encouraging but honest about gaps.`
    }

    const result = await generateText({
      model: 'openai/gpt-5.2',
      prompt,
      output: Output.object({ schema: suggestionSchema }),
    })

    return Response.json(withUsageMeta(withDebugMeta(result.output as object, [prompt]), result.usage))
  } catch (error) {
    console.error('[product-assistant] Error:', error)
    return Response.json(
      { error: 'Failed to generate suggestions. Please try again.' },
      { status: 500 }
    )
  }
}
