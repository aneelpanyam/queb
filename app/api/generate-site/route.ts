interface FieldDef {
  key: string
  label: string
  type: 'short-text' | 'long-text'
  primary?: boolean
}

interface OutputTypeDef {
  name: string
  sectionLabel: string
  elementLabel: string
  fields: FieldDef[]
  supportsDeepDive?: boolean
  supportsDeeperQuestions?: boolean
}

interface DissectionData {
  thinkingFramework: { step: number; title: string; description: string }[]
  checklist: { item: string; description: string; isRequired: boolean }[]
  resources: { title: string; type: string; url: string; description: string }[]
  keyInsight: string
}

interface DeeperData {
  secondOrder: { question: string; reasoning: string }[]
  thirdOrder: { question: string; reasoning: string }[]
}

interface ElementData {
  fields: Record<string, string>
  dissection?: DissectionData
  deeperQuestions?: DeeperData
}

interface SectionData {
  name: string
  description: string
  elements: ElementData[]
}

interface ContextEntry {
  label: string
  value: string
}

interface ExportPayload {
  outputType: string
  outputTypeDef: OutputTypeDef
  contextEntries: ContextEntry[]
  sections: SectionData[]
  productName: string
  branding: { accentColor: string; authorName: string; authorBio: string }
}

export async function POST(req: Request) {
  try {
    const payload: ExportPayload = await req.json()
    const { outputType, outputTypeDef, contextEntries, sections, productName, branding } = payload

    const html = buildSiteHtml({ outputType, outputTypeDef, contextEntries, sections, productName, branding })

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (error) {
    console.error('[generate-site] Error:', error)
    return Response.json(
      { error: 'Failed to generate site. Please try again.' },
      { status: 500 },
    )
  }
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function nl2br(str: string): string {
  return esc(str).replace(/\n/g, '<br/>')
}

function buildDissectionHtml(d: DissectionData): string {
  const fw = d.thinkingFramework
    .map(
      (s) =>
        `<div class="fw-step"><span class="fw-num">${s.step}</span><div><div class="fw-title">${esc(s.title)}</div><div class="fw-desc">${esc(s.description)}</div></div></div>`,
    )
    .join('')

  const cl = d.checklist
    .map(
      (c) =>
        `<div class="cl-item"><span class="cl-badge ${c.isRequired ? 'req' : 'opt'}">${c.isRequired ? 'Required' : 'Optional'}</span><div><div class="cl-label">${esc(c.item)}</div><div class="cl-desc">${esc(c.description)}</div></div></div>`,
    )
    .join('')

  const res = d.resources
    .map(
      (r) =>
        `<a href="${esc(r.url)}" target="_blank" rel="noopener" class="res-card"><span class="res-type">${esc(r.type)}</span><div class="res-title">${esc(r.title)}</div><div class="res-desc">${esc(r.description)}</div></a>`,
    )
    .join('')

  return `
    <div class="section-block">
      <h3>Thinking Framework</h3>
      <div class="fw-list">${fw}</div>
      <h3>Checklist</h3>
      <div class="cl-list">${cl}</div>
      <h3>Resources</h3>
      <div class="res-grid">${res}</div>
      <div class="insight-box"><div class="insight-label">Key Insight</div><p>${esc(d.keyInsight)}</p></div>
    </div>`
}

function buildDeeperHtml(dq: DeeperData): string {
  const s2 = dq.secondOrder
    .map(
      (x) =>
        `<div class="dq"><p class="dq-q">${esc(x.question)}</p><p class="dq-r">${esc(x.reasoning)}</p></div>`,
    )
    .join('')
  const s3 = dq.thirdOrder
    .map(
      (x) =>
        `<div class="dq"><p class="dq-q">${esc(x.question)}</p><p class="dq-r">${esc(x.reasoning)}</p></div>`,
    )
    .join('')

  return `
    <div class="section-block">
      <h3><span class="order-badge o2">2</span> 2nd-Order Thinking</h3>
      <div class="dq-list">${s2}</div>
      <h3><span class="order-badge o3">3</span> 3rd-Order Thinking</h3>
      <div class="dq-list">${s3}</div>
    </div>`
}

// ── Per-output-type element renderers ──────────────────────────

function renderQuestionElement(el: ElementData): string {
  const question = el.fields.question || ''
  const relevance = el.fields.relevance || ''
  const infoPrompt = el.fields.infoPrompt || ''

  let html = `<h2 class="el-title">${esc(question)}</h2>`

  if (relevance) {
    html += `
      <div class="meta-card amber">
        <div class="meta-label">Why This Matters</div>
        <p>${esc(relevance)}</p>
      </div>`
  }
  if (infoPrompt) {
    html += `
      <div class="meta-card blue">
        <div class="meta-label">How to Find the Answer</div>
        <p>${esc(infoPrompt)}</p>
      </div>`
  }

  if (el.dissection) html += buildDissectionHtml(el.dissection)
  if (el.deeperQuestions) html += buildDeeperHtml(el.deeperQuestions)
  return html
}

function renderChecklistElement(el: ElementData): string {
  const item = el.fields.item || ''
  const description = el.fields.description || ''
  const priority = el.fields.priority || 'Medium'
  const pClass = priority === 'High' ? 'pri-high' : priority === 'Low' ? 'pri-low' : 'pri-med'

  let html = `
    <div class="el-header-row">
      <h2 class="el-title">${esc(item)}</h2>
      <span class="priority-badge ${pClass}">${esc(priority)}</span>
    </div>`

  if (description) {
    html += `
      <div class="meta-card ${pClass}">
        <div class="meta-label">What to Know</div>
        <p>${esc(description)}</p>
      </div>`
  }

  if (el.dissection) html += buildDissectionHtml(el.dissection)
  return html
}

function renderEmailCourseElement(el: ElementData): string {
  const subject = el.fields.subject || ''
  const body = el.fields.body || ''
  const cta = el.fields.callToAction || ''

  let html = `
    <div class="el-header-row">
      <span class="icon-mail">✉</span>
      <h2 class="el-title">${esc(subject)}</h2>
    </div>`

  if (body) {
    html += `
      <div class="meta-card plain">
        <p class="preserve-ws">${nl2br(body)}</p>
      </div>`
  }
  if (cta) {
    html += `
      <div class="meta-card accent">
        <div class="meta-label">Call to Action</div>
        <p class="cta-text">${esc(cta)}</p>
      </div>`
  }

  if (el.dissection) html += buildDissectionHtml(el.dissection)
  return html
}

function renderPromptElement(el: ElementData, elId: string): string {
  const prompt = el.fields.prompt || ''
  const context = el.fields.context || ''
  const expectedOutput = el.fields.expectedOutput || ''

  let html = `
    <div class="prompt-label">AI Prompt Template</div>
    <div class="prompt-box">
      <button class="copy-btn" onclick="copyPrompt('${elId}')">Copy</button>
      <pre class="prompt-text" id="pt-${elId}">${esc(prompt)}</pre>
    </div>`

  if (context) {
    html += `
      <div class="meta-card amber">
        <div class="meta-label">When to Use</div>
        <p>${esc(context)}</p>
      </div>`
  }
  if (expectedOutput) {
    html += `
      <div class="meta-card emerald">
        <div class="meta-label">Expected Output</div>
        <p>${esc(expectedOutput)}</p>
      </div>`
  }

  if (el.dissection) html += buildDissectionHtml(el.dissection)
  return html
}

function renderBattleCardElement(el: ElementData): string {
  const title = el.fields.title || ''
  const strengths = el.fields.strengths || ''
  const weaknesses = el.fields.weaknesses || ''
  const talkingPoints = el.fields.talkingPoints || ''

  let html = `
    <div class="el-header-row">
      <span class="icon-swords">⚔</span>
      <h2 class="el-title">${esc(title)}</h2>
    </div>`

  if (strengths || weaknesses) {
    html += `<div class="bc-grid">`
    if (strengths) {
      html += `
        <div class="meta-card red">
          <div class="meta-label">Their Strengths</div>
          <p class="preserve-ws">${nl2br(strengths)}</p>
        </div>`
    }
    if (weaknesses) {
      html += `
        <div class="meta-card green">
          <div class="meta-label">Their Weaknesses</div>
          <p class="preserve-ws">${nl2br(weaknesses)}</p>
        </div>`
    }
    html += `</div>`
  }

  if (talkingPoints) {
    html += `
      <div class="meta-card accent">
        <div class="meta-label">Your Talking Points</div>
        <p class="preserve-ws tp-text">${nl2br(talkingPoints)}</p>
      </div>`
  }

  if (el.dissection) html += buildDissectionHtml(el.dissection)
  return html
}

function renderGenericElement(el: ElementData, def: OutputTypeDef): string {
  const primaryField = def.fields.find((f) => f.primary) || def.fields[0]
  const primaryVal = el.fields[primaryField.key] || ''
  const nonPrimary = def.fields.filter((f) => !f.primary)

  let html = `<h2 class="el-title">${esc(primaryVal)}</h2>`

  for (const field of nonPrimary) {
    const value = el.fields[field.key]
    if (!value) continue
    html += `
      <div class="meta-card plain">
        <div class="meta-label">${esc(field.label)}</div>
        <p>${esc(value)}</p>
      </div>`
  }

  if (el.dissection) html += buildDissectionHtml(el.dissection)
  if (el.deeperQuestions) html += buildDeeperHtml(el.deeperQuestions)
  return html
}

// ── Main builder ───────────────────────────────────────────────

function buildSiteHtml(data: {
  outputType: string
  outputTypeDef: OutputTypeDef
  contextEntries: ContextEntry[]
  sections: SectionData[]
  productName: string
  branding: { accentColor: string; authorName: string; authorBio: string }
}) {
  const { outputType, outputTypeDef, contextEntries, sections, productName, branding } = data
  const primaryField = outputTypeDef.fields.find((f) => f.primary) || outputTypeDef.fields[0]
  const sLabel = outputTypeDef.sectionLabel
  const eLabel = outputTypeDef.elementLabel
  const accentColor = branding.accentColor || '#1a5186'

  const allElements: {
    id: string
    sectionName: string
    sectionDesc: string
    data: ElementData
  }[] = []

  let idx = 0
  for (const s of sections) {
    for (const el of s.elements) {
      allElements.push({
        id: `el${idx}`,
        sectionName: s.name,
        sectionDesc: s.description,
        data: el,
      })
      idx++
    }
  }

  // Sidebar nav
  const sidebarHtml: string[] = []
  let prevSection = ''
  for (const el of allElements) {
    if (el.sectionName !== prevSection) {
      sidebarHtml.push(`<div class="nav-group">${esc(el.sectionName)}</div>`)
      prevSection = el.sectionName
    }
    const primaryVal = el.data.fields[primaryField.key] || Object.values(el.data.fields)[0] || ''
    const short = primaryVal.length > 65 ? primaryVal.slice(0, 62) + '...' : primaryVal
    sidebarHtml.push(
      `<button class="nav-btn" data-id="${el.id}" onclick="showEl('${el.id}')">${esc(short)}</button>`,
    )
  }

  // Context entries for sidebar
  let contextHtml = ''
  const filtered = contextEntries.filter((c) => c.label?.trim() && c.value?.trim())
  if (filtered.length > 0) {
    const items = filtered
      .map(
        (c) =>
          `<div class="ctx-item"><span class="ctx-label">${esc(c.label)}</span><span class="ctx-value">${esc(c.value)}</span></div>`,
      )
      .join('')
    contextHtml = `<div class="ctx-grid">${items}</div>`
  }

  // Topbar from context entries
  const topbarItems = filtered
    .slice(0, 5)
    .map((c) => `<span><strong>${esc(c.label)}:</strong> ${esc(c.value)}</span>`)
    .join('\n      ')

  // Content panels
  const contentHtml: string[] = []
  for (const el of allElements) {
    let innerHtml: string
    switch (outputType) {
      case 'questions':
        innerHtml = renderQuestionElement(el.data)
        break
      case 'checklist':
        innerHtml = renderChecklistElement(el.data)
        break
      case 'email-course':
        innerHtml = renderEmailCourseElement(el.data)
        break
      case 'prompts':
        innerHtml = renderPromptElement(el.data, el.id)
        break
      case 'battle-cards':
        innerHtml = renderBattleCardElement(el.data)
        break
      default:
        innerHtml = renderGenericElement(el.data, outputTypeDef)
        break
    }

    contentHtml.push(`
      <article id="${el.id}" class="el-panel" style="display:none">
        <div class="el-header">
          <span class="el-section">${esc(el.sectionName)}</span>
          <p class="el-section-desc">${esc(el.sectionDesc)}</p>
        </div>
        ${innerHtml}
      </article>`)
  }

  const firstId = allElements.length > 0 ? allElements[0].id : ''
  const hasPrompts = outputType === 'prompts'

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(productName)} — ${esc(outputTypeDef.name)}</title>
<style>
:root{--accent:${accentColor};--accent-bg:${accentColor}14;--accent-border:${accentColor}33}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#f7f9fb;color:#27313a;overflow:hidden;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
.app{display:flex;height:100vh}

::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:#f7f9fb}
::-webkit-scrollbar-thumb{background:#d4dae0;border-radius:5px;border:2px solid #f7f9fb}
::-webkit-scrollbar-thumb:hover{background:#c1c9d0}
*{scrollbar-width:thin;scrollbar-color:#d4dae0 #f7f9fb}

/* Sidebar */
.sidebar{width:340px;min-width:340px;background:#fff;border-right:1px solid #d4dae0;display:flex;flex-direction:column;height:100vh}
.sidebar-head{padding:20px;border-bottom:1px solid #d4dae0}
.sidebar-head h1{font-size:16px;font-weight:700;color:#27313a;letter-spacing:-.01em}
.sidebar-head .meta{font-size:12px;color:#6b7684;margin-top:6px;line-height:1.5}
.sidebar-head .badge{display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--accent);background:var(--accent-bg);border:1px solid var(--accent-border);padding:3px 8px;border-radius:4px;margin-top:8px}
.ctx-grid{display:flex;flex-direction:column;gap:8px;padding:12px 20px;border-bottom:1px solid #d4dae0;background:#f7f9fb}
.ctx-item{display:flex;flex-direction:column;gap:3px}
.ctx-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--accent)}
.ctx-value{font-size:12px;color:#6b7684;line-height:1.5}
.sidebar-nav{flex:1;overflow-y:auto;padding:10px}
.nav-group{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--accent);padding:16px 10px 6px}
.nav-btn{display:block;width:100%;text-align:left;background:none;border:none;padding:10px 14px;font-size:13px;color:#6b7684;border-radius:6px;cursor:pointer;line-height:1.5;transition:all .15s;font-family:inherit;font-weight:400}
.nav-btn:hover{background:#e8ecf0;color:#27313a}
.nav-btn.active{background:var(--accent-bg);color:var(--accent);font-weight:600}
.el-counter{font-size:12px;color:#6b7684;padding:12px 14px;border-top:1px solid #d4dae0;text-align:center;font-weight:500}

/* Main */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;background:#f7f9fb}
.topbar{padding:14px 32px;border-bottom:1px solid #d4dae0;background:rgba(255,255,255,.95);backdrop-filter:blur(12px);display:flex;gap:24px;flex-wrap:wrap;font-size:12px;color:#6b7684}
.topbar strong{color:#27313a;font-weight:600}
.content{flex:1;overflow-y:auto;padding:16px 16px 16px}
.content-inner{margin:0 auto}

/* Element panel */
.el-panel{padding-bottom:48px}
.el-header{margin-bottom:24px}
.el-section{display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--accent);background:var(--accent-bg);padding:6px 12px;border-radius:6px}
.el-section-desc{font-size:13px;color:#6b7684;margin-top:10px;line-height:1.6}
.el-title{font-size:16px;font-weight:700;color:#27313a;line-height:1.3;margin-bottom:24px;letter-spacing:-.02em}
.el-header-row{display:flex;align-items:center;gap:12px;margin-bottom:24px}
.el-header-row .el-title{margin-bottom:0;flex:1;min-width:0}

/* Meta cards */
.meta-card{margin-bottom:18px;padding:20px;background:#fff;border-radius:8px;border:1px solid #e2e6ea;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.meta-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px}
.meta-card p{font-size:14.5px;line-height:1.7;color:#27313a}
.meta-card.plain .meta-label{color:var(--accent)}
.meta-card.amber{border-color:#f59e0b33;background:#f59e0b08}.meta-card.amber .meta-label{color:#d97706}
.meta-card.blue{border-color:#3b82f633;background:#3b82f608}.meta-card.blue .meta-label{color:#2563eb}
.meta-card.emerald{border-color:#10b98133;background:#10b98108}.meta-card.emerald .meta-label{color:#059669}
.meta-card.red{border-color:#ef444433;background:#ef444408}.meta-card.red .meta-label{color:#dc2626}
.meta-card.green{border-color:#22c55e33;background:#22c55e08}.meta-card.green .meta-label{color:#16a34a}
.meta-card.accent{border-color:var(--accent-border);background:var(--accent-bg)}.meta-card.accent .meta-label{color:var(--accent)}

/* Priority badges — checklist */
.priority-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;border:1px solid}
.pri-high{background:#ef444414;border-color:#ef444433;color:#dc2626}
.pri-med{background:#f59e0b14;border-color:#f59e0b33;color:#d97706}
.pri-low{background:#3b82f614;border-color:#3b82f633;color:#2563eb}
.meta-card.pri-high{border-color:#ef444433;background:#ef444408}.meta-card.pri-high .meta-label{color:#dc2626}
.meta-card.pri-med{border-color:#f59e0b33;background:#f59e0b08}.meta-card.pri-med .meta-label{color:#d97706}
.meta-card.pri-low{border-color:#3b82f633;background:#3b82f608}.meta-card.pri-low .meta-label{color:#2563eb}

/* Email course */
.icon-mail{font-size:20px;flex-shrink:0}
.cta-text{font-weight:600;color:var(--accent)!important}

/* Prompt pack */
.prompt-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6b7684;margin-bottom:12px;display:flex;align-items:center;gap:8px}
.prompt-box{position:relative;padding:20px;background:#f1f3f5;border-radius:8px;border:1px solid #e2e6ea;margin-bottom:18px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace}
.prompt-text{font-size:13.5px;line-height:1.7;white-space:pre-wrap;word-break:break-word;margin:0}
.copy-btn{position:absolute;right:12px;top:12px;padding:6px 14px;border-radius:6px;border:1px solid #d4dae0;background:#fff;font-size:12px;font-weight:600;color:#6b7684;cursor:pointer;transition:all .15s;font-family:inherit}
.copy-btn:hover{background:#e8ecf0;color:#27313a}

/* Battle cards */
.icon-swords{font-size:20px;flex-shrink:0}
.bc-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px}
.tp-text{font-weight:500}
.preserve-ws{white-space:pre-wrap}

/* Deep dive sections */
.section-block{margin-top:40px;padding-top:8px}
.section-block h3{font-size:17px;font-weight:700;color:#27313a;margin:32px 0 16px;padding-bottom:12px;border-bottom:2px solid #e2e6ea;letter-spacing:-.01em}
.fw-list,.cl-list,.dq-list{display:flex;flex-direction:column;gap:14px}
.fw-step{display:flex;gap:16px;padding:18px;background:#fff;border-radius:8px;border:1px solid #e2e6ea;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.fw-num{width:32px;height:32px;min-width:32px;background:var(--accent);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;margin-top:2px}
.fw-title{font-size:15px;font-weight:600;color:#27313a;margin-bottom:6px;letter-spacing:-.01em}
.fw-desc{font-size:14px;color:#6b7684;line-height:1.6}
.cl-item{display:flex;gap:14px;padding:16px;background:#fff;border-radius:8px;border:1px solid #e2e6ea;align-items:flex-start;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.cl-badge{font-size:10px;font-weight:700;text-transform:uppercase;padding:4px 10px;border-radius:5px;white-space:nowrap;margin-top:2px;letter-spacing:.08em}
.cl-badge.req{background:var(--accent-bg);color:var(--accent)}
.cl-badge.opt{background:#e8ecf0;color:#6b7684}
.cl-label{font-size:15px;font-weight:600;color:#27313a;margin-bottom:4px}
.cl-desc{font-size:14px;color:#6b7684;line-height:1.6}
.res-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.res-card{display:block;padding:18px;background:#fff;border-radius:8px;border:1px solid #e2e6ea;text-decoration:none;transition:all .2s;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.res-card:hover{border-color:var(--accent);box-shadow:0 4px 8px rgba(0,0,0,.08)}
.res-type{display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;padding:4px 10px;border-radius:5px;background:var(--accent-bg);color:var(--accent);margin-bottom:10px;letter-spacing:.08em}
.res-title{font-size:15px;font-weight:600;color:#27313a;margin-bottom:6px}
.res-desc{font-size:13px;color:#6b7684;line-height:1.5}
.insight-box{margin-top:24px;padding:20px;background:var(--accent-bg);border:1px solid var(--accent-border);border-radius:8px}
.insight-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--accent);margin-bottom:12px}
.insight-box p{font-size:14.5px;line-height:1.7;color:#27313a}
.dq{padding:18px;background:#fff;border-radius:8px;border:1px solid #e2e6ea;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.dq-q{font-size:15px;font-weight:600;color:#27313a;margin-bottom:6px}
.dq-r{font-size:14px;color:#6b7684;line-height:1.6}
.order-badge{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:5px;font-size:12px;font-weight:700;margin-right:8px;vertical-align:middle}
.o2{background:var(--accent-bg);color:var(--accent)}
.o3{background:#dcf5ea;color:#0d8a5f}

/* Welcome */
.welcome{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;color:#6b7684}
.welcome h2{font-size:22px;font-weight:700;color:#27313a;margin-bottom:10px;letter-spacing:-.01em}
.welcome p{font-size:14px;line-height:1.5}

@media(max-width:768px){.sidebar{display:none}.content{padding:20px}.res-grid{grid-template-columns:1fr}.bc-grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="app">
  <aside class="sidebar">
    <div class="sidebar-head">
      <h1>${esc(productName)}</h1>
      <div class="badge">${esc(outputTypeDef.name)}</div>
    </div>
    ${contextHtml}
    <nav class="sidebar-nav">
      ${sidebarHtml.join('\n      ')}
    </nav>
    <div class="el-counter">${allElements.length} ${allElements.length === 1 ? esc(eLabel.toLowerCase()) : esc(eLabel.toLowerCase()) + 's'}</div>
  </aside>
  <div class="main">
    <div class="topbar">
      ${topbarItems}
    </div>
    <div class="content">
      <div class="content-inner">
        <div id="welcome" class="welcome">
          <h2>Select ${/^[aeiou]/i.test(eLabel) ? 'an' : 'a'} ${esc(eLabel.toLowerCase())}</h2>
          <p>Choose ${/^[aeiou]/i.test(eLabel) ? 'an' : 'a'} ${esc(eLabel.toLowerCase())} from the sidebar to see its full details.</p>
        </div>
        ${contentHtml.join('\n        ')}
      </div>
    </div>
  </div>
</div>
<script>
var current=null;
function showEl(id){
  document.getElementById('welcome').style.display='none';
  document.querySelectorAll('.el-panel').forEach(function(el){el.style.display='none'});
  var panel=document.getElementById(id);
  if(panel)panel.style.display='block';
  document.querySelectorAll('.nav-btn').forEach(function(b){b.classList.remove('active')});
  var btn=document.querySelector('.nav-btn[data-id="'+id+'"]');
  if(btn){btn.classList.add('active');btn.scrollIntoView({block:'nearest'})}
  document.querySelector('.content').scrollTop=0;
  current=id;
}
${firstId ? `showEl('${firstId}');` : ''}
document.addEventListener('keydown',function(e){
  if(!current)return;
  var btns=Array.from(document.querySelectorAll('.nav-btn'));
  var ci=btns.findIndex(function(b){return b.dataset.id===current});
  if(e.key==='ArrowDown'||e.key==='j'){e.preventDefault();if(ci<btns.length-1)showEl(btns[ci+1].dataset.id)}
  if(e.key==='ArrowUp'||e.key==='k'){e.preventDefault();if(ci>0)showEl(btns[ci-1].dataset.id)}
});
${hasPrompts ? `
function copyPrompt(elId){
  var el=document.getElementById('pt-'+elId);
  if(!el)return;
  navigator.clipboard.writeText(el.textContent).then(function(){
    var btn=el.parentElement.querySelector('.copy-btn');
    btn.textContent='Copied!';
    setTimeout(function(){btn.textContent='Copy'},2000);
  });
}` : ''}
</script>
</body>
</html>`
}
