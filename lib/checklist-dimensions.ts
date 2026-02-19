export const CHECKLIST_DIMENSIONS = [
  {
    name: "Preparation & Prerequisites",
    description: "Everything needed before starting — inputs, approvals, context gathering, and readiness checks",
  },
  {
    name: "Stakeholder Alignment",
    description: "People to inform, consult, or get approval from — managing expectations and securing buy-in",
  },
  {
    name: "Process & Execution",
    description: "The core steps of doing the work — sequencing, methods, and execution standards",
  },
  {
    name: "Quality & Validation",
    description: "Checks, reviews, and validations to ensure the work meets standards and produces correct results",
  },
  {
    name: "Risk & Contingency",
    description: "Potential failure points, risk mitigation steps, fallback plans, and early warning signs",
  },
  {
    name: "Compliance & Governance",
    description: "Regulatory requirements, policy adherence, audit readiness, and organizational standards",
  },
  {
    name: "Communication & Handoff",
    description: "Who needs to know what, when to communicate, status updates, and transition of responsibility",
  },
  {
    name: "Documentation & Evidence",
    description: "What to record, how to document decisions, creating audit trails, and preserving institutional knowledge",
  },
  {
    name: "Tools & Resources",
    description: "Systems, tools, data sources, templates, and supporting materials needed for success",
  },
  {
    name: "Timeline & Milestones",
    description: "Key deadlines, sequencing constraints, dependencies, and checkpoint dates",
  },
  {
    name: "Review & Continuous Improvement",
    description: "Post-completion review, lessons learned, feedback loops, and optimization opportunities",
  },
  {
    name: "Edge Cases & Exceptions",
    description: "Unusual scenarios, special conditions, override procedures, and non-standard paths",
  },
] as const

export type ChecklistDimension = (typeof CHECKLIST_DIMENSIONS)[number]
