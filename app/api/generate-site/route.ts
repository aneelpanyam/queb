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
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0f1a;color:#c8d6e5;overflow:hidden}
.app{display:flex;height:100vh}

/* Sidebar */
.sidebar{width:340px;min-width:340px;background:#0f1629;border-right:1px solid #1a2340;display:flex;flex-direction:column;height:100vh}
.sidebar-head{padding:20px;border-bottom:1px solid #1a2340}
.sidebar-head h1{font-size:15px;font-weight:700;color:#e2e8f0}
.sidebar-head .meta{font-size:11px;color:#64748b;margin-top:4px;line-height:1.5}
.sidebar-head .meta strong{color:#94a3b8}
.sit-box{padding:12px 20px;border-bottom:1px solid #1a2340;background:#0a0f1a}
.sit-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#0ea5e9;margin-bottom:5px}
.sit-text{font-size:11.5px;color:#94a3b8;line-height:1.55;max-height:80px;overflow-y:auto}
.ctx-grid{display:flex;flex-direction:column;gap:6px;padding:10px 20px;border-bottom:1px solid #1a2340;background:#0d1220}
.ctx-item{display:flex;flex-direction:column;gap:1px}
.ctx-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#0ea5e9}
.ctx-value{font-size:11px;color:#94a3b8;line-height:1.45}
.sidebar-nav{flex:1;overflow-y:auto;padding:10px}
.nav-group{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#0ea5e9;padding:14px 8px 5px}
.nav-btn{display:block;width:100%;text-align:left;background:none;border:none;padding:8px 12px;font-size:12.5px;color:#94a3b8;border-radius:6px;cursor:pointer;line-height:1.45;transition:all .15s;font-family:inherit}
.nav-btn:hover{background:#1a2340;color:#e2e8f0}
.nav-btn.active{background:#0ea5e920;color:#0ea5e9;font-weight:600}

/* Main */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.topbar{padding:12px 32px;border-bottom:1px solid #1a2340;background:rgba(10,15,26,.9);backdrop-filter:blur(12px);display:flex;gap:20px;flex-wrap:wrap;font-size:11px;color:#64748b}
.topbar strong{color:#94a3b8}
.content{flex:1;overflow-y:auto;padding:40px}
.content-inner{max-width:760px;margin:0 auto}

/* Question panel */
.q-panel{}
.q-header{margin-bottom:16px}
.q-perspective{display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#0ea5e9;background:#0ea5e915;padding:4px 10px;border-radius:4px}
.q-perspective-desc{font-size:12px;color:#64748b;margin-top:6px}
.q-title{font-size:22px;font-weight:700;color:#f1f5f9;line-height:1.35;margin-bottom:24px}

/* Meta cards */
.meta-card{margin-bottom:16px;padding:16px;background:#111827;border-radius:8px;border:1px solid #1a2340}
.meta-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#0ea5e9;margin-bottom:8px}
.meta-card p{font-size:13.5px;line-height:1.6;color:#94a3b8}

/* Sections */
.section-block{margin-top:28px}
.section-block h3{font-size:14px;font-weight:700;color:#e2e8f0;margin:24px 0 10px;padding-bottom:8px;border-bottom:1px solid #1a2340}
.fw-list,.cl-list,.dq-list{display:flex;flex-direction:column;gap:10px}
.fw-step{display:flex;gap:12px;padding:14px;background:#111827;border-radius:8px;border:1px solid #1a2340}
.fw-num{width:26px;height:26px;min-width:26px;background:#0ea5e9;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;margin-top:2px}
.fw-title{font-size:13px;font-weight:600;color:#e2e8f0;margin-bottom:3px}
.fw-desc{font-size:12.5px;color:#94a3b8;line-height:1.5}
.cl-item{display:flex;gap:10px;padding:12px;background:#111827;border-radius:8px;border:1px solid #1a2340;align-items:flex-start}
.cl-badge{font-size:9px;font-weight:700;text-transform:uppercase;padding:2px 7px;border-radius:4px;white-space:nowrap;margin-top:2px}
.cl-badge.req{background:#0ea5e920;color:#0ea5e9}
.cl-badge.opt{background:#64748b20;color:#64748b}
.cl-label{font-size:13px;font-weight:600;color:#e2e8f0;margin-bottom:2px}
.cl-desc{font-size:12px;color:#94a3b8;line-height:1.5}
.res-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.res-card{display:block;padding:14px;background:#111827;border-radius:8px;border:1px solid #1a2340;text-decoration:none;transition:border-color .15s}
.res-card:hover{border-color:#0ea5e9}
.res-type{display:inline-block;font-size:9px;font-weight:700;text-transform:uppercase;padding:2px 6px;border-radius:3px;background:#0ea5e910;color:#0ea5e9;margin-bottom:8px}
.res-title{font-size:13px;font-weight:600;color:#e2e8f0;margin-bottom:4px}
.res-desc{font-size:11.5px;color:#64748b;line-height:1.4}
.insight-box{margin-top:16px;padding:16px;background:#0ea5e908;border:1px solid #0ea5e930;border-radius:8px}
.insight-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#0ea5e9;margin-bottom:8px}
.insight-box p{font-size:13.5px;line-height:1.6;color:#c8d6e5}
.dq{padding:14px;background:#111827;border-radius:8px;border:1px solid #1a2340}
.dq-q{font-size:13px;font-weight:600;color:#e2e8f0;margin-bottom:4px}
.dq-r{font-size:12.5px;color:#94a3b8;line-height:1.5}
.order-badge{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:4px;font-size:10px;font-weight:700;margin-right:6px;vertical-align:middle}
.o2{background:#0ea5e920;color:#0ea5e9}
.o3{background:#2dd4bf20;color:#2dd4bf}

/* Welcome state */
.welcome{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;color:#64748b}
.welcome h2{font-size:20px;color:#94a3b8;margin-bottom:8px}
.welcome p{font-size:13px}

/* Nav counter */
.q-counter{font-size:11px;color:#64748b;padding:10px 12px;border-top:1px solid #1a2340;text-align:center}

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
