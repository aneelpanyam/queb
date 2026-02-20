import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { aiFetch } from '@/lib/ai-fetch'
import type { Product, DissectionData, DeeperData, AnswerData } from '@/lib/product-types'
import { getContextRecord } from '../_lib/product-editor-utils'

export function useProductEnrichments(
  product: Product | null,
  dissectionMap: Record<string, DissectionData>,
  setDissectionMap: React.Dispatch<React.SetStateAction<Record<string, DissectionData>>>,
  deeperMap: Record<string, DeeperData>,
  setDeeperMap: React.Dispatch<React.SetStateAction<Record<string, DeeperData>>>,
  answerMap: Record<string, AnswerData>,
  setAnswerMap: React.Dispatch<React.SetStateAction<Record<string, AnswerData>>>,
  markUnsaved: () => void,
) {
  const [dissectionLoading, setDissectionLoading] = useState(false)
  const [activeDissectKey, setActiveDissectKey] = useState<string | null>(null)
  const [deeperLoading, setDeeperLoading] = useState(false)
  const [hiddenDissections, setHiddenDissections] = useState<Set<string>>(new Set())

  const [answerLoading, setAnswerLoading] = useState(false)
  const [activeAnswerKey, setActiveAnswerKey] = useState<string | null>(null)
  const [hiddenAnswers, setHiddenAnswers] = useState<Set<string>>(new Set())

  const handleDissect = useCallback(
    async (itemText: string, sectionName: string, key: string) => {
      if (!product) return
      setDissectionLoading(true)
      setActiveDissectKey(key)
      try {
        const data: DissectionData = await aiFetch('/api/dissect-item', {
          item: itemText,
          section: sectionName,
          outputType: product.outputType || 'questions',
          context: getContextRecord(product),
        }, { action: 'Deep Dive', productId: product.id, productName: product.name })
        setDissectionMap((prev) => ({ ...prev, [key]: data }))
        setHiddenDissections((prev) => { const n = new Set(prev); n.delete(key); return n })
        markUnsaved()
        toast.success('Deep dive generated')
      } catch (err) {
        toast.error('Failed to generate deep dive', { description: err instanceof Error ? err.message : 'Please try again' })
      } finally {
        setDissectionLoading(false)
        setActiveDissectKey(null)
      }
    },
    [product, setDissectionMap, markUnsaved]
  )

  const handleGoDeeper = useCallback(
    async (question: string, sectionName: string, sIndex: number, eIndex: number) => {
      if (!product) return
      const key = `${sIndex}-${eIndex}`
      if (deeperMap[key]) return
      setDeeperLoading(true)
      try {
        const data: DeeperData = await aiFetch('/api/generate-deeper-questions', {
          originalQuestion: question,
          perspective: sectionName,
          context: getContextRecord(product),
        }, { action: 'Go Deeper', productId: product.id, productName: product.name })
        setDeeperMap((prev) => ({ ...prev, [key]: data }))
        markUnsaved()
        toast.success('Deeper questions generated')
      } catch (err) {
        toast.error('Failed to generate', { description: err instanceof Error ? err.message : 'Please try again' })
      } finally {
        setDeeperLoading(false)
      }
    },
    [product, deeperMap, setDeeperMap, markUnsaved]
  )

  const handleFindAnswer = useCallback(
    async (question: string, key: string) => {
      if (!product) return
      setAnswerLoading(true)
      setActiveAnswerKey(key)
      try {
        const data: AnswerData = await aiFetch('/api/find-answer', {
          question, context: getContextRecord(product),
        }, { action: 'Find Answer', productId: product.id, productName: product.name })
        setAnswerMap((prev) => ({ ...prev, [key]: data }))
        setHiddenAnswers((prev) => { const n = new Set(prev); n.delete(key); return n })
        markUnsaved()
        toast.success(`Answer found with ${data.sources.length} source${data.sources.length !== 1 ? 's' : ''}`)
      } catch (err) {
        toast.error('Failed to find answer', {
          description: err instanceof Error ? err.message : 'Please try again',
        })
      } finally {
        setAnswerLoading(false)
        setActiveAnswerKey(null)
      }
    },
    [product, setAnswerMap, markUnsaved]
  )

  return {
    dissectionLoading, activeDissectKey, deeperLoading,
    hiddenDissections, setHiddenDissections,
    answerLoading, activeAnswerKey,
    hiddenAnswers, setHiddenAnswers,
    handleDissect, handleGoDeeper, handleFindAnswer,
  }
}
