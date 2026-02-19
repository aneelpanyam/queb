// ============================================================
// Dynamic Output Type Library — each output type has a
// generation prompt, schema of fields, and display config.
// Prompts use {{fieldId}} placeholders resolved at generation time.
// ============================================================

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
