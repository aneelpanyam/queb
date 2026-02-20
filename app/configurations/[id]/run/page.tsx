'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/use-auth'
import { configStorage } from '@/lib/setup-config-storage'
import type { SetupConfiguration } from '@/lib/setup-config-types'
import { valuesToLegacyContext } from '@/lib/setup-config-types'
import { fieldStorage, type FieldDefinition, sortFieldsByDependency } from '@/lib/field-library'
import { outputTypeStorage, type OutputTypeDefinition } from '@/lib/output-type-library'
import { productStorage } from '@/lib/product-storage'
import { aiFetch } from '@/lib/ai-fetch'
import type { ProductSection } from '@/lib/product-types'
import { SmartField } from '@/components/smart-field'
import { LoginScreen } from '@/components/login-screen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  BookOpen,
  LogOut,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Sparkles,
  Loader2,
  Play,
} from 'lucide-react'

interface ApiPerspective {
  perspectiveName: string
  perspectiveDescription: string
  questions: Record<string, string>[]
}

interface ApiChecklistDimension {
  dimensionName: string
  dimensionDescription: string
  items: Record<string, string>[]
}

interface ApiEmailModule {
  moduleName: string
  moduleDescription: string
  emails: Record<string, string>[]
}

interface ApiPromptCategory {
  categoryName: string
  categoryDescription: string
  prompts: Record<string, string>[]
}

interface ApiBattleCardSection {
  sectionName: string
  sectionDescription: string
  cards: Record<string, string>[]
}

interface ApiDecisionDomain {
  domainName: string
  domainDescription: string
  decisions: Record<string, string>[]
}

interface ApiDossierSection {
  sectionName: string
  sectionDescription: string
  briefings: Record<string, string>[]
}

interface ApiPlaybookPhase {
  phaseName: string
  phaseDescription: string
  plays: Record<string, string>[]
}

interface ApiCheatSheetCategory {
  categoryName: string
  categoryDescription: string
  entries: Record<string, string>[]
}

function toFields(obj: Record<string, string>): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v) fields[k] = v
  }
  return fields
}

function perspectivesToSections(perspectives: ApiPerspective[]): ProductSection[] {
  return perspectives.map((p) => ({
    name: p.perspectiveName,
    description: p.perspectiveDescription,
    elements: p.questions.map((q) => ({ fields: toFields(q) })),
  }))
}

function checklistToSections(dimensions: ApiChecklistDimension[]): ProductSection[] {
  return dimensions.map((d) => ({
    name: d.dimensionName,
    description: d.dimensionDescription,
    elements: d.items.map((i) => ({ fields: toFields(i) })),
  }))
}

function emailCourseToSections(modules: ApiEmailModule[]): ProductSection[] {
  return modules.map((m) => ({
    name: m.moduleName,
    description: m.moduleDescription,
    elements: m.emails.map((e) => ({ fields: toFields(e) })),
  }))
}

function promptsToSections(categories: ApiPromptCategory[]): ProductSection[] {
  return categories.map((c) => ({
    name: c.categoryName,
    description: c.categoryDescription,
    elements: c.prompts.map((p) => ({ fields: toFields(p) })),
  }))
}

function battleCardsToSections(sections: ApiBattleCardSection[]): ProductSection[] {
  return sections.map((s) => ({
    name: s.sectionName,
    description: s.sectionDescription,
    elements: s.cards.map((c) => ({ fields: toFields(c) })),
  }))
}

function decisionDomainsToSections(domains: ApiDecisionDomain[]): ProductSection[] {
  return domains.map((d) => ({
    name: d.domainName,
    description: d.domainDescription,
    elements: d.decisions.map((dec) => ({ fields: toFields(dec) })),
  }))
}

function dossierToSections(sections: ApiDossierSection[]): ProductSection[] {
  return sections.map((s) => ({
    name: s.sectionName,
    description: s.sectionDescription,
    elements: s.briefings.map((b) => ({ fields: toFields(b) })),
  }))
}

function playbookToSections(phases: ApiPlaybookPhase[]): ProductSection[] {
  return phases.map((p) => ({
    name: p.phaseName,
    description: p.phaseDescription,
    elements: p.plays.map((pl) => ({ fields: toFields(pl) })),
  }))
}

function cheatSheetsToSections(categories: ApiCheatSheetCategory[]): ProductSection[] {
  return categories.map((c) => ({
    name: c.categoryName,
    description: c.categoryDescription,
    elements: c.entries.map((e) => ({ fields: toFields(e) })),
  }))
}

export default function RunConfigPage() {
  const router = useRouter()
  const params = useParams()
  const configId = params.id as string
  const { authChecked, authenticated, setAuthenticated, handleLogout } = useAuth()

  const [config, setConfig] = useState<SetupConfiguration | null>(null)
  const [allFields, setAllFields] = useState<FieldDefinition[]>([])
  const [allOutputTypes, setAllOutputTypes] = useState<OutputTypeDefinition[]>([])
  const [notFound, setNotFound] = useState(false)

  const [stepIndex, setStepIndex] = useState(0)
  const [values, setValues] = useState<Record<string, string | string[]>>({})
  const [productName, setProductName] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const c = configStorage.getById(configId)
    if (c) {
      setConfig(c)
    } else {
      setNotFound(true)
    }
    setAllFields(fieldStorage.getAll())
    setAllOutputTypes(outputTypeStorage.getAll())
  }, [configId])

  const handleFieldChange = useCallback((fieldId: string, newValue: string | string[]) => {
    setValues((prev) => ({ ...prev, [fieldId]: newValue }))
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!config) return
    setGenerating(true)

    const total = config.outputs.length
    toast.info(`Generating ${total} output${total > 1 ? 's' : ''} in parallel...`, { duration: 60000 })

    try {
      const legacy = valuesToLegacyContext(values)
      const flat: Record<string, string> = {}
      for (const [k, v] of Object.entries(values)) {
        flat[k] = Array.isArray(v) ? v.join(', ') : String(v || '')
      }

      const generateOne = async (co: (typeof config.outputs)[number]): Promise<string | null> => {
        const otDef = allOutputTypes.find((ot) => ot.id === co.outputTypeId)
        if (!otDef) return null

        const contextLabel = Object.values(flat).filter(Boolean).slice(0, 2).join(' in ') || 'Output'
        const baseName = productName.trim() || contextLabel
        const name = total > 1 ? `${otDef.name}: ${baseName}` : baseName

        const resolvedPrompt = (co.promptOverride || otDef.prompt).replace(
          /\{\{(\w+)\}\}/g,
          (match, fieldId) => flat[fieldId] || match,
        )

        const drivers = co.sectionDrivers?.length ? co.sectionDrivers : undefined
        const directives = co.instructionDirectives?.length ? co.instructionDirectives : undefined
        const resolvedFields = co.fieldOverrides ?? otDef.fields
        const contextPayload = { context: flat, sectionDrivers: drivers, instructionDirectives: directives }

        let sections: ProductSection[]

        const aiFetchMeta = { action: `Generate ${otDef.name}` }

        if (co.outputTypeId === 'questions') {
          const data = await aiFetch('/api/generate-questions', contextPayload, aiFetchMeta) as { perspectives: ApiPerspective[] }
          if (!data.perspectives?.length) throw new Error(`${otDef.name}: no content generated`)
          sections = perspectivesToSections(data.perspectives)
        } else if (co.outputTypeId === 'checklist') {
          const data = await aiFetch('/api/generate-checklist', contextPayload, aiFetchMeta) as { dimensions: ApiChecklistDimension[] }
          if (!data.dimensions?.length) throw new Error(`${otDef.name}: no content generated`)
          sections = checklistToSections(data.dimensions)
        } else if (co.outputTypeId === 'email-course') {
          const data = await aiFetch('/api/generate-email-course', contextPayload, aiFetchMeta) as { modules: ApiEmailModule[] }
          if (!data.modules?.length) throw new Error(`${otDef.name}: no content generated`)
          sections = emailCourseToSections(data.modules)
        } else if (co.outputTypeId === 'prompts') {
          const data = await aiFetch('/api/generate-prompts', contextPayload, aiFetchMeta) as { categories: ApiPromptCategory[] }
          if (!data.categories?.length) throw new Error(`${otDef.name}: no content generated`)
          sections = promptsToSections(data.categories)
        } else if (co.outputTypeId === 'battle-cards') {
          const data = await aiFetch('/api/generate-battle-cards', contextPayload, aiFetchMeta) as { sections: ApiBattleCardSection[] }
          if (!data.sections?.length) throw new Error(`${otDef.name}: no content generated`)
          sections = battleCardsToSections(data.sections)
        } else if (co.outputTypeId === 'decision-books') {
          const data = await aiFetch('/api/generate-decision-books', contextPayload, aiFetchMeta) as { domains: ApiDecisionDomain[] }
          if (!data.domains?.length) throw new Error(`${otDef.name}: no content generated`)
          sections = decisionDomainsToSections(data.domains)
        } else if (co.outputTypeId === 'dossier') {
          const data = await aiFetch('/api/generate-dossier', contextPayload, aiFetchMeta) as { sections: ApiDossierSection[] }
          if (!data.sections?.length) throw new Error(`${otDef.name}: no content generated`)
          sections = dossierToSections(data.sections)
        } else if (co.outputTypeId === 'playbook') {
          const data = await aiFetch('/api/generate-playbook', contextPayload, aiFetchMeta) as { phases: ApiPlaybookPhase[] }
          if (!data.phases?.length) throw new Error(`${otDef.name}: no content generated`)
          sections = playbookToSections(data.phases)
        } else if (co.outputTypeId === 'cheat-sheets') {
          const data = await aiFetch('/api/generate-cheat-sheets', contextPayload, aiFetchMeta) as { categories: ApiCheatSheetCategory[] }
          if (!data.categories?.length) throw new Error(`${otDef.name}: no content generated`)
          sections = cheatSheetsToSections(data.categories)
        } else {
          const data = await aiFetch('/api/generate-output', {
              prompt: resolvedPrompt,
              context: flat,
              sectionLabel: otDef.sectionLabel,
              elementLabel: otDef.elementLabel,
              fields: resolvedFields,
              sectionDrivers: drivers,
              instructionDirectives: directives,
            }, aiFetchMeta) as { sections: { name: string; description: string; elements: Record<string, string>[] }[] }
          if (!data.sections?.length) throw new Error(`${otDef.name}: no content generated`)
          sections = data.sections.map((s) => ({
            name: s.name,
            description: s.description,
            elements: s.elements.map((el) => ({ fields: el })),
          }))
        }

        const product = productStorage.save({
          name,
          description: '',
          status: 'draft',
          configurationId: config.id,
          outputType: co.outputTypeId,
          contextFields: flat,
          resolvedFields,
          ...legacy,
          sections,
          dissections: {},
          deeperQuestions: {},
          annotations: {},
          branding: { accentColor: '#1a5186', authorName: authorName.trim(), authorBio: '' },
        })

        toast.success(`${otDef.name} created!`)
        return product.id
      }

      // Run all outputs in parallel
      const results = await Promise.allSettled(config.outputs.map(generateOne))
      const createdIds = results
        .filter((r): r is PromiseFulfilledResult<string | null> => r.status === 'fulfilled')
        .map((r) => r.value)
        .filter((id): id is string => !!id)

      const failed = results.filter((r) => r.status === 'rejected')
      for (const f of failed) {
        toast.error((f as PromiseRejectedResult).reason?.message || 'One output failed')
      }

      if (createdIds.length === 1) {
        router.push(`/products/${createdIds[0]}`)
      } else if (createdIds.length > 1) {
        toast.success(`${createdIds.length} products created!`)
        router.push('/products')
      } else if (failed.length === 0) {
        toast.info('No products were generated')
      }
    } catch (err) {
      toast.error('Generation failed', {
        description: err instanceof Error ? err.message : 'Please try again',
      })
    } finally {
      setGenerating(false)
    }
  }, [config, values, allOutputTypes, productName, authorName, router])

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  if (!authenticated) return <LoginScreen onSuccess={() => setAuthenticated(true)} />
  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p className="text-lg font-semibold">Configuration not found</p>
        <Button variant="outline" onClick={() => router.push('/configurations')} className="mt-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>
    )
  }
  if (!config) return null

  const currentStep = config.steps[stepIndex]
  const promptOverrides: Record<string, string> = {}
  for (const csf of currentStep?.fields || []) {
    if (csf.promptOverride) promptOverrides[csf.fieldId] = csf.promptOverride
  }
  const sortedIds = sortFieldsByDependency(
    (currentStep?.fields || []).map((f) => f.fieldId),
    promptOverrides,
  )
  const stepFields = sortedIds
    .map((id) => {
      const csf = currentStep.fields.find((f) => f.fieldId === id)
      const def = allFields.find((f) => f.id === id)
      return csf && def ? { def, csf } : null
    })
    .filter(Boolean) as { def: FieldDefinition; csf: (typeof currentStep.fields)[number] }[]

  const requiredFilled = stepFields
    .filter(({ csf }) => csf.required)
    .every(({ csf }) => {
      const v = values[csf.fieldId]
      return Array.isArray(v) ? v.length > 0 : !!v?.toString().trim()
    })

  const isLast = stepIndex === config.steps.length - 1

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card shadow-sm">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <button onClick={() => router.push('/products')} className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-primary bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <h1 className="font-display text-lg font-bold text-foreground">DigiCraft</h1>
            </button>
            <nav className="hidden items-center gap-1 sm:flex">
              <button onClick={() => router.push('/products')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Products</button>
              <button onClick={() => router.push('/configurations')} className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">Configurations</button>
              <button onClick={() => router.push('/library')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Library</button>
              <button onClick={() => router.push('/info')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">About</button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    Legacy
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => router.push('/legacy')}>Home</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/legacy?view=history')}>History</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Button variant="ghost" size="sm" onClick={() => router.push('/configurations')} className="mb-6 gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Configurations
        </Button>

        <div className="mb-4">
          <h2 className="font-display text-2xl font-bold text-foreground">{config.name}</h2>
          {config.description && <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>}
          <div className="mt-2 flex flex-wrap gap-1">
            {config.outputs.map((co) => {
              const ot = allOutputTypes.find((o) => o.id === co.outputTypeId)
              return ot ? (
                <span key={co.outputTypeId} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                  {ot.name}
                </span>
              ) : null
            })}
          </div>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-1 overflow-x-auto">
          {config.steps.map((step, i) => {
            const done = i < stepIndex
            const active = i === stepIndex
            return (
              <div key={step.id} className="flex items-center">
                {i > 0 && <ChevronRight className="mx-0.5 h-3 w-3 text-muted-foreground/40" />}
                <button
                  onClick={() => i <= stepIndex && setStepIndex(i)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : done
                        ? 'bg-primary/15 text-primary hover:bg-primary/25'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${done ? 'bg-primary text-primary-foreground' : 'bg-white/20'}`}>
                    {done ? <Check className="h-2.5 w-2.5" /> : i + 1}
                  </span>
                  {step.name}
                </button>
              </div>
            )
          })}
        </div>

        {/* Current step */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary/60" />
              <h3 className="text-base font-bold text-foreground">{currentStep.name}</h3>
            </div>
            {currentStep.description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{currentStep.description}</p>
            )}
          </div>

          <div className="space-y-5">
            {stepFields.map(({ def, csf }) => {
              const textInputRefs = csf.inputMappings
                ? Object.entries(csf.inputMappings)
                    .filter(([, m]) => m.type === 'text')
                    .map(([ref]) => ref)
                : []

              return (
                <div key={def.id}>
                  {/* Text inputs for unmapped prompt references */}
                  {textInputRefs.map((ref) => (
                    <div key={ref} className="mb-3">
                      <label className="mb-1 block text-sm font-medium text-foreground capitalize">{ref}</label>
                      <Input
                        value={(values[ref] as string) || ''}
                        onChange={(e) => handleFieldChange(ref, e.target.value)}
                        placeholder={`Enter ${ref}...`}
                        className="h-8 text-sm"
                      />
                    </div>
                  ))}
                  <SmartField
                    field={def}
                    value={values[def.id] || (def.selectionMode === 'multi' ? [] : '')}
                    allValues={values}
                    promptOverride={csf.promptOverride}
                    inputMappings={csf.inputMappings}
                    onChange={(v) => handleFieldChange(def.id, v)}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Product meta (on last step) */}
        {isLast && (
          <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">Product Details</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium">Product Name</label>
                <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Auto-generated if empty" className="h-8 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Author</label>
                <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Your name" className="h-8 text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => (stepIndex > 0 ? setStepIndex(stepIndex - 1) : router.push('/configurations'))}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            {stepIndex > 0 ? 'Back' : 'Cancel'}
          </Button>

          {isLast ? (
            <Button onClick={handleGenerate} disabled={!requiredFilled || generating} className="gap-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          ) : (
            <Button onClick={() => setStepIndex(stepIndex + 1)} disabled={!requiredFilled}>
              Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
