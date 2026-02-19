import { generateText, Output } from 'ai'
import { z } from 'zod'

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
    })
  ),
  overallAssessment: z.string().describe('2-3 sentence assessment of the product quality and readiness'),
  completenessScore: z.number().min(0).max(100).describe('How complete/polished the product is (0-100)'),
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
    }

    const isSectionFocus = !!focusSection
    const focusSectionData = isSectionFocus
      ? sections.find((s) => s.name === focusSection)
      : null

    const sectionsBlock = sections
      .map(
        (s, i) =>
          `  ${i + 1}. "${s.name}" — ${s.description}\n     ${s.elementCount} elements${s.annotationCount ? `, ${s.annotationCount} annotations` : ''}. Samples: ${s.sampleElements.slice(0, 3).map((e) => `"${e}"`).join(', ')}`
      )
      .join('\n')

    const focusBlock = isSectionFocus && focusSectionData
      ? `\nFOCUS SECTION: "${focusSectionData.name}"
Description: ${focusSectionData.description}
Elements: ${focusSectionData.elementCount}
${focusSectionData.annotationCount ? `Annotations: ${focusSectionData.annotationCount}` : 'No annotations yet'}
All elements in this section:
${focusSectionData.sampleElements.map((e, i) => `  ${i + 1}. "${e}"`).join('\n')}\n`
      : ''

    const prompt = isSectionFocus
      ? `You are a product quality advisor and content strategist for AI-generated digital products.

Analyze a SPECIFIC SECTION of this digital product and provide deep, actionable suggestions focused on this section.

PRODUCT:
- Name: "${productName}"
- Description: "${productDescription || '(none)'}"
- Output Type: ${outputType}
- Context: ${contextSummary}

ALL SECTIONS (for context):
${sectionsBlock}
${focusBlock}
TASK:
Provide detailed, specific suggestions to improve the "${focusSection}" section. Go deep — analyze each element, identify gaps, and suggest concrete improvements.

PROVIDE SUGGESTIONS IN THESE CATEGORIES:
1. **Annotation** — Which specific elements in this section need expert notes, opinions, tips, warnings, or examples?
2. **Content** — Which specific elements need editing, rewording, or expansion? What's missing?
3. **Structure** — Should elements be reordered? Are there missing elements that should be added?
4. **Audience** — How can this section be better tailored to the target audience?
5. **Enrichment** — Which elements would benefit from deep dives, deeper questions, or other AI enrichment?

RULES:
- Be extremely specific: reference actual element content you can see.
- Every suggestion should have targetSection set to "${focusSection}".
- Suggest 5-8 highly actionable items.
- Focus on what transforms this section from generic AI output into expert-level content.
- The overallAssessment should be about this section specifically.
- The completenessScore should reflect this section's readiness (0-100).`
      : `You are a product quality advisor and content strategist for AI-generated digital products.

Analyze this digital product and provide specific, actionable suggestions to help the creator elevate it beyond raw AI-generated content into a polished, high-value product.

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
1. **Annotation** — Where should the creator add expert notes, opinions, tips, warnings, or examples? Which elements need human context that AI can't provide?
2. **Content** — Which elements need editing, rewording, or expansion? Are there gaps in the AI-generated content?
3. **Structure** — Should sections be reordered, merged, or split? Are there missing sections/perspectives?
4. **Audience** — How can the product be better tailored to its target audience? What language or framing adjustments would help?
5. **Distribution** — How should this product be packaged, shared, or monetized?
6. **Enrichment** — What additional AI-powered features (deep dives, deeper questions, etc.) should be used and where?

RULES:
- Be specific: reference actual section names and content patterns you see.
- Prioritize suggestions that add the most value with the least effort.
- Focus on what transforms AI output into a genuinely valuable product.
- Consider what a human expert would add that AI couldn't.
- Suggest 8-12 actionable items across categories.
- Be encouraging but honest about gaps.`

    const result = await generateText({
      model: 'openai/gpt-5.2',
      prompt,
      output: Output.object({ schema: suggestionSchema }),
    })

    return Response.json(result.output)
  } catch (error) {
    console.error('[product-assistant] Error:', error)
    return Response.json(
      { error: 'Failed to generate suggestions. Please try again.' },
      { status: 500 }
    )
  }
}
