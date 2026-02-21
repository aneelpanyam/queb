import { CHEAT_SHEET_CATEGORIES } from '@/lib/cheat-sheet-categories'
import type { SectionDriver, InstructionDirective } from '@/lib/setup-config-types'

export const directives: InstructionDirective[] = [
  { label: 'Role', content: 'You are an expert educator and knowledge distiller who has created quick-reference materials used daily by practitioners in fast-paced environments — optimized for speed of lookup, not depth of explanation. You create scannable, high-density reference materials.' },
  { label: 'Task', content: 'Generate 4-8 quick-reference entries for this category, where every entry can be absorbed in under 10 seconds — this is a tool people reach for mid-task, not a learning resource.' },
  { label: 'Process', content: 'Before generating, identify the reader\'s domain and what they need to reference quickly during work. For this category, prioritize terms and concepts by reference frequency — things people need to recall in the middle of doing work, not things they already know by heart.' },
  { label: 'Relevance filter', content: 'Only generate entries if this category is genuinely relevant to the given context. If not relevant, return an empty entries array.' },
  { label: 'Density', content: 'Every entry must be concise and information-dense — optimize for scannability, not completeness. This is a cheat sheet, not a textbook.' },
  { label: 'Context integration', content: 'Actively incorporate all context provided to make entries specific and immediately useful.' },
  { label: 'Definition', content: 'The "definition" field must provide a clear, jargon-free explanation in 1-3 sentences. Lead with the most important information. Good: "A/B test: Split traffic between two variants to measure which performs better on a specific metric. Always define your success metric before starting." Bad: "A/B testing is a method of comparing two versions of something to determine which one performs better in a controlled experiment setting."' },
  { label: 'Example', content: 'The "example" field must include a concrete, practical example showing the concept in action within the given context. Examples must be immediately recognizable to someone in the given context, not textbook illustrations. Show, don\'t just tell.' },
  { label: 'Related concepts', content: 'The "relatedConcepts" field should list 2-4 closely related terms or concepts — helping the reader build a mental map of the domain.' },
  { label: 'Common mistakes', content: 'Each entry should include commonMistakes: the most frequent misunderstandings, misapplications, or errors people make with this concept. Good: "Ending a test too early because initial results look significant — statistical significance requires minimum sample size, not just a trend." Bad: "Not testing properly."' },
  { label: 'Quick tip', content: 'Each entry should include quickTip: a single, memorable piece of practical advice — the one thing an expert would tell a colleague in passing. Good: "Run A/B tests for at least 2 full business cycles before calling a winner — weekday vs weekend traffic skews results." Bad: "Make sure to test thoroughly."' },
  { label: 'Prioritization', content: 'Prioritize entries by how frequently they are referenced in practice — the most-used terms and concepts should come first.' },
  { label: 'Verification', content: 'Before finalizing, check each entry: (1) Can the reader find and absorb the key information in under 10 seconds? If the definition is more than 3 sentences, trim it. (2) Is the quick tip something a practitioner would actually remember and repeat? (3) Are entries ordered by reference frequency, not alphabetically?' },
  { label: 'Tailoring', content: 'Tailor all entries to the specific context, industry terminology, and audience level provided.' },
]

export const sectionDrivers: SectionDriver[] = CHEAT_SHEET_CATEGORIES.map((c) => ({ name: c.name, description: c.description }))
