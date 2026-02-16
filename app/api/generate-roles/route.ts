import { generateText, Output } from 'ai'
import { z } from 'zod'

export const maxDuration = 120

// Schema for department list (phase 1)
const departmentListSchema = z.object({
  departments: z.array(
    z.object({
      name: z.string().describe('The department or function name'),
      description: z.string().describe('A brief description of what this department does'),
    })
  ),
})

// Schema for a single department's roles (phase 2)
const singleDepartmentSchema = z.object({
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

export const rolesSchema = z.object({
  departments: z.array(singleDepartmentSchema),
})

// Phase 1: Identify departments
async function identifyDepartments(industry: string, service: string) {
  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt: `You are an organizational design expert.

For an organization in the "${industry}" industry that provides "${service}" as its core service, identify all the standard departments and functions that such an organization would typically have.

Be comprehensive and practical. Include departments like:
- Core service delivery departments specific to "${service}"
- Support functions (HR, Finance, Legal, IT, etc.)
- Strategy and leadership
- Operations and quality
- Sales, marketing, and business development
- Any industry-specific departments

Provide a list of 8-12 key departments with brief descriptions.`,
    output: Output.object({ schema: departmentListSchema }),
  })

  return result.output.departments
}

// Phase 2: Generate roles for a single department
async function generateRolesForDepartment(
  department: { name: string; description: string },
  context: {
    industry: string
    service: string
  }
) {
  const { industry, service } = context

  const result = await generateText({
    model: 'openai/gpt-5.2',
    prompt: `You are an organizational design expert.

For an organization in the "${industry}" industry that provides "${service}" as its core service:

Generate 3-6 key roles (positions) for the "${department.name}" department.

DEPARTMENT DESCRIPTION:
${department.description}

RULES:
- For each role, provide a clear title and a brief description of their primary responsibilities.
- Tailor roles to the specific duties and activities needed to deliver "${service}" within the "${industry}" industry.
- Include both senior/leadership roles and individual contributor roles where appropriate.
- Roles should be realistic and commonly found in this type of organization.`,
    output: Output.object({ schema: singleDepartmentSchema }),
  })

  return result.output
}

export async function POST(req: Request) {
  try {
    const { industry, service } = await req.json()
    console.log(`[generate-roles] Industry: ${industry}, Service: ${service}`)

    const startTime = Date.now()

    // Phase 1: Identify departments
    console.log(`[generate-roles] Phase 1: Identifying departments`)
    const departments = await identifyDepartments(industry, service)
    console.log(`[generate-roles] Identified ${departments.length} departments`)

    // Phase 2: Generate roles for all departments in parallel
    console.log(`[generate-roles] Phase 2: Generating roles for ${departments.length} departments in parallel`)
    const rolePromises = departments.map((department) =>
      generateRolesForDepartment(department, {
        industry,
        service,
      }).catch((error) => {
        console.error(`[generate-roles] Error for department ${department.name}:`, error)
        // Return a fallback department with empty roles on error
        return {
          departmentName: department.name,
          roles: [],
        }
      })
    )

    const allDepartments = await Promise.all(rolePromises)

    // Filter out departments with no roles (errors)
    const validDepartments = allDepartments.filter((d) => d.roles.length > 0)

    const duration = Date.now() - startTime
    console.log(
      `[generate-roles] Success: ${validDepartments.length}/${departments.length} departments in ${duration}ms`
    )

    return Response.json({ departments: validDepartments })
  } catch (error) {
    console.error('[generate-roles] Error:', error)
    return Response.json(
      { error: 'Failed to generate roles. Please try again.' },
      { status: 500 }
    )
  }
}
