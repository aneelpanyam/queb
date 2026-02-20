import { save as saveLogEntry } from './ai-log-storage'

const DEBUG = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '...' : str
}

export async function aiFetch(
  route: string,
  body: object,
  meta?: { action: string; productId?: string; productName?: string }
): Promise<any> {
  const start = DEBUG ? Date.now() : 0
  const res = await fetch(route, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  const success = res.ok && !json.error

  if (DEBUG) {
    const durationMs = Date.now() - start
    const { _meta, ...result } = json
    saveLogEntry({
      action: meta?.action ?? route,
      route,
      requestBody: body,
      prompts: _meta?.prompts ?? [],
      model: _meta?.model ?? 'unknown',
      durationMs,
      success,
      error: json.error,
      responsePreview: truncate(JSON.stringify(result), 500),
      productId: meta?.productId,
      productName: meta?.productName,
    })
    if (!success) throw new Error(json.error || 'AI request failed')
    return result
  }

  if (!success) throw new Error(json.error || 'AI request failed')
  return json
}
