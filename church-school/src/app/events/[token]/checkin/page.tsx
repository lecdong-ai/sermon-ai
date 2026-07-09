'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, XCircle, LogIn } from 'lucide-react'

export default function CheckInPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = params.token as string
  const aid = searchParams.get('aid')

  const [status, setStatus] = useState<'loading' | 'success' | 'already' | 'error' | 'unauthorized'>('loading')
  const [studentName, setStudentName] = useState('')
  const [checkInAt, setCheckInAt] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!aid) { setStatus('error'); setErrorMsg('잘못된 접근입니다.'); return }

    fetch('/api/events/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: aid, event_token: token }),
    })
      .then(async r => {
        const data = await r.json()
        if (r.status === 401) {
          setStatus('unauthorized')
          setErrorMsg('체크인은 행사 담당자만 할 수 있습니다. 로그인 후 다시 시도해주세요.')
          return
        }
        if (r.status === 403) {
          setStatus('unauthorized')
          setErrorMsg('이 행사의 담당자만 체크인할 수 있습니다.')
          return
        }
        if (data.error) { setStatus('error'); setErrorMsg(data.error); return }
        setStudentName(data.student_name)
        setCheckInAt(data.check_in_at)
        setStatus(data.already_checked_in ? 'already' : 'success')
      })
      .catch(() => { setStatus('error'); setErrorMsg('체크인 처리 중 오류가 발생했습니다.') })
  }, [aid, token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-navy-50 to-white px-4">
      <div className="max-w-sm w-full">
        {status === 'loading' && (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-navy-200 border-t-navy-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-navy-500">체크인 처리 중...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center bg-white rounded-2xl border border-mint-200 p-8">
            <div className="w-20 h-20 rounded-full bg-mint-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-mint-600" />
            </div>
            <h1 className="text-2xl font-bold text-navy-900 mb-2">체크인 완료!</h1>
            <p className="text-lg font-medium text-navy-700 mb-2">{studentName}</p>
            <p className="text-sm text-navy-400">
              {new Date(checkInAt).toLocaleString('ko-KR')}
            </p>
          </div>
        )}

        {status === 'already' && (
          <div className="text-center bg-white rounded-2xl border border-orange-200 p-8">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-xl font-bold text-navy-900 mb-2">이미 체크인됨</h1>
            <p className="text-navy-700 font-medium mb-2">{studentName}</p>
            <p className="text-sm text-navy-400">
              {checkInAt ? new Date(checkInAt).toLocaleString('ko-KR') : ''}
            </p>
          </div>
        )}

        {status === 'unauthorized' && (
          <div className="text-center bg-white rounded-2xl border border-warm-200 p-8">
            <div className="w-20 h-20 rounded-full bg-navy-100 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-10 h-10 text-navy-500" />
            </div>
            <h1 className="text-xl font-bold text-navy-900 mb-2">로그인 필요</h1>
            <p className="text-sm text-navy-500 mb-6">{errorMsg}</p>
            <Link href="/" className="inline-flex px-6 py-3 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 transition-colors">
              로그인하러 가기
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center bg-white rounded-2xl border border-red-200 p-8">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-navy-900 mb-2">체크인 실패</h1>
            <p className="text-sm text-navy-500">{errorMsg}</p>
          </div>
        )}
      </div>
    </div>
  )
}
