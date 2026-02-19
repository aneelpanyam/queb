'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/use-auth'
import { fieldStorage, type FieldDefinition } from '@/lib/field-library'
import { outputTypeStorage, type OutputTypeDefinition, type OutputTypeField } from '@/lib/output-type-library'
import { LoginScreen } from '@/components/login-screen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  BookOpen,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Library,
  Zap,
  FileOutput,
  Lock,
  ChevronDown,
} from 'lucide-react'

// ============================================================
// Field form
// ============================================================

type FieldFormData = Omit<FieldDefinition, 'createdAt' | 'updatedAt'>

const EMPTY_FIELD: FieldFormData = {
  id: '',
  name: '',
  description: '',
  prompt: '',
  selectionMode: 'single',
  allowCustomValues: true,
  category: 'Custom',
  isBuiltIn: false,
}

function FieldForm({
  initial,
  isNew,
  onSave,
  onCancel,
}: {
  initial: FieldFormData
  isNew: boolean
  onSave: (data: FieldFormData) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<FieldFormData>(initial)
  const set = <K extends keyof FieldFormData>(k: K, v: FieldFormData[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  const canSave = form.name.trim() && form.prompt.trim() && (isNew ? form.id.trim() : true)

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-primary">
          {isNew ? 'New Field' : `Edit: ${form.name}`}
        </h3>
        <button onClick={onCancel} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">ID {isNew && <span className="text-destructive">*</span>}</label>
            <Input value={form.id} onChange={(e) => set('id', e.target.value.replace(/\s/g, ''))} placeholder="e.g., companySize" disabled={!isNew} className="h-8 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Name <span className="text-destructive">*</span></label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g., Company Size" className="h-8 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Category</label>
            <Input value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="e.g., Context" className="h-8 text-sm" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Description</label>
          <Input value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Brief description..." className="h-8 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            AI Prompt <span className="text-destructive">*</span>
            <span className="ml-1 font-normal text-muted-foreground">Use {'{{fieldId}}'} for context from other fields</span>
          </label>
          <Textarea
            value={form.prompt}
            onChange={(e) => set('prompt', e.target.value)}
            placeholder='e.g., For the "{{industry}}" industry, list 10-15 common company sizes...'
            className="min-h-[80px] text-sm font-mono"
          />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={form.selectionMode === 'multi'} onChange={(e) => set('selectionMode', e.target.checked ? 'multi' : 'single')} className="rounded" />
            Multi-select
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={form.allowCustomValues} onChange={(e) => set('allowCustomValues', e.target.checked)} className="rounded" />
            Allow custom values
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={() => onSave(form)} disabled={!canSave} className="gap-1">
            <Check className="h-3 w-3" /> {isNew ? 'Create' : 'Update'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Output Type form
// ============================================================

type OtFormData = Omit<OutputTypeDefinition, 'createdAt' | 'updatedAt'>

const EMPTY_OT: OtFormData = {
  id: '',
  name: '',
  description: '',
  icon: 'FileOutput',
  prompt: '',
  sectionLabel: 'Section',
  elementLabel: 'Item',
  fields: [{ key: 'title', label: 'Title', type: 'short-text', primary: true }],
  isBuiltIn: false,
}

function OutputTypeForm({
  initial,
  isNew,
  onSave,
  onCancel,
}: {
  initial: OtFormData
  isNew: boolean
  onSave: (data: OtFormData) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<OtFormData>(initial)
  const set = <K extends keyof OtFormData>(k: K, v: OtFormData[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  const addSchemaField = () => {
    set('fields', [...form.fields, { key: '', label: '', type: 'short-text' }])
  }
  const removeSchemaField = (idx: number) => {
    set('fields', form.fields.filter((_, i) => i !== idx))
  }
  const updateSchemaField = (idx: number, updates: Partial<OutputTypeField>) => {
    set('fields', form.fields.map((f, i) => (i === idx ? { ...f, ...updates } : f)))
  }

  const canSave = form.name.trim() && form.prompt.trim() && form.fields.length > 0 && form.fields.every((f) => f.key && f.label) && (isNew ? form.id.trim() : true)

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-primary">
          {isNew ? 'New Output Type' : `Edit: ${form.name}`}
        </h3>
        <button onClick={onCancel} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium">ID {isNew && <span className="text-destructive">*</span>}</label>
            <Input value={form.id} onChange={(e) => set('id', e.target.value.replace(/\s/g, ''))} disabled={!isNew} className="h-8 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Name <span className="text-destructive">*</span></label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Section Label</label>
              <Input value={form.sectionLabel} onChange={(e) => set('sectionLabel', e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Element Label</label>
              <Input value={form.elementLabel} onChange={(e) => set('elementLabel', e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Description</label>
          <Input value={form.description} onChange={(e) => set('description', e.target.value)} className="h-8 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">
            Generation Prompt <span className="text-destructive">*</span>
            <span className="ml-1 font-normal text-muted-foreground">Use {'{{fieldId}}'} placeholders</span>
          </label>
          <Textarea value={form.prompt} onChange={(e) => set('prompt', e.target.value)} className="min-h-[100px] text-sm font-mono" />
        </div>

        {/* Schema fields */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium">Output Schema (fields per element)</label>
            <button type="button" onClick={addSchemaField} className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/10">
              <Plus className="h-3 w-3" /> Add Field
            </button>
          </div>
          <div className="space-y-1.5">
            {form.fields.map((sf, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-md border border-border bg-muted/20 px-2 py-1.5">
                <Input value={sf.key} onChange={(e) => updateSchemaField(idx, { key: e.target.value.replace(/\s/g, '') })} placeholder="key" className="h-7 w-24 text-xs" />
                <Input value={sf.label} onChange={(e) => updateSchemaField(idx, { label: e.target.value })} placeholder="Label" className="h-7 flex-1 text-xs" />
                <select value={sf.type} onChange={(e) => updateSchemaField(idx, { type: e.target.value as OutputTypeField['type'] })} className="h-7 rounded border border-border bg-background px-2 text-xs">
                  <option value="short-text">Short</option>
                  <option value="long-text">Long</option>
                </select>
                <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <input type="radio" name={`primary-${idx}`} checked={!!sf.primary} onChange={() => {
                    set('fields', form.fields.map((f, i) => ({ ...f, primary: i === idx ? true : undefined })))
                  }} />
                  Primary
                </label>
                <button onClick={() => removeSchemaField(idx)} className="p-0.5 text-muted-foreground hover:text-destructive" disabled={form.fields.length <= 1}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={() => onSave(form)} disabled={!canSave} className="gap-1">
            <Check className="h-3 w-3" /> {isNew ? 'Create' : 'Update'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Library page — tabs for Fields and Output Types
// ============================================================

export default function LibraryPage() {
  const router = useRouter()
  const { authChecked, authenticated, setAuthenticated, handleLogout } = useAuth()

  const [tab, setTab] = useState<'fields' | 'outputs'>('fields')
  const [fields, setFields] = useState<FieldDefinition[]>([])
  const [outputTypes, setOutputTypes] = useState<OutputTypeDefinition[]>([])

  const [fieldForm, setFieldForm] = useState<{ mode: 'closed' | 'create' | 'edit'; data: FieldFormData }>({ mode: 'closed', data: EMPTY_FIELD })
  const [otForm, setOtForm] = useState<{ mode: 'closed' | 'create' | 'edit'; data: OtFormData }>({ mode: 'closed', data: EMPTY_OT })

  useEffect(() => {
    setFields(fieldStorage.getAll())
    setOutputTypes(outputTypeStorage.getAll())
  }, [])

  // Field CRUD
  const handleSaveField = (data: FieldFormData) => {
    if (fieldForm.mode === 'create') {
      if (fieldStorage.getById(data.id)) { toast.error('Field ID already exists'); return }
      fieldStorage.save(data)
      toast.success('Field created')
    } else {
      fieldStorage.update(data.id, data)
      toast.success('Field updated')
    }
    setFields(fieldStorage.getAll())
    setFieldForm({ mode: 'closed', data: EMPTY_FIELD })
  }

  const handleDeleteField = (id: string) => {
    if (!fieldStorage.remove(id)) { toast.error('Built-in fields cannot be deleted'); return }
    setFields(fieldStorage.getAll())
    toast.success('Field deleted')
  }

  // Output type CRUD
  const handleSaveOt = (data: OtFormData) => {
    if (otForm.mode === 'create') {
      if (outputTypeStorage.getById(data.id)) { toast.error('Output Type ID already exists'); return }
      outputTypeStorage.save(data)
      toast.success('Output type created')
    } else {
      outputTypeStorage.update(data.id, data)
      toast.success('Output type updated')
    }
    setOutputTypes(outputTypeStorage.getAll())
    setOtForm({ mode: 'closed', data: EMPTY_OT })
  }

  const handleDeleteOt = (id: string) => {
    if (!outputTypeStorage.remove(id)) { toast.error('Built-in output types cannot be deleted'); return }
    setOutputTypes(outputTypeStorage.getAll())
    toast.success('Output type deleted')
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  if (!authenticated) return <LoginScreen onSuccess={() => setAuthenticated(true)} />

  const grouped = fields.reduce<Record<string, FieldDefinition[]>>((acc, f) => {
    ;(acc[f.category] ??= []).push(f)
    return acc
  }, {})

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
              <button onClick={() => router.push('/ideas')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Ideas</button>
              <button onClick={() => router.push('/products')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Products</button>
              <button onClick={() => router.push('/configurations')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Configurations</button>
              <button className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">Library</button>
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
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Library</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage the building blocks — fields and output types</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => setTab('fields')}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === 'fields' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Zap className="h-3.5 w-3.5" /> Fields ({fields.length})
          </button>
          <button
            onClick={() => setTab('outputs')}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === 'outputs' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <FileOutput className="h-3.5 w-3.5" /> Output Types ({outputTypes.length})
          </button>
        </div>

        {/* Fields tab */}
        {tab === 'fields' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              {fieldForm.mode === 'closed' && (
                <Button onClick={() => setFieldForm({ mode: 'create', data: EMPTY_FIELD })} className="gap-2" size="sm">
                  <Plus className="h-3.5 w-3.5" /> New Field
                </Button>
              )}
            </div>

            {fieldForm.mode !== 'closed' && (
              <FieldForm
                initial={fieldForm.data}
                isNew={fieldForm.mode === 'create'}
                onSave={handleSaveField}
                onCancel={() => setFieldForm({ mode: 'closed', data: EMPTY_FIELD })}
              />
            )}

            {Object.entries(grouped).map(([cat, catFields]) => (
              <div key={cat}>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">{cat}</h3>
                <div className="space-y-2">
                  {catFields.map((field) => (
                    <div key={field.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{field.name}</span>
                            <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{field.id}</code>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{field.selectionMode}</span>
                            {field.isBuiltIn && <Lock className="h-3 w-3 text-muted-foreground/50" />}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{field.description}</p>
                          <p className="mt-1 line-clamp-2 font-mono text-[11px] text-muted-foreground/70">{field.prompt}</p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => setFieldForm({ mode: 'edit', data: { ...field } })}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          {!field.isBuiltIn && (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteField(field.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Output Types tab */}
        {tab === 'outputs' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              {otForm.mode === 'closed' && (
                <Button onClick={() => setOtForm({ mode: 'create', data: EMPTY_OT })} className="gap-2" size="sm">
                  <Plus className="h-3.5 w-3.5" /> New Output Type
                </Button>
              )}
            </div>

            {otForm.mode !== 'closed' && (
              <OutputTypeForm
                initial={otForm.data}
                isNew={otForm.mode === 'create'}
                onSave={handleSaveOt}
                onCancel={() => setOtForm({ mode: 'closed', data: EMPTY_OT })}
              />
            )}

            <div className="space-y-2">
              {outputTypes.map((ot) => (
                <div key={ot.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{ot.name}</span>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{ot.id}</code>
                        {ot.isBuiltIn && <Lock className="h-3 w-3 text-muted-foreground/50" />}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{ot.description}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{ot.sectionLabel} → {ot.elementLabel}</span>
                        {ot.fields.map((f) => (
                          <span key={f.key} className={`rounded px-1.5 py-0.5 text-[10px] ${f.primary ? 'bg-primary/10 text-primary font-medium' : 'bg-muted text-muted-foreground'}`}>
                            {f.label} ({f.key})
                          </span>
                        ))}
                      </div>
                      <p className="mt-1 line-clamp-2 font-mono text-[11px] text-muted-foreground/70">{ot.prompt}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setOtForm({ mode: 'edit', data: { ...ot } })}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      {!ot.isBuiltIn && (
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteOt(ot.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
