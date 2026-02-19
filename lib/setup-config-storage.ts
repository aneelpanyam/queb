import type { SetupConfiguration } from './setup-config-types'

const STORAGE_KEY = 'queb-setup-configurations'
const MIGRATION_KEY = 'queb-config-migration-v2'

function migrateIfNeeded(configs: SetupConfiguration[]): SetupConfiguration[] {
  if (typeof window === 'undefined') return configs
  if (localStorage.getItem(MIGRATION_KEY)) return configs

  let changed = false
  for (const config of configs) {
    for (const step of config.steps) {
      for (const field of step.fields) {
        if ('dependsOn' in field) {
          delete (field as Record<string, unknown>)['dependsOn']
          changed = true
        }
      }
    }
  }
  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
  }
  localStorage.setItem(MIGRATION_KEY, '1')
  return configs
}

function getAll(): SetupConfiguration[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const configs: SetupConfiguration[] = raw ? JSON.parse(raw) : []
    return migrateIfNeeded(configs)
  } catch {
    return []
  }
}

function getById(id: string): SetupConfiguration | undefined {
  return getAll().find((c) => c.id === id)
}

function save(config: Omit<SetupConfiguration, 'id' | 'createdAt' | 'updatedAt'>): SetupConfiguration {
  const configs = getAll()
  const now = new Date().toISOString()
  const newConfig: SetupConfiguration = {
    ...config,
    id: `cfg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
  }
  configs.unshift(newConfig)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs.slice(0, 200)))
  return newConfig
}

function update(
  id: string,
  updates: Partial<Omit<SetupConfiguration, 'id' | 'createdAt'>>,
): SetupConfiguration | undefined {
  const configs = getAll()
  const idx = configs.findIndex((c) => c.id === id)
  if (idx === -1) return undefined
  configs[idx] = { ...configs[idx], ...updates, updatedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
  return configs[idx]
}

function remove(id: string): void {
  const configs = getAll().filter((c) => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
}

export const configStorage = { getAll, getById, save, update, remove }
