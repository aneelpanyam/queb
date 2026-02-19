import type { SetupConfiguration } from './setup-config-types'

const STORAGE_KEY = 'queb-setup-configurations'

function getAll(): SetupConfiguration[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
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
