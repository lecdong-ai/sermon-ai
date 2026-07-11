import Link from 'next/link'
import LoginModal from '@/components/LoginModal'

export default function AuthRequiredPage({
  searchParams,
}: {
  searchParams: { next?: string }
}) {
  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-card border border-warm-200 p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-600 flex items-center justify-center shadow-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M12 7v14" />
                <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-3xl mb-3">🔒</div>
            <h1 className="text-lg font-bold text-navy-950">로그인이 필요한 페이지입니다</h1>
            <p className="text-sm text-navy-500 leading-relaxed">
              이 페이지를 보시려면 로그인해 주세요.
            </p>
          </div>

          <LoginModal next={searchParams.next} />

          <Link
            href="/"
            className="block text-xs text-navy-400 hover:text-navy-600 underline underline-offset-2"
          >
            홈으로 돌아가기
          </Link>
        </div>

        <p className="text-center text-[11px] text-navy-400 mt-6">
          교회학교 솔루션
        </p>
      </div>
    </div>
  )
}
