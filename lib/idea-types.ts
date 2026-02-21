// ============================================================
// Idea Book — structured idea capturing with multiple frameworks
// ============================================================

export type IdeaFramework = 'problem-solution' | 'jtbd' | 'value-proposition' | 'lean-canvas' | 'free-form'
export type IdeaStatus = 'spark' | 'developing' | 'ready' | 'built' | 'archived'

export type IdeationStrategy =
  | 'balanced'
  | 'problem-lens-format'
  | 'role-situation'
  | 'pain-stack'
  | 'journey-mapping'
  | 'cognitive-load'
  | 'mistake-mining'
  | 'perspective-shift'
  | 'constraint-flip'
  | 'role-evolution'
  | 'outcome-reverse'
  | 'first-principles-thinking'
  | 'six-hats'
export interface IdeationStrategyDef {
  id: IdeationStrategy
  name: string
  description: string
  icon: string
  processSteps: string[]
}

export const IDEATION_STRATEGIES: IdeationStrategyDef[] = [
  {
    id: 'first-principles-thinking',
    name: 'First Principles',
    description: 'Generate ideas by starting with the first principles of the topic',
    icon: 'Shuffle',
    processSteps: [
        '1. ASSUMPTIONS: List every assumption embedded in this topic — what does it take for granted?',
        '2. DECONSTRUCT: Break the topic into its most basic, indisputable components.',
        '3. GROUND TRUTHS: What do we know to be factually true, independent of convention or opinion?',
        '4. REBUILD: From those ground truths, what answer emerges when you reason up without borrowing from analogies?',
        '5. CONTRAST: How does the first-principles answer differ from the conventional one? What does that gap reveal?',
        '6. SELECT: Select the best answer and flesh it into a complete concept. Give it a marketable title, substantive framework fields, and 1-3 genuinely fitting output types. Every field must contain real analysis, not filler.',
        '7. VALIDATE: Ask: Is this a product or just a topic? Would a specific professional pay attention to this? Is it differentiated from the other ideas in this batch? Replace any that fail.',
    ],
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Diverse ideas across multiple angles — no single methodology',
    icon: 'Shuffle',
    processSteps: [
      '1. MAP — Decompose the topic into sub-domains, professional roles, audience segments, and pain points. Identify what kinds of professionals work in or around this topic and what keeps them up at night.',
      '2. DIVERGE — Generate 2-3x more candidate ideas than needed, deliberately covering different angles: different audiences, different experience levels, different situations, different product formats. Do not self-censor at this stage.',
      '3. SHAPE — Select the strongest candidates and flesh each into a complete concept. Give each a marketable title, substantive framework fields, and 1-3 genuinely fitting output types. Every field must contain real analysis, not filler.',
      '4. STRESS-TEST — For each idea, ask: Is this a product or just a topic? Would a specific professional pay attention to this? Is it differentiated from the other ideas in this batch? Replace any that fail.',
    ],
  },
  {
    id: 'problem-lens-format',
    name: 'Problem-Lens-Format',
    description: 'Domain + Lens + Format = Product — apply systematic lenses to the topic',
    icon: 'Focus',
    processSteps: [
      '1. MAP LENSES — For this topic, identify which analytical lenses are most relevant: decisions, mistakes, priorities, tools, metrics, stakeholders, processes, psychology, economics, communication, failure scenarios, AI usage, strategy, execution. Select the 5-8 lenses that would yield the most valuable products.',
      '2. COMBINE — For each promising lens, pair it with the topic and one or more output formats. The formula is: Topic + Lens + Format = Product Idea. Example: "Engineering Management + Decisions + Question Book". Prioritize combinations where the lens reveals something non-obvious about the topic.',
      '3. REFINE — For the best combinations, craft a specific product concept. The title should follow the pattern of a book or product someone would buy, not a generic label. Fill in all framework fields with substance that explains why this lens applied to this topic creates value.',
      '4. VALIDATE — Check each idea: Does the lens genuinely add analytical depth, or is it forced? Would removing the lens make the product generic? Is the format the natural delivery vehicle for this type of content?',
    ],
  },
  {
    id: 'role-situation',
    name: 'Role x Situation',
    description: 'Matrix of roles and professional situations — each intersection is a product',
    icon: 'Grid3x3',
    processSteps: [
      '1. MAP ROLES — Identify 4-6 distinct professional roles that operate within or around this topic. Consider different seniority levels (IC vs. manager vs. executive), different functions (technical, commercial, operational), and adjacent roles that touch the topic indirectly.',
      '2. MAP SITUATIONS — For each role, identify 3-5 high-stakes situations they face: crises, transitions, recurring challenges, decision points, career moments. Focus on situations where having the right structured knowledge would make a measurable difference.',
      '3. PICK INTERSECTIONS — From the role x situation matrix, select the highest-value cells. Prioritize intersections where: the pain is acute, the knowledge gap is real, and a digital product would be the natural solution. Assign each the best-fit output format.',
      '4. VALIDATE — For each selected intersection: Is the role specific enough to identify a real person? Is the situation concrete enough that someone is living it right now? Would they recognize the product title as solving their exact problem?',
    ],
  },
  {
    id: 'pain-stack',
    name: 'Pain Stack',
    description: 'Decompose problems into 5 layers — awareness, knowledge, decision, execution, confidence',
    icon: 'Layers',
    processSteps: [
      '1. IDENTIFY CORE PROBLEMS — List the 3-5 most significant professional problems within this topic. Focus on problems that are frequent, painful, and urgent. Each should be something a real professional would nod in recognition about.',
      '2. DECOMPOSE INTO LAYERS — For each core problem, break it into the 5 pain layers: (a) Awareness — they do not know the problem exists, (b) Knowledge — they know the problem but lack understanding, (c) Decision — they understand but cannot decide what to do, (d) Execution — they decided but cannot execute well, (e) Confidence — they executed but doubt whether they did it right.',
      '3. DESIGN PRODUCTS — For the most promising problem-layer combinations, design a specific digital product. Match the layer to the right format: awareness problems suit question books and assessments, knowledge problems suit email courses and cheat sheets, decision problems suit decision books and battle cards, execution problems suit playbooks and checklists, confidence problems suit dossiers and prompt packs.',
      '4. VALIDATE — Check each idea: Does it clearly address one specific pain layer, not try to cover all five? Is the format naturally suited to that layer? Would someone at that exact layer of the problem find this product immediately useful?',
    ],
  },
  {
    id: 'journey-mapping',
    name: 'Journey Mapping',
    description: 'Before-During-After — create products for each phase of key workflows',
    icon: 'Route',
    processSteps: [
      '1. IDENTIFY ACTIVITIES — List the 4-6 most important professional activities, workflows, or processes within this topic. Focus on activities that are high-stakes, recurring, or where professionals frequently struggle. Examples: hiring, launching, migrating, auditing, onboarding.',
      '2. MAP PHASES — For each activity, break it into Before (preparation, planning, readiness), During (execution, real-time decisions, in-the-moment support), and After (evaluation, follow-up, lessons learned). Identify what knowledge or support artifact would be most valuable at each phase.',
      '3. DESIGN PRODUCTS — For the best activity-phase combinations, design a specific digital product. Before-phase products often suit checklists and question books; During-phase products suit battle cards, playbooks, and prompt packs; After-phase products suit dossiers and email courses. Title each as a product someone would search for right before they need it.',
      '4. VALIDATE — Check each idea: Is the phase boundary clear — would someone know exactly when to use this product? Does the format match how someone would consume content at that phase (e.g., quick reference during execution, deep preparation before)?',
    ],
  },
  {
    id: 'cognitive-load',
    name: 'Cognitive Load',
    description: 'Find where thinking is hardest and create support artifacts',
    icon: 'Brain',
    processSteps: [
      '1. MAP COGNITIVE HOTSPOTS — Identify where professionals in this topic face the highest cognitive load: ambiguity (unclear what to do), uncertainty (unclear what will happen), risk (high cost of being wrong), tradeoffs (no clearly right answer), complexity (too many variables), time pressure (must decide fast). List specific scenarios for each.',
      '2. DIAGNOSE THE LOAD TYPE — For each hotspot, determine what makes thinking hard: Is it information overload? Missing mental models? Too many stakeholders? Emotional complexity? Novel situations with no playbook? The diagnosis determines what kind of support artifact helps most.',
      '3. DESIGN SUPPORT ARTIFACTS — Match each cognitive hotspot to a digital product that directly reduces the load. Decision frameworks reduce tradeoff complexity. Checklists reduce "did I forget something" anxiety. Question books reduce "am I asking the right things" uncertainty. Prompt packs reduce "how do I start" paralysis. The product should feel like having a senior mentor available.',
      '4. VALIDATE — Check each idea: Does this product genuinely reduce cognitive load, or just add more information to process? Would a professional reach for this in the moment of high cognitive demand? Is the format optimized for quick access when thinking is already overloaded?',
    ],
  },
  {
    id: 'mistake-mining',
    name: 'Mistake Mining',
    description: 'Identify common mistakes and build products that prevent them',
    icon: 'ShieldAlert',
    processSteps: [
      '1. MINE MISTAKES — Identify the most common, costly, and regretted mistakes in this domain. Consider: What do beginners get wrong? What do experienced people still mess up? What mistakes do leaders regret most? What causes the most expensive failures? Group related mistakes into clusters.',
      '2. ANALYZE ROOT CAUSES — For each mistake cluster, determine why it keeps happening: Missing knowledge? Wrong mental model? Overconfidence? Insufficient process? Time pressure? Political blind spots? The root cause determines whether the product should educate, warn, guide, or provide a safety net.',
      '3. DESIGN PREVENTION PRODUCTS — For each high-value mistake cluster, design a digital product that helps professionals avoid or recover from these mistakes. Mistake-prevention checklists, "red flags" question books, failure-mode battle cards, and "what went wrong" dossiers all have strong market pull. Titles should create urgency without being fear-based.',
      '4. VALIDATE — Check each idea: Is the mistake real and recognizable (would a practitioner say "yes, I have seen that happen")? Does the product prevent the mistake rather than just describe it? Would someone proactively seek this product, or does it only make sense after the mistake has occurred?',
    ],
  },
  {
    id: 'perspective-shift',
    name: 'Perspective Shift',
    description: 'Same topic, different stakeholder viewpoints — each perspective is a product',
    icon: 'ScanEye',
    processSteps: [
      '1. MAP STAKEHOLDERS — Identify 5-8 distinct stakeholder perspectives on this topic: different roles (CFO, CTO, end user), different levels (executive, manager, IC), different sides (buyer vs. seller, regulator vs. regulated, internal vs. external). Include at least one non-obvious perspective most products ignore.',
      '2. FIND UNIQUE ANGLES — For each stakeholder perspective, determine: What do they care about that others do not? What information do they need that is hard to find? What decisions do they make that require understanding other perspectives? The value is in perspectives that are underserved by existing content.',
      '3. DESIGN PERSPECTIVE PRODUCTS — For the most valuable perspectives, design a digital product that gives that stakeholder exactly the view they need. "The CFO\'s View of..." and "What Your Engineering Team Wishes You Knew About..." are powerful product patterns. Match each to the format that fits how this stakeholder consumes information.',
      '4. VALIDATE — Check each idea: Is the perspective genuinely different from the default view of the topic? Would someone in this role feel that the product was specifically made for them? Does the product reveal something they would not get from a generic resource?',
    ],
  },
  {
    id: 'constraint-flip',
    name: 'Constraint Flip',
    description: 'Turn common constraints into product opportunities',
    icon: 'RefreshCcw',
    processSteps: [
      '1. MAP CONSTRAINTS — Identify the most common constraints professionals face in this domain: no budget, small team, tight deadlines, new to the role, no experience, crisis situation, legacy systems, regulatory pressure, remote team, limited authority, no executive buy-in. Select the 5-7 most painful and common.',
      '2. FLIP TO OPPORTUNITY — For each constraint, ask: What would a professional need to succeed despite this constraint? What knowledge, framework, or decision aid would turn this limitation into a competitive advantage? The constraint itself becomes the product positioning: "How to [achieve X] with [constraint Y]".',
      '3. DESIGN PRODUCTS — For each constraint-opportunity pair, design a specific digital product. The product should be framed around the constraint: "The Zero-Budget Marketing Playbook", "First 90 Days as a New Engineering Manager", "Crisis Response Decision Book". The constraint in the title creates immediate recognition for the target audience.',
      '4. VALIDATE — Check each idea: Is the constraint real and common enough that many professionals face it? Does the product offer genuine tactical value under the constraint, not just motivational platitudes? Would someone in this exact situation feel the product was made for their reality?',
    ],
  },
  {
    id: 'role-evolution',
    name: 'Role Evolution',
    description: 'How roles are changing — AI, automation, regulation, market shifts',
    icon: 'TrendingUp',
    processSteps: [
      '1. MAP FORCES OF CHANGE — Identify the major forces reshaping this topic: AI and automation impact, regulatory changes, remote/hybrid work, market consolidation, new technology adoption, generational shifts, economic pressures. For each force, determine which specific roles and workflows are most affected.',
      '2. IDENTIFY ADAPTATION GAPS — For each force-role combination, ask: What skills become obsolete? What new skills become essential? What decisions have no historical playbook? What does "good" look like in the new reality? Focus on gaps where professionals feel the urgency but lack structured guidance.',
      '3. DESIGN ADAPTATION PRODUCTS — For the most urgent adaptation gaps, design digital products that help professionals navigate the transition. "AI Survival Guide for [Role]", "[Role] in 2025: What Changes and What Stays", "Future-Proofing Your [Skill] Career". Match each to the format that best supports learning and adaptation.',
      '4. VALIDATE — Check each idea: Is the change real and imminent (not speculative future-gazing)? Would a professional in this role feel urgency about this specific shift? Does the product offer concrete adaptation strategies, not just trend descriptions?',
    ],
  },
  {
    id: 'outcome-reverse',
    name: 'Outcome Reverse',
    description: 'Start with desired outcomes and work backward to knowledge products',
    icon: 'Undo2',
    processSteps: [
      '1. MAP DESIRED OUTCOMES — Identify the most valued professional outcomes in this domain: promotion, better performance reviews, higher revenue, faster delivery, fewer incidents, better team retention, more influence, less stress, better decisions, career transition success. Select the 5-7 outcomes professionals actively pursue.',
      '2. TRACE BACKWARD — For each outcome, work backward: What knowledge, skills, or decision frameworks does someone need to achieve this? What specific gaps prevent most people from reaching this outcome? What is the "last mile" problem — the knowledge that separates people who achieve the outcome from those who do not?',
      '3. DESIGN OUTCOME PRODUCTS — For each outcome-gap pair, design a digital product that bridges the gap. The product title should promise the outcome: "The Promotion Playbook for [Role]", "How [Role]s Hit Revenue Targets Consistently", "The Decision Framework That Reduces [Outcome] Risk by Half". The framework fields should trace the path from current state to desired outcome.',
      '4. VALIDATE — Check each idea: Is the promised outcome specific and credible (not "be a better leader" vagueness)? Does the product address the actual gap, or just describe the outcome? Would someone actively searching for this outcome find this product and think "this is exactly what I need"?',
    ],
  },
]

export function getIdeationStrategyDef(id: IdeationStrategy): IdeationStrategyDef {
  return IDEATION_STRATEGIES.find((s) => s.id === id) ?? IDEATION_STRATEGIES[0]
}

export interface Idea {
  id: string
  createdAt: string
  updatedAt: string
  title: string
  status: IdeaStatus
  framework: IdeaFramework
  frameworkData: Record<string, string>
  suggestedOutputTypes: string[]
  tags: string[]
  notes: string
  rating?: 1 | 2 | 3 | 4 | 5
  configurationId?: string
  implementationHint?: ImplementationHint
}

export interface ImplementationHintRecommendation {
  outputTypeId: string
  rationale: string
}

export interface ImplementationHint {
  summary: string
  recommendations: ImplementationHintRecommendation[]
  generatedAt: string
}

export interface FrameworkFieldDef {
  key: string
  label: string
  placeholder: string
  multiline: boolean
}

export interface FrameworkDef {
  id: IdeaFramework
  name: string
  description: string
  icon: string
  fields: FrameworkFieldDef[]
}

export const FRAMEWORK_DEFINITIONS: FrameworkDef[] = [
  {
    id: 'problem-solution',
    name: 'Problem-Solution Fit',
    description: 'Define the problem, audience, and how your digital product solves it',
    icon: 'Target',
    fields: [
      { key: 'problem', label: 'Problem', placeholder: 'What pain or challenge does the audience face?', multiline: true },
      { key: 'targetAudience', label: 'Target Audience', placeholder: 'Who specifically has this problem? (role, industry, context)', multiline: false },
      { key: 'proposedSolution', label: 'Proposed Solution', placeholder: 'What digital product will you create to address this?', multiline: true },
      { key: 'keyBenefit', label: 'Key Benefit', placeholder: 'What is the primary value the audience will get?', multiline: false },
    ],
  },
  {
    id: 'jtbd',
    name: 'Jobs To Be Done',
    description: 'Capture the situation, motivation, and desired outcome',
    icon: 'Briefcase',
    fields: [
      { key: 'situation', label: 'When (Situation)', placeholder: 'When I am [doing/facing/experiencing]...', multiline: true },
      { key: 'motivation', label: 'I want to (Motivation)', placeholder: 'I want to [accomplish/learn/solve]...', multiline: true },
      { key: 'desiredOutcome', label: 'So I can (Outcome)', placeholder: 'So I can [achieve/avoid/improve]...', multiline: true },
    ],
  },
  {
    id: 'value-proposition',
    name: 'Value Proposition Canvas',
    description: 'Map customer needs to your product offering',
    icon: 'Gift',
    fields: [
      { key: 'customerJobs', label: 'Customer Jobs', placeholder: 'What tasks are they trying to accomplish?', multiline: true },
      { key: 'customerPains', label: 'Customer Pains', placeholder: 'What frustrations or obstacles do they face?', multiline: true },
      { key: 'customerGains', label: 'Customer Gains', placeholder: 'What outcomes or benefits do they desire?', multiline: true },
      { key: 'productOffering', label: 'Product Offering', placeholder: 'What digital product will you create?', multiline: true },
      { key: 'painRelievers', label: 'Pain Relievers', placeholder: 'How does your product eliminate or reduce pains?', multiline: true },
      { key: 'gainCreators', label: 'Gain Creators', placeholder: 'How does your product create the desired gains?', multiline: true },
    ],
  },
  {
    id: 'lean-canvas',
    name: 'Lean Canvas',
    description: 'A lean business model for your digital product idea',
    icon: 'LayoutGrid',
    fields: [
      { key: 'problem', label: 'Problem', placeholder: 'Top 1-3 problems your audience faces', multiline: true },
      { key: 'solution', label: 'Solution', placeholder: 'Your proposed digital product solution', multiline: true },
      { key: 'uvp', label: 'Unique Value Proposition', placeholder: 'Single clear compelling message that turns a visitor into a buyer', multiline: true },
      { key: 'targetAudience', label: 'Target Audience', placeholder: 'Who are your ideal customers?', multiline: false },
      { key: 'channels', label: 'Channels', placeholder: 'How will you reach your audience? (blog, social, email, etc.)', multiline: false },
    ],
  },
  {
    id: 'free-form',
    name: 'Free-form',
    description: 'Quick capture — just describe your idea',
    icon: 'PenLine',
    fields: [
      { key: 'description', label: 'Description', placeholder: 'Describe your digital product idea in your own words...', multiline: true },
    ],
  },
]

export const IDEA_STATUSES: { value: IdeaStatus; label: string; color: string }[] = [
  { value: 'spark', label: 'Spark', color: 'bg-yellow-500/15 text-yellow-700' },
  { value: 'developing', label: 'Developing', color: 'bg-blue-500/15 text-blue-700' },
  { value: 'ready', label: 'Ready', color: 'bg-green-500/15 text-green-700' },
  { value: 'built', label: 'Built', color: 'bg-purple-500/15 text-purple-700' },
  { value: 'archived', label: 'Archived', color: 'bg-muted text-muted-foreground' },
]

export function getFrameworkDef(id: IdeaFramework): FrameworkDef {
  return FRAMEWORK_DEFINITIONS.find((f) => f.id === id) ?? FRAMEWORK_DEFINITIONS[0]
}

/** Assemble a natural-language description from an idea for configuration generation */
export function assembleIdeaDescription(idea: Idea, outputTypeNames: Record<string, string>): string {
  const fw = getFrameworkDef(idea.framework)
  const outputNames = idea.suggestedOutputTypes.map((id) => outputTypeNames[id] || id).join(' and ')

  const parts: string[] = []
  parts.push(`Create a configuration for ${outputNames || 'a digital product'}.`)
  parts.push(`Product concept: "${idea.title}".`)

  for (const field of fw.fields) {
    const val = idea.frameworkData[field.key]?.trim()
    if (val) {
      parts.push(`${field.label}: ${val}`)
    }
  }

  if (idea.notes?.trim()) {
    parts.push(`Additional notes: ${idea.notes.trim()}`)
  }

  return parts.join('\n')
}
