export interface ModelPricing {
  id: string
  name: string
  provider: string
  inputPer1MTokens: number
  cachedInputPer1MTokens?: number
  outputPer1MTokens: number
}

export const MODEL_PRICING: ModelPricing[] = [
  {
    id: 'gpt-5.2',
    name: 'GPT-5.2',
    provider: 'openai',
    inputPer1MTokens: 1.75,
    cachedInputPer1MTokens: 0.175,
    outputPer1MTokens: 14.0,
  },
]

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface CostEntry {
  route: string
  action: string
  model: string
  usage: TokenUsage
  cost: number
  timestamp: string
}

export interface ProductCostData {
  entries: CostEntry[]
  totalCost: number
  totalInputTokens: number
  totalOutputTokens: number
}

export function getModelPricing(modelId: string): ModelPricing | undefined {
  return MODEL_PRICING.find((m) => m.id === modelId)
}

export function calculateCost(usage: TokenUsage, modelId: string = 'gpt-5.2'): number {
  const pricing = getModelPricing(modelId)
  if (!pricing) return 0
  const inputCost = (usage.promptTokens / 1_000_000) * pricing.inputPer1MTokens
  const outputCost = (usage.completionTokens / 1_000_000) * pricing.outputPer1MTokens
  return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000
}

export function emptyCostData(): ProductCostData {
  return { entries: [], totalCost: 0, totalInputTokens: 0, totalOutputTokens: 0 }
}

export function addCostEntry(data: ProductCostData, entry: CostEntry): ProductCostData {
  return {
    entries: [...data.entries, entry],
    totalCost: Math.round((data.totalCost + entry.cost) * 1_000_000) / 1_000_000,
    totalInputTokens: data.totalInputTokens + entry.usage.promptTokens,
    totalOutputTokens: data.totalOutputTokens + entry.usage.completionTokens,
  }
}

export function formatCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(4)}`
  return `$${cost.toFixed(2)}`
}

export function formatTokenCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return String(count)
}
