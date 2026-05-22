'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import { Cross, User, Mail, Shield, Calendar, LogOut, KeyRound, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient()

export default function MyPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [sermonCount, setSermonCount] = useState(0)

  const loadProfile = useCallback(async () => {
    if (!user) return
    setProfileLoading(true)
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (data) {
      setProfile(data)
      setName(data.name || '')
    }
    setProfileLoading(false)
  }, [user])

  const loadSermonCount = useCallback(async () => {
    if (!user) return
    const { count } = await supabase
      .from('sermons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if (count !== null) setSermonCount(count)
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/mypage')
      return
    }

    if (user) {
      loadProfile()
      loadSermonCount()
    }
  }, [user, loading, loadProfile, loadSermonCount, router])

  const saveProfile = async () => {
    setSaving(true)
    setSaveMessage('')
    const { error } = await supabase.from('user_profiles').upsert({
      id: user?.id,
      email: user?.email,
      name,
      updated_at: new Date().toISOString(),
    })
    if (error) {
      setSaveMessage(`저장 실패: ${error.message}`)
    } else {
      setSaveMessage('저장되었습니다.')
      loadProfile()
    }
    setSaving(false)
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[#e5e8eb]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="animate-in">
        {/* 프로필 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mx-auto mb-4 shadow-md shadow-primary-200">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-[24px] font-extrabold text-[#191f28]">마이페이지</h1>
          <p className="text-[15px] text-[#8b95a1] mt-1">계정 정보를 관리합니다</p>
        </div>

        {/* 계정 정보 */}
        <div className="bg-white rounded-2xl border border-[#e5e8eb] p-6 mb-4">
          <h2 className="text-[17px] font-bold text-[#191f28] mb-4">계정 정보</h2>
          <div className="space-y-3.5">
            <div className="flex items-center gap-3 text-[15px]">
              <Mail className="w-4 h-4 text-[#8b95a1]" />
              <span className="text-[#4e5968]">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-[15px]">
              <Calendar className="w-4 h-4 text-[#8b95a1]" />
              <span className="text-[#4e5968]">
                가입일: {new Date(user.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[15px]">
              <Shield className="w-4 h-4 text-[#8b95a1]" />
              <span className="text-[#4e5968]">일반 사용자</span>
            </div>
            <div className="flex items-center gap-3 text-[15px]">
              <Cross className="w-4 h-4 text-[#8b95a1]" />
              <span className="text-[#4e5968]">생성한 설교: {sermonCount}개</span>
            </div>
          </div>
        </div>

        {/* 프로필 편집 */}
        <div className="bg-white rounded-2xl border border-[#e5e8eb] p-6 mb-4">
          <h2 className="text-[17px] font-bold text-[#191f28] mb-4">프로필 편집</h2>
          <div className="space-y-3.5">
            <div>
              <label className="block text-[14px] font-medium text-[#4e5968] mb-1.5">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="w-full px-4 py-3 rounded-xl border border-[#e5e8eb] text-[15px] outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>
            {saveMessage && (
              <div className={`flex items-center gap-2 text-[13px] px-3.5 py-2 rounded-lg ${
                saveMessage.includes('실패') ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'
              }`}>
                {saveMessage.includes('실패') ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {saveMessage}
              </div>
            )}
            <button
              onClick={saveProfile}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-[15px] hover:shadow-md hover:shadow-primary-200 transition-all duration-200 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>

        {/* 계정 관리 */}
        <div className="bg-white rounded-2xl border border-[#e5e8eb] p-6 mb-4">
          <h2 className="text-[17px] font-bold text-[#191f28] mb-4">계정 관리</h2>
          <div className="space-y-2.5">
            <Link
              href="/auth/reset-password"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[15px] text-[#4e5968] hover:bg-[#f0f4ff] transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              비밀번호 변경
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-[15px] text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>

        {/* 워크스페이스 바로가기 */}
        <Link
          href="/dashboard"
          className="block bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5 text-white text-center hover:shadow-lg hover:shadow-primary-200 transition-all duration-200"
        >
          <p className="font-bold text-[16px]">워크스페이스로 이동하기</p>
        </Link>
      </div>
    </div>
  )
}
