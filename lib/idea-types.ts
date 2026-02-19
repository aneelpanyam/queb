// ============================================================
// Idea Book — structured idea capturing with multiple frameworks
// ============================================================

export type IdeaFramework = 'problem-solution' | 'jtbd' | 'value-proposition' | 'lean-canvas' | 'free-form'
export type IdeaStatus = 'spark' | 'developing' | 'ready' | 'built' | 'archived'

export interface Idea {
  id: string
  createdAt: string
  updatedAt: string
  title: string
  status: IdeaStatus
  framework: IdeaFramework
  frameworkData: Record<string, string>
  suggestedOutputTypes: string[]
  tags: string[]
  notes: string
  rating?: 1 | 2 | 3 | 4 | 5
  configurationId?: string
}

export interface FrameworkFieldDef {
  key: string
  label: string
  placeholder: string
  multiline: boolean
}

export interface FrameworkDef {
  id: IdeaFramework
  name: string
  description: string
  icon: string
  fields: FrameworkFieldDef[]
}

export const FRAMEWORK_DEFINITIONS: FrameworkDef[] = [
  {
    id: 'problem-solution',
    name: 'Problem-Solution Fit',
    description: 'Define the problem, audience, and how your digital product solves it',
    icon: 'Target',
    fields: [
      { key: 'problem', label: 'Problem', placeholder: 'What pain or challenge does the audience face?', multiline: true },
      { key: 'targetAudience', label: 'Target Audience', placeholder: 'Who specifically has this problem? (role, industry, context)', multiline: false },
      { key: 'proposedSolution', label: 'Proposed Solution', placeholder: 'What digital product will you create to address this?', multiline: true },
      { key: 'keyBenefit', label: 'Key Benefit', placeholder: 'What is the primary value the audience will get?', multiline: false },
    ],
  },
  {
    id: 'jtbd',
    name: 'Jobs To Be Done',
    description: 'Capture the situation, motivation, and desired outcome',
    icon: 'Briefcase',
    fields: [
      { key: 'situation', label: 'When (Situation)', placeholder: 'When I am [doing/facing/experiencing]...', multiline: true },
      { key: 'motivation', label: 'I want to (Motivation)', placeholder: 'I want to [accomplish/learn/solve]...', multiline: true },
      { key: 'desiredOutcome', label: 'So I can (Outcome)', placeholder: 'So I can [achieve/avoid/improve]...', multiline: true },
    ],
  },
  {
    id: 'value-proposition',
    name: 'Value Proposition Canvas',
    description: 'Map customer needs to your product offering',
    icon: 'Gift',
    fields: [
      { key: 'customerJobs', label: 'Customer Jobs', placeholder: 'What tasks are they trying to accomplish?', multiline: true },
      { key: 'customerPains', label: 'Customer Pains', placeholder: 'What frustrations or obstacles do they face?', multiline: true },
      { key: 'customerGains', label: 'Customer Gains', placeholder: 'What outcomes or benefits do they desire?', multiline: true },
      { key: 'productOffering', label: 'Product Offering', placeholder: 'What digital product will you create?', multiline: true },
      { key: 'painRelievers', label: 'Pain Relievers', placeholder: 'How does your product eliminate or reduce pains?', multiline: true },
      { key: 'gainCreators', label: 'Gain Creators', placeholder: 'How does your product create the desired gains?', multiline: true },
    ],
  },
  {
    id: 'lean-canvas',
    name: 'Lean Canvas',
    description: 'A lean business model for your digital product idea',
    icon: 'LayoutGrid',
    fields: [
      { key: 'problem', label: 'Problem', placeholder: 'Top 1-3 problems your audience faces', multiline: true },
      { key: 'solution', label: 'Solution', placeholder: 'Your proposed digital product solution', multiline: true },
      { key: 'uvp', label: 'Unique Value Proposition', placeholder: 'Single clear compelling message that turns a visitor into a buyer', multiline: true },
      { key: 'targetAudience', label: 'Target Audience', placeholder: 'Who are your ideal customers?', multiline: false },
      { key: 'channels', label: 'Channels', placeholder: 'How will you reach your audience? (blog, social, email, etc.)', multiline: false },
    ],
  },
  {
    id: 'free-form',
    name: 'Free-form',
    description: 'Quick capture — just describe your idea',
    icon: 'PenLine',
    fields: [
      { key: 'description', label: 'Description', placeholder: 'Describe your digital product idea in your own words...', multiline: true },
    ],
  },
]

export const IDEA_STATUSES: { value: IdeaStatus; label: string; color: string }[] = [
  { value: 'spark', label: 'Spark', color: 'bg-yellow-500/15 text-yellow-700' },
  { value: 'developing', label: 'Developing', color: 'bg-blue-500/15 text-blue-700' },
  { value: 'ready', label: 'Ready', color: 'bg-green-500/15 text-green-700' },
  { value: 'built', label: 'Built', color: 'bg-purple-500/15 text-purple-700' },
  { value: 'archived', label: 'Archived', color: 'bg-muted text-muted-foreground' },
]

export function getFrameworkDef(id: IdeaFramework): FrameworkDef {
  return FRAMEWORK_DEFINITIONS.find((f) => f.id === id) ?? FRAMEWORK_DEFINITIONS[0]
}

/** Assemble a natural-language description from an idea for configuration generation */
export function assembleIdeaDescription(idea: Idea, outputTypeNames: Record<string, string>): string {
  const fw = getFrameworkDef(idea.framework)
  const outputNames = idea.suggestedOutputTypes.map((id) => outputTypeNames[id] || id).join(' and ')

  const parts: string[] = []
  parts.push(`Create a configuration for ${outputNames || 'a digital product'}.`)
  parts.push(`Product concept: "${idea.title}".`)

  for (const field of fw.fields) {
    const val = idea.frameworkData[field.key]?.trim()
    if (val) {
      parts.push(`${field.label}: ${val}`)
    }
  }

  if (idea.notes?.trim()) {
    parts.push(`Additional notes: ${idea.notes.trim()}`)
  }

  return parts.join('\n')
}
