export const DOSSIER_SECTIONS = [
  {
    name: "Overview & Background",
    description: "Foundational context — history, origins, mission, and the broader landscape this subject operates within",
  },
  {
    name: "Key Players & Stakeholders",
    description: "Leadership, decision-makers, influencers, partners, and key relationships that shape direction and outcomes",
  },
  {
    name: "Market Position & Dynamics",
    description: "Market share, competitive standing, target segments, positioning strategy, and market trends affecting this subject",
  },
  {
    name: "Financial & Business Model",
    description: "Revenue streams, cost structure, funding, profitability, financial health indicators, and business model mechanics",
  },
  {
    name: "Products & Services",
    description: "Core offerings, product portfolio, service capabilities, differentiation, and value proposition",
  },
  {
    name: "Strengths & Vulnerabilities",
    description: "Core competencies, competitive advantages, known weaknesses, capability gaps, and areas of exposure",
  },
  {
    name: "Strategic Direction & Roadmap",
    description: "Stated strategy, growth plans, announced initiatives, investment signals, and likely future moves",
  },
  {
    name: "Technology & Infrastructure",
    description: "Technology stack, platforms, digital capabilities, innovation posture, and technical strengths or debts",
  },
  {
    name: "Regulatory & Compliance Landscape",
    description: "Regulatory environment, compliance obligations, legal exposure, industry standards, and governance posture",
  },
  {
    name: "Risks & Threats",
    description: "External threats, internal risks, market disruptions, dependency risks, and scenarios that could destabilize this subject",
  },
  {
    name: "Opportunities & Entry Points",
    description: "Exploitable gaps, partnership openings, market white spaces, timing advantages, and strategic leverage points",
  },
] as const

export type DossierSection = (typeof DOSSIER_SECTIONS)[number]
