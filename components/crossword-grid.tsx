'use client'

import { useMemo } from 'react'
import type { PositionedWord } from '@/lib/crossword-layout'

interface CrosswordGridProps {
  rows: number
  cols: number
  table: string[][]
  words: PositionedWord[]
  showAnswers?: boolean
  cellSize?: number
  className?: string
}

/**
 * SVG-based crossword grid renderer.
 * Renders numbered cells, black squares, and optionally filled letters.
 */
export function CrosswordGrid({
  rows,
  cols,
  table,
  words,
  showAnswers = false,
  cellSize = 36,
  className = '',
}: CrosswordGridProps) {
  const numberMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const w of words) {
      const key = `${w.startY}-${w.startX}`
      if (!map.has(key)) map.set(key, w.number)
    }
    return map
  }, [words])

  const padding = 1
  const svgWidth = cols * cellSize + padding * 2
  const svgHeight = rows * cellSize + padding * 2

  const numFontSize = Math.max(9, cellSize * 0.32)
  const letterFontSize = cellSize * 0.52

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      width={svgWidth}
      height={svgHeight}
      className={className}
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      <rect
        x={padding}
        y={padding}
        width={cols * cellSize}
        height={rows * cellSize}
        fill="#2a2a2a"
      />

      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const letter = table[r]?.[c] ?? '-'
          const isBlack = letter === '-'
          const x = c * cellSize + padding
          const y = r * cellSize + padding
          const cellKey = `${r}-${c}`
          const number = numberMap.get(cellKey)

          return (
            <g key={cellKey}>
              {!isBlack && (
                <rect
                  x={x + 0.5}
                  y={y + 0.5}
                  width={cellSize - 1}
                  height={cellSize - 1}
                  fill="white"
                  stroke="#ccc"
                  strokeWidth={0.5}
                />
              )}

              {number !== undefined && (
                <text
                  x={x + 2}
                  y={y + 2}
                  dominantBaseline="hanging"
                  fill="#111"
                  style={{
                    fontSize: numFontSize,
                    fontWeight: 700,
                    fontFamily: 'Arial, Helvetica, sans-serif',
                  }}
                >
                  {number}
                </text>
              )}

              {showAnswers && !isBlack && letter !== '-' && (
                <text
                  x={x + cellSize / 2}
                  y={y + cellSize / 2 + (number !== undefined ? 3 : 0)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#111"
                  style={{
                    fontSize: letterFontSize,
                    fontWeight: 600,
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    textTransform: 'uppercase',
                  }}
                >
                  {letter}
                </text>
              )}
            </g>
          )
        })
      )}
    </svg>
  )
}

interface CrosswordClueListProps {
  words: PositionedWord[]
  direction: 'across' | 'down'
  className?: string
}

export function CrosswordClueList({ words, direction, className = '' }: CrosswordClueListProps) {
  const filtered = useMemo(
    () => words.filter((w) => w.direction === direction).sort((a, b) => a.number - b.number),
    [words, direction],
  )

  if (filtered.length === 0) return null

  return (
    <div className={className}>
      <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground">
        {direction === 'across' ? 'Across' : 'Down'}
      </h4>
      <ol className="space-y-1.5">
        {filtered.map((w) => (
          <li key={`${w.number}-${w.direction}`} className="text-sm leading-snug">
            <span className="mr-1.5 inline-block min-w-[1.5rem] font-bold text-primary">
              {w.number}.
            </span>
            <span className="text-muted-foreground">{w.clue}</span>
            {w.hint && (
              <span className="ml-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                ({w.hint})
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

interface CrosswordPuzzleViewProps {
  rows: number
  cols: number
  table: string[][]
  words: PositionedWord[]
  showAnswers?: boolean
  title?: string
  cellSize?: number
}

/**
 * Full crossword puzzle view — grid + clue lists side by side.
 */
export function CrosswordPuzzleView({
  rows,
  cols,
  table,
  words,
  showAnswers = false,
  title,
  cellSize = 36,
}: CrosswordPuzzleViewProps) {
  return (
    <div className="space-y-6">
      {title && (
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
      )}

      <div className="flex justify-center">
        <CrosswordGrid
          rows={rows}
          cols={cols}
          table={table}
          words={words}
          showAnswers={showAnswers}
          cellSize={cellSize}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <CrosswordClueList words={words} direction="across" />
        <CrosswordClueList words={words} direction="down" />
      </div>
    </div>
  )
}
