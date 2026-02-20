import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { aiFetch } from '@/lib/ai-fetch'
import { getPrimaryField, type OutputTypeDefinition } from '@/lib/output-types'
import type { Product, AssistantData, AssistantSuggestion } from '@/lib/product-types'
import { type AssistantScope, getContextEntries, getElementPrimary, matchesElement } from '../_lib/product-editor-utils'

export function useProductAssistant(
  product: Product | null,
  outputTypeDef: OutputTypeDefinition | null,
  markUnsaved: () => void,
) {
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [assistantScope, setAssistantScope] = useState<AssistantScope>({ level: 'product' })
  const [assistantLoading, setAssistantLoading] = useState(false)
  const [assistantData, setAssistantData] = useState<AssistantData | null>(null)

  const buildSectionsPayload = useCallback(() => {
    if (!product || !outputTypeDef) return []
    const defaultPK = getPrimaryField(outputTypeDef).key
    return product.sections.map((s, sIdx) => {
      const visibleEls = s.elements.filter((el) => !el.hidden)
      const sectionAnnCount = visibleEls.reduce(
        (sum, _, eIdx) => sum + (product.annotations[`${sIdx}-${eIdx}`]?.length || 0), 0
      ) + (product.annotations[`section-${sIdx}`]?.length || 0)
      const pk = s.resolvedFields?.find((f) => f.primary)?.key || s.resolvedFields?.[0]?.key || product.resolvedFields?.find((f) => f.primary)?.key || defaultPK
      return {
        name: s.name,
        description: s.description,
        elementCount: visibleEls.length,
        annotationCount: sectionAnnCount,
        sampleElements: visibleEls.map(
          (el) => el.fields[pk] || Object.values(el.fields)[0] || ''
        ),
      }
    })
  }, [product, outputTypeDef])

  const openAssistant = useCallback((scope: AssistantScope) => {
    setAssistantScope(scope)
    setAssistantOpen(true)
  }, [])

  const runAssistantAnalysis = useCallback(async (scope: AssistantScope) => {
    if (!product || !outputTypeDef) return
    setAssistantLoading(true)
    try {
      const sectionsPayload = buildSectionsPayload()
      const contextEntries = getContextEntries(product)
      const contextSummary = contextEntries.map((e) => `${e.label}: ${e.value}`).join(', ')

      const payload: Record<string, unknown> = {
        productName: product.name,
        productDescription: product.description,
        outputType: outputTypeDef.name,
        contextSummary,
        sections: sectionsPayload,
        annotationCount: Object.values(product.annotations).reduce((sum, arr) => sum + arr.length, 0),
        elementCount: product.sections.reduce((sum, s) => sum + s.elements.filter((el) => !el.hidden).length, 0),
        hiddenCount: product.sections.reduce((sum, s) => sum + s.elements.filter((el) => el.hidden).length, 0),
      }

      if (scope.level === 'section') {
        payload.focusSection = scope.sectionName
      } else if (scope.level === 'element') {
        const el = product.sections[scope.sIndex]?.elements[scope.eIndex]
        if (el) {
          payload.focusElement = {
            sectionName: scope.sectionName,
            content: Object.values(el.fields)[0] || '',
            fields: el.fields,
          }
        }
      }

      const data = await aiFetch('/api/product-assistant', payload, {
        action: 'Smart Analysis', productId: product.id, productName: product.name,
      })
      const newSuggestions = (data.suggestions || []) as AssistantSuggestion[]

      setAssistantData((prev) => {
        if (scope.level === 'product') {
          return { ...data, analyzedAt: new Date().toISOString() }
        }
        const keepFilter = scope.level === 'section'
          ? (s: AssistantSuggestion) => !(s.targetSection === scope.sectionName && !s.targetElement)
          : (() => {
              const elPrimary = getElementPrimary(product, outputTypeDef, scope.sIndex, scope.eIndex)
              return (s: AssistantSuggestion) => !(s.targetSection === scope.sectionName && matchesElement(s, elPrimary))
            })()
        const existing = prev?.suggestions.filter(keepFilter) || []
        return {
          suggestions: [...existing, ...newSuggestions],
          overallAssessment: prev?.overallAssessment || data.overallAssessment || '',
          completenessScore: prev?.completenessScore ?? data.completenessScore ?? 0,
          analyzedAt: new Date().toISOString(),
        }
      })
      markUnsaved()
      const label = scope.level === 'product' ? 'Product' : scope.level === 'section' ? `"${scope.sectionName}"` : 'Element'
      toast.success(`${label} analysis complete`)
    } catch (err) {
      toast.error('Analysis failed', { description: err instanceof Error ? err.message : 'Please try again' })
    } finally {
      setAssistantLoading(false)
    }
  }, [product, outputTypeDef, buildSectionsPayload, markUnsaved])

  const handleAssistant = useCallback(() => {
    const scope: AssistantScope = { level: 'product' }
    setAssistantScope(scope)
    setAssistantOpen(true)
    runAssistantAnalysis(scope)
  }, [runAssistantAnalysis])

  return {
    assistantOpen, setAssistantOpen,
    assistantScope, setAssistantScope,
    assistantLoading, assistantData, setAssistantData,
    openAssistant, runAssistantAnalysis, handleAssistant,
  }
}
