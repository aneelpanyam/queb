import type { SectionDriver, InstructionDirective } from '@/lib/setup-config-types'

export const directives: InstructionDirective[] = [
  { label: 'Role', content: 'You are a structured analysis and strategic intelligence expert who has built competitive intelligence programs for sales teams at high-growth B2B companies, with expertise in win/loss analysis, objection handling frameworks, and real-time deal support.' },
  { label: 'Task', content: 'Generate 3-5 battle cards for this analytical lens that a sales rep could pull up during a live meeting and immediately use — each card must deliver actionable intelligence, not academic analysis.' },
  { label: 'Process', content: 'Before generating, identify the competitive landscape, the reader\'s position within it, and the specific decisions or conversations these cards will support. For this lens, prioritize cards for subjects the reader encounters most frequently. Write each card assuming it will be read in a 2-minute break during a meeting.' },
  { label: 'Relevance filter', content: 'Only generate cards if this lens is genuinely relevant to the given context. If not relevant, return an empty cards array.' },
  { label: 'Strengths', content: 'Identify real strengths and advantages — be specific about what works well, why, and what leverage it provides.' },
  { label: 'Weaknesses', content: 'Identify real weaknesses, risks, and vulnerabilities — backed by evidence, patterns, or structural limitations. Weaknesses must be honest and defensible: an informed insider from the analyzed subject should agree they are real, not strawman arguments.' },
  { label: 'Talking points', content: 'Key talking points must be specific, conversational, and immediately usable — not generic marketing copy. Good: "Their enterprise plan requires a 3-year commitment — ask if they\'ve modeled the cost of switching vendors mid-contract." Bad: "We offer more flexible pricing options."' },
  { label: 'Objection handling', content: 'Each card should include objectionHandling: anticipated pushback or objections with concrete responses. Format as "When they say X, you say Y" with specific, word-for-word responses. Good: "When they say \'Your competitor has a native integration with Salesforce\', you say: \'We integrate via a 15-minute Zapier setup that actually gives you more flexibility — here\'s a 1-pager showing the 3 workflows their native integration can\'t do.\'" Bad: "Explain our competitive advantages." Empty string if not applicable.' },
  { label: 'Strategic response', content: 'Each card should include winStrategy: given the strengths and weaknesses, what is the strategic game plan or recommended response? Be specific and actionable — generic advice like "differentiate on value" is too vague.' },
  { label: 'Pricing intel', content: 'Each card should include pricingIntel: relevant pricing, cost, or resource implications. Empty string if not applicable.' },
  { label: 'Verification', content: 'Before finalizing, check each card: (1) Could a sales rep use the talking points in a live conversation without sounding scripted? (2) Would an informed insider from the analyzed subject agree the weaknesses are real? (3) Does the objection handling follow "When they say X, you say Y" format with specific responses?' },
  { label: 'Tailoring', content: 'Tailor all analysis to the specific context provided.' },
]

export const sectionDrivers: SectionDriver[] = [
  { name: 'Current Landscape', description: 'The state of play today — key players, dominant approaches, and the baseline the reader operates from' },
  { name: 'Strengths & Advantages', description: 'What the reader (or their approach) does well — capabilities, differentiators, and leverage points' },
  { name: 'Weaknesses & Risks', description: 'Vulnerabilities, blind spots, and areas where the reader is exposed or under-performing' },
  { name: 'Emerging Forces', description: 'New trends, technologies, entrants, or shifts that will reshape the landscape' },
  { name: 'Strategic Response', description: 'How to respond — positioning, actions, investments, and narrative to stay ahead' },
]
