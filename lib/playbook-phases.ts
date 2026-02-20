export const PLAYBOOK_PHASES = [
  {
    name: "Preparation & Prerequisites",
    description: "Everything needed before starting — inputs, approvals, resources, skills, and readiness checks",
  },
  {
    name: "Foundation & Setup",
    description: "Initial setup steps — environment configuration, stakeholder alignment, baseline establishment, and kickoff activities",
  },
  {
    name: "Core Execution",
    description: "The primary work — step-by-step instructions for the main activities, processes, and deliverables",
  },
  {
    name: "Stakeholder Management",
    description: "Engaging the right people — communication cadences, escalation paths, feedback loops, and alignment checkpoints",
  },
  {
    name: "Quality Gates & Checkpoints",
    description: "Validation points — reviews, approvals, acceptance criteria, and go/no-go decision moments",
  },
  {
    name: "Exception Handling",
    description: "When things go wrong — troubleshooting guides, fallback procedures, edge cases, and recovery playbooks",
  },
  {
    name: "Scaling & Optimization",
    description: "Going from working to working well — performance tuning, capacity planning, and efficiency improvements",
  },
  {
    name: "Communication & Reporting",
    description: "Keeping everyone informed — status reports, dashboards, stakeholder updates, and documentation requirements",
  },
  {
    name: "Measurement & Review",
    description: "Tracking success — KPIs, metrics, retrospectives, lessons learned, and continuous improvement loops",
  },
  {
    name: "Handoff & Closeout",
    description: "Wrapping up — transition of ownership, final documentation, archival, and post-completion follow-ups",
  },
] as const

export type PlaybookPhase = (typeof PLAYBOOK_PHASES)[number]
