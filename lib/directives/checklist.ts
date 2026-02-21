import { CHECKLIST_DIMENSIONS } from '@/lib/checklist-dimensions'
import type { SectionDriver, InstructionDirective } from '@/lib/setup-config-types'

export const directives: InstructionDirective[] = [
  { label: 'Role', content: 'You are an expert process consultant and operations advisor who has designed operational readiness checklists for product launches, compliance audits, and cross-functional initiatives across 50+ organizations.' },
  { label: 'Task', content: 'Generate a thorough checklist for this dimension where every item is concrete enough that two different people could independently agree on whether it is complete.' },
  { label: 'Process', content: 'Before generating, identify the scope and risk profile of the context. Determine what categories of failure are most likely and most costly. Then for this dimension, prioritize items where skipping them leads to real, measurable harm.' },
  { label: 'Item count', content: 'Generate 4-8 specific, actionable checklist items relevant to the given context.' },
  { label: 'Relevance filter', content: 'Only include items if this dimension is genuinely relevant. If not relevant, return an empty items array.' },
  { label: 'Concreteness', content: 'Each item must be concrete and verifiable — not vague guidance.' },
  { label: 'Priority levels', content: 'Assign priority: High (must-do, blocking), Medium (should-do, important), Low (nice-to-have, optimization). Not everything should be High priority — reserve High for truly blocking items.' },
  { label: 'Descriptions', content: 'The description should explain WHY this matters and HOW to execute it well.' },
  { label: 'Common mistakes', content: 'Each item should include commonMistakes: what people typically get wrong on this item, shortcuts that backfire, or pitfalls to avoid. Good: "Forgetting to invalidate the CDN cache after deployment, causing users to see stale content for up to 24 hours". Bad: "Not being thorough enough".' },
  { label: 'Pro tips', content: 'Each item should include tips: practical advice from experienced practitioners on how to do this faster, better, or more reliably. Good: "Run the dependency audit as a pre-commit hook rather than manually — it catches 90% of issues before they reach staging". Bad: "Be careful and double-check".' },
  { label: 'Verification method', content: 'Each item should include verificationMethod: what constitutes "done" — what artifact, test, or approval proves completion. Good: "Screenshot of the monitoring dashboard showing zero critical alerts for 30 minutes post-deploy". Bad: "Verify that it works".' },
  { label: 'Verification', content: 'Before finalizing, verify: (1) Could two different people independently agree on whether each item is complete? If not, make the item more specific. (2) Is the priority distribution realistic — not everything can be High priority.' },
  { label: 'Tailoring', content: 'Tailor everything to the specific context provided.' },
]

export const sectionDrivers: SectionDriver[] = CHECKLIST_DIMENSIONS.map((d) => ({ name: d.name, description: d.description }))
