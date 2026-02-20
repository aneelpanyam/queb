import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import useSWRMutation from 'swr/mutation'
import { toast } from 'sonner'
import type { SavedSession } from '@/lib/session-storage'

interface Role { name: string; description: string; icon: string }
interface Department { departmentName: string; roles: Role[] }
interface Activity { name: string; description: string }
interface ActivityCategoryGroup { category: string; activities: Activity[] }
interface Question { question: string; relevance: string; infoPrompt: string }
interface Perspective { perspectiveName: string; perspectiveDescription: string; questions: Question[] }
export interface AdditionalContextItem { label: string; value: string }

async function postFetcher<T>(url: string, { arg }: { arg: unknown }): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  })
  if (!res.ok) {
    let message = 'Request failed'
    try {
      const body = await res.json()
      message = body.error || body.message || message
    } catch { /* ignore parse errors */ }
    throw new Error(message)
  }
  return res.json()
}

export const COMMON_INDUSTRIES = [
  'Healthcare', 'Technology', 'Financial Services', 'Education', 'Manufacturing',
  'Retail', 'Real Estate', 'Telecommunications', 'Energy & Utilities',
  'Transportation & Logistics', 'Hospitality', 'Government', 'Non-Profit',
  'Media & Entertainment', 'Agriculture', 'Construction', 'Pharmaceutical',
  'Legal Services', 'Consulting', 'Insurance',
]

export function useLegacyWizard(
  onSessionAutoSave: (data: {
    industry: string; service: string; role: string; activity: string;
    situation: string; additionalContext: AdditionalContextItem[];
    perspectives: Perspective[];
    dissections: Record<string, unknown> | undefined;
    deeperQuestions: Record<string, unknown> | undefined;
  }) => void,
) {
  const [step, setStep] = useState(1)
  const [industry, setIndustry] = useState('')
  const [service, setService] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [situation, setSituation] = useState('')
  const [additionalContext, setAdditionalContext] = useState<AdditionalContextItem[]>([])
  const [expandedRoleDepartments, setExpandedRoleDepartments] = useState<Set<string>>(new Set())
  const [expandedActivityCategories, setExpandedActivityCategories] = useState<Set<string>>(new Set())

  const [exportLoading, setExportLoading] = useState(false)
  const dissectionsRef = useRef<Record<string, {
    thinkingFramework: { step: number; title: string; description: string }[]
    checklist: { item: string; description: string; isRequired: boolean }[]
    resources: { title: string; type: string; url: string; description: string }[]
    keyInsight: string
  }>>({})
  const deeperRef = useRef<Record<string, {
    secondOrder: { question: string; reasoning: string }[]
    thirdOrder: { question: string; reasoning: string }[]
  }>>({})

  const {
    data: servicesData,
    trigger: triggerServices,
    isMutating: servicesLoading,
  } = useSWRMutation<{ services: string[] }, Error, string, { industry: string }>(
    '/api/generate-services', postFetcher
  )

  const {
    data: rolesData,
    trigger: triggerRoles,
    isMutating: rolesLoading,
  } = useSWRMutation<{ departments: Department[] }, Error, string, { industry: string; service: string }>(
    '/api/generate-roles', postFetcher
  )

  const {
    data: activitiesData,
    trigger: triggerActivities,
    isMutating: activitiesLoading,
  } = useSWRMutation<{ categories: ActivityCategoryGroup[] }, Error, string, { role: string; industry: string; service: string }>(
    '/api/generate-activities', postFetcher
  )

  const {
    data: questionsData,
    trigger: triggerQuestions,
    isMutating: questionsLoading,
  } = useSWRMutation<{ perspectives: Perspective[] }, Error, string, {
    role: string; activity: string; situation: string; additionalContext: AdditionalContextItem[]; industry: string; service: string
  }>('/api/generate-questions', postFetcher)

  const reachableSteps = useMemo(() => {
    const s = new Set<number>([1])
    if (industry.trim() && service.trim()) s.add(2)
    if (selectedRole) s.add(3)
    if (selectedActivity) s.add(4)
    if (questionsData?.perspectives?.length) s.add(5)
    return s
  }, [industry, service, selectedRole, selectedActivity, questionsData?.perspectives?.length])

  const lastFetchedIndustryRef = useRef<string | null>(null)
  useEffect(() => {
    const trimmed = industry.trim()
    if (!trimmed) return
    if (lastFetchedIndustryRef.current === trimmed) return
    const timer = setTimeout(() => {
      lastFetchedIndustryRef.current = trimmed
      triggerServices({ industry: trimmed })
    }, 500)
    return () => clearTimeout(timer)
  }, [industry, triggerServices])
  useEffect(() => {
    if (!industry.trim()) lastFetchedIndustryRef.current = null
  }, [industry])

  const handleOrgProfileSubmit = useCallback(async () => {
    if (industry.trim() && service.trim()) {
      setStep(2)
      setSelectedRole(null)
      setSelectedActivity(null)
      setSituation('')
      setAdditionalContext([])
      toast.info('Generating roles for your organization...')
      try {
        const result = await triggerRoles({ industry: industry.trim(), service: service.trim() })
        if (result?.departments) {
          setExpandedRoleDepartments(new Set(result.departments.map(d => d.departmentName)))
        }
        toast.success('Roles generated successfully')
      } catch (err) {
        toast.error('Failed to generate roles', { description: err instanceof Error ? err.message : 'Please try again' })
        setStep(1)
      }
    }
  }, [industry, service, triggerRoles])

  const handleSelectRole = useCallback(async (role: string) => {
    setSelectedRole(role)
    setSelectedActivity(null)
    setSituation('')
    setAdditionalContext([])
    setStep(3)
    toast.info(`Loading activities for ${role}...`)
    try {
      const result = await triggerActivities({ role, industry: industry.trim(), service: service.trim() })
      if (result?.categories) {
        setExpandedActivityCategories(new Set(result.categories.map(c => c.category)))
      }
      toast.success('Activities loaded')
    } catch (err) {
      toast.error('Failed to load activities', { description: err instanceof Error ? err.message : 'Please try again' })
      setStep(2)
    }
  }, [triggerActivities, industry, service])

  const handleSelectActivity = useCallback((activity: string) => {
    setSelectedActivity(activity)
    setStep(4)
  }, [])

  const handleGenerateQuestions = useCallback(async () => {
    if (selectedRole && selectedActivity && situation.trim()) {
      setStep(5)
      dissectionsRef.current = {}
      deeperRef.current = {}
      toast.info('Generating your questions...', { duration: 8000 })
      try {
        const result = await triggerQuestions({
          role: selectedRole, activity: selectedActivity, situation: situation.trim(),
          additionalContext: additionalContext.filter((c) => c.label.trim() && c.value.trim()),
          industry: industry.trim(), service: service.trim(),
        })
        toast.success('Questions ready!')
        if (result?.perspectives?.length) {
          onSessionAutoSave({
            industry: industry.trim(), service: service.trim(),
            role: selectedRole, activity: selectedActivity,
            situation: situation.trim(),
            additionalContext: additionalContext.filter((c) => c.label.trim() && c.value.trim()),
            perspectives: result.perspectives,
            dissections: Object.keys(dissectionsRef.current).length > 0 ? dissectionsRef.current : undefined,
            deeperQuestions: Object.keys(deeperRef.current).length > 0 ? deeperRef.current : undefined,
          })
        }
      } catch (err) {
        toast.error('Failed to generate questions', { description: err instanceof Error ? err.message : 'Please try again' })
        setStep(4)
      }
    }
  }, [selectedRole, selectedActivity, situation, additionalContext, industry, service, triggerQuestions, onSessionAutoSave])

  const handleBack = useCallback(() => {
    setStep((prev) => Math.max(1, prev - 1))
  }, [])

  const handleRegenerateRoles = useCallback(async () => {
    if (!industry.trim() || !service.trim()) return
    toast.info('Regenerating roles...')
    try {
      const result = await triggerRoles({ industry: industry.trim(), service: service.trim() })
      if (result?.departments) {
        setExpandedRoleDepartments(new Set(result.departments.map(d => d.departmentName)))
      }
      toast.success('Roles regenerated')
    } catch (err) {
      toast.error('Failed to regenerate roles', { description: err instanceof Error ? err.message : 'Please try again' })
    }
  }, [industry, service, triggerRoles])

  const handleRegenerateActivities = useCallback(async () => {
    if (!selectedRole || !industry.trim() || !service.trim()) return
    toast.info('Regenerating activities...')
    try {
      const result = await triggerActivities({ role: selectedRole, industry: industry.trim(), service: service.trim() })
      if (result?.categories) {
        setExpandedActivityCategories(new Set(result.categories.map(c => c.category)))
      }
      toast.success('Activities regenerated')
    } catch (err) {
      toast.error('Failed to regenerate activities', { description: err instanceof Error ? err.message : 'Please try again' })
    }
  }, [selectedRole, industry, service, triggerActivities])

  const handleStartOver = useCallback(() => {
    setStep(1)
    setIndustry('')
    setService('')
    setSelectedRole(null)
    setSelectedActivity(null)
    setSituation('')
    setAdditionalContext([])
    dissectionsRef.current = {}
    deeperRef.current = {}
  }, [])

  const handleExportSite = useCallback(async (
    perspectives: Perspective[] | undefined,
    contextOverride?: {
      role: string | null; activity: string | null; industry: string; service: string;
      situation: string; additionalContext: AdditionalContextItem[];
    },
  ) => {
    if (!perspectives) return
    setExportLoading(true)
    const ctx = contextOverride || {
      role: selectedRole, activity: selectedActivity,
      industry: industry.trim(), service: service.trim(),
      situation: situation.trim(),
      additionalContext: additionalContext.filter((c) => c.label.trim() && c.value.trim()),
    }
    toast.info('Generating your website...')
    try {
      const sections = perspectives.map((p, pIdx) => ({
        name: p.perspectiveName,
        description: p.perspectiveDescription,
        elements: p.questions.map((q, qIdx) => {
          const key = `${pIdx}-${qIdx}`
          const fields: Record<string, string> = {}
          for (const [fk, fv] of Object.entries(q)) { if (fv) fields[fk] = fv }
          return { fields, dissection: dissectionsRef.current[key] || undefined, deeperQuestions: deeperRef.current[key] || undefined }
        }),
      }))

      const contextEntries = [
        { label: 'Industry', value: ctx.industry },
        { label: 'Service', value: ctx.service },
        { label: 'Role', value: ctx.role },
        { label: 'Activity', value: ctx.activity },
      ].filter((e) => e.value?.trim())

      const res = await fetch('/api/generate-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outputType: 'questions',
          outputTypeDef: {
            name: 'Question Book', sectionLabel: 'Perspective', elementLabel: 'Question',
            fields: [
              { key: 'question', label: 'Question', type: 'long-text', primary: true },
              { key: 'relevance', label: 'Why This Matters', type: 'long-text' },
              { key: 'infoPrompt', label: 'How to Find the Answer', type: 'long-text' },
            ],
            supportsDeepDive: true, supportsDeeperQuestions: true,
          },
          contextEntries, sections,
          productName: `${ctx.role} — ${ctx.activity}`,
          branding: { accentColor: '#1a5186', authorName: '', authorBio: '' },
        }),
      })
      if (!res.ok) throw new Error('Failed to generate')
      const html = await res.text()
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `digicraft-${(ctx.role || 'guide').toLowerCase().replace(/\s+/g, '-')}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Website downloaded!')
    } catch (err) {
      console.error('Export failed:', err)
      toast.error('Failed to export website', { description: err instanceof Error ? err.message : 'Please try again' })
    } finally {
      setExportLoading(false)
    }
  }, [selectedRole, selectedActivity, industry, service, situation, additionalContext])

  return {
    step, setStep,
    industry, setIndustry, service, setService,
    selectedRole, selectedActivity,
    situation, setSituation,
    additionalContext, setAdditionalContext,
    expandedRoleDepartments, setExpandedRoleDepartments,
    expandedActivityCategories, setExpandedActivityCategories,
    exportLoading, dissectionsRef, deeperRef,
    servicesData, servicesLoading,
    rolesData, rolesLoading,
    activitiesData, activitiesLoading,
    questionsData, questionsLoading,
    reachableSteps,
    handleOrgProfileSubmit, handleSelectRole, handleSelectActivity,
    handleGenerateQuestions, handleBack,
    handleRegenerateRoles, handleRegenerateActivities,
    handleStartOver, handleExportSite,
  }
}
