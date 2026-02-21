import { PROMPT_USE_CASES } from '@/lib/prompt-use-cases'
import type { SectionDriver, InstructionDirective } from '@/lib/setup-config-types'

export const directives: InstructionDirective[] = [
  { label: 'Role', content: 'You are an expert AI prompt engineer who has designed prompt libraries for enterprise teams, with deep expertise in persona-setting, chain-of-thought elicitation, output format control, and few-shot prompting techniques. You create highly effective prompt templates.' },
  { label: 'Task', content: 'Generate 3-5 ready-to-use AI prompt templates for this use case that demonstrate expert prompt engineering — each prompt must be dramatically more effective than a naive question on the same topic.' },
  { label: 'Process', content: 'Before generating, identify the reader\'s role, daily tasks, and AI tools available. For this use case, determine where a well-crafted prompt produces dramatically better output than a naive request. Each prompt should include at least 2 of: persona setting, output format specification, constraints, examples, or chain-of-thought instructions.' },
  { label: 'Copy-paste ready', content: 'Each prompt must be complete and copy-paste ready — a user should be able to use it immediately.' },
  { label: 'Placeholders', content: 'Include [bracketed placeholders] where the user needs to fill in specifics.' },
  { label: 'Prompt structure', content: 'Each prompt must include structural elements beyond a bare question. Good: "Act as a [role] with expertise in [domain]. Analyze the following [input] and produce a [format] that includes [specific sections]. Constraints: [list]. Output format: [structured format]." Bad: "Tell me about [topic]."' },
  { label: 'Domain knowledge', content: 'Prompts should leverage domain knowledge and terminology relevant to the provided context.' },
  { label: 'Context field', content: 'The "context" field should describe the specific trigger or situation when this prompt is most useful.' },
  { label: 'Expected output', content: 'The "expectedOutput" should set realistic expectations for what the AI will produce.' },
  { label: 'Variations', content: 'Each prompt should include variations: 2-3 alternative versions that serve genuinely different use cases (quick vs. deep, formal vs. casual, different audience) — not just rephrasings of the same prompt.' },
  { label: 'Tips', content: 'Each prompt should include tips: practical, concrete advice for getting better results. Good: "Paste a sample of your writing style before the prompt so the AI matches your voice." Bad: "Be specific in your request."' },
  { label: 'Example output', content: 'Each prompt should include exampleOutput: a short sample of what good output looks like, specific enough to the context that the reader recognizes it as relevant to their situation.' },
  { label: 'Complexity range', content: 'Vary the complexity — include both quick tactical prompts and deeper strategic ones.' },
  { label: 'Verification', content: 'Before finalizing, check each prompt: (1) Does it use at least 2 advanced prompting techniques (persona, format, constraints, examples, chain-of-thought)? (2) Could someone paste it into ChatGPT, fill placeholders in under 2 minutes, and get useful output on the first try? (3) Is it meaningfully better than what a non-expert would write?' },
  { label: 'Minimum output', content: 'If this use case is not very relevant, still include at least 1 prompt.' },
]

export const sectionDrivers: SectionDriver[] = PROMPT_USE_CASES.map((u) => ({ name: u.name, description: u.description }))
