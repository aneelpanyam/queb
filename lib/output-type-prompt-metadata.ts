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
      'You are generating a Question Book — a Thinking Companion that helps someone explore a topic deeply through multiple lenses. The purpose is to uncover blind spots, challenge assumptions, and reveal the questions a thoughtful person should be asking but often is not. Each question should help the reader see the topic differently and think more rigorously about it.',
    generationProcess: [
      '1. CONTEXT ANALYSIS — Read every context field carefully. Identify the topic, environment, stakeholders, constraints, and implied goals. Infer what someone engaging with this topic likely assumes or overlooks.',
      '2. SYSTEM MAPPING — Identify the important forces shaping this topic: actors, incentives, dependencies, risks, trade-offs, time horizons, and uncertainties. Determine what makes this situation complex.',
      '3. LENS INTERPRETATION — For the given perspective, determine how the topic should be examined through that lens. Clarify what becomes visible from this angle that may be invisible from others.',     
      '4. INSIGHT TARGETING — Identify 3–5 angles that go beyond surface-level inquiry. Prioritize questions that expose hidden dependencies, second-order effects, competing incentives, or uncomfortable trade-offs.',
      '5. DRAFT — Write each question as a single, precise inquiry. Avoid compound questions. Each supporting field must add independent value: the relevance explains WHY the question matters, the infoPrompt explains WHERE to look for evidence, and the actionSteps explain WHAT to do next.',
      '6. DEPTH TEST — Ask: "Would someone seriously engaged with this topic need to stop and think before answering?" If the answer is immediate, the question is too shallow. Replace it.',
      '7. LENS DISTINCTIVENESS TEST — Ask: "Could this question belong equally under another perspective?" If yes, it is too generic. Strengthen the lens specificity.',
    ].join('\n'),
  
    qualityBar: [
      'Depth — A thoughtful reader would need reflection, analysis, or investigation to answer.',
      'Lens Clarity — The question clearly reflects the assigned perspective and would not fit equally well elsewhere.',
      'Specificity — The question references dynamics relevant to the provided context. Questions that work for any topic are failures.',
      'Insight Potential — The question has the potential to change how the reader understands the situation.',
      'Independence — Supporting fields (relevance, infoPrompt, actionSteps, redFlags, keyMetrics) provide distinct value without repetition.',
      'Actionable infoPrompt — Names specific sources, data, tools, or stakeholders to consult.',
      'Lens Coverage — Across the full Question Book, ensure that different perspectives illuminate meaningfully different aspects of the topic. Avoid repeating the same underlying question with different wording.',
    ],
  
    antiPatterns: [
      'Yes/no questions — every question must require reasoning or investigation.',
      'Generic questions ("What are the challenges?" "What are the opportunities?") that apply universally.',
      'Compound questions joined by "and" or "or". Each question must have one focus.',
      'Restating the topic as a question.',
      'Questions disconnected from implications, decisions, or consequences.',
      'Vague infoPrompts such as "look at your data" or "consult stakeholders". Always specify.',
    ]
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
  'crossword-puzzles': {
    elementLabel: 'word',
    preamble:
      'You are generating a crossword puzzle word list for a children\'s activity book. Each theme produces one crossword puzzle. Your job is to generate the best possible vocabulary with fun, educational clues — a separate algorithm will handle arranging words into the grid.',
    generationProcess: [
      '1. ANALYZE — Read every context field. Identify the place, the target age group, and the difficulty level. Research what makes this place unique, memorable, and educational for young visitors.',
      '2. SCOPE — For this theme, brainstorm 15-20 candidate words, then select the best 10-15. Prioritize words that: (a) are specifically tied to this place, (b) a child visiting would actually encounter, (c) teach something educational, and (d) work well in a crossword grid (good letter variety, intersecting potential).',
      '3. DRAFT — For each word, write a clue that is fun, educational, and age-appropriate. The clue should teach the child something they would discover during a real visit. Include difficulty rating and a short hint.',
      '4. VERIFY — Check every word: (a) Is it a single word with no spaces or special characters? (b) Is it uppercase A-Z only? (c) Is it specifically connected to this place? (d) Is the clue fun and informative, not dry? (e) Is there good variety in word lengths?',
    ].join('\n'),
    qualityBar: [
      'Place specificity — Would this word list only make sense for this particular place? If the same words could describe any city or park, they are too generic.',
      'Age appropriateness — Could a child in the target age group realistically know or learn these words during a visit? No obscure academic vocabulary.',
      'Clue quality — Are the clues fun and educational? Each clue should make the child say "Oh, cool!" not "This is boring."',
      'Grid compatibility — Is there good variety in word lengths (mix of short and long)? Do many words share common letters (E, S, T, R, A, N) that enable crossword intersections?',
    ],
    antiPatterns: [
      'Multi-word answers or words with spaces/hyphens — every answer must be exactly one word, uppercase A-Z only.',
      'Generic travel vocabulary (HOTEL, AIRPORT, TOURIST) that applies to any destination — every word must be place-specific.',
      'Dry, dictionary-style clues ("A large mammal") — clues should be enthusiastic, kid-friendly, and teach something about the place.',
      'All words the same length — include a deliberate mix from 3 to 10 letters for grid layout variety.',
      'Words that are too obscure for children — if a word requires adult-level domain knowledge, replace it with something a child could learn during their visit.',
    ],
  },

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

  workbook: {
    elementLabel: 'question',
    preamble:
      'You are generating workbook questions — engaging, clearly-worded exercises with short write-in answers. Each topic section produces a set of questions that readers answer in blank boxes on the page. The answer key at the back rewards them with fun facts. Your job is to make learning feel like a game, not a test.',
    generationProcess: [
      '1. ANALYZE — Read every context field. Identify the subject, audience age/level, and what the workbook is trying to teach. Understand what the reader already knows vs. what they should learn.',
      '2. SCOPE — For this topic, brainstorm 12-15 candidate questions, then select the best 6-10. Prioritize questions that: (a) teach something specific, (b) have a clear short answer, (c) vary in difficulty and format, and (d) would genuinely engage the target audience.',
      '3. DRAFT — Write each question clearly and directly. Craft the answer to be 1-15 words. Write a fun fact (1-2 sentences) that adds surprising bonus knowledge related to the answer. Rate difficulty as easy/medium/hard.',
      '4. VERIFY — For each question: (a) Is the question unambiguous? Could it have only one reasonable answer? (b) Is the answer genuinely short enough for a write-in box? (c) Is the fun fact actually surprising and educational? (d) Is there good variety across question types and difficulty levels?',
    ].join('\n'),
    qualityBar: [
      'Answer brevity — Every answer must fit in a small write-in box (1-15 words). If you need a longer answer, rephrase the question to ask for a specific fact, name, or number.',
      'Question clarity — A reader should understand exactly what is being asked on the first read. No ambiguous phrasing, double negatives, or overly complex sentence structure.',
      'Engagement variety — The set should mix formats: direct factual questions, true/false, fill-in-the-blank, estimation, comparison, and creative thinking. Monotony kills motivation.',
      'Fun fact quality — Each fun fact should make the reader say "Wow, I didn\'t know that!" Generic statements ("This is interesting because…") are not fun facts.',
    ],
    antiPatterns: [
      'Long answers that won\'t fit in a write-in box — if the natural answer is a paragraph, rephrase the question to target a specific short fact.',
      'Ambiguous questions with multiple valid answers — unless intentionally open-ended, each question should have one clear correct answer.',
      'All questions at the same difficulty — include a deliberate mix of easy recall, medium understanding, and hard critical-thinking questions.',
      'Boring fun facts that just restate the answer ("The answer is X because X is important") — fun facts should add genuinely new and surprising information.',
      'Test-like tone ("Which of the following…") — this is an activity book, not a standardized exam. Questions should feel fun and curious.',
    ],
  },
}
