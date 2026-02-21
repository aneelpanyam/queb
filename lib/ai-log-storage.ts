export interface AILogEntry {
  id: string
  timestamp: string
  action: string
  route: string
  requestBody: object
  prompts: string[]
  model: string
  durationMs: number
  success: boolean
  error?: string
  responsePreview?: string
  productId?: string
  productName?: string
}

const STORAGE_KEY = 'queb-ai-logs'
const MAX_ENTRIES = 500

export function isDebugMode(): boolean {
  return process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'
}

export function getAll(): AILogEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function save(entry: Omit<AILogEntry, 'id' | 'timestamp'>): AILogEntry {
  const entries = getAll()
  const newEntry: AILogEntry = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  }
  entries.unshift(newEntry)
  const trimmed = entries.slice(0, MAX_ENTRIES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('ai-log-update'))
  }
  return newEntry
}

export function remove(id: string): void {
  const entries = getAll().filter((e) => e.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function clear(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function withDebugMeta<T extends object>(
  result: T,
  prompts: string[],
  model: string = 'gpt-5.2'
): T & { _meta?: { prompts: string[]; model: string } } {
  if (!isDebugMode()) return result
  return { ...result, _meta: { prompts, model } }
}

export function withUsageMeta<T extends object>(
  result: T,
  usage: { inputTokens?: number; outputTokens?: number; totalTokens?: number; promptTokens?: number; completionTokens?: number },
  model: string = 'gpt-5.2'
): T & { _usage: { promptTokens: number; completionTokens: number; totalTokens: number; model: string } } {
  return {
    ...result,
    _usage: {
      promptTokens: usage.promptTokens ?? usage.inputTokens ?? 0,
      completionTokens: usage.completionTokens ?? usage.outputTokens ?? 0,
      totalTokens: usage.totalTokens ?? 0,
      model,
    },
  }
}

export const aiLogStorage = { getAll, save, remove, clear }
