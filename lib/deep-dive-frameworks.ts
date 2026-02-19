export interface DeepDiveFramework {
  id: string
  name: string
  shortDescription: string
  steps: string[]
  bestFor: string
}

export const DEEP_DIVE_FRAMEWORKS: Record<string, DeepDiveFramework[]> = {
  questions: [
    {
      id: 'perp',
      name: 'PERP Analysis',
      shortDescription: 'Purpose → Evidence → Reasoning → Perspectives',
      steps: [
        'PURPOSE: Clarify the core intent behind this question — what decision or understanding hinges on the answer?',
        'EVIDENCE: Identify what data, documents, metrics, or observations are needed to answer this rigorously.',
        'REASONING: Map the logical chain — what assumptions must hold, what cause-effect relationships matter, and what would invalidate your conclusion?',
        'PERSPECTIVES: Examine the question through at least 3 different stakeholder lenses — whose reality changes depending on the answer?',
      ],
      bestFor: 'strategic or decision-oriented questions where multiple viewpoints matter',
    },
    {
      id: '5-whys',
      name: '5 Whys',
      shortDescription: 'Drill from surface to root cause in 5 layers',
      steps: [
        'SURFACE: State the obvious, first-pass answer to this question.',
        'WHY 1: Why does that surface answer hold? What drives it?',
        'WHY 2: Dig deeper — what systemic factor or constraint causes that?',
        'WHY 3: Push further — what organizational, market, or structural force is at play?',
        'WHY 4: Get to the fundamental — what belief, incentive, or design choice enables this chain?',
        'ROOT CAUSE: Identify the single deepest insight — the lever that, if changed, would reshape all the layers above.',
      ],
      bestFor: 'diagnostic questions about problems, failures, or persistent challenges',
    },
    {
      id: 'first-principles',
      name: 'First Principles Thinking',
      shortDescription: 'Strip assumptions, rebuild from fundamental truths',
      steps: [
        'ASSUMPTIONS: List every assumption embedded in this question — what does it take for granted?',
        'DECONSTRUCT: Break the question into its most basic, indisputable components.',
        'GROUND TRUTHS: What do we know to be factually true, independent of convention or opinion?',
        'REBUILD: From those ground truths, what answer emerges when you reason up without borrowing from analogies?',
        'CONTRAST: How does the first-principles answer differ from the conventional one? What does that gap reveal?',
      ],
      bestFor: 'innovation questions, challenging status-quo assumptions, or rethinking approaches from scratch',
    },
    {
      id: 'six-hats',
      name: 'Six Thinking Hats',
      shortDescription: 'Explore through 6 cognitive modes (De Bono)',
      steps: [
        'WHITE HAT (Facts): What objective data and information do we have or need? What are the gaps?',
        'RED HAT (Feelings): What gut reactions, emotions, and intuitions does this question trigger? What feels risky or exciting?',
        'BLACK HAT (Caution): What could go wrong? What are the risks, flaws, and obstacles?',
        'YELLOW HAT (Optimism): What is the best-case scenario? What benefits and opportunities exist?',
        'GREEN HAT (Creativity): What unconventional approaches or alternative framings could we explore?',
        'BLUE HAT (Process): How should we organize our thinking about this? What is the best sequence of next steps?',
      ],
      bestFor: 'complex, multifaceted questions requiring balanced deliberation',
    },
    {
      id: 'socratic',
      name: 'Socratic Method',
      shortDescription: 'Challenge assumptions through structured questioning',
      steps: [
        'CLARIFY: What exactly does this question mean? Define every key term precisely.',
        'PROBE ASSUMPTIONS: What is being assumed to be true? Are those assumptions warranted?',
        'DEMAND EVIDENCE: What evidence supports the premise? Is it sufficient, current, and reliable?',
        'EXAMINE VIEWPOINTS: Who would disagree with the likely answer, and why? What is their strongest argument?',
        'TEST IMPLICATIONS: If the answer is X, what logically follows? Are those consequences acceptable?',
        'META-QUESTION: Is this even the right question to ask? What better question might exist?',
      ],
      bestFor: 'questions where the framing itself may be biased or incomplete',
    },
  ],

  checklist: [
    {
      id: '5w1h',
      name: '5W1H Analysis',
      shortDescription: 'Who, What, When, Where, Why, How',
      steps: [
        'WHO: Who is responsible for this item? Who is affected? Who needs to be consulted or informed?',
        'WHAT: What exactly needs to happen? What does "done" look like? What are the acceptance criteria?',
        'WHEN: When should this be completed? What triggers it? Are there dependencies or deadlines?',
        'WHERE: Where does this apply? Which systems, environments, or locations are involved?',
        'WHY: Why is this on the checklist? What risk does it mitigate or value does it create?',
        'HOW: How should it be executed? What tools, processes, or skills are required?',
      ],
      bestFor: 'operational items that need thorough planning and accountability',
    },
    {
      id: 'pdca',
      name: 'PDCA Cycle',
      shortDescription: 'Plan → Do → Check → Act (Deming cycle)',
      steps: [
        'PLAN: Define the objective for this item, identify success criteria, and anticipate obstacles.',
        'DO: Describe the execution steps — what actions, in what order, with what resources?',
        'CHECK: How will you verify this was done correctly? What metrics, reviews, or tests apply?',
        'ACT: Based on what you learn, what should be standardized, improved, or escalated?',
      ],
      bestFor: 'process-oriented items that benefit from continuous improvement thinking',
    },
    {
      id: 'risk-impact',
      name: 'Risk-Impact Matrix',
      shortDescription: 'Assess probability, impact, and mitigation',
      steps: [
        'RISK IDENTIFICATION: What can go wrong if this item is skipped or done poorly?',
        'PROBABILITY: How likely is failure? What historical evidence or patterns inform this?',
        'IMPACT: If it fails, what is the blast radius — financial, operational, reputational, legal?',
        'MITIGATION: What preventive controls or fallback plans reduce the risk?',
        'MONITORING: How will you detect early warning signs of trouble?',
      ],
      bestFor: 'high-stakes items where understanding consequences of inaction matters',
    },
    {
      id: 'raci',
      name: 'RACI Framework',
      shortDescription: 'Responsible, Accountable, Consulted, Informed',
      steps: [
        'RESPONSIBLE: Who does the work? What specific skills or access do they need?',
        'ACCOUNTABLE: Who owns the outcome and makes the final call? There must be exactly one.',
        'CONSULTED: Whose input is needed before or during execution? What expertise do they bring?',
        'INFORMED: Who needs to know about progress or completion? Through what channel?',
        'GAPS: Are there accountability gaps? Is anyone both Accountable and Responsible in a way that creates bottlenecks?',
      ],
      bestFor: 'items involving cross-functional coordination or delegation',
    },
  ],

  'email-course': [
    {
      id: 'aida',
      name: 'AIDA Framework',
      shortDescription: 'Attention → Interest → Desire → Action',
      steps: [
        'ATTENTION: What hook, stat, or provocative statement will stop the reader from scrolling? Open with something unexpected.',
        'INTEREST: What story, data, or insight sustains engagement? Connect the topic to the reader\'s daily reality.',
        'DESIRE: What transformation or outcome will the reader want after reading this? Make them feel the gap between where they are and where they could be.',
        'ACTION: What is the single, clear next step? Make the call-to-action feel easy and rewarding.',
      ],
      bestFor: 'emails designed to persuade, convert, or drive a specific action',
    },
    {
      id: 'pas',
      name: 'PAS Framework',
      shortDescription: 'Problem → Agitation → Solution',
      steps: [
        'PROBLEM: Name the specific pain point your reader faces. Be precise — vague problems get ignored.',
        'AGITATION: Amplify the consequences — what happens if they don\'t solve this? Use scenarios, data, or emotional resonance to make the problem feel urgent.',
        'SOLUTION: Present your insight, framework, or recommendation as the clear path forward. Show them this email holds the key.',
      ],
      bestFor: 'emails addressing a pain point or motivating change',
    },
    {
      id: 'storytelling-arc',
      name: 'Storytelling Arc',
      shortDescription: 'Setup → Conflict → Resolution → Lesson',
      steps: [
        'SETUP: Establish context — who is the character, what was the situation? Ground the reader in a recognizable scenario.',
        'CONFLICT: Introduce the challenge, mistake, or turning point. This is where tension and relatability live.',
        'RESOLUTION: Show what happened — the decision made, the approach taken, the outcome achieved.',
        'LESSON: Extract the transferable insight. What should the reader take away and apply to their own situation?',
        'BRIDGE: Connect the story back to the course module\'s theme and tee up the next email.',
      ],
      bestFor: 'educational emails that teach through narrative and case studies',
    },
    {
      id: 'teach-framework',
      name: 'TEACH Method',
      shortDescription: 'Tell → Explain → Apply → Check → Highlight',
      steps: [
        'TELL: State the key concept or principle upfront — no burying the lead.',
        'EXPLAIN: Break it down with context, examples, or analogies the reader can relate to.',
        'APPLY: Show how to use this in practice — give a template, checklist, or step-by-step.',
        'CHECK: Pose a reflection question or mini-exercise so the reader tests their understanding.',
        'HIGHLIGHT: Summarize the one thing they must remember, and preview what\'s next.',
      ],
      bestFor: 'purely educational emails focused on skill-building or knowledge transfer',
    },
  ],

  prompts: [
    {
      id: 'chain-of-thought',
      name: 'Chain of Thought',
      shortDescription: 'Step-by-step reasoning for complex prompts',
      steps: [
        'DECOMPOSITION: Break the prompt\'s goal into sequential reasoning steps the AI should follow.',
        'CONTEXT PRIMING: What background knowledge or role framing does the AI need before starting?',
        'STEP SEQUENCING: Define the logical order — what must the AI figure out first, second, third?',
        'OUTPUT SHAPING: How should the final output be structured? What format yields the most useful result?',
        'EDGE CASES: What tricky inputs or ambiguities might derail the prompt? Add guardrails.',
      ],
      bestFor: 'complex analytical or multi-step reasoning prompts',
    },
    {
      id: 'crisp',
      name: 'CRISP Framework',
      shortDescription: 'Context → Role → Instructions → Scope → Parameters',
      steps: [
        'CONTEXT: What situation or background does the AI need to understand before executing?',
        'ROLE: What persona or expertise should the AI adopt? How does this shape its voice and priorities?',
        'INSTRUCTIONS: What is the core task? Be precise about what "good" looks like.',
        'SCOPE: What boundaries apply — length, depth, topics to include or exclude?',
        'PARAMETERS: What format, tone, or constraints should govern the output?',
      ],
      bestFor: 'general-purpose prompt optimization and structuring',
    },
    {
      id: 'iterative-refinement',
      name: 'Iterative Refinement',
      shortDescription: 'Draft → Evaluate → Refine → Specialize',
      steps: [
        'DRAFT: Start with the simplest version of the prompt that captures the core intent.',
        'EVALUATE: Run it mentally — what would a mediocre AI response look like? Identify gaps.',
        'REFINE: Add specificity, examples, or constraints that close those gaps.',
        'SPECIALIZE: Tailor for the target domain — add jargon, context, or role cues that improve relevance.',
        'VARIATION: Create 2-3 variants for different scenarios (quick vs. deep, tactical vs. strategic).',
      ],
      bestFor: 'refining and customizing existing prompts for better results',
    },
  ],

  'battle-cards': [
    {
      id: 'swot',
      name: 'SWOT Analysis',
      shortDescription: 'Strengths, Weaknesses, Opportunities, Threats',
      steps: [
        'STRENGTHS: What does the competitor genuinely do well? Where are they objectively ahead?',
        'WEAKNESSES: Where do they fall short? What do their own customers complain about?',
        'OPPORTUNITIES: What market shifts, unmet needs, or gaps in their strategy can you exploit?',
        'THREATS: What moves could they make that would hurt your position? How do you preempt them?',
      ],
      bestFor: 'comprehensive competitive positioning and strategic planning',
    },
    {
      id: 'objection-handling',
      name: 'Objection Handling Framework',
      shortDescription: 'Acknowledge → Reframe → Evidence → Pivot',
      steps: [
        'ACKNOWLEDGE: What is the customer\'s likely concern or objection when this competitor comes up? Validate it.',
        'REFRAME: Shift the conversation frame — what question should the customer really be asking?',
        'EVIDENCE: What proof points, case studies, or data back up your counter-position?',
        'PIVOT: Steer toward your differentiators — what conversation does your team want to have instead?',
      ],
      bestFor: 'sales-ready intelligence for handling competitive objections in real conversations',
    },
    {
      id: 'value-chain',
      name: 'Value Chain Comparison',
      shortDescription: 'Compare across the full customer value chain',
      steps: [
        'PRE-SALES: How do they attract and engage prospects vs. you? Where is the experience better or worse?',
        'ONBOARDING: How does their implementation, setup, or time-to-value compare?',
        'CORE DELIVERY: Feature-for-feature, where do they genuinely differentiate? Where is parity?',
        'SUPPORT & SUCCESS: How does their post-sale experience compare — responsiveness, expertise, proactiveness?',
        'TOTAL COST: Beyond sticker price — what is the real total cost of ownership including hidden costs, migration, training, and scaling?',
      ],
      bestFor: 'in-depth competitive comparison across the entire customer lifecycle',
    },
  ],
}

export function getFrameworksForOutputType(outputType: string): DeepDiveFramework[] {
  return DEEP_DIVE_FRAMEWORKS[outputType] || DEEP_DIVE_FRAMEWORKS.questions
}
