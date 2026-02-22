import type { DirectoryProduct, DirectorySection, DirectoryElement } from '@/lib/export-import'
import type { OutputTypeField } from '@/lib/output-type-library'
import type { FieldValue, TableRow, Annotation } from '@/lib/product-types'
import { ANNOTATION_TYPE_META, type AnnotationType } from '@/lib/product-types'

function escapeCell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

function renderTable(rows: TableRow[], columns?: { key: string; label: string }[]): string {
  if (rows.length === 0) return ''
  const cols = columns ?? Object.keys(rows[0]).map((k) => ({ key: k, label: k }))
  const header = '| ' + cols.map((c) => escapeCell(c.label)).join(' | ') + ' |'
  const sep = '| ' + cols.map(() => '---').join(' | ') + ' |'
  const body = rows.map((row) => '| ' + cols.map((c) => escapeCell(row[c.key] || '')).join(' | ') + ' |')
  return [header, sep, ...body].join('\n')
}

function renderFieldValue(val: FieldValue | undefined, field?: OutputTypeField): string {
  if (val == null) return ''
  if (typeof val === 'string') return val
  if (Array.isArray(val)) return renderTable(val, field?.columns)
  return ''
}

function findPrimaryField(fields: OutputTypeField[]): OutputTypeField | undefined {
  return fields.find((f) => f.primary)
}

function renderDissection(el: DirectoryElement): string {
  const d = el.dissection
  if (!d) return ''
  const parts: string[] = ['', '#### Deep Dive', '']
  if (d.frameworkUsed) {
    parts.push(`**Framework:** ${d.frameworkUsed.name}`)
    if (d.frameworkUsed.shortDescription) parts.push(`> ${d.frameworkUsed.shortDescription}`)
    parts.push('')
  }
  if (d.keyInsight) {
    parts.push(`**Key Insight:** ${d.keyInsight}`, '')
  }
  if (d.thinkingFramework?.length) {
    parts.push('**Thinking Framework:**', '')
    for (const step of d.thinkingFramework) {
      parts.push(`${step.step}. **${step.title}** — ${step.description}`)
    }
    parts.push('')
  }
  if (d.checklist?.length) {
    parts.push('**Checklist:**', '')
    for (const item of d.checklist) {
      const req = item.isRequired ? ' *(required)*' : ''
      parts.push(`- [ ] **${item.item}**${req} — ${item.description}`)
    }
    parts.push('')
  }
  if (d.resources?.length) {
    parts.push('**Resources:**', '')
    for (const r of d.resources) {
      const link = r.url ? `[${r.title}](${r.url})` : r.title
      parts.push(`- ${link} (${r.type}) — ${r.description}`)
    }
    parts.push('')
  }
  return parts.join('\n')
}

function renderDeeperQuestions(el: DirectoryElement): string {
  const dq = el.deeperQuestions
  if (!dq) return ''
  const parts: string[] = ['', '#### Deeper Questions', '']
  if (dq.secondOrder?.length) {
    parts.push('**Second-Order:**', '')
    for (const q of dq.secondOrder) {
      parts.push(`- **${q.question}**  `)
      parts.push(`  _${q.reasoning}_`)
    }
    parts.push('')
  }
  if (dq.thirdOrder?.length) {
    parts.push('**Third-Order:**', '')
    for (const q of dq.thirdOrder) {
      parts.push(`- **${q.question}**  `)
      parts.push(`  _${q.reasoning}_`)
    }
    parts.push('')
  }
  return parts.join('\n')
}

function renderAnswer(el: DirectoryElement): string {
  const a = el.answer
  if (!a) return ''
  const parts: string[] = ['', '#### Answer', '']
  parts.push(a.answer, '')
  if (a.sources?.length) {
    parts.push('**Sources:**', '')
    for (const s of a.sources) {
      parts.push(`- [${s.title}](${s.url})`)
    }
    parts.push('')
  }
  return parts.join('\n')
}

function renderAnnotations(annotations: Annotation[] | undefined): string {
  if (!annotations?.length) return ''
  const parts: string[] = ['', '#### Annotations', '']
  for (const a of annotations) {
    const label = ANNOTATION_TYPE_META[a.type as AnnotationType]?.label ?? a.type
    parts.push(`- **[${label}]** ${a.title} — ${a.content}`)
  }
  parts.push('')
  return parts.join('\n')
}

function renderElement(
  el: DirectoryElement,
  index: number,
  fields: OutputTypeField[],
  elementLabel: string,
): string {
  const primary = findPrimaryField(fields)
  const primaryVal = primary ? renderFieldValue(el.fields[primary.key], primary) : ''
  const heading = primaryVal
    ? `### ${index + 1}. ${primaryVal}`
    : `### ${elementLabel} ${index + 1}`

  const parts: string[] = [heading, '']

  for (const field of fields) {
    if (field.primary) continue
    const val = renderFieldValue(el.fields[field.key], field)
    if (!val) continue
    if (field.type === 'table') {
      parts.push(`**${field.label}:**`, '', val, '')
    } else {
      parts.push(`**${field.label}:** ${val}`, '')
    }
  }

  parts.push(renderDissection(el))
  parts.push(renderDeeperQuestions(el))
  parts.push(renderAnswer(el))
  parts.push(renderAnnotations(el.annotations))

  return parts.join('\n')
}

function renderSection(
  section: DirectorySection,
  defaultFields: OutputTypeField[],
  elementLabel: string,
): string {
  const fields = section.fields?.length ? section.fields : defaultFields
  const parts: string[] = [`## ${section.name}`, '']
  if (section.description) {
    parts.push(`> ${section.description}`, '')
  }
  for (let i = 0; i < section.elements.length; i++) {
    parts.push(renderElement(section.elements[i], i, fields, elementLabel))
  }
  return parts.join('\n')
}

export function buildMarkdown(dp: DirectoryProduct): string {
  const parts: string[] = []

  parts.push(`# ${dp.name}`, '')
  if (dp.description) {
    parts.push(`> ${dp.description}`, '')
  }
  parts.push(`*${dp.outputType.name}*`, '')

  if (dp.context.length) {
    parts.push('## Context', '')
    parts.push('| Field | Value |')
    parts.push('| --- | --- |')
    for (const c of dp.context) {
      parts.push(`| ${escapeCell(c.label)} | ${escapeCell(c.value)} |`)
    }
    parts.push('')
  }

  if (dp.branding.authorName) {
    parts.push(`**Author:** ${dp.branding.authorName}`, '')
    if (dp.branding.authorBio) {
      parts.push(`${dp.branding.authorBio}`, '')
    }
  }

  parts.push('---', '')

  for (const section of dp.sections) {
    parts.push(renderSection(section, dp.outputType.fields, dp.outputType.elementLabel))
  }

  return parts.join('\n')
}
