export const PROMPT_USE_CASES = [
  {
    name: "Research & Discovery",
    description: "Gathering information, market intelligence, competitive analysis, and landscape mapping",
  },
  {
    name: "Analysis & Diagnosis",
    description: "Breaking down complex problems, root cause analysis, pattern recognition, and data interpretation",
  },
  {
    name: "Strategy & Planning",
    description: "Setting direction, creating plans, defining roadmaps, and making strategic decisions",
  },
  {
    name: "Communication & Writing",
    description: "Drafting emails, reports, proposals, presentations, and stakeholder communications",
  },
  {
    name: "Decision Support",
    description: "Evaluating options, building business cases, scenario modeling, and trade-off analysis",
  },
  {
    name: "Process Design & Optimization",
    description: "Creating workflows, improving processes, identifying bottlenecks, and automation opportunities",
  },
  {
    name: "Stakeholder Management",
    description: "Preparing for meetings, navigating objections, building alignment, and managing expectations",
  },
  {
    name: "Problem Solving & Troubleshooting",
    description: "Diagnosing issues, generating solutions, evaluating fixes, and preventing recurrence",
  },
  {
    name: "Learning & Skill Building",
    description: "Explaining concepts, creating study guides, generating practice scenarios, and knowledge synthesis",
  },
  {
    name: "Creative & Ideation",
    description: "Brainstorming, innovation workshops, reframing challenges, and generating novel approaches",
  },
] as const

export type PromptUseCase = (typeof PROMPT_USE_CASES)[number]
