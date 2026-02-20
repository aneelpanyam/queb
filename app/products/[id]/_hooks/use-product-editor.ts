import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { productStorage } from '@/lib/product-storage'
import { getOutputType, type OutputTypeDefinition } from '@/lib/output-types'
import type { Product, Annotation, DissectionData, DeeperData, AnswerData, AssistantData } from '@/lib/product-types'
import { SECTION_NAV_TYPES, type SelectedNode } from '../_lib/product-editor-utils'

export function useProductEditor(productId: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [outputTypeDef, setOutputTypeDef] = useState<OutputTypeDefinition | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null)

  const [dissectionMap, setDissectionMap] = useState<Record<string, DissectionData>>({})
  const [deeperMap, setDeeperMap] = useState<Record<string, DeeperData>>({})
  const [answerMap, setAnswerMap] = useState<Record<string, AnswerData>>({})
  const [assistantData, setAssistantData] = useState<AssistantData | null>(null)

  useEffect(() => {
    if (!productId) return
    const p = productStorage.getById(productId)
    if (p) {
      setProduct(p)
      setDissectionMap(p.dissections || {})
      setDeeperMap(p.deeperQuestions || {})
      setAnswerMap(p.answers || {})
      if (p.assistantData) setAssistantData(p.assistantData)
      const otDef = getOutputType(p.outputType)
      setOutputTypeDef(otDef || null)
      const useSectionNav = SECTION_NAV_TYPES.has(p.outputType)
      if (useSectionNav) {
        for (let s = 0; s < p.sections.length; s++) {
          if (!p.sections[s].hidden) {
            setSelectedNode({ type: 'section', sIndex: s })
            return
          }
        }
      } else {
        for (let s = 0; s < p.sections.length; s++) {
          if (p.sections[s].hidden) continue
          for (let e = 0; e < p.sections[s].elements.length; e++) {
            if (!p.sections[s].elements[e].hidden) {
              setSelectedNode({ type: 'element', sIndex: s, eIndex: e })
              return
            }
          }
        }
      }
    } else {
      setNotFound(true)
    }
  }, [productId])

  const updateProduct = useCallback(
    (updater: (prev: Product) => Partial<Product>) => {
      setProduct((prev) => {
        if (!prev) return prev
        return { ...prev, ...updater(prev) }
      })
      setHasUnsavedChanges(true)
      setSaveStatus('idle')
    },
    []
  )

  const handleSave = useCallback(() => {
    if (!product) return
    setSaveStatus('saving')
    const updated = productStorage.update(product.id, {
      ...product,
      dissections: dissectionMap,
      deeperQuestions: deeperMap,
      answers: answerMap,
      assistantData: assistantData || undefined,
    })
    if (updated) {
      setProduct(updated)
      setHasUnsavedChanges(false)
      setSaveStatus('saved')
      toast.success('Product saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } else {
      setSaveStatus('idle')
      toast.error('Failed to save')
    }
  }, [product, dissectionMap, deeperMap, answerMap, assistantData])

  const updateElementField = useCallback(
    (sIndex: number, eIndex: number, fieldKey: string, value: string) => {
      updateProduct((prev) => {
        const sections = [...prev.sections]
        const elements = [...sections[sIndex].elements]
        elements[eIndex] = {
          ...elements[eIndex],
          fields: { ...elements[eIndex].fields, [fieldKey]: value },
        }
        sections[sIndex] = { ...sections[sIndex], elements }
        return { sections }
      })
    },
    [updateProduct]
  )

  const toggleElementVisibility = useCallback(
    (sIndex: number, eIndex: number) => {
      updateProduct((prev) => {
        const sections = [...prev.sections]
        const elements = [...sections[sIndex].elements]
        elements[eIndex] = { ...elements[eIndex], hidden: !elements[eIndex].hidden }
        sections[sIndex] = { ...sections[sIndex], elements }
        return { sections }
      })
    },
    [updateProduct]
  )

  const toggleSectionVisibility = useCallback(
    (sIndex: number) => {
      updateProduct((prev) => {
        const sections = [...prev.sections]
        sections[sIndex] = { ...sections[sIndex], hidden: !sections[sIndex].hidden }
        return { sections }
      })
    },
    [updateProduct]
  )

  const addAnnotation = useCallback(
    (key: string, data: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString()
      const annotation: Annotation = {
        ...data,
        id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: now,
        updatedAt: now,
      }
      updateProduct((prev) => ({
        annotations: {
          ...prev.annotations,
          [key]: [...(prev.annotations[key] || []), annotation],
        },
      }))
    },
    [updateProduct]
  )

  const updateAnnotation = useCallback(
    (key: string, annotationId: string, data: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => {
      updateProduct((prev) => ({
        annotations: {
          ...prev.annotations,
          [key]: (prev.annotations[key] || []).map((a) =>
            a.id === annotationId ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
          ),
        },
      }))
    },
    [updateProduct]
  )

  const deleteAnnotation = useCallback(
    (key: string, annotationId: string) => {
      updateProduct((prev) => ({
        annotations: {
          ...prev.annotations,
          [key]: (prev.annotations[key] || []).filter((a) => a.id !== annotationId),
        },
      }))
    },
    [updateProduct]
  )

  return {
    product, outputTypeDef, notFound,
    hasUnsavedChanges, setHasUnsavedChanges,
    saveStatus, setSaveStatus,
    selectedNode, setSelectedNode,
    dissectionMap, setDissectionMap,
    deeperMap, setDeeperMap,
    answerMap, setAnswerMap,
    assistantData, setAssistantData,
    updateProduct, handleSave,
    updateElementField, toggleElementVisibility, toggleSectionVisibility,
    addAnnotation, updateAnnotation, deleteAnnotation,
  }
}
