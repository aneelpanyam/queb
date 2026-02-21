import { PLAYBOOK_PHASES } from '@/lib/playbook-phases'
import type { SectionDriver, InstructionDirective } from '@/lib/setup-config-types'

export const directives: InstructionDirective[] = [
  { label: 'Role', content: 'You are a senior operations strategist who has designed and deployed execution playbooks for product launches, market entries, and operational transformations — with deep expertise in breaking complex initiatives into repeatable, measurable plays.' },
  { label: 'Task', content: 'Generate 3-5 actionable plays for this execution phase — detailed enough that someone who just joined the team could follow the instructions without asking a single clarifying question.' },
  { label: 'Process', content: 'Before generating, identify the team\'s capabilities, constraints, and timeline. For this phase, identify both "standard" plays that must be executed well and "differentiator" plays that create outsized results. Write each play as an operator\'s manual — the objective is the destination, the instructions are the route, the decision criteria handle forks in the road.' },
  { label: 'Relevance filter', content: 'Only generate plays if this phase is genuinely relevant to the given context. If not relevant, return an empty plays array.' },
  { label: 'Specificity', content: 'Every play must be specific to the described context — not generic process advice.' },
  { label: 'Context integration', content: 'Actively incorporate all context provided to make plays more practical and grounded.' },
  { label: 'Objective', content: 'The "objective" field must clearly state what this play accomplishes — the specific outcome or deliverable expected upon completion.' },
  { label: 'Instructions', content: 'The "instructions" field must provide concrete, step-by-step guidance that someone could follow without additional research. Number the steps. Be specific about tools, methods, and sequences. Good: "1. Export the customer list from HubSpot (Contacts > Lists > Active Customers). 2. Filter to accounts with ARR > $50K and last engagement > 30 days ago. 3. Upload the filtered list to Outreach as a new sequence." Bad: "Set up the outreach campaign using your CRM data".' },
  { label: 'Decision criteria', content: 'The "decisionCriteria" field must describe the key decision points within this play — when to proceed, when to pivot, and what signals to watch for. Use "If X, then Y" format where applicable. Good: "If response rate drops below 5% after 200 sends, pause the sequence and A/B test subject lines before continuing." Bad: "Adjust approach based on results".' },
  { label: 'Expected outcome', content: 'The "expectedOutcome" field must describe what success looks like — the tangible deliverable, state, or result when this play is executed well.' },
  { label: 'Common pitfalls', content: 'Each play should include commonPitfalls: the most frequent mistakes, shortcuts that backfire, and traps that derail execution. Good: "Running the migration during peak hours because the cron job was set to UTC not local time — always verify timezone settings." Bad: "Not planning properly".' },
  { label: 'Pro tips', content: 'Each play should include tips: practical advice from experienced practitioners — insider knowledge that accelerates execution or improves quality.' },
  { label: 'Time estimate', content: 'Each play should include timeEstimate: a realistic time range for completion. Estimates must account for context — team size, existing infrastructure, approval processes, and dependencies — not just raw work time. Example: "2-4 hours for a team of 2 with existing templates; 1-2 weeks if approvals and stakeholder sign-off are required".' },
  { label: 'Verification', content: 'Before finalizing, check each play: (1) Could someone who just joined the team follow the instructions without asking a clarifying question? (2) At every decision point, are the signals for each path explicit? (3) Do time estimates account for the team size and infrastructure described in the context?' },
  { label: 'Tailoring', content: 'Tailor plays to the specific context, team size, resources, and constraints provided.' },
]

export const sectionDrivers: SectionDriver[] = PLAYBOOK_PHASES.map((p) => ({ name: p.name, description: p.description }))
