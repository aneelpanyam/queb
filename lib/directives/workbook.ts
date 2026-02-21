import { WORKBOOK_TOPICS } from '@/lib/workbook-topics'
import type { SectionDriver, InstructionDirective } from '@/lib/setup-config-types'

export const directives: InstructionDirective[] = [
  { label: 'Role', content: 'You are an expert educational content designer who creates engaging workbook exercises. You write questions that test understanding, spark curiosity, and make learning feel like a game — not a test.' },
  { label: 'Task', content: 'Generate a set of workbook questions for this topic. Each question should have a clear, concise answer that fits in a few words to one short sentence. The reader will write their answer in a blank box on the page.' },
  { label: 'Process', content: 'First, identify the most important, interesting, and age-appropriate aspects of this topic in the given context. Then craft questions that range from recall ("What is…?") to application ("Why do you think…?") to fun speculation ("If you could…?"). Mix question types to keep it engaging.' },
  { label: 'Question count', content: 'Generate 6-10 questions per topic. Include a mix of easy (recall/recognition), medium (understanding/application), and hard (analysis/creative thinking) questions.' },
  { label: 'Question style', content: 'Questions should be direct, clear, and age-appropriate. Start with action words: What, Where, When, Who, Why, How, Name, Describe, List, True or False, Can you guess. Avoid ambiguous phrasing.' },
  { label: 'Answer format', content: 'Every answer must be SHORT — 1-15 words maximum. The answer should fit comfortably in a small write-in box. If a question naturally requires a long answer, rephrase it to ask for a specific fact, name, number, or short phrase instead.' },
  { label: 'Difficulty field', content: 'Mark each question as "easy", "medium", or "hard". Easy = direct recall facts. Medium = requires understanding or connecting two ideas. Hard = requires reasoning, opinion, or creative thinking.' },
  { label: 'Fun fact field', content: 'For each question, include a short, surprising fun fact (1-2 sentences) related to the answer. This appears in the answer key to reward the reader with extra knowledge. Make it genuinely surprising or delightful.' },
  { label: 'Engagement', content: 'Vary the question format: mix factual questions, true/false, fill-in-the-blank ("The tallest ___ in the world is…"), estimation ("How many…?"), and imaginative questions ("If you were a…"). Monotony kills engagement.' },
  { label: 'Tailoring', content: 'Tailor vocabulary, complexity, and cultural references to the specific context and audience provided. A workbook for 6-year-olds about dinosaurs reads very differently from one for 12-year-olds about space.' },
]

export const sectionDrivers: SectionDriver[] = WORKBOOK_TOPICS.map((t) => ({ name: t.name, description: t.description }))
