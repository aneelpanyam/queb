import { generateText, Output } from 'ai'
import { z } from 'zod'

export const maxDuration = 120

export const rolesSchema = z.object({
  departments: z.array(
    z.object({
      departmentName: z.string().describe('The department or function name'),
      roles: z.array(
        z.object({
          name: z.string().describe('The role title'),
          description: z
            .string()
            .describe('A brief one-line description of this role'),
          icon: z
            .string()
            .describe(
              'A single relevant keyword for the role, like: leadership, technical, creative, analytical, operations, finance, marketing, design, engineering, medical, legal, education, sales, support, strategy'
            ),
        })
      ),
    })
  ),
})

export async function POST(req: Request) {
  try {
  const { industry, service } = await req.json()
  console.log(`[generate-roles] Industry: ${industry}, Service: ${service}`)

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt: `You are an organizational design expert.

For an organization in the "${industry}" industry that provides "${service}" as its core service:

1. Identify all the standard departments and functions that such an organization would typically have.
2. For each department, enumerate the key roles (positions) that exist within it, considering the specific duties and activities needed to deliver "${service}".

Be comprehensive and practical. Include departments like:
- Core service delivery departments specific to "${service}"
- Support functions (HR, Finance, Legal, IT, etc.)
- Strategy and leadership
- Operations and quality
- Sales, marketing, and business development
- Any industry-specific departments

For each role, provide a clear title and a brief description of their primary responsibilities in the context of delivering "${service}" within the "${industry}" industry.

Organize roles by department. Each department should have 3-6 roles.`,
    output: Output.object({ schema: rolesSchema }),
  })

  console.log(`[generate-roles] Success: ${result.output?.departments?.length || 0} departments`)
  return Response.json(result.output)
  } catch (error) {
    console.error('[generate-roles] Error:', error)
    return Response.json(
      { error: 'Failed to generate roles. Please try again.' },
      { status: 500 }
    )
  }
}
