// ============================================================
// Built-in instruction directives and section drivers — barrel.
// Each output type has its own file under lib/directives/.
// ============================================================

import type { SectionDriver, InstructionDirective } from '@/lib/setup-config-types'

import * as questions from '@/lib/directives/questions'
import * as checklist from '@/lib/directives/checklist'
import * as emailCourse from '@/lib/directives/email-course'
import * as prompts from '@/lib/directives/prompts'
import * as battleCards from '@/lib/directives/battle-cards'
import * as decisionBooks from '@/lib/directives/decision-books'
import * as dossier from '@/lib/directives/dossier'
import * as playbook from '@/lib/directives/playbook'
import * as cheatSheets from '@/lib/directives/cheat-sheets'
import * as agentBook from '@/lib/directives/agent-book'
import * as ebook from '@/lib/directives/ebook'

export const BUILTIN_INSTRUCTION_DIRECTIVES: Record<string, InstructionDirective[]> = {
  questions: questions.directives,
  checklist: checklist.directives,
  'email-course': emailCourse.directives,
  prompts: prompts.directives,
  'battle-cards': battleCards.directives,
  'decision-books': decisionBooks.directives,
  dossier: dossier.directives,
  playbook: playbook.directives,
  'cheat-sheets': cheatSheets.directives,
  'agent-book': agentBook.directives,
  ebook: ebook.directives,
}

export const BUILTIN_SECTION_DRIVERS: Record<string, SectionDriver[]> = {
  questions: questions.sectionDrivers,
  checklist: checklist.sectionDrivers,
  'email-course': emailCourse.sectionDrivers,
  prompts: prompts.sectionDrivers,
  'battle-cards': battleCards.sectionDrivers,
  'decision-books': decisionBooks.sectionDrivers,
  dossier: dossier.sectionDrivers,
  playbook: playbook.sectionDrivers,
  'cheat-sheets': cheatSheets.sectionDrivers,
  'agent-book': agentBook.sectionDrivers,
  ebook: ebook.sectionDrivers,
}
