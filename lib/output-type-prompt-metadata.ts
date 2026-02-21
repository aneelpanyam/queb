// ============================================================
// Built-in prompt metadata per output type.
// Provides preamble, generation process, quality bar, and
// anti-patterns that the assembly engine uses to produce
// high-quality structured prompts.
//
// These supplement the instruction directives — directives
// tell the AI WHAT to generate, while this metadata tells
// the assembly engine HOW to frame the generation.
// ============================================================

import type { PromptAssemblyOptions } from '@/lib/assemble-prompt'

export const BUILTIN_PROMPT_METADATA: Record<string, PromptAssemblyOptions> = {

  // ──────────────────────────────────────────────
  // QUESTION BOOK
  // ──────────────────────────────────────────────
  questions: {
    elementLabel: 'question',
    preamble:
      'You are generating a Question Book — a strategic thinking tool that helps professionals uncover blind spots, challenge assumptions, and discover the questions they should be asking but are not. Each question should change how the reader thinks about their situation.',
    generationProcess: [
      '1. ANALYZE — Read every context field. Identify the reader\'s role, domain, and constraints. Determine what assumptions someone in this position likely holds unchallenged.',
      '2. SCOPE — For this perspective, identify 3-5 angles that go beyond surface-level inquiry. Prioritize questions that expose hidden dependencies, second-order effects, or uncomfortable trade-offs the reader has not confronted.',
      '3. DRAFT — Write each question as a single, precise inquiry. Avoid compound questions (no "and/or"). Each supporting field must add independent value — the relevance note explains WHY, the infoPrompt explains WHERE to look, the actionSteps explain WHAT to do next.',
      '4. VERIFY — For each question, apply this test: "If I asked a senior practitioner in this exact context this question, would they pause and think — or would they have an instant answer?" If the answer is instant, the question is too shallow. Replace it.',
    ].join('\n'),
    qualityBar: [
      'Pause test — Would a senior practitioner in this exact role need to stop and think before answering? If the answer is obvious, the question is too shallow.',
      'Specificity — Does the question reference concepts, constraints, or dynamics specific to the provided context? A question that works equally well for any industry or role is too generic.',
      'Independence — Does each supporting field (relevance, infoPrompt, actionSteps, redFlags, keyMetrics) provide distinct, non-overlapping value? No field should restate another in different words.',
      'Actionable infoPrompt — Does the infoPrompt name specific data sources, reports, tools, or people to consult? "Look at your data" is a failure; "Pull your Q3 pipeline report from Salesforce and compare close rates by segment" is the standard.',
    ],
    antiPatterns: [
      'Yes/no questions — every question must require analysis, judgment, or investigation to answer properly.',
      'Generic management consulting questions ("How aligned is your strategy?" "What are your key risks?") — these could apply to anyone. Ground every question in the specific context.',
      'Compound questions joined by "and" or "or" — split them. Each question must have exactly one focus.',
      'Restating context as a question — "Given that you work in X, how do you handle X?" adds no value. The question must push beyond what the context already states.',
      'Vague infoPrompts like "consult relevant stakeholders" or "review your metrics" — always name the specific stakeholder role, metric, or data source.',
    ],
  },

  // ──────────────────────────────────────────────
  // CHECKLIST
  // ──────────────────────────────────────────────
  checklist: {
    elementLabel: 'item',
    preamble:
      'You are generating a Checklist — a practical execution tool that ensures nothing critical is missed. Each item should be concrete enough that someone could verify completion without subjective judgment.',
    generationProcess: [
      '1. ANALYZE — Read every context field. Identify the scope, constraints, and risk profile. Determine what categories of failure are most likely and most costly in this context.',
      '2. SCOPE — For this dimension, identify the specific activities, checks, and validations that practitioners in this context would need. Prioritize items where skipping them leads to real, measurable harm.',
      '3. DRAFT — Write each item as a clear, verifiable action. The item name should be a task, not a topic. The description explains execution, the verification method defines what "done" looks like, and common mistakes prevent the most frequent errors.',
      '4. VERIFY — For each item, apply this test: "Could two different people independently agree on whether this item is complete?" If the answer depends on interpretation, make the item more specific.',
    ].join('\n'),
    qualityBar: [
      'Verifiability — Could someone hand this checklist to a colleague and have them confirm completion without asking clarifying questions? If any item requires interpretation, it needs tightening.',
      'Priority accuracy — Are High items truly blocking (failure to do them causes project failure)? Are Low items genuinely optional optimizations? Mislabeled priorities undermine the entire checklist.',
      'Mistake specificity — Does the commonMistakes field describe concrete errors ("Forgetting to invalidate the CDN cache after deployment") rather than vague warnings ("Not being thorough enough")?',
      'Completeness — Does the dimension cover all critical aspects, or are there obvious gaps a practitioner would notice?',
    ],
    antiPatterns: [
      'Aspirational items that cannot be checked off ("Maintain a culture of excellence") — every item must have a binary done/not-done state.',
      'Items so broad they encompass entire projects ("Set up monitoring") — break these down into specific, atomic checks.',
      'Uniform priority — if every item is High, nothing is High. Ensure realistic distribution across priority levels.',
      'Generic tips like "be thorough" or "double-check everything" — tips must be specific techniques or shortcuts from real practice.',
      'Verification methods that just restate the item ("Verify that the item is done") — describe the specific artifact, test, or approval.',
    ],
  },

  // ──────────────────────────────────────────────
  // EMAIL COURSE
  // ──────────────────────────────────────────────
  'email-course': {
    elementLabel: 'email',
    preamble:
      'You are generating an Email Course — a drip-delivered educational sequence where each email must earn the right to be opened and read. The reader is busy; every email must deliver immediate value and build toward a cumulative learning arc.',
    generationProcess: [
      '1. ANALYZE — Read every context field. Identify the audience, their current knowledge level, and the transformation this course promises. Map the knowledge gap between where they are and where the course takes them.',
      '2. SCOPE — For this module, determine the specific teaching points. Each email should have exactly one core lesson. Plan the emotional arc: hook curiosity early, deliver quick wins in the middle, build toward mastery.',
      '3. DRAFT — Write each email as a mini-lesson. Open with a hook (question, story, surprising fact), deliver the teaching in a scannable format, close with a clear call to action. Subject lines must create an open-worthy promise.',
      '4. VERIFY — For each email, apply this test: "If the reader only reads this one email and never opens another, did they still get something valuable they can use today?" If not, add a concrete takeaway.',
    ].join('\n'),
    qualityBar: [
      'Open-worthiness — Would the subject line make a busy professional stop scrolling in their inbox? If it sounds like a textbook chapter title, rewrite it with specificity or curiosity.',
      'Single teaching point — Does each email have exactly one clear lesson? If you cannot state the lesson in one sentence, the email is trying to do too much.',
      'Scannable structure — Can the reader extract the core value in 30 seconds by scanning? Use short paragraphs, bold key phrases, and clear visual breaks.',
      'Progressive arc — Does each email in the module build on the previous one? The sequence should feel like chapters, not disconnected tips.',
    ],
    antiPatterns: [
      'Textbook-chapter subject lines ("Module 2: Understanding Fundamentals") — subject lines must create curiosity or promise a specific benefit.',
      'Wall-of-text emails with no structural breaks — busy readers scan first. Use short paragraphs, bullets for key points, and bold for emphasis.',
      'Emails that teach theory without application — every email must include something the reader can do or try immediately.',
      'Generic calls to action ("Think about this") — CTAs must be specific and achievable ("Spend 15 minutes auditing your current X using the framework above").',
      'Identical tone across all emails — vary the approach: some emails can be story-driven, some list-driven, some challenge-driven.',
    ],
  },

  // ──────────────────────────────────────────────
  // PROMPT PACK
  // ──────────────────────────────────────────────
  prompts: {
    elementLabel: 'prompt',
    preamble:
      'You are generating a Prompt Pack — a collection of copy-paste-ready AI prompt templates that a professional can use immediately in ChatGPT, Claude, or similar tools. Each prompt must be a well-engineered template, not a simple question.',
    generationProcess: [
      '1. ANALYZE — Read every context field. Identify the reader\'s role, daily tasks, and the AI tools available to them. Determine where AI assistance would save the most time or produce the best results.',
      '2. SCOPE — For this use case, identify 3-5 specific scenarios where a well-crafted prompt produces dramatically better AI output than a naive request. Prioritize prompts for tasks the reader does frequently.',
      '3. DRAFT — Engineer each prompt using best practices: set a persona for the AI, provide structured context, specify the output format, include constraints and quality criteria. Use [bracketed placeholders] for user-specific inputs. The prompt itself should demonstrate expert prompt engineering.',
      '4. VERIFY — For each prompt, apply this test: "Could someone paste this into ChatGPT right now, fill in the placeholders in under 2 minutes, and get useful output on the first try?" If not, simplify the placeholders or add more built-in context.',
    ].join('\n'),
    qualityBar: [
      'Copy-paste readiness — Could someone use this prompt within 2 minutes of reading it? Placeholders must be clearly marked and easy to fill.',
      'Engineering quality — Does the prompt use at least 2 of: persona setting, output format specification, constraints, examples, or chain-of-thought instructions? A bare question is not a prompt template.',
      'Output predictability — Does the expectedOutput field set realistic expectations? The reader should know what they will get before they paste the prompt.',
      'Variation value — Do the variations serve genuinely different use cases (not just rephrasing)? Each variation should produce meaningfully different AI output.',
    ],
    antiPatterns: [
      'Prompts that are just reworded questions ("Tell me about X") — every prompt must include structural elements (persona, format, constraints) that make AI output better than a naive query.',
      'Overly complex prompts with 10+ placeholders — keep user input minimal (2-4 placeholders max). Bake domain context into the prompt itself.',
      'Missing output format specification — if the prompt does not tell the AI what format to respond in, the output will be unpredictable.',
      'Tips that just say "be specific" — tips must be concrete techniques ("Paste a sample of your writing style before the prompt so the AI matches your voice").',
      'Example outputs that are generic — the exampleOutput should be specific enough that the reader recognizes it as relevant to their context.',
    ],
  },

  // ──────────────────────────────────────────────
  // BATTLE CARDS
  // ──────────────────────────────────────────────
  'battle-cards': {
    elementLabel: 'card',
    preamble:
      'You are generating Battle Cards — concise, structured intelligence briefs designed to be pulled up in real-time during conversations, meetings, or decision-making moments. Each card must deliver actionable intelligence, not academic analysis.',
    generationProcess: [
      '1. ANALYZE — Read every context field. Identify the competitive landscape, the reader\'s position within it, and the specific decisions or conversations these cards will support.',
      '2. SCOPE — For this analytical lens, identify the specific subjects (competitors, approaches, technologies, or positions) that would produce the highest-value intelligence for the reader. Prioritize cards for situations the reader encounters frequently.',
      '3. DRAFT — Write each card with the assumption that the reader will pull it up mid-conversation. Strengths and weaknesses must be backed by structural reasoning, not opinion. Talking points must be conversational and natural. Objection handling must follow "When they say X, you say Y" format.',
      '4. VERIFY — For each card, apply this test: "Could a sales rep read this card during a 2-minute break in a meeting and immediately use the talking points?" If any point requires additional research to use, it is not ready.',
    ].join('\n'),
    qualityBar: [
      'Real-time usability — Could someone reference this card during a live conversation and extract useful talking points in under 30 seconds?',
      'Evidence-backed analysis — Are strengths and weaknesses supported by structural reasoning (market position, technology architecture, pricing model) rather than subjective opinion?',
      'Conversational talking points — Do the talking points sound like something a person would actually say in a meeting, not marketing copy from a website?',
      'Honest weakness analysis — Would an informed insider from the analyzed subject agree that the weaknesses identified are real, or would they dismiss them as strawman arguments?',
    ],
    antiPatterns: [
      'Strawman weakness analysis that no informed reader would take seriously — weaknesses must be real, structural, and defensible.',
      'Marketing copy disguised as talking points ("We offer best-in-class solutions") — talking points must be specific, evidence-based, and conversational.',
      'Missing or vague objection handling — if a card covers a contentious topic, "When they say X, you say Y" responses are mandatory.',
      'Analysis that reads like a Wikipedia article — battle cards are for action, not education. Every point must connect to what the reader should do or say.',
      'Balanced-to-the-point-of-uselessness analysis — it is acceptable to conclude that one side has a clear advantage. False balance dilutes intelligence value.',
    ],
  },

  // ──────────────────────────────────────────────
  // DECISION BOOK
  // ──────────────────────────────────────────────
  'decision-books': {
    elementLabel: 'decision',
    preamble:
      'You are generating a Decision Book — a structured guide to the hard choices that must be navigated in this context. Each decision should surface genuine trade-offs where reasonable people could disagree, not obvious choices with clear answers.',
    generationProcess: [
      '1. ANALYZE — Read every context field. Identify the reader\'s role, authority level, and constraints. Determine what organizational, strategic, and operational decisions they face that have real consequences if made poorly.',
      '2. SCOPE — For this decision domain, identify 3-5 specific decisions that are genuinely difficult — where the "right" answer depends on priorities, constraints, and values that the reader must weigh. Avoid decisions with obvious answers.',
      '3. DRAFT — Frame each decision as a real choice between viable alternatives. Present options honestly, including the status quo. Criteria should be specific enough that the reader can actually use them to evaluate options. The recommendation should be reasoned, not dogmatic.',
      '4. VERIFY — For each decision, apply this test: "Could two competent leaders with different priorities legitimately choose different options?" If one option is obviously superior, the decision is not hard enough. Reframe it to expose the real trade-off.',
    ].join('\n'),
    qualityBar: [
      'Genuine difficulty — Could two competent leaders with different priorities legitimately choose different options? If one option is obviously best, the decision is too easy. Find the real trade-off.',
      'Concrete options — Are the alternatives specific enough to evaluate? "Invest in technology" is not an option; "Adopt platform X at $Y/month, requiring Z weeks of migration" is.',
      'Weighted criteria — Are the decision criteria specific to this decision and weighted by importance, or are they generic factors that apply to everything?',
      'Honest stakeholder analysis — Does the stakeholders field identify specific roles and their likely positions, not just generic categories ("management")?',
    ],
    antiPatterns: [
      'False decisions with obvious answers ("Should we improve quality or not?") — every decision must present genuinely viable alternatives with real trade-offs.',
      'Generic management criteria ("consider cost, speed, and quality") — criteria must be specific to this decision in this context.',
      'Options that are actually different levels of the same thing ("Do a little X, do medium X, do a lot of X") — present structurally different approaches.',
      'Recommendations that hedge into meaninglessness ("It depends on your priorities") — commit to a reasoned position while acknowledging under what conditions an alternative would be better.',
      'Ignoring the status quo as an option — maintaining the current approach is always an alternative and must be explicitly evaluated.',
    ],
  },

  // ──────────────────────────────────────────────
  // DOSSIER
  // ──────────────────────────────────────────────
  dossier: {
    elementLabel: 'briefing',
    preamble:
      'You are generating a Dossier — a collection of intelligence briefings designed for decision-makers who need to understand a situation quickly and act on it. Each briefing must separate facts from analysis, signal from noise, and assessment from speculation.',
    generationProcess: [
      '1. ANALYZE — Read every context field. Identify who the intelligence consumer is, what decisions they face, and what they need to know to act. The dossier exists to inform action, not to be comprehensive for its own sake.',
      '2. SCOPE — For this intelligence area, determine the most decision-relevant findings. Prioritize signals that would change what the reader does over interesting-but-inactionable observations.',
      '3. DRAFT — Write each briefing in the style of an analyst memo. Lead with the so-what (executive summary), then present evidence-backed findings, then draw out implications. Distinguish clearly between confirmed facts, strong indicators, and analytical assessments.',
      '4. VERIFY — For each briefing, apply this test: "After reading this, does the decision-maker know something they did not know before AND know what to do differently because of it?" If either part fails, sharpen the findings or implications.',
    ].join('\n'),
    qualityBar: [
      'Decision relevance — Does each briefing inform a specific decision or action, or is it just interesting background? Every briefing must have a "so what" that connects to something the reader should do.',
      'Evidence grounding — Are key findings backed by named types of evidence (market reports, regulatory filings, observable product changes), not just assertions?',
      'Confidence calibration — Are analytical assessments distinguished from confirmed facts? Does the briefing flag uncertainty where it exists rather than projecting false confidence?',
      'Actionable implications — Do the strategic implications tell the reader what to change, not just what to think about?',
    ],
    antiPatterns: [
      'Generic industry overviews that could come from a Wikipedia article — every finding must be specific to the context provided.',
      'Mixing facts and opinions without labeling which is which — maintain clear analytical discipline throughout.',
      'Briefings that identify risks but never opportunities (or vice versa) — always cover both sides.',
      'Evidence fields that say "industry reports and expert analysis" — name the specific types of sources, reports, or signals.',
      'Implications that stop at "monitor this closely" — that is not a strategic implication. State what should change.',
    ],
  },

  // ──────────────────────────────────────────────
  // PLAYBOOK
  // ──────────────────────────────────────────────
  playbook: {
    elementLabel: 'play',
    preamble:
      'You are generating a Playbook — a field-tested execution guide that someone can follow to achieve specific outcomes. Each play must be detailed enough to execute without asking a colleague for clarification.',
    generationProcess: [
      '1. ANALYZE — Read every context field. Identify the team\'s capabilities, constraints, timeline, and the outcomes they need to achieve. Determine what makes execution in this context different from the generic case.',
      '2. SCOPE — For this phase, identify the specific plays that would have the highest impact given the context. Include both "standard" plays that must be run well and "differentiator" plays that create outsized results.',
      '3. DRAFT — Write each play as an operator\'s manual. The objective is the destination, the instructions are the route, the decision criteria handle forks in the road, and the pitfalls are the potholes. Number every step. Name every tool.',
      '4. VERIFY — For each play, apply this test: "Could someone who just joined the team follow these instructions without asking a single clarifying question?" If any step is ambiguous, add specificity.',
    ].join('\n'),
    qualityBar: [
      'Self-contained executability — Could a competent person follow the instructions without prior context or additional research? Every step must be specific enough to act on.',
      'Realistic time estimates — Do the time estimates account for the context (team size, existing infrastructure, approval processes), not just the raw work?',
      'Decision criteria clarity — At every fork in the road, is it clear which path to take based on observable signals? "Use your judgment" is not a decision criterion.',
      'Pitfall specificity — Do the common pitfalls describe specific failure scenarios ("Running the migration during peak hours because the cron job was set to UTC not local time") rather than vague warnings?',
    ],
    antiPatterns: [
      'Instructions so vague they could mean anything ("Set up the infrastructure") — break every step into specific, named actions with specific tools.',
      'Generic process advice that applies to everything ("Communicate with stakeholders") — every play must be specific to the context and phase.',
      'Missing decision criteria at key branching points — if a play has conditional paths, the signals for each path must be explicit.',
      'Pro tips that are common knowledge ("Plan ahead", "Test before deploying") — tips must be insider knowledge that only comes from experience.',
      'Time estimates without context sensitivity — "2-4 hours" means nothing without specifying what team size and tooling is assumed.',
    ],
  },

  // ──────────────────────────────────────────────
  // CHEAT SHEET
  // ──────────────────────────────────────────────
  'cheat-sheets': {
    elementLabel: 'entry',
    preamble:
      'You are generating a Cheat Sheet — a high-density quick-reference tool optimized for speed. The reader already has some familiarity with the domain; they need fast recall, not comprehensive education. Every word must earn its place.',
    generationProcess: [
      '1. ANALYZE — Read every context field. Identify the reader\'s domain, role, and what they need to reference quickly during their work.',
      '2. SCOPE — For this category, identify the terms and concepts that practitioners look up most frequently. Prioritize entries by reference frequency — things people need to recall in the middle of doing work.',
      '3. DRAFT — Write each entry for speed of consumption. Definitions should be 1-3 sentences max. Examples must be concrete and immediately recognizable. Quick tips should be the kind of one-liner an expert shares over coffee.',
      '4. VERIFY — For each entry, apply this test: "Can the reader find and absorb the information they need in under 10 seconds?" If not, trim ruthlessly. Density is the primary virtue of a cheat sheet.',
    ].join('\n'),
    qualityBar: [
      '10-second rule — Can the reader find and absorb the key information from any entry in under 10 seconds? If not, it is too long.',
      'Practitioner-level examples — Do the examples reflect real usage in the given context, not textbook illustrations?',
      'Reference frequency — Are the entries ordered by how often a practitioner would actually look them up during real work?',
      'Quick tip memorability — Is the quick tip something someone would actually remember and repeat? If it is generic advice, replace it with a specific technique.',
    ],
    antiPatterns: [
      'Textbook-length definitions — this is a cheat sheet, not an encyclopedia. 1-3 sentences maximum per definition.',
      'Entries for concepts the target audience already knows well — focus on things they need to look up, not things they use daily without thinking.',
      'Examples that require lengthy explanation to understand — examples should be self-evident to someone in this context.',
      'Quick tips that are generic advice ("Practice regularly") — tips must be specific, memorable, and immediately applicable.',
      'Alphabetical ordering — order by reference frequency and practical importance, not alphabetically.',
    ],
  },

  // ──────────────────────────────────────────────
  // AGENT BOOK
  // ──────────────────────────────────────────────
  'agent-book': {
    elementLabel: 'agent',
    preamble:
      'You are generating an Agent Book — a catalog of AI agent ideas that the reader could realistically build or procure for their specific workflow. Each agent must be grounded in real tools and APIs, not science fiction.',
    generationProcess: [
      '1. ANALYZE — Read every context field. Identify the reader\'s workflow, tools, pain points, and technical sophistication. Determine which parts of their workflow have the highest automation potential given current AI capabilities.',
      '2. SCOPE — For this opportunity area, identify 3-5 agent ideas that span a complexity range (from "build it this afternoon with Zapier" to "multi-month engineering project"). Prioritize agents that address real, frequent pain points over impressive-sounding but rarely-needed capabilities.',
      '3. DRAFT — Design each agent with architectural specificity. Name the trigger, the data sources, the processing steps, the tools/APIs involved, and the output. The quickStart field must be a concrete first step, not a suggestion to "explore options."',
      '4. VERIFY — For each agent, apply this test: "Could someone with the stated context and tools actually build a v1 of this agent using today\'s technology?" If the answer requires technology that does not exist yet, redesign it with current tools.',
    ].join('\n'),
    qualityBar: [
      'Technical feasibility — Could this agent be built with today\'s tools and APIs? Every capability described must be possible with named, existing platforms.',
      'Architecture specificity — Does the howItWorks field describe a concrete pipeline (trigger → data → processing → output), or is it hand-waving about "AI processing"?',
      'Honest complexity rating — Does the complexity rating match the actual engineering effort, or is it understated to make the idea sound easy?',
      'Quantified impact — Does the expectedImpact field include at least one specific metric (hours saved, error rate reduction, throughput increase)?',
    ],
    antiPatterns: [
      'Science fiction agents that require technology that does not exist — every agent must be buildable with current tools.',
      'Vague architecture descriptions ("The agent uses AI to process data") — name the specific APIs, models, platforms, and data flows.',
      'Generic names like "Email Agent" or "Data Helper" — names should be memorable and descriptive of what the agent specifically does.',
      'QuickStart steps that say "research options" or "evaluate platforms" — the first step must be a concrete action ("Sign up for Make.com and create a scenario that triggers on new Salesforce leads").',
      'All agents at the same complexity level — include at least one quick-win (Low) and one ambitious (High) idea.',
    ],
  },

  // ──────────────────────────────────────────────
  // E-BOOK
  // ──────────────────────────────────────────────
  ebook: {
    elementLabel: 'section',
    preamble:
      'You are generating an e-Book chapter — long-form educational content that teaches through narrative, explanation, and illustration. Each sub-section must read like a published book, not a blog post or bullet-point summary. The reader is investing significant time; reward that investment with depth and insight.',
    generationProcess: [
      '1. ANALYZE — Read every context field. Identify the reader\'s knowledge level, their daily challenges, and the transformation this book promises. Determine where the biggest knowledge gaps are between their current state and the book\'s promise.',
      '2. SCOPE — For this chapter, plan the narrative arc: what does the reader believe at the start, what new understanding do they gain, and how does each sub-section build toward that shift? Map the emotional journey alongside the intellectual one.',
      '3. DRAFT — Write each sub-section as flowing prose (400-800 words). Open with context that meets the reader where they are. Build to the key insight through explanation and illustration. Close with practical application. Use transitions between paragraphs. Vary sentence length for rhythm.',
      '4. VERIFY — For each sub-section, apply this test: "Does this read like a chapter from a published book by a respected author, or does it read like AI-generated content?" Check for: natural transitions, concrete examples (not abstract platitudes), a clear teaching point, and prose that flows rather than lists masquerading as paragraphs.',
    ].join('\n'),
    qualityBar: [
      'Book-quality prose — Does the content read like a published book by a respected practitioner? Natural transitions, varied sentence structure, concrete illustrations, and a clear authorial voice are required.',
      'Teaching effectiveness — After reading a sub-section, could the reader explain the core concept to a colleague in their own words? If the content is too abstract, add grounding examples.',
      'Practical example realism — Does the practical example use realistic names, numbers, timelines, and scenarios from the reader\'s world, or is it a generic illustration?',
      'Action item achievability — Could the reader complete the action item in 60 minutes or less with tools they already have?',
    ],
    antiPatterns: [
      'Bullet-point lists masquerading as long-form prose — this is a book. Write in paragraphs with transitions. Lists are acceptable only as brief interludes within flowing prose.',
      'Abstract platitudes without concrete illustration ("Innovation is important for modern businesses") — every concept must be grounded with a specific example, scenario, or case.',
      'Sub-sections that rehash the chapter introduction — each sub-section must advance the reader\'s understanding, not restate what they already know.',
      'Action items that are just "reflect on what you learned" — action items must be specific tasks with clear deliverables.',
      'Corporate-textbook tone — write as an experienced practitioner sharing knowledge with a respected peer, not as a professor lecturing students.',
    ],
  },
}
