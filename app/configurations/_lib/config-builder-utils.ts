import type { ConfigStep, ConfigOutput } from '@/lib/setup-config-types'
import type { SetupConfiguration } from '@/lib/setup-config-types'
import type { FieldColor } from '@/lib/output-type-library'

export interface BuilderState {
  name: string
  description: string
  steps: ConfigStep[]
  outputs: ConfigOutput[]
}

export const FIELD_COLOR_OPTIONS: { value: FieldColor | ''; label: string }[] = [
  { value: '', label: '—' },
  { value: 'amber', label: 'Amber' },
  { value: 'blue', label: 'Blue' },
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'violet', label: 'Violet' },
  { value: 'primary', label: 'Primary' },
  { value: 'none', label: 'None' },
]

export const FIELD_ICON_OPTIONS = [
  '', 'Target', 'ArrowUpRight', 'AlertTriangle', 'Shield', 'Zap', 'Clock', 'Mail',
  'Sparkles', 'ThumbsUp', 'ThumbsDown', 'MessageSquare', 'GitBranch', 'Info',
  'CheckCheck', 'ListChecks', 'BarChart3', 'AlertOctagon', 'Lightbulb', 'ClipboardCheck',
  'Bookmark', 'Repeat', 'CalendarClock', 'Shuffle', 'FileText', 'ShieldQuestion',
  'Trophy', 'DollarSign', 'Users', 'Compass', 'FileOutput', 'Scale', 'Swords',
]

export function emptyBuilder(): BuilderState {
  return {
    name: '',
    description: '',
    steps: [{ id: `s-${Date.now()}`, name: 'Step 1', description: '', fields: [] }],
    outputs: [],
  }
}

export function configToBuilder(c: SetupConfiguration): BuilderState {
  return { name: c.name, description: c.description, steps: c.steps, outputs: c.outputs }
}

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export interface AINewField {
  id: string
  name: string
  description: string
  prompt: string
  selectionMode: 'single' | 'multi'
  category: string
}

export interface AIStep {
  name: string
  description: string
  fieldIds: string[]
  newFields?: AINewField[]
}

export interface AIDriverField {
  key: string
  label: string
  type: 'short-text' | 'long-text'
  primary?: boolean
}

export interface AIOutput {
  outputTypeId: string
  sectionDrivers?: { name: string; description: string; fields?: AIDriverField[] }[]
  instructionDirectives?: { label: string; content: string }[]
  fields?: AIDriverField[]
}
