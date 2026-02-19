export const EMAIL_COURSE_STAGES = [
  {
    name: "Foundation & Context",
    description: "Set the stage — why this topic matters, what's at stake, and how this course will help",
  },
  {
    name: "Current State Assessment",
    description: "Help the reader diagnose where they stand today — self-assessment, common patterns, and gaps",
  },
  {
    name: "Core Frameworks",
    description: "Introduce the key mental models, frameworks, and principles that underpin success in this area",
  },
  {
    name: "Strategic Approach",
    description: "How to think strategically about this topic — planning, prioritization, and decision-making",
  },
  {
    name: "Practical Implementation",
    description: "Step-by-step guidance on execution — what to do on Day 1, Week 1, Month 1",
  },
  {
    name: "Common Pitfalls & Solutions",
    description: "The most frequent mistakes, anti-patterns, and how to avoid or recover from them",
  },
  {
    name: "Advanced Techniques",
    description: "Going beyond basics — power moves, nuanced strategies, and expert-level approaches",
  },
  {
    name: "Measurement & Optimization",
    description: "How to track success, interpret signals, and continuously improve outcomes",
  },
  {
    name: "Real-World Application",
    description: "Case studies, worked examples, and scenario-based learning to build practical intuition",
  },
  {
    name: "Action Plan & Next Steps",
    description: "Putting it all together — personalized action plan, accountability framework, and ongoing resources",
  },
] as const

export type EmailCourseStage = (typeof EMAIL_COURSE_STAGES)[number]
