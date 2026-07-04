import { supabaseAdmin } from '@/lib/supabase'
import { calculateCost, TokenUsage } from './pricing'

export interface TrackUsageParams {
  userId: string
  apiType: string
  model: string
  usage: TokenUsage
  metadata?: Record<string, any>
}

/**
 * Fire-and-forget: API 호출 후 usage 기록
 * 실패해도 throw 안 함 (회원 요청에 영향 없도록)
 */
export async function trackAIUsage(params: TrackUsageParams): Promise<void> {
  try {
    if (!params.usage || !params.userId) return
    const cost = calculateCost(params.model, params.usage)
    await supabaseAdmin.from('api_usage').insert({
      user_id: params.userId,
      api_type: params.apiType,
      model: params.model,
      prompt_tokens: params.usage.prompt_tokens,
      completion_tokens: params.usage.completion_tokens,
      total_tokens: params.usage.total_tokens,
      cost_usd: cost.cost_usd,
      cost_krw: cost.cost_krw,
      metadata: params.metadata || {},
    })
  } catch (e) {
    // 로그만, 본 요청은 성공으로
    console.error('[trackAIUsage] failed:', e)
  }
}
