import { generateText, Output } from 'ai'
import { z } from 'zod'
import { EMAIL_COURSE_STAGES } from '@/lib/email-course-stages'

export const maxDuration = 120

const singleStageSchema = z.object({
  moduleName: z.string().describe('The module/stage name'),
  moduleDescription: z.string().describe('What this module covers and what the reader will learn'),
  emails: z.array(
    z.object({
      subject: z.string().describe('A compelling email subject line'),
      body: z.string().describe('The full email body — educational, engaging, and actionable. Use paragraphs.'),
      callToAction: z.string().describe('A specific action the reader should take after reading'),
    })
  ),
})

async function generateForStage(
  stage: { name: string; description: string },
  context: { role: string; activity: string; situation: string; industry: string; service: string },
) {
  const { role, activity, situation, industry, service } = context

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt: `You are an expert email course creator and instructional designer.

CONTEXT:
- Industry: ${industry}
- Service: ${service}
- Role: ${role}
- Activity: ${activity}
- Situation: "${situation}"

TASK:
Generate 2-4 emails for the "${stage.name}" module of an email course.

MODULE DEFINITION:
${stage.name}: ${stage.description}

GUIDELINES:
- Each email should be self-contained but build on the overall module theme.
- Subject lines must be compelling and specific — avoid generic titles.
- Email bodies should be 150-300 words: educational, conversational, and packed with actionable insight.
- Include specific examples, frameworks, or tips relevant to this role and industry.
- Each email must end with a clear, specific call to action.
- Write as an expert peer, not a lecturer.
- If this stage is not very relevant to the context, still include at least 1 email.`,
    output: Output.object({ schema: singleStageSchema }),
  })

  return result.output
}

export async function POST(req: Request) {
  try {
    const { role, activity, situation, additionalContext, industry, service } = await req.json()
    console.log(`[generate-email-course] Role: ${role}, Activity: ${activity}`)

    const startTime = Date.now()

    const promises = EMAIL_COURSE_STAGES.map((stage) =>
      generateForStage(stage, { role, activity, situation, industry, service }).catch((err) => {
        console.error(`[generate-email-course] Error for ${stage.name}:`, err)
        return { moduleName: stage.name, moduleDescription: stage.description, emails: [] }
      })
    )

    const allModules = await Promise.all(promises)
    const relevant = allModules.filter((m) => m.emails.length > 0)

    console.log(`[generate-email-course] ${relevant.length}/${EMAIL_COURSE_STAGES.length} modules in ${Date.now() - startTime}ms`)

    return Response.json({ modules: relevant })
  } catch (error) {
    console.error('[generate-email-course] Error:', error)
    return Response.json({ error: 'Failed to generate email course.' }, { status: 500 })
  }
}
