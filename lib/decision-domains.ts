export const DECISION_DOMAINS = [
  {
    name: "Strategic Direction",
    description: "Decisions about vision, positioning, market entry or exit, competitive strategy, and long-term direction",
  },
  {
    name: "Resource Allocation",
    description: "Decisions about budget distribution, headcount, tooling investments, and where to invest versus divest",
  },
  {
    name: "Prioritization & Sequencing",
    description: "Decisions about what to do first, what to defer, how to sequence initiatives, and where to focus limited capacity",
  },
  {
    name: "Risk & Trade-offs",
    description: "Decisions about acceptable risk levels, speed-vs-quality trade-offs, cost-vs-capability balances, and uncertainty tolerance",
  },
  {
    name: "People & Organization",
    description: "Decisions about hiring, team structure, role definitions, delegation, skills investment, and culture shaping",
  },
  {
    name: "Technology & Infrastructure",
    description: "Decisions about platforms, build-vs-buy, architecture choices, tooling, and technical debt management",
  },
  {
    name: "Customer & Market",
    description: "Decisions about target segments, pricing, positioning, go-to-market approach, and customer experience trade-offs",
  },
  {
    name: "Process & Operations",
    description: "Decisions about workflows, standards, automation, operational models, and efficiency-vs-flexibility trade-offs",
  },
  {
    name: "Partnerships & Vendors",
    description: "Decisions about who to partner with, what to outsource, vendor selection, and collaboration models",
  },
  {
    name: "Governance & Compliance",
    description: "Decisions about policies, controls, approval flows, regulatory responses, and organizational accountability",
  },
  {
    name: "Communication & Transparency",
    description: "Decisions about what to share, when to communicate, with whom, through which channels, and how much to disclose",
  },
  {
    name: "Innovation & Experimentation",
    description: "Decisions about what to pilot, when to scale experiments, how to manage innovation risk, and when to kill initiatives",
  },
] as const

export type DecisionDomain = (typeof DECISION_DOMAINS)[number]
