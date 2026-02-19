'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/use-auth'
import { productStorage } from '@/lib/product-storage'
import { getOutputType, getPrimaryField, type OutputTypeDefinition } from '@/lib/output-types'
import type {
  Product,
  Annotation,
  DissectionData,
  DeeperData,
  AnswerData,
  AssistantData,
  AssistantSuggestion,
} from '@/lib/product-types'
import { LoginScreen } from '@/components/login-screen'
import { ProductAnnotations } from '@/components/product-annotation'
import { QuestionDissection } from '@/components/question-dissection'
import { QuestionAnswer } from '@/components/question-answer'
import { ElementDetail } from '@/components/element-detail'
import { ChecklistSectionDetail } from '@/components/checklist-section-detail'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  BookOpen,
  LogOut,
  ArrowLeft,
  Save,
  CheckCircle2,
  Download,
  Loader2,
  Microscope,
  Layers,
  Eye,
  EyeOff,
  MessageSquareText,
  Pencil,
  X,
  Check,
  Sparkles,
  Target,
  Lightbulb,
  AlertTriangle,
  FileText,
  BarChart3,
  RefreshCw,
  Globe,
} from 'lucide-react'

type SelectedNode =
  | { type: 'section'; sIndex: number }
  | { type: 'element'; sIndex: number; eIndex: number }
  | { type: 'second'; sIndex: number; eIndex: number; index: number }
  | { type: 'third'; sIndex: number; eIndex: number; index: number }

function dissectionKey(node: SelectedNode): string {
  switch (node.type) {
    case 'section': return `section-${node.sIndex}`
    case 'element': return `${node.sIndex}-${node.eIndex}`
    case 'second': return `${node.sIndex}-${node.eIndex}-2-${node.index}`
    case 'third': return `${node.sIndex}-${node.eIndex}-3-${node.index}`
  }
}

function annotationKey(node: SelectedNode): string {
  return dissectionKey(node)
}

const SECTION_NAV_TYPES = new Set(['checklist'])

function formatFieldLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()
}

function getContextEntries(product: Product): { label: string; value: string }[] {
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

export default function ProductEditorPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { authChecked, authenticated, setAuthenticated, handleLogout } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [outputTypeDef, setOutputTypeDef] = useState<OutputTypeDefinition | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null)

  const [dissectionMap, setDissectionMap] = useState<Record<string, DissectionData>>({})
  const [deeperMap, setDeeperMap] = useState<Record<string, DeeperData>>({})
  const [dissectionLoading, setDissectionLoading] = useState(false)
  const [activeDissectKey, setActiveDissectKey] = useState<string | null>(null)
  const [deeperLoading, setDeeperLoading] = useState(false)
  const [hiddenDissections, setHiddenDissections] = useState<Set<string>>(new Set())

  const [answerMap, setAnswerMap] = useState<Record<string, AnswerData>>({})
  const [answerLoading, setAnswerLoading] = useState(false)
  const [activeAnswerKey, setActiveAnswerKey] = useState<string | null>(null)
  const [hiddenAnswers, setHiddenAnswers] = useState<Set<string>>(new Set())

  const [exportLoading, setExportLoading] = useState(false)

  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')

  // Smart Assistant state
  type AssistantScope =
    | { level: 'product' }
    | { level: 'section'; sectionName: string }
    | { level: 'element'; sectionName: string; sIndex: number; eIndex: number }
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [assistantScope, setAssistantScope] = useState<AssistantScope>({ level: 'product' })
  const [assistantLoading, setAssistantLoading] = useState(false)
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

  // Element editing
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

  // Annotations
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

  const handleDissect = useCallback(
    async (itemText: string, sectionName: string, key: string) => {
      if (!product) return
      setDissectionLoading(true)
      setActiveDissectKey(key)
      try {
        const res = await fetch('/api/dissect-item', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            item: itemText,
            section: sectionName,
            outputType: product.outputType || 'questions',
            role: product.role, activity: product.activity,
            situation: product.situation, industry: product.industry, service: product.service,
          }),
        })
        if (!res.ok) throw new Error('AI generation failed')
        const data: DissectionData = await res.json()
        setDissectionMap((prev) => ({ ...prev, [key]: data }))
        setHiddenDissections((prev) => { const n = new Set(prev); n.delete(key); return n })
        setHasUnsavedChanges(true)
        toast.success('Deep dive generated')
      } catch (err) {
        toast.error('Failed to generate deep dive', { description: err instanceof Error ? err.message : 'Please try again' })
      } finally {
        setDissectionLoading(false)
        setActiveDissectKey(null)
      }
    },
    [product]
  )

  const handleGoDeeper = useCallback(
    async (question: string, sectionName: string, sIndex: number, eIndex: number) => {
      if (!product) return
      const key = `${sIndex}-${eIndex}`
      if (deeperMap[key]) return
      setDeeperLoading(true)
      try {
        const res = await fetch('/api/generate-deeper-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalQuestion: question,
            perspective: sectionName,
            role: product.role, activity: product.activity,
            situation: product.situation, industry: product.industry, service: product.service,
          }),
        })
        if (!res.ok) throw new Error('AI generation failed')
        const data: DeeperData = await res.json()
        setDeeperMap((prev) => ({ ...prev, [key]: data }))
        setHasUnsavedChanges(true)
        toast.success('Deeper questions generated')
      } catch (err) {
        toast.error('Failed to generate', { description: err instanceof Error ? err.message : 'Please try again' })
      } finally {
        setDeeperLoading(false)
      }
    },
    [product, deeperMap]
  )

  const handleFindAnswer = useCallback(
    async (question: string, key: string) => {
      if (!product) return
      setAnswerLoading(true)
      setActiveAnswerKey(key)
      try {
        const context: Record<string, string> = {}
        if (product.contextFields) {
          Object.entries(product.contextFields).forEach(([k, v]) => {
            if (v?.trim()) context[k] = v
          })
        } else {
          if (product.industry) context.industry = product.industry
          if (product.service) context.service = product.service
          if (product.role) context.role = product.role
          if (product.activity) context.activity = product.activity
          if (product.situation) context.situation = product.situation
        }

        const res = await fetch('/api/find-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, context }),
        })
        if (!res.ok) throw new Error('AI research failed')
        const data: AnswerData = await res.json()
        setAnswerMap((prev) => ({ ...prev, [key]: data }))
        setHiddenAnswers((prev) => { const n = new Set(prev); n.delete(key); return n })
        setHasUnsavedChanges(true)
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
    [product]
  )

  // Export
  const handleExport = useCallback(async () => {
    if (!product) return
    setExportLoading(true)
    toast.info('Generating product website...')
    try {
      const enrichedPerspectives = product.sections
        .filter((s) => !s.hidden)
        .map((section) => {
          const origSIdx = product.sections.indexOf(section)
          return {
            perspective: section.name,
            description: section.description,
            questions: section.elements
              .filter((el) => !el.hidden)
              .map((el) => {
                const origEIdx = product.sections[origSIdx].elements.indexOf(el)
                const key = `${origSIdx}-${origEIdx}`
                return {
                  question: el.fields.question || el.fields[Object.keys(el.fields)[0]] || '',
                  relevance: el.fields.relevance || '',
                  infoPrompt: el.fields.infoPrompt || '',
                  dissection: dissectionMap[key] || undefined,
                  deeperQuestions: deeperMap[key] || undefined,
                  answer: answerMap[key] || undefined,
                  annotations: product.annotations[key] || undefined,
                }
              }),
          }
        })

      const res = await fetch('/api/generate-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: product.industry, service: product.service,
          role: product.role, activity: product.activity,
          situation: product.situation, additionalContext: product.additionalContext,
          perspectives: enrichedPerspectives,
          productName: product.name, productDescription: product.description,
          targetAudience: product.targetAudience, branding: product.branding,
        }),
      })
      if (!res.ok) throw new Error('Failed to generate')
      const html = await res.text()
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${product.name.toLowerCase().replace(/\s+/g, '-')}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Product exported!')
    } catch (err) {
      toast.error('Export failed', { description: err instanceof Error ? err.message : 'Please try again' })
    } finally {
      setExportLoading(false)
    }
  }, [product, dissectionMap, deeperMap])

  // Inline edit helpers
  const startEdit = (fieldKey: string, currentValue: string) => {
    setEditingField(fieldKey)
    setEditValue(currentValue)
  }

  const saveEdit = (sIndex: number, eIndex: number, fieldKey: string) => {
    if (editValue.trim()) {
      updateElementField(sIndex, eIndex, fieldKey, editValue.trim())
    }
    setEditingField(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValue('')
  }

  const buildSectionsPayload = useCallback(() => {
    if (!product || !outputTypeDef) return []
    const primaryKey = getPrimaryField(outputTypeDef).key
    return product.sections.map((s, sIdx) => {
      const visibleEls = s.elements.filter((el) => !el.hidden)
      const sectionAnnCount = visibleEls.reduce(
        (sum, _, eIdx) => sum + (product.annotations[`${sIdx}-${eIdx}`]?.length || 0), 0
      ) + (product.annotations[`section-${sIdx}`]?.length || 0)
      return {
        name: s.name,
        description: s.description,
        elementCount: visibleEls.length,
        annotationCount: sectionAnnCount,
        sampleElements: visibleEls.map(
          (el) => el.fields[primaryKey] || Object.values(el.fields)[0] || ''
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

      const res = await fetch('/api/product-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Request failed')
      }
      const data = await res.json()
      const newSuggestions = (data.suggestions || []) as AssistantSuggestion[]

      setAssistantData((prev) => {
        if (scope.level === 'product') {
          return { ...data, analyzedAt: new Date().toISOString() }
        }
        const keepFilter = scope.level === 'section'
          ? (s: AssistantSuggestion) => !(s.targetSection === scope.sectionName && !s.targetElement)
          : (() => {
              const elPrimary = getElementPrimary(scope.sIndex, scope.eIndex)
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
      setHasUnsavedChanges(true)
      setSaveStatus('idle')
      const label = scope.level === 'product' ? 'Product' : scope.level === 'section' ? `"${scope.sectionName}"` : 'Element'
      toast.success(`${label} analysis complete`)
    } catch (err) {
      toast.error('Analysis failed', { description: err instanceof Error ? err.message : 'Please try again' })
    } finally {
      setAssistantLoading(false)
    }
  }, [product, outputTypeDef, buildSectionsPayload])

  const handleAssistant = useCallback(() => {
    const scope: AssistantScope = { level: 'product' }
    setAssistantScope(scope)
    setAssistantOpen(true)
    runAssistantAnalysis(scope)
  }, [runAssistantAnalysis])

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Checking session...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) return <LoginScreen onSuccess={() => setAuthenticated(true)} />

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p className="text-lg font-semibold text-foreground">Product not found</p>
        <Button variant="outline" onClick={() => router.push('/products')} className="mt-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Button>
      </div>
    )
  }

  if (!product || !outputTypeDef) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const primaryFieldDef = getPrimaryField(outputTypeDef)

  const getElementPrimary = (sIdx: number, eIdx: number): string => {
    const el = product.sections[sIdx]?.elements[eIdx]
    if (!el) return ''
    return el.fields[primaryFieldDef.key] || Object.values(el.fields)[0] || ''
  }

  const matchesElement = (suggestion: AssistantSuggestion, elementPrimary: string): boolean => {
    if (!suggestion.targetElement || !elementPrimary) return false
    const te = suggestion.targetElement.toLowerCase()
    const ep = elementPrimary.toLowerCase()
    return ep.includes(te) || te.includes(ep.slice(0, 60))
  }

  // Resolve selected element data
  const selectedSection = selectedNode ? product.sections[selectedNode.sIndex] : null
  const selectedElement =
    selectedNode?.type === 'element' && selectedSection
      ? selectedSection.elements[selectedNode.eIndex]
      : null
  const selectedDeeper = selectedNode && 'eIndex' in selectedNode ? deeperMap[`${selectedNode.sIndex}-${selectedNode.eIndex}`] : undefined
  const secondQ = selectedNode?.type === 'second' && selectedDeeper ? selectedDeeper.secondOrder[selectedNode.index] : null
  const thirdQ = selectedNode?.type === 'third' && selectedDeeper ? selectedDeeper.thirdOrder[selectedNode.index] : null

  const displayPrimary =
    selectedNode?.type === 'element'
      ? selectedElement?.fields[primaryFieldDef.key]
      : selectedNode?.type === 'second'
        ? secondQ?.question
        : thirdQ?.question
  const displayReasoning =
    selectedNode?.type === 'second' ? secondQ?.reasoning
    : selectedNode?.type === 'third' ? thirdQ?.reasoning
    : null

  const currentDKey = selectedNode ? dissectionKey(selectedNode) : ''
  const currentAKey = selectedNode ? annotationKey(selectedNode) : ''
  const dissection = currentDKey ? dissectionMap[currentDKey] : undefined
  const currentAnswer = currentDKey ? answerMap[currentDKey] : undefined
  const currentAnnotations = product.annotations[currentAKey] || []
  const isQuestionBook = product.outputType === 'questions'

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 shadow-sm sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/products')} className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Products
          </Button>
          <div className="h-5 w-px bg-border" />
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input value={nameValue} onChange={(e) => setNameValue(e.target.value)} className="h-8 w-64 text-sm font-semibold" autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter' && nameValue.trim()) { updateProduct(() => ({ name: nameValue.trim() })); setEditingName(false) } if (e.key === 'Escape') setEditingName(false) }}
              />
              <button onClick={() => { if (nameValue.trim()) updateProduct(() => ({ name: nameValue.trim() })); setEditingName(false) }} className="rounded p-1 text-primary hover:bg-primary/10"><Check className="h-4 w-4" /></button>
              <button onClick={() => setEditingName(false)} className="rounded p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <button onClick={() => { setNameValue(product.name); setEditingName(true) }} className="group flex min-w-0 items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-foreground">{product.name}</span>
              <Pencil className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          )}
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            {outputTypeDef.name}
          </span>
          {hasUnsavedChanges && (
            <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">Unsaved</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAssistant} disabled={assistantLoading} className="gap-1.5 text-primary border-primary/30 hover:bg-primary/5">
            {assistantLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Smart Assistant
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exportLoading} className="gap-1.5">
            {exportLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Export
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasUnsavedChanges && saveStatus !== 'idle'} className="gap-1.5">
            {saveStatus === 'saving' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saveStatus === 'saved' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saveStatus === 'saved' ? 'Saved' : 'Save'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 text-muted-foreground hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* Editor body */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Tree Nav Sidebar */}
        <aside className="flex w-[340px] min-w-[340px] flex-col border-r border-border bg-card">
          <div className="shrink-0 border-b border-border p-4">
            <div className="mb-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs leading-relaxed text-muted-foreground">
              {getContextEntries(product).map((e, i) => (
                <span key={e.label}>
                  {i > 0 && <span className="mr-1">·</span>}
                  <strong className="font-semibold text-foreground">{e.value}</strong>
                </span>
              ))}
            </div>
            {product.targetAudience && !product.contextFields && (
              <div className="mt-1.5 text-[10px] font-medium text-primary">Audience: {product.targetAudience}</div>
            )}
          </div>

          <div className="shrink-0 border-b border-border bg-muted/30 px-4 py-3">
            <div className="text-[13px] font-bold uppercase tracking-wider text-primary">
              {SECTION_NAV_TYPES.has(product.outputType) ? 'Checklists' : `${outputTypeDef.sectionLabel}s`}{' '}
              <span className="text-[10px] font-medium text-muted-foreground">
                {SECTION_NAV_TYPES.has(product.outputType)
                  ? `(${product.sections.filter((s) => !s.hidden).length} checklists, ${product.sections.filter((s) => !s.hidden).reduce((sum, s) => sum + s.elements.filter((el) => !el.hidden).length, 0)} steps)`
                  : `(${product.sections.filter((s) => !s.hidden).reduce((sum, s) => sum + s.elements.filter((el) => !el.hidden).length, 0)} ${outputTypeDef.elementLabel.toLowerCase()}s)`
                }
              </span>
            </div>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto p-2.5">
            {product.sections.map((section, sIndex) => {
              const sHidden = !!section.hidden
              const annotationsInSection = section.elements.reduce((sum, _, eIdx) => sum + (product.annotations[`${sIndex}-${eIdx}`]?.length || 0), 0)
              const sectionAnnotations = product.annotations[`section-${sIndex}`]?.length || 0
              const totalAnnotations = annotationsInSection + sectionAnnotations
              const sectionSuggestionCount = assistantData?.suggestions.filter((s) => s.targetSection === section.name && !s.targetElement).length || 0
              const useSectionNav = SECTION_NAV_TYPES.has(product.outputType)

              if (useSectionNav) {
                const isSelected = selectedNode?.type === 'section' && selectedNode.sIndex === sIndex
                const visibleSteps = section.elements.filter((el) => !el.hidden).length
                return (
                  <div key={sIndex} className={cn(sHidden && 'opacity-40')}>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedNode({ type: 'section', sIndex })}
                        className={cn(
                          'block min-w-0 flex-1 rounded-md px-3 py-3 text-left transition-all',
                          isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                        )}
                      >
                        <span className={cn('block text-[13px] font-semibold leading-snug', isSelected ? 'text-primary' : 'text-foreground')}>
                          {section.name}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">
                          {visibleSteps} step{visibleSteps !== 1 ? 's' : ''}
                        </span>
                      </button>
                      <div className="flex shrink-0 items-center gap-1 pr-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); openAssistant({ level: 'section', sectionName: section.name }) }}
                          className={cn('rounded p-0.5 transition-colors', sectionSuggestionCount > 0 ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground/30 hover:text-primary')}
                          title={sectionSuggestionCount > 0 ? `${sectionSuggestionCount} suggestions` : 'Analyze section'}
                        >
                          <Sparkles className="h-3 w-3" />
                        </button>
                        {totalAnnotations > 0 && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">{totalAnnotations}</span>
                        )}
                        <button onClick={() => toggleSectionVisibility(sIndex)} className="rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-foreground">
                          {sHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div key={sIndex} className={cn('mb-0', sHidden && 'opacity-40')}>
                  <div className="flex items-center justify-between px-2 py-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">{section.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openAssistant({ level: 'section', sectionName: section.name })}
                        className={cn('rounded p-0.5 transition-colors', sectionSuggestionCount > 0 ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground/30 hover:text-primary')}
                        title={sectionSuggestionCount > 0 ? `${sectionSuggestionCount} suggestions` : 'Analyze section'}
                      >
                        <Sparkles className="h-3 w-3" />
                      </button>
                      {totalAnnotations > 0 && (
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">{totalAnnotations}</span>
                      )}
                      <button onClick={() => toggleSectionVisibility(sIndex)} className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground" title={sHidden ? 'Show' : 'Hide'}>
                        {sHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-1">
                    {section.elements.map((el, eIndex) => {
                      const isSelected = selectedNode?.type === 'element' && selectedNode.sIndex === sIndex && selectedNode.eIndex === eIndex
                      const isParent = selectedNode && 'eIndex' in selectedNode && selectedNode.sIndex === sIndex && selectedNode.eIndex === eIndex
                      const elHidden = !!el.hidden
                      const elAnnotations = product.annotations[`${sIndex}-${eIndex}`]?.length || 0
                      const label = el.fields[primaryFieldDef.key] || '(empty)'
                      const short = label.length > 60 ? label.slice(0, 57) + '...' : label
                      const elPrimary = el.fields[primaryFieldDef.key] || Object.values(el.fields)[0] || ''
                      const hasElSuggestions = assistantData?.suggestions.some(
                        (s) => s.targetSection === section.name && matchesElement(s, elPrimary)
                      ) || false

                      return (
                        <div key={eIndex} className={cn(elHidden && 'opacity-40')}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedNode({ type: 'element', sIndex, eIndex })}
                              className={cn(
                                'block min-w-0 flex-1 rounded-md px-3 py-2 text-left text-[13px] leading-snug transition-all',
                                isSelected ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                              )}
                            >
                              {short}
                            </button>
                            <div className="flex shrink-0 items-center gap-0.5 pr-1">
                              {hasElSuggestions && <Sparkles className="h-3 w-3 text-amber-500" />}
                              {elAnnotations > 0 && <MessageSquareText className="h-3 w-3 text-primary/60" />}
                              <button onClick={() => toggleElementVisibility(sIndex, eIndex)} className="rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-foreground">
                                {elHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </button>
                            </div>
                          </div>

                          {/* Deeper questions sub-tree (questions-specific) */}
                          {isParent && outputTypeDef.supportsDeeperQuestions && deeperMap[`${sIndex}-${eIndex}`] && (
                            <div className="ml-4 border-l border-border/50 pl-2">
                              {deeperMap[`${sIndex}-${eIndex}`].secondOrder.map((dq, idx) => {
                                const is2 = selectedNode?.type === 'second' && selectedNode.sIndex === sIndex && selectedNode.eIndex === eIndex && selectedNode.index === idx
                                return (
                                  <button key={`2-${idx}`} onClick={() => setSelectedNode({ type: 'second', sIndex, eIndex, index: idx })}
                                    className={cn('block w-full rounded-md px-2 py-1.5 text-left text-[11px] leading-snug transition-all', is2 ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                                    <span className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded bg-blue-500/10 text-[9px] font-bold text-blue-600">2</span>
                                    {dq.question.length > 50 ? dq.question.slice(0, 47) + '...' : dq.question}
                                  </button>
                                )
                              })}
                              {deeperMap[`${sIndex}-${eIndex}`].thirdOrder.map((dq, idx) => {
                                const is3 = selectedNode?.type === 'third' && selectedNode.sIndex === sIndex && selectedNode.eIndex === eIndex && selectedNode.index === idx
                                return (
                                  <button key={`3-${idx}`} onClick={() => setSelectedNode({ type: 'third', sIndex, eIndex, index: idx })}
                                    className={cn('block w-full rounded-md px-2 py-1.5 text-left text-[11px] leading-snug transition-all', is3 ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                                    <span className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded bg-green-500/10 text-[9px] font-bold text-green-600">3</span>
                                    {dq.question.length > 50 ? dq.question.slice(0, 47) + '...' : dq.question}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </nav>
        </aside>

        {/* Detail Panel */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 flex-wrap items-center gap-6 border-b border-border bg-card/95 px-8 py-3.5 text-xs text-muted-foreground backdrop-blur-sm">
            {getContextEntries(product).map((e) => (
              <span key={e.label}><strong className="font-semibold text-foreground">{e.label}:</strong> {e.value}</span>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-background">
            {!selectedNode || !selectedSection ? (
              <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Select {SECTION_NAV_TYPES.has(product.outputType) ? 'a checklist' : `a ${outputTypeDef.elementLabel.toLowerCase()}`} from the left to edit and annotate.
                </p>
              </div>
            ) : selectedNode.type === 'section' ? (
              <div className="mx-auto w-full px-6 py-4 pb-12">
                <ChecklistSectionDetail
                  section={selectedSection}
                  sIndex={selectedNode.sIndex}
                  product={product}
                  dissectionMap={dissectionMap}
                  onDissect={handleDissect}
                  dissectionLoading={dissectionLoading}
                  activeDissectKey={activeDissectKey}
                  onToggleElementVisibility={toggleElementVisibility}
                  onUpdateElementField={updateElementField}
                  onAddAnnotation={addAnnotation}
                  onUpdateAnnotation={updateAnnotation}
                  onDeleteAnnotation={deleteAnnotation}
                />
              </div>
            ) : (
              <div className="mx-auto w-full space-y-5 px-6 py-4 pb-12">
                {/* Section badge with assistant icon */}
                <div>
                  <div className="mb-2.5 flex items-center gap-2">
                    <div className="inline-block rounded-md bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary">
                      {selectedSection.name}
                    </div>
                    {(() => {
                      const count = assistantData?.suggestions.filter((s) => s.targetSection === selectedSection.name && !s.targetElement).length || 0
                      return (
                        <button
                          onClick={() => openAssistant({ level: 'section', sectionName: selectedSection.name })}
                          className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors hover:bg-primary/10', count > 0 ? 'bg-amber-500/10 text-amber-600' : 'text-muted-foreground hover:text-primary')}
                          title={count > 0 ? `${count} section-level suggestions` : 'Open section analysis'}
                        >
                          <Sparkles className="h-3 w-3" />
                          {count > 0 && count}
                        </button>
                      )
                    })()}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{selectedSection.description}</p>
                </div>

                {/* Output-type-specific element rendering */}
                {selectedNode.type === 'element' && selectedElement ? (
                  <ElementDetail
                    outputType={product.outputType || 'questions'}
                    outputTypeDef={outputTypeDef}
                    sectionName={selectedSection.name}
                    sectionDescription={selectedSection.description}
                    element={selectedElement}
                    sIndex={selectedNode.sIndex}
                    eIndex={selectedNode.eIndex}
                    editingField={editingField}
                    editValue={editValue}
                    onStartEdit={startEdit}
                    onSaveEdit={saveEdit}
                    onCancelEdit={cancelEdit}
                    onEditValueChange={setEditValue}
                  />
                ) : (
                  <h2 className="text-[16px] font-bold leading-tight tracking-tight text-foreground">{displayPrimary}</h2>
                )}

                {/* Reasoning for deeper questions */}
                {displayReasoning && (
                  <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                    <div className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">Context & Reasoning</div>
                    <p className="text-[14.5px] leading-relaxed text-foreground">{displayReasoning}</p>
                  </div>
                )}

                {/* AI enrichment actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {selectedNode.type === 'element' && (
                    <Button variant="outline" size="sm"
                      onClick={() => openAssistant({ level: 'element', sectionName: selectedSection.name, sIndex: selectedNode.sIndex, eIndex: selectedNode.eIndex })}
                      className="gap-2 border-primary/30 text-primary hover:bg-primary/5">
                      <Sparkles className="h-4 w-4" />
                      {(() => {
                        const elPrimary = getElementPrimary(selectedNode.sIndex, selectedNode.eIndex)
                        const elSuggestions = assistantData?.suggestions.filter(
                          (s) => s.targetSection === selectedSection.name && matchesElement(s, elPrimary)
                        ).length || 0
                        return elSuggestions > 0 ? `Suggestions (${elSuggestions})` : 'Analyze'
                      })()}
                    </Button>
                  )}
                {(outputTypeDef.supportsDeepDive || outputTypeDef.supportsDeeperQuestions) && (<>
                
                    {outputTypeDef.supportsDeepDive && (
                      <Button variant="outline" size="sm"
                        onClick={() => {
                          if (dissection && !dissectionLoading) {
                            setHiddenDissections((prev) => { const n = new Set(prev); if (n.has(currentDKey)) n.delete(currentDKey); else n.add(currentDKey); return n })
                          } else if (displayPrimary && selectedSection) {
                            handleDissect(displayPrimary, selectedSection.name, currentDKey)
                          }
                        }}
                        disabled={dissectionLoading}
                        className={cn('gap-2', dissection && !hiddenDissections.has(currentDKey) && 'border-primary/50 bg-primary/5 text-primary')}>
                        {dissectionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Microscope className="h-4 w-4" />}
                        {dissectionLoading ? 'Generating...' : dissection && !hiddenDissections.has(currentDKey) ? 'Hide deep dive' : 'Deep dive'}
                      </Button>
                    )}
                    {outputTypeDef.supportsDeeperQuestions && selectedNode.type === 'element' && (
                      <Button variant="outline" size="sm"
                        onClick={() => { if (displayPrimary && selectedSection) handleGoDeeper(displayPrimary, selectedSection.name, selectedNode.sIndex, selectedNode.eIndex) }}
                        disabled={deeperLoading || !!selectedDeeper}
                        className={cn('gap-2', selectedDeeper && 'border-primary/50 bg-primary/5 text-primary')}>
                        {deeperLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
                        {deeperLoading ? 'Thinking deeper...' : selectedDeeper ? 'Deeper loaded' : 'Go deeper'}
                      </Button>
                    )}
                </>)}
                  {isQuestionBook && (selectedNode.type === 'element' || selectedNode.type === 'second' || selectedNode.type === 'third') && (
                    <Button variant="outline" size="sm"
                      onClick={() => {
                        if (currentAnswer && !answerLoading) {
                          setHiddenAnswers((prev) => { const n = new Set(prev); if (n.has(currentDKey)) n.delete(currentDKey); else n.add(currentDKey); return n })
                        } else if (displayPrimary) {
                          handleFindAnswer(displayPrimary, currentDKey)
                        }
                      }}
                      disabled={answerLoading && activeAnswerKey === currentDKey}
                      className={cn('gap-2', currentAnswer && !hiddenAnswers.has(currentDKey) && 'border-emerald-500/50 bg-emerald-500/5 text-emerald-600')}>
                      {answerLoading && activeAnswerKey === currentDKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                      {answerLoading && activeAnswerKey === currentDKey ? 'Researching...' : currentAnswer && !hiddenAnswers.has(currentDKey) ? 'Hide answer' : currentAnswer ? 'Show answer' : 'Find answer'}
                    </Button>
                  )}
                </div>

                {/* AI-researched answer (question book only) */}
                {isQuestionBook && (answerLoading && activeAnswerKey === currentDKey || (currentAnswer && !hiddenAnswers.has(currentDKey))) && (
                  <div className="mt-6 space-y-4">
                    {answerLoading && activeAnswerKey === currentDKey && !currentAnswer && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Searching the web and synthesizing an answer...
                        </div>
                        <Skeleton className="h-5 w-56" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-4 w-72" />
                      </div>
                    )}
                    {currentAnswer && !hiddenAnswers.has(currentDKey) && (
                      <div>
                        <QuestionAnswer data={currentAnswer} />
                        <div className="mt-3 flex gap-2">
                          <Button variant="ghost" size="sm"
                            onClick={() => { if (displayPrimary) handleFindAnswer(displayPrimary, currentDKey) }}
                            disabled={answerLoading}
                            className="gap-1.5 text-xs text-muted-foreground">
                            <RefreshCw className="h-3 w-3" /> Re-research
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Deep dive content */}
                {(dissectionLoading || (dissection && !hiddenDissections.has(currentDKey))) && (
                  <div className="mt-6 space-y-8">
                    {dissectionLoading && !dissection && (
                      <div className="space-y-4"><Skeleton className="h-5 w-56" /><Skeleton className="h-24 w-full" /></div>
                    )}
                    {dissection && !hiddenDissections.has(currentDKey) && <QuestionDissection data={dissection} />}
                  </div>
                )}

                {/* Deeper questions summary */}
                {selectedNode.type === 'element' && selectedDeeper && (
                  <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Deeper Questions</h3>
                    </div>
                    <p className="mb-3 text-xs text-muted-foreground">Select any from the sidebar to view and annotate.</p>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-primary">2nd-order ({selectedDeeper.secondOrder.length})</p>
                      <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                        {selectedDeeper.secondOrder.map((dq, i) => <li key={i} className="line-clamp-1">{dq.question}</li>)}
                      </ul>
                      <p className="text-xs font-semibold text-primary">3rd-order ({selectedDeeper.thirdOrder.length})</p>
                      <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                        {selectedDeeper.thirdOrder.map((tq, i) => <li key={i} className="line-clamp-1">{tq.question}</li>)}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Annotations — universal across all output types */}
                <div className="mt-8 border-t border-border pt-6">
                  <ProductAnnotations
                    annotations={currentAnnotations}
                    defaultAuthor={product.branding.authorName}
                    onAdd={(data) => addAnnotation(currentAKey, data)}
                    onUpdate={(id, data) => updateAnnotation(currentAKey, id, data)}
                    onDelete={(id) => deleteAnnotation(currentAKey, id)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Smart Assistant Sheet — contextual by scope */}
      <Sheet open={assistantOpen} onOpenChange={setAssistantOpen}>
        <SheetContent side="right" className="w-[440px] sm:max-w-[440px] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {assistantScope.level === 'product' && 'Product Analysis'}
              {assistantScope.level === 'section' && `Section: ${assistantScope.sectionName}`}
              {assistantScope.level === 'element' && 'Element Analysis'}
            </SheetTitle>
            <SheetDescription>
              {assistantScope.level === 'product' && 'Suggestions for the entire product.'}
              {assistantScope.level === 'section' && `Suggestions for the "${assistantScope.sectionName}" section.`}
              {assistantScope.level === 'element' && `Suggestions for this specific ${outputTypeDef?.elementLabel?.toLowerCase() || 'element'}.`}
              {assistantData?.analyzedAt && (
                <span className="mt-1 block text-[11px] text-muted-foreground/70">
                  Last analyzed {new Date(assistantData.analyzedAt).toLocaleString()}
                </span>
              )}
            </SheetDescription>
          </SheetHeader>

          {/* Scope navigation breadcrumbs */}
          {assistantScope.level !== 'product' && (
            <div className="mb-4 flex items-center gap-1 text-xs">
              <button onClick={() => setAssistantScope({ level: 'product' })} className="text-primary hover:underline">Product</button>
              <span className="text-muted-foreground">/</span>
              {assistantScope.level === 'element' ? (
                <>
                  <button onClick={() => setAssistantScope({ level: 'section', sectionName: assistantScope.sectionName })} className="text-primary hover:underline">{assistantScope.sectionName}</button>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-foreground font-medium">Element</span>
                </>
              ) : (
                <span className="text-foreground font-medium">{assistantScope.sectionName}</span>
              )}
            </div>
          )}

          {/* Analyze button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => runAssistantAnalysis(assistantScope)}
            disabled={assistantLoading}
            className="mb-4 w-full gap-2"
          >
            {assistantLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {assistantLoading ? 'Analyzing...' : (() => {
              const scopedSuggestions = (() => {
                if (!assistantData) return []
                if (assistantScope.level === 'product') return assistantData.suggestions
                if (assistantScope.level === 'section') return assistantData.suggestions.filter((s) => s.targetSection === assistantScope.sectionName && !s.targetElement)
                const elPrimary = getElementPrimary(assistantScope.sIndex, assistantScope.eIndex)
                return assistantData.suggestions.filter((s) => s.targetSection === assistantScope.sectionName && matchesElement(s, elPrimary))
              })()
              return scopedSuggestions.length > 0 ? 'Re-analyze' : 'Run analysis'
            })()}
          </Button>

          {assistantLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2 rounded-lg border border-border p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : (() => {
            const scopedSuggestions = (() => {
              if (!assistantData) return []
              if (assistantScope.level === 'product') return assistantData.suggestions
              if (assistantScope.level === 'section') return assistantData.suggestions.filter((s) => s.targetSection === assistantScope.sectionName && !s.targetElement)
              const elPrimary = getElementPrimary(assistantScope.sIndex, assistantScope.eIndex)
              return assistantData.suggestions.filter((s) => s.targetSection === assistantScope.sectionName && matchesElement(s, elPrimary))
            })()

            if (scopedSuggestions.length === 0 && !assistantData) {
              return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Sparkles className="mb-3 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No analysis yet. Click the button above to get started.</p>
                </div>
              )
            }

            if (scopedSuggestions.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="mb-3 h-8 w-8 text-green-500/50" />
                  <p className="text-sm text-muted-foreground">No suggestions at this level yet. Run analysis to get specific recommendations.</p>
                </div>
              )
            }

            const categoryMeta: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
              annotation: { label: 'Add Annotations', icon: <MessageSquareText className="h-4 w-4" />, color: 'text-blue-600 bg-blue-500/10' },
              content: { label: 'Improve Content', icon: <FileText className="h-4 w-4" />, color: 'text-purple-600 bg-purple-500/10' },
              structure: { label: 'Restructure', icon: <Layers className="h-4 w-4" />, color: 'text-indigo-600 bg-indigo-500/10' },
              audience: { label: 'Audience Fit', icon: <Target className="h-4 w-4" />, color: 'text-green-600 bg-green-500/10' },
              distribution: { label: 'Distribution', icon: <BarChart3 className="h-4 w-4" />, color: 'text-orange-600 bg-orange-500/10' },
              enrichment: { label: 'AI Enrichment', icon: <Sparkles className="h-4 w-4" />, color: 'text-primary bg-primary/10' },
            }
            const priorityColors: Record<string, string> = {
              high: 'bg-red-500/10 text-red-600 border-red-500/20',
              medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
              low: 'bg-green-500/10 text-green-600 border-green-500/20',
            }

            const grouped: Record<string, typeof scopedSuggestions> = {}
            for (const s of scopedSuggestions) {
              ;(grouped[s.category] ??= []).push(s)
            }

            return (
              <div className="space-y-5">
                {/* Assessment (product-level only) */}
                {assistantScope.level === 'product' && assistantData && (
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Readiness</span>
                      <span className={cn(
                        'text-lg font-bold',
                        assistantData.completenessScore >= 75 ? 'text-green-600' :
                        assistantData.completenessScore >= 50 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {assistantData.completenessScore}%
                      </span>
                    </div>
                    <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          assistantData.completenessScore >= 75 ? 'bg-green-500' :
                          assistantData.completenessScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        )}
                        style={{ width: `${assistantData.completenessScore}%` }}
                      />
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{assistantData.overallAssessment}</p>
                  </div>
                )}

                <p className="text-xs font-semibold text-muted-foreground">{scopedSuggestions.length} suggestion{scopedSuggestions.length !== 1 ? 's' : ''}</p>

                {Object.entries(grouped).map(([cat, items]) => {
                  const meta = categoryMeta[cat] || { label: cat, icon: <Lightbulb className="h-4 w-4" />, color: 'text-muted-foreground bg-muted' }
                  return (
                    <div key={cat}>
                      <div className="mb-2 flex items-center gap-2">
                        <span className={cn('flex h-6 w-6 items-center justify-center rounded-md', meta.color)}>
                          {meta.icon}
                        </span>
                        <span className="text-sm font-semibold text-foreground">{meta.label}</span>
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">{items.length}</span>
                      </div>
                      <div className="space-y-2 pl-8">
                        {items.map((suggestion, idx) => (
                          <div key={idx} className="rounded-lg border border-border bg-card p-3">
                            <div className="mb-1 flex items-start justify-between gap-2">
                              <span className="text-sm font-medium text-foreground">{suggestion.title}</span>
                              <span className={cn('shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase', priorityColors[suggestion.priority] || '')}>
                                {suggestion.priority}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground">{suggestion.description}</p>
                            {assistantScope.level === 'product' && suggestion.targetSection && (
                              <button
                                onClick={() => setAssistantScope({ level: 'section', sectionName: suggestion.targetSection })}
                                className="mt-1.5 text-[10px] font-medium text-primary hover:underline"
                              >
                                {suggestion.targetSection} &rarr;
                              </button>
                            )}
                            {suggestion.targetElement && (
                              <p className="mt-1 text-[10px] italic text-muted-foreground/70">
                                &ldquo;{suggestion.targetElement.length > 80 ? suggestion.targetElement.slice(0, 77) + '...' : suggestion.targetElement}&rdquo;
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </SheetContent>
      </Sheet>
    </div>
  )
}
