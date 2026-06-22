// AI 모델별 가격 (per 1M tokens, USD)
// OpenAI 공식 가격표 기준 — 가격 변동 시 여기만 업데이트
export const PRICING = {
  'gpt-4o-mini':  { input: 0.15, output: 0.60 },
  'gpt-5.4-mini': { input: 0.25, output: 2.00 },
} as const

export type ModelKey = keyof typeof PRICING

export const USD_TO_KRW = 1300  // 환율 (1 USD = 1,300 KRW)
export const HIGH_COST_KRW = 6500  // ≈$5 임계값

export interface TokenUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export interface CostResult {
  cost_usd: number
  cost_krw: number
}

export function calculateCost(model: string, usage: TokenUsage): CostResult {
  const pricing = PRICING[model as ModelKey] || PRICING['gpt-4o-mini']
  const usd = (usage.prompt_tokens / 1_000_000) * pricing.input
            + (usage.completion_tokens / 1_000_000) * pricing.output
  return {
    cost_usd: Math.round(usd * 1_000_000) / 1_000_000,  // 6자리 반올림
    cost_krw: Math.round(usd * USD_TO_KRW),
  }
}

export function formatKRW(amount: number): string {
  return '₩' + amount.toLocaleString('ko-KR')
}
