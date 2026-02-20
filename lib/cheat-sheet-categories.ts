export const CHEAT_SHEET_CATEGORIES = [
  {
    name: "Key Terminology & Definitions",
    description: "Essential vocabulary, acronyms, and domain-specific terms one must know to operate effectively",
  },
  {
    name: "Core Principles & Rules",
    description: "Foundational rules, governing principles, and non-negotiable standards that guide decisions and behavior",
  },
  {
    name: "Common Patterns & Templates",
    description: "Reusable structures, proven templates, standard formats, and go-to approaches for recurring situations",
  },
  {
    name: "Formulas & Calculations",
    description: "Key formulas, conversion factors, calculation methods, and quantitative shortcuts used frequently",
  },
  {
    name: "Do's & Don'ts",
    description: "Best practices to follow and anti-patterns to avoid — hard-won wisdom distilled into clear guidance",
  },
  {
    name: "Rules of Thumb & Shortcuts",
    description: "Quick heuristics, mental models, estimation techniques, and decision shortcuts for rapid judgment calls",
  },
  {
    name: "Common Mistakes & Fixes",
    description: "Frequent errors, their root causes, diagnostic steps, and proven solutions to resolve them quickly",
  },
  {
    name: "Key Metrics & Benchmarks",
    description: "Critical numbers to know — industry benchmarks, target ranges, thresholds, and performance indicators",
  },
  {
    name: "Essential Tools & Resources",
    description: "Must-have tools, reference materials, useful websites, recommended software, and go-to resources",
  },
  {
    name: "Quick Reference",
    description: "At-a-glance summaries, comparison tables, decision trees, and lookup information for daily use",
  },
] as const

export type CheatSheetCategory = (typeof CHEAT_SHEET_CATEGORIES)[number]
