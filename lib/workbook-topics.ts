export const WORKBOOK_TOPICS = [
  {
    name: "Foundations & Key Concepts",
    description: "Core vocabulary, basic definitions, and fundamental concepts that form the building blocks of the topic",
  },
  {
    name: "How Things Work",
    description: "Processes, mechanisms, cause-and-effect relationships, and explanations of how things function",
  },
  {
    name: "People & Roles",
    description: "Important figures, roles, contributions, and the human stories connected to the topic",
  },
  {
    name: "Timeline & Milestones",
    description: "Key dates, historical events, evolution over time, and significant turning points",
  },
  {
    name: "Real-World Connections",
    description: "Practical applications, everyday examples, and how the topic connects to the reader's life",
  },
  {
    name: "Compare & Contrast",
    description: "Similarities, differences, classifications, and distinguishing features between related concepts",
  },
  {
    name: "Problem Solving",
    description: "Scenarios, challenges, what-would-you-do questions, and critical thinking exercises",
  },
  {
    name: "Fun Facts & Surprises",
    description: "Unexpected truths, amazing statistics, mind-blowing trivia, and entertaining knowledge",
  },
] as const

export type WorkbookTopic = (typeof WORKBOOK_TOPICS)[number]
