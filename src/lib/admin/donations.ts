import { supabaseAdmin } from '@/lib/supabase'

export interface ManualDonation {
  id: string
  user_id: string
  amount_krw: number
  note: string | null
  created_at: string
  created_by: string | null
}

export interface AutoDonationAgg {
  total_krw: number
  count: number
  last_date: string | null
}

/** 회원별 수동 입력 후원 내역 조회 */
export async function getManualDonations(userId: string): Promise<ManualDonation[]> {
  const { data, error } = await supabaseAdmin
    .from('manual_donations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as ManualDonation[]
}

/** 수동 후원 입력 추가 */
export async function addManualDonation(
  userId: string,
  amountKrw: number,
  note: string,
  createdBy: string
): Promise<ManualDonation> {
  if (amountKrw <= 0) throw new Error('금액은 0보다 커야 합니다')
  const { data, error } = await supabaseAdmin
    .from('manual_donations')
    .insert({
      user_id: userId,
      amount_krw: amountKrw,
      note: note || null,
      created_by: createdBy,
    })
    .select()
    .single()
  if (error) throw error
  return data as ManualDonation
}

/** 수동 후원 입력 삭제 */
export async function deleteManualDonation(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('manual_donations')
    .delete()
    .eq('id', id)
  if (error) throw error
}

/** 회원별 수동 후원 합계 */
export async function getManualDonationTotal(userId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('manual_donations')
    .select('amount_krw')
    .eq('user_id', userId)
  if (error) throw error
  return (data || []).reduce((sum, r) => sum + (r.amount_krw || 0), 0)
}

/** 회원별 자동 집계 (payment_history) */
export async function getAutoDonationTotal(userId: string): Promise<AutoDonationAgg> {
  const { data, error } = await supabaseAdmin
    .from('payment_history')
    .select('amount, created_at')
    .eq('user_id', userId)
    .eq('status', 'succeeded')
  if (error) throw error
  const total = (data || []).reduce((sum, r) => sum + (r.amount || 0), 0)
  const dates = (data || []).map(r => r.created_at).filter(Boolean) as string[]
  dates.sort()
  return {
    total_krw: total,
    count: (data || []).length,
    last_date: dates.length > 0 ? dates[dates.length - 1] : null,
  }
}

/** 회원별 누적 후원 = 수동 + 자동 */
export async function getTotalDonation(userId: string): Promise<{
  manual_krw: number
  auto_krw: number
  total_krw: number
}> {
  const [manualTotal, autoAgg] = await Promise.all([
    getManualDonationTotal(userId),
    getAutoDonationTotal(userId),
  ])
  return {
    manual_krw: manualTotal,
    auto_krw: autoAgg.total_krw,
    total_krw: manualTotal + autoAgg.total_krw,
  }
}
