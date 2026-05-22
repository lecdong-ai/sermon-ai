import { supabaseAdmin as supabase } from './supabase'
import { generateSingleItem, generateAll } from './openai'
import { getMockResult } from './mock'
import { checkUsage, consumeUsage } from './usage'
import type { UsageInfo, GenerationItem } from '@/types'

interface GenerateParams {
  userId: string
  sermonId: string
  item: string
  idempotencyKey: string
  text: string
  useMock: boolean
}

interface GenerateResult {
  success: boolean
  data?: any
  deduction?: boolean
  remaining?: number
  error?: string
  block_reason?: string
}

export async function generateWithDeduction(params: GenerateParams): Promise<GenerateResult> {
  const { userId, sermonId, item, idempotencyKey, text, useMock } = params

  // 1. Idempotency check
  const existing = await supabase
    .from('generation_jobs')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .single()

  if (existing.data) {
    if (existing.data.status === 'completed') {
      return {
        success: true,
        data: existing.data.result,
        deduction: false,
      }
    }
    if (existing.data.status === 'processing') {
      return { success: false, error: '이미 처리 중인 요청입니다.' }
    }
  }

  // 2. Usage check (before generation)
  const usageInfo = await checkUsage(userId)
  if (!usageInfo.can_generate) {
    return {
      success: false,
      error: blockReasonMessage(usageInfo.block_reason),
      block_reason: usageInfo.block_reason,
    }
  }

  // 3. Create generation job
  const { data: job, error: jobError } = await supabase
    .from('generation_jobs')
    .insert({
      user_id: userId,
      sermon_id: sermonId,
      item,
      idempotency_key: idempotencyKey,
      status: 'processing',
    })
    .select()
    .single()

  if (jobError || !job) {
    return { success: false, error: '작업 생성 실패' }
  }

  // 4. Run AI generation
  let result: any
  try {
    if (useMock) {
      const mock = getMockResult()
      const key = item as keyof typeof mock
      result = { [item]: (mock as any)[key] }
    } else if (item === 'all') {
      result = await generateAll(text)
    } else {
      result = await generateSingleItem(text, item as GenerationItem)
    }
  } catch (err: any) {
    // Generation failed → mark job as failed, NO deduction
    await supabase
      .from('generation_jobs')
      .update({ status: 'failed', error: String(err.message || err), completed_at: new Date().toISOString() })
      .eq('id', job.id)

    return {
      success: false,
      error: 'AI 분석 중 오류가 발생했습니다. 횟수는 차감되지 않았습니다.',
      deduction: false,
    }
  }

  // 5. Generation succeeded → consume usage + update job (transaction-like)
  const deduction = await consumeUsage(userId)
  if (!deduction.success) {
    // Edge case: usage changed between check and consume
    await supabase
      .from('generation_jobs')
      .update({ status: 'failed', error: '사용량 차감 실패', completed_at: new Date().toISOString() })
      .eq('id', job.id)
    return { success: false, error: deduction.error }
  }

  // 6. Log usage
  await supabase.from('usage_logs').insert({
    user_id: userId,
    usage_type: deduction.usage?.plan === 'none' ? 'trial' : 'monthly',
    sermon_id: sermonId,
    item,
    idempotency_key: idempotencyKey,
    deducted: true,
  })

  // 7. Mark job completed
  await supabase
    .from('generation_jobs')
    .update({ status: 'completed', result, completed_at: new Date().toISOString() })
    .eq('id', job.id)

  const remaining = deduction.usage?.trial.remaining || deduction.usage?.monthly.remaining || 0

  return {
    success: true,
    data: result,
    deduction: true,
    remaining,
  }
}

function blockReasonMessage(reason?: string): string {
  switch (reason) {
    case 'trial_expired': return '무료체험 기간이 만료되었습니다. 요금제를 구독해주세요.'
    case 'trial_exhausted': return '무료 분석 횟수를 모두 사용했습니다. 요금제를 구독해주세요.'
    case 'monthly_exhausted': return '이번 달 분석 횟수를 모두 사용했습니다. 다음 달에 다시 이용하거나 요금제를 업그레이드해주세요.'
    case 'past_due': return '결제가 지연되었습니다. 결제 수단을 확인해주세요.'
    case 'canceled': return '구독이 종료되었습니다. 재구독 후 이용 가능합니다.'
    default: return '사용 한도를 초과했습니다.'
  }
}

export { blockReasonMessage }
