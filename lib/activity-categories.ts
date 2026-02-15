export const ACTIVITY_CATEGORIES = [
  {
    category: "Planning & Strategy",
    description: "Defining objectives, setting direction, and making forward-looking decisions",
    exampleActivities: [
      "Setting goals and OKRs",
      "Creating roadmaps",
      "Budgeting and forecasting",
      "Strategic planning",
      "Prioritization and trade-off decisions",
    ],
  },
  {
    category: "Execution & Delivery",
    description: "Carrying out core work, producing outputs, and delivering on commitments",
    exampleActivities: [
      "Producing deliverables",
      "Managing projects and timelines",
      "Meeting deadlines",
      "Implementing solutions",
      "Day-to-day task execution",
    ],
  },
  {
    category: "Analysis & Decision-Making",
    description: "Gathering information, evaluating options, and making informed choices",
    exampleActivities: [
      "Data analysis and interpretation",
      "Problem diagnosis",
      "Risk assessment",
      "Evaluating proposals or vendors",
      "Making recommendations",
    ],
  },
  {
    category: "Communication & Reporting",
    description: "Sharing information, presenting findings, and keeping stakeholders informed",
    exampleActivities: [
      "Status reporting",
      "Presenting to leadership",
      "Writing documentation",
      "Cross-team communication",
      "Client or stakeholder updates",
    ],
  },
  {
    category: "Collaboration & Coordination",
    description: "Working with others, aligning efforts, and managing dependencies",
    exampleActivities: [
      "Cross-functional collaboration",
      "Facilitating meetings",
      "Coordinating with vendors or partners",
      "Alignment sessions",
      "Handoffs and transitions",
    ],
  },
  {
    category: "People & Team Management",
    description: "Leading, developing, and supporting individuals and teams",
    exampleActivities: [
      "Performance reviews",
      "Hiring and onboarding",
      "Coaching and mentoring",
      "Conflict resolution",
      "Team building",
    ],
  },
  {
    category: "Process & Quality Improvement",
    description: "Optimizing workflows, establishing standards, and driving continuous improvement",
    exampleActivities: [
      "Process design or redesign",
      "Quality audits",
      "Establishing best practices",
      "Automation opportunities",
      "Retrospectives and lessons learned",
    ],
  },
  {
    category: "Stakeholder & Relationship Management",
    description: "Building relationships, managing expectations, and navigating organizational dynamics",
    exampleActivities: [
      "Managing client relationships",
      "Negotiating agreements",
      "Stakeholder engagement",
      "Expectation setting",
      "Escalation management",
    ],
  },
  {
    category: "Innovation & Problem Solving",
    description: "Generating new ideas, experimenting, and solving novel challenges",
    exampleActivities: [
      "Brainstorming solutions",
      "Prototyping and experimentation",
      "Research and benchmarking",
      "Design thinking sessions",
      "Root cause analysis",
    ],
  },
  {
    category: "Risk & Compliance Management",
    description: "Identifying risks, ensuring compliance, and protecting the organization",
    exampleActivities: [
      "Risk identification and mitigation",
      "Compliance monitoring",
      "Policy development",
      "Incident response",
      "Audit preparation",
    ],
  },
  {
    category: "Resource & Budget Management",
    description: "Allocating resources, managing budgets, and optimizing utilization",
    exampleActivities: [
      "Resource allocation",
      "Budget tracking",
      "Capacity planning",
      "Vendor management",
      "Cost optimization",
    ],
  },
  {
    category: "Learning & Development",
    description: "Acquiring knowledge, building capabilities, and staying current",
    exampleActivities: [
      "Skill development",
      "Training others",
      "Knowledge sharing",
      "Industry research",
      "Certifications and continuous education",
    ],
  },
  {
    category: "Monitoring & Evaluation",
    description: "Tracking progress, measuring outcomes, and assessing effectiveness",
    exampleActivities: [
      "KPI tracking and dashboards",
      "Performance monitoring",
      "Post-implementation reviews",
      "Benchmarking against targets",
      "Feedback collection and analysis",
    ],
  },
  {
    category: "Change & Transition Management",
    description: "Leading change initiatives, managing transitions, and driving adoption",
    exampleActivities: [
      "Change impact assessment",
      "Communication planning for change",
      "Training and enablement",
      "Resistance management",
      "Go-live and rollout coordination",
    ],
  },
] as const

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number]
