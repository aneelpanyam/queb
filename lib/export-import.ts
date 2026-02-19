// ============================================================
// Shared export/import utilities for configurations and products
// ============================================================

export interface ExportBundle<T> {
  version: 1
  type: 'configurations' | 'products' | 'ideas' | 'full-backup'
  exportedAt: string
  items: T[]
}

export function downloadJson<T>(data: ExportBundle<T>, filename: string) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function buildFilename(prefix: string, count: number): string {
  const date = new Date().toISOString().slice(0, 10)
  return `${prefix}-${count}-${date}.json`
}

export function openFilePicker(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.onchange = () => resolve(input.files?.[0] || null)
    input.click()
  })
}

export async function readJsonFile<T>(file: File): Promise<ExportBundle<T>> {
  const text = await file.text()
  const parsed = JSON.parse(text)

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid file: not a JSON object')
  }

  if (parsed.version !== 1) {
    throw new Error(`Unsupported export version: ${parsed.version ?? 'unknown'}`)
  }

  if (!Array.isArray(parsed.items)) {
    throw new Error('Invalid file: missing items array')
  }

  return parsed as ExportBundle<T>
}
