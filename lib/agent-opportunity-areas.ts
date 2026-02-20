export const AGENT_OPPORTUNITY_AREAS = [
  {
    name: "Research & Intelligence Gathering",
    description: "Agents that find, synthesize, and surface relevant information — market signals, competitor moves, prospect data, or internal knowledge — so the user can make better decisions faster",
  },
  {
    name: "Outreach & Communication",
    description: "Agents that draft, personalize, sequence, and manage communication workflows — emails, messages, proposals, and follow-ups — across channels and contacts",
  },
  {
    name: "Content Creation & Personalization",
    description: "Agents that generate, adapt, or curate content for different audiences, formats, and channels — from social posts to presentations to training materials",
  },
  {
    name: "Data Analysis & Reporting",
    description: "Agents that monitor, analyze, and summarize data into actionable insights — dashboards, trend reports, anomaly detection, and performance summaries",
  },
  {
    name: "Scheduling & Coordination",
    description: "Agents that manage calendars, meetings, follow-ups, handoffs, and task sequencing — keeping workflows moving without manual nudging",
  },
  {
    name: "Monitoring & Alerts",
    description: "Agents that watch for signals, triggers, or anomalies and notify proactively — price changes, mention spikes, SLA breaches, or deadline risks",
  },
  {
    name: "Process Automation & Workflows",
    description: "Agents that orchestrate multi-step processes end-to-end — approvals, onboarding flows, data pipelines, or any repeatable sequence of tasks",
  },
  {
    name: "Quality Assurance & Review",
    description: "Agents that check, validate, score, or audit work output — catching errors, enforcing standards, and flagging risks before they reach stakeholders",
  },
  {
    name: "Training & Knowledge Management",
    description: "Agents that capture, organize, and deliver institutional knowledge — onboarding guides, FAQ bots, lesson summaries, and skill gap analysis",
  },
  {
    name: "Customer & Stakeholder Engagement",
    description: "Agents that manage relationships, track sentiment, personalize interactions, and surface engagement opportunities across the customer or stakeholder lifecycle",
  },
] as const

export type AgentOpportunityArea = (typeof AGENT_OPPORTUNITY_AREAS)[number]
