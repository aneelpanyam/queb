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

  'decision-books': [
    {
      id: 'decide',
      name: 'DECIDE Framework',
      shortDescription: 'Define → Evaluate → Consider → Identify → Decide → Execute',
      steps: [
        'DEFINE: State the decision precisely — what exactly must be chosen, by whom, and by when? What triggers this decision now?',
        'EVALUATE: What information, data, and evidence do you need to make this decision well? What do you already know vs. need to find out?',
        'CONSIDER: Map the alternatives — what are the realistic options, including doing nothing? What are the constraints?',
        'IDENTIFY: For each option, what are the likely outcomes, risks, and second-order effects? Who wins, who loses?',
        'DECIDE: Given the analysis, which option best fits the criteria? What decision rule applies — consensus, authority, data-driven?',
        'EXECUTE: What happens after the decision? Communication plan, rollout steps, success metrics, and review cadence.',
      ],
      bestFor: 'structured, high-stakes decisions with multiple stakeholders and significant consequences',
    },
    {
      id: 'reversibility-test',
      name: 'Reversibility Test',
      shortDescription: 'Classify one-way vs. two-way door, calibrate decision speed',
      steps: [
        'CLASSIFY: Is this a one-way door (irreversible or very costly to reverse) or a two-way door (easily reversible)? What makes it so?',
        'CONSTRAINTS: What locks you in — contracts, sunk costs, organizational momentum, technical debt, reputational stakes?',
        'CONSEQUENCES: If you choose wrong, what happens? Map the blast radius across time, money, relationships, and optionality.',
        'DECISION SPEED: Given the reversibility, how much deliberation is warranted? Should you decide fast and iterate, or slow down and get it right?',
        'ROLLBACK PLAN: If this decision proves wrong, what is the escape route? Define the trigger for revisiting and the cost of reversal.',
      ],
      bestFor: 'determining how much deliberation a decision needs and calibrating urgency vs. thoroughness',
    },
    {
      id: 'options-criteria-matrix',
      name: 'Options-Criteria Matrix',
      shortDescription: 'List options → Define criteria → Weight → Score → Sensitivity check',
      steps: [
        'LIST OPTIONS: Enumerate all realistic alternatives, including hybrid approaches and the status quo. Push for at least 3-4 distinct options.',
        'DEFINE CRITERIA: What dimensions matter most? Cost, speed, risk, quality, alignment, feasibility, stakeholder impact? Be specific.',
        'WEIGHT CRITERIA: Not all criteria are equal — assign relative importance. What is non-negotiable vs. nice-to-have?',
        'SCORE OPTIONS: Evaluate each option against each criterion. Where is the data strong vs. uncertain? Flag assumptions.',
        'SENSITIVITY CHECK: How robust is the winner? If weights shift or assumptions break, does the ranking change? Where is the decision fragile?',
      ],
      bestFor: 'decisions with multiple viable alternatives that need systematic, transparent comparison',
    },
    {
      id: 'second-order-thinking',
      name: 'Second-Order Thinking',
      shortDescription: 'Trace consequences through first, second, and third-order effects',
      steps: [
        'FIRST-ORDER: What are the immediate, obvious consequences of this decision? Who is directly affected and how?',
        'SECOND-ORDER: What reactions, adaptations, and knock-on effects will the first-order consequences trigger? How will people and systems respond?',
        'THIRD-ORDER: What cascading effects emerge from those responses? What unintended consequences or feedback loops could develop?',
        'STAKEHOLDER RIPPLE MAP: Trace the impact across all stakeholders — who benefits, who bears cost, who changes behavior, who exits?',
        'TIME-HORIZON ANALYSIS: How does the impact profile change over 30 days, 6 months, 2 years? Do short-term gains create long-term debt?',
      ],
      bestFor: 'decisions with complex downstream effects where surface-level analysis misses critical dynamics',
    },
    {
      id: 'pre-mortem',
      name: 'Pre-Mortem Analysis',
      shortDescription: 'Imagine failure → Identify causes → Design preventions',
      steps: [
        'IMAGINE FAILURE: Fast-forward 12 months — this decision has failed spectacularly. Describe the failure in vivid, specific terms.',
        'IDENTIFY CAUSES: Working backwards, what went wrong? List every plausible cause — execution gaps, wrong assumptions, external shocks, stakeholder resistance.',
        'RANK LIKELIHOOD: Which failure modes are most probable given the current context? Which are most devastating regardless of probability?',
        'DESIGN PREVENTIONS: For the top failure modes, what can you do now to prevent or mitigate them? What early warning signals should you monitor?',
        'DEFINE SUCCESS SIGNALS: Flip it — what does success look like at 30, 90, and 180 days? What leading indicators confirm you are on track?',
      ],
      bestFor: 'high-risk decisions where preventing failure is more valuable than optimizing for the best case',
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

  dossier: [
    {
      id: 'pestel',
      name: 'PESTEL Analysis',
      shortDescription: 'Political, Economic, Social, Technological, Environmental, Legal factors',
      steps: [
        'POLITICAL: What government policies, regulations, political stability, or geopolitical factors affect this subject? What political risks or opportunities exist?',
        'ECONOMIC: What economic conditions, market trends, currency factors, or fiscal policies impact this subject? How do macroeconomic forces shape their position?',
        'SOCIAL: What demographic trends, cultural shifts, consumer behavior patterns, or social attitudes are relevant? How is the social landscape evolving?',
        'TECHNOLOGICAL: What technological changes, innovations, disruptions, or digital trends affect this subject? Where is technology creating opportunity or threat?',
        'ENVIRONMENTAL: What environmental regulations, sustainability pressures, climate risks, or resource constraints apply? How is the environmental landscape shifting?',
        'LEGAL: What legal frameworks, compliance requirements, intellectual property issues, or litigation risks are relevant? What legal changes are on the horizon?',
      ],
      bestFor: 'broad environmental scanning and macro-level intelligence gathering',
    },
    {
      id: 'porters-five-forces',
      name: "Porter's Five Forces",
      shortDescription: 'Analyze competitive intensity through five structural forces',
      steps: [
        'COMPETITIVE RIVALRY: How intense is competition in this space? How many competitors exist, and how do they differentiate?',
        'THREAT OF NEW ENTRANTS: How easy is it for new players to enter? What barriers to entry exist — capital, regulation, brand loyalty, technology?',
        'BARGAINING POWER OF SUPPLIERS: How much leverage do suppliers have? Are there few suppliers or many? Can they raise prices or reduce quality?',
        'BARGAINING POWER OF BUYERS: How much leverage do customers have? Can they easily switch, negotiate, or go elsewhere?',
        'THREAT OF SUBSTITUTES: What alternative solutions exist? How likely are customers to switch to a fundamentally different approach?',
      ],
      bestFor: 'understanding competitive dynamics and industry structure',
    },
    {
      id: 'intelligence-cycle',
      name: 'Intelligence Cycle',
      shortDescription: 'Direction → Collection → Processing → Analysis → Dissemination',
      steps: [
        'DIRECTION: What is the key intelligence question? What decisions hinge on this information? What gaps in knowledge are most critical?',
        'COLLECTION: What sources of information are available — public filings, industry reports, insider signals, social media, patent databases? What can be observed directly?',
        'PROCESSING: How reliable is the collected information? What biases or gaps exist? How should raw data be organized and cross-referenced?',
        'ANALYSIS: What patterns emerge? What do the data points collectively indicate? What are the competing hypotheses and which has the strongest evidence?',
        'DISSEMINATION: What are the actionable takeaways? Who needs this intelligence and in what format? What confidence level should be assigned?',
      ],
      bestFor: 'systematic intelligence gathering where evidence quality and analytical rigor matter',
    },
  ],

  playbook: [
    {
      id: 'pdca-playbook',
      name: 'PDCA Cycle',
      shortDescription: 'Plan → Do → Check → Act for continuous improvement',
      steps: [
        'PLAN: What is the specific objective of this play? What resources are needed, what could go wrong, and what does the execution plan look like step-by-step?',
        'DO: Execute the plan — what are the critical actions, in what order? What should be documented during execution for later review?',
        'CHECK: How will you measure whether this play succeeded? What metrics, observations, or feedback should be collected? How does the outcome compare to the plan?',
        'ACT: Based on the results, what should be standardized, adjusted, or abandoned? What lessons feed into the next iteration?',
      ],
      bestFor: 'operational plays that benefit from iterative improvement and systematic learning',
    },
    {
      id: 'after-action-review',
      name: 'After-Action Review',
      shortDescription: 'What was planned → What happened → Why → What next',
      steps: [
        'INTENDED OUTCOME: What was this play supposed to achieve? What were the specific goals, timeline, and success criteria?',
        'ACTUAL OUTCOME: What actually happened? What went according to plan and what diverged? Be specific about the gap between intent and reality.',
        'ROOT CAUSE ANALYSIS: Why did the outcome differ from the plan? What systemic, environmental, or execution factors contributed? Distinguish between controllable and uncontrollable factors.',
        'SUSTAIN & IMPROVE: What worked well that should be repeated? What needs to change? What specific actions will prevent the same issues next time?',
        'KNOWLEDGE CAPTURE: What insights should be documented and shared? Who else would benefit from these lessons?',
      ],
      bestFor: 'post-execution learning and improving playbook effectiveness over time',
    },
    {
      id: 'sipoc',
      name: 'SIPOC Analysis',
      shortDescription: 'Suppliers → Inputs → Process → Outputs → Customers',
      steps: [
        'SUPPLIERS: Who or what provides the inputs needed for this play? What dependencies exist and how reliable are they?',
        'INPUTS: What materials, information, approvals, or resources are required before this play can begin? What quality standards must they meet?',
        'PROCESS: What are the key steps in executing this play? Map the critical path and identify bottlenecks or decision points.',
        'OUTPUTS: What does this play produce — deliverables, decisions, artifacts, or state changes? What quality criteria must the outputs meet?',
        'CUSTOMERS: Who receives the outputs? What are their expectations, and how will you know they are satisfied with the result?',
      ],
      bestFor: 'understanding the end-to-end flow of a play and identifying dependencies and handoffs',
    },
  ],

  ebook: [
    {
      id: 'explain-like-a-book',
      name: 'Explain Like a Book',
      shortDescription: 'Context → Core Idea → Nuance → Application → Synthesis',
      steps: [
        'CONTEXT: Why does this topic matter right now? What is the reader\'s world like before they understand this? Set the stage with stakes and relevance.',
        'CORE IDEA: What is the central concept or principle? Explain it clearly and precisely — strip away jargon and build understanding from first principles.',
        'NUANCE: What are the subtleties, exceptions, and edge cases? Where do common explanations oversimplify? Add the depth that separates surface knowledge from mastery.',
        'APPLICATION: How does this play out in the real world? Walk through a specific, detailed scenario where this knowledge changes what the reader does or decides.',
        'SYNTHESIS: What is the bigger picture? How does this connect to other concepts in the book? What should the reader do differently now that they understand this?',
      ],
      bestFor: 'expanding book sub-sections that need more depth, clarity, and narrative richness',
    },
    {
      id: 'addie',
      name: 'ADDIE Instructional Design',
      shortDescription: 'Analyze → Design → Develop → Implement → Evaluate',
      steps: [
        'ANALYZE: Who is the reader? What do they already know? What knowledge gap does this sub-section fill? What is the learning objective?',
        'DESIGN: How should the content be structured for maximum understanding? What sequence of ideas, examples, and activities will build knowledge most effectively?',
        'DEVELOP: What specific content, examples, and exercises will achieve the learning objective? Draft the key explanations and illustrations.',
        'IMPLEMENT: How will the reader apply this knowledge? What specific task, reflection, or real-world exercise bridges the gap between learning and doing?',
        'EVALUATE: How will the reader know they have understood? What self-check or test of understanding validates the learning?',
      ],
      bestFor: 'ensuring book sub-sections are pedagogically sound and genuinely teach the reader',
    },
    {
      id: 'case-method',
      name: 'Case Method',
      shortDescription: 'Situation → Challenge → Analysis → Decision → Outcome → Lesson',
      steps: [
        'SITUATION: Set up the real-world context — who is involved, what is the environment, what constraints exist? Paint a vivid picture.',
        'CHALLENGE: What problem or decision did the protagonist face? What made it difficult? What tensions or trade-offs were at play?',
        'ANALYSIS: Walk through the thinking process — what information was gathered, what options were considered, what criteria were applied?',
        'DECISION: What was chosen and why? What was explicitly traded away? How was the decision communicated and executed?',
        'OUTCOME: What happened? Include both intended and unintended consequences. Be honest about what worked and what didn\'t.',
        'LESSON: What transferable principle does this case illustrate? How should the reader apply this to their own situation?',
      ],
      bestFor: 'turning abstract concepts into memorable, story-driven book content',
    },
  ],

  'cheat-sheets': [
    {
      id: 'feynman-technique',
      name: 'Feynman Technique',
      shortDescription: 'Explain simply → Identify gaps → Refine → Simplify further',
      steps: [
        'EXPLAIN SIMPLY: Can you explain this concept in plain language that a non-expert would understand? Write it out as if teaching a colleague.',
        'IDENTIFY GAPS: Where does the explanation break down? What parts are you hand-waving over or using jargon to cover complexity?',
        'REFINE: Go back to the source material for the parts you struggled with. Rebuild your understanding from first principles.',
        'SIMPLIFY FURTHER: Rewrite the explanation even more concisely. Use analogies, concrete examples, and the simplest possible language.',
      ],
      bestFor: 'deepening understanding of concepts and ensuring the cheat sheet entry is genuinely clear',
    },
    {
      id: 'blooms-taxonomy',
      name: "Bloom's Taxonomy",
      shortDescription: 'Remember → Understand → Apply → Analyze → Evaluate → Create',
      steps: [
        'REMEMBER: What are the key facts, terms, and definitions the reader must recall? What is the minimum viable knowledge?',
        'UNDERSTAND: Can the reader explain the concept in their own words? What analogies or comparisons help build intuition?',
        'APPLY: How does the reader use this concept in practice? What are the most common real-world applications?',
        'ANALYZE: How does this concept break down into components? How does it relate to and differ from similar concepts?',
        'EVALUATE: How does the reader judge when to use this concept vs. alternatives? What criteria guide the choice?',
        'CREATE: How can the reader combine this concept with others to solve novel problems or create new approaches?',
      ],
      bestFor: 'ensuring cheat sheet entries support learning at multiple cognitive levels',
    },
    {
      id: 'concept-mapping',
      name: 'Concept Mapping',
      shortDescription: 'Central concept → Relationships → Hierarchy → Cross-links',
      steps: [
        'CENTRAL CONCEPT: What is the core idea? Define it precisely and identify what makes it distinct from related concepts.',
        'RELATIONSHIPS: What other concepts is this directly connected to? Map the primary relationships — "is a type of", "depends on", "leads to", "contrasts with".',
        'HIERARCHY: Where does this concept sit in the larger knowledge structure? What are its parent categories and child concepts?',
        'CROSS-LINKS: What unexpected connections exist between this concept and concepts in other domains? These cross-links often yield the most valuable insights.',
        'PRACTICAL ANCHORS: What concrete examples, tools, or situations anchor this concept in the reader\'s daily work?',
      ],
      bestFor: 'building the "related concepts" connections and ensuring the cheat sheet forms a coherent knowledge map',
    },
  ],
}

export function getFrameworksForOutputType(outputType: string): DeepDiveFramework[] {
  return DEEP_DIVE_FRAMEWORKS[outputType] || DEEP_DIVE_FRAMEWORKS.questions
}
