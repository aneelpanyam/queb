// eslint-disable-next-line @typescript-eslint/no-require-imports
const clg = require('crossword-layout-generator')

// ============================================================
// Crossword Layout — wraps crossword-layout-generator to
// convert AI-generated word lists into positioned grid data.
// ============================================================

export interface CrosswordWord {
  word: string
  clue: string
  difficulty?: string
  hint?: string
}

export interface PositionedWord {
  word: string
  clue: string
  difficulty: string
  hint: string
  number: number
  direction: 'across' | 'down'
  startX: number
  startY: number
}

export interface CrosswordGrid {
  rows: number
  cols: number
  table: string[][]
  words: PositionedWord[]
}

/**
 * Takes a list of words with clues and generates a crossword grid layout.
 * Words that cannot be placed are excluded from the result.
 */
export function generateCrosswordGrid(words: CrosswordWord[]): CrosswordGrid {
  const input = words.map((w) => ({
    answer: w.word.toUpperCase().replace(/[^A-Z]/g, ''),
    clue: w.clue,
  }))

  const layout = clg.generateLayout(input)

  const positioned: PositionedWord[] = []
  for (const entry of layout.result) {
    if (entry.orientation === 'none') continue

    const original = words.find(
      (w) => w.word.toUpperCase().replace(/[^A-Z]/g, '') === entry.answer
    )

    positioned.push({
      word: entry.answer,
      clue: entry.clue,
      difficulty: original?.difficulty ?? 'medium',
      hint: original?.hint ?? '',
      number: entry.position,
      direction: entry.orientation === 'across' ? 'across' : 'down',
      startX: entry.startx,
      startY: entry.starty,
    })
  }

  positioned.sort((a, b) => a.number - b.number)

  return {
    rows: layout.rows,
    cols: layout.cols,
    table: layout.table,
    words: positioned,
  }
}

/**
 * Serializes grid metadata into a compact JSON string
 * suitable for storing in a section's description field.
 */
export function serializeGridMeta(grid: CrosswordGrid): string {
  return JSON.stringify({
    rows: grid.rows,
    cols: grid.cols,
    table: grid.table,
  })
}

/**
 * Deserializes grid metadata from a section's description.
 * Returns null if the description doesn't contain valid grid data.
 */
export function deserializeGridMeta(
  description: string
): { rows: number; cols: number; table: string[][] } | null {
  try {
    const parsed = JSON.parse(description)
    if (parsed && typeof parsed.rows === 'number' && typeof parsed.cols === 'number' && Array.isArray(parsed.table)) {
      return parsed
    }
  } catch {
    // not grid metadata
  }
  return null
}

/**
 * Reconstructs a full CrosswordGrid from a product section.
 * The section's description contains serialized grid metadata,
 * and its elements contain the positioned words.
 */
export function reconstructGridFromSection(section: {
  description: string
  elements: { fields: Record<string, unknown> }[]
}): CrosswordGrid | null {
  const meta = deserializeGridMeta(section.description)
  if (!meta) return null

  const words: PositionedWord[] = section.elements
    .filter((el) => el.fields.word && el.fields.direction)
    .map((el) => ({
      word: String(el.fields.word || ''),
      clue: String(el.fields.clue || ''),
      difficulty: String(el.fields.difficulty || 'medium'),
      hint: String(el.fields.hint || ''),
      number: parseInt(String(el.fields.number), 10) || 0,
      direction: String(el.fields.direction) as 'across' | 'down',
      startX: parseInt(String(el.fields.startX), 10) || 0,
      startY: parseInt(String(el.fields.startY), 10) || 0,
    }))

  words.sort((a, b) => a.number - b.number)

  return { ...meta, words }
}
