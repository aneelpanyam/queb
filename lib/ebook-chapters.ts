export const EBOOK_CHAPTERS = [
  {
    name: "Foundations & Overview",
    description: "Setting the stage: what this topic is, why it matters now, and how it fits into the reader's professional world",
  },
  {
    name: "Core Concepts & Terminology",
    description: "The essential building blocks, key definitions, and mental models the reader must understand before going deeper",
  },
  {
    name: "The Current Landscape",
    description: "How things work today — established approaches, prevailing tools, key players, and the status quo the reader operates within",
  },
  {
    name: "Practical Applications",
    description: "Concrete, real-world ways the reader can apply this topic in their daily work — use cases, workflows, and scenarios",
  },
  {
    name: "Implementation Guide",
    description: "Step-by-step guidance for getting started — tools, setup, first projects, and a clear path from zero to competent",
  },
  {
    name: "Advanced Strategies",
    description: "Sophisticated techniques, patterns, and compound approaches for readers ready to move beyond the basics",
  },
  {
    name: "Common Pitfalls & Mistakes",
    description: "The traps, misconceptions, and anti-patterns that derail practitioners — and how to avoid or recover from each",
  },
  {
    name: "Case Studies & Examples",
    description: "Real-world stories, before-and-after scenarios, and worked examples that bring abstract concepts to life",
  },
  {
    name: "Future Trends & Outlook",
    description: "Where this field is headed — emerging developments, industry shifts, predictions, and what the reader should prepare for",
  },
  {
    name: "Your Action Plan",
    description: "Bringing it all together: a structured, personalized plan for the reader to act on what they have learned, with milestones and next steps",
  },
] as const

export type EbookChapter = (typeof EBOOK_CHAPTERS)[number]
