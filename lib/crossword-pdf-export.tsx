import React from 'react'
import ReactPDF from '@react-pdf/renderer'
import type { Product } from '@/lib/product-types'
import { reconstructGridFromSection, type CrosswordGrid, type PositionedWord } from '@/lib/crossword-layout'

const { Document, Page, Text, View, StyleSheet, Font, pdf, Svg, Rect, G } = ReactPDF

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiA.woff2', fontWeight: 700 },
  ],
})

const MARGIN = 54
const CONTENT_WIDTH = 612 - MARGIN * 2

const s = StyleSheet.create({
  page: {
    paddingTop: MARGIN,
    paddingBottom: MARGIN,
    paddingLeft: MARGIN,
    paddingRight: MARGIN,
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#1a1a1a',
  },
  titlePage: { justifyContent: 'center', alignItems: 'center' },
  titleText: { fontSize: 36, fontWeight: 700, textAlign: 'center', marginBottom: 16 },
  subtitleText: { fontSize: 16, fontWeight: 400, textAlign: 'center', color: '#666', marginBottom: 40 },
  authorText: { fontSize: 14, fontWeight: 600, textAlign: 'center', color: '#444', marginTop: 20 },
  puzzleNumber: { fontSize: 12, fontWeight: 600, textAlign: 'center', color: '#888', marginBottom: 4 },
  puzzleTitle: { fontSize: 20, fontWeight: 700, marginBottom: 16, textAlign: 'center' },
  gridWrap: { alignItems: 'center', marginBottom: 16 },
  clueColumns: { flexDirection: 'row', gap: 16 },
  clueCol: { flex: 1 },
  clueHeader: { fontSize: 12, fontWeight: 700, marginBottom: 6, letterSpacing: 1, color: '#333' },
  clueRow: { flexDirection: 'row', marginBottom: 3 },
  clueNum: { fontSize: 9, fontWeight: 700, width: 20, color: '#333' },
  clueTxt: { fontSize: 9, flex: 1, color: '#444', lineHeight: 1.4 },
  answerTitle: { fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 30 },
  answerLabel: { fontSize: 10, fontWeight: 600, textAlign: 'center', marginBottom: 8, color: '#666' },
  answerWrap: { alignItems: 'center', marginBottom: 20 },
  instrTitle: { fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 24 },
  instrStep: { fontSize: 12, marginBottom: 10, lineHeight: 1.6, color: '#333' },
  pageNum: { position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 10, color: '#aaa' },
  // Grid cells — using View-based layout
  gridRow: { flexDirection: 'row' },
  cellBlack: { backgroundColor: '#222' },
  cellWhite: { backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#999' },
  cellNumber: { position: 'absolute', top: 1, left: 2, fontSize: 6, fontWeight: 700, color: '#333' },
  cellLetter: { textAlign: 'center', fontWeight: 600, color: '#1a1a1a' },
})

function PdfGrid({
  grid,
  showAnswers,
  cellSize,
}: {
  grid: CrosswordGrid
  showAnswers: boolean
  cellSize: number
}) {
  const { rows, cols, table, words } = grid

  const numberMap = new Map<string, number>()
  for (const w of words) {
    const key = `${w.startY}-${w.startX}`
    if (!numberMap.has(key)) numberMap.set(key, w.number)
  }

  return (
    <View style={{ width: cols * cellSize + 2, border: '1pt solid #222' }}>
      {Array.from({ length: rows }, (_, r) => (
        <View key={r} style={s.gridRow}>
          {Array.from({ length: cols }, (_, c) => {
            const letter = table[r]?.[c] ?? '-'
            const isBlack = letter === '-'
            const number = numberMap.get(`${r}-${c}`)

            return (
              <View
                key={c}
                style={[
                  { width: cellSize, height: cellSize, position: 'relative' },
                  isBlack ? s.cellBlack : s.cellWhite,
                ]}
              >
                {number !== undefined && (
                  <Text style={[s.cellNumber, { fontSize: Math.max(5, cellSize * 0.24) }]}>
                    {number}
                  </Text>
                )}
                {showAnswers && !isBlack && letter !== '-' && (
                  <Text
                    style={[
                      s.cellLetter,
                      {
                        fontSize: cellSize * 0.45,
                        lineHeight: 1,
                        marginTop: cellSize * 0.28,
                      },
                    ]}
                  >
                    {letter.toUpperCase()}
                  </Text>
                )}
              </View>
            )
          })}
        </View>
      ))}
    </View>
  )
}

function ClueList({
  words,
  direction,
}: {
  words: PositionedWord[]
  direction: 'across' | 'down'
}) {
  const filtered = words
    .filter((w) => w.direction === direction)
    .sort((a, b) => a.number - b.number)

  if (filtered.length === 0) return null

  return (
    <View style={s.clueCol}>
      <Text style={s.clueHeader}>{direction === 'across' ? 'ACROSS' : 'DOWN'}</Text>
      {filtered.map((w) => (
        <View key={`${w.number}-${w.direction}`} style={s.clueRow}>
          <Text style={s.clueNum}>{w.number}.</Text>
          <Text style={s.clueTxt}>{w.clue}</Text>
        </View>
      ))}
    </View>
  )
}

function CrosswordPdfDocument({
  product,
  grids,
}: {
  product: Product
  grids: { title: string; grid: CrosswordGrid }[]
}) {
  const maxCols = Math.max(...grids.map((g) => g.grid.cols), 10)
  const maxRows = Math.max(...grids.map((g) => g.grid.rows), 10)
  const cellSize = Math.min(32, Math.floor(CONTENT_WIDTH / maxCols), Math.floor(300 / maxRows))
  const answerCellSize = Math.min(16, Math.floor((CONTENT_WIDTH * 0.45) / maxCols))

  return (
    <Document title={product.name} author={product.branding.authorName || 'DigiCraft'}>
      {/* Title page */}
      <Page size="LETTER" style={[s.page, s.titlePage]}>
        <Text style={s.titleText}>{product.name}</Text>
        <Text style={s.subtitleText}>
          {grids.length} Crossword Puzzle{grids.length !== 1 ? 's' : ''} for Young Explorers
        </Text>
        {product.branding.authorName && (
          <Text style={s.authorText}>by {product.branding.authorName}</Text>
        )}
      </Page>

      {/* Instructions page */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.instrTitle}>How to Solve Crossword Puzzles</Text>
        <Text style={s.instrStep}>
          1. Read the clues below each puzzle. They are split into two groups: Across (horizontal) and Down (vertical).
        </Text>
        <Text style={s.instrStep}>
          2. Each clue has a number. Find that number on the puzzle grid — that is where your answer starts.
        </Text>
        <Text style={s.instrStep}>
          3. Write one letter in each white square. The answer goes left-to-right for Across clues, and top-to-bottom for Down clues.
        </Text>
        <Text style={s.instrStep}>
          4. Some squares are shared between an Across and a Down word — the letter must be the same for both!
        </Text>
        <Text style={s.instrStep}>
          5. If you get stuck, try solving the crossing words first. A few letters can help you figure out a hard word.
        </Text>
        <Text style={s.instrStep}>
          6. The answers are at the back of the book. Try your best before peeking!
        </Text>
        <Text style={s.pageNum}>2</Text>
      </Page>

      {/* Puzzle pages */}
      {grids.map(({ title, grid }, idx) => (
        <Page key={`puzzle-${idx}`} size="LETTER" style={s.page}>
          <Text style={s.puzzleNumber}>Puzzle {idx + 1}</Text>
          <Text style={s.puzzleTitle}>{title}</Text>
          <View style={s.gridWrap}>
            <PdfGrid grid={grid} showAnswers={false} cellSize={cellSize} />
          </View>
          <View style={s.clueColumns}>
            <ClueList words={grid.words} direction="across" />
            <ClueList words={grid.words} direction="down" />
          </View>
          <Text style={s.pageNum}>{idx + 3}</Text>
        </Page>
      ))}

      {/* Answer key — multiple per page */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.answerTitle}>Answer Key</Text>
        {grids.map(({ title, grid }, idx) => (
          <View key={`answer-${idx}`} style={s.answerWrap} wrap={false}>
            <Text style={s.answerLabel}>
              Puzzle {idx + 1}: {title}
            </Text>
            <PdfGrid grid={grid} showAnswers={true} cellSize={answerCellSize} />
          </View>
        ))}
        <Text style={s.pageNum}>{grids.length + 3}</Text>
      </Page>
    </Document>
  )
}

export async function generateCrosswordPdf(product: Product): Promise<Blob> {
  const grids: { title: string; grid: CrosswordGrid }[] = []

  for (const section of product.sections) {
    if (section.hidden) continue
    const grid = reconstructGridFromSection(section)
    if (grid && grid.words.length > 0) {
      grids.push({
        title: section.name.replace(/^\d+[\.\)\-:]\s+/, ''),
        grid,
      })
    }
  }

  if (grids.length === 0) {
    throw new Error('No crossword puzzles found in this product')
  }

  const doc = <CrosswordPdfDocument product={product} grids={grids} />
  const blob = await pdf(doc).toBlob()
  return blob
}
