// ============================================================
// Dynamic Field Library — every field is prompt-driven
// Fields always generate a list of values; can be single or multi-select
// Prompts use {{fieldId}} placeholders for dependency context
// ============================================================

export interface FieldDefinition {
  id: string
  name: string
  description: string
  prompt: string
  selectionMode: 'single' | 'multi'
  allowCustomValues: boolean
  placeholder?: string
  category: string
  isBuiltIn: boolean
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'queb-field-library'

const SEED_FIELDS: Omit<FieldDefinition, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'industry',
    name: 'Industry',
    description: 'The target industry or market sector',
    prompt:
      'List 20 diverse and specific industries or business sectors. Include both traditional sectors (Healthcare, Manufacturing, Financial Services) and emerging ones (AI/ML, CleanTech, EdTech). Return each as a concise name.',
    selectionMode: 'single',
    allowCustomValues: true,
    category: 'Core',
    isBuiltIn: true,
  },
  {
    id: 'service',
    name: 'Service',
    description: 'The specific service or product area within the industry',
    prompt:
      'For the "{{industry}}" industry, list 15–20 specific services, products, or solutions that organizations typically offer. Be practical and industry-specific.',
    selectionMode: 'single',
    allowCustomValues: true,
    category: 'Core',
    isBuiltIn: true,
  },
  {
    id: 'role',
    name: 'Role',
    description: 'The target persona, job title, or function',
    prompt:
      'For an organization in the "{{industry}}" industry providing "{{service}}", list 15–20 key job roles across different departments. Include a mix of leadership and individual contributor positions. Return each as a clear job title.',
    selectionMode: 'single',
    allowCustomValues: true,
    category: 'Core',
    isBuiltIn: true,
  },
  {
    id: 'activity',
    name: 'Activity',
    description: 'The specific task, workflow, or responsibility',
    prompt:
      'For a "{{role}}" working in the "{{industry}}" industry at an organization providing "{{service}}", list 12–15 specific activities, tasks, and responsibilities they regularly perform. Be action-oriented.',
    selectionMode: 'single',
    allowCustomValues: true,
    category: 'Core',
    isBuiltIn: true,
  },
  {
    id: 'situation',
    name: 'Situation',
    description: 'A specific scenario or context to focus on',
    prompt:
      'For a "{{role}}" working on "{{activity}}" in the "{{industry}}" industry, list 6–8 specific situations, scenarios, or decision points they might face. Each should be a brief, concrete description.',
    selectionMode: 'single',
    allowCustomValues: true,
    category: 'Core',
    isBuiltIn: true,
  },
  {
    id: 'targetAudience',
    name: 'Target Audience',
    description: 'Who will consume the generated product',
    prompt:
      'For products targeting the "{{industry}}" industry and the "{{role}}" persona, suggest 8–10 specific audience segments. Be specific about role, niche, and context (e.g., "SDRs selling to healthcare CIOs in the US").',
    selectionMode: 'single',
    allowCustomValues: true,
    category: 'Audience',
    isBuiltIn: true,
  },
  {
    id: 'geography',
    name: 'Geography',
    description: 'Geographic focus or market region',
    prompt:
      'List 15 common geographic markets and regions used in business strategy. Include specific countries (USA, UK, India), continents, and trade designations (EMEA, APAC, North America, LATAM).',
    selectionMode: 'multi',
    allowCustomValues: true,
    category: 'Context',
    isBuiltIn: true,
  },
  {
    id: 'painPoints',
    name: 'Pain Points',
    description: 'Key challenges and frustrations',
    prompt:
      'For a "{{role}}" working on "{{activity}}" in the "{{industry}}" industry, list 8–10 specific pain points, challenges, and frustrations they commonly face. Be concrete.',
    selectionMode: 'multi',
    allowCustomValues: true,
    category: 'Context',
    isBuiltIn: true,
  },
  {
    id: 'objectives',
    name: 'Objectives',
    description: 'Goals and desired outcomes',
    prompt:
      'For a "{{role}}" in the "{{industry}}" industry, list 8–10 common business objectives, KPIs, and success metrics they are measured on.',
    selectionMode: 'multi',
    allowCustomValues: true,
    category: 'Context',
    isBuiltIn: true,
  },
  {
    id: 'stakeholders',
    name: 'Stakeholders',
    description: 'Key people involved in the process',
    prompt:
      'For a "{{role}}" working on "{{activity}}" in the "{{industry}}" industry, list 8–10 key stakeholders, decision-makers, and influencers they typically interact with. Include their titles and relationship to the activity.',
    selectionMode: 'multi',
    allowCustomValues: true,
    category: 'Context',
    isBuiltIn: true,
  },
  {
    id: 'competitors',
    name: 'Competitors',
    description: 'Key competitors or alternative solutions',
    prompt:
      'For the "{{service}}" market in the "{{industry}}" industry, list 10–12 notable competitors, alternative solutions, or market players. Include both direct and indirect competitors.',
    selectionMode: 'multi',
    allowCustomValues: true,
    category: 'Context',
    isBuiltIn: true,
  },
  {
    id: 'tools',
    name: 'Tools & Technology',
    description: 'Software, platforms, and tools used',
    prompt:
      'For a "{{role}}" working on "{{activity}}" in the "{{industry}}" industry, list 10–12 common tools, software platforms, and technologies they use in their daily work.',
    selectionMode: 'multi',
    allowCustomValues: true,
    category: 'Context',
    isBuiltIn: true,
  },
]

// ============================================================
// Prompt resolution — replace {{fieldId}} with values
// ============================================================

export function resolvePrompt(prompt: string, values: Record<string, string>): string {
  return prompt.replace(/\{\{(\w+)\}\}/g, (match, fieldId) => {
    const val = values[fieldId]
    return val?.trim() ? val : match
  })
}

export function extractDependencies(prompt: string): string[] {
  const matches = prompt.match(/\{\{(\w+)\}\}/g)
  if (!matches) return []
  return [...new Set(matches.map((m) => m.slice(2, -2)))]
}

// ============================================================
// Storage with auto-seeding
// ============================================================

function ensureSeeded(): FieldDefinition[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      /* fall through to seed */
    }
  }
  const now = new Date().toISOString()
  const seeded: FieldDefinition[] = SEED_FIELDS.map((f) => ({ ...f, createdAt: now, updatedAt: now }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
  return seeded
}

function persist(fields: FieldDefinition[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fields))
}

function getAll(): FieldDefinition[] {
  return ensureSeeded()
}

function getById(id: string): FieldDefinition | undefined {
  return getAll().find((f) => f.id === id)
}

function save(field: Omit<FieldDefinition, 'createdAt' | 'updatedAt'>): FieldDefinition {
  const fields = getAll()
  const now = new Date().toISOString()
  const newField: FieldDefinition = { ...field, createdAt: now, updatedAt: now }
  fields.push(newField)
  persist(fields)
  return newField
}

function update(id: string, updates: Partial<Omit<FieldDefinition, 'id' | 'createdAt'>>): FieldDefinition | undefined {
  const fields = getAll()
  const idx = fields.findIndex((f) => f.id === id)
  if (idx === -1) return undefined
  fields[idx] = { ...fields[idx], ...updates, updatedAt: new Date().toISOString() }
  persist(fields)
  return fields[idx]
}

function remove(id: string): boolean {
  const fields = getAll()
  const field = fields.find((f) => f.id === id)
  if (!field || field.isBuiltIn) return false
  persist(fields.filter((f) => f.id !== id))
  return true
}

export const fieldStorage = { getAll, getById, save, update, remove }
