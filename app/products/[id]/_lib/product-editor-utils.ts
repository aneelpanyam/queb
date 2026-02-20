import type { Product, AssistantSuggestion } from '@/lib/product-types'
import type { OutputTypeDefinition } from '@/lib/output-types'
import { getPrimaryField } from '@/lib/output-types'

export type SelectedNode =
  | { type: 'section'; sIndex: number }
  | { type: 'element'; sIndex: number; eIndex: number }
  | { type: 'second'; sIndex: number; eIndex: number; index: number }
  | { type: 'third'; sIndex: number; eIndex: number; index: number }

export type AssistantScope =
  | { level: 'product' }
  | { level: 'section'; sectionName: string }
  | { level: 'element'; sectionName: string; sIndex: number; eIndex: number }

export const SECTION_NAV_TYPES = new Set(['checklist'])

export function dissectionKey(node: SelectedNode): string {
  switch (node.type) {
    case 'section': return `section-${node.sIndex}`
    case 'element': return `${node.sIndex}-${node.eIndex}`
    case 'second': return `${node.sIndex}-${node.eIndex}-2-${node.index}`
    case 'third': return `${node.sIndex}-${node.eIndex}-3-${node.index}`
  }
}

export function annotationKey(node: SelectedNode): string {
  return dissectionKey(node)
}

export function formatFieldLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()
}

export function getContextEntries(product: Product): { label: string; value: string }[] {
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
  ]
  return legacy.filter((e) => e.value?.trim())
}

export function getContextRecord(product: Product): Record<string, string> {
  if (product.contextFields && Object.keys(product.contextFields).length > 0) {
    const ctx: Record<string, string> = {}
    Object.entries(product.contextFields).forEach(([k, v]) => {
      if (v?.trim()) ctx[k] = v
    })
    return ctx
  }
  const ctx: Record<string, string> = {}
  if (product.industry) ctx.industry = product.industry
  if (product.service) ctx.service = product.service
  if (product.role) ctx.role = product.role
  if (product.activity) ctx.activity = product.activity
  if (product.situation) ctx.situation = product.situation
  return ctx
}

export function getSectionPrimaryKey(
  product: Product,
  outputTypeDef: OutputTypeDefinition,
  sIdx: number,
): string {
  const primaryFieldDef = getPrimaryField(outputTypeDef)
  const sec = product.sections[sIdx]
  if (sec?.resolvedFields?.length) {
    const pf = sec.resolvedFields.find((f) => f.primary)
    return pf?.key || sec.resolvedFields[0]?.key || primaryFieldDef.key
  }
  if (product.resolvedFields?.length) {
    const pf = product.resolvedFields.find((f) => f.primary)
    return pf?.key || product.resolvedFields[0]?.key || primaryFieldDef.key
  }
  return primaryFieldDef.key
}

export function getElementPrimary(
  product: Product,
  outputTypeDef: OutputTypeDefinition,
  sIdx: number,
  eIdx: number,
): string {
  const el = product.sections[sIdx]?.elements[eIdx]
  if (!el) return ''
  const key = getSectionPrimaryKey(product, outputTypeDef, sIdx)
  return el.fields[key] || Object.values(el.fields)[0] || ''
}

export function matchesElement(suggestion: AssistantSuggestion, elementPrimary: string): boolean {
  if (!suggestion.targetElement || !elementPrimary) return false
  const te = suggestion.targetElement.toLowerCase()
  const ep = elementPrimary.toLowerCase()
  return ep.includes(te) || te.includes(ep.slice(0, 60))
}
