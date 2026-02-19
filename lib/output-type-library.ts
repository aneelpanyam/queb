// ============================================================
// Dynamic Output Type Library — each output type has a
// generation prompt, schema of fields, and display config.
// Prompts use {{fieldId}} placeholders resolved at generation time.
// ============================================================

import { BUSINESS_PERSPECTIVES } from '@/lib/perspectives'
import { CHECKLIST_DIMENSIONS } from '@/lib/checklist-dimensions'
import { EMAIL_COURSE_STAGES } from '@/lib/email-course-stages'
import { PROMPT_USE_CASES } from '@/lib/prompt-use-cases'
import type { SectionDriver, InstructionDirective } from '@/lib/setup-config-types'

export interface OutputTypeField {
  key: string
  label: string
  type: 'short-text' | 'long-text'
  primary?: boolean
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

CONTEXT:
- Industry: {{industry}}
- Service: {{service}}
- Role: {{role}}
- Activity: {{activity}}
- Situation: "{{situation}}"

TASK:
Generate thoughtful, probing questions organized by business perspective.

GUIDELINES:
- Generate 3-5 questions per relevant perspective
- Every question must be specific to the described situation, not generic
- Each question must come with a relevance note and an actionable info prompt
- Questions should provoke deep thinking and help uncover blind spots
- Consider the industry norms and service being delivered when framing questions`,
    sectionLabel: 'Perspective',
    elementLabel: 'Question',
    fields: [
      { key: 'question', label: 'Question', type: 'long-text', primary: true },
      { key: 'relevance', label: 'Why This Matters', type: 'long-text' },
      { key: 'infoPrompt', label: 'How to Find the Answer', type: 'long-text' },
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

CONTEXT:
- Industry: {{industry}}
- Service: {{service}}
- Role: {{role}}
- Activity: {{activity}}
- Situation: "{{situation}}"

TASK:
Generate a comprehensive, actionable checklist organized by category.

GUIDELINES:
- Create 4-6 categories relevant to this role and activity
- Each category should have 5-8 specific, actionable items
- Include priority levels (High, Medium, Low) for each item
- Items should be concrete and verifiable, not vague
- Consider compliance, best practices, and common pitfalls`,
    sectionLabel: 'Category',
    elementLabel: 'Item',
    fields: [
      { key: 'item', label: 'Checklist Item', type: 'short-text', primary: true },
      { key: 'description', label: 'Description', type: 'long-text' },
      { key: 'priority', label: 'Priority', type: 'short-text' },
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

CONTEXT:
- Industry: {{industry}}
- Service: {{service}}
- Role: {{role}}
- Activity: {{activity}}
- Situation: "{{situation}}"

TASK:
Create a structured email course with modules and individual emails.

GUIDELINES:
- Create 3-5 modules, each representing a learning theme
- Each module should have 3-5 emails
- Each email needs a compelling subject line, educational body, and clear call to action
- The course should build progressively from foundations to advanced concepts
- Tailor content to the specific role and their daily challenges`,
    sectionLabel: 'Module',
    elementLabel: 'Email',
    fields: [
      { key: 'subject', label: 'Subject Line', type: 'short-text', primary: true },
      { key: 'body', label: 'Email Body', type: 'long-text' },
      { key: 'callToAction', label: 'Call to Action', type: 'short-text' },
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

CONTEXT:
- Industry: {{industry}}
- Service: {{service}}
- Role: {{role}}
- Activity: {{activity}}
- Situation: "{{situation}}"

TASK:
Create a collection of ready-to-use AI prompts organized by use-case category.

GUIDELINES:
- Create 4-6 categories of prompts relevant to this role
- Each category should have 3-5 specific prompts
- Each prompt should be a complete, copy-paste-ready template
- Include context about when to use each prompt and what output to expect
- Prompts should leverage the role's specific domain knowledge and terminology`,
    sectionLabel: 'Category',
    elementLabel: 'Prompt',
    fields: [
      { key: 'prompt', label: 'Prompt', type: 'long-text', primary: true },
      { key: 'context', label: 'When to Use', type: 'long-text' },
      { key: 'expectedOutput', label: 'Expected Output', type: 'long-text' },
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

CONTEXT:
- Industry: {{industry}}
- Service: {{service}}
- Role: {{role}}
- Activity: {{activity}}
- Situation: "{{situation}}"

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
      { key: 'strengths', label: 'Their Strengths', type: 'long-text' },
      { key: 'weaknesses', label: 'Their Weaknesses', type: 'long-text' },
      { key: 'talkingPoints', label: 'Your Talking Points', type: 'long-text' },
    ],
    supportsDeepDive: true,
    isBuiltIn: true,
  },
]

// ============================================================
// Storage with auto-seeding
// ============================================================

function ensureSeeded(): OutputTypeDefinition[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      /* fall through */
    }
  }
  const now = new Date().toISOString()
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
    { label: 'Complexity range', content: 'Vary the complexity — include both quick tactical prompts and deeper strategic ones.' },
    { label: 'Minimum output', content: 'If this use case is not very relevant, still include at least 1 prompt.' },
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
}

/** Returns default section drivers for an output type, from definition or built-in fallback */
export function getDefaultSectionDrivers(ot: OutputTypeDefinition): SectionDriver[] {
  return ot.defaultSectionDrivers ?? BUILTIN_SECTION_DRIVERS[ot.id] ?? []
}
