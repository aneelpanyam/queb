// ============================================================
// Dynamic Output Type Library — each output type has a
// generation prompt, schema of fields, and display config.
// Prompts use {{fieldId}} placeholders resolved at generation time.
// ============================================================

import { BUSINESS_PERSPECTIVES } from '@/lib/perspectives'
import { CHECKLIST_DIMENSIONS } from '@/lib/checklist-dimensions'
import { EMAIL_COURSE_STAGES } from '@/lib/email-course-stages'
import { PROMPT_USE_CASES } from '@/lib/prompt-use-cases'
import { DECISION_DOMAINS } from '@/lib/decision-domains'
import { DOSSIER_SECTIONS } from '@/lib/dossier-sections'
import { PLAYBOOK_PHASES } from '@/lib/playbook-phases'
import { CHEAT_SHEET_CATEGORIES } from '@/lib/cheat-sheet-categories'
import type { SectionDriver, InstructionDirective } from '@/lib/setup-config-types'

export type FieldColor = 'amber' | 'blue' | 'red' | 'green' | 'emerald' | 'violet' | 'primary' | 'none'

export interface OutputTypeField {
  key: string
  label: string
  type: 'short-text' | 'long-text'
  primary?: boolean
  color?: FieldColor
  icon?: string
}

export interface OutputTypeDefinition {
  id: string
  name: string
  description: string
  icon: string
  prompt: string
  sectionLabel: string
  elementLabel: string
  fields: OutputTypeField[]
  supportsDeepDive?: boolean
  supportsDeeperQuestions?: boolean
  defaultSectionDrivers?: SectionDriver[]
  defaultInstructionDirectives?: InstructionDirective[]
  isBuiltIn: boolean
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'queb-output-type-library'

const SEED_OUTPUT_TYPES: Omit<OutputTypeDefinition, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'questions',
    name: 'Question Book',
    description: 'Multi-perspective questions with thinking frameworks, checklists, and resources',
    icon: 'BookOpen',
    prompt: `You are an expert thinking coach and organizational consultant.

TASK:
Generate thoughtful, probing questions organized by business perspective.

GUIDELINES:
- Generate 3-5 questions per relevant perspective
- Every question must be specific to the described context, not generic
- Each question must include all requested element fields
- Questions should provoke deep thinking and help uncover blind spots
- Tailor questions to the specific context provided`,
    sectionLabel: 'Perspective',
    elementLabel: 'Question',
    fields: [
      { key: 'question', label: 'Question', type: 'long-text', primary: true },
      { key: 'relevance', label: 'Why This Matters', type: 'long-text', color: 'amber', icon: 'Target' },
      { key: 'infoPrompt', label: 'How to Find the Answer', type: 'long-text', color: 'blue', icon: 'ArrowUpRight' },
      { key: 'actionSteps', label: 'What to Do With the Answer', type: 'long-text', color: 'emerald', icon: 'ListChecks' },
      { key: 'redFlags', label: 'Red Flags to Watch For', type: 'long-text', color: 'red', icon: 'AlertTriangle' },
      { key: 'keyMetrics', label: 'Key Metrics to Track', type: 'short-text', color: 'violet', icon: 'BarChart3' },
    ],
    supportsDeepDive: true,
    supportsDeeperQuestions: true,
    defaultSectionDrivers: BUSINESS_PERSPECTIVES.map((p) => ({ name: p.name, description: p.description })),
    isBuiltIn: true,
  },
  {
    id: 'checklist',
    name: 'Checklist',
    description: 'Actionable checklists organized by category with priority levels',
    icon: 'CheckSquare',
    prompt: `You are a process and operations expert.

TASK:
Generate a comprehensive, actionable checklist organized by category.

GUIDELINES:
- Create 4-6 categories relevant to the given context
- Each category should have 5-8 specific, actionable items
- Include priority levels (High, Medium, Low) for each item
- Items should be concrete and verifiable, not vague
- Consider compliance, best practices, and common pitfalls`,
    sectionLabel: 'Category',
    elementLabel: 'Item',
    fields: [
      { key: 'item', label: 'Checklist Item', type: 'short-text', primary: true },
      { key: 'description', label: 'Description', type: 'long-text', color: 'blue', icon: 'Shield' },
      { key: 'priority', label: 'Priority', type: 'short-text', color: 'amber', icon: 'Zap' },
      { key: 'commonMistakes', label: 'Common Mistakes', type: 'long-text', color: 'red', icon: 'AlertOctagon' },
      { key: 'tips', label: 'Pro Tips', type: 'long-text', color: 'amber', icon: 'Lightbulb' },
      { key: 'verificationMethod', label: 'How to Verify', type: 'short-text', color: 'emerald', icon: 'ClipboardCheck' },
    ],
    supportsDeepDive: true,
    defaultSectionDrivers: CHECKLIST_DIMENSIONS.map((d) => ({ name: d.name, description: d.description })),
    isBuiltIn: true,
  },
  {
    id: 'email-course',
    name: 'Email Course',
    description: 'Multi-part email sequences for nurturing, onboarding, or education',
    icon: 'Mail',
    prompt: `You are an email marketing and education expert.

TASK:
Create a structured email course with modules and individual emails.

GUIDELINES:
- Create 3-5 modules, each representing a learning theme
- Each module should have 3-5 emails
- Each email needs a compelling subject line, educational body, and clear call to action
- The course should build progressively from foundations to advanced concepts
- Tailor content to the specific context and audience provided`,
    sectionLabel: 'Module',
    elementLabel: 'Email',
    fields: [
      { key: 'subject', label: 'Subject Line', type: 'short-text', primary: true },
      { key: 'body', label: 'Email Body', type: 'long-text', color: 'none', icon: 'Mail' },
      { key: 'callToAction', label: 'Call to Action', type: 'short-text', color: 'primary', icon: 'ArrowUpRight' },
      { key: 'keyTakeaway', label: 'Key Takeaway', type: 'short-text', color: 'violet', icon: 'Bookmark' },
      { key: 'subjectLineVariants', label: 'Subject Line Alternatives', type: 'long-text', color: 'amber', icon: 'Repeat' },
      { key: 'sendTiming', label: 'Recommended Send Timing', type: 'short-text', color: 'blue', icon: 'CalendarClock' },
    ],
    supportsDeepDive: true,
    defaultSectionDrivers: EMAIL_COURSE_STAGES.map((s) => ({ name: s.name, description: s.description })),
    isBuiltIn: true,
  },
  {
    id: 'prompts',
    name: 'Prompt Pack',
    description: 'Curated AI prompt templates for specific roles and tasks',
    icon: 'Sparkles',
    prompt: `You are an AI prompt engineering expert.

TASK:
Create a collection of ready-to-use AI prompts organized by use-case category.

GUIDELINES:
- Create 4-6 categories of prompts relevant to the given context
- Each category should have 3-5 specific prompts
- Each prompt should be a complete, copy-paste-ready template
- Include context about when to use each prompt and what output to expect
- Prompts should leverage domain knowledge and terminology from the provided context`,
    sectionLabel: 'Category',
    elementLabel: 'Prompt',
    fields: [
      { key: 'prompt', label: 'Prompt', type: 'long-text', primary: true },
      { key: 'context', label: 'When to Use', type: 'long-text', color: 'amber', icon: 'Target' },
      { key: 'expectedOutput', label: 'Expected Output', type: 'long-text', color: 'emerald', icon: 'CheckCheck' },
      { key: 'variations', label: 'Prompt Variations', type: 'long-text', color: 'violet', icon: 'Shuffle' },
      { key: 'tips', label: 'Tips for Better Results', type: 'long-text', color: 'amber', icon: 'Lightbulb' },
      { key: 'exampleOutput', label: 'Example Output Snippet', type: 'long-text', color: 'emerald', icon: 'FileText' },
    ],
    supportsDeepDive: true,
    defaultSectionDrivers: PROMPT_USE_CASES.map((u) => ({ name: u.name, description: u.description })),
    isBuiltIn: true,
  },
  {
    id: 'battle-cards',
    name: 'Battle Cards',
    description: 'Competitive intelligence cards for sales teams',
    icon: 'Swords',
    prompt: `You are a competitive intelligence and sales enablement expert.

TASK:
Create battle cards organized by competitor or competitive theme.

GUIDELINES:
- Create 4-6 competitor or competitive theme sections
- Each section should have 3-5 intelligence cards
- Each card needs a clear title, strength/weakness analysis, and talking points
- Focus on actionable intelligence that sales teams can use in conversations
- Include specific differentiators and objection handlers`,
    sectionLabel: 'Competitor',
    elementLabel: 'Card',
    fields: [
      { key: 'title', label: 'Card Title', type: 'short-text', primary: true },
      { key: 'strengths', label: 'Their Strengths', type: 'long-text', color: 'red', icon: 'ThumbsUp' },
      { key: 'weaknesses', label: 'Their Weaknesses', type: 'long-text', color: 'green', icon: 'ThumbsDown' },
      { key: 'talkingPoints', label: 'Your Talking Points', type: 'long-text', color: 'primary', icon: 'MessageSquare' },
      { key: 'objectionHandling', label: 'Objection Handling', type: 'long-text', color: 'amber', icon: 'ShieldQuestion' },
      { key: 'winStrategy', label: 'How to Win', type: 'long-text', color: 'primary', icon: 'Trophy' },
      { key: 'pricingIntel', label: 'Pricing & Packaging Intel', type: 'long-text', color: 'emerald', icon: 'DollarSign' },
    ],
    supportsDeepDive: true,
    defaultSectionDrivers: [
      { name: 'Direct Competitors', description: 'Head-to-head competitors offering similar products or services to the same target market' },
      { name: 'Indirect Competitors', description: 'Alternative solutions or substitute approaches that solve the same underlying problem differently' },
      { name: 'Emerging Threats', description: 'New entrants, disruptors, or adjacent players expanding into this space' },
      { name: 'DIY & Status Quo', description: 'The option to do nothing, build in-house, or continue with current manual processes' },
      { name: 'Positioning & Differentiation', description: 'How to position against the competitive landscape — unique value, messaging, and strategic narrative' },
    ],
    isBuiltIn: true,
  },
  {
    id: 'decision-books',
    name: 'Decision Book',
    description: 'Structured decision guides organized by domain with options, trade-offs, and decision criteria',
    icon: 'Scale',
    prompt: `You are a senior decision strategist and organizational advisor.

TASK:
Generate key decisions organized by decision domain that must be navigated in the given context.

GUIDELINES:
- Generate 3-5 decisions per relevant domain
- Every decision must be specific to the described context, not generic
- Each decision must include why it matters, what the realistic options and trade-offs are, and what criteria should guide the choice
- Decisions should surface the hard choices that often go unexamined
- Tailor decisions to the specific context, constraints, and authority level provided`,
    sectionLabel: 'Decision Domain',
    elementLabel: 'Decision',
    fields: [
      { key: 'decision', label: 'The Decision', type: 'long-text', primary: true },
      { key: 'context', label: 'Why This Decision Matters', type: 'long-text', color: 'amber', icon: 'Info' },
      { key: 'options', label: 'Key Options & Trade-offs', type: 'long-text', color: 'violet', icon: 'GitBranch' },
      { key: 'criteria', label: 'Decision Criteria', type: 'long-text', color: 'emerald', icon: 'Target' },
      { key: 'risks', label: 'Risks & Failure Modes', type: 'long-text', color: 'red', icon: 'AlertTriangle' },
      { key: 'stakeholders', label: 'Key Stakeholders & Impact', type: 'long-text', color: 'blue', icon: 'Users' },
      { key: 'recommendation', label: 'Recommended Path', type: 'long-text', color: 'primary', icon: 'Compass' },
    ],
    supportsDeepDive: true,
    supportsDeeperQuestions: true,
    defaultSectionDrivers: DECISION_DOMAINS.map((d) => ({ name: d.name, description: d.description })),
    isBuiltIn: true,
  },
  {
    id: 'dossier',
    name: 'Dossier',
    description: 'Comprehensive intelligence briefings organized by research area with findings, implications, and evidence',
    icon: 'FileSearch',
    prompt: `You are a senior intelligence analyst and strategic research expert.

TASK:
Generate a comprehensive dossier organized by intelligence area.

GUIDELINES:
- Create thorough briefings for each intelligence area relevant to the context
- Each briefing must include a clear title, summary, key findings, and strategic implications
- Ground all analysis in evidence and observable signals, not speculation
- Surface both risks and opportunities with equal rigor
- Tailor the depth and focus to the specific context provided`,
    sectionLabel: 'Intelligence Area',
    elementLabel: 'Briefing',
    fields: [
      { key: 'title', label: 'Briefing Title', type: 'short-text', primary: true },
      { key: 'summary', label: 'Executive Summary', type: 'long-text', color: 'blue', icon: 'FileText' },
      { key: 'keyFindings', label: 'Key Findings', type: 'long-text', color: 'violet', icon: 'Search' },
      { key: 'strategicImplications', label: 'Strategic Implications', type: 'long-text', color: 'amber', icon: 'Target' },
      { key: 'evidence', label: 'Evidence & Sources', type: 'long-text', color: 'emerald', icon: 'BookOpen' },
      { key: 'riskAssessment', label: 'Risk Assessment', type: 'long-text', color: 'red', icon: 'AlertTriangle' },
      { key: 'opportunities', label: 'Opportunities', type: 'long-text', color: 'green', icon: 'TrendingUp' },
    ],
    supportsDeepDive: true,
    defaultSectionDrivers: DOSSIER_SECTIONS.map((s) => ({ name: s.name, description: s.description })),
    isBuiltIn: true,
  },
  {
    id: 'playbook',
    name: 'Playbook',
    description: 'Step-by-step operational execution guides organized by phase with instructions, decision criteria, and tips',
    icon: 'BookMarked',
    prompt: `You are a senior operations strategist and execution expert.

TASK:
Generate a comprehensive playbook organized by execution phase.

GUIDELINES:
- Create 3-5 actionable plays per phase relevant to the context
- Each play must include clear objectives, step-by-step instructions, and expected outcomes
- Include decision criteria for key branching points
- Surface common pitfalls and practical tips from experienced practitioners
- Tailor everything to the specific context, constraints, and resources provided`,
    sectionLabel: 'Phase',
    elementLabel: 'Play',
    fields: [
      { key: 'title', label: 'Play Title', type: 'short-text', primary: true },
      { key: 'objective', label: 'Objective', type: 'long-text', color: 'blue', icon: 'Target' },
      { key: 'instructions', label: 'Step-by-Step Instructions', type: 'long-text', color: 'none', icon: 'ListOrdered' },
      { key: 'decisionCriteria', label: 'Decision Criteria', type: 'long-text', color: 'violet', icon: 'GitBranch' },
      { key: 'expectedOutcome', label: 'Expected Outcome', type: 'long-text', color: 'emerald', icon: 'CheckCircle' },
      { key: 'commonPitfalls', label: 'Common Pitfalls', type: 'long-text', color: 'red', icon: 'AlertOctagon' },
      { key: 'tips', label: 'Pro Tips', type: 'long-text', color: 'amber', icon: 'Lightbulb' },
      { key: 'timeEstimate', label: 'Time Estimate', type: 'short-text', color: 'blue', icon: 'Clock' },
    ],
    supportsDeepDive: true,
    defaultSectionDrivers: PLAYBOOK_PHASES.map((p) => ({ name: p.name, description: p.description })),
    isBuiltIn: true,
  },
  {
    id: 'cheat-sheets',
    name: 'Cheat Sheet',
    description: 'Concise quick-reference cards organized by category with definitions, examples, and shortcuts',
    icon: 'Zap',
    prompt: `You are an expert educator and knowledge distiller.

TASK:
Generate a concise, scannable cheat sheet organized by reference category.

GUIDELINES:
- Create 4-8 entries per category, optimized for at-a-glance use
- Each entry must be dense and practical — no fluff or filler
- Include concrete examples and common mistakes for each entry
- Prioritize the most important, most-referenced information
- Tailor terminology and examples to the specific context provided`,
    sectionLabel: 'Category',
    elementLabel: 'Entry',
    fields: [
      { key: 'term', label: 'Term / Concept', type: 'short-text', primary: true },
      { key: 'definition', label: 'Definition', type: 'long-text', color: 'blue', icon: 'BookOpen' },
      { key: 'example', label: 'Example / Usage', type: 'long-text', color: 'emerald', icon: 'Code' },
      { key: 'relatedConcepts', label: 'Related Concepts', type: 'short-text', color: 'violet', icon: 'Link' },
      { key: 'commonMistakes', label: 'Common Mistakes', type: 'long-text', color: 'red', icon: 'AlertTriangle' },
      { key: 'quickTip', label: 'Quick Tip', type: 'short-text', color: 'amber', icon: 'Lightbulb' },
    ],
    supportsDeepDive: true,
    defaultSectionDrivers: CHEAT_SHEET_CATEGORIES.map((c) => ({ name: c.name, description: c.description })),
    isBuiltIn: true,
  },
]

// ============================================================
// Storage with auto-seeding
// ============================================================

function ensureSeeded(): OutputTypeDefinition[] {
  if (typeof window === 'undefined') return []
  const now = new Date().toISOString()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      const stored: OutputTypeDefinition[] = JSON.parse(raw)
      const storedIds = new Set(stored.map((t) => t.id))
      const missing = SEED_OUTPUT_TYPES.filter((s) => !storedIds.has(s.id))
      if (missing.length > 0) {
        const newEntries = missing.map((o) => ({ ...o, createdAt: now, updatedAt: now }))
        const merged = [...stored, ...newEntries]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
        return merged
      }
      return stored
    } catch {
      /* fall through */
    }
  }
  const seeded: OutputTypeDefinition[] = SEED_OUTPUT_TYPES.map((o) => ({
    ...o,
    createdAt: now,
    updatedAt: now,
  }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
  return seeded
}

function persist(types: OutputTypeDefinition[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(types))
}

function getAll(): OutputTypeDefinition[] {
  return ensureSeeded()
}

function getById(id: string): OutputTypeDefinition | undefined {
  return getAll().find((t) => t.id === id)
}

function save(ot: Omit<OutputTypeDefinition, 'createdAt' | 'updatedAt'>): OutputTypeDefinition {
  const types = getAll()
  const now = new Date().toISOString()
  const newOt: OutputTypeDefinition = { ...ot, createdAt: now, updatedAt: now }
  types.push(newOt)
  persist(types)
  return newOt
}

function update(
  id: string,
  updates: Partial<Omit<OutputTypeDefinition, 'id' | 'createdAt'>>,
): OutputTypeDefinition | undefined {
  const types = getAll()
  const idx = types.findIndex((t) => t.id === id)
  if (idx === -1) return undefined
  types[idx] = { ...types[idx], ...updates, updatedAt: new Date().toISOString() }
  persist(types)
  return types[idx]
}

function remove(id: string): boolean {
  const types = getAll()
  const ot = types.find((t) => t.id === id)
  if (!ot || ot.isBuiltIn) return false
  persist(types.filter((t) => t.id !== id))
  return true
}

export const outputTypeStorage = { getAll, getById, save, update, remove }

export function getPrimaryField(ot: OutputTypeDefinition): OutputTypeField {
  return ot.fields.find((f) => f.primary) || ot.fields[0]
}

// ============================================================
// Default instruction directives per built-in output type.
// Each directive is a discrete, editable rule the AI follows.
// ============================================================

const BUILTIN_INSTRUCTION_DIRECTIVES: Record<string, InstructionDirective[]> = {
  questions: [
    { label: 'Role', content: 'You are an expert thinking coach and organizational consultant.' },
    { label: 'Task', content: 'Generate 3-5 thoughtful, probing questions from this perspective.' },
    { label: 'Relevance filter', content: 'Only generate questions if this perspective is genuinely relevant to the given context. If not relevant, return an empty questions array.' },
    { label: 'Specificity', content: 'Every question must be specific to the described context, not generic.' },
    { label: 'Context integration', content: 'Actively incorporate all context provided to make questions sharper and more actionable.' },
    { label: 'Relevance notes', content: 'Each question must come with a relevance note explaining why this question matters for this specific context and what kind of insight it can unlock.' },
    { label: 'Actionable info prompts', content: 'Each question must include an infoPrompt: a practical guidance note telling the user exactly what data sources, documents, people, metrics, tools, or analysis methods they should consult to answer the question well. Be highly specific (e.g., "Review your Q3 customer churn report and compare against industry benchmarks from Gartner" rather than "Look at your data").' },
    { label: 'Action steps', content: 'Each question should include actionSteps: once the answer is known, what concrete actions should be taken. Bridge the gap between insight and action.' },
    { label: 'Red flags', content: 'Each question should include redFlags: warning signs or problematic answers to watch for. What danger signals indicate a serious risk?' },
    { label: 'Key metrics', content: 'Each question should include keyMetrics: specific KPIs, benchmarks, or numbers the user should reference when answering.' },
    { label: 'Deep thinking', content: 'Questions should provoke deep thinking and help uncover blind spots.' },
    { label: 'Tailoring', content: 'Tailor questions to the specific context fields provided.' },
  ],
  checklist: [
    { label: 'Role', content: 'You are an expert process consultant and operations advisor.' },
    { label: 'Task', content: 'Generate a thorough checklist for this dimension.' },
    { label: 'Item count', content: 'Generate 4-8 specific, actionable checklist items relevant to the given context.' },
    { label: 'Relevance filter', content: 'Only include items if this dimension is genuinely relevant. If not relevant, return an empty items array.' },
    { label: 'Concreteness', content: 'Each item must be concrete and verifiable — not vague guidance.' },
    { label: 'Priority levels', content: 'Assign priority: High (must-do, blocking), Medium (should-do, important), Low (nice-to-have, optimization).' },
    { label: 'Descriptions', content: 'The description should explain WHY this matters and HOW to execute it well.' },
    { label: 'Common mistakes', content: 'Each item should include commonMistakes: what people typically get wrong on this item, shortcuts that backfire, or pitfalls to avoid.' },
    { label: 'Pro tips', content: 'Each item should include tips: practical advice from experienced practitioners on how to do this faster, better, or more reliably.' },
    { label: 'Verification', content: 'Each item should include verificationMethod: what constitutes "done" — what artifact, test, or approval proves completion.' },
    { label: 'Tailoring', content: 'Tailor everything to the specific context provided.' },
  ],
  'email-course': [
    { label: 'Role', content: 'You are an expert email course creator and instructional designer.' },
    { label: 'Task', content: 'Generate 2-4 emails for this module of an email course.' },
    { label: 'Self-contained', content: 'Each email should be self-contained but build on the overall module theme.' },
    { label: 'Subject lines', content: 'Subject lines must be compelling and specific — avoid generic titles.' },
    { label: 'Email body length', content: 'Email bodies should be 150-300 words: educational, conversational, and packed with actionable insight.' },
    { label: 'Examples', content: 'Include specific examples, frameworks, or tips relevant to the provided context.' },
    { label: 'Call to action', content: 'Each email must end with a clear, specific call to action.' },
    { label: 'Key takeaway', content: 'Each email should include keyTakeaway: the single most important lesson — a TL;DR the reader can remember.' },
    { label: 'Subject alternatives', content: 'Each email should include subjectLineVariants: 2-3 alternative subject lines with different angles (curiosity, urgency, benefit-driven).' },
    { label: 'Send timing', content: 'Each email should include sendTiming: when in the sequence this email should go out (e.g., "Day 3" or "2 days after previous").' },
    { label: 'Tone', content: 'Write as an expert peer, not a lecturer.' },
    { label: 'Minimum output', content: 'If this module is not very relevant to the context, still include at least 1 email.' },
  ],
  prompts: [
    { label: 'Role', content: 'You are an expert AI prompt engineer who creates highly effective prompt templates.' },
    { label: 'Task', content: 'Generate 3-5 ready-to-use AI prompt templates for this use case.' },
    { label: 'Copy-paste ready', content: 'Each prompt must be complete and copy-paste ready — a user should be able to use it immediately.' },
    { label: 'Placeholders', content: 'Include [bracketed placeholders] where the user needs to fill in specifics.' },
    { label: 'Domain knowledge', content: 'Prompts should leverage domain knowledge and terminology relevant to the provided context.' },
    { label: 'Context field', content: 'The "context" field should describe the specific trigger or situation when this prompt is most useful.' },
    { label: 'Expected output', content: 'The "expectedOutput" should set realistic expectations for what the AI will produce.' },
    { label: 'Variations', content: 'Each prompt should include variations: 2-3 alternative versions for different scenarios (quick vs. deep, formal vs. casual).' },
    { label: 'Tips', content: 'Each prompt should include tips: practical advice for getting better results (e.g., "Add your company name for specificity").' },
    { label: 'Example output', content: 'Each prompt should include exampleOutput: a short sample of what good output looks like to set expectations.' },
    { label: 'Complexity range', content: 'Vary the complexity — include both quick tactical prompts and deeper strategic ones.' },
    { label: 'Minimum output', content: 'If this use case is not very relevant, still include at least 1 prompt.' },
  ],
  'battle-cards': [
    { label: 'Role', content: 'You are a competitive intelligence and sales enablement expert.' },
    { label: 'Task', content: 'Generate 3-5 battle cards for this competitive section.' },
    { label: 'Relevance filter', content: 'Only generate cards if this competitive section is genuinely relevant to the given context. If not relevant, return an empty cards array.' },
    { label: 'Honesty', content: 'Be honest about competitor strengths — credibility requires acknowledging where they excel.' },
    { label: 'Weaknesses', content: 'Identify real weaknesses backed by common customer complaints, architectural limitations, or market gaps — not straw-man arguments.' },
    { label: 'Talking points', content: 'Talking points must be specific, conversational, and usable in a live sales call — not marketing copy.' },
    { label: 'Objection handling', content: 'Each card must include objectionHandling: anticipated prospect objections with concrete responses. Format as "When they say X, you say Y."' },
    { label: 'Win strategy', content: 'Each card should include winStrategy: given their strengths and weaknesses, what is the game plan to win this deal?' },
    { label: 'Pricing intel', content: 'Each card should include pricingIntel: their pricing model, where they are cheaper or pricier, known discounting patterns.' },
    { label: 'Tailoring', content: 'Tailor all intelligence to the specific context provided.' },
  ],
  'decision-books': [
    { label: 'Role', content: 'You are a senior decision strategist and organizational advisor who helps leaders navigate complex choices.' },
    { label: 'Task', content: 'Generate 3-5 key decisions that must be made within this decision domain.' },
    { label: 'Relevance filter', content: 'Only generate decisions if this domain is genuinely relevant to the given context. If not relevant, return an empty elements array.' },
    { label: 'Specificity', content: 'Every decision must be specific to the described context — not a generic management question.' },
    { label: 'Context integration', content: 'Actively incorporate all context provided to make decisions sharper and more grounded in the real situation.' },
    { label: 'Stakes', content: 'The "context" field must explain what is at stake — why this decision matters now, what happens if it is delayed or made poorly, and who is affected.' },
    { label: 'Options & trade-offs', content: 'The "options" field must present realistic alternatives (at least 2-3), including the status quo, with honest trade-offs for each. Avoid false dichotomies.' },
    { label: 'Decision criteria', content: 'The "criteria" field must specify what factors should guide the choice — cost, speed, risk tolerance, strategic alignment, stakeholder impact, reversibility, etc. Be specific to this decision.' },
    { label: 'Risks', content: 'Each decision should include risks: what goes wrong if you choose poorly — worst-case scenarios and failure modes to anticipate.' },
    { label: 'Stakeholders', content: 'Each decision should include stakeholders: who is affected, who needs to be consulted, and who has veto power.' },
    { label: 'Recommendation', content: 'Each decision should include recommendation: a synthesized recommended path given the options and criteria, as a reasoned starting point.' },
    { label: 'Hard choices', content: 'Surface decisions that are genuinely difficult — where reasonable people could disagree, where trade-offs are real, and where the "right" answer depends on priorities and constraints.' },
    { label: 'Tailoring', content: 'Tailor decisions to the specific role, their authority level, and organizational context.' },
  ],
  dossier: [
    { label: 'Role', content: 'You are a senior intelligence analyst and strategic research expert who produces rigorous, evidence-based briefings.' },
    { label: 'Task', content: 'Generate 3-5 intelligence briefings for this research area.' },
    { label: 'Relevance filter', content: 'Only generate briefings if this intelligence area is genuinely relevant to the given context. If not relevant, return an empty briefings array.' },
    { label: 'Specificity', content: 'Every briefing must be specific to the described context — not a generic industry overview.' },
    { label: 'Context integration', content: 'Actively incorporate all context provided to make the intelligence sharper and more actionable.' },
    { label: 'Executive summary', content: 'The "summary" field must provide a concise executive summary — the key takeaway a busy decision-maker needs in 2-3 sentences.' },
    { label: 'Key findings', content: 'The "keyFindings" field must present specific, concrete findings backed by observable signals, data points, or patterns — not vague generalizations.' },
    { label: 'Strategic implications', content: 'The "strategicImplications" field must explain what these findings mean for the reader — how should they change their thinking, strategy, or actions?' },
    { label: 'Evidence', content: 'The "evidence" field must cite the types of evidence, data sources, reports, or observable signals that support the findings. Be specific about what to look for.' },
    { label: 'Risk assessment', content: 'Each briefing should include riskAssessment: what threats or vulnerabilities does this area reveal? What could go wrong and what is the likelihood?' },
    { label: 'Opportunities', content: 'Each briefing should include opportunities: what openings, advantages, or leverage points does this intelligence reveal?' },
    { label: 'Analytical rigor', content: 'Maintain analytical rigor — distinguish between confirmed facts, strong indicators, and speculative assessments. Flag confidence levels where appropriate.' },
    { label: 'Tailoring', content: 'Tailor the intelligence to the specific context, industry, and decision-making needs provided.' },
  ],
  playbook: [
    { label: 'Role', content: 'You are a senior operations strategist and execution expert who creates practical, field-tested playbooks.' },
    { label: 'Task', content: 'Generate 3-5 actionable plays for this execution phase.' },
    { label: 'Relevance filter', content: 'Only generate plays if this phase is genuinely relevant to the given context. If not relevant, return an empty plays array.' },
    { label: 'Specificity', content: 'Every play must be specific to the described context — not generic process advice.' },
    { label: 'Context integration', content: 'Actively incorporate all context provided to make plays more practical and grounded.' },
    { label: 'Objective', content: 'The "objective" field must clearly state what this play accomplishes — the specific outcome or deliverable expected upon completion.' },
    { label: 'Instructions', content: 'The "instructions" field must provide concrete, step-by-step guidance that someone could follow without additional research. Number the steps. Be specific about tools, methods, and sequences.' },
    { label: 'Decision criteria', content: 'The "decisionCriteria" field must describe the key decision points within this play — when to proceed, when to pivot, and what signals to watch for. Use "If X, then Y" format where applicable.' },
    { label: 'Expected outcome', content: 'The "expectedOutcome" field must describe what success looks like — the tangible deliverable, state, or result when this play is executed well.' },
    { label: 'Common pitfalls', content: 'Each play should include commonPitfalls: the most frequent mistakes, shortcuts that backfire, and traps that derail execution.' },
    { label: 'Pro tips', content: 'Each play should include tips: practical advice from experienced practitioners — insider knowledge that accelerates execution or improves quality.' },
    { label: 'Time estimate', content: 'Each play should include timeEstimate: a realistic time range for completion (e.g., "2-4 hours", "1-2 weeks") accounting for the given context.' },
    { label: 'Tailoring', content: 'Tailor plays to the specific context, team size, resources, and constraints provided.' },
  ],
  'cheat-sheets': [
    { label: 'Role', content: 'You are an expert educator and knowledge distiller who creates scannable, high-density reference materials.' },
    { label: 'Task', content: 'Generate 4-8 quick-reference entries for this category.' },
    { label: 'Relevance filter', content: 'Only generate entries if this category is genuinely relevant to the given context. If not relevant, return an empty entries array.' },
    { label: 'Density', content: 'Every entry must be concise and information-dense — optimize for scannability, not completeness. This is a cheat sheet, not a textbook.' },
    { label: 'Context integration', content: 'Actively incorporate all context provided to make entries specific and immediately useful.' },
    { label: 'Definition', content: 'The "definition" field must provide a clear, jargon-free explanation in 1-3 sentences. Lead with the most important information.' },
    { label: 'Example', content: 'The "example" field must include a concrete, practical example showing the concept in action within the given context. Show, don\'t just tell.' },
    { label: 'Related concepts', content: 'The "relatedConcepts" field should list 2-4 closely related terms or concepts — helping the reader build a mental map of the domain.' },
    { label: 'Common mistakes', content: 'Each entry should include commonMistakes: the most frequent misunderstandings, misapplications, or errors people make with this concept.' },
    { label: 'Quick tip', content: 'Each entry should include quickTip: a single, memorable piece of practical advice — the one thing an expert would tell a colleague in passing.' },
    { label: 'Prioritization', content: 'Prioritize entries by how frequently they are referenced in practice — the most-used terms and concepts should come first.' },
    { label: 'Tailoring', content: 'Tailor all entries to the specific context, industry terminology, and audience level provided.' },
  ],
}

/** Returns default instruction directives for an output type, from definition or built-in fallback */
export function getDefaultInstructionDirectives(ot: OutputTypeDefinition): InstructionDirective[] {
  return ot.defaultInstructionDirectives ?? BUILTIN_INSTRUCTION_DIRECTIVES[ot.id] ?? []
}

const BUILTIN_SECTION_DRIVERS: Record<string, SectionDriver[]> = {
  questions: BUSINESS_PERSPECTIVES.map((p) => ({ name: p.name, description: p.description })),
  checklist: CHECKLIST_DIMENSIONS.map((d) => ({ name: d.name, description: d.description })),
  'email-course': EMAIL_COURSE_STAGES.map((s) => ({ name: s.name, description: s.description })),
  prompts: PROMPT_USE_CASES.map((u) => ({ name: u.name, description: u.description })),
  'battle-cards': [
    { name: 'Direct Competitors', description: 'Head-to-head competitors offering similar products or services to the same target market' },
    { name: 'Indirect Competitors', description: 'Alternative solutions or substitute approaches that solve the same underlying problem differently' },
    { name: 'Emerging Threats', description: 'New entrants, disruptors, or adjacent players expanding into this space' },
    { name: 'DIY & Status Quo', description: 'The option to do nothing, build in-house, or continue with current manual processes' },
    { name: 'Positioning & Differentiation', description: 'How to position against the competitive landscape — unique value, messaging, and strategic narrative' },
  ],
  'decision-books': DECISION_DOMAINS.map((d) => ({ name: d.name, description: d.description })),
  dossier: DOSSIER_SECTIONS.map((s) => ({ name: s.name, description: s.description })),
  playbook: PLAYBOOK_PHASES.map((p) => ({ name: p.name, description: p.description })),
  'cheat-sheets': CHEAT_SHEET_CATEGORIES.map((c) => ({ name: c.name, description: c.description })),
}

/** Returns default section drivers for an output type, from definition or built-in fallback */
export function getDefaultSectionDrivers(ot: OutputTypeDefinition): SectionDriver[] {
  return ot.defaultSectionDrivers ?? BUILTIN_SECTION_DRIVERS[ot.id] ?? []
}
