// ============================================================
// Built-in output type seed data.
// Each entry defines the schema, display config, and fallback
// prompt for one product type.
// ============================================================

import { BUSINESS_PERSPECTIVES } from '@/lib/perspectives'
import { CHECKLIST_DIMENSIONS } from '@/lib/checklist-dimensions'
import { EMAIL_COURSE_STAGES } from '@/lib/email-course-stages'
import { PROMPT_USE_CASES } from '@/lib/prompt-use-cases'
import { DECISION_DOMAINS } from '@/lib/decision-domains'
import { DOSSIER_SECTIONS } from '@/lib/dossier-sections'
import { PLAYBOOK_PHASES } from '@/lib/playbook-phases'
import { CHEAT_SHEET_CATEGORIES } from '@/lib/cheat-sheet-categories'
import { AGENT_OPPORTUNITY_AREAS } from '@/lib/agent-opportunity-areas'
import { EBOOK_CHAPTERS } from '@/lib/ebook-chapters'
import type { OutputTypeDefinition } from '@/lib/output-type-library'

export const SEED_OUTPUT_TYPES: Omit<OutputTypeDefinition, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'questions',
    name: 'Question Book',
    description: 'Multi-perspective questions with thinking frameworks, checklists, and resources',
    icon: 'BookOpen',
    prompt: `You are an expert thinking coach and organizational consultant.

TASK:
Generate thoughtful, probing questions organized by business perspective.

GUIDELINES:
- Generate 3-5 questions per relevant perspective
- Every question must be specific to the described context, not generic
- Each question must include all requested element fields
- Questions should provoke deep thinking and help uncover blind spots
- Tailor questions to the specific context provided`,
    sectionLabel: 'Perspective',
    elementLabel: 'Question',
    fields: [
      { key: 'question', label: 'Question', type: 'long-text', primary: true },
      { key: 'relevance', label: 'Why This Matters', type: 'long-text', color: 'amber', icon: 'Target' },
      { key: 'infoPrompt', label: 'How to Find the Answer', type: 'long-text', color: 'blue', icon: 'ArrowUpRight' },
      { key: 'actionSteps', label: 'What to Do With the Answer', type: 'long-text', color: 'emerald', icon: 'ListChecks' },
      { key: 'redFlags', label: 'Red Flags to Watch For', type: 'long-text', color: 'red', icon: 'AlertTriangle' },
      { key: 'keyMetrics', label: 'Key Metrics to Track', type: 'short-text', color: 'violet', icon: 'BarChart3' },
    ],
    supportsDeepDive: true,
    supportsDeeperQuestions: true,
    defaultSectionDrivers: BUSINESS_PERSPECTIVES.map((p) => ({ name: p.name, description: p.description })),
    isBuiltIn: true,
  },
  {
    id: 'checklist',
    name: 'Checklist',
    description: 'Actionable checklists organized by category with priority levels',
    icon: 'CheckSquare',
    prompt: `You are a process and operations expert.

TASK:
Generate a comprehensive, actionable checklist organized by category.

GUIDELINES:
- Create 4-6 categories relevant to the given context
- Each category should have 5-8 specific, actionable items
- Include priority levels (High, Medium, Low) for each item
- Items should be concrete and verifiable, not vague
- Consider compliance, best practices, and common pitfalls`,
    sectionLabel: 'Category',
    elementLabel: 'Item',
    fields: [
      { key: 'item', label: 'Checklist Item', type: 'short-text', primary: true },
      { key: 'description', label: 'Description', type: 'long-text', color: 'blue', icon: 'Shield' },
      { key: 'priority', label: 'Priority', type: 'short-text', color: 'amber', icon: 'Zap' },
      { key: 'commonMistakes', label: 'Common Mistakes', type: 'long-text', color: 'red', icon: 'AlertOctagon' },
      { key: 'tips', label: 'Pro Tips', type: 'long-text', color: 'amber', icon: 'Lightbulb' },
      { key: 'verificationMethod', label: 'How to Verify', type: 'short-text', color: 'emerald', icon: 'ClipboardCheck' },
    ],
    supportsDeepDive: true,
    defaultSectionDrivers: CHECKLIST_DIMENSIONS.map((d) => ({ name: d.name, description: d.description })),
    isBuiltIn: true,
  },
  {
    id: 'email-course',
    name: 'Email Course',
    description: 'Multi-part email sequences for nurturing, onboarding, or education',
    icon: 'Mail',
    prompt: `You are an email marketing and education expert.

TASK:
Create a structured email course with modules and individual emails.

GUIDELINES:
- Create 3-5 modules, each representing a learning theme
- Each module should have 3-5 emails
- Each email needs a compelling subject line, educational body, and clear call to action
- The course should build progressively from foundations to advanced concepts
- Tailor content to the specific context and audience provided`,
    sectionLabel: 'Module',
    elementLabel: 'Email',
    fields: [
      { key: 'subject', label: 'Subject Line', type: 'short-text', primary: true },
      { key: 'body', label: 'Email Body', type: 'long-text', color: 'none', icon: 'Mail' },
      { key: 'callToAction', label: 'Call to Action', type: 'short-text', color: 'primary', icon: 'ArrowUpRight' },
      { key: 'keyTakeaway', label: 'Key Takeaway', type: 'short-text', color: 'violet', icon: 'Bookmark' },
      { key: 'subjectLineVariants', label: 'Subject Line Alternatives', type: 'long-text', color: 'amber', icon: 'Repeat' },
      { key: 'sendTiming', label: 'Recommended Send Timing', type: 'short-text', color: 'blue', icon: 'CalendarClock' },
    ],
    supportsDeepDive: true,
    defaultSectionDrivers: EMAIL_COURSE_STAGES.map((s) => ({ name: s.name, description: s.description })),
    isBuiltIn: true,
  },
  {
    id: 'prompts',
    name: 'Prompt Pack',
    description: 'Curated AI prompt templates for specific roles and tasks',
    icon: 'Sparkles',
    prompt: `You are an AI prompt engineering expert.

TASK:
Create a collection of ready-to-use AI prompts organized by use-case category.

GUIDELINES:
- Create 4-6 categories of prompts relevant to the given context
- Each category should have 3-5 specific prompts
- Each prompt should be a complete, copy-paste-ready template
- Include context about when to use each prompt and what output to expect
- Prompts should leverage domain knowledge and terminology from the provided context`,
    sectionLabel: 'Category',
    elementLabel: 'Prompt',
    fields: [
      { key: 'prompt', label: 'Prompt', type: 'long-text', primary: true },
      { key: 'context', label: 'When to Use', type: 'long-text', color: 'amber', icon: 'Target' },
      { key: 'expectedOutput', label: 'Expected Output', type: 'long-text', color: 'emerald', icon: 'CheckCheck' },
      { key: 'variations', label: 'Prompt Variations', type: 'long-text', color: 'violet', icon: 'Shuffle' },
      { key: 'tips', label: 'Tips for Better Results', type: 'long-text', color: 'amber', icon: 'Lightbulb' },
      { key: 'exampleOutput', label: 'Example Output Snippet', type: 'long-text', color: 'emerald', icon: 'FileText' },
    ],
    supportsDeepDive: true,
    defaultSectionDrivers: PROMPT_USE_CASES.map((u) => ({ name: u.name, description: u.description })),
    isBuiltIn: true,
  },
  {
    id: 'battle-cards',
    name: 'Battle Cards',
    description: 'Structured analysis cards organized by lens — for competitive intel, impact assessment, or any structured comparison',
    icon: 'Swords',
    prompt: `You are a structured analysis and strategic intelligence expert.

TASK:
Create battle cards organized by analytical lens or theme.

GUIDELINES:
- Create 4-6 thematic sections (lenses)
- Each section should have 3-5 analysis cards
- Each card needs a clear title and structured fields covering strengths, weaknesses, and strategic response
- Focus on actionable intelligence the reader can use immediately
- Tailor all analysis to the specific context provided`,
    sectionLabel: 'Lens',
    elementLabel: 'Card',
    fields: [
      { key: 'title', label: 'Card Title', type: 'short-text', primary: true },
      { key: 'strengths', label: 'Strengths & Advantages', type: 'long-text', color: 'red', icon: 'ThumbsUp' },
      { key: 'weaknesses', label: 'Weaknesses & Risks', type: 'long-text', color: 'green', icon: 'ThumbsDown' },
      { key: 'talkingPoints', label: 'Key Talking Points', type: 'long-text', color: 'primary', icon: 'MessageSquare' },
      { key: 'objectionHandling', label: 'Objection Handling', type: 'long-text', color: 'amber', icon: 'ShieldQuestion' },
      { key: 'winStrategy', label: 'Strategic Response', type: 'long-text', color: 'primary', icon: 'Trophy' },
      { key: 'pricingIntel', label: 'Pricing & Packaging Intel', type: 'long-text', color: 'emerald', icon: 'DollarSign' },
    ],
    supportsDeepDive: true,
    defaultSectionDrivers: [
      { name: 'Current Landscape', description: 'The state of play today — key players, dominant approaches, and the baseline the reader operates from' },
      { name: 'Strengths & Advantages', description: 'What the reader (or their approach) does well — capabilities, differentiators, and leverage points' },
      { name: 'Weaknesses & Risks', description: 'Vulnerabilities, blind spots, and areas where the reader is exposed or under-performing' },
      { name: 'Emerging Forces', description: 'New trends, technologies, entrants, or shifts that will reshape the landscape' },
      { name: 'Strategic Response', description: 'How to respond — positioning, actions, investments, and narrative to stay ahead' },
    ],
    isBuiltIn: true,
  },
  {
    id: 'decision-books',
    name: 'Decision Book',
    description: 'Structured decision guides organized by domain with options, trade-offs, and decision criteria',
    icon: 'Scale',
    prompt: `You are a senior decision strategist and organizational advisor.

TASK:
Generate key decisions organized by decision domain that must be navigated in the given context.

GUIDELINES:
- Generate 3-5 decisions per relevant domain
- Every decision must be specific to the described context, not generic
- Each decision must include why it matters, what the realistic options and trade-offs are, and what criteria should guide the choice
- Decisions should surface the hard choices that often go unexamined
- Tailor decisions to the specific context, constraints, and authority level provided`,
    sectionLabel: 'Decision Domain',
    elementLabel: 'Decision',
    fields: [
      { key: 'decision', label: 'The Decision', type: 'long-text', primary: true },
      { key: 'context', label: 'Why This Decision Matters', type: 'long-text', color: 'amber', icon: 'Info' },
      { key: 'options', label: 'Key Options & Trade-offs', type: 'long-text', color: 'violet', icon: 'GitBranch' },
      { key: 'criteria', label: 'Decision Criteria', type: 'long-text', color: 'emerald', icon: 'Target' },
      { key: 'risks', label: 'Risks & Failure Modes', type: 'long-text', color: 'red', icon: 'AlertTriangle' },
      { key: 'stakeholders', label: 'Key Stakeholders & Impact', type: 'long-text', color: 'blue', icon: 'Users' },
      { key: 'recommendation', label: 'Recommended Path', type: 'long-text', color: 'primary', icon: 'Compass' },
    ],
    supportsDeepDive: true,
    supportsDeeperQuestions: true,
    defaultSectionDrivers: DECISION_DOMAINS.map((d) => ({ name: d.name, description: d.description })),
    isBuiltIn: true,
  },
  {
    id: 'dossier',
    name: 'Dossier',
    description: 'Comprehensive intelligence briefings organized by research area with findings, implications, and evidence',
    icon: 'FileSearch',
    prompt: `You are a senior intelligence analyst and strategic research expert.

TASK:
Generate a comprehensive dossier organized by intelligence area.

GUIDELINES:
- Create thorough briefings for each intelligence area relevant to the context
- Each briefing must include a clear title, summary, key findings, and strategic implications
- Ground all analysis in evidence and observable signals, not speculation
- Surface both risks and opportunities with equal rigor
- Tailor the depth and focus to the specific context provided`,
    sectionLabel: 'Intelligence Area',
    elementLabel: 'Briefing',
    fields: [
      { key: 'title', label: 'Briefing Title', type: 'short-text', primary: true },
      { key: 'summary', label: 'Executive Summary', type: 'long-text', color: 'blue', icon: 'FileText' },
      { key: 'keyFindings', label: 'Key Findings', type: 'long-text', color: 'violet', icon: 'Search' },
      { key: 'strategicImplications', label: 'Strategic Implications', type: 'long-text', color: 'amber', icon: 'Target' },
      { key: 'evidence', label: 'Evidence & Sources', type: 'long-text', color: 'emerald', icon: 'BookOpen' },
      { key: 'riskAssessment', label: 'Risk Assessment', type: 'long-text', color: 'red', icon: 'AlertTriangle' },
      { key: 'opportunities', label: 'Opportunities', type: 'long-text', color: 'green', icon: 'TrendingUp' },
    ],
    supportsDeepDive: true,
    defaultSectionDrivers: DOSSIER_SECTIONS.map((s) => ({ name: s.name, description: s.description })),
    isBuiltIn: true,
  },
  {
    id: 'playbook',
    name: 'Playbook',
    description: 'Step-by-step operational execution guides organized by phase with instructions, decision criteria, and tips',
    icon: 'BookMarked',
    prompt: `You are a senior operations strategist and execution expert.

TASK:
Generate a comprehensive playbook organized by execution phase.

GUIDELINES:
- Create 3-5 actionable plays per phase relevant to the context
- Each play must include clear objectives, step-by-step instructions, and expected outcomes
- Include decision criteria for key branching points
- Surface common pitfalls and practical tips from experienced practitioners
- Tailor everything to the specific context, constraints, and resources provided`,
    sectionLabel: 'Phase',
    elementLabel: 'Play',
    fields: [
      { key: 'title', label: 'Play Title', type: 'short-text', primary: true },
      { key: 'objective', label: 'Objective', type: 'long-text', color: 'blue', icon: 'Target' },
      { key: 'instructions', label: 'Step-by-Step Instructions', type: 'long-text', color: 'none', icon: 'ListOrdered' },
      { key: 'decisionCriteria', label: 'Decision Criteria', type: 'long-text', color: 'violet', icon: 'GitBranch' },
      { key: 'expectedOutcome', label: 'Expected Outcome', type: 'long-text', color: 'emerald', icon: 'CheckCircle' },
      { key: 'commonPitfalls', label: 'Common Pitfalls', type: 'long-text', color: 'red', icon: 'AlertOctagon' },
      { key: 'tips', label: 'Pro Tips', type: 'long-text', color: 'amber', icon: 'Lightbulb' },
      { key: 'timeEstimate', label: 'Time Estimate', type: 'short-text', color: 'blue', icon: 'Clock' },
    ],
    supportsDeepDive: true,
    defaultSectionDrivers: PLAYBOOK_PHASES.map((p) => ({ name: p.name, description: p.description })),
    isBuiltIn: true,
  },
  {
    id: 'cheat-sheets',
    name: 'Cheat Sheet',
    description: 'Concise quick-reference cards organized by category with definitions, examples, and shortcuts',
    icon: 'Zap',
    prompt: `You are an expert educator and knowledge distiller.

TASK:
Generate a concise, scannable cheat sheet organized by reference category.

GUIDELINES:
- Create 4-8 entries per category, optimized for at-a-glance use
- Each entry must be dense and practical — no fluff or filler
- Include concrete examples and common mistakes for each entry
- Prioritize the most important, most-referenced information
- Tailor terminology and examples to the specific context provided`,
    sectionLabel: 'Category',
    elementLabel: 'Entry',
    fields: [
      { key: 'term', label: 'Term / Concept', type: 'short-text', primary: true },
      { key: 'definition', label: 'Definition', type: 'long-text', color: 'blue', icon: 'BookOpen' },
      { key: 'example', label: 'Example / Usage', type: 'long-text', color: 'emerald', icon: 'Code' },
      { key: 'relatedConcepts', label: 'Related Concepts', type: 'short-text', color: 'violet', icon: 'Link' },
      { key: 'commonMistakes', label: 'Common Mistakes', type: 'long-text', color: 'red', icon: 'AlertTriangle' },
      { key: 'quickTip', label: 'Quick Tip', type: 'short-text', color: 'amber', icon: 'Lightbulb' },
    ],
    supportsDeepDive: true,
    defaultSectionDrivers: CHEAT_SHEET_CATEGORIES.map((c) => ({ name: c.name, description: c.description })),
    isBuiltIn: true,
  },
  {
    id: 'agent-book',
    name: 'Agent Book',
    description: 'AI agent ideas organized by workflow opportunity — what to build, how it works, and how to get started',
    icon: 'Bot',
    prompt: `You are an AI agent strategist who identifies high-impact opportunities to deploy AI agents across workflows.

TASK:
Generate a catalog of AI agent ideas organized by workflow opportunity area.

GUIDELINES:
- Generate 3-5 agent ideas per relevant opportunity area
- Every agent must be specific to the described context, not generic
- Each agent must include a clear name, description, architecture, and implementation guidance
- Agents should range from quick-win automations to ambitious multi-step orchestrations
- Tailor agents to the specific role, industry, and workflow context provided`,
    sectionLabel: 'Opportunity Area',
    elementLabel: 'Agent',
    fields: [
      { key: 'agentName', label: 'Agent Name', type: 'short-text', primary: true },
      { key: 'description', label: 'What It Does', type: 'long-text', color: 'blue', icon: 'FileText' },
      { key: 'howItWorks', label: 'How It Works', type: 'long-text', color: 'none', icon: 'Workflow' },
      { key: 'keyCapabilities', label: 'Key Capabilities', type: 'long-text', color: 'violet', icon: 'Sparkles' },
      { key: 'dataAndTools', label: 'Data & Tools Needed', type: 'long-text', color: 'amber', icon: 'Wrench' },
      { key: 'complexity', label: 'Implementation Complexity', type: 'short-text', color: 'red', icon: 'Gauge' },
      { key: 'expectedImpact', label: 'Expected Impact', type: 'long-text', color: 'emerald', icon: 'TrendingUp' },
      { key: 'quickStart', label: 'Quick-Start Hint', type: 'long-text', color: 'primary', icon: 'Rocket' },
    ],
    supportsDeepDive: true,
    defaultSectionDrivers: AGENT_OPPORTUNITY_AREAS.map((a) => ({ name: a.name, description: a.description })),
    isBuiltIn: true,
  },
  {
    id: 'ebook',
    name: 'e-Book',
    description: 'Long-form guides organized into chapters — comprehensive knowledge products for education, training, and thought leadership',
    icon: 'BookText',
    prompt: `You are an expert author and instructional designer who creates compelling, comprehensive guides.

TASK:
Generate an e-Book organized into chapters, each containing detailed sub-sections with long-form educational content.

GUIDELINES:
- Create 3-5 substantial sub-sections per chapter
- Each sub-section must contain rich, long-form prose (400-800 words) — not bullet points or summaries
- Content should teach, explain, and illustrate — the reader should walk away truly understanding the material
- Include concrete examples, scenarios, and practical illustrations throughout
- Build progressively within each chapter from context-setting to actionable knowledge
- Tailor depth, terminology, and examples to the specific audience and context provided`,
    sectionLabel: 'Chapter',
    elementLabel: 'Section',
    fields: [
      { key: 'title', label: 'Section Title', type: 'short-text', primary: true },
      { key: 'content', label: 'Content', type: 'long-text', color: 'none', icon: 'FileText' },
      { key: 'keyInsight', label: 'Key Insight', type: 'long-text', color: 'violet', icon: 'Lightbulb' },
      { key: 'practicalExample', label: 'Practical Example', type: 'long-text', color: 'emerald', icon: 'FlaskConical' },
      { key: 'actionItem', label: 'Reader Action Item', type: 'long-text', color: 'primary', icon: 'ListChecks' },
    ],
    supportsDeepDive: true,
    defaultSectionDrivers: EBOOK_CHAPTERS.map((c) => ({ name: c.name, description: c.description })),
    isBuiltIn: true,
  },
]
