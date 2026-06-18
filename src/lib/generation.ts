import { supabaseAdmin as supabase } from './supabase'
import { generateSingleItem, generateAll } from './openai'
import { getMockResult } from './mock'
import type { GenerationItem } from '@/types'

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
  error?: string
}

export async function generateWithDeduction(params: GenerateParams): Promise<GenerateResult> {
  const { userId, sermonId, item, idempotencyKey, text, useMock } = params

  // Idempotency check
  const existing = await supabase
    .from('generation_jobs')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .single()

  if (existing.data) {
    if (existing.data.status === 'completed') {
      return { success: true, data: existing.data.result, deduction: false }
    }
    if (existing.data.status === 'processing') {
      return { success: false, error: '이미 처리 중인 요청입니다.' }
    }
  }

  // Create generation job
  const { data: job, error: jobError } = await supabase
    .from('generation_jobs')
    .insert({ user_id: userId, sermon_id: sermonId, item, idempotency_key: idempotencyKey, status: 'processing' })
    .select()
    .single()

  if (jobError || !job) return { success: false, error: '작업 생성 실패' }

  // Run AI generation
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
    await supabase
      .from('generation_jobs')
      .update({ status: 'failed', error: String(err.message || err), completed_at: new Date().toISOString() })
      .eq('id', job.id)
    return { success: false, error: 'AI 분석 중 오류가 발생했습니다.', deduction: false }
  }

  // Mark job completed
  await supabase
    .from('generation_jobs')
    .update({ status: 'completed', result, completed_at: new Date().toISOString() })
    .eq('id', job.id)

  return { success: true, data: result, deduction: false }
}
