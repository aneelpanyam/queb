// ============================================================
// Dynamic Output Type Library — public API / barrel file.
// Delegates to sub-modules for definitions, directives,
// prompt metadata, and section drivers.
// ============================================================

import type { SectionDriver, InstructionDirective } from '@/lib/setup-config-types'
import { SEED_OUTPUT_TYPES } from '@/lib/output-type-definitions'
import { BUILTIN_INSTRUCTION_DIRECTIVES, BUILTIN_SECTION_DRIVERS } from '@/lib/output-type-directives'
import type { PromptAssemblyOptions } from '@/lib/assemble-prompt'
import { BUILTIN_PROMPT_METADATA } from '@/lib/output-type-prompt-metadata'

// ============================================================
// Types
// ============================================================

export type FieldColor = 'amber' | 'blue' | 'red' | 'green' | 'emerald' | 'violet' | 'primary' | 'none'

export interface TableColumn {
  key: string
  label: string
}

export interface OutputTypeField {
  key: string
  label: string
  type: 'short-text' | 'long-text' | 'table'
  primary?: boolean
  color?: FieldColor
  icon?: string
  /** Column definitions — required when type is 'table' */
  columns?: TableColumn[]
}

export interface OutputTypeDefinition {
  id: string
  name: string
  description: string
  icon: string
  prompt: string
  sectionLabel: string
  elementLabel: string
  fields: OutputTypeField[]
  supportsDeepDive?: boolean
  supportsDeeperQuestions?: boolean
  defaultSectionDrivers?: SectionDriver[]
  defaultInstructionDirectives?: InstructionDirective[]
  preamble?: string
  generationProcess?: string
  qualityBar?: string[]
  antiPatterns?: string[]
  isBuiltIn: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================
// Storage with auto-seeding
// Bump SEED_VERSION when built-in definitions change so
// existing users get the updated defaults.
// ============================================================

const STORAGE_KEY = 'queb-output-type-library'
const SEED_VERSION = 7
const VERSION_KEY = STORAGE_KEY + '-version'

function ensureSeeded(): OutputTypeDefinition[] {
  if (typeof window === 'undefined') return []
  const now = new Date().toISOString()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      const stored: OutputTypeDefinition[] = JSON.parse(raw)
      const storedVersion = localStorage.getItem(VERSION_KEY)

      if (storedVersion !== String(SEED_VERSION)) {
        const userCreated = stored.filter((t) => !t.isBuiltIn)
        const freshBuiltIns = SEED_OUTPUT_TYPES.map((o) => ({ ...o, createdAt: now, updatedAt: now }))
        const merged = [...freshBuiltIns, ...userCreated]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
        localStorage.setItem(VERSION_KEY, String(SEED_VERSION))
        return merged
      }

      const storedIds = new Set(stored.map((t) => t.id))
      const missing = SEED_OUTPUT_TYPES.filter((s) => !storedIds.has(s.id))
      if (missing.length > 0) {
        const newEntries = missing.map((o) => ({ ...o, createdAt: now, updatedAt: now }))
        const merged = [...stored, ...newEntries]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
        return merged
      }
      return stored
    } catch {
      /* fall through */
    }
  }
  const seeded: OutputTypeDefinition[] = SEED_OUTPUT_TYPES.map((o) => ({
    ...o,
    createdAt: now,
    updatedAt: now,
  }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
  localStorage.setItem(VERSION_KEY, String(SEED_VERSION))
  return seeded
}

function persist(types: OutputTypeDefinition[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(types))
}

function getAll(): OutputTypeDefinition[] {
  return ensureSeeded()
}

function getById(id: string): OutputTypeDefinition | undefined {
  return getAll().find((t) => t.id === id)
}

function save(ot: Omit<OutputTypeDefinition, 'createdAt' | 'updatedAt'>): OutputTypeDefinition {
  const types = getAll()
  const now = new Date().toISOString()
  const newOt: OutputTypeDefinition = { ...ot, createdAt: now, updatedAt: now }
  types.push(newOt)
  persist(types)
  return newOt
}

function update(
  id: string,
  updates: Partial<Omit<OutputTypeDefinition, 'id' | 'createdAt'>>,
): OutputTypeDefinition | undefined {
  const types = getAll()
  const idx = types.findIndex((t) => t.id === id)
  if (idx === -1) return undefined
  types[idx] = { ...types[idx], ...updates, updatedAt: new Date().toISOString() }
  persist(types)
  return types[idx]
}

function remove(id: string): boolean {
  const types = getAll()
  const ot = types.find((t) => t.id === id)
  if (!ot || ot.isBuiltIn) return false
  persist(types.filter((t) => t.id !== id))
  return true
}

export const outputTypeStorage = { getAll, getById, save, update, remove }

export function getPrimaryField(ot: OutputTypeDefinition): OutputTypeField {
  return ot.fields.find((f) => f.primary) || ot.fields[0]
}

// ============================================================
// Helpers — resolve defaults from definitions or built-in maps
// ============================================================

/** Returns default instruction directives for an output type, from definition or built-in fallback */
export function getDefaultInstructionDirectives(ot: OutputTypeDefinition): InstructionDirective[] {
  return ot.defaultInstructionDirectives ?? BUILTIN_INSTRUCTION_DIRECTIVES[ot.id] ?? []
}

/** Returns default section drivers for an output type, from definition or built-in fallback */
export function getDefaultSectionDrivers(ot: OutputTypeDefinition): SectionDriver[] {
  return ot.defaultSectionDrivers ?? BUILTIN_SECTION_DRIVERS[ot.id] ?? []
}

// ============================================================
// Prompt metadata — resolves PromptAssemblyOptions for an
// output type from its definition or the built-in lookup.
// ============================================================

/**
 * Returns PromptAssemblyOptions for an output type.
 * Checks the definition's own fields first, then falls back
 * to the built-in metadata map, then returns a minimal default.
 */
export function getPromptAssemblyOptions(ot: OutputTypeDefinition): PromptAssemblyOptions {
  const hasOwn = ot.preamble || ot.generationProcess || ot.qualityBar || ot.antiPatterns

  if (hasOwn) {
    return {
      preamble: ot.preamble,
      generationProcess: ot.generationProcess,
      qualityBar: ot.qualityBar,
      antiPatterns: ot.antiPatterns,
      elementLabel: ot.elementLabel,
    }
  }

  return BUILTIN_PROMPT_METADATA[ot.id] ?? { elementLabel: ot.elementLabel }
}

/**
 * Convenience version that takes just an ID and element label.
 * Used by API routes that don't have the full definition loaded.
 */
export function getPromptAssemblyOptionsById(outputTypeId: string, elementLabel: string): PromptAssemblyOptions {
  return BUILTIN_PROMPT_METADATA[outputTypeId] ?? { elementLabel }
}
