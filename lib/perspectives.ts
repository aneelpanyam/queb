export const BUSINESS_PERSPECTIVES = [
  {
    name: "Strategic Perspective",
    description: "Alignment with long-term goals, vision, mission, and competitive positioning"
  },
  {
    name: "Financial Perspective",
    description: "Revenue impact, cost implications, budget considerations, ROI, and profitability"
  },
  {
    name: "Customer Perspective",
    description: "Customer experience, satisfaction, retention, value delivery, and loyalty"
  },
  {
    name: "Operational Perspective",
    description: "Process efficiency, workflows, resource utilization, and day-to-day execution"
  },
  {
    name: "Risk & Compliance Perspective",
    description: "Regulatory compliance, risk assessment, mitigation strategies, and governance"
  },
  {
    name: "People & Culture Perspective",
    description: "Team dynamics, talent management, morale, skills development, and organizational culture"
  },
  {
    name: "Innovation & Growth Perspective",
    description: "New opportunities, emerging trends, R&D, creative solutions, and market expansion"
  },
  {
    name: "Technology Perspective",
    description: "Technical feasibility, digital transformation, tools, systems, and infrastructure"
  },
  {
    name: "Data & Analytics Perspective",
    description: "Metrics, KPIs, data-driven decisions, measurement, and reporting"
  },
  {
    name: "Stakeholder Perspective",
    description: "Expectations and needs of investors, board members, partners, and regulators"
  },
  {
    name: "Competitive Perspective",
    description: "Market positioning, competitor analysis, differentiation, and benchmarking"
  },
  {
    name: "Ethical & Social Responsibility Perspective",
    description: "Ethical considerations, social impact, sustainability, diversity, and inclusion"
  },
  {
    name: "Change Management Perspective",
    description: "Adoption, resistance, communication, transition planning, and organizational readiness"
  },
  {
    name: "Quality Perspective",
    description: "Standards, continuous improvement, defect prevention, and excellence"
  },
  {
    name: "Supply Chain & Vendor Perspective",
    description: "Supplier relationships, procurement, logistics, partnerships, and dependencies"
  },
  {
    name: "Legal Perspective",
    description: "Contracts, intellectual property, liability, regulatory requirements, and legal obligations"
  },
  {
    name: "Communication Perspective",
    description: "Internal and external messaging, transparency, branding, and information flow"
  },
  {
    name: "Scalability Perspective",
    description: "Growth capacity, resource scaling, system elasticity, and long-term sustainability"
  },
  {
    name: "Time & Priority Perspective",
    description: "Urgency, deadlines, sequencing, opportunity cost, and resource allocation over time"
  },
  {
    name: "User Experience Perspective",
    description: "Usability, accessibility, design thinking, user journeys, and satisfaction"
  },
  {
    name: "Knowledge Management Perspective",
    description: "Documentation, institutional knowledge, learning, best practices, and knowledge transfer"
  },
  {
    name: "Cross-Functional Perspective",
    description: "Inter-departmental collaboration, dependencies, alignment, and shared objectives"
  },
  {
    name: "Sustainability & Environmental Perspective",
    description: "Environmental impact, green practices, carbon footprint, and long-term ecological responsibility"
  },
  {
    name: "Crisis & Continuity Perspective",
    description: "Business continuity, disaster recovery, contingency planning, and resilience"
  },
  {
    name: "Market & Industry Perspective",
    description: "Industry trends, market dynamics, economic conditions, and sector-specific considerations"
  },
] as const

export type PerspectiveDef = (typeof BUSINESS_PERSPECTIVES)[number]
