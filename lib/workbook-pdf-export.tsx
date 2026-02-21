import React from 'react'
import ReactPDF from '@react-pdf/renderer'
import type { Product } from '@/lib/product-types'

const { Document, Page, Text, View, StyleSheet, Font, pdf } = ReactPDF

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiA.woff2', fontWeight: 700 },
  ],
})

function sanitize(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x20-\x7E\n\r\t]/g, '')
}

const MARGIN = 54
const ANSWER_BOX_LINES = 3
const LINE_HEIGHT_PX = 18

export interface WorkbookPdfSettings {
  showHints: boolean
  showSectionIntro: boolean
  showDifficulty: boolean
  answerBoxLines: number
}

export const DEFAULT_PDF_SETTINGS: WorkbookPdfSettings = {
  showHints: true,
  showSectionIntro: true,
  showDifficulty: true,
  answerBoxLines: ANSWER_BOX_LINES,
}

const s = StyleSheet.create({
  page: {
    paddingTop: MARGIN,
    paddingBottom: MARGIN + 10,
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
  instrTitle: { fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 24 },
  instrStep: { fontSize: 12, marginBottom: 10, lineHeight: 1.6, color: '#333' },
  sectionHeader: { marginBottom: 16, borderBottomWidth: 1.5, borderBottomColor: '#222', paddingBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 4 },
  sectionIntro: { fontSize: 10, color: '#555', lineHeight: 1.5, marginTop: 4 },
  questionBlock: { marginBottom: 18 },
  questionRow: { flexDirection: 'row', marginBottom: 4 },
  questionNumber: { fontSize: 12, fontWeight: 700, width: 28, color: '#333' },
  questionText: { fontSize: 12, flex: 1, lineHeight: 1.5, color: '#1a1a1a' },
  difficultyTag: { fontSize: 7, fontWeight: 600, color: '#999', marginTop: 3 },
  answerArea: { marginLeft: 28, marginTop: 2 },
  writingLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#bbb',
    height: LINE_HEIGHT_PX,
  },
  hintsBox: { marginTop: 14, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#ddd' },
  hintsTitle: { fontSize: 9, fontWeight: 700, color: '#888', marginBottom: 6, letterSpacing: 0.8 },
  hintRow: { flexDirection: 'row', marginBottom: 3 },
  hintNum: { fontSize: 8, fontWeight: 600, width: 22, color: '#999' },
  hintText: { fontSize: 8, color: '#999', flex: 1 },
  pageNum: { position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 10, color: '#aaa' },
  answerKeyTitle: { fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 30 },
  akSectionTitle: { fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#333', borderBottomWidth: 0.5, borderBottomColor: '#ddd', paddingBottom: 4 },
  akRow: { flexDirection: 'row', marginBottom: 6 },
  akNumber: { fontSize: 10, fontWeight: 700, width: 24, color: '#333' },
  akAnswer: { fontSize: 10, fontWeight: 600, color: '#111', flex: 1 },
  akFunFact: { fontSize: 8, color: '#666', marginLeft: 24, marginBottom: 4, lineHeight: 1.4 },
  akBlock: { marginBottom: 16 },
})

interface QuestionData {
  question: string
  answer: string
  difficulty: string
  funFact: string
  globalNumber: number
}

interface SectionData {
  title: string
  description: string
  questions: QuestionData[]
}

function extractSections(product: Product): SectionData[] {
  const sections: SectionData[] = []
  let globalQ = 1

  for (const section of product.sections) {
    if (section.hidden) continue
    const questions: QuestionData[] = []
    for (const el of section.elements) {
      if (el.hidden) continue
      questions.push({
        question: sanitize(el.fields.question || ''),
        answer: sanitize(el.fields.answer || ''),
        difficulty: sanitize(el.fields.difficulty || 'medium'),
        funFact: sanitize(el.fields.funFact || ''),
        globalNumber: globalQ++,
      })
    }
    if (questions.length > 0) {
      sections.push({
        title: sanitize(section.name.replace(/^\d+[\.\)\-:]\s+/, '')),
        description: sanitize(section.description || ''),
        questions,
      })
    }
  }

  return sections
}

function buildHint(answer: string): string {
  const trimmed = answer.trim()
  if (!trimmed) return ''
  const words = trimmed.split(/\s+/)
  const firstLetter = trimmed[0].toUpperCase()
  if (words.length === 1) {
    return `${trimmed.length} letters, starts with "${firstLetter}"`
  }
  return `${words.length} words, starts with "${firstLetter}"`
}

function WritingLines({ lines }: { lines: number }) {
  return (
    <View style={s.answerArea}>
      {Array.from({ length: lines }, (_, i) => (
        <View key={i} style={s.writingLine} />
      ))}
    </View>
  )
}

function WorkbookPdfDocument({
  product,
  sections,
  settings,
}: {
  product: Product
  sections: SectionData[]
  settings: WorkbookPdfSettings
}) {
  const totalQuestions = sections.reduce((sum, sec) => sum + sec.questions.length, 0)
  const productName = sanitize(product.name)
  const authorName = product.branding.authorName ? sanitize(product.branding.authorName) : ''

  return (
    <Document title={productName} author={authorName || 'DigiCraft'}>
      {/* Title page */}
      <Page size="LETTER" style={[s.page, s.titlePage]}>
        <Text style={s.titleText}>{productName}</Text>
        <Text style={s.subtitleText}>
          {totalQuestions} Questions across {sections.length} Topic{sections.length !== 1 ? 's' : ''}
        </Text>
        {authorName ? (
          <Text style={s.authorText}>by {authorName}</Text>
        ) : null}
      </Page>

      {/* Instructions page */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.instrTitle}>How to Use This Workbook</Text>
        <Text style={s.instrStep}>
          1. Read each question carefully. Take your time - there is no rush!
        </Text>
        <Text style={s.instrStep}>
          2. Write your answer on the lines below each question. Keep it short - a few words or a sentence is all you need.
        </Text>
        <Text style={s.instrStep}>
          3. If you do not know the answer, that is okay! Make your best guess, or skip it and come back later.
        </Text>
        {settings.showHints ? (
          <Text style={s.instrStep}>
            4. Need help? Check the hints at the bottom of each page for clues like the first letter or word count.
          </Text>
        ) : null}
        <Text style={s.instrStep}>
          {settings.showHints ? '5' : '4'}. After you have answered all the questions, check the Answer Key at the back of the book.
        </Text>
        <Text style={s.instrStep}>
          {settings.showHints ? '6' : '5'}. Each answer comes with a Fun Fact - read them all to learn something extra!
        </Text>
        <Text style={s.pageNum}>2</Text>
      </Page>

      {/* Question pages */}
      {sections.map((section, sIdx) => (
        <Page key={`section-${sIdx}`} size="LETTER" style={s.page} wrap>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            {settings.showSectionIntro && section.description ? (
              <Text style={s.sectionIntro}>{section.description}</Text>
            ) : null}
          </View>

          {section.questions.map((q) => (
            <View key={q.globalNumber} style={s.questionBlock} wrap={false}>
              <View style={s.questionRow}>
                <Text style={s.questionNumber}>{q.globalNumber}.</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.questionText}>{q.question}</Text>
                  {settings.showDifficulty ? (
                    <Text style={s.difficultyTag}>
                      {q.difficulty === 'easy' ? '* Easy' : q.difficulty === 'hard' ? '*** Hard' : '** Medium'}
                    </Text>
                  ) : null}
                </View>
              </View>
              <WritingLines lines={settings.answerBoxLines} />
            </View>
          ))}

          {settings.showHints ? (
            <View style={s.hintsBox} wrap={false}>
              <Text style={s.hintsTitle}>HINTS</Text>
              {section.questions.map((q) => {
                const hint = buildHint(q.answer)
                if (!hint) return null
                return (
                  <View key={`hint-${q.globalNumber}`} style={s.hintRow}>
                    <Text style={s.hintNum}>{q.globalNumber}.</Text>
                    <Text style={s.hintText}>{hint}</Text>
                  </View>
                )
              })}
            </View>
          ) : null}

          <Text style={s.pageNum}>{sIdx + 3}</Text>
        </Page>
      ))}

      {/* Answer key */}
      <Page size="LETTER" style={s.page} wrap>
        <Text style={s.answerKeyTitle}>Answer Key</Text>
        {sections.map((section, sIdx) => (
          <View key={`ak-${sIdx}`} style={s.akBlock} wrap={false}>
            <Text style={s.akSectionTitle}>{section.title}</Text>
            {section.questions.map((q) => (
              <View key={q.globalNumber}>
                <View style={s.akRow}>
                  <Text style={s.akNumber}>{q.globalNumber}.</Text>
                  <Text style={s.akAnswer}>{q.answer}</Text>
                </View>
                {q.funFact ? (
                  <Text style={s.akFunFact}>Fun fact: {q.funFact}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  )
}

export async function generateWorkbookPdf(
  product: Product,
  settings: WorkbookPdfSettings = DEFAULT_PDF_SETTINGS,
): Promise<Blob> {
  const sections = extractSections(product)

  if (sections.length === 0) {
    throw new Error('No questions found in this product')
  }

  const doc = <WorkbookPdfDocument product={product} sections={sections} settings={settings} />
  const blob = await pdf(doc).toBlob()
  return blob
}
