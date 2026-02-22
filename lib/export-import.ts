// ============================================================
// Shared export/import utilities for configurations and products
// ============================================================

import type { Product, DissectionData, DeeperData, AnswerData, Annotation, FieldValue } from '@/lib/product-types'
import type { OutputTypeDefinition, OutputTypeField } from '@/lib/output-type-library'

export interface ExportBundle<T> {
  version: 1
  type: 'configurations' | 'products' | 'ideas' | 'full-backup'
  exportedAt: string
  items: T[]
}

export function downloadJson<T>(data: ExportBundle<T>, filename: string) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function buildFilename(prefix: string, count: number): string {
  const date = new Date().toISOString().slice(0, 10)
  return `${prefix}-${count}-${date}.json`
}

export function openFilePicker(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.onchange = () => resolve(input.files?.[0] || null)
    input.click()
  })
}

export async function readJsonFile<T>(file: File): Promise<ExportBundle<T>> {
  const text = await file.text()
  const parsed = JSON.parse(text)

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid file: not a JSON object')
  }

  if (parsed.version !== 1) {
    throw new Error(`Unsupported export version: ${parsed.version ?? 'unknown'}`)
  }

  if (!Array.isArray(parsed.items)) {
    throw new Error('Invalid file: missing items array')
  }

  return parsed as ExportBundle<T>
}

// ============================================================
// Directory Export — self-describing format for external apps
// ============================================================

export interface DirectoryElement {
  fields: Record<string, FieldValue>
  dissection?: DissectionData
  deeperQuestions?: DeeperData
  answer?: AnswerData
  annotations?: Annotation[]
}

export interface DirectorySection {
  name: string
  description: string
  fields?: OutputTypeField[]
  elements: DirectoryElement[]
}

export interface DirectoryProduct {
  formatVersion: 1
  exportedAt: string

  id: string
  name: string
  description: string
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string

  outputType: {
    id: string
    name: string
    sectionLabel: string
    elementLabel: string
    fields: OutputTypeField[]
    supportsDeepDive?: boolean
    supportsDeeperQuestions?: boolean
  }

  context: { label: string; value: string }[]

  branding: {
    accentColor: string
    authorName: string
    authorBio: string
  }

  sections: DirectorySection[]
}

function formatFieldLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()
}

function resolveContext(product: Product): { label: string; value: string }[] {
  if (product.contextFields && Object.keys(product.contextFields).length > 0) {
    return Object.entries(product.contextFields)
      .filter(([, v]) => v?.trim())
      .map(([k, v]) => ({ label: formatFieldLabel(k), value: v }))
  }
  const legacy = [
    { label: 'Industry', value: product.industry },
    { label: 'Service', value: product.service },
    { label: 'Role', value: product.role },
    { label: 'Activity', value: product.activity },
    { label: 'Situation', value: product.situation },
  ].filter((e) => e.value?.trim())
  if (product.additionalContext?.length) {
    legacy.push(...product.additionalContext.filter((e) => e.label?.trim() && e.value?.trim()))
  }
  return legacy
}

export function buildDirectoryProduct(
  product: Product,
  outputTypeDef: OutputTypeDefinition,
  dissectionMap: Record<string, DissectionData>,
  deeperMap: Record<string, DeeperData>,
  answerMap: Record<string, AnswerData>,
): DirectoryProduct {
  const sections: DirectorySection[] = product.sections
    .filter((s) => !s.hidden)
    .map((section) => {
      const origSIdx = product.sections.indexOf(section)
      return {
        name: section.name,
        description: section.description,
        ...(section.resolvedFields?.length ? { fields: section.resolvedFields } : {}),
        elements: section.elements
          .filter((el) => !el.hidden)
          .map((el) => {
            const origEIdx = product.sections[origSIdx].elements.indexOf(el)
            const key = `${origSIdx}-${origEIdx}`
            const entry: DirectoryElement = { fields: el.fields }
            if (dissectionMap[key]) entry.dissection = dissectionMap[key]
            if (deeperMap[key]) entry.deeperQuestions = deeperMap[key]
            if (answerMap[key]) entry.answer = answerMap[key]
            if (product.annotations[key]?.length) entry.annotations = product.annotations[key]
            return entry
          }),
      }
    })

  return {
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    id: product.id,
    name: product.name,
    description: product.description,
    status: product.status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    outputType: {
      id: product.outputType,
      name: outputTypeDef.name,
      sectionLabel: outputTypeDef.sectionLabel,
      elementLabel: outputTypeDef.elementLabel,
      fields: product.resolvedFields ?? outputTypeDef.fields,
      supportsDeepDive: outputTypeDef.supportsDeepDive,
      supportsDeeperQuestions: outputTypeDef.supportsDeeperQuestions,
    },
    context: resolveContext(product),
    branding: product.branding,
    sections,
  }
}
