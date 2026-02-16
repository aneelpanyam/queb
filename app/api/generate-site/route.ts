export async function POST(req: Request) {
  try {
  const { industry, service, role, activity, situation, additionalContext, perspectives } =
    await req.json()
  console.log(`[generate-site] Role: ${role}, Activity: ${activity}, Perspectives: ${perspectives?.length || 0}`)

  const html = buildSiteHtml({
    industry,
    service,
    role,
    activity,
    situation,
    additionalContext: additionalContext || [],
    perspectives,
  })

  console.log(`[generate-site] Success: HTML generated`)
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
  } catch (error) {
    console.error('[generate-site] Error:', error)
    return Response.json(
      { error: 'Failed to generate site. Please try again.' },
      { status: 500 }
    )
  }
}

interface QuestionData {
  question: string
  relevance: string
  infoPrompt: string
  dissection?: {
    thinkingFramework: { step: number; title: string; description: string }[]
    checklist: { item: string; description: string; isRequired: boolean }[]
    resources: {
      title: string
      type: string
      url: string
      description: string
    }[]
    keyInsight: string
  }
  deeperQuestions?: {
    secondOrder: { question: string; reasoning: string }[]
    thirdOrder: { question: string; reasoning: string }[]
  }
}

interface PerspectiveData {
  perspective: string
  description: string
  questions: QuestionData[]
}

interface AdditionalContextItem {
  label: string
  value: string
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildSiteHtml(data: {
  industry: string
  service: string
  role: string
  activity: string
  situation: string
  additionalContext: AdditionalContextItem[]
  perspectives: PerspectiveData[]
}) {
  const { industry, service, role, activity, situation, additionalContext, perspectives } = data

  const filteredContext = additionalContext.filter(
    (c) => c.label?.trim() && c.value?.trim()
  )

  // Build flat question list and nav
  const allQuestions: {
    id: string
    perspective: string
    perspectiveDesc: string
    data: QuestionData
  }[] = []

  let idx = 0
  for (const p of perspectives) {
    for (const q of p.questions) {
      allQuestions.push({
        id: `q${idx}`,
        perspective: p.perspective,
        perspectiveDesc: p.description,
        data: q,
      })
      idx++
    }
  }

  // Build sidebar HTML
  const sidebarHtml: string[] = []
  let prevPerspective = ''
  for (const q of allQuestions) {
    if (q.perspective !== prevPerspective) {
      sidebarHtml.push(
        `<div class="nav-group">${esc(q.perspective)}</div>`
      )
      prevPerspective = q.perspective
    }
    const short =
      q.data.question.length > 65
        ? q.data.question.slice(0, 62) + '...'
        : q.data.question
    sidebarHtml.push(
      `<button class="nav-btn" data-id="${q.id}" onclick="showQuestion('${q.id}')">${esc(short)}</button>`
    )
  }

  // Additional context items for sidebar
  let additionalContextHtml = ''
  if (filteredContext.length > 0) {
    const items = filteredContext
      .map(
        (c) =>
          `<div class="ctx-item"><span class="ctx-label">${esc(c.label)}</span><span class="ctx-value">${esc(c.value)}</span></div>`
      )
      .join('')
    additionalContextHtml = `<div class="ctx-grid">${items}</div>`
  }

  // Build content sections
  const contentHtml: string[] = []
  for (const q of allQuestions) {
    const d = q.data

    let dissectionBlock = ''
    if (d.dissection) {
      const fw = d.dissection.thinkingFramework
        .map(
          (s) =>
            `<div class="fw-step"><span class="fw-num">${s.step}</span><div><div class="fw-title">${esc(s.title)}</div><div class="fw-desc">${esc(s.description)}</div></div></div>`
        )
        .join('')

      const cl = d.dissection.checklist
        .map(
          (c) =>
            `<div class="cl-item"><span class="cl-badge ${c.isRequired ? 'req' : 'opt'}">${c.isRequired ? 'Required' : 'Optional'}</span><div><div class="cl-label">${esc(c.item)}</div><div class="cl-desc">${esc(c.description)}</div></div></div>`
        )
        .join('')

      const res = d.dissection.resources
        .map(
          (r) =>
            `<a href="${esc(r.url)}" target="_blank" rel="noopener" class="res-card"><span class="res-type">${esc(r.type)}</span><div class="res-title">${esc(r.title)}</div><div class="res-desc">${esc(r.description)}</div></a>`
        )
        .join('')

      dissectionBlock = `
        <div class="section-block">
          <h3>Thinking Framework</h3>
          <div class="fw-list">${fw}</div>
          <h3>Checklist</h3>
          <div class="cl-list">${cl}</div>
          <h3>Resources</h3>
          <div class="res-grid">${res}</div>
          <div class="insight-box"><div class="insight-label">Key Insight</div><p>${esc(d.dissection.keyInsight)}</p></div>
        </div>`
    }

    let deeperBlock = ''
    if (d.deeperQuestions) {
      const s2 = d.deeperQuestions.secondOrder
        .map(
          (x) =>
            `<div class="dq"><p class="dq-q">${esc(x.question)}</p><p class="dq-r">${esc(x.reasoning)}</p></div>`
        )
        .join('')
      const s3 = d.deeperQuestions.thirdOrder
        .map(
          (x) =>
            `<div class="dq"><p class="dq-q">${esc(x.question)}</p><p class="dq-r">${esc(x.reasoning)}</p></div>`
        )
        .join('')

      deeperBlock = `
        <div class="section-block">
          <h3><span class="order-badge o2">2</span> 2nd-Order Thinking</h3>
          <div class="dq-list">${s2}</div>
          <h3><span class="order-badge o3">3</span> 3rd-Order Thinking</h3>
          <div class="dq-list">${s3}</div>
        </div>`
    }

    contentHtml.push(`
      <article id="${q.id}" class="q-panel" style="display:none">
        <div class="q-header">
          <span class="q-perspective">${esc(q.perspective)}</span>
          <p class="q-perspective-desc">${esc(q.perspectiveDesc)}</p>
        </div>
        <h2 class="q-title">${esc(d.question)}</h2>
        <div class="meta-card">
          <div class="meta-label">Why This Matters</div>
          <p>${esc(d.relevance)}</p>
        </div>
        <div class="meta-card">
          <div class="meta-label">How to Find the Answer</div>
          <p>${esc(d.infoPrompt)}</p>
        </div>
        ${dissectionBlock}
        ${deeperBlock}
      </article>`)
  }

  const firstId = allQuestions.length > 0 ? allQuestions[0].id : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Question Book: ${esc(role)} - ${esc(activity)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#f7f9fb;color:#27313a;overflow:hidden;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
.app{display:flex;height:100vh}

/* Scrollbars */
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
.sidebar-head .meta strong{color:#27313a;font-weight:600}
.sit-box{padding:14px 20px;border-bottom:1px solid #d4dae0;background:#f7f9fb}
.sit-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#1a5186;margin-bottom:6px}
.sit-text{font-size:12.5px;color:#6b7684;line-height:1.6;max-height:80px;overflow-y:auto}
.ctx-grid{display:flex;flex-direction:column;gap:8px;padding:12px 20px;border-bottom:1px solid #d4dae0;background:#f7f9fb}
.ctx-item{display:flex;flex-direction:column;gap:3px}
.ctx-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#1a5186}
.ctx-value{font-size:12px;color:#6b7684;line-height:1.5}
.sidebar-nav{flex:1;overflow-y:auto;padding:10px}
.nav-group{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#1a5186;padding:16px 10px 6px}
.nav-btn{display:block;width:100%;text-align:left;background:none;border:none;padding:10px 14px;font-size:13px;color:#6b7684;border-radius:6px;cursor:pointer;line-height:1.5;transition:all .15s;font-family:inherit;font-weight:400}
.nav-btn:hover{background:#e8ecf0;color:#27313a}
.nav-btn.active{background:#d9e8f6;color:#1a5186;font-weight:600}

/* Main */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;background:#f7f9fb}
.topbar{padding:14px 32px;border-bottom:1px solid #d4dae0;background:rgba(255,255,255,.95);backdrop-filter:blur(12px);display:flex;gap:24px;flex-wrap:wrap;font-size:12px;color:#6b7684}
.topbar strong{color:#27313a;font-weight:600}
.content{flex:1;overflow-y:auto;padding:16px 16px 16px}
.content-inner{margin:0 auto}

/* Question panel */
.q-panel{padding-bottom:48px}
.q-header{margin-bottom:24px}
.q-perspective{display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#1a5186;background:#d9e8f6;padding:6px 12px;border-radius:6px}
.q-perspective-desc{font-size:13px;color:#6b7684;margin-top:10px;line-height:1.6}
.q-title{font-size:16px;font-weight:700;color:#27313a;line-height:1.3;margin-bottom:32px;letter-spacing:-.02em}

/* Meta cards */
.meta-card{margin-bottom:18px;padding:20px;background:#fff;border-radius:8px;border:1px solid #e2e6ea;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.meta-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#1a5186;margin-bottom:12px}
.meta-card p{font-size:14.5px;line-height:1.7;color:#27313a}

/* Sections */
.section-block{margin-top:40px;padding-top:8px}
.section-block h3{font-size:17px;font-weight:700;color:#27313a;margin:32px 0 16px;padding-bottom:12px;border-bottom:2px solid #e2e6ea;letter-spacing:-.01em}
.fw-list,.cl-list,.dq-list{display:flex;flex-direction:column;gap:14px}
.fw-step{display:flex;gap:16px;padding:18px;background:#fff;border-radius:8px;border:1px solid #e2e6ea;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.fw-num{width:32px;height:32px;min-width:32px;background:#1a5186;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;margin-top:2px}
.fw-title{font-size:15px;font-weight:600;color:#27313a;margin-bottom:6px;letter-spacing:-.01em}
.fw-desc{font-size:14px;color:#6b7684;line-height:1.6}
.cl-item{display:flex;gap:14px;padding:16px;background:#fff;border-radius:8px;border:1px solid #e2e6ea;align-items:flex-start;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.cl-badge{font-size:10px;font-weight:700;text-transform:uppercase;padding:4px 10px;border-radius:5px;white-space:nowrap;margin-top:2px;letter-spacing:.08em}
.cl-badge.req{background:#d9e8f6;color:#1a5186}
.cl-badge.opt{background:#e8ecf0;color:#6b7684}
.cl-label{font-size:15px;font-weight:600;color:#27313a;margin-bottom:4px}
.cl-desc{font-size:14px;color:#6b7684;line-height:1.6}
.res-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.res-card{display:block;padding:18px;background:#fff;border-radius:8px;border:1px solid #e2e6ea;text-decoration:none;transition:all .2s;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.res-card:hover{border-color:#1a5186;box-shadow:0 4px 8px rgba(0,0,0,.08)}
.res-type{display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;padding:4px 10px;border-radius:5px;background:#d9e8f6;color:#1a5186;margin-bottom:10px;letter-spacing:.08em}
.res-title{font-size:15px;font-weight:600;color:#27313a;margin-bottom:6px}
.res-desc{font-size:13px;color:#6b7684;line-height:1.5}
.insight-box{margin-top:24px;padding:20px;background:#f0f7fd;border:1px solid #d9e8f6;border-radius:8px}
.insight-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#1a5186;margin-bottom:12px}
.insight-box p{font-size:14.5px;line-height:1.7;color:#27313a}
.dq{padding:18px;background:#fff;border-radius:8px;border:1px solid #e2e6ea;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.dq-q{font-size:15px;font-weight:600;color:#27313a;margin-bottom:6px}
.dq-r{font-size:14px;color:#6b7684;line-height:1.6}
.order-badge{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:5px;font-size:12px;font-weight:700;margin-right:8px;vertical-align:middle}
.o2{background:#d9e8f6;color:#1a5186}
.o3{background:#dcf5ea;color:#0d8a5f}

/* Welcome state */
.welcome{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;color:#6b7684}
.welcome h2{font-size:22px;font-weight:700;color:#27313a;margin-bottom:10px;letter-spacing:-.01em}
.welcome p{font-size:14px;line-height:1.5}

/* Nav counter */
.q-counter{font-size:12px;color:#6b7684;padding:12px 14px;border-top:1px solid #d4dae0;text-align:center;font-weight:500}

@media(max-width:768px){.sidebar{display:none}.content{padding:20px}.res-grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="app">
  <aside class="sidebar">
    <div class="sidebar-head">
      <h1>Question Book</h1>
      <div class="meta">
        <strong>${esc(role)}</strong> &middot; ${esc(activity)}<br/>
        ${esc(industry)} &middot; ${esc(service)}
      </div>
    </div>
    <div class="sit-box">
      <div class="sit-label">Situation</div>
      <div class="sit-text">${esc(situation)}</div>
    </div>
    ${additionalContextHtml}
    <nav class="sidebar-nav">
      ${sidebarHtml.join('\n      ')}
    </nav>
    <div class="q-counter">${allQuestions.length} questions</div>
  </aside>
  <div class="main">
    <div class="topbar">
      <span><strong>Industry:</strong> ${esc(industry)}</span>
      <span><strong>Service:</strong> ${esc(service)}</span>
      <span><strong>Role:</strong> ${esc(role)}</span>
      <span><strong>Activity:</strong> ${esc(activity)}</span>
    </div>
    <div class="content">
      <div class="content-inner">
        <div id="welcome" class="welcome">
          <h2>Select a question</h2>
          <p>Choose a question from the left sidebar to see its full dissection.</p>
        </div>
        ${contentHtml.join('\n        ')}
      </div>
    </div>
  </div>
</div>
<script>
var current=null;
function showQuestion(id){
  document.getElementById('welcome').style.display='none';
  document.querySelectorAll('.q-panel').forEach(function(el){el.style.display='none'});
  var panel=document.getElementById(id);
  if(panel)panel.style.display='block';
  document.querySelectorAll('.nav-btn').forEach(function(b){b.classList.remove('active')});
  var btn=document.querySelector('.nav-btn[data-id="'+id+'"]');
  if(btn){btn.classList.add('active');btn.scrollIntoView({block:'nearest'})}
  document.querySelector('.content').scrollTop=0;
  current=id;
}
${firstId ? `showQuestion('${firstId}');` : ''}
document.addEventListener('keydown',function(e){
  if(!current)return;
  var btns=Array.from(document.querySelectorAll('.nav-btn'));
  var ci=btns.findIndex(function(b){return b.dataset.id===current});
  if(e.key==='ArrowDown'||e.key==='j'){e.preventDefault();if(ci<btns.length-1)showQuestion(btns[ci+1].dataset.id)}
  if(e.key==='ArrowUp'||e.key==='k'){e.preventDefault();if(ci>0)showQuestion(btns[ci-1].dataset.id)}
});
</script>
</body>
</html>`
}
