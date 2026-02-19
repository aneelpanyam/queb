export type AnnotationType = 'expert-note' | 'opinion' | 'guidance' | 'tip' | 'warning' | 'example'

export const ANNOTATION_TYPE_META: Record<AnnotationType, { label: string; color: string; icon: string }> = {
  'expert-note': { label: 'Expert Note', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: 'FileText' },
  'opinion':     { label: 'Opinion',     color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: 'MessageSquare' },
  'guidance':    { label: 'Guidance',    color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: 'Target' },
  'tip':         { label: 'Tip',         color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: 'Lightbulb' },
  'warning':     { label: 'Warning',     color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: 'AlertTriangle' },
  'example':     { label: 'Example',     color: 'bg-teal-500/10 text-teal-600 border-teal-500/20', icon: 'ClipboardList' },
}

export interface Annotation {
  id: string
  type: AnnotationType
  title: string
  content: string
  author: string
  createdAt: string
  updatedAt: string
}

// Generic element — each output type defines its own field keys
export interface ProductElement {
  fields: Record<string, string>
  hidden?: boolean
}

// Generic section — groups elements under a named heading
export interface ProductSection {
  name: string
  description: string
  elements: ProductElement[]
  hidden?: boolean
}

export interface DissectionData {
  thinkingFramework: { step: number; title: string; description: string }[]
  checklist: { item: string; description: string; isRequired: boolean }[]
  resources: { title: string; type: string; url: string; description: string }[]
  keyInsight: string
}

export interface DeeperData {
  secondOrder: { question: string; reasoning: string }[]
  thirdOrder: { question: string; reasoning: string }[]
}

export interface Product {
  id: string
  createdAt: string
  updatedAt: string

  name: string
  description: string
  status: 'draft' | 'published'

  // Links to configuration and output type
  configurationId?: string
  outputType: string

  // Denormalized context (copied from configuration at generation time)
  targetAudience: string
  industry: string
  service: string
  role: string
  activity: string
  situation: string
  additionalContext: { label: string; value: string }[]

  // Generic content
  sections: ProductSection[]

  // Enrichments (currently used by 'questions' output type)
  dissections?: Record<string, DissectionData>
  deeperQuestions?: Record<string, DeeperData>

  // Annotations keyed by "sectionIndex-elementIndex"
  annotations: Record<string, Annotation[]>

  branding: {
    accentColor: string
    authorName: string
    authorBio: string
  }
}
