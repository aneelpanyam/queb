export interface SavedSession {
  id: string
  createdAt: string
  industry: string
  service: string
  role: string
  activity: string
  situation: string
  additionalContext: { label: string; value: string }[]
  perspectives: {
    perspectiveName: string
    perspectiveDescription: string
    questions: {
      question: string
      relevance: string
      infoPrompt: string
    }[]
  }[]
  dissections?: Record<string, {
    thinkingFramework: { step: number; title: string; description: string }[]
    checklist: { item: string; description: string; isRequired: boolean }[]
    resources: { title: string; type: string; url: string; description: string }[]
    keyInsight: string
  }>
  deeperQuestions?: Record<string, {
    secondOrder: { question: string; reasoning: string }[]
    thirdOrder: { question: string; reasoning: string }[]
  }>
}

const STORAGE_KEY = 'question-book-sessions'

function getAll(): SavedSession[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(session: Omit<SavedSession, 'id' | 'createdAt'>): SavedSession {
  const sessions = getAll()
  const newSession: SavedSession = {
    ...session,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  }
  sessions.unshift(newSession)
  // Keep max 50 sessions
  const trimmed = sessions.slice(0, 50)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  return newSession
}

function remove(id: string): void {
  const sessions = getAll().filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

function getById(id: string): SavedSession | undefined {
  return getAll().find((s) => s.id === id)
}

function update(id: string, updates: Partial<Omit<SavedSession, 'id' | 'createdAt'>>): SavedSession | undefined {
  const sessions = getAll()
  const index = sessions.findIndex((s) => s.id === id)
  if (index === -1) return undefined
  const updated: SavedSession = {
    ...sessions[index],
    ...updates,
  }
  sessions[index] = updated
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  return updated
}

export const sessionStorage = { getAll, save, remove, getById, update }
