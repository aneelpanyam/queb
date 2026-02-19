import type { Idea } from './idea-types'

const STORAGE_KEY = 'queb-idea-book'

function getAll(): Idea[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function getById(id: string): Idea | undefined {
  return getAll().find((i) => i.id === id)
}

function save(idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>): Idea {
  const ideas = getAll()
  const now = new Date().toISOString()
  const newIdea: Idea = {
    ...idea,
    id: `idea-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
  }
  ideas.unshift(newIdea)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas.slice(0, 200)))
  return newIdea
}

function update(id: string, updates: Partial<Omit<Idea, 'id' | 'createdAt'>>): Idea | undefined {
  const ideas = getAll()
  const idx = ideas.findIndex((i) => i.id === id)
  if (idx === -1) return undefined
  ideas[idx] = { ...ideas[idx], ...updates, updatedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas))
  return ideas[idx]
}

function remove(id: string): void {
  const ideas = getAll().filter((i) => i.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas))
}

export const ideaStorage = { getAll, getById, save, update, remove }
